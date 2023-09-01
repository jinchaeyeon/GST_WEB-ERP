import { type CSSProperties, type FC } from "react";
import { DragPreviewImage, useDrag } from "react-dnd";
import logo from "../../img/logo.png";

const knightStyle: CSSProperties = {
  fontSize: 1,
  fontWeight: "bold",
  cursor: "move",
};
export const ItemTypes = {
  KNIGHT: "knight",
};

export const Knight: FC = () => {
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
      />
    </>
  );
};
