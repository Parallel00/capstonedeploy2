import React, { useState, useEffect } from "react";
import axios from "axios";

function TranslationHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Fetch translation history from the backend
    const fetchHistory = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/history", { withCredentials: true });
        setHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
        alert("There was an issue fetching the history. Please try again.");
      }
    };

    fetchHistory();  // This is the correct call
  }, []);  // Empty dependency array to run only once on component mount

  return (
    <div style={{ padding: "20px", textAlign: "center" }} id="history-container">
      <h2>Translation History</h2>
      {history.length === 0 ? (
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
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={index}>
                <td>{item.input_text}</td>
                <td>{item.output_text}</td>
                <td>{item.source_language}</td>
                <td>{item.target_language}</td>
                <td>{new Date(item.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TranslationHistory;
