import { useEffect, useState } from "react";
import { Box, SimpleGrid, Heading, Spinner, HStack, Badge, Icon, Text } from "@chakra-ui/react";
import { FiCpu } from "react-icons/fi";
import DeviceCard from "../components/DeviceCard";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { isDeviceOnline } from "../utils/deviceStatus";
import mqtt from "mqtt";

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
  const MQTT_BROKER = import.meta.env.VITE_MQTT_BROKER;
  const MQTT_USER = import.meta.env.VITE_MQTT_USER;
  const MQTT_PASS = import.meta.env.VITE_MQTT_PASS;

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchWithAuth(`${API_URL}/devices`)
      .then((data) => {
        if (data) {
          const enriched = data.map((d) => ({ ...d, lastUpdate: null }));
          setDevices(enriched);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    // --- Connect to HiveMQ WebSocket ---
    const client = mqtt.connect(MQTT_BROKER, {
      username: MQTT_USER,
      password: MQTT_PASS,
      protocol: "wss",
      rejectUnauthorized: false
    });

    client.on("connect", () => console.log("✅ Connected to HiveMQ via WebSocket"));

    client.subscribe("devices/+/status", (err) => {
      if (err) console.error("❌ Subscribe error:", err);
      else console.log("✅ Subscribed to all device status topics");
    });

    client.on("message", (topic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        const timestamp = Date.now(); // for flash effect

        const statusMatch = topic.match(/^devices\/(.+)\/status$/);
        if (!statusMatch) return;

        const deviceId = statusMatch[1];

        // Flatten sensors_data into top-level lastReading
        const lastReading = {
          id: timestamp,
          time: new Date(payload.timestamp).toISOString(),
          ...payload.sensors_data
        };

        setDevices(prev => {
          const index = prev.findIndex(d => d.device_id === payload.id);

          const updatedDevice = {
            device_id: payload.id,
            sensors: payload.sensors_data,          // for display boxes
            uptime: payload.uptime,
            lastUpdate: timestamp,                  // triggers flash
            last_reading: lastReading,              // flat sensors object
            last_status_update: timestamp
          };

          if (index === -1) {
            return [...prev, updatedDevice];
          }

          const newDevices = [...prev];
          newDevices[index] = { ...newDevices[index], ...updatedDevice };
          return newDevices;
        });
      } catch (e) {
        console.error("Invalid MQTT payload:", e);
      }
    });

    // Subscribe to all device status topics
    client.on("connect", () => client.subscribe("devices/+/status"));

    return () => client.end(true); // cleanup on unmount
  }, []);

    useEffect(() => {
    const interval = setInterval(() => {
      setDevices(prev => [...prev]); // trigger re-render to recompute online/offline
    }, 70000); // check every 70 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <Box mt={10} textAlign="center">
        <Spinner size="xl" />
      </Box>
    );

  if (error)
    return (
      <Box mt={10} textAlign="center" color="red.500">
        {error}
      </Box>
    );

  return (
    <Box p={6}>
      <HStack mb={6} spacing={3}>
        <Icon as={FiCpu} boxSize={7} color="blue.500" />
        <Heading size="lg">Devices</Heading>
        <Badge colorScheme="blue" fontSize="md">
          {devices.length}
        </Badge>
      </HStack>

      {devices.length === 0 ? (
        <Text color="gray.500">No devices available.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {devices.map((device) => (
            <DeviceCard
              key={device.device_id || device.id}
              device={device}
            />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
