import { useEffect, useState } from "react";
import {
  Flex,
  Box,
  SimpleGrid,
  Heading,
  Spinner,
  HStack,
  VStack,
  Badge,
  Icon,
  Text,
  Switch,
  Center,
} from "@chakra-ui/react";
import { FiCpu, FiActivity } from "react-icons/fi";
import DeviceCard from "../components/DeviceCard";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { isDeviceOnline } from "../utils/deviceStatus";
import { useMonitorStatus } from "../utils/monitorStatus";
import { useMqtt } from "../context/mqttProvider";

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sensor_icons, setSensorIcons] = useState([]);
  const [showOnlyOnline, setShowOnlyOnline] = useState(false);

  const filteredDevices = showOnlyOnline
    ? devices.filter((d) => isDeviceOnline(d.lastUpdate))
    : devices;

  const API_URL = import.meta.env.VITE_API_URL;
  const { monitorOnline, setLastHeartbeat } = useMonitorStatus();
  const { client, connected } = useMqtt();

  // Fetch sensor icons
  useEffect(() => {
    fetchWithAuth(`${API_URL}/sensors`).then((data) => {
      if (data) setSensorIcons(data);
    });
  }, []);

  // Fetch devices
  useEffect(() => {
    setLoading(true);
    setError("");

    fetchWithAuth(`${API_URL}/devices`)
      .then((data) => {
        if (data) {
          const enriched = data.map((d) => ({ ...d, lastUpdate: d.last_status_update }));
          setDevices(enriched);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // MQTT handling
  useEffect(() => {
    if (!client || !connected) return;

    client.subscribe("monitor/status", (err) => err && console.error(err));
    client.subscribe("websockets/+/status", (err) => err && console.error(err));

    const handleMessage = (topic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        const timestamp = Date.now();

        if (topic === "monitor/status") {
          const ts = payload.last_heartbeat_timestamp;
          localStorage.setItem("monitor_heartbeat", ts);
          setLastHeartbeat(ts);
          return;
        }

        const statusMatch = topic.match(/^websockets\/(.+)\/status$/);
        if (!statusMatch) return;

        const lastReading = {
          id: timestamp,
          time: new Date(payload.timestamp).toISOString(),
          ...payload.sensors_data,
        };

        setDevices((prev) => {
          const index = prev.findIndex((d) => d.device_id === payload.id);
          const updatedDevice = {
            device_id: payload.id,
            sensors_data: [payload.sensors_data],
            uptime: payload.uptime,
            lastUpdate: timestamp,
            last_reading: lastReading,
            last_status_update: timestamp,
          };

          if (index === -1) return [...prev, updatedDevice];

          const newDevices = [...prev];
          newDevices[index] = { ...newDevices[index], ...updatedDevice };
          return newDevices;
        });
      } catch (e) {
        console.error("Invalid MQTT payload:", e);
      }
    };

    client.on("message", handleMessage);
    return () => client.off("message", handleMessage);
  }, [client, connected]);

  // Re-render for online/offline updates
  useEffect(() => {
    const interval = setInterval(() => setDevices((prev) => [...prev]), 70000);
    return () => clearInterval(interval);
  }, []);

  // Monitor badge
  let badgeContent, badgeColor;
  if (monitorOnline === null) {
    badgeContent = (
      <HStack spacing={1} wrap="wrap">
        <Spinner size="xs" />
        <FiActivity />
        <Text fontSize="sm">Waiting for Monitor status</Text>
      </HStack>
    );
    badgeColor = "yellow";
  } else {
    badgeContent = (
      <HStack spacing={1} wrap="wrap">
        <FiActivity />
        <Text fontSize="sm">Monitor {monitorOnline ? "Online" : "Offline"}</Text>
      </HStack>
    );
    badgeColor = monitorOnline ? "green" : "red";
  }

  if (loading)
    return (
      <Center mt={20}>
        <Spinner size="xl" />
      </Center>
    );

  if (error)
    return (
      <Center mt={20}>
        <Text color="red.500">{error}</Text>
      </Center>
    );

  return (
    <Box p={{ base: 4, md: 6 }}>
      {/* Header */}
      <Flex
        direction={{ base: "column", md: "row" }}
        align={{ base: "flex-start", md: "center" }}
        justify="space-between"
        mb={6}
        gap={4}
      >
        {/* Left section */}
        <HStack spacing={3} wrap="wrap">
          <Icon as={FiCpu} boxSize={7} color="blue.500" />
          <Heading size="lg">Devices</Heading>
          <Badge colorScheme="blue" py="1" px="2" borderRadius="md" fontSize="sm">
            {devices.length}
          </Badge>
          <Switch
            isChecked={showOnlyOnline}
            onChange={(e) => setShowOnlyOnline(e.target.checked)}
          />
          <Text fontSize="sm">Show only online devices</Text>
        </HStack>

        {/* Right section */}
        <Box mt={{ base: 2, md: 0 }}>
          <Badge
            colorScheme={badgeColor}
            fontSize="sm"
            px={3}
            py={1}
            borderRadius="full"
            display="flex"
            alignItems="center"
            wrap="wrap"
          >
            {badgeContent}
          </Badge>
        </Box>
      </Flex>

      {/* Device cards */}
      {devices.length === 0 ? (
        <Text color="gray.500">No devices available.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredDevices.map((device) => (
            <DeviceCard key={device.device_id || device.id} device={device} sensor_icons={sensor_icons} />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
