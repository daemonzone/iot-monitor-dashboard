// src/components/ReadingsChart.jsx
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";
import { Box, Text } from "@chakra-ui/react";

export default function ReadingsChart({ data }) {
  const sensor = data.sensor;
  const readings = data.buckets;

  if (!readings || readings.length === 0) {
    return <Text color="gray.500">No data available to display.</Text>;
  }

  const sortedReadings = [...readings].sort((a, b) => new Date(a.time) - new Date(b.time));

  const firstDay = new Date(sortedReadings[0].time).toDateString();
  const lastDay = new Date(sortedReadings[sortedReadings.length - 1].time).toDateString();
  const showDates = firstDay !== lastDay;

  const chartData = sortedReadings.map((r) => {
    const date = new Date(r.time);
    const timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateLabel = `${date.getDate().toString().padStart(2,'0')}/${(date.getMonth()+1).toString().padStart(2,'0')}`;
    return {
      time: showDates ? `${dateLabel} ${timeLabel}` : timeLabel,
      value: r.value
    };
  });

  const values = chartData.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return (
    <Box
      w="100%"
      h={{ base: "250px", md: "400px" }}   // smaller height on mobile
      borderRadius="md"
      p={{ base: 1, md: 4 }}               // less padding on mobile
      mb={{ base: 2, md: 4 }}              // less bottom margin between charts
      bg="gray.50"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" angle={-45} textAnchor="end" interval={0} style={{ fontSize: '9px' }} />
          <YAxis
            yAxisId="left"
            orientation="left"
            stroke="#F6AD55"
            domain={[min, max]}
            allowDataOverflow={true}
            style={{ fontSize: '10px' }}
          />
          <Tooltip formatter={(value) => (value != null ? value : "N/A")} />
          <Legend verticalAlign="top" height={24} wrapperStyle={{ fontSize: '10px' }} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="value"
            stroke="#F6AD55"
            activeDot={{ r: 4 }}
            name={sensor.name}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
