
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import axios from "axios";
import "./translator.css";

function TranslationHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Fetch translation history from the backend
    const fetchHistory = async () => {
      try {
        const response = await axios.get("https://capstonedeploy2.onrender.com/api/history", { withCredentials: true });
        console.log('Fetched history:', response.data);
        setHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
        alert("There was an issue fetching the history. Please try again.");
      }
    };

    fetchHistory();
  }, []);

  // Function to delete a translation by ID
  const deleteTranslation = async (id) => {
    try {
      await axios.delete(`https://capstonedeploy2.onrender.com/api/history/${id}`, { withCredentials: true });
      // Filter out the deleted translation from the local state
      setHistory(history.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to delete translation:", error);
      alert("There was an issue deleting the translation. Please try again.");
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }} id="container">
      <Link to="/" style={{ display: "block", marginBottom: "20px", color: "blue", textDecoration: "underline" }}>
        Back to Homepage
      </Link>
      <h2>Translation History</h2>
      {Array.isArray(history) && history.length === 0 ? (
        <p>No translation history available.</p>
      ) : (
        <table style={{ width: "80%", margin: "auto", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Input Text</th>
              <th>Output Text</th>
              <th>Source Language</th>
              <th>Target Language</th>
              <th>Timestamp</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(history) && history.length > 0 ? (
              history.map((item) => (
                <tr key={item.id}>
                  <td>{item.input_text}</td>
                  <td>{item.output_text}</td>
                  <td>{item.source_language}</td>
                  <td>{item.target_language}</td>
                  <td>{new Date(item.timestamp).toLocaleString()}</td>
                  <td>
                    <button onClick={() => deleteTranslation(item.id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6">No history found.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TranslationHistory;
