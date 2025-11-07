import { Box, Heading, Text } from "@chakra-ui/react";
import { useParams } from "react-router-dom";

export default function DevicePage() {
  const { id } = useParams();

  return (
    <Box p={6}>
      <Heading mb={4}>Device {id}</Heading>
      <Text>Details for device {id} will be displayed here.</Text>
    </Box>
  );
}
