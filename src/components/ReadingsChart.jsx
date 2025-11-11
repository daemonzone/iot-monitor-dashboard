// src/components/ReadingsChart.jsx
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";
import { Box, Text } from "@chakra-ui/react";

export default function ReadingsChart({ data }) {
  const sensor = data.sensor;
  const readings = data.buckets;

  if (!readings || readings.length === 0) {
    return <Text color="gray.500">No data available to display.</Text>;
  }

  // Sort readings by time ascending
  const sortedReadings = [...readings].sort((a, b) => new Date(a.time) - new Date(b.time));

  // Check if readings span multiple days
  const firstDay = new Date(sortedReadings[0].time).toDateString();
  const lastDay = new Date(sortedReadings[sortedReadings.length - 1].time).toDateString();
  const showDates = firstDay !== lastDay;

  // Prepare chart data with appropriate x-axis label
  const chartData = sortedReadings.map((r) => {
    const date = new Date(r.time);
    const timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateLabel = `${date.getDate().toString().padStart(2,'0')}/${(date.getMonth()+1).toString().padStart(2,'0')}`;
    return {
      time: showDates ? `${dateLabel} ${timeLabel}` : timeLabel,
      value: r.value
    };
  });

  // Compute min/max for temperature
  const values = chartData.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return (
    <Box
      w="100%"
      h="400px"
      borderWidth={1}
      borderRadius="md"
      p={4}
      bg="gray.50"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" angle={-45} textAnchor="end" interval={0} style={{ fontSize: '10px' }} />
          
          {/* LEFT Y-axis */}
          <YAxis
            yAxisId="left"
            orientation="left"
            stroke="#F6AD55"
            domain={[min, max]}
            allowDataOverflow={true}
          />

          <Tooltip formatter={(value) => (value != null ? value : "N/A")} />
          <Legend verticalAlign="top" height={36} />

          <Line
            yAxisId="left"
            type="monotone"
            dataKey="value"
            stroke="#F6AD55"
            activeDot={{ r: 6 }}
            name={sensor.name}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
