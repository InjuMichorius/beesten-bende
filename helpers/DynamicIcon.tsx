import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";

export const DynamicIcon = ({
  name,
  size,
  color,
}: {
  name: string | undefined;
  size: number;
  color: string;
}) => {
  if (!name) return null;

  // 1. Check voor Expo (MaterialCommunityIcons)
  if (name.startsWith("ex-")) {
    const cleanName = name.replace("ex-", "");
    return (
      <MaterialCommunityIcons
        name={cleanName as any}
        size={size}
        color={color}
      />
    );
  }

  // 2. Check voor FontAwesome 6
  if (name.startsWith("fa-")) {
    const cleanName = name.replace("fa-", "");
    return <FontAwesome6 name={cleanName as any} size={size} color={color} />;
  }

  // 3. Fallback: Als er geen prefix is, pakken we standaard FontAwesome
  return <FontAwesome6 name={name as any} size={size} color={color} />;
};
