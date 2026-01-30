import { Player } from "@/constants/types";
import { useCallback, useState } from "react";

export const useInventory = (
  setPlayers: React.Dispatch<
    React.SetStateAction<(Player & { inventory: string[] })[]>
  >,
  turn: number,
) => {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const toggleItem = useCallback((itemId: string) => {
    setActiveItemId((prev) => (prev === itemId ? null : itemId));
  }, []);

  const removeItemFromCurrentPlayer = useCallback(
    (itemId: string) => {
      setPlayers((prev) =>
        prev.map((p, idx) =>
          idx === turn
            ? {
                ...p,
                inventory: p.inventory.filter(
                  (id, i) => i !== p.inventory.indexOf(itemId),
                ),
              }
            : p,
        ),
      );
      setActiveItemId(null);
    },
    [turn, setPlayers],
  );

  const addItemToCurrentPlayer = (itemId: string) => {
    setPlayers((prev) => {
      return prev.map((p, idx) => {
        if (idx === turn) {
          return {
            ...p,
            inventory: [...p.inventory, itemId],
          };
        }
        return p;
      });
    });
  };

  return {
    activeItemId,
    setActiveItemId,
    toggleItem,
    removeItemFromCurrentPlayer,
    addItemToCurrentPlayer,
    isPlacingMine: activeItemId === "landmine",
  };
};
