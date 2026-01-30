import { GameBoard } from "@/components/GameBoard";
import { ModalsLayer } from "@/components/ModalsLayer"; // Import this
import { PlayerSidebar } from "@/components/PlayerSidebar";
import { Tile } from "@/constants/types";
import { useBoardState } from "@/hooks/useBoardState";
import { useGameMovement } from "@/hooks/useGameMovement";
import { useGameState } from "@/hooks/useGameState";
import { useInventory } from "@/hooks/useInventory";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";

const MINE_TRIGGER_TILE: Tile = {
  id: "mine-hit",
  name: "BOEM!",
  description: "Je bent op een landmijn gestapt! Neem 5 slokken.",
  icon: "bomb",
  sipCount: 5,
  actionType: "modal",
};

export default function GameScreen() {
  const {
    players,
    setPlayers,
    turn,
    nextTurn,
    addSips,
    gameFinished,
    handleRestart,
  } = useGameState();
  const { board, activeMines, handlePlaceMine, removeMine } = useBoardState();

  // Create a ref to access GameBoard's scrollToTile method
  const boardRef = useRef<any>(null);

  const { isMoving, diceIcon, rollAndMove, animateMovement } = useGameMovement(
    board,
    setPlayers,
    turn,
  );

  // Local state for modals (can eventually move to useGameState)
  const [showChallenge, setShowChallenge] = useState(false);
  const [currentTile, setCurrentTile] = useState<any>(null);
  const {
    activeItemId,
    toggleItem,
    addItemToCurrentPlayer,
    isPlacingMine,
    removeItemFromCurrentPlayer,
  } = useInventory(setPlayers, turn);

  const currentPlayer = players[turn];

  const handleLanded = useCallback(
    (finalPos: number) => {
      const landedTile = board[finalPos];
      const hitMine = activeMines.find((m) => m.tileIndex === finalPos);

      if (hitMine) {
        addSips([currentPlayer.id], 5);
        setCurrentTile(MINE_TRIGGER_TILE);
        setShowChallenge(true);
        removeMine(finalPos);
        return;
      }

      if (landedTile?.icon === "land-mine-on") {
        addItemToCurrentPlayer("landmine");
      }

      if (landedTile.actionType && landedTile.actionType !== "none") {
        setCurrentTile(landedTile);
        setShowChallenge(true);
      } else {
        nextTurn();
      }
    },
    [
      activeMines,
      board,
      currentPlayer,
      addItemToCurrentPlayer,
      nextTurn,
      addSips,
      removeMine,
    ],
  );

  const handleRoll = () => {
    rollAndMove((pos) => boardRef.current?.scrollToTile(pos), handleLanded);
  };

  useEffect(() => {
    if (currentPlayer?.pos !== undefined && boardRef.current) {
      const timer = setTimeout(() => {
        boardRef.current.scrollToTile(currentPlayer.pos);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer?.pos, turn]);

  if (!currentPlayer) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainWrapper}>
        <GameBoard
          ref={boardRef}
          board={board}
          players={players}
          activeMines={activeMines}
          isPlacingMine={isPlacingMine} // Gebruik nu de variabele uit de hook
          onPlaceMine={(idx) => {
            handlePlaceMine(idx, currentPlayer.id);
            removeItemFromCurrentPlayer("landmine"); // Verwijder uit inventory na plaatsen
          }}
        />

        <PlayerSidebar
          key={`player-${turn}-${currentPlayer?.sips}`}
          currentPlayer={currentPlayer}
          diceIcon={diceIcon}
          onRoll={handleRoll}
          isBusy={isMoving}
          inventoryProps={{
            activeItemId: activeItemId,
            onItemPress: toggleItem,
          }}
        />
      </View>

      <ModalsLayer
        showChallenge={showChallenge}
        showEndGame={gameFinished}
        currentTile={currentTile}
        players={players}
        currentPlayer={currentPlayer}
        onConfirmChallenge={(victims: string[]) => {
          addSips(victims, currentTile?.sipCount || 0);
          setShowChallenge(false);

          if (currentTile?.moveAmount) {
            setTimeout(() => {
              animateMovement(
                currentTile.moveAmount,
                (pos) => boardRef.current?.scrollToTile(pos),
                () => {
                  nextTurn();
                },
              );
            }, 400);
          } else {
            nextTurn();
          }
        }}
        onCloseChallenge={() => {
          setShowChallenge(false);
          nextTurn();
        }}
        onRestart={handleRestart}
        onExit={() => router.replace("/")}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  mainWrapper: { flex: 1, flexDirection: "row" },
});
