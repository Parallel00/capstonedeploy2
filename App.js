import React from "react";
import { Route, Routes, Link } from "react-router-dom";
import Translator from "./translator";
import TranslationHistory from "./translationHistory";
import Login from "./login"; 
import Registration from "./registration"; 
import { useUser } from "./userContext"; // Import the useUser hook
import "./App.css";

function App() {
  const { user, logoutUser } = useUser(); // Access user and logoutUser from context

  return (
    <div className="App">
      {/* Navigation Links */}
      <nav style={{ padding: "10px", textAlign: "center" }}>
        <Link to="/" style={{ margin: "0 10px" }}>Home</Link>
        {!user && (
          <>
            <Link to="/login" style={{ margin: "0 10px" }}>Login</Link>
            <Link to="/register" style={{ margin: "0 10px" }}>Register</Link>
          </>
        )}
        {user && (
          <>
            <span style={{ margin: "0 10px" }}>Welcome, {user.username}!</span>
            <button 
              style={{ margin: "0 10px" }} 
              onClick={logoutUser}
            >
              Logout
            </button>
          </>
        )}
      </nav>

      {/* Application Routes */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/" element={<Translator />} />
        <Route path="/history" element={<TranslationHistory />} />
      </Routes>
    </div>
  );
}

export default App;

