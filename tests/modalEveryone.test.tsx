import { act, fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import GameScreen from "../app/game";

// 1. Mock icons
jest.mock("@expo/vector-icons", () => {
  return {
    FontAwesome5: "FontAwesome5",
  };
});

// 2. Mock Config: Speler 1 moet 1 gooien om op index 1 te landen
jest.mock("../constants/GameConfig", () => ({
  BOARD_TILES: [
    { id: 0, name: "Start", actionType: "none" },
    {
      id: 1,
      name: "Slechte voorbereiding",
      icon: "battery-quarter",
      description:
        "De speler met de laagste telefoonbatterij percentage neemt 5 slokken.",
      sipCount: 5,
      actionType: "everyone",
      moveAmount: 0,
    },
  ],
}));

// 3. Mock 2 spelers
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({
    players: JSON.stringify([
      { id: "1", name: "Speler 1", pos: 0, sips: 0 },
      { id: "2", name: "Speler 2", pos: 0, sips: 0 },
    ]),
  }),
}));

jest.useFakeTimers();

describe("Slokken Uitdelen Logica", () => {
  beforeEach(() => {
    // Forceer een worp van 1: (0.1 * 6) + 1 = 1.6 -> floor = 1
    jest.spyOn(global.Math, "random").mockReturnValue(0.1);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllTimers();
  });

  it("moet 5 slokken toevoegen aan Speler 2 als Speler 1 deze selecteert", async () => {
    render(<GameScreen />);

    // 1. Gooi dobbelsteen
    const diceButton = screen.getByTestId("dice-button");
    fireEvent.press(diceButton);

    // 2. Wacht op animatie + de nieuwe 4 seconden delay voor de modal
    await act(async () => {
      // 1s dobbelsteen + 0.4s stap + 4s modal delay + buffer
      jest.advanceTimersByTime(6000);
    });

    // 3. Controleer of de modal er is
    expect(screen.getByText(/Slechte voorbereiding/i)).toBeTruthy();

    // 4. Klik op Speler 2 in de lijst van slachtoffers (ActionType: everyone, dus hij staat erbij)
    const victimBtn = screen.getByTestId("pick-victim-Speler 2");
    fireEvent.press(victimBtn);

    // 5. Klik op de bevestig knop (de tekst bevat "Speler 2 neemt 5 slokken")
    // We kunnen de knop vinden op basis van de tekst die je getButtonText() genereert
    const confirmBtn = screen.getByText(/Speler 2 neemt 5 slokken/i);
    fireEvent.press(confirmBtn);

    // 6. De modal moet sluiten
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    expect(screen.queryByText(/Slechte voorbereiding/i)).toBeNull();

    // 7. VERIFICATIE: Heeft Speler 2 nu 5 slokken?
    // We kijken in de TurnInfo of in de lijst (afhankelijk van je UI)
    // Jouw GameScreen toont de slokken van de CURRENT player in de sidePanel.
    // Omdat de beurt direct naar Speler 2 gaat na onClose/Confirm,
    // kunnen we daar checken:
    const sipDisplay = screen.getByText(/5 slokken/i);
    expect(sipDisplay).toBeTruthy();

    // Of specifieker: controleren of de naam Speler 2 nu in beeld is als huidige beurt
    expect(screen.getByText("Speler 2")).toBeTruthy();
  });
});
