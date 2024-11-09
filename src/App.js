import React from "react";
import { Route, Routes, Link } from "react-router-dom";
import Translator from "./translator";
import TranslationHistory from "./translationHistory";
import "./App.css";

function App() {
  return (
    <div className="App">
      {/* Link to navigate to the history page */}
      <nav style={{ padding: "10px", textAlign: "center" }}>
        <Link to="/history">View Translation History</Link>
      </nav>

      <Routes>
        {/* Route for the main Translator component */}
        <Route path="/" element={<Translator />} />
        
        {/* Route for the TranslationHistory page */}
        <Route path="/history" element={<TranslationHistory />} />
      </Routes>
    </div>
  );
}

export default App;
