import { useState } from "react";
import { Piece } from "./piece";

type PieceT = {
  color: "black" | "white" | "empty";
  type: "rook" | "knight" | "bishop" | "queen" | "king" | "pawn" | "empty";
};

function initBoard(): PieceT[][] {
  return [
    [
      { color: "black", type: "rook" },
      { color: "black", type: "knight" },
      { color: "black", type: "bishop" },
      { color: "black", type: "queen" },
      { color: "black", type: "king" },
      { color: "black", type: "bishop" },
      { color: "black", type: "knight" },
      { color: "black", type: "rook" },
    ],
    Array(8).fill({ color: "black", type: "pawn" }), // Black Pawns
    Array(8).fill({ color: "empty", type: "empty" }), // Empty spaces
    Array(8).fill({ color: "empty", type: "empty" }), // Empty spaces
    Array(8).fill({ color: "empty", type: "empty" }), // Empty spaces
    Array(8).fill({ color: "empty", type: "empty" }), // Empty spaces
    Array(8).fill({ color: "white", type: "pawn" }), // White Pawns
    [
      { color: "white", type: "rook" },
      { color: "white", type: "knight" },
      { color: "white", type: "bishop" },
      { color: "white", type: "queen" },
      { color: "white", type: "king" },
      { color: "white", type: "bishop" },
      { color: "white", type: "knight" },
      { color: "white", type: "rook" },
    ],
  ];
}

const emptyPiece: PieceT = { color: "empty", type: "empty" };

export const Board = () => {
  const [playerTurn, setPlayerTurn] = useState<"white" | "black">("white");
  const [selectedPiece, setSelectedPiece] = useState<PieceT>({
    color: "empty",
    type: "empty",
  });

  const [highlightedCells, setHighlightedCells] = useState<boolean[][]>(
    Array(8)
      .fill(null)
      .map(() => Array(8).fill(false))
  );

  const toggleCell = (r: number, c: number) => {
    setHighlightedCells(() => {
      const newCells = Array(8)
        .fill(null)
        .map(() => Array(8).fill(false));

      newCells[r][c] = true;
      return newCells;
    });
  };

  const toggleCells = (r: number[], c: number[]) => {
    setHighlightedCells(() => {
      const newCells = Array(8)
        .fill(null)
        .map(() => Array(8).fill(false));

      r.map((row, idx) => {
        newCells[row][c[idx]] = true; // go over all entries and set to true
      });

      return newCells;
    });
  };

  const [board, setBoard] = useState<PieceT[][]>(initBoard());

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">It is now {playerTurn}'s turn</h1>
      <h2 className="text-2xl mb-4 flex flex-row justify-center items-center ">
        Selected Piece:
        <Piece color={selectedPiece.color} type={selectedPiece.type} />
      </h2>
      <div className="grid grid-cols-8 grid-rows-8">
        {/* Render Board Here */}
        {board.map((row, r) =>
          row.map((piece, c) => {
            const isHighlighted = highlightedCells[r][c];
            const class_name =
              (r + c) % 2 === 0
                ? isHighlighted
                  ? "bg-blue-200"
                  : "bg-zinc-50"
                : isHighlighted
                ? "bg-blue-800"
                : "bg-zinc-700";

            return (
              <div
                className={
                  "h-16 w-16 flex items-center justify-center " + class_name
                }
                key={`${r}-${c}`}
                onClick={() => {
                  piece.color === playerTurn && setSelectedPiece(piece);
                  piece.color === playerTurn && toggleCell(r, c);
                }}
              >
                <Piece color={piece.color} type={piece.type} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
