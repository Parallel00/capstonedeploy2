import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "./userContext"; // Import useUser hook
import "./translator.css";

function TranslationHistory() {
  const { user } = useUser(); // Access the user from context
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setLoading(false); // Stop loading if there's no user
      return;
    }

    const fetchHistory = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/history", { withCredentials: true });
        setHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
        alert("There was an issue fetching the history. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const deleteTranslation = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/history/${id}`, { withCredentials: true });
      setHistory(history.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to delete translation:", error);
      alert("There was an issue deleting the translation. Please try again.");
    }
  };

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }} id="container">
        <h2>You must be logged in to view your translation history.</h2>
        <button
          style={{ marginTop: "20px" }}
          onClick={() => navigate("/login")}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", textAlign: "center" }} id="container">
      <Link to="/" style={{ display: "block", marginBottom: "20px", color: "blue", textDecoration: "underline" }}>
        Back to Homepage
      </Link>
      <h2>Translation History</h2>
      {loading ? (
        <p>Loading translation history...</p>
      ) : history.length === 0 ? (
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
            {history.map((item) => (
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
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TranslationHistory;
