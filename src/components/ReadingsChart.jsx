// src/components/ReadingsChart.jsx
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";
import { Box, Text } from "@chakra-ui/react";

export default function ReadingsChart({ readings }) {
  if (!readings || readings.length === 0) {
    return <Text color="gray.500">No readings to display.</Text>;
  }

  const chartData = readings.map((r) => ({
    time: new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: r.temperature,
    humidity: r.humidity,
  }));

  return (
    // Parent must have fixed height!
    <Box
      w="100%"
      h="400px"          // <- FIXED HEIGHT in pixels
      borderWidth={1}
      borderRadius="md"
      p={4}
      bg="gray.50"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" angle={-45} textAnchor="end" />
          <YAxis yAxisId="left" orientation="left" stroke="#F6AD55" />
          <YAxis yAxisId="right" orientation="right" stroke="#4299E1" />
          <Tooltip formatter={(value) => (value != null ? value : "N/A")} />
          <Legend verticalAlign="top" height={36} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="temperature"
            stroke="#F6AD55"
            activeDot={{ r: 6 }}
            name="Temperature (°C)"
            connectNulls
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="humidity"
            stroke="#4299E1"
            activeDot={{ r: 6 }}
            name="Humidity (%)"
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
