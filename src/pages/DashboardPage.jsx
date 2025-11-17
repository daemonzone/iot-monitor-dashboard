import { Box, SimpleGrid, Heading, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [devices, setDevices] = useState([]);

  useEffect(() => {
    fetchWithAuth(`${API_URL}/dashboard`)
      .then((data) => {
        if (data) {
          setDevices(data);
        }
      })      
  }, []);

  return (
    <Box p={6}>
      <Heading mb={6}>Dashboard</Heading>

      <VStack spacing={8} align="stretch">
        {devices.map(device => {
          const tempBuckets = device.buckets.map(b => {
            const temp = b.sensors.find(s => s.sensor === "temperature");
            return {
              time: new Date(b.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              avg: temp?.avg,
              min: temp?.min,
              max: temp?.max
            };
          });

          const humBuckets = device.buckets.map(b => {
            const hum = b.sensors.find(s => s.sensor === "humidity");
            return {
              time: new Date(b.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              avg: hum?.avg,
              min: hum?.min,
              max: hum?.max
            };
          });

          // Compute overall stats
          const avgTemp = (tempBuckets.reduce((sum, t) => sum + (t.avg || 0), 0) / tempBuckets.length).toFixed(1);
          const minTemp = Math.min(...tempBuckets.map(t => t.min));
          const maxTemp = Math.max(...tempBuckets.map(t => t.max));

          const avgHum = (humBuckets.reduce((sum, h) => sum + (h.avg || 0), 0) / humBuckets.length).toFixed(1);
          const minHum = Math.min(...humBuckets.map(h => h.min));
          const maxHum = Math.max(...humBuckets.map(h => h.max));

          return (
            <Box key={device.device_id} p={6} borderWidth={1} borderRadius="md" bg="gray.50">
              {/* Device header */}
              <Heading size="md" mb={4}>
                {device.location}
              </Heading>
              <Text mb={4} fontWeight="bold">
                {device.model} ({device.device_id})
              </Text>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {/* Temperature box */}
                <Box p={4} borderWidth={1} borderRadius="md" bg="white">
                  <Text fontWeight="bold">Temperature</Text>
                  <Text>Avg: {avgTemp}°C | Min: {minTemp}°C | Max: {maxTemp}°C</Text>
                  <Box h="150px" mt={2}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={tempBuckets}>
                        <XAxis dataKey="time" />
                        <YAxis domain={["auto", "auto"]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="avg" stroke="#3182CE" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>

                {/* Humidity box */}
                <Box p={4} borderWidth={1} borderRadius="md" bg="white">
                  <Text fontWeight="bold">Humidity</Text>
                  <Text>Avg: {avgHum}% | Min: {minHum}% | Max: {maxHum}%</Text>
                  <Box h="150px" mt={2}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={humBuckets}>
                        <XAxis dataKey="time" />
                        <YAxis domain={["auto", "auto"]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="avg" stroke="#38A169" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              </SimpleGrid>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
}
