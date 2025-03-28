import { useState, DragEvent } from "react";
import { Piece } from "./piece";
import { renderToReadableStream } from "react-dom/server";

type PieceT = {
  color: "black" | "white" | "empty";
  type: "rook" | "knight" | "bishop" | "queen" | "king" | "pawn" | "empty";
  hasMoved: boolean;
  location: [number, number];
};

function initBoard(): PieceT[][] {
  return [
    [
      createPiece({ color: "black", type: "rook", location: [0, 0] }),
      createPiece({ color: "black", type: "knight", location: [0, 1] }),
      createPiece({ color: "black", type: "bishop", location: [0, 2] }),
      createPiece({ color: "black", type: "queen", location: [0, 3] }),
      createPiece({ color: "black", type: "king", location: [0, 4] }),
      createPiece({ color: "black", type: "bishop", location: [0, 5] }),
      createPiece({ color: "black", type: "knight", location: [0, 6] }),
      createPiece({ color: "black", type: "rook", location: [0, 7] }),
    ],
    Array(8)
      .fill(null)
      .map((_, idx) =>
        createPiece({ color: "black", type: "pawn", location: [1, idx] })
      ), // Black Pawns
    Array(8)
      .fill(null)
      .map((_, idx) => createPiece({ location: [2, idx] })), // Empty Rows
    Array(8)
      .fill(null)
      .map((_, idx) => createPiece({ location: [3, idx] })), // Empty Rows
    Array(8)
      .fill(null)
      .map((_, idx) => createPiece({ location: [4, idx] })), // Empty Rows
    Array(8)
      .fill(null)
      .map((_, idx) => createPiece({ location: [5, idx] })), // Empty Rows
    Array(8)
      .fill(null)
      .map((_, idx) =>
        createPiece({ color: "white", type: "pawn", location: [6, idx] })
      ), // White Pawns
    [
      createPiece({ color: "white", type: "rook", location: [7, 0] }),
      createPiece({ color: "white", type: "knight", location: [7, 1] }),
      createPiece({ color: "white", type: "bishop", location: [7, 2] }),
      createPiece({ color: "white", type: "queen", location: [7, 3] }),
      createPiece({ color: "white", type: "king", location: [7, 4] }),
      createPiece({ color: "white", type: "bishop", location: [7, 5] }),
      createPiece({ color: "white", type: "knight", location: [7, 6] }),
      createPiece({ color: "white", type: "rook", location: [7, 7] }),
    ],
  ];
}

function getPieceAtLocation(
  board: PieceT[][],
  location: [number, number]
): PieceT | null {
  const [row, col] = location;
  if (row >= 0 && row < 8 && col >= 0 && col < 8) {
    return board[row][col];
  }
  return null;
}

function getQueenMoves(piece: PieceT, board: PieceT[][]): [number, number][] {
  let moves: [number, number][] = [];
  const directions = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0], // Horizontal and vertical
    [1, 1],
    [-1, -1],
    [1, -1],
    [-1, 1], // Diagonal
  ];

  directions.forEach(([dr, dc]) => {
    let i = 1;
    while (i < 8) {
      const newRow = piece.location[0] + dr * i;
      const newCol = piece.location[1] + dc * i;

      if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break; // out of bounds

      const pieceAtLocation = getPieceAtLocation(board, [newRow, newCol]);
      if (pieceAtLocation?.color === piece.color) break; // our own piece

      moves.push([newRow, newCol]);

      if (
        pieceAtLocation?.color !== "empty" &&
        pieceAtLocation?.color !== piece.color
      )
        break; // enemy piece - can't go further

      i++; // next cell
    }
  });

  return moves;
}

function getKnightMoves(piece: PieceT, board: PieceT[][]): [number, number][] {
  let moves: [number, number][] = [];

  const [r, c] = piece.location;
  const possibleMoves: [number, number][] = [
    [r - 2, c - 1],
    [r - 2, c + 1],
    [r + 2, c - 1],
    [r + 2, c + 1],
    [r - 1, c - 2],
    [r - 1, c + 2],
    [r + 1, c - 2],
    [r + 1, c + 2],
  ];

  possibleMoves.map((move) => {
    if (move[0] >= 0 && move[0] < 8 && move[1] >= 0 && move[1] < 8) {
      const pieceAtLocation = getPieceAtLocation(board, move);
      if (pieceAtLocation?.color !== piece.color) {
        moves.push(move); // only add if empty or enemy piece
      }
    }
  });

  return moves;
}

function getBishopMoves(piece: PieceT, board: PieceT[][]): [number, number][] {
  let moves: [number, number][] = [];

  const directions: [number, number][] = [
    [1, 1],
    [-1, -1],
    [1, -1],
    [-1, 1], // Diagonal
  ];

  directions.forEach(([dr, dc]) => {
    let i = 1;
    while (i < 8) {
      const newRow = piece.location[0] + dr * i;
      const newCol = piece.location[1] + dc * i;

      if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break; // out of bounds

      const pieceAtLocation = getPieceAtLocation(board, [newRow, newCol]);
      if (pieceAtLocation?.color === piece.color) break; // our own piece

      moves.push([newRow, newCol]);

      if (
        pieceAtLocation?.color !== "empty" &&
        pieceAtLocation?.color !== piece.color
      )
        break; // enemy piece - can't go further

      i++; // next cell
    }
  });

  return moves;
}

function getRookMoves(piece: PieceT, board: PieceT[][]): [number, number][] {
  let moves: [number, number][] = [];

  const directions: [number, number][] = [
    [1, 0],
    [-1, 0],
    [0, -1],
    [0, 1], // Horizontal and vertical
  ];

  directions.forEach(([dr, dc]) => {
    let i = 1;
    while (i < 8) {
      const newRow = piece.location[0] + dr * i;
      const newCol = piece.location[1] + dc * i;

      if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break; // out of bounds

      const pieceAtLocation = getPieceAtLocation(board, [newRow, newCol]);
      if (pieceAtLocation?.color === piece.color) break; // our own piece

      moves.push([newRow, newCol]);

      if (
        pieceAtLocation?.color !== "empty" &&
        pieceAtLocation?.color !== piece.color
      )
        break; // enemy piece - can't go further

      i++; // next cell
    }
  });

  return moves;
}

function getKingMoves(piece: PieceT, board: PieceT[][]): [number, number][] {
  let moves: [number, number][] = [];
  const [r1, c1] = piece.location;
  const possibleMoves: [number, number][] = [
    [r1 - 1, c1 - 1],
    [r1 - 1, c1],
    [r1 - 1, c1 + 1],
    [r1, c1 - 1],
    [r1, c1 + 1],
    [r1 + 1, c1 - 1],
    [r1 + 1, c1],
    [r1 + 1, c1 + 1],
  ];

  possibleMoves.map((move) => {
    if (move[0] >= 0 && move[0] < 8 && move[1] >= 0 && move[1] < 8) {
      const pieceAtLocation = getPieceAtLocation(board, move);
      if (pieceAtLocation?.color !== piece.color) {
        moves.push(move); // only add if empty or enemy piece
      }
    }
  });

  return moves;
}

function getPawnMoves(piece: PieceT, board: PieceT[][]): [number, number][] {
  let moves: [number, number][] = [];
  const dir = piece.color === "white" ? -1 : 1;
  const otherColor = piece.color === "white" ? "black" : "white";
  const [r1, c1] = piece.location;
  if (!piece.hasMoved) {
    if (getPieceAtLocation(board, [r1 + 2 * dir, c1])?.color === "empty") {
      moves.push([r1 + 2 * dir, c1]);
    }
  }
  if (getPieceAtLocation(board, [r1 + 1 * dir, c1])?.color === "empty") {
    moves.push([r1 + 1 * dir, c1]);
  }
  if (getPieceAtLocation(board, [r1 + 1 * dir, c1 - 1])?.color === otherColor) {
    moves.push([r1 + 1 * dir, c1 - 1]);
  }
  if (getPieceAtLocation(board, [r1 + 1 * dir, c1 + 1])?.color === otherColor) {
    moves.push([r1 + 1 * dir, c1 + 1]);
  }

  return moves;
}

function isInCheck(board: PieceT[][], turn: "white" | "black"): boolean {
  // get all pieces of other team
  const other = turn === "white" ? "black" : "white";

  let other_pieces: PieceT[] = [];
  let king: PieceT | null = null;
  board.map((row_, _) => {
    row_.map((piece, _) => {
      if (piece.type !== "empty" && piece.color === other) {
        other_pieces.push(piece);
      }
      if (piece.type === "king" && piece.color === turn) {
        king = piece;
      }
    });
  });

  let inCheck = false;
  // get all possible moves of other team
  other_pieces.map((piece) => {
    const moves = getPossibleMoves(piece, board);
    moves.map((move) => {
      if (move[0] === king?.location[0] && move[1] === king?.location[1]) {
        inCheck = true;
      }
    });
  });

  return inCheck;
}

function getPossibleMoves(
  piece: PieceT,
  board: PieceT[][]
): [number, number][] {
  let allMoves: [number, number][] = [];
  if (piece.color === "empty") return allMoves;

  switch (piece.type) {
    case "pawn":
      return getPawnMoves(piece, board);
    case "rook":
      return getRookMoves(piece, board);
    case "knight":
      return getKnightMoves(piece, board);
    case "bishop":
      return getBishopMoves(piece, board);
    case "queen":
      return getQueenMoves(piece, board);
    case "king":
      return getKingMoves(piece, board);
  }

  return allMoves.filter(
    ([row, col]) => !(row === piece.location[0] && col === piece.location[1])
  );
}

function validMoves(piece: PieceT, board: PieceT[][]): [number, number][] {
  const moves = getPossibleMoves(piece, board);
  // Filter out moves that would leave the king in check

  return moves.filter((move) => {
    const [r, c] = move;

    // Deep copy of the board (ensuring each row and piece is separately copied)
    const newBoard = board.map((row) => row.map((p) => p));

    // Simulate the move
    newBoard[piece.location[0]][piece.location[1]] = createPiece({
      location: piece.location,
    }); // Remove the piece from old position
    newBoard[r][c] = { ...piece, location: [r, c], hasMoved: true }; // Place it in new position

    // Check if the move puts the king in check
    return !isInCheck(newBoard, piece.color as "white" | "black");
  });
}

function isCheckmate(board: PieceT[][], playerTurn: "white" | "black"): boolean {
  // First check if the king is in check
  console.log("Checking for checkmate", playerTurn);
  if (!isInCheck(board, playerTurn)) {
    return false;
  }

  // Get all pieces of the current player
  let pieces: PieceT[] = [];
  board.forEach((row) => {
    row.forEach((piece) => {
      if (piece.type !== "empty" && piece.color === playerTurn) {
        pieces.push(piece);
      }
    });
  });

  // Check if any piece has valid moves that can get out of check
  for (const piece of pieces) {
    const validMovesForPiece = validMoves(piece, board);
    if (validMovesForPiece.length > 0) {
      return false;
    }
  }

  return true;
}

function createPiece(piece: Partial<PieceT>): PieceT {
  return {
    color: "empty",
    type: "empty",
    location: [-1, -1],
    hasMoved: false,
    ...piece,
  };
}

const emptyPiece: PieceT = {
  color: "empty",
  type: "empty",
  hasMoved: false,
  location: [-1, -1],
};

export const Board = () => {
  const [playerTurn, setPlayerTurn] = useState<"white" | "black">("white");
  const [selectedPiece, setSelectedPiece] = useState<PieceT>(createPiece({}));
  const [moves, setMoves] = useState<[number, number][]>([]);
  const [highlightedCells, setHighlightedCells] = useState<boolean[][]>(
    Array(8)
      .fill(null)
      .map(() => Array(8).fill(false))
  );

  const [gameOver, setGameOver] = useState(false);

  const highlightCells = (piece: PieceT) => {
    const [r, c] = piece.location;

    if (moves.some((move) => move[0] === r && move[1] === c)) {
      const newBoard = board.map((row) =>
        row.map((p) => {
          if (p.location === selectedPiece.location) {
            return createPiece({ location: selectedPiece.location });
          }
          if (p.location[0] === r && p.location[1] === c) {
            const newPiece = createPiece({
              ...selectedPiece,
              location: [r, c],
              hasMoved: true,
            });
            return newPiece;
          }
          return p;
        })
      );

      // Update board first
      setBoard(newBoard);
      setSelectedPiece(createPiece({}));
      setMoves([]);
      setHighlightedCells(() =>
        Array(8)
          .fill(null)
          .map(() => Array(8).fill(false))
      );

      // Calculate next turn
      const nextTurn = playerTurn === "white" ? "black" : "white";

      // Check if the next player is in checkmate with the updated board
      if (isCheckmate(newBoard, nextTurn)) {
        setGameOver(true);
      }

      // Change turn
      setPlayerTurn(nextTurn);
      return;
    }

    if (piece.color === "empty") {
      setSelectedPiece(emptyPiece);
      setMoves([]);
      setHighlightedCells(() => {
        const newCells = Array(8)
          .fill(null)
          .map(() => Array(8).fill(false));
        return newCells;
      });
      return;
    }
    setSelectedPiece(piece);
    const possibleMoves = validMoves(piece, board);
    setMoves(possibleMoves);
    setHighlightedCells(() => {
      const newCells = Array(8)
        .fill(null)
        .map(() => Array(8).fill(false));

      possibleMoves.map((move) => {
        newCells[move[0]][move[1]] = true;
      });

      return newCells;
    });
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, piece: PieceT) => {
    if (piece.color === "empty" || piece.color !== playerTurn) {
      e.preventDefault();
      return;
    }

    setSelectedPiece(piece);
    const possibleMoves = validMoves(piece, board);
    setMoves(possibleMoves);
    setHighlightedCells(() => {
      const newCells = Array(8)
        .fill(null)
        .map(() => Array(8).fill(false));
      possibleMoves.map((move) => {
        newCells[move[0]][move[1]] = true;
      });
      return newCells;
    });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, r: number, c: number) => {
    e.preventDefault();
    if (moves.some((move) => move[0] === r && move[1] === c)) {
      const newBoard = board.map((row) =>
        row.map((p) => {
          if (
            p.location[0] === selectedPiece.location[0] &&
            p.location[1] === selectedPiece.location[1]
          ) {
            return createPiece({ location: selectedPiece.location });
          }
          if (p.location[0] === r && p.location[1] === c) {
            return createPiece({
              ...selectedPiece,
              location: [r, c],
              hasMoved: true,
            });
          }
          return p;
        })
      );
      setBoard(newBoard);
      // check if the next player is in checkmate
      if (isCheckmate(newBoard, playerTurn === "white" ? "black" : "white")) {
        setGameOver(true);
        return;
      }
      setSelectedPiece(createPiece({}));
      setMoves([]);
      setHighlightedCells(
        Array(8)
          .fill(null)
          .map(() => Array(8).fill(false))
      );
      setPlayerTurn((prev) => (prev === "white" ? "black" : "white"));
    }
  };

  const [board, setBoard] = useState<PieceT[][]>(initBoard());

  return (
    <div className="min-h-screen flex flex-col items-center py-12">
      {gameOver ? (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-lg max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-zinc-800">Game Over!</h1>
          <p className="text-2xl text-zinc-600">
            {playerTurn === "black" ? "White" : "Black"} won the game
          </p>
          <button
            onClick={() => {
              setBoard(initBoard());
              setGameOver(false);
              setHighlightedCells(() => {
                const newCells = Array(8)
                  .fill(null)
                  .map(() => Array(8).fill(false));
                return newCells;
              });
              setMoves([]);
              setSelectedPiece(createPiece({}));
              setPlayerTurn("white");
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                     transition-colors duration-200 font-semibold shadow-md"
          >
            Play Again
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-2">
          <div className="flex flex-col items-center space-y-4 bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-4xl font-bold text-zinc-800 capitalize">
              {playerTurn}'s Turn
            </h1>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="flex">
              {/* Left side rank numbers */}
              <div className="flex flex-col justify-around pr-2 font-semibold text-zinc-600">
                {[8, 7, 6, 5, 4, 3, 2, 1].map((num) => (
                  <div key={num} className="h-16 md:h-20 lg:h-24 flex items-center">
                    {num}
                  </div>
                ))}
              </div>

              <div>
                <div className="grid grid-cols-8 grid-rows-8 gap-0 border-2 border-zinc-800">
                  {board.map((row, r) =>
                    row.map((piece, c) => {
                      const isHighlighted = highlightedCells[r][c];
                      const class_name =
                        (r + c) % 2 === 0
                          ? isHighlighted
                            ? "bg-blue-200 hover:bg-blue-300"
                            : "bg-zinc-50 hover:bg-zinc-100"
                          : isHighlighted
                          ? "bg-blue-500 hover:bg-blue-600"
                          : "bg-zinc-500 hover:bg-zinc-600";

                      return (
                        <div
                          className={
                            "h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 flex items-center justify-center transition-colors duration-200 " +
                            class_name
                          }
                          key={`${r}-${c}`}
                          onClick={() => {
                            if (board[r][c].color === playerTurn) {
                              highlightCells(board[r][c]);
                            } else if (
                              moves.some((move) => move[0] === r && move[1] === c)
                            ) {
                              highlightCells(board[r][c]);
                            }
                          }}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, r, c)}
                        >
                          <div
                            draggable={piece.color === playerTurn}
                            onDragStart={(e) => handleDragStart(e, piece)}
                            className={`w-full h-full flex items-center justify-center 
                              ${piece.color === playerTurn ? "cursor-grab active:cursor-grabbing" : ""}`}
                          >
                            <Piece color={piece.color} type={piece.type} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Bottom file letters */}
                <div className="flex justify-around pt-2 font-semibold text-zinc-600">
                  {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((letter) => (
                    <div key={letter} className="w-16 md:w-20 lg:w-24 text-center">
                      {letter}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
