import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import messageApi from "./components/pop-message";
import Steps, { Step } from "./components/steps";
import ImgPicker from "components/img-picker/ImgPicker";

function App() {
  const popWarningMessage = () => {
    messageApi.warn("This is a warning message!");
  };

  const popsuccessMessage = () => {
    messageApi.success("This is a success message!");
  };

  const [stepCurrent, setStep] = useState<number>(0);

  const data = [];

  const [files, changeFiles] = useState(data);
  const onChange = (files, type, index) => {
    console.log(files, type, index);
    changeFiles(files);
  };

  return (
    <div className="App">
      <header className="App-header">
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

        <div style={{ width: "95%", marginTop: "50px" }}>
          <ImgPicker
            files={files}
            onChange={onChange}
            onImageClick={(idx, fs) => console.log(idx, fs)}
            selectable={files.length < 3}
          />
        </div>
      </header>
    </div>
  );
}

export default App;
