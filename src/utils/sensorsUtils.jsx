import { Text, Tooltip, HStack } from "@chakra-ui/react";
import { FiCpu, FiThermometer, FiDroplet, FiSun } from "react-icons/fi";

export function SensorIcon({ code }) {
  switch (code) {
    case "temperature":
      return <FiThermometer />;
    case "humidity":
      return <FiDroplet />;
    case "led":
      return <FiSun />; // or FiZap for lightning
    case "cpu_temperature":
      return <FiCpu />;
    default:
      return null;
  }
}

export function SensorsIconsList({ sensors, labels = true }) {
  if (!sensors || sensors.length === 0) return null;

  return (
    <HStack as="span" spacing={2} display="inline-flex">
      {sensors.map((key) => (
        <Tooltip key={key} label={key} fontSize="sm" hasArrow>
          <span style={{ display: "inline-flex", alignItems: "center" }}>
            <SensorIcon code={key} style={{ marginRight: 2 }} />
						{labels && key} 
         	</span>
        </Tooltip>
      ))}
    </HStack>
  );
}