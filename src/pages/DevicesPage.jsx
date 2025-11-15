import { useEffect, useState } from "react";
import { Flex, Box, SimpleGrid, Heading, Spinner, HStack, Badge, Icon, Text, Switch } from "@chakra-ui/react";
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
  const { client, connected } = useMqtt(); // get MQTT client

  useEffect(() => {
    fetchWithAuth(`${API_URL}/sensors`)
      .then((data) => {
        if (data) {    
          setSensorIcons(data);
        }
      })
  }, []);

  // Fetch devices once
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

  // Handle MQTT messages
  useEffect(() => {
    if (!client || !connected) return;

    // Subscribe to relevant topics
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
            lastUpdate: timestamp, // triggers flash effect
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

  // Trigger re-render for online/offline computation
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices((prev) => [...prev]);
    }, 70000);

    return () => clearInterval(interval);
  }, []);

  // Determine monitor badge
  let badgeContent;
  let badgeColor;
  if (monitorOnline === null) {
    badgeContent = (
      <HStack spacing={2}>
        <Spinner size="xs" />
        <FiActivity />
        <Text>Waiting for Monitor status</Text>
      </HStack>
    );
    badgeColor = "yellow";
  } else {
    badgeContent = (
      <HStack spacing={2}>
        <FiActivity />
        <Text>Monitor {monitorOnline ? "Online" : "Offline"}</Text>
      </HStack>
    );
    badgeColor = monitorOnline ? "green" : "red";
  }

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
      <Flex mb={6} align="center" justify="space-between">
        <HStack spacing={3}>
          <Icon as={FiCpu} boxSize={7} color="blue.500" />
          <Heading size="lg">Devices</Heading>
          <Badge colorScheme="blue" py="1" px="2" borderRadius="md" fontSize="sm">
            {devices.length}
          </Badge>
          <Switch
            ml={6}
            isChecked={showOnlyOnline}
            onChange={(e) => setShowOnlyOnline(e.target.checked)}
          />
          <Text>Show only online devices</Text>
        </HStack>

        <Badge colorScheme={badgeColor} fontSize="sm" px={3} py={1} borderRadius="full">
          {badgeContent}
        </Badge>
      </Flex>

      {devices.length === 0 ? (
        <Text color="gray.500">No devices available.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {filteredDevices.map((device) => (
            <DeviceCard key={device.device_id || device.id} device={device} sensor_icons={sensor_icons} />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
