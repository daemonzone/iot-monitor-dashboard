import { Text, Tooltip, HStack } from "@chakra-ui/react";
import * as FiIcons from "react-icons/fi";
import { capitalize } from "./stringUtils.js"

export function SensorIcon({ iconName, ...props }) {
	if (iconName == null) return;

  const IconComponent = FiIcons[iconName];
  if (!IconComponent) return null;

  return <IconComponent {...props} />;
}

export function SensorsIconsList({ sensor_icons = [], sensors, labels = true }) {
  if (!sensor_icons || sensor_icons.length === 0) return null;

  const iconsMap = Object.fromEntries(sensor_icons.map((si) => [si.code, si.icon]));

  return (
    <HStack as="span" spacing={4} display="inline-flex">
      {sensors.map((s) => {
        const iconName = iconsMap[s] || "FiHelpCircle";

        return (
          <Tooltip key={s} label={capitalize(s)} fontSize="sm" hasArrow>
            <span style={{ display: "inline-flex", alignItems: "center" }}>
              <SensorIcon iconName={iconName} style={{ marginRight: labels ? 2 : 0 }} />
              {labels && capitalize(s)}
            </span>
          </Tooltip>
        );
      })}
    </HStack>
  );
}
