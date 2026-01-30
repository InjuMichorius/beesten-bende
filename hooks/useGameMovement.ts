import { useCallback, useState } from "react";

const DICE_ICONS = [
  "dice-one",
  "dice-two",
  "dice-three",
  "dice-four",
  "dice-five",
  "dice-six",
];

export const useGameMovement = (
  board: any[],
  setPlayers: any,
  turn: number,
) => {
  const [isRolling, setIsRolling] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [diceIcon, setDiceIcon] = useState("dice");

  const animateMovement = useCallback(
    (
      steps: number,
      scrollToTile: (pos: number) => void,
      onComplete: (finalPos: number) => void,
    ) => {
      // Als we 0 stappen moeten zetten, zijn we direct klaar
      if (steps === 0) {
        onComplete(0); // We gaan ervan uit dat we op de huidige plek blijven
        return;
      }

      setIsMoving(true);
      let remaining = Math.abs(steps);
      const direction = steps > 0 ? 1 : -1;
      let latestPos = 0;

      const interval = setInterval(() => {
        setPlayers((prev: any[]) => {
          const newPlayers = [...prev];
          let newPos = newPlayers[turn].pos + direction;

          // Grenzen bewaken: niet voorbij de finish, niet vóór de start
          if (newPos >= board.length) newPos = board.length - 1;
          if (newPos < 0) newPos = 0;

          newPlayers[turn] = { ...newPlayers[turn], pos: newPos };
          latestPos = newPos;
          scrollToTile(newPos);
          return newPlayers;
        });

        remaining--;
        if (remaining <= 0) {
          clearInterval(interval);
          setTimeout(() => {
            setIsMoving(false);
            onComplete(latestPos);
          }, 300);
        }
      }, 450);
    },
    [board.length, turn, setPlayers],
  );

  // Nieuwe functie die het rollen EN bewegen combineert
  const rollAndMove = (
    scrollToTile: (pos: number) => void,
    onLanded: (finalPos: number) => void,
  ) => {
    if (isRolling || isMoving) return;

    setIsRolling(true);
    let i = 0;
    const interval = setInterval(() => {
      setDiceIcon(DICE_ICONS[Math.floor(Math.random() * 6)]);
      if (++i >= 10) {
        clearInterval(interval);
        const roll = Math.floor(Math.random() * 6) + 1;
        setDiceIcon(DICE_ICONS[roll - 1]);
        setIsRolling(false);

        // Korte pauze na de roll voor het effect, dan bewegen
        setTimeout(() => {
          animateMovement(roll, scrollToTile, onLanded);
        }, 500);
      }
    }, 100);
  };

  return { isRolling, isMoving, diceIcon, rollAndMove, animateMovement };
};
