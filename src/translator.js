import React, { useState } from "react";
import { Route, Routes, Link } from "react-router-dom";
import axios from "axios";
import "./translator.css";

function Translator() {
  // State variables for text input and translation result
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("es");

  // Handle changes in the input text
  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  // Handle changes in the source language selection
  const handleSourceLanguageChange = (e) => {
    setSourceLanguage(e.target.value);
  };

  // Handle changes in the target language selection
  const handleTargetLanguageChange = (e) => {
    setTargetLanguage(e.target.value);
  };

  // Handle translation request
  const handleTranslate = async () => {
    const translationData = {
      inputText: inputText,  // Updated to match the backend expected keys
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
    };

    try {
      // Send the translation request to the backend API
      const response = await axios.post('https://your-app-name.onrender.com/api/translate', translationData);
      setOutputText(response.data.translation);  // Set the translated text in the output field
    } catch (error) {
      console.error(error);
      setOutputText("Translation failed. Please try again.");
    }
  };

  return (

    <div style={{ padding: "20px", textAlign: "center" }} id="container">
	<h1>Translator</h1>
      {/* Language selection dropdowns */}
      <div>
        <select value={sourceLanguage} onChange={handleSourceLanguageChange}>
          <option value="auto">Auto Detect</option>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="nl">Dutch</option>
          <option value="it">Italian</option>
          <option value="pt">Portuguese</option>
          <option value="zh-CN">Chinese (Simplified)</option>
          <option value="zh-TW">Chinese (Traditional)</option>
          <option value="ja">Japanese</option>
          <option value="ko">Korean</option>
          <option value="ru">Russian</option>
          <option value="ar">Arabic</option>
          <option value="hi">Hindi</option>
          <option value="iw">Hebrew</option>
        </select>
		<span> to </span>
        <select value={targetLanguage} onChange={handleTargetLanguageChange}>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="nl">Dutch</option>
          <option value="it">Italian</option>
          <option value="pt">Portuguese</option>
          <option value="zh-CN">Chinese (Simplified)</option>
          <option value="zh-TW">Chinese (Traditional)</option>
          <option value="ja">Japanese</option>
          <option value="ko">Korean</option>
          <option value="ru">Russian</option>
          <option value="ar">Arabic</option>
          <option value="hi">Hindi</option>
          <option value="iw">Hebrew</option>
        </select>
      </div>

      {/* Textarea for input */}
      <div style={{ margin: "20px 0" }}>
        <textarea
          style={{ width: "400px", height: "150px" }}
          placeholder="Enter text to translate..."
          value={inputText}
          onChange={handleInputChange}
        />
      </div>

      {/* Button to trigger translation */}
      <button onClick={handleTranslate}>Translate</button>

      {/* Textarea to display the translated text */}
      <div style={{ margin: "20px 0" }}>
        <textarea
          style={{ width: "400px", height: "150px" }}
          placeholder="Translation output..."
          value={outputText}
          readOnly
        />
      </div>
	  	        <Link to="/history">View Translation History</Link>
    </div>
  );
};

export default Translator;
