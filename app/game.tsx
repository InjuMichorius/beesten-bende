import { BoardTile } from "@/components/BoardTile";
import { ChallengeModal } from "@/components/ChallengeModal";
import { BOARD_TILES } from "@/constants/GameConfig";
import { Player } from "@/constants/types";
import { FontAwesome5 } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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

export default function GameScreen() {
  const { players: playersParam } = useLocalSearchParams();

  // State
  const [players, setPlayers] = useState<Player[]>([]);
  const [turn, setTurn] = useState(0);
  const [showChallenge, setShowChallenge] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [diceIcon, setDiceIcon] = useState("dice");
  const [selectedVictimIds, setSelectedVictimIds] = useState<string[]>([]);

  // Init
  useEffect(() => {
    if (playersParam && typeof playersParam === "string") {
      const parsed = JSON.parse(playersParam);
      setPlayers(parsed.map((p: any) => ({ ...p, pos: 0, sips: 0 })));
    }
  }, [playersParam]);

  const currentPlayer = players[turn] || { id: "", name: "", sips: 0, pos: 0 };

  const currentTile =
    BOARD_TILES[currentPlayer.pos] !== undefined
      ? {
          ...BOARD_TILES[currentPlayer.pos],
          id: BOARD_TILES[currentPlayer.pos].id.toString(),
          actionType: BOARD_TILES[currentPlayer.pos].actionType as
            | import("@/constants/types").ActionType
            | undefined,
        }
      : undefined;

  // Logica functies
  const addSips = (playerIds: string[], amount: number) => {
    setPlayers((prev) =>
      prev.map((p) =>
        playerIds.includes(p.id) ? { ...p, sips: p.sips + amount } : p,
      ),
    );
  };

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

        // Bounds checking
        if (nextPos < 0) nextPos = 0;
        if (nextPos >= BOARD_TILES.length) nextPos = BOARD_TILES.length - 1;

        newPlayers[playerIdx] = { ...newPlayers[playerIdx], pos: nextPos };
        return newPlayers;
      });

      remaining--;
      if (remaining <= 0) {
        clearInterval(interval);
        setIsMoving(false);
        onComplete?.();
      }
    }, 400);
  };

  const rollDice = () => {
    if (isRolling || isMoving || showChallenge) return;
    setIsRolling(true);
    let i = 0;
    const interval = setInterval(() => {
      setDiceIcon(DICE_ICONS[Math.floor(Math.random() * 6)]);
      if (++i >= 10) {
        clearInterval(interval);
        const roll = Math.floor(Math.random() * 6) + 1;
        setDiceIcon(DICE_ICONS[roll - 1]);
        setIsRolling(false);
        setTimeout(
          () => animateMovement(roll, turn, () => setShowChallenge(true)),
          800,
        );
      }
    }, 100);
  };

  // Logic when the modal is closed/confirmed
  const handleActionComplete = (victims?: string[]) => {
    // 1. Handle sips if victims provided
    if (victims && currentTile?.sipCount) {
      addSips(victims, currentTile.sipCount);
    }

    // 2. Close modal first
    setShowChallenge(false);

    // 3. Handle movement if tile has moveAmount
    if (currentTile?.moveAmount) {
      // Small delay so the modal closes before movement starts
      setTimeout(() => {
        animateMovement(currentTile.moveAmount!, turn, () => {
          nextTurn();
        });
      }, 300);
    } else {
      nextTurn();
    }
  };

  if (players.length === 0) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainWrapper}>
        <View style={styles.leftPanel}>
          <ScrollView
            horizontal
            contentContainerStyle={styles.boardScrollContent}
            showsHorizontalScrollIndicator={true}
          >
            <View style={styles.boardGrid}>
              {BOARD_TILES.map((tile, idx) => {
                const tileObj = {
                  ...tile,
                  id: tile.id.toString(),
                  actionType: tile.actionType as any,
                };
                return (
                  <BoardTile
                    key={tileObj.id}
                    tile={tileObj}
                    playersOnTile={players.filter((p) => p.pos === idx)}
                    index={idx}
                  />
                );
              })}
            </View>
          </ScrollView>
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
            <div style={styles.sipBadge}>
              <FontAwesome5 name="beer" size={14} color="#ff9800" />
              <Text style={styles.sipText}>{currentPlayer.sips} slokken</Text>
            </div>
          </View>
          <TouchableOpacity
            testID="dice-button"
            style={styles.diceButton}
            onPress={rollDice}
            disabled={isRolling || isMoving}
          >
            <FontAwesome5 name={diceIcon} size={40} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {showChallenge && currentTile && (
        <ChallengeModal
          tile={currentTile}
          players={players}
          currentPlayer={currentPlayer}
          selectedVictimIds={selectedVictimIds}
          onToggleVictim={(id) =>
            setSelectedVictimIds((prev) =>
              prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
            )
          }
          onConfirm={(ids) => handleActionComplete(ids)}
          onClose={() => handleActionComplete()}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  mainWrapper: { flex: 1, flexDirection: "row" },
  leftPanel: { flex: 1 },
  rightPanel: {
    width: 200,
    borderLeftWidth: 1,
    borderColor: "#222",
    alignItems: "center",
    justifyContent: "space-around",
  },
  boardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 15,
    padding: 20,
  },
  boardScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
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
});
