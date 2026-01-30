import { FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Inventory } from "./Inventory";

export const PlayerSidebar = ({
  currentPlayer,
  diceIcon,
  onRoll,
  isBusy,
  inventoryProps,
}: any) => {
  return (
    <View style={styles.rightPanel}>
      <View style={styles.turnInfo}>
        <Image
          source={{
            uri: `https://api.dicebear.com/7.x/bottts/png?seed=${currentPlayer.name}`,
          }}
          style={styles.sideAvatar}
        />
        <Text style={styles.turnText}>{currentPlayer.name}</Text>
        <View style={styles.sipBadge}>
          <Text style={styles.sipText}>{currentPlayer.sips}</Text>
          <FontAwesome6 name="wine-bottle" size={14} color="#ff9800" />
        </View>
      </View>

      <Inventory
        items={currentPlayer?.inventory || []}
        {...inventoryProps}
        isDisabled={isBusy}
      />

      <TouchableOpacity
        style={[styles.diceButton, isBusy && { opacity: 0.3 }]}
        onPress={onRoll}
        disabled={isBusy}
      >
        <FontAwesome6 name={diceIcon} size={40} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  rightPanel: {
    width: 180,
    borderLeftWidth: 1,
    borderColor: "#222",
    alignItems: "center",
    paddingVertical: 20,
  },
  turnInfo: { alignItems: "center" },
  sideAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#111",
    marginBottom: 8,
  },
  turnText: { color: "white", fontSize: 16, fontWeight: "bold" },
  sipBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 5,
  },
  sipText: {
    color: "#ff9800",
    fontWeight: "bold",
    marginRight: 10,
    fontSize: 20,
  },
  diceButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFF",
    marginTop: "auto",
  },
});
