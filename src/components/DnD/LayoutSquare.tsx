import { useState, type FC, type ReactNode } from "react";
import { useDrop } from "react-dnd";

import type { Layout } from "./Layout";
import { Overlay, OverlayType } from "./Overlay";
import { Square } from "./Square";

export const ItemTypes = {
  KNIGHT: "knight",
};

export interface BoardSquareProps {
  x: number;
  y: number;
  list: any[];
  layout: Layout;
  children?: ReactNode;
}

export const LayoutSquare: FC<BoardSquareProps> = ({
  x,
  y,
  list,
  layout,
  children,
}: BoardSquareProps) => {
  const [lists, setLists] = useState<any[]>(list);

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ItemTypes.KNIGHT,
      drop: () => {
        console.log("dd")
        const loop = async (list: any[]) => {
          const promises = list.map(async (data: any) => {
            if (x == data.row_index && y == data.col_index) {
              return true;
            }
          });

          const results = await Promise.all(promises);
          if (!results.includes(true)) {
            const index = layout.position[2];
            layout.moveKnight(x, y, index);
            const newItem = list.map((item: any) =>
              item.seq == index
                ? { ...item, col_index: y, row_index: x }
                : { ...item }
            );
            setLists(newItem);
          } else {
            const check = list.map(async (data: any) => {
              if (
                x == data.row_index &&
                y == data.col_index &&
                layout.position[2] == data.seq
              ) {
                return true;
              }
            });
            const results2 = await Promise.all(check);
            if (!results2.includes(true)) {
              alert("같은 영역에 배치할 수 없습니다");
            }
          }
        };
        loop(list);
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [layout, list]
  );

  return (
    <div
      ref={drop}
      role="Space"
      data-testid={`(${x},${y})`}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      <Square>{children}</Square>
      {isOver && <Overlay type={OverlayType.LegalMoveHover} />}
    </div>
  );
};
