import { ITEMS } from "@/constants/ITEMS";
import { DynamicIcon } from "@/helpers/DynamicIcon";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface InventoryProps {
  items: string[];
  activeItemId: string | null;
  onItemPress: (itemId: string) => void;
  isDisabled?: boolean;
}

export const Inventory = ({
  items,
  activeItemId,
  onItemPress,
  isDisabled,
}: InventoryProps) => {
  if (!items || items.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Inventory</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {items.map((itemId, index) => {
          const item = ITEMS[itemId];
          if (!item) return null;
          const isActive = activeItemId === itemId;

          return (
            <TouchableOpacity
              key={`${itemId}-${index}`}
              style={[
                styles.itemCard,
                isActive && {
                  borderColor: item.color,
                  backgroundColor: `${item.color}22`,
                },
                isDisabled && { opacity: 0.5 },
              ]}
              onPress={() => onItemPress(itemId)}
              disabled={isDisabled}
            >
              <DynamicIcon
                name={item.icon}
                size={16}
                color={isActive ? item.color : "white"}
              />
              <Text
                style={[styles.itemName, isActive && { color: item.color }]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: "90%", flex: 1, marginTop: 20 },
  header: {
    color: "#666",
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 10,
    textTransform: "uppercase",
    textAlign: "center",
  },
  list: { gap: 10 },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    gap: 10,
  },
  itemName: { color: "white", fontSize: 12, fontWeight: "bold" },
});
