import { BOARD_TILES } from "@/constants/GameConfig";
import { FontAwesome5 } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DICE_ICONS = [
  "dice-one",
  "dice-two",
  "dice-three",
  "dice-four",
  "dice-five",
  "dice-six",
];

type Player = { id: string; name: string; pos: number; sips: number };

export default function GameScreen() {
  const { players: playersParam } = useLocalSearchParams();
  const initialPlayers = useMemo(() => {
    if (playersParam && typeof playersParam === "string") {
      try {
        const parsed = JSON.parse(playersParam);
        return parsed.map((p: any) => ({ ...p, pos: 0, sips: 0 }));
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: "1", name: "Speler 1", pos: 0, sips: 0 },
      { id: "2", name: "Speler 2", pos: 0, sips: 0 },
    ];
  }, [playersParam]);

  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [turn, setTurn] = useState(0);
  const [showChallenge, setShowChallenge] = useState(false);
  const [currentTile, setCurrentTile] = useState(BOARD_TILES[0]);
  const [isRolling, setIsRolling] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [diceIcon, setDiceIcon] = useState("dice");

  const [selectedVictimIds, setSelectedVictimIds] = useState<string[]>([]);

  const currentPlayer = players[turn];

  const nextTurn = () => {
    setTurn((prev) => (prev + 1) % players.length);
    setDiceIcon("dice");
    setSelectedVictimIds([]);
  };

  const animateMovement = (
    steps: number,
    playerIdx: number,
    onComplete?: () => void,
  ) => {
    setIsMoving(true);
    let remaining = Math.abs(steps);
    const direction = steps > 0 ? 1 : -1;
    const interval = setInterval(() => {
      setPlayers((prev) => {
        const newPlayers = [...prev];
        let nextPos = newPlayers[playerIdx].pos + direction;
        if (nextPos < 0) nextPos = BOARD_TILES.length - 1;
        if (nextPos >= BOARD_TILES.length) nextPos = 0;
        newPlayers[playerIdx] = { ...newPlayers[playerIdx], pos: nextPos };
        return newPlayers;
      });
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(interval);
        setIsMoving(false);
        if (onComplete) onComplete();
      }
    }, 400);
  };

  const addSips = (playerIds: string[], amount: number) => {
    setPlayers((prev) =>
      prev.map((p) =>
        playerIds.includes(p.id) ? { ...p, sips: (p.sips || 0) + amount } : p,
      ),
    );
  };

  const handleLanding = (playerIdx: number) => {
    const tile = BOARD_TILES[players[playerIdx].pos];
    setSelectedVictimIds([]);

    if (tile.actionType === "self") {
      const sips = tile.sipsPerPlayer
        ? tile.sipsPerPlayer * players.length
        : tile.sipCount || 0;
      addSips([players[playerIdx].id], sips);
    } else if (!tile.actionType || tile.actionType === "info") {
      addSips([players[playerIdx].id], tile.sipCount || 0);
    }

    setTimeout(() => {
      setShowChallenge(true);
    }, 400);
  };

  const toggleVictim = (id: string) => {
    setSelectedVictimIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const rollDice = useCallback(() => {
    if (isRolling || isMoving || showChallenge) return;
    setIsRolling(true);
    let iterations = 0;
    const interval = setInterval(() => {
      setDiceIcon(DICE_ICONS[Math.floor(Math.random() * 6)]);
      if (++iterations >= 10) {
        clearInterval(interval);
        const roll = Math.floor(Math.random() * 6) + 1;
        setDiceIcon(DICE_ICONS[roll - 1]);
        setIsRolling(false);
        setTimeout(
          () => animateMovement(roll, turn, () => handleLanding(turn)),
          800,
        );
      }
    }, 100);
  }, [isRolling, isMoving, showChallenge, turn, players]);

  const closeAndCheckMove = () => {
    setShowChallenge(false);
    if (currentTile.moveAmount) {
      setTimeout(
        () => animateMovement(currentTile.moveAmount!, turn, nextTurn),
        500,
      );
    } else {
      setTimeout(nextTurn, 100);
    }
  };

  useEffect(() => {
    setCurrentTile(BOARD_TILES[currentPlayer.pos]);
  }, [currentPlayer.pos]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainWrapper}>
        {/* LINKS: HET BORD (SCROLLBAAR) */}
        <View style={styles.leftPanel}>
          <ScrollView
            contentContainerStyle={styles.boardScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.boardGrid}>
              {BOARD_TILES.map((tile, index) => {
                const playersOnTile = players.filter((p) => p.pos === index);
                return (
                  <View
                    key={tile.id}
                    style={[
                      styles.tile,
                      playersOnTile.length > 0 && styles.activeTile,
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
                    <FontAwesome5 name={tile.icon} size={22} color="white" />
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* RECHTS: TURN INFO */}
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
              <FontAwesome5 name="beer" size={14} color="#ff9800" />
              <Text style={styles.sipText}>{currentPlayer.sips} slokken</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.diceButton}
            onPress={rollDice}
            disabled={isRolling || isMoving}
          >
            <FontAwesome5 name={diceIcon} size={40} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* MODAL */}
      {showChallenge && (
        <View style={styles.fullScreenOverlay}>
          <View style={styles.modalContent}>
            <FontAwesome5 name={currentTile.icon} size={40} color="white" />
            <Text style={styles.modalTitle}>{currentTile.name}</Text>
            <Text style={styles.modalDesc}>{currentTile.description}</Text>

            {currentTile.actionType === "give" ||
            currentTile.actionType === "everyone" ? (
              <View style={styles.giveContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.victimScroll}
                >
                  {players
                    .filter((p) =>
                      currentTile.actionType === "everyone"
                        ? true
                        : p.id !== currentPlayer.id,
                    )
                    .map((p) => {
                      const isSelected = selectedVictimIds.includes(p.id);
                      return (
                        <TouchableOpacity
                          key={p.id}
                          style={[
                            styles.playerPickBtn,
                            isSelected && styles.playerPickBtnActive,
                          ]}
                          onPress={() => toggleVictim(p.id)}
                        >
                          <Image
                            source={{
                              uri: `https://api.dicebear.com/7.x/bottts/png?seed=${p.name}`,
                            }}
                            style={[
                              styles.miniAvatarPick,
                              isSelected && styles.miniAvatarPickActive,
                            ]}
                          />
                          <Text
                            style={[
                              styles.pickName,
                              isSelected && styles.pickNameActive,
                            ]}
                          >
                            {p.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </ScrollView>

                <TouchableOpacity
                  style={[
                    styles.confirmSipsBtn,
                    selectedVictimIds.length === 0 && styles.disabledBtn,
                  ]}
                  disabled={selectedVictimIds.length === 0}
                  onPress={() => {
                    addSips(selectedVictimIds, currentTile.sipCount || 0);
                    closeAndCheckMove();
                  }}
                >
                  <Text
                    style={[
                      styles.confirmBtnText,
                      selectedVictimIds.length === 0 && styles.disabledBtnText,
                    ]}
                    numberOfLines={2}
                  >
                    {(() => {
                      if (selectedVictimIds.length === 0)
                        return "Kies slachtoffer(s)";

                      const names = players
                        .filter((p) => selectedVictimIds.includes(p.id))
                        .map((p) =>
                          p.id === currentPlayer.id ? "ik" : p.name,
                        );

                      const nameString =
                        names.length > 1
                          ? names.slice(0, -1).join(", ") +
                            " en " +
                            names.slice(-1)
                          : names[0];

                      let verb = "neemt";
                      if (names.length > 1) {
                        verb = "nemen";
                      } else if (names[0] === "ik") {
                        verb = "neem";
                      }

                      return `${nameString} ${verb} ${currentTile.sipCount} slokken`;
                    })()}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.choiceBtn}
                  onPress={closeAndCheckMove}
                >
                  <Text style={styles.btnText}>Accepteren</Text>
                </TouchableOpacity>
                {(!currentTile.actionType ||
                  currentTile.actionType === "info") && (
                  <TouchableOpacity
                    style={[styles.choiceBtn, { backgroundColor: "#333" }]}
                    onPress={closeAndCheckMove}
                  >
                    <Text style={styles.btnText}>Gokje wagen</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  mainWrapper: { flex: 1, flexDirection: "row" },
  leftPanel: { flex: 1 },
  boardScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  rightPanel: {
    width: 250,
    borderLeftWidth: 1,
    borderColor: "#222",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 40,
  },
  boardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
    padding: 10,
    gap: 15,
  },
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
    borderColor: "#ff9800",
  },
  sipText: { color: "#ff9800", fontWeight: "bold", marginLeft: 6 },
  diceButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFF",
  },
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modalContent: {
    width: "70%",
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
  modalButtons: { flexDirection: "row", gap: 12 },
  choiceBtn: {
    backgroundColor: "#e74c3c",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  btnText: { color: "white", fontWeight: "bold" },
  giveContainer: { width: "100%", alignItems: "center" },
  victimScroll: { paddingBottom: 10 },
  playerPickBtn: { alignItems: "center", marginHorizontal: 12, opacity: 0.6 },
  playerPickBtnActive: { opacity: 1, transform: [{ scale: 1.1 }] },
  miniAvatarPick: {
    width: 60,
    height: 60,
    borderRadius: 30,
    margin: 8,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#111",
  },
  miniAvatarPickActive: { borderColor: "#ff9800", borderWidth: 3 },
  pickName: { color: "#999", fontSize: 12 },
  pickNameActive: { color: "white", fontWeight: "bold" },
  disabledBtn: {
    backgroundColor: "transparent",
    borderColor: "#444",
    borderWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
  },
  confirmSipsBtn: {
    backgroundColor: "#ff9800",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
    marginTop: 20,
    alignItems: "center",
    shadowColor: "#ff9800",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  confirmBtnText: {
    color: "black",
    fontWeight: "900",
    fontSize: 16,
    textAlign: "center",
  },
  disabledBtnText: { color: "#444" },
});
