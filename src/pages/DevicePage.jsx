import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "@chakra-ui/react";
import { FiCpu, FiWifi, FiArrowLeft } from "react-icons/fi";
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

  // Defaults
  const defaultStart = new Date().toISOString().split("T")[0]; // today YYYY-MM-DD
  const defaultEnd = new Date().toISOString().split("T")[0];   // today YYYY-MM-DD
  const defaultBucket = "15 minutes";

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [timebucket, setTimebucket] = useState(defaultBucket);

  const intervals = [
    "5 minutes","10 minutes","15 minutes","30 minutes",
    "1 hour","2 hours","4 hours","8 hours",
    "12 hours","1 day","2 days","5 days",
    "1 week","2 weeks","4 weeks","1 month"
  ];

  // Fetch device details
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch(`${API_URL}/devices/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 403) throw new Error("Forbidden — check your token");
        if (res.status === 404) throw new Error("Device not found");
        if (!res.ok) throw new Error("Failed to fetch device details");
        return res.json();
      })
      .then((data) => setDevice(data.device || data))
      .catch((err) => setError(err.message));
  }, [id, navigate, API_URL]);

  // Fetch readings
  const fetchReadings = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    setError("");

    const url = `${API_URL}/devices/${id}/readings?start_date=${encodeURIComponent(
      startDate
    )}&end_date=${encodeURIComponent(endDate)}&timebucket=${encodeURIComponent(
      timebucket
    )}`;

console.log(url);
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch readings");
        return res.json();
      })
      .then((data) => setReadings(data.readings || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  // Re-fetch readings when params change
  useEffect(() => {
    fetchReadings();
  }, [id, startDate, endDate, timebucket]);

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

  const lastReading = device.last_reading;
  const lastTemp = lastReading?.temperature != null ? `${lastReading.temperature}°C` : "N/A";
  const lastHum = lastReading?.humidity != null ? `${lastReading.humidity}%` : "N/A";
  const online = isDeviceOnline(device.last_status_update);

  const handleClick = (intv, e) => {
    setStartDate('2025-11-06');
    setTimebucket(intv); // update timebucket state
  };

  return (
    <Box p={6}>
      {/* Back Button */}
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

      {/* Device Info */}
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8}>
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
            <Text><b>Device ID:</b> {device.device_id}</Text>
            <Text><b>Location:</b> {device.location || "Unknown"}</Text>
            <Text><Icon as={FiWifi} mr={2} /><b>IP:</b> {device.ip_addr || "N/A"}</Text>
            <Text><b>Uptime:</b> {device.uptime ? `${device.uptime}s` : "N/A"}</Text>
            <Text fontSize="sm" color="gray.500">
              Registered: {new Date(device.first_registration_timestamp).toLocaleString()}
            </Text>
            <Text fontSize="sm" color="gray.500">
              Last update: {new Date(device.last_status_update).toLocaleString()}
            </Text>
          </VStack>
        </Flex>

        {/* Latest Readings */}
        <LatestReadingsWidget
          temperature={lastTemp}
          humidity={lastHum}
          timestamp={lastReading?.time}
        />
      </Grid>

      <Divider my={10} />

      {/* Chart Section */}
      <Box w="100%">
        <Heading size="md" mb={4}>Temperature/Humidity Chart</Heading>

        <HStack wrap="wrap" mb={4} spacing={2}>
          {intervals.map((intv) => (
            <Button
              key={intv}
              type="button"
              size="sm"
              colorScheme={intv === timebucket ? "blue" : "gray"}
              onClick={() => handleClick(intv)}
            >
              {intv}
            </Button>
          ))}
        </HStack>

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
    </Box>
  );
}
