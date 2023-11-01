import { type FC, type ReactNode } from "react";

import { SquareRead } from "./SquareRead";

export const ItemTypes = {
  KNIGHT: "knight",
};

export interface BoardSquareProps {
  x: number;
  y: number;
  children?: ReactNode;
}

export const LayoutSquareRead: FC<BoardSquareProps> = ({
  x,
  y,
  children,
}: BoardSquareProps) => {
  return (
    <div
      data-testid={`(${x},${y})`}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      <SquareRead>{children}</SquareRead>
    </div>
  );
};
