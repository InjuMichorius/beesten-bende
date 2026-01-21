export const COLORS = {
  background: "#000000",
  card: "#1C1C1E",
  primary: "#32ADE6",
  danger: "#FF453A",
  success: "#34C759",
};

export const ITEMS = {
  LANDMINE: { id: "mine", name: "Landmijn", color: "#FF9500", icon: "bomb" },
  LIGHTNING: { id: "zap", name: "Bliksem", color: "#FFD60A", icon: "zap" },
};

export const BOARD_TILES = [
  {
    id: 1,
    icon: "flag-checkered",
    actionType: "modal",
  },
  // Tested tiles
  {
    id: 2,
    name: "Neem 2 stappen terug",
    icon: "arrow-left",
    description: "Helaas je moet 2 stappen teruglopen.",
    sipCount: 0,
    actionType: "modal",
    moveAmount: -2,
  },
  // Add more tiles as needed
  {
    id: 3,
    name: "Slechte voorbereiding",
    icon: "battery-quarter",
    description:
      "De speler met de laagste telefoonbatterij percentage neemt 5 slokken.",
    sipCount: 5,
    actionType: "everyone",
    moveAmount: 0,
  },
];
