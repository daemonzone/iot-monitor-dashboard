import { Flex, Heading, Spacer, Button, HStack, Icon, Select, Text } from "@chakra-ui/react";
import { FiMonitor } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Navbar({ onLogout }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const API_URL = import.meta.env.VITE_API_URL;

  return (
    <Flex
      as="nav"
      p={4}
      bg="blue.600"
      color="white"
      align="center"
    >
      {/* Left: main title with icon */}
      <HStack spacing={2} mr={8}>
        <Icon as={FiMonitor} boxSize={5} />
        <Heading size="md">IoT Monitor Dashboard</Heading>
      </HStack>

      {/* Menu buttons */}
      {token && (
        <HStack spacing={2}>
          <Button
            variant="ghost"
            color="white"
            _hover={{ bg: "blue.400", color: "white" }}
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </Button>
          <Button
            variant="ghost"
            color="white"
            _hover={{ bg: "blue.400", color: "white" }}
            onClick={() => navigate("/devices")}
          >
            Devices
          </Button>
        </HStack>
      )}

      <Spacer />

      {/* API URL select */}
      {token && (
        <Flex align="center" mr={4}>
          <Text mr={2} fontSize="md" color="white">
            Server:
          </Text>
          <Select
            value={API_URL}
            maxW="300px"
            bg="white"
            color="black"
            size="sm"
            readOnly
          >
            <option value={API_URL}>{API_URL}</option>
          </Select>
        </Flex>
      )}

      {/* Logout button */}
      {token && (
        <Button
          colorScheme="red"
          _hover={{ bg: "red.600" }}
          onClick={() => {
            localStorage.removeItem("token");
            onLogout?.();
            navigate("/login");
          }}
        >
          Logout
        </Button>
      )}
    </Flex>
  );
}
