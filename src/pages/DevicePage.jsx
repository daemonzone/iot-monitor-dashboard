import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Spinner,
  Image,
  HStack,
  VStack,
  Badge,
  Divider,
  Icon,
  Grid,
  Flex,
  Button,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { FiCpu, FiWifi, FiArrowLeft, FiThermometer, FiDroplet } from "react-icons/fi";
import ReadingBox from "../components/ReadingBox";
import { isDeviceOnline } from "../utils/deviceStatus";
import ReadingsChart from "../components/ReadingsChart.jsx";
import LatestReadingsWidget from "../components/LatestReadingsWidget";

export default function DevicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [device, setDevice] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

  Promise.all([
      fetch(`${API_URL}/devices/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_URL}/devices/${id}/readings`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(async ([deviceRes, readingsRes]) => {
        if (deviceRes.status === 403) throw new Error("Forbidden — check your token");
        if (deviceRes.status === 404) throw new Error("Device not found");
        if (!deviceRes.ok) throw new Error("Failed to fetch device details");
        if (!readingsRes.ok) throw new Error("Failed to fetch device readings");

        const deviceData = await deviceRes.json();
        const readingsData = await readingsRes.json();

        // unwrap "device" and "readings" if wrapped
        setDevice(deviceData.device || deviceData);
        setReadings(readingsData.readings || readingsData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading)
    return (
      <Box mt={10} textAlign="center">
        <Spinner size="xl" />
      </Box>
    );

  if (error)
    return (
      <Box mt={10} textAlign="center" color="red.500">
        {error}
      </Box>
    );

  if (!device) return null;

  const {
    model,
    device_id,
    image,
    location,
    ip_addr,
    uptime,
    status,
    first_registration_timestamp,
    last_status_update
  } = device;

  const lastReading = readings[0];
  const lastTemp = lastReading && lastReading.temperature !== null ? `${lastReading.temperature}°C` : "N/A";
  const lastHum = lastReading && lastReading.humidity !== null ? `${lastReading.humidity}%` : "N/A";

  const online = isDeviceOnline(device.last_status_update);

  return (
    <Box p={6}>
      {/* 🔙 Back Button */}
      <Button
        leftIcon={<FiArrowLeft />}
        colorScheme="gray"
        variant="ghost"
        mb={4}
        onClick={() => navigate("/devices")}
      >
        Back to Devices
      </Button>

      {/* Header */}
      <HStack mb={6} spacing={4} align="center">
        <Icon as={FiCpu} boxSize={8} color="blue.500" />
        <Heading size="lg">{device.model || "Unknown Device"}</Heading>
        <Badge colorScheme={online ? "green" : "red"}>
          {online ? "Online" : "Offline"}
        </Badge>
      </HStack>

      {/* 🧩 Main Layout */}
      <Grid
        templateColumns={{ base: "1fr", md: "1fr 1fr" }}
        gap={8}
        alignItems="stretch"
      >
        {/* LEFT: Image + Info */}
        <Flex
          borderWidth={1}
          borderRadius="md"
          p={6}
          bg="gray.50"
          shadow="sm"
          align="center"
          gap={6}
        >
          {device.image ? (
            <Image
              src={device.image}
              alt={device.model}
              borderRadius="md"
              maxH="200px"
              objectFit="contain"
              flexShrink={0}
            />
          ) : (
            <Box
              borderRadius="md"
              bg="gray.100"
              h="200px"
              w="200px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <Icon as={FiCpu} boxSize={16} color="gray.400" />
            </Box>
          )}

          <VStack align="start" spacing={2}>
            <Text>
              <Text as="span" fontWeight="bold">
                Device ID:
              </Text>{" "}
              {device.device_id}
            </Text>
            <Text>
              <Text as="span" fontWeight="bold">
                Location:
              </Text>{" "}
              {device.location || "Unknown"}
            </Text>
            <Text>
              <Icon as={FiWifi} mr={2} />
              <Text as="span" fontWeight="bold">
                IP:
              </Text>{" "}
              {device.ip_addr || "N/A"}
            </Text>
            <Text>
              <Text as="span" fontWeight="bold">
                Uptime:
              </Text>{" "}
              {device.uptime ? `${device.uptime}s` : "N/A"}
            </Text>
            <Text fontSize="sm" color="gray.500">
              Registered:{" "}
              {new Date(device.first_registration_timestamp).toLocaleString()}
            </Text>
            <Text fontSize="sm" color="gray.500">
              Last update: {new Date(device.last_status_update).toLocaleString()}
            </Text>
          </VStack>
        </Flex>

        {/* RIGHT: Latest Readings Widget */}
        <LatestReadingsWidget temperature={lastTemp} humidity={lastHum} timestamp={lastReading?.time}
/>
      </Grid>

      <Divider my={10} />

      {/* 📈 Bottom Section: Reading List + Chart */}
      <Flex gap={6} direction={{ base: "column", md: "row" }} align="start">
        {/* Right: Chart */}
        <Box w={{ base: "100%" }}>
          <Heading size="md" mb={4}>
            Temperature/Humidity Chart
          </Heading>
          <Box
            borderWidth={1}
            borderRadius="md"
            bg="gray.50"
            minH="300px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <ReadingsChart readings={readings} />
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}
