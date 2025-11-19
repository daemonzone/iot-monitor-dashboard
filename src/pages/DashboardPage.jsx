import { Box, SimpleGrid, Heading, Text, VStack, Center, Spinner, Link as ChakraLink } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [devices, setDevices] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth(`${API_URL}/sensors`).then((data) => { if (data) setSensors(data); });
  }, []);

  useEffect(() => {
    fetchWithAuth(`${API_URL}/dashboard`)
      .then((data) => {
        if (data) setDevices(data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Center mt={20}>
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box p={6}>
      <Heading mb={6}>Dashboard</Heading>

<VStack spacing={8} align="stretch">
  {devices.map((device) => (
    <Box
      key={device.device_id}
      p={6}
      borderWidth={1}
      borderRadius="md"
      bg="gray.50"
    >
      {/* Header */}
      <ChakraLink
        as={Link}
        to={`/devices/${device.device_id}`}
        _hover={{ textDecoration: "underline", color: "blue.500" }}
      >
        <Heading size="lg" mb={2}>{device.location}</Heading>
      </ChakraLink>

      <Text mb={4} fontWeight="bold">
        {device.model} ({device.device_id})
      </Text>

      {/* One chart box per sensor */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {device.sensors.map((sensorCode) => {
          
          // Extract ONLY the readings for this sensor
          const chartData = device.buckets
            .map((b) => {
              const entry = b.sensors.find((s) => s.sensor === sensorCode);
              if (!entry) return null;

              return {
                time: new Date(b.time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                avg: entry.avg,
                min: entry.min,
                max: entry.max,
              };
            })
            .filter(Boolean);

          if (chartData.length === 0) return null; // No data for this sensor

          // Compute stats
          const avgVal = (
            chartData.reduce((sum, r) => sum + (r.avg || 0), 0) /
            chartData.length
          ).toFixed(1);

          const minVal = Math.min(...chartData.map((r) => r.min));
          const maxVal = Math.max(...chartData.map((r) => r.max));
          const unit = sensors.find((i) => i.code === sensorCode).unit;

          return (
            <Box
              key={sensorCode}
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg="white"
            >
              <Heading size="md" fontWeight="bold" mb={2}>
                {sensorCode.charAt(0).toUpperCase() + sensorCode.slice(1)}
              </Heading>

              <Text mb={2}>
                Avg: <b>{avgVal} {unit}</b> | Min: <b>{minVal} {unit}</b> | Max: <b>{maxVal} {unit}</b>
              </Text>

              <Box h="150px">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="time" />
                    <YAxis domain={["auto", "auto"]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="avg" stroke="#3182CE" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          );
        })}
      </SimpleGrid>
    </Box>
  ))}
</VStack>
    </Box>
  );
}
