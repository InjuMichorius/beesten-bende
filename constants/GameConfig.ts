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
  {
    id: 2,
    name: "Ga 2 stappen vooruit",
    icon: "arrow-right",
    description: "Hoera! Je mag 2 stappen vooruitlopen.",
    actionType: "modal",
    moveAmount: 2,
  },
  {
    id: 3,
    name: "Neem 2 stappen terug",
    icon: "arrow-left",
    description: "Helaas je moet 2 stappen teruglopen.",
    actionType: "modal",
    moveAmount: -2,
  },
  {
    id: 4,
    name: "Slechte voorbereiding",
    icon: "battery-quarter",
    description:
      "De speler met de laagste batterij percentage neemt 5 slokken.",
    sipCount: 5,
    actionType: "everyone",
  },
  {
    id: 5,
    name: "Goede voorbereiding",
    icon: "battery-full",
    description:
      "De speler met de hoogste batterij percentage mag 5 slokken uitdelen",
    sipCount: 5,
    actionType: "everyone",
  },
  {
    id: 6,
    name: "Categorieën",
    icon: "layer-group",
    description:
      "Onderdelen in een computer. De speler die in herhaling treed neemt 5 slokken",
    sipCount: 5,
    actionType: "everyone",
  },
  {
    id: 7,
    name: "Spraakhandicap",
    icon: "comment",
    description:
      "Al je zinnen moeten eindigen met het woord 'banaan' tot je volgende beurt. Neem 1 slok als je dit vergeet.",
    actionType: "modal",
  },
  {
    id: 8,
    name: "Even goede vrienden",
    icon: "handshake",
    description: "Wie als laatste een handdruk geeft drinkt 5 slokken.",
    sipCount: 5,
    actionType: "everyone",
  },
  {
    id: 9,
    name: "Potje vingeren",
    icon: "fingerprint",
    description: "Speel een potje vingeren. De verliezer drinkt 5 slokken.",
    sipCount: 5,
    actionType: "everyone",
  },
  // Add more tiles as needed
];
