import { Box, SimpleGrid, Text } from "@chakra-ui/react";

export default function ReadingBox({ reading }) {
  if (!reading) return null;

  const { recorded_at, temperature, humidity } = reading;

  const timestamp = recorded_at ? new Date(recorded_at).toLocaleString() : "N/A";

  return (
    <Box
      p={3}
      borderWidth={1}
      borderRadius="md"
      bg="gray.50"
      shadow="sm"
    >
      <SimpleGrid columns={2} spacing={2}>
        <Text fontSize="sm" color="gray.600" fontWeight="bold">
          Timestamp:
        </Text>
        <Text fontSize="sm" color="gray.700">
          {timestamp}
        </Text>

        <Text fontSize="sm" color="gray.600" fontWeight="bold">
          Temperature:
        </Text>
        <Text fontSize="sm" color="gray.700">
          {temperature !== null ? `${temperature}°C` : "N/A"}
        </Text>

        <Text fontSize="sm" color="gray.600" fontWeight="bold">
          Humidity:
        </Text>
        <Text fontSize="sm" color="gray.700">
          {humidity !== null ? `${humidity}%` : "N/A"}
        </Text>
      </SimpleGrid>
    </Box>
  );
}
