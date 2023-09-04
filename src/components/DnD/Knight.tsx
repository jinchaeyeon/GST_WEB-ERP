import { type CSSProperties, type FC } from "react";
import { DragPreviewImage, useDrag } from "react-dnd";
import logo from "../../img/logo.png";
import { Layout } from "./Layout";

const knightStyle: CSSProperties = {
  fontSize: 1,
  fontWeight: "bold",
  cursor: "move",
};
export const ItemTypes = {
  KNIGHT: "knight",
};

export interface KnightProps {
  layout: Layout;
  x: number;
  y: number;
  list: any[];
}

export const Knight: FC<KnightProps> = ({layout, x, y, list}) => {
  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: ItemTypes.KNIGHT,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    []
  );

  return (
    <>
      <DragPreviewImage connect={preview} src={logo} />
      <div
        ref={drag}
        style={{
          ...knightStyle,
          opacity: isDragging ? 0.5 : 1,
          backgroundColor: "black",
          height: "100%"
        }}
        onMouseDown={() => {
          for (var i = 0; i < list[0].length; i++) {
            if(x == list[i][0] && y == list[i][1]) {
              layout.moveKnight(list[i][0], list[i][1], list[i][2]);
            }
          }
        }}
      />
    </>
  );
};
