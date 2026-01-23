import { BoardTile } from "@/components/BoardTile";
import { ChallengeModal } from "@/components/ChallengeModal";
import { BOARD_TILES, ITEMS } from "@/constants/GameConfig";
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

/**
 * SUB-COMPONENT: INVENTORY
 * Rendert de lijst met items in het rechter paneel
 */
const Inventory = ({
  items,
  activeItemId,
  onItemPress,
  isDisabled,
}: {
  items: string[];
  activeItemId: string | null;
  onItemPress: (id: string) => void;
  isDisabled: boolean;
}) => {
  if (items.length === 0) return null;

  return (
    <View style={inventoryStyles.container}>
      <Text style={inventoryStyles.header}>Inventory</Text>
      <ScrollView contentContainerStyle={inventoryStyles.list}>
        {items.map((itemId, index) => {
          const item = ITEMS[itemId];
          if (!item) return null;
          const isActive = activeItemId === itemId;

          return (
            <TouchableOpacity
              key={`${itemId}-${index}`}
              style={[
                inventoryStyles.itemCard,
                isActive && {
                  borderColor: item.color,
                  backgroundColor: `${item.color}22`,
                },
                isDisabled && { opacity: 0.5 },
              ]}
              onPress={() => onItemPress(itemId)}
              disabled={isDisabled}
            >
              <FontAwesome6
                name={item.icon}
                size={16}
                color={isActive ? item.color : "white"}
              />
              <Text
                style={[
                  inventoryStyles.itemName,
                  isActive && { color: item.color },
                ]}
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

  // Item & Trap State
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [activeMines, setActiveMines] = useState<
    { tileIndex: number; ownerId: string }[]
  >([]);
  const [mineHit, setMineHit] = useState(false);

  const isPlacingMine = activeItemId === "landmine";

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
    setActiveItemId(null);
    setMineHit(false);
  };

  const handleItemAction = (itemId: string) => {
    if (activeItemId === itemId) {
      setActiveItemId(null);
    } else {
      setActiveItemId(itemId);
    }
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
              inventory: p.inventory.filter(
                (_, i) => i !== p.inventory.indexOf("landmine"),
              ),
            }
          : p,
      ),
    );
    setActiveItemId(null);
  };

  const animateMovement = (
    steps: number,
    playerIdx: number,
    onComplete?: (hitMine: boolean) => void,
  ) => {
    setIsMoving(true);
    let remaining = Math.abs(steps);
    const direction = steps > 0 ? 1 : -1;
    let trapTriggered = false;

    const interval = setInterval(() => {
      setPlayers((prev) => {
        const newPlayers = [...prev];
        let nextPos = newPlayers[playerIdx].pos + direction;

        if (nextPos < 0) nextPos = 0;
        if (nextPos >= BOARD_TILES.length) nextPos = BOARD_TILES.length - 1;

        newPlayers[playerIdx] = { ...newPlayers[playerIdx], pos: nextPos };

        const trap = activeMines.find(
          (m) =>
            m.tileIndex === nextPos && m.ownerId !== newPlayers[playerIdx].id,
        );
        if (trap) trapTriggered = true;

        return newPlayers;
      });

      remaining--;
      if (remaining <= 0 || trapTriggered) {
        clearInterval(interval);
        setIsMoving(false);
        onComplete?.(trapTriggered);

        if (trapTriggered) {
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
    if (isRolling || isMoving || showChallenge || activeItemId) return;
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

  if (players.length === 0) return null;

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
                    disabled={!isPlacingMine || hasMine}
                    onPress={() => handlePlaceMine(idx)}
                  >
                    <BoardTile
                      tile={tileObj}
                      playersOnTile={players.filter((p) => p.pos === idx)}
                      index={idx}
                      isPlacingMode={isPlacingMine}
                      hasMine={hasMine}
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

          {/* De nieuwe Inventory Component */}
          <Inventory
            items={currentPlayer.inventory}
            activeItemId={activeItemId}
            onItemPress={handleItemAction}
            isDisabled={isMoving || isRolling}
          />

          <TouchableOpacity
            style={[styles.diceButton, !!activeItemId && styles.disabledDice]}
            onPress={rollDice}
            disabled={isRolling || isMoving || !!activeItemId}
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

const inventoryStyles = StyleSheet.create({
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  mainWrapper: { flex: 1, flexDirection: "row" },
  leftPanel: { flex: 1 },
  rightPanel: {
    width: 180,
    borderLeftWidth: 1,
    borderColor: "#222",
    alignItems: "center",
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
  disabledDice: { opacity: 0.3 },
});
