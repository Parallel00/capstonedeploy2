// Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from './userContext';
import "./translator.css";

function Login() {
  const { updateUser } = useUser();  // Ensure useUser is imported here

  const [username, setUsername] = useState("");  
  const [password, setPassword] = useState("");  
  const [error, setError] = useState("");  
  const navigate = useNavigate();  

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/login", { username, password }, { withCredentials: true });

      if (response.data.success) {
        updateUser(response.data.user);  // Update the user context
        navigate("/");  
      } else {
        setError(response.data.error || "Invalid username or password");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div id="container">
      <h1>Login</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
	  <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
	  <br />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
