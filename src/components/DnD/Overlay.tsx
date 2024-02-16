import type { FC } from "react";

export enum OverlayType {
  LegalMoveHover = "Legal",
}
export interface OverlayProps {
  type: OverlayType;
}

export const Overlay: FC<OverlayProps> = ({ type }) => {
  const color = getOverlayColor(type);
  return (
    <div
      className="overlay"
      role={type}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: "100%",
        width: "100%",
        zIndex: 1,
        opacity: 0.5,
        backgroundColor: color,
      }}
    />
  );
};

function getOverlayColor(type: OverlayType): string {
  switch (type) {
    case OverlayType.LegalMoveHover:
      return "grey";
  }
}
