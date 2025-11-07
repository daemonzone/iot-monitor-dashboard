import { Box, SimpleGrid, Heading, Spinner, Text, HStack, Icon } from "@chakra-ui/react";
import { FiGrid } from "react-icons/fi"; // Dashboard icon
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Example: fetch or set your dashboard data here
  useEffect(() => {
    setLoading(true);
    // Simulate fetching boxes
    setTimeout(() => {
      setBoxes([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
      setLoading(false);
    }, 200);
  }, []);

  if (loading)
    return (
      <Box mt={10} textAlign="center">
        <Spinner size="xl" />
      </Box>
    );

  return (
    <Box p={6}>
      {/* Page title with icon */}
      <HStack mb={6} spacing={2}>
        <Icon as={FiGrid} boxSize={6} color="blue.500" />
        <Heading size="lg">Dashboard</Heading>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {boxes.map((box) => (
          <Box
            key={box.id}
            p={4}
            borderWidth={1}
            borderRadius="md"
            shadow="sm"
            bg="gray.50"
            minH="100px"
          >
            <Text>Box {box.id}</Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
