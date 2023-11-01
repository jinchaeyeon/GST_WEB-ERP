import type { FC, ReactNode } from "react";

export interface SquareProps {
  children?: ReactNode;
}

const squareStyle = {
  width: "100%",
  height: "100%",
};

export const SquareRead: FC<SquareProps> = ({ children }) => {
  const backgroundColor = "white";
  const color = "black";
  return (
    <div
      style={{
        ...squareStyle,
        color,
        backgroundColor,
      }}
    >
      {children}
    </div>
  );
};
