import React from "react";
import ReactDOM from "react-dom";
import Form from "./form";

import "./styles.css";

function App() {
  return (
    <div className="App">
      <Form />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
