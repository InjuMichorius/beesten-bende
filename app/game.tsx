import { BoardTile } from "@/components/BoardTile";
import { ChallengeModal } from "@/components/ChallengeModal";
import { BOARD_TILES } from "@/constants/GameConfig";
import { ActionType, Player, Tile } from "@/constants/types";
import { FontAwesome6 } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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

const MINE_TRIGGER_TILE: Tile = {
  id: "mine-hit",
  name: "BOEM!",
  description: "Je bent op een landmijn gestapt! Neem 5 slokken.",
  icon: "bomb",
  sipCount: 5,
};

const formatTile = (tile: any, index: number): Tile => {
  return {
    ...tile,
    id: tile.id?.toString() ?? String(index),
    name: tile.name || `Vakje ${index + 1}`,
    description: tile.description || "",
    icon: tile.icon || "star",
    actionType: (tile.actionType as ActionType) || "none",
    sipCount: tile.sipCount ?? 0,
    moveAmount: tile.moveAmount ?? 0,
  };
};

export default function GameScreen() {
  const { players: playersParam } = useLocalSearchParams();

  // State
  const [players, setPlayers] = useState<(Player & { inventory: string[] })[]>(
    [],
  );
  const [turn, setTurn] = useState(0);
  const [showChallenge, setShowChallenge] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [diceIcon, setDiceIcon] = useState("dice");
  const [selectedVictimIds, setSelectedVictimIds] = useState<string[]>([]);

  // New State for Landmines
  const [activeMines, setActiveMines] = useState<
    { tileIndex: number; ownerId: string }[]
  >([]);
  const [isPlacingMine, setIsPlacingMine] = useState(false);
  const [mineHit, setMineHit] = useState(false);

  // Init
  useEffect(() => {
    if (playersParam && typeof playersParam === "string") {
      const parsed = JSON.parse(playersParam);
      setPlayers(
        parsed.map((p: any) => ({ ...p, pos: 0, sips: 0, inventory: [] })),
      );
    }
  }, [playersParam]);

  const currentPlayer = players[turn] || {
    id: "",
    name: "",
    sips: 0,
    pos: 0,
    inventory: [],
  };

  // Determine which tile info to show in the modal
  const currentTile = useMemo(() => {
    if (mineHit) return MINE_TRIGGER_TILE;
    return BOARD_TILES[currentPlayer.pos]
      ? formatTile(BOARD_TILES[currentPlayer.pos], currentPlayer.pos)
      : undefined;
  }, [currentPlayer.pos, mineHit]);

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
    setIsPlacingMine(false);
    setMineHit(false);
  };

  const handlePlaceMine = (tileIndex: number) => {
    if (!isPlacingMine) return;

    setActiveMines((prev) => [
      ...prev,
      { tileIndex, ownerId: currentPlayer.id },
    ]);
    setPlayers((prev) =>
      prev.map((p, idx) =>
        idx === turn
          ? {
              ...p,
              inventory: p.inventory.filter((item) => item !== "landmine"),
            }
          : p,
      ),
    );
    setIsPlacingMine(false);
  };

  const animateMovement = (
    steps: number,
    playerIdx: number,
    onComplete?: (hitMine: boolean) => void,
  ) => {
    setIsMoving(true);
    let remaining = Math.abs(steps);
    const direction = steps > 0 ? 1 : -1;
    let hitMine = false;

    const interval = setInterval(() => {
      setPlayers((prev) => {
        const newPlayers = [...prev];
        let nextPos = newPlayers[playerIdx].pos + direction;

        if (nextPos < 0) nextPos = 0;
        if (nextPos >= BOARD_TILES.length) nextPos = BOARD_TILES.length - 1;

        newPlayers[playerIdx] = { ...newPlayers[playerIdx], pos: nextPos };

        // Check for mines (excluding mines placed by the current player)
        const trap = activeMines.find(
          (m) =>
            m.tileIndex === nextPos && m.ownerId !== newPlayers[playerIdx].id,
        );
        if (trap) {
          hitMine = true;
        }

        return newPlayers;
      });

      remaining--;
      // If we hit a mine, we stop moving immediately
      if (remaining <= 0 || hitMine) {
        clearInterval(interval);
        setIsMoving(false);
        onComplete?.(hitMine);

        // Remove the mine after it's triggered
        if (hitMine) {
          setActiveMines((prev) =>
            prev.filter(
              (m) => m.tileIndex !== players[playerIdx].pos + direction,
            ),
          );
        }
      }
    }, 400);
  };

  const rollDice = () => {
    if (isRolling || isMoving || showChallenge || isPlacingMine) return;
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
          () =>
            animateMovement(roll, turn, (hit) => {
              if (hit) setMineHit(true);
              setTimeout(() => setShowChallenge(true), 400);
            }),
          400,
        );
      }
    }, 100);
  };

  const handleActionComplete = (victims?: string[]) => {
    // Check if player landed on landmine item tile (ID 15)
    if (!mineHit && currentTile?.id === "15") {
      setPlayers((prev) =>
        prev.map((p, idx) =>
          idx === turn ? { ...p, inventory: [...p.inventory, "landmine"] } : p,
        ),
      );
    }

    if (victims && currentTile?.sipCount) {
      addSips(victims, currentTile.sipCount);
    } else if (mineHit) {
      // If it was a mine hit and no victims selected, the current player drinks
      addSips([currentPlayer.id], MINE_TRIGGER_TILE.sipCount!);
    }

    setShowChallenge(false);

    if (!mineHit && currentTile?.moveAmount) {
      setTimeout(() => {
        animateMovement(currentTile.moveAmount!, turn, (hit) => {
          if (hit) setMineHit(true);
          if (hit) setShowChallenge(true);
          else nextTurn();
        });
      }, 300);
    } else {
      nextTurn();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainWrapper}>
        <View style={styles.leftPanel}>
          <ScrollView
            horizontal
            contentContainerStyle={styles.boardScrollContent}
          >
            <View style={styles.boardGrid}>
              {BOARD_TILES.map((tile, idx) => {
                const tileObj = formatTile(tile, idx);
                const hasMine = activeMines.some((m) => m.tileIndex === idx);

                return (
                  <TouchableOpacity
                    key={tileObj.id}
                    // Je kunt alleen klikken als je in de modus bent én er nog geen mijn ligt
                    disabled={!isPlacingMine || hasMine}
                    onPress={() => handlePlaceMine(idx)}
                  >
                    <BoardTile
                      tile={tileObj}
                      playersOnTile={players.filter((p) => p.pos === idx)}
                      index={idx}
                      isPlacingMode={isPlacingMine} // Activeert de previews rechtsonder
                      hasMine={hasMine} // Activeert de rode border en solide badge
                    />
                  </TouchableOpacity>
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
            <View style={styles.sipBadge}>
              <Text style={styles.sipText}>{currentPlayer.sips}</Text>
              <FontAwesome6 name="wine-bottle" size={14} color="#ff9800" />
            </View>
          </View>

          {/* Landmine Item Button */}
          {currentPlayer.inventory.includes("landmine") &&
            !isMoving &&
            !isRolling && (
              <TouchableOpacity
                style={[
                  styles.itemButton,
                  isPlacingMine && styles.itemButtonActive,
                ]}
                onPress={() => setIsPlacingMine(!isPlacingMine)}
              >
                <FontAwesome6 name="land-mine-on" size={20} color="white" />
                <Text style={styles.itemButtonText}>
                  {isPlacingMine ? "Kies Vakje" : "Zet Val"}
                </Text>
              </TouchableOpacity>
            )}

          <TouchableOpacity
            style={[styles.diceButton, isPlacingMine && styles.disabledDice]}
            onPress={rollDice}
            disabled={isRolling || isMoving || isPlacingMine}
          >
            <FontAwesome6 name={diceIcon} size={40} color="white" />
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
    paddingVertical: 20,
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
  sipText: {
    color: "#ff9800",
    fontWeight: "bold",
    marginRight: 10,
    fontSize: 20,
  },
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
  disabledDice: { opacity: 0.3 },
  itemButton: {
    alignItems: "center",
    backgroundColor: "#444",
    padding: 10,
    borderRadius: 12,
    width: 80,
  },
  itemButtonActive: {
    backgroundColor: "#e74c3c",
    borderWidth: 1,
    borderColor: "white",
  },
  itemButtonText: {
    color: "white",
    fontSize: 10,
    marginTop: 4,
    fontWeight: "bold",
  },
  placingHighlight: { borderColor: "#e74c3c", borderWidth: 2 },
  mineIndicator: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "black",
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: "red",
  },
});
