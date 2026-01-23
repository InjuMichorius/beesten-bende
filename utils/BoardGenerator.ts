import { Tile } from "../constants/BOARD_TILES";

const START_TILE: Tile = {
  id: 0,
  name: "Start",
  icon: "flag",
  actionType: "info",
  description: "Iedereen staat klaar? Proost!",
};

const FINISH_TILE: Tile = {
  id: 999,
  name: "Finish",
  icon: "flag-checkered",
  actionType: "info",
  description: "Gefeliciteerd! Je hebt de drank-marathon overleefd.",
};

export const generateBoard = (pool: Tile[]): Tile[] => {
  let poolItems: Tile[] = [];

  pool.forEach((tile) => {
    const count = tile.occurrence ?? 1;
    for (let i = 0; i < count; i++) {
      poolItems.push({
        ...tile,
        id: Number(`${tile.id}${i}`),
      });
    }
  });

  for (let i = poolItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [poolItems[i], poolItems[j]] = [poolItems[j], poolItems[i]];
  }

  const fullBoard = [START_TILE, ...poolItems, FINISH_TILE];

  return fullBoard;
};
