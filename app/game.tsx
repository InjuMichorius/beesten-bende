import { BOARD_TILES } from "@/constants/GameConfig";
import { FontAwesome5 } from "@expo/vector-icons";
import { Audio } from "expo-av";
import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  SafeAreaView,
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

export default function GameScreen() {
  const [players, setPlayers] = useState([
    { id: "1", name: "Gijs", pos: 0 },
    { id: "2", name: "Bart", pos: 0 },
  ]);
  const [turn, setTurn] = useState(0);
  const [showChallenge, setShowChallenge] = useState(false);
  const [currentTile, setCurrentTile] = useState(BOARD_TILES[0]);
  const [isRolling, setIsRolling] = useState(false);
  const [diceIcon, setDiceIcon] = useState("dice");
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  async function playSound(type: "dice" | "modal") {
    const source =
      type === "dice"
        ? require("../assets/sounds/dice.mp3")
        : require("../assets/sounds/modal.mp3");

    const { sound } = await Audio.Sound.createAsync(source);
    setSound(sound);
    await sound.playAsync();
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const currentPlayer = players[turn];

  const rollDice = useCallback(async () => {
    if (isRolling || showChallenge) return;

    setIsRolling(true);
    playSound("dice");

    let iterations = 0;
    const maxIterations = 8;

    const interval = setInterval(() => {
      setDiceIcon(DICE_ICONS[Math.floor(Math.random() * 6)]);
      iterations++;

      if (iterations >= maxIterations) {
        clearInterval(interval);

        const roll = Math.floor(Math.random() * 6) + 1;
        const newPos = (currentPlayer.pos + roll) % BOARD_TILES.length;

        setDiceIcon(DICE_ICONS[roll - 1]);

        setPlayers((prev) => {
          const updated = [...prev];
          updated[turn] = { ...updated[turn], pos: newPos };
          return updated;
        });

        setTimeout(() => {
          setCurrentTile(BOARD_TILES[newPos]);
          setIsRolling(false);
          setShowChallenge(true);
          playSound("modal"); // Speel modal geluid
        }, 500);
      }
    }, 120);
  }, [isRolling, showChallenge, currentPlayer, turn]);

  const handleAction = (actionType: string) => {
    setShowChallenge(false);
    setTimeout(() => {
      setTurn((prev) => (prev + 1) % players.length);
      setDiceIcon("dice");
    }, 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainWrapper}>
        <View style={styles.leftPanel}>
          <View style={styles.boardGrid}>
            {BOARD_TILES.map((tile, index) => (
              <View
                key={tile.id}
                style={[
                  styles.tile,
                  currentPlayer.pos === index && styles.activeTile,
                ]}
              >
                <View style={styles.avatarOverTile}>
                  {players.map(
                    (p, pIdx) =>
                      p.pos === index && (
                        <Image
                          key={p.id}
                          source={{
                            uri: `https://api.dicebear.com/7.x/bottts/png?seed=${p.name}`,
                          }}
                          style={[
                            styles.miniAvatar,
                            { borderColor: pIdx === 0 ? "#ff4444" : "#4444ff" },
                          ]}
                        />
                      ),
                  )}
                </View>
                <FontAwesome5 name={tile.icon} size={22} color="white" />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.rightPanel}>
          <View style={styles.turnInfo}>
            <Image
              source={{
                uri: `https://api.dicebear.com/7.x/bottts/png?seed=${currentPlayer.name}`,
              }}
              style={styles.sideAvatar}
            />
            <Text style={styles.turnText}>{currentPlayer.name}</Text>
          </View>

          <TouchableOpacity
            style={[styles.diceButton, isRolling && styles.diceButtonRolling]}
            onPress={rollDice}
            activeOpacity={0.7}
          >
            <FontAwesome5
              name={diceIcon}
              size={40}
              color={isRolling ? "gold" : "white"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {showChallenge && (
        <View style={styles.fullScreenOverlay}>
          <View style={styles.modalContent}>
            <FontAwesome5 name={currentTile.icon} size={40} color="white" />
            <Text style={styles.modalTitle}>{currentTile.name}</Text>
            <Text style={styles.modalDesc}>{currentTile.description}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.choiceBtn}
                onPress={() => handleAction("accept")}
              >
                <Text style={styles.btnText}>Accepteren</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.choiceBtn, { backgroundColor: "#333" }]}
                onPress={() => handleAction("decline")}
              >
                <Text style={styles.btnText}>Gokje wagen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// ... styles blijven hetzelfde als in de vorige stap
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  mainWrapper: { flex: 1, flexDirection: "row" },
  leftPanel: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  activeTile: { borderColor: "gold", borderWidth: 2 },
  avatarOverTile: {
    position: "absolute",
    top: -18,
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  miniAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#000",
    borderWidth: 1.5,
    marginHorizontal: -3,
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
  diceButton: {
    width: 80,
    height: 80,
    borderRadius: 80,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFF",
  },
  diceButtonRolling: { borderColor: "gold" },
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#000",
    padding: 25,
    borderRadius: 20,
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
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  btnText: { color: "white", fontWeight: "bold", fontSize: 14 },
});
