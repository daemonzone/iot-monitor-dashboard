import { Flex, Box, Heading, Spacer, Button, HStack, Icon, Select, Text, useDisclosure, Collapse, VStack } from "@chakra-ui/react";
import { FiMonitor, FiMenu } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Navbar({ onLogout }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  const { isOpen, onToggle } = useDisclosure();

  return (
    <Box bg="blue.600" color="white" w="100%" px={4}>
      <Flex h={16} align="center" justify="space-between">
        {/* Left: icon + title */}
        <HStack spacing={2}>
          <Icon as={FiMonitor} boxSize={5} />
          <Heading size="md">IoT Monitor Dashboard</Heading>
        </HStack>

        {/* Hamburger menu for mobile */}
        <Box display={{ base: "block", md: "none" }}>
          <Button onClick={onToggle} variant="ghost">
            <FiMenu />
          </Button>
        </Box>

        {/* Menu buttons for desktop */}
        <HStack spacing={2} display={{ base: "none", md: "flex" }}>
          {token && (
            <>
              <Button variant="ghost" color="white" _hover={{ bg: "blue.400" }} onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
              <Button variant="ghost" color="white" _hover={{ bg: "blue.400" }} onClick={() => navigate("/devices")}>
                Devices
              </Button>
            </>
          )}
        </HStack>

        {/* Spacer + server + logout */}
        {token && (
          <HStack spacing={2}>
            <Text fontSize="sm" display={{ base: "none", md: "block" }}>
              Server:
            </Text>
            <Select value={API_URL} maxW="200px" size="sm" bg="white" color="black" readOnly display={{ base: "none", md: "block" }}>
              <option value={API_URL}>{API_URL}</option>
            </Select>
            <Button colorScheme="red" size="sm" onClick={() => {
              localStorage.removeItem("token");
              onLogout?.();
              navigate("/login");
            }}>
              Logout
            </Button>
          </HStack>
        )}
      </Flex>

      {/* Mobile menu collapse */}
      <Collapse in={isOpen} animateOpacity>
        <VStack pb={4} display={{ md: "none" }} spacing={2} align="stretch">
          {token && (
            <>
              <Button variant="ghost" color="white" _hover={{ bg: "blue.400" }} onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
              <Button variant="ghost" color="white" _hover={{ bg: "blue.400" }} onClick={() => navigate("/devices")}>
                Devices
              </Button>
            </>
          )}
        </VStack>
      </Collapse>
    </Box>
  );
}
