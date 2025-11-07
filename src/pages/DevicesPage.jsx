import { useEffect, useState } from "react";
import { Box, SimpleGrid, Heading, Spinner, Text, HStack, Badge, Icon } from "@chakra-ui/react";
import { FiCpu } from "react-icons/fi"; // example device icon
import { useNavigate } from "react-router-dom";

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch(`${API_URL}/devices`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 403) throw new Error("Forbidden — check your token");
        if (!res.ok) throw new Error("Failed to fetch devices");
        return res.json();
      })
      .then((data) => setDevices(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [navigate]);

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
      {/* Page title with device count */}
      <HStack mb={6} spacing={3}>
        <Icon as={FiCpu} boxSize={7} color="blue.500" />      
        <Heading size="lg">Devices</Heading>
        <Badge colorScheme="blue" fontSize="md">{devices.length}</Badge>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {devices.map((device) => (
          <Box
            key={device.id || device.device_id}
            p={4}
            borderWidth={1}
            borderRadius="md"
            shadow="sm"
            bg="gray.50"
            overflowX="auto"
          >
            {/* Device ID with icon */}
            <HStack mb={2} spacing={2} align="center">
              <Icon as={FiCpu} boxSize={4} color="blue.500" />
              <Heading size="sm">
                {device.device_id || device.id || "Unknown ID"}
              </Heading>
            </HStack>

            {/* Raw JSON */}
            <Text fontFamily="monospace" fontSize="sm">
              {JSON.stringify(device, null, 2)}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
