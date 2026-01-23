import { Player, Tile } from "@/constants/types";
import { FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, View } from "react-native";

interface BoardTileProps {
  tile: Tile;
  playersOnTile: Player[];
  index: number;
  isPlacingMode: boolean;
  hasMine: boolean;
}

export const BoardTile = ({
  tile,
  playersOnTile,
  index,
  isPlacingMode,
  hasMine,
}: BoardTileProps) => {
  const showRedBorder = hasMine;

  return (
    <View
      testID={`tile-${index}`}
      style={[
        styles.tile,
        playersOnTile.length > 0 && styles.activeTile,
        showRedBorder && styles.minePlacedBorder, // Rode rand alleen bij geplaatste mine
      ]}
    >
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
      <FontAwesome6 name={tile.icon} size={22} color="white" />

      {(hasMine || (isPlacingMode && !hasMine)) && (
        <View
          style={[
            styles.mineBadge,
            hasMine ? styles.mineBadgeActive : styles.mineBadgePreview,
          ]}
        >
          <FontAwesome6
            name="land-mine-on"
            size={12}
            color={hasMine ? "#e74c3c" : "rgba(231, 76, 60, 0.6)"}
          />
        </View>
      )}
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

  // Alleen als er een mijn ligt: rode rand
  minePlacedBorder: {
    borderColor: "#e74c3c",
    borderWidth: 2,
  },

  mineBadge: {
    position: "absolute",
    bottom: -6,
    right: -6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    borderWidth: 1.5,
  },

  mineBadgePreview: {
    borderStyle: "dashed",
    borderColor: "#e74c3c",
  },

  mineBadgeActive: {
    borderStyle: "solid",
    borderColor: "#e74c3c",
    elevation: 5,
    shadowColor: "#e74c3c",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },

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
