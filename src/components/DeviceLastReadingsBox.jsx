// DeviceLastReadingsBox.jsx
import { Box, VStack, HStack, Text } from "@chakra-ui/react";

export default function DeviceLastReadingsBox({ lastReading }) {
  if (!lastReading) return null;

  const { temperature, humidity, cpu_temperature, time } = lastReading;

  if (temperature == null && humidity == null && cpu_temperature == null) return null;

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
          {temperature != null && (
          <VStack spacing={0} align="start">
            <Text fontSize="sm" color="gray.300">Temp</Text>
            <Text fontSize="lg" fontWeight="bold">{temperature}°C</Text>
          </VStack>
          )}

          {humidity != null && (
          <VStack spacing={0} align="start">
            <Text fontSize="sm" color="gray.300">Hum</Text>
            <Text fontSize="lg" fontWeight="bold">{humidity}%</Text>
          </VStack>
          )}
        </HStack>
        
        {cpu_temperature != null && (
        <HStack w="full" align="center" justify="center">
          <VStack spacing={0}>
            <Text fontSize="sm" color="gray.300">CPU Temp</Text>
            <Text fontSize="lg" fontWeight="bold">{cpu_temperature}°C</Text>
          </VStack>
        </HStack>
        )}
        
        <Text fontSize="xs" color="gray.400">
          {time ? new Date(time).toLocaleString() : "N/A"}
        </Text>
      </VStack>
    </Box>
  );
}
