import { BOARD_TILES } from "@/constants/BOARD_TILES";
import { useMemo, useState } from "react";
import { generateBoard } from "../utils/BoardGenerator";

export const useBoardState = () => {
  const board = useMemo(() => generateBoard(BOARD_TILES), []);
  const [activeMines, setActiveMines] = useState<
    { tileIndex: number; ownerId: string }[]
  >([]);

  const handlePlaceMine = (tileIndex: number, ownerId: string) => {
    setActiveMines((prev) => [...prev, { tileIndex, ownerId }]);
  };

  const removeMine = (tileIndex: number) => {
    setActiveMines((prev) => prev.filter((m) => m.tileIndex !== tileIndex));
  };

  return { board, activeMines, handlePlaceMine, removeMine };
};
