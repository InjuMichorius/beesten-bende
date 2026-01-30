import { ActionType } from "./types";

export interface Tile {
  id: number;
  name: string;
  icon: string;
  description?: string;
  actionType: ActionType;
  sipCount?: number;
  moveAmount?: number;
  occurrence?: number;
}

export const BOARD_TILES: Tile[] = [
  {
    id: 1,
    name: "Item!",
    icon: "land-mine-on",
    description:
      "Je hebt een landmijn gevonden! Leg deze voor het rollen van de dobbelsteen in om een valstrik te zetten voor andere spelers",
    actionType: "modal",
    occurrence: 30,
  },
];

// export const BOARD_TILES: Tile[] = [
//   {
//     id: 1,
//     name: "Item!",
//     icon: "land-mine-on",
//     description:
//       "Je hebt een landmijn gevonden! Leg deze voor het rollen van de dobbelsteen in om een valstrik te zetten voor andere spelers",
//     actionType: "modal",
//     occurrence: 5,
//   },
//   {
//     id: 2,
//     name: "Ga 2 stappen vooruit",
//     icon: "arrow-right",
//     description: "Hoera! Je mag 2 stappen vooruitlopen.",
//     actionType: "modal",
//     moveAmount: 2,
//     occurrence: 2,
//   },
//   {
//     id: 3,
//     name: "Neem 2 stappen terug",
//     icon: "arrow-left",
//     description: "Helaas! Je moet 2 stappen teruglopen.",
//     actionType: "modal",
//     moveAmount: -2,
//     occurrence: 4,
//   },
//   {
//     id: 4,
//     name: "Neem 4 stappen vooruit",
//     icon: "ex-double-right",
//     description: "Hoera! Je mag 4 stappen vooruitlopen.",
//     actionType: "modal",
//     moveAmount: 4,
//     occurrence: 2,
//   },
//   {
//     id: 5,
//     name: "Neem 4 stappen terug",
//     icon: "ex-double-left",
//     description: "Helaas! Je moet 4 stappen teruglopen.",
//     actionType: "modal",
//     moveAmount: -4,
//     occurrence: 2,
//   },
//   {
//     id: 6,
//     name: "Categorieën",
//     icon: "layer-group",
//     description:
//       "Jij bedenkt een categorie. Om de beurt noemen jullie een woord dat hiermee te maken heeft. De speler die in herhaling treed of niks weet neemt 5 slokken",
//     sipCount: 5,
//     actionType: "everyone",
//   },
//   {
//     id: 7,
//     name: "Spraakhandicap",
//     icon: "comment",
//     description:
//       "Al je zinnen moeten eindigen met het woord 'banaan' tot je volgende beurt. Neem 1 slok als je dit vergeet.",
//     actionType: "modal",
//   },
//   {
//     id: 8,
//     name: "Even goede vrienden",
//     icon: "handshake",
//     description: "Wie als laatste een handdruk geeft drinkt 5 slokken.",
//     sipCount: 5,
//     actionType: "everyone",
//   },
//   {
//     id: 9,
//     name: "Potje vingeren",
//     icon: "fingerprint",
//     description: "Speel een potje vingeren. De verliezer drinkt 5 slokken.",
//     sipCount: 5,
//     actionType: "everyone",
//   },
//   {
//     id: 10,
//     name: "Sexisitisch geneuzel",
//     icon: "mars",
//     description:
//       "Alle mannen drinken 3 slokken. Zijn er geen mannen? Wat saai. Iedereen drinkt 3 slokken",
//     sipCount: 3,
//     actionType: "everyone",
//   },
//   {
//     id: 11,
//     name: "Sexisitisch geneuzel",
//     icon: "venus",
//     description:
//       "Alle vrouwen drinken 3 slokken. Zijn er geen vrouwen? Worstenfeestje dus. Iedereen drinkt 3 slokken",
//     sipCount: 3,
//     actionType: "everyone",
//   },
//   {
//     id: 12,
//     name: "Biertonnetje rond",
//     icon: "weight-hanging",
//     description:
//       "De zwaarste speler kan het meest hebben. Drink daarom 3 slokken.",
//     sipCount: 3,
//     actionType: "everyone",
//   },
//   {
//     id: 13,
//     name: "Armpje drukken?",
//     icon: "dumbbell",
//     description:
//       "De sterkste speler mag 3 slokken uitdelen aan iedereen. Kniel!!",
//     sipCount: 3,
//     actionType: "everyone",
//   },
//   {
//     id: 14,
//     name: "Drink maatje!",
//     icon: "user-plus",
//     description:
//       "Je mag iemand uitkiezen die vanaf nu al je slokken meedrinkt.",
//     actionType: "modal",
//   },
//   {
//     id: 15,
//     name: "Item!",
//     icon: "ex-sword",
//     description:
//       "Je hebt een zwaard gevonden! Gebruik dit op spelers in de buurt 3 slokken te laten drinken.",
//     actionType: "modal",
//     occurrence: 5,
//   },
//   {
//     id: 16,
//     name: "Item!",
//     icon: "ex-bow-arrow",
//     description:
//       "Je hebt een boog met pijlen gevonden! Gebruik dit op spelers in de buurt 3 slokken te laten drinken.",
//     actionType: "modal",
//     occurrence: 5,
//   },
//   {
//     id: 17,
//     name: "Drink je glas in 20 seconden leeg!",
//     icon: "stopwatch-20",
//     description: "De tijd gaat nu in",
//     actionType: "modal",
//     occurrence: 1,
//   },
//   {
//     id: 18,
//     name: "Slechte voorbereiding",
//     icon: "battery-quarter",
//     description:
//       "De speler met de laagste batterij percentage neemt 5 slokken.",
//     sipCount: 5,
//     actionType: "everyone",
//   },
//   {
//     id: 19,
//     name: "Goede voorbereiding",
//     icon: "battery-full",
//     description:
//       "De speler met de hoogste batterij percentage mag 5 slokken uitdelen",
//     sipCount: 5,
//     actionType: "everyone",
//   },
//   {
//     id: 20,
//     name: "Free will ouwe",
//     icon: "dove",
//     description:
//       "De laatste persoon die opstaat drinkt 4 slokken. Als jullie allemaal staan drinkt de laatste persoon die gaat zitten 4 slokken.",
//     sipCount: 4,
//     actionType: "everyone",
//   },
//   {
//     id: 21,
//     name: "Rijmtijd!",
//     icon: "earlybirds",
//     description:
//       "Jij verzint een woord. Om de beurt moeten jullie een woord noemen dat hierop rijmt. De speler die niets meer weet of in herhaling treed drinkt 4 slokken.",
//     sipCount: 4,
//     actionType: "everyone",
//   },
//   {
//     id: 22,
//     name: "Traktatie!",
//     icon: "cake-candles",
//     description:
//       "De persoon die binnenkort jarig is trakteert en mag 4 slokken uitdelen.",
//     sipCount: 4,
//     actionType: "give",
//   },
//   {
//     id: 23,
//     name: "Waterval!",
//     icon: "ex-waterfall",
//     description:
//       "Jij zet de waterval in gang. Iedereen begint met drinken en mag pas stoppen als de persoon rechts van hen stopt.",
//     actionType: "modal",
//   },
//   {
//     id: 24,
//     name: "Handicap!",
//     icon: "wheelchair-move",
//     description:
//       "Houd je ellebogen de komende 5 minuten tegen je zij aan. Drinken moet nu zonder je armen te strekken. 2 slokken als je dit vergeet.",
//     actionType: "modal",
//   },
//   {
//     id: 25,
//     name: "Stevig beet",
//     icon: "anchor",
//     description:
//       "Je mag je glas niet meer op tafel zetten. Hij moet in je hand blijven tot hij leeg is. 2 slokken als je dit vergeet.",
//     actionType: "modal",
//   },
//   {
//     id: 26,
//     name: "Casually late",
//     icon: "clock",
//     description: "De speler die als laatste is gekomen drinkt 3 slokken.",
//     sipCount: 3,
//     actionType: "everyone",
//   },
//   {
//     id: 27,
//     name: "Vroege vogel",
//     icon: "clock",
//     description: "De speler die als eerste is gekomen mag 3 slokken uitdelen.",
//     sipCount: 3,
//     actionType: "everyone",
//   },
//   // Add more tiles as needed
// ];
