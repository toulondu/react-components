import React from "react";
import logo from "./logo.svg";
import "./App.css";
import messageApi from "./components/pop-message";

function App() {
  const popWarningMessage = () => {
    messageApi.warn("This is a warning message!");
  };

  const popsuccessMessage = () => {
    messageApi.success("This is a success message!");
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Example of message.</p>
        <button onClick={popWarningMessage}>click to pop a warning message.</button>
        <button onClick={popsuccessMessage}>click to pop a succeed message.</button>
      </header>
    </div>
  );
}

export default App;
