import React, { createContext, useContext, useEffect, useState } from "react";
import mqtt from "mqtt";

const MqttContext = createContext(null);

export const MqttProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const mqtt_url = import.meta.env.VITE_MQTT_BROKER;
    const options = {
      username: import.meta.env.VITE_MQTT_USER,
      password: import.meta.env.VITE_MQTT_PASS,
      keepalive: 60,
      reconnectPeriod: 5000,
      clean: true,
    };

    const mqttClient = mqtt.connect(mqtt_url, options);

    mqttClient.on("connect", () => {
      console.log("✅ MQTT connected");
      setConnected(true);
    });

    mqttClient.on("error", (err) => {
      console.error("❌ MQTT error:", err);
      mqttClient.end();
    });

    setClient(mqttClient);

    return () => {
      // Do NOT end the client on unmount, only on app unload
      window.addEventListener("beforeunload", () => mqttClient.end());
    };
  }, []);

  return (
    <MqttContext.Provider value={{ client, connected }}>
      {children}
    </MqttContext.Provider>
  );
};

export const useMqtt = () => useContext(MqttContext);
