const express = require('express');
const session = require('express-session');
const { Pool } = require('pg');
const axios = require('axios');
const cors = require('cors');
const app = express();
const connectPgSimple = require('connect-pg-simple')(session);
const port = process.env.PORT || 5000;

// Middleware to allow CORS
app.use(cors({
  origin: 'http://localhost:3000',  // Allow only your frontend
  methods: 'GET,POST',
  credentials: true,
}));

// PostgreSQL client setup
const pool = new Pool({
  user: 'Rival',
  host: 'localhost',
  database: 'translatabase',
  password: '',
  port: 5432,
});

// Middleware for handling JSON and URL encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session management setup
app.use(session({
  store: new connectPgSimple({
    pool: pool, // Use the existing PostgreSQL pool
    tableName: 'session', // Table to store sessions
  }),
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true, // Ensures cookies are sent only via HTTP (not accessible by JavaScript)
  },
}));


// Function to create both tables if they do not exist
const createTables = async () => {
  const createTranslationsTableQuery = `
    CREATE TABLE IF NOT EXISTS translations (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(255) NOT NULL,
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
    // Run both queries sequentially
    await pool.query(createTranslationsTableQuery);
    await pool.query(createSessionTableQuery);
    console.log('Tables are ready!');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

// Call the function to create both tables when the app starts
createTables();

// Translation endpoint
app.post('/api/translate', async (req, res) => {
  const { inputText, sourceLanguage, targetLanguage } = req.body;

  const options = {
    method: 'POST',
    url: 'https://translate-plus.p.rapidapi.com/translate',
    headers: {
      'x-rapidapi-key': 'e978d93128msh9a0d23411ab8a0fp16dfbcjsn9c3c4d21f62b', // Replace with your actual API key
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

    // Save translation to the database
    const userSessionId = req.session.userId || 'guest'; // Use the session ID from express-session
    const timestamp = new Date();
    await pool.query(
      'INSERT INTO translations (session_id, input_text, output_text, source_language, target_language, timestamp) VALUES ($1, $2, $3, $4, $5, $6)',
      [userSessionId, inputText, translation, sourceLanguage, targetLanguage, timestamp]
    );

    // Send back the translation as the response
    res.json({ translation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

// Fetch translation history
app.get('/api/history', async (req, res) => {
  const userSessionId = req.session.userId || 'guest'; // Use the session ID from express-session
  console.log('Session ID:', userSessionId); // Log session ID

  try {
    const result = await pool.query(
      'SELECT * FROM translations WHERE session_id = $1 ORDER BY timestamp DESC',
      [userSessionId]
    );
    console.log('Translation history:', result.rows); // Log the results
    res.json(result.rows); // Send the history back as a JSON array
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch translation history' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
