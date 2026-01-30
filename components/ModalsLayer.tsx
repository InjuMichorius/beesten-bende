import React, { useEffect, useState } from "react";
import { ChallengeModal } from "./ChallengeModal";
import { EndGameOverlay } from "./EndGameOverlay";

interface ModalsLayerProps {
  showChallenge: boolean;
  showEndGame: boolean;
  currentTile: any;
  players: any[];
  currentPlayer: any;
  onConfirmChallenge: (victims: string[]) => void;
  onCloseChallenge: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export const ModalsLayer = ({
  showChallenge,
  showEndGame,
  currentTile,
  players,
  currentPlayer,
  onConfirmChallenge,
  onCloseChallenge,
  onRestart,
  onExit,
}: ModalsLayerProps) => {
  // Local state to track who is selected in the modal
  const [selectedVictimIds, setSelectedVictimIds] = useState<string[]>([]);

  // Reset selection when the modal opens/closes
  useEffect(() => {
    if (!showChallenge) {
      setSelectedVictimIds([]);
    }
  }, [showChallenge]);

  const handleToggleVictim = (id: string) => {
    setSelectedVictimIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <>
      {showChallenge && currentTile && (
        <ChallengeModal
          tile={currentTile}
          players={players}
          currentPlayer={currentPlayer}
          selectedVictimIds={selectedVictimIds} // Now provided
          onToggleVictim={handleToggleVictim} // Now provided
          onConfirm={() => onConfirmChallenge(selectedVictimIds)}
          onClose={onCloseChallenge}
        />
      )}

      {showEndGame && (
        <EndGameOverlay
          players={players}
          onRestart={onRestart}
          onPickNew={onExit}
        />
      )}
    </>
  );
};
