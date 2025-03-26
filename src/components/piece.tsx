
interface PieceProps {
  color: "black" | "white" | "empty";
  type: "rook" | "knight" | "bishop" | "queen" | "king" | "pawn" | "empty";
}

export const Piece = ({ color, type }: PieceProps) => {
  if (color === "empty" && type === "empty") {
    return <div className="h-16 w-16"></div>;
  }

  return <img src={`./${color.charAt(0)}${type}.svg`} />;
};
