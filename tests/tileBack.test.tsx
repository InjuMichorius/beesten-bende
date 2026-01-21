import {
  act,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react-native";
import React from "react";
import GameScreen from "../app/game";

// 1. Mock icons
jest.mock("@expo/vector-icons", () => {
  return {
    FontAwesome5: "FontAwesome5",
  };
});

// 2. Mock Config
jest.mock("../constants/GameConfig", () => ({
  BOARD_TILES: [
    { id: 0, name: "Start", actionType: "none" },
    { id: 1, name: "T1", actionType: "none" },
    { id: 2, name: "T2", actionType: "none" },
    { id: 3, name: "T3", actionType: "none" },
    { id: 4, name: "T4", actionType: "none" }, // Expected target
    { id: 5, name: "T5", actionType: "none" },
    {
      id: 6,
      name: "Neem 2 stappen terug",
      icon: "arrow-left",
      description: "Helaas je moet 2 stappen teruglopen.",
      sipCount: 0,
      actionType: "modal",
      moveAmount: -2,
    },
  ],
}));

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({
    players: JSON.stringify([{ id: "1", name: "speler-1", pos: 0, sips: 0 }]),
  }),
}));

jest.useFakeTimers();

describe("Game Movement Logica - Stap Terug", () => {
  beforeEach(() => {
    // Force roll 6
    jest.spyOn(global.Math, "random").mockReturnValue(0.9);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllTimers();
  });

  it("moet van index 6 naar index 4 verplaatsen na de '2 stappen terug' tegel", async () => {
    render(<GameScreen />);

    // 1. Roll the dice
    const diceButton = screen.getByTestId("dice-button");
    fireEvent.press(diceButton);

    // 2. Wait for movement to tile 6
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    // Verify player is on Tile 6 before accepting
    const tile6 = screen.getByTestId("tile-6");
    expect(within(tile6).getByTestId("player-avatar-speler-1")).toBeTruthy();

    // 3. Close the modal
    const closeBtn = screen.getByTestId("close-modal");
    fireEvent.press(closeBtn);

    // 4. Wait for the moveAmount animation (-2 steps)
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    // 5. Final Verification: Check tile 4
    const tile4 = screen.getByTestId("tile-4");

    // This confirms "speler-1" is now physically inside "tile-4"
    expect(within(tile4).getByTestId("player-avatar-speler-1")).toBeTruthy();

    // Also verify they are gone from tile 6
    expect(
      within(screen.getByTestId("tile-6")).queryByTestId(
        "player-avatar-speler-1",
      ),
    ).toBeNull();
  });
});
