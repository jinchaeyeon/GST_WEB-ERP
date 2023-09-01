import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useMemo, type CSSProperties, type FC, useState, useEffect } from "react";
import { ButtonContainer, Title, TitleContainer } from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import { TPermissions } from "../store/types";
import { UsePermissions } from "../components/CommonFunction";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { Layout, Position } from "../components/DnD/Layout";
import { LayoutSquare } from "../components/DnD/LayoutSquare";
import { Piece } from "../components/DnD/Piece";

export interface AppState {
  position: [number, number];
}
export interface BoardProps {
    layout: Layout
  }
  
/** Styling properties applied to the board element */
const boardStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexWrap: "wrap",
};
const containerStyle: CSSProperties = {
  width: "100%",
  height: "80vh",
  border: "1px solid gray",
};
/** Styling properties applied to each square element */
const squareStyle: CSSProperties = { width: "12.5%", height: "12.5%" };

const SY_A0500W: React.FC = () => {
  const layout = useMemo(() => new Layout(), []);
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [[knightX, knightY], setKnightPos] = useState<Position>(
    layout.position,
  )
  
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };
  const search = () => {};
  const squares = []
  for (let i = 0; i < 64; i += 1) {
    squares.push(renderSquare(i))
  }

  useEffect(() => layout.observe(setKnightPos))

  function renderSquare(i: number) {
    const x = i % 8
    const y = Math.floor(i / 8)

    return (
      <div key={i} style={squareStyle}>
        <LayoutSquare x={x} y={y} layout={layout}>
          <Piece isKnight={x == knightX && y == knightY} />
        </LayoutSquare>
      </div>
    )
  }

  return (
    <>
      <TitleContainer>
        <Title>레이아웃 설정</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <DndProvider backend={HTML5Backend}>
        <div style={containerStyle}>
            <div style={boardStyle}>{squares}</div>
        </div>
      </DndProvider>
    </>
  );
};
export default SY_A0500W;
