import { ITEMS } from "@/constants/ITEMS";

import { FontAwesome6 } from "@expo/vector-icons";
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
  isDisabled: boolean;
}

export const Inventory = ({
  items,
  activeItemId,
  onItemPress,
  isDisabled,
}: InventoryProps) => {
  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inventory</Text>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
                  backgroundColor: `${item.color}33`,
                },
                isDisabled && styles.disabled,
              ]}
              onPress={() => onItemPress(itemId)}
              disabled={isDisabled}
            >
              <FontAwesome6
                name={item.icon}
                size={18}
                color={isActive ? item.color : "white"}
              />
              <Text
                style={[styles.itemName, isActive && { color: item.color }]}
              >
                {isActive ? "Cancel" : item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 15,
    maxHeight: 200,
    marginTop: 20,
  },
  title: {
    color: "#666",
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  scrollContent: { gap: 8 },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
    gap: 10,
  },
  itemName: { color: "white", fontSize: 11, fontWeight: "bold" },
  disabled: { opacity: 0.5 },
});
