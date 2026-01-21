import { Player, Tile } from "@/constants/types";
import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, View } from "react-native";

interface BoardTileProps {
  tile: Tile;
  playersOnTile: Player[];
}

export const BoardTile = ({ tile, playersOnTile }: BoardTileProps) => {
  return (
    <View style={[styles.tile, playersOnTile.length > 0 && styles.activeTile]}>
      <View style={styles.avatarOverTile}>
        {playersOnTile.map((p) => (
          <Image
            key={p.id}
            source={{
              uri: `https://api.dicebear.com/7.x/bottts/png?seed=${p.name}`,
            }}
            style={styles.miniAvatar}
          />
        ))}
      </View>
      <FontAwesome5 name={tile.icon} size={22} color="white" />
    </View>
  );
};

const styles = StyleSheet.create({
  tile: {
    width: 80,
    height: 80,
    backgroundColor: "#111",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#222",
  },
  activeTile: { borderColor: "rgba(255,255,255,0.6)", borderWidth: 2 },
  avatarOverTile: {
    position: "absolute",
    top: -18,
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    zIndex: 10,
  },
  miniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#000",
    borderWidth: 2,
    borderColor: "#fff",
  },
});
