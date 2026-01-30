import { BoardTile } from "@/components/BoardTile";
import { ChallengeModal } from "@/components/ChallengeModal";
import { EndGameOverlay } from "@/components/EndGameOverlay";
import { BOARD_TILES } from "@/constants/BOARD_TILES";
import { ITEMS } from "@/constants/ITEMS";
import { ActionType, Player, Tile } from "@/constants/types";
import { DynamicIcon } from "@/helpers/DynamicIcon";
import { FontAwesome6 } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { generateBoard } from "../utils/BoardGenerator";

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

const Inventory = ({ items, activeItemId, onItemPress, isDisabled }: any) => {
  if (items.length === 0) return null;
  return (
    <View style={inventoryStyles.container}>
      <Text style={inventoryStyles.header}>Inventory</Text>
      <ScrollView contentContainerStyle={inventoryStyles.list}>
        {items.map((itemId: string, index: number) => {
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
              <DynamicIcon
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
  const board = useMemo(() => generateBoard(BOARD_TILES), []);
  const { players: playersParam } = useLocalSearchParams();

  const scrollRef = useRef<ScrollView>(null);
  const tilePositions = useRef<{ [key: number]: number }>({});

  const [players, setPlayers] = useState<(Player & { inventory: string[] })[]>(
    [],
  );
  const [gameFinished, setGameFinished] = useState(false);
  const [turn, setTurn] = useState(0);
  const [showChallenge, setShowChallenge] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [diceIcon, setDiceIcon] = useState("dice");
  const [selectedVictimIds, setSelectedVictimIds] = useState<string[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [activeMines, setActiveMines] = useState<
    { tileIndex: number; ownerId: string }[]
  >([]);
  const [mineHit, setMineHit] = useState(false);

  const isPlacingMine = activeItemId === "landmine";

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

  const scrollToTile = (tileIndex: number, animated = true) => {
    const xPos = tilePositions.current[tileIndex];
    if (xPos !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ x: Math.max(0, xPos - 40), animated });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => scrollToTile(currentPlayer.pos), 250);
    return () => clearTimeout(timer);
  }, [currentPlayer.pos]);

  const triggerChallenge = useCallback((isMineHit: boolean) => {
    // We zetten eerst de mineHit status en daarna pas de modal op true
    // om er zeker van te zijn dat de currentTile memo de juiste data pakt
    setMineHit(isMineHit);
    // Use a timeout to ensure the state is updated before showing the modal
    setTimeout(() => setShowChallenge(true), 0);
  }, []);

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

  const handleRestart = () => {
    setPlayers((prev) =>
      prev.map((p) => ({ ...p, pos: 0, sips: 0, inventory: [] })),
    );
    setTurn(0);
    setGameFinished(false);
    setActiveMines([]);
    scrollToTile(0);
  };

  const handleBackToStart = () => {
    router.replace("/");
  };

  const handleItemAction = (itemId: string) => {
    setActiveItemId(activeItemId === itemId ? null : itemId);
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

  const animateMovement = useCallback(
    (
      steps: number,
      playerIdx: number,
      onComplete?: (hitMine: boolean) => void,
    ) => {
      if (!players[playerIdx]) return;
      setIsMoving(true);
      let remaining = Math.abs(steps);
      const direction = steps > 0 ? 1 : -1;
      let currentPosTracker = players[playerIdx].pos;

      const interval = setInterval(() => {
        currentPosTracker += direction;

        if (currentPosTracker >= board.length - 1)
          currentPosTracker = board.length - 1;
        if (currentPosTracker < 0) currentPosTracker = 0;

        setPlayers((prev) => {
          const newPlayers = [...prev];
          if (newPlayers[playerIdx]) {
            newPlayers[playerIdx] = {
              ...newPlayers[playerIdx],
              pos: currentPosTracker,
            };
          }
          return newPlayers;
        });

        scrollToTile(currentPosTracker, true);
        remaining--;

        if (remaining <= 0) {
          clearInterval(interval);
          setTimeout(() => {
            setIsMoving(false);
            const hit = activeMines.some(
              (m) => m.tileIndex === currentPosTracker,
            );
            onComplete?.(hit);
          }, 300);
        }
      }, 450);
    },
    [board.length, activeMines, players],
  );

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
        setTimeout(() => {
          animateMovement(roll, turn, (hit) => {
            triggerChallenge(hit);
          });
        }, 400);
      }
    }, 100);
  };

  const handleActionComplete = (victims?: string[]) => {
    if (mineHit) {
      addSips([currentPlayer.id], MINE_TRIGGER_TILE.sipCount!);
      setActiveMines((prev) =>
        prev.filter((m) => m.tileIndex !== currentPlayer.pos),
      );
      setShowChallenge(false);
      // Even wachten zodat de state rustig kan updaten voordat de volgende beurt begint
      setTimeout(nextTurn, 100);
      return;
    }

    if (currentTile?.icon === "land-mine-on") {
      setPlayers((prev) =>
        prev.map((p, idx) =>
          idx === turn ? { ...p, inventory: [...p.inventory, "landmine"] } : p,
        ),
      );
    }

    if (victims && currentTile?.sipCount) {
      addSips(victims, currentTile.sipCount);
    }

    setShowChallenge(false);

    if (currentTile?.moveAmount) {
      setTimeout(
        () =>
          animateMovement(currentTile.moveAmount!, turn, (hit) =>
            triggerChallenge(hit),
          ),
        300,
      );
    } else {
      nextTurn();
    }
  };

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "1") {
        if (isRolling || isMoving || showChallenge || activeItemId) return;
        setDiceIcon(DICE_ICONS[0]);
        // Now using memoized functions
        animateMovement(1, turn, (hit) => {
          triggerChallenge(hit);
        });
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    isRolling,
    isMoving,
    showChallenge,
    activeItemId,
    turn,
    animateMovement,
    triggerChallenge,
  ]);

  const currentTile = useMemo(() => {
    if (mineHit) return MINE_TRIGGER_TILE;
    const rawTileOnPos = board[currentPlayer.pos];
    return rawTileOnPos
      ? formatTile(rawTileOnPos, currentPlayer.pos)
      : undefined;
  }, [currentPlayer.pos, mineHit, board]);

  if (players.length === 0) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainWrapper}>
        <View style={styles.leftPanel}>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            contentContainerStyle={styles.boardScrollContent}
          >
            <View style={styles.boardGrid}>
              {board.map((tile, idx) => {
                const tileObj = formatTile(tile, idx);
                const hasMine = activeMines.some((m) => m.tileIndex === idx);
                return (
                  <TouchableOpacity
                    key={tileObj.id}
                    disabled={!isPlacingMine || hasMine}
                    onPress={() => handlePlaceMine(idx)}
                    onLayout={(e) => {
                      tilePositions.current[idx] = e.nativeEvent.layout.x;
                    }}
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

      {gameFinished && (
        <EndGameOverlay
          players={players}
          onRestart={handleRestart}
          onPickNew={handleBackToStart}
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
  boardGrid: { flexDirection: "row", flexWrap: "nowrap", gap: 15, padding: 20 },
  boardScrollContent: { alignItems: "center" },
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
