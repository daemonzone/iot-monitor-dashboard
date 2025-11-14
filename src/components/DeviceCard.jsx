import { useEffect, useState } from "react";
import { Box, Image, Text, HStack, VStack, Badge, Icon, Flex, Tooltip } from "@chakra-ui/react";
import { FiCpu, FiRss, FiThermometer, FiDroplet, FiSun } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { isDeviceOnline } from "../utils/deviceStatus";
import { SensorsIconsList } from "../utils/sensorsUtils.jsx";
import DeviceLastReadingsBox from "../components/DeviceLastReadingsBox";

export default function DeviceCard({ device, sensor_icons }) {
  const navigate = useNavigate();
  if (!device) return null;

  const [flash, setFlash] = useState(false);

  const {
    device_id,
    model,
    image,
    location,
    ip_addr,
    uptime,
    sensors,
    last_status_update,
    last_reading,
    lastUpdate
  } = device;

  // Trigger flash whenever lastUpdate changes
  useEffect(() => {
    if (lastUpdate) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 1000); // 1 second flash
      return () => clearTimeout(t);
    }
  }, [lastUpdate]);

  const online = isDeviceOnline(last_status_update);

  return (
    <Box
      p={4}
      borderWidth={1}
      borderRadius="md"
      shadow="sm"
      bg={flash ? "blue.100" : "gray.50"}  // highlight when flash is true
      cursor="pointer"
      transition="all 0.3s"
      _hover={{ shadow: "md", transform: "translateY(-2px)" }}
      onClick={() => navigate(`/devices/${device_id}`)}
    >
      <Flex>
        {/* Left: Image + info */}
        <HStack spacing={4} flex={1} align="start">
          {image ? (
            <Image
              src={image}
              alt={model}
              borderRadius="md"
              boxSize="140px"
              objectFit="contain"
              bg="white"
            />
          ) : (
            <Box
              boxSize="140px"
              borderRadius="md"
              bg="gray.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FiCpu} boxSize={16} color="gray.400" />
            </Box>
          )}

          <VStack align="start" spacing={1} flex={1}>
            <HStack>
              <Text fontWeight="bold" fontSize="2xl">{model || "Unknown Device"}</Text>
              <Badge colorScheme={online ? "green" : "red"}>
                <Icon as={FiRss} verticalAlign="middle" mb={1} mr={1} />{online ? "Online" : "Offline"}
              </Badge>
            </HStack>

            <Text fontSize="sm" color="gray.600">
              <Text as="span" fontWeight="bold">Device ID:</Text> {device_id || "Unknown"}
            </Text>
            <Text fontSize="sm" color="gray.600">
              <Text as="span" fontWeight="bold">Location:</Text> {location || "Unknown"}
            </Text>
            <Text fontSize="sm" color="gray.600">
              <Text as="span" fontWeight="bold" mr={2}>Sensors:</Text>
              <SensorsIconsList sensor_icons={sensor_icons} sensors={sensors} labels={ false } />
            </Text>
            <Text fontSize="sm" color="gray.600">
              <Text as="span" fontWeight="bold">IP:</Text> {ip_addr || "N/A"}
            </Text>
            <Text fontSize="sm" color="gray.600">
              <Text as="span" fontWeight="bold">Uptime:</Text> {uptime && online ? `${uptime}s` : "N/A"}
            </Text>
          </VStack>
        </HStack>

        {/* Right: Last readings */}
        <DeviceLastReadingsBox lastReading={last_reading || { temperature: '-', humidity: '-' }} />
      </Flex>
    </Box>
  );
}
