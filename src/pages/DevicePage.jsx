import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Heading, Text, Spinner, Image, HStack, VStack,
  Badge, Divider, Icon, Grid, Flex, Button, Input, Stack, FormLabel
} from "@chakra-ui/react";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { FiCpu, FiWifi, FiArrowLeft } from "react-icons/fi";
import { isDeviceOnline } from "../utils/deviceStatus";
import ReadingsChart from "../components/ReadingsChart.jsx";
import LatestReadingsWidget from "../components/LatestReadingsWidget";

export default function DevicePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [device, setDevice] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch Device data
  useEffect(() => {
    setLoading(true);
    setError("");

    fetchWithAuth(`${API_URL}/devices/${id}`)
      .then((data) => {
        if (data) {
          setDevice(data.device);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const lastReading = device?.last_reading ?? {};
  const lastTemp = lastReading?.temperature != null ? `${lastReading.temperature}°C` : "N/A";
  const lastHum = lastReading?.humidity != null ? `${lastReading.humidity}%` : "N/A";
  const online = device?.last_status_update != null ? isDeviceOnline(device.last_status_update) : 'N/A';

  const defaultStart = new Date().toISOString().split("T")[0]; // today;
  const defaultEnd = new Date().toISOString().split("T")[0]; // today
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

  // Fetch Device readings
  useEffect(() => {
    // setLoading(true);
    // setError("");

    fetchReadings(id)
      .then((data) => {
        if (data) setReadings(data.readings);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, startDate, endDate, timebucket]);

  // Function to fetch readings
  const fetchReadings = async (deviceId) => {
    setError("");
    
    const readingsUrl =
      `${API_URL}/devices/${deviceId}/readings?` +
      `start_date=${encodeURIComponent(startDate)}` +
      `&end_date=${encodeURIComponent(endDate)}` +
      `&timebucket=${encodeURIComponent(timebucket)}`;

    try {
      const data = await fetchWithAuth(readingsUrl);
      if (data)
        return data || [];
    } catch (err) {
      setError(err.message);
    }
  };

  if (!device)
    return null;

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
        <Heading size="lg">{device.model ?? "Unknown Device"}</Heading>
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
<Stack spacing={4}>
  {/* Row 1 — Date inputs with labels */}
  <HStack spacing={3} align="center">
    <FormLabel m={0}>From:</FormLabel>
    <Input
      type="date"
      value={startDate}
      onChange={(e) => {
        setStartDate(e.target.value);
        fetchReadings(device.device_id);
      }}
      maxW="180px"
    />
    <FormLabel m={0}>To:</FormLabel>
    <Input
      type="date"
      value={endDate}
      onChange={(e) => {
        setEndDate(e.target.value);
        fetchReadings(device.device_id);
      }}
      maxW="180px"
    />
  </HStack>

  {/* Row 2 — Timebucket buttons */}
  <HStack spacing={2}>
    {intervals.map((intv) => (
      <Button
        key={intv}
        type="button"
        colorScheme={timebucket === intv ? "blue" : "gray"}
        onClick={() => {
          setTimebucket(intv);
          fetchReadings(device.device_id);
        }}
      >
        {intv}
      </Button>
    ))}
  </HStack>

  {/* Row 3 — Chart */}
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
</Stack>
    </Box>
  );
}
