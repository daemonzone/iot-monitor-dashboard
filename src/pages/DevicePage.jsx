import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Heading, Text, Spinner, Image, HStack, VStack,
  Badge, Divider, Icon, Flex, Button, Input, Stack, FormLabel, Wrap, WrapItem
} from "@chakra-ui/react";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { FiCpu, FiRss, FiArrowLeft } from "react-icons/fi";
import { isDeviceOnline } from "../utils/deviceStatus";
import ReadingsChart from "../components/ReadingsChart.jsx";
import LatestReadingsWidget from "../components/LatestReadingsWidget";
import { SensorsIconsList } from "../utils/sensorsUtils.jsx";
import { useMqtt } from "../context/mqttProvider";

export default function DevicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [device, setDevice] = useState(null);
  const [sensors, setSensors] = useState([]);
  const [lastReading, setLastReading] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sensor_icons, setSensorIcons] = useState([]);
  const { client, connected } = useMqtt();

  const defaultStart = new Date().toISOString().split("T")[0];
  const defaultEnd = new Date().toISOString().split("T")[0];
  const defaultBucket = "1 hour";
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [timebucket, setTimebucket] = useState(defaultBucket);

  const intervals = [
    "1 minute","5 minutes","10 minutes","15 minutes","30 minutes",
    "1 hour","2 hours","4 hours","8 hours",
    "12 hours","1 day","2 days","5 days",
    "1 week","2 weeks","4 weeks","1 month"
  ];

  useEffect(() => {
    fetchWithAuth(`${API_URL}/sensors`).then((data) => { if (data) setSensorIcons(data); });
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchWithAuth(`${API_URL}/devices/${id}`)
      .then((data) => {
        if (data && data.device) {
          setDevice(data.device);
          setLastReading(data.device.last_reading || {});
        } else {
          setError("Device not found");
          setDevice(null);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchReadings(); }, [id, startDate, endDate, timebucket]);

  const fetchReadings = async () => {
    setError("");
    try {
      const url = `${API_URL}/devices/${id}/readings?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}&timebucket=${encodeURIComponent(timebucket)}`;
      const data = await fetchWithAuth(url);
      if (data) setSensors(data.readings || []);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!client || !connected) return;
    const topic = `websockets/${id}/status`;
    const handleMessage = (topicMsg, message) => {
      if (topicMsg !== topic) return;
      try {
        const payload = JSON.parse(message.toString());
        setLastReading({ id: payload.timestamp, time: new Date(payload.timestamp).toISOString(), ...payload.sensors_data });
        setDevice((prev) => prev ? {
          ...prev,
          uptime: payload.uptime ?? prev.uptime,
          last_status_update: payload.timestamp ?? prev.last_status_update
        } : prev);
      } catch (e) {
        console.error("Invalid MQTT payload:", e);
      }
    };
    client.subscribe(topic, (err) => err && console.error("Subscribe error:", err));
    client.on("message", handleMessage);
    return () => client.off("message", handleMessage);
  }, [client, connected, id]);

  const lastTemp = lastReading?.temperature != null ? `${lastReading.temperature}°C` : "N/A";
  const lastHum = lastReading?.humidity != null ? `${lastReading.humidity}%` : "N/A";
  const online = device?.last_status_update != null ? isDeviceOnline(device.last_status_update) : false;

  if (loading) return <Box mt={10} textAlign="center"><Spinner size="xl" /></Box>;
  if (error || !device) return <Box mt={10} textAlign="center" color="red.500">Device not found</Box>;

  return (
    <Box p={{ base: 4, md: 6 }}>
      {/* Navigation */}
      <Wrap spacing={2} mb={6}>
        <WrapItem>
          <Button leftIcon={<FiArrowLeft />} colorScheme="gray" variant="ghost" onClick={() => navigate("/dashboard")}>Dashboard</Button>
        </WrapItem>
        <WrapItem>
          <Button leftIcon={<FiArrowLeft />} colorScheme="gray" variant="outline" onClick={() => navigate("/devices")}>Devices</Button>
        </WrapItem>
      </Wrap>

      {/* Header */}
      <HStack mb={6} spacing={4} wrap="wrap">
        <Icon as={FiCpu} boxSize={8} color="blue.500" />
        <Heading size="lg">{device.model ?? "Unknown Device"}</Heading>
        <Badge colorScheme={online ? "green" : "red"}>
          <Icon as={FiRss} verticalAlign="middle" mb={1} mr={1} />{online ? "Online" : "Offline"}
        </Badge>
      </HStack>

      {/* Two 50% boxes */}
      <Flex direction={{ base: "column", md: "row" }} gap={6} mb={6}>
        {/* Left box: Image + Device info */}
        <Box flex="1" borderWidth={1} borderRadius="md" p={4} bg="gray.50" shadow="sm">
          <Flex direction={{ base: "column", md: "row" }} align="center" gap={4}>
            {/* Image */}
            {device.image ? (
              <Image
                src={device.image}
                alt={device.model}
                borderRadius="md"
                maxH={{ base: "150px", md: "200px" }}
                w={{ base: "100%", md: "150px" }}
                objectFit="contain"
              />
            ) : (
              <Box
                borderRadius="md"
                bg="gray.100"
                h={{ base: "150px", md: "200px" }}
                w={{ base: "100%", md: "150px" }}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FiCpu} boxSize={16} color="gray.400" />
              </Box>
            )}

            {/* Device info */}
            <VStack align={{ base: "start", md: "start" }} spacing={2} flex="1">
              <Text><b>Device ID:</b> {device.device_id}</Text>
              <Text><b>Location:</b> {device.location || "Unknown"}</Text>
              <Text><b>IP:</b> {device.ip_addr || "N/A"}</Text>
              <Text>
                <Text as="span" fontWeight="bold" mr={2}>Sensors:</Text>
                <SensorsIconsList sensor_icons={sensor_icons} sensors={device.sensors} labels={false} />
              </Text>
              <Text><b>Uptime:</b> {device.uptime ? `${device.uptime}s` : "N/A"}</Text>
              <Text fontSize="sm" color="gray.500">
                Registered: {new Date(device.first_registration_timestamp).toLocaleString()}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Last update: {new Date(device.last_status_update).toLocaleString()}
              </Text>
            </VStack>
          </Flex>
        </Box>

        {/* Right box: Latest readings */}
        <Box flex="1">
          <LatestReadingsWidget
            temperature={lastTemp}
            humidity={lastHum}
            timestamp={lastReading?.time}
          />
        </Box>
      </Flex>

      <Divider my={10} />

      {/* Filters & Charts */}
      <Stack spacing={4}>
        <Stack direction={{ base: "column", md: "row" }} spacing={2} align={{ base: "stretch", md: "center" }}>
          <Box>
            <FormLabel m={0}>From:</FormLabel>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} maxW="180px" />
          </Box>
          <Box>
            <FormLabel m={0}>To:</FormLabel>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} maxW="180px" />
          </Box>
        </Stack>

        <Wrap spacing={2}>
          {intervals.map((intv) => (
            <WrapItem key={intv}>
              <Button type="button" colorScheme={timebucket === intv ? "blue" : "gray"} size={{ base: "sm", md: "md" }} onClick={() => setTimebucket(intv)}>
                {intv}
              </Button>
            </WrapItem>
          ))}
        </Wrap>
      </Stack>

      {sensors.length !== 0 ? (
        <Stack spacing={4} mt={4}>
          {sensors.map((s) => (
            <Box key={s.sensor.code} w="100%">
              <Heading size="md" mb={2}>{s.sensor.name} ({s.sensor.unit})</Heading>
              <Box borderWidth={1} borderRadius="md" bg="gray.50" minH="300px" display="flex" alignItems="center" justifyContent="center" w="full">
                <ReadingsChart data={s} />
              </Box>
            </Box>
          ))}
        </Stack>
      ) : (
        <Stack spacing={4} align="center" justify="center" minH="100px">
          <Text>No sensors data available.</Text>
        </Stack>
      )}
    </Box>
  );
}
