import { useEffect, useState } from "react";
import { Box, SimpleGrid, Heading, Spinner, HStack, Badge, Icon, Text } from "@chakra-ui/react";
import { FiCpu } from "react-icons/fi";
import DeviceCard from "../components/DeviceCard";
import { fetchWithAuth } from "../utils/fetchWithAuth";

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setLoading(true);
    setError("");

    fetchWithAuth(`${API_URL}/devices`)
      .then((data) => {
        if (data) setDevices(data); // undefined if fetchWithAuth redirected
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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
      <HStack mb={6} spacing={3}>
        <Icon as={FiCpu} boxSize={7} color="blue.500" />
        <Heading size="lg">Devices</Heading>
        <Badge colorScheme="blue" fontSize="md">
          {devices.length}
        </Badge>
      </HStack>

      {devices.length === 0 ? (
        <Text color="gray.500">No devices available.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {devices.map((device) => (
            <DeviceCard key={device.device_id || device.id} device={device} />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
