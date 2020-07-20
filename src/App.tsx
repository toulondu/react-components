import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import messageApi from "./components/pop-message";
import Steps, { Step } from "./components/steps";

function App() {
  const popWarningMessage = () => {
    messageApi.warn("This is a warning message!");
  };

  const popsuccessMessage = () => {
    messageApi.success("This is a success message!");
  };

  const [stepCurrent, setStep] = useState<number>(0);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Example of message.</p>
        <button onClick={popWarningMessage}>click to pop a warning message.</button>
        <button onClick={popsuccessMessage}>click to pop a succeed message.</button>

        <div style={{ width: "80%", marginTop: "32px" }}>
          <Steps current={stepCurrent}>
            <Step description="Step1"></Step>
            <Step
              description="Step2"
              onClick={() => {
                setStep(1);
              }}
            ></Step>
            <Step description="Step3"></Step>
          </Steps>
        </div>
      </header>
    </div>
  );
}

export default App;
