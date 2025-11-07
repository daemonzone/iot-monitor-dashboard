import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Button, Input, VStack, Heading, FormControl,
  FormLabel, Alert, AlertIcon, Text
} from "@chakra-ui/react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error("Invalid username or password");

      const data = await res.json();
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="sm" mx="auto" mt={20} p={6} borderWidth={1} borderRadius="lg" shadow="md">
      <Heading mb={6} textAlign="center">Login</Heading>
      {error && <Alert status="error" mb={4}><AlertIcon />{error}</Alert>}
      <form onSubmit={handleLogin}>
        <VStack spacing={4}>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormControl>
          <Button colorScheme="blue" width="full" type="submit" isLoading={loading}>Login</Button>
          <Text fontSize="sm" color="gray.500" textAlign="center">Enter your credentials to login.</Text>
        </VStack>
      </form>
    </Box>
  );
}
