import { Player, Tile } from "@/constants/types";
import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ChallengeModalProps {
  tile: Tile;
  players: Player[];
  currentPlayer: Player;
  selectedVictimIds: string[];
  onToggleVictim: (id: string) => void;
  onConfirm: (ids: string[]) => void;
  onClose: () => void;
}

export const ChallengeModal = ({
  tile,
  players,
  currentPlayer,
  selectedVictimIds,
  onToggleVictim,
  onConfirm,
  onClose,
}: ChallengeModalProps) => {
  const isGiveAction =
    tile.actionType === "give" || tile.actionType === "everyone";

  const hasMovement = tile.moveAmount !== undefined && tile.moveAmount !== 0;

  const getButtonText = () => {
    if (selectedVictimIds.length === 0) return "Kies slachtoffer(s)";
    const names = players
      .filter((p) => selectedVictimIds.includes(p.id))
      .map((p) => (p.id === currentPlayer.id ? "ik" : p.name));

    const nameString =
      names.length > 1
        ? names.slice(0, -1).join(", ") + " en " + names.slice(-1)
        : names[0];

    const verb =
      names.length > 1 ? "nemen" : names[0] === "ik" ? "neem" : "neemt";
    return `${nameString} ${verb} ${tile.sipCount} slokken`;
  };

  return (
    <View style={styles.fullScreenOverlay}>
      <View style={styles.modalContent}>
        <FontAwesome5 name={tile.icon || "star"} size={40} color="white" />
        <Text style={styles.modalTitle}>{tile.name}</Text>
        <Text style={styles.modalDesc}>{tile.description}</Text>

        {hasMovement && (
          <View style={styles.moveBadge}>
            <FontAwesome5
              name={tile.moveAmount! > 0 ? "walking" : "undo-alt"}
              size={14}
              color="white"
            />
            <Text style={styles.moveText}>
              {tile.moveAmount! > 0 ? `+${tile.moveAmount}` : tile.moveAmount}{" "}
              stappen
            </Text>
          </View>
        )}

        {isGiveAction ? (
          <View style={styles.giveContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.victimScroll}
            >
              {players
                .filter((p) =>
                  tile.actionType === "everyone"
                    ? true
                    : p.id !== currentPlayer.id,
                )
                .map((p) => (
                  <TouchableOpacity
                    testID={`pick-victim-${p.name}`}
                    key={p.id}
                    style={[
                      styles.playerPickBtn,
                      selectedVictimIds.includes(p.id) &&
                        styles.playerPickBtnActive,
                    ]}
                    onPress={() => onToggleVictim(p.id)}
                  >
                    <Image
                      source={{
                        uri: `https://api.dicebear.com/7.x/bottts/png?seed=${p.name}`,
                      }}
                      style={[
                        styles.miniAvatarPick,
                        selectedVictimIds.includes(p.id) &&
                          styles.miniAvatarPickActive,
                      ]}
                    />
                    <Text
                      style={[
                        styles.pickName,
                        selectedVictimIds.includes(p.id) &&
                          styles.pickNameActive,
                      ]}
                    >
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
            <TouchableOpacity
              style={[
                styles.confirmSipsBtn,
                selectedVictimIds.length === 0 && styles.disabledBtn,
              ]}
              disabled={selectedVictimIds.length === 0}
              onPress={() => onConfirm(selectedVictimIds)}
            >
              <Text
                style={[
                  styles.confirmBtnText,
                  selectedVictimIds.length === 0 && styles.disabledBtnText,
                ]}
              >
                {getButtonText()}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.modalButtons}>
            <TouchableOpacity
              testID="close-modal"
              style={styles.choiceBtn}
              onPress={onClose}
            >
              <Text style={styles.btnText}>Accepteren</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#000",
    padding: 25,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  modalTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 8,
  },
  modalDesc: {
    color: "#999",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
  },
  moveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3498db",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
    gap: 8,
  },
  moveText: { color: "white", fontWeight: "bold" },
  modalButtons: { flexDirection: "row", gap: 12 },
  choiceBtn: {
    backgroundColor: "#e74c3c",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  btnText: { color: "white", fontWeight: "bold" },
  giveContainer: { width: "100%", alignItems: "center" },
  victimScroll: { paddingBottom: 10 },
  playerPickBtn: { alignItems: "center", marginHorizontal: 12, opacity: 0.6 },
  playerPickBtnActive: { opacity: 1 },
  miniAvatarPick: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#111",
  },
  miniAvatarPickActive: { borderColor: "#ff9800", borderWidth: 3 },
  pickName: { color: "#999", fontSize: 12 },
  pickNameActive: { color: "white", fontWeight: "bold" },
  confirmSipsBtn: {
    backgroundColor: "#ff9800",
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
  },
  confirmBtnText: { color: "black", fontWeight: "bold" },
  disabledBtn: { backgroundColor: "#333" },
  disabledBtnText: { color: "#666" },
});
