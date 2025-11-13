import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ChakraProvider } from "@chakra-ui/react";
import { MqttProvider } from "./context/MqttProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider>
      <MqttProvider>
        <App />
      </MqttProvider>
    </ChakraProvider>
  </React.StrictMode>
);