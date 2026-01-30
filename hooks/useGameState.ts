import { Player } from "@/constants/types";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

export const useGameState = () => {
  const { players: playersParam } = useLocalSearchParams();
  const [players, setPlayers] = useState<(Player & { inventory: string[] })[]>(
    [],
  );
  const [turn, setTurn] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  useEffect(() => {
    if (playersParam && typeof playersParam === "string") {
      const parsed = JSON.parse(playersParam);
      setPlayers(
        parsed.map((p: any) => ({ ...p, pos: 0, sips: 0, inventory: [] })),
      );
    }
  }, [playersParam]);

  const nextTurn = () => setTurn((prev) => (prev + 1) % players.length);

  // In useGameState.ts
  const addSips = (playerIds: string[], amount: number) => {
    setPlayers((currentPlayers) =>
      currentPlayers.map((p) =>
        playerIds.includes(p.id) ? { ...p, sips: p.sips + amount } : p,
      ),
    );
  };

  const handleRestart = () => {
    setPlayers((prev) =>
      prev.map((p) => ({ ...p, pos: 0, sips: 0, inventory: [] })),
    );
    setTurn(0);
    setGameFinished(false);
  };

  return {
    players,
    setPlayers,
    turn,
    setTurn,
    nextTurn,
    addSips,
    gameFinished,
    setGameFinished,
    handleRestart,
  };
};
