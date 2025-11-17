import {
  Flex,
  Heading,
  Spacer,
  Button,
  HStack,
  Icon,
  Select,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { FiMonitor, FiMenu } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Navbar({ onLogout }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex
      as="nav"
      p={4}
      bg="blue.600"
      color="white"
      align="center"
      wrap="wrap"
    >
      {/* Left: main title with icon */}
      <HStack spacing={2}>
        <Icon as={FiMonitor} boxSize={5} />
        <Heading size="md">IoT Monitor Dashboard</Heading>
      </HStack>

      <Spacer />

      {/* Desktop menu */}
      <HStack
        spacing={2}
        display={{ base: "none", md: "flex" }}
        align="center"
      >
        {token && (
          <>
            <Button
              variant="ghost"
              color="white"
              _hover={{ bg: "blue.400" }}
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              color="white"
              _hover={{ bg: "blue.400" }}
              onClick={() => navigate("/devices")}
            >
              Devices
            </Button>

            <Flex align="center" mr={2}>
              <Text mr={2} fontSize="md" color="white">
                Server:
              </Text>
              <Select value={API_URL} maxW="200px" bg="white" color="black" size="sm" readOnly>
                <option value={API_URL}>{API_URL}</option>
              </Select>
            </Flex>

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
          </>
        )}
      </HStack>

      {/* Mobile menu button */}
      {token && (
        <IconButton
          aria-label="Menu"
          icon={<FiMenu />}
          display={{ base: "flex", md: "none" }}
          onClick={onOpen}
          ml={2}
        />
      )}

      {/* Mobile drawer */}
      <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <Button variant="ghost" onClick={() => { navigate("/dashboard"); onClose(); }}>
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => { navigate("/devices"); onClose(); }}>
                Devices
              </Button>
              <Text>Server:</Text>
              <Select value={API_URL} readOnly>
                <option value={API_URL}>{API_URL}</option>
              </Select>
              <Button colorScheme="red" onClick={() => { localStorage.removeItem("token"); onLogout?.(); navigate("/login"); onClose(); }}>
                Logout
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}
