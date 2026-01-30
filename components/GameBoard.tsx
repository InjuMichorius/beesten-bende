import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { BoardTile } from "./BoardTile";

interface GameBoardProps {
  board: any[];
  players: any[];
  activeMines: { tileIndex: number; ownerId: string }[];
  onPlaceMine: (index: number) => void;
  isPlacingMine: boolean;
}

export const GameBoard = forwardRef(
  (
    { board, players, activeMines, onPlaceMine, isPlacingMine }: GameBoardProps,
    ref,
  ) => {
    const scrollRef = useRef<ScrollView>(null);
    const tilePositions = useRef<{ [key: number]: number }>({});

    useImperativeHandle(ref, () => ({
      scrollToTile: (index: number) => {
        const xPos = tilePositions.current[index];
        if (xPos !== undefined)
          scrollRef.current?.scrollTo({
            x: Math.max(0, xPos - 40),
            animated: true,
          });
      },
    }));

    return (
      <View style={styles.leftPanel}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.boardScrollContent}
        >
          <View style={styles.boardGrid}>
            {board.map((tile: any, idx: number) => (
              <TouchableOpacity
                key={tile.id || idx}
                onLayout={(e) => {
                  tilePositions.current[idx] = e.nativeEvent.layout.x;
                }}
                onPress={() => onPlaceMine(idx)}
                disabled={!isPlacingMine}
              >
                <BoardTile
                  tile={tile}
                  playersOnTile={players.filter((p: any) => p.pos === idx)}
                  hasMine={activeMines.some((m) => m.tileIndex === idx)}
                  // Fixed: Added missing required props
                  index={idx}
                  isPlacingMode={isPlacingMine}
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  },
);

// Fixed: "Component definition is missing display name"
GameBoard.displayName = "GameBoard";

const styles = StyleSheet.create({
  leftPanel: { flex: 1 },
  boardGrid: { flexDirection: "row", gap: 15, padding: 20 },
  boardScrollContent: { alignItems: "center" },
});
