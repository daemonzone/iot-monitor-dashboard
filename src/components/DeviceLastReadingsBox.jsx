// DeviceLastReadingsBox.jsx
import { Box, VStack, HStack, Text } from "@chakra-ui/react";

export default function DeviceLastReadingsBox({ lastReading }) {
  if (!lastReading) return null;

  const { temperature, humidity, recorded_at } = lastReading;

  return (
    <Box
      borderWidth={1}
      borderRadius="md"
      p={4}
      bg="gray.800"
      color="white"
      minW="120px"
    >
      <VStack spacing={2}>
        <HStack justify="space-between" w="full">
          <VStack spacing={0} align="start">
            <Text fontSize="sm" color="gray.300">Temp</Text>
            <Text fontSize="lg" fontWeight="bold">{temperature}°C</Text>
          </VStack>
          <VStack spacing={0} align="start">
            <Text fontSize="sm" color="gray.300">Hum</Text>
            <Text fontSize="lg" fontWeight="bold">{humidity}%</Text>
          </VStack>
        </HStack>
        <Text fontSize="xs" color="gray.400">
          {recorded_at ? new Date(recorded_at).toLocaleString() : "N/A"}
        </Text>
      </VStack>
    </Box>
  );
}
