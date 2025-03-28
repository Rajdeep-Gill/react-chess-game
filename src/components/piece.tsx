
interface PieceProps {
  color: "black" | "white" | "empty";
  type: "rook" | "knight" | "bishop" | "queen" | "king" | "pawn" | "empty";
}

export const Piece = ({ color, type }: PieceProps) => {
  if (color === "empty" && type === "empty") {
    return <div className="h-24 w-24"></div>;
  }

  return <img src={`./${color.charAt(0)}${type}.svg`} width={96} height={96}/>;
};
