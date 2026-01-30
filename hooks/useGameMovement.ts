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
      if (steps === 0) {
        onComplete(0);
        return;
      }

      setIsMoving(true);
      let stepsTaken = 0;
      const totalSteps = Math.abs(steps);
      const direction = steps > 0 ? 1 : -1;

      const interval = setInterval(() => {
        let currentPos = 0;
        setPlayers((prev: any[]) => {
          const newPlayers = [...prev];
          const p = { ...newPlayers[turn] };
          let nPos = p.pos + direction;
          if (nPos >= board.length) nPos = board.length - 1;
          if (nPos < 0) nPos = 0;
          p.pos = nPos;
          newPlayers[turn] = p;
          currentPos = nPos;
          scrollToTile(nPos);
          return newPlayers;
        });

        stepsTaken++;
        if (stepsTaken >= totalSteps) {
          clearInterval(interval);
          setTimeout(() => {
            setIsMoving(false);
            onComplete(currentPos);
          }, 300);
        }
      }, 350);
    },
    [board.length, turn, setPlayers],
  );

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
        setTimeout(() => animateMovement(roll, scrollToTile, onLanded), 400);
      }
    }, 80);
  };

  return { isRolling, isMoving, diceIcon, rollAndMove, animateMovement };
};
