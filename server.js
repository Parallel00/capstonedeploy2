const express = require('express');
const session = require('express-session');
const { Pool } = require('pg');
const axios = require('axios');
const cors = require('cors');
const { body, validationResult } = require('express-validator'); // Import validation functions
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const connectPgSimple = require('connect-pg-simple')(session);

const app = express();
const port = process.env.PORT || 5000;

// Middleware to allow CORS
const databaseUrl = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false, // Render requires SSL connections
  },
});

// Middleware for handling JSON and URL encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session management setup
app.use(session({
  store: new connectPgSimple({
    pool: pool, 
    tableName: 'session',
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to true if you're using HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,  // 1 day expiration
  },
}));

// Function to create both tables if they do not exist
const createTables = async () => {
  const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `;

  const createTranslationsTableQuery = `
    CREATE TABLE IF NOT EXISTS translations (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      input_text TEXT NOT NULL,
      output_text TEXT NOT NULL,
      source_language VARCHAR(10) NOT NULL,
      target_language VARCHAR(10) NOT NULL,
      timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createSessionTableQuery = `
    CREATE TABLE IF NOT EXISTS session (
      sid VARCHAR NOT NULL PRIMARY KEY,
      sess JSONB NOT NULL,
      expire TIMESTAMPTZ NOT NULL
    );
  `;

  try {
    await pool.query(createUsersTableQuery);
    await pool.query(createTranslationsTableQuery);
    await pool.query(createSessionTableQuery);
    console.log('All tables are up-to-date!');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};


// Call the function to create both tables when the app starts
createTables();

// Translation endpoint
app.post('/api/translate', async (req, res) => {
  const { inputText, sourceLanguage, targetLanguage } = req.body;
  console.log('Session ID during translate:', req.sessionID);  // Log session ID
  console.log('User ID in session during translate:', req.session.userId); 

  // If the user is logged in, use their userId, otherwise set it to "null"
  const userId = req.session.userId || null;

  const options = {
    method: 'POST',
    url: 'https://translate-plus.p.rapidapi.com/translate',
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      'x-rapidapi-host': 'translate-plus.p.rapidapi.com',
      'Content-Type': 'application/json',
    },
    data: {
      text: inputText,
      source: sourceLanguage,
      target: targetLanguage,
    },
  };

  try {
    const response = await axios.request(options);
    const translation = response.data.translations.translation;

    const timestamp = new Date();
    
    // Save the translation to the database, with `user_id` being optional
    await pool.query(
    'INSERT INTO translations (user_id, input_text, output_text, source_language, target_language, timestamp) VALUES ($1, $2, $3, $4, $5, $6)',
    [userId, inputText, translation, sourceLanguage, targetLanguage, timestamp]
  );

    // Send back the translation as a response
    res.json({ translation });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});




// Fetch translation history
app.get('/api/history', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM translations WHERE user_id = $1 ORDER BY timestamp DESC',
      [req.session.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch translation history' });
  }
});




// Delete translation history
app.delete('/api/history/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM translations WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Translation not found' });
    }
    res.status(200).json({ message: 'Translation deleted successfully' });
  } catch (error) {
    console.error('Translation delete error:', error);
    res.status(500).json({ error: 'Failed to delete translation' });
  }
});

// Registration endpoint
app.post('/api/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userExists.rowCount > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userResult.rowCount === 0) {
      return res.status(400).json({ success: false, error: 'Invalid username or password' });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid username or password' });
    }

    // Set session userId
    req.session.userId = user.id;
    console.log('Session ID after login:', req.sessionID);  // Log session ID
    console.log('Session object:', req.session);             // Log full session object

    return res.status(200).json({ 
      success: true,
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

//Logouts are handled by the userContext.js file.

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
