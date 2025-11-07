// src/components/ReadingsChart.jsx
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Box, Text } from "@chakra-ui/react";

export default function ReadingsChart({ readings }) {
  if (!readings || readings.length === 0) {
    return <Text color="gray.500">No readings to display.</Text>;
  }

  // Map readings to chart-friendly format
  const chartData = readings.map((r) => ({
    time: new Date(r.recorded_at).toLocaleTimeString(), // X axis
    temperature: r.temperature,
    humidity: r.humidity,
  }));

  return (
    <Box w="100%" h="300px" borderWidth={1} borderRadius="md" p={4} bg="gray.50">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis yAxisId="left" orientation="left" stroke="#F6AD55" /> {/* Temp */}
          <YAxis yAxisId="right" orientation="right" stroke="#4299E1" /> {/* Humidity */}
          <Tooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="temperature"
            stroke="#F6AD55"
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="humidity"
            stroke="#4299E1"
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
