// src/components/LatestReadingsWidget.jsx
import { Box, Flex, Stat, StatLabel, StatNumber, Heading, Icon, Text } from "@chakra-ui/react";
import { FiThermometer, FiDroplet } from "react-icons/fi";

export default function LatestReadingsWidget({ temperature, humidity, timestamp }) {
  const formattedTime = timestamp ? new Date(timestamp).toLocaleString() : "N/A";

  return (
    <Flex
      borderWidth={1}
      borderRadius="md"
      p={{ base: 4, md: 8 }}
      bg="gray.800"
      shadow="lg"
      color="white"
      direction="column"
      align="center"
      justify="center"
    >
      <Heading size="md" mb={6}>
        Latest Readings
      </Heading>
      <Flex
        gap={{ base: 8, md: 12 }}
        align="center"
        justify="center"
        direction={{ base: "column", md: "row" }}
      >
        <Box textAlign="center">
          <Stat>
            <StatLabel fontSize={{ base: "md", md: "lg" }} color="gray.300">
              <Icon as={FiThermometer} mr={2} />
              Temperature
            </StatLabel>
            <StatNumber fontSize={{ base: "3xl", md: "5xl" }} color="orange.300">
              {temperature}
            </StatNumber>
          </Stat>
        </Box>
        <Box textAlign="center">
          <Stat>
            <StatLabel fontSize={{ base: "md", md: "lg" }} color="gray.300">
              <Icon as={FiDroplet} mr={2} />
              Humidity
            </StatLabel>
            <StatNumber fontSize={{ base: "3xl", md: "5xl" }} color="blue.300">
              {humidity}
            </StatNumber>
          </Stat>
        </Box>
      </Flex>
      <Text mt={4} fontSize="sm" color="gray.400" textAlign="center">
        Last reading: {formattedTime}
      </Text>
    </Flex>
  );
}
