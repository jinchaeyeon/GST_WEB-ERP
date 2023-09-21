import {
  MouseEvent,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FC,
} from "react";
import { DragPreviewImage, useDrag } from "react-dnd";
import { useRecoilState } from "recoil";
import {
  clickedState,
  infoState,
  pointsState
} from "../../store/atoms";
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
  info: any;
}

export const Knight: FC<KnightProps> = ({ layout, x, y, list, info }) => {
  const [clicked, setClicked] = useRecoilState(clickedState);
  const [information, setInformation] = useRecoilState(infoState);
  const [points, setPoints] = useRecoilState(pointsState);

  useEffect(() => {
    const handleClick = () => {
      setClicked("");
      setInformation({
        caption: "",
        form_id: "",
        key: "",
      });
      setPoints({
        x: 0,
        y: 0,
      });
    };
    window.addEventListener("click", handleClick);
  }, []);

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: ItemTypes.KNIGHT,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    []
  );

  const [imgBase64, setImgBase64] = useState<string>(""); // 파일 base64
  const excelInput: any = useRef();
  useEffect(() => {
    if (info != undefined) {
      setImgBase64("data:image/png;base64," + info.icon);
    }
  }, [info]);

  const onClickMenu = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (clicked == "") {
      setClicked(`${x}${y}`);
      setInformation({
        caption: info.caption,
        form_id: info.form_id,
        key: info.row_index + "" + info.col_index
      });
      setPoints({
        x: e.pageX,
        y: e.pageY,
      });
    } else {
      setClicked(`${x}${y}`);
      setInformation({
        caption: info.caption,
        form_id: info.form_id,
        key: info.row_index + "" + info.col_index
      });
      setPoints({
        x: e.pageX,
        y: e.pageY,
      });
    }
  };

  return (
    <>
      <DragPreviewImage connect={preview} src={imgBase64} />
      <div
        ref={drag}
        style={{
          ...knightStyle,
          opacity: isDragging ? 0.5 : 1,
          height: "100%",
          textAlign: "center",
          position: "relative",
        }}
        onMouseDown={() => {
          list.map((item) => {
            if (x == item.row_index && y == item.col_index) {
              layout.moveKnight(x, y, item.seq);
            }
          });
        }}
        onContextMenu={(e) => onClickMenu(e)}
      >
        <div
          style={{
            width: "auto",
            height: "100%",
          }}
        >
          <img
            style={{ width: "auto", height: "100%" }}
            ref={excelInput}
            src={imgBase64}
            alt="UserImage"
          />
        </div>
        {info != undefined ? (
          <div
            style={{
              position: "absolute",
              width: "100%",
              bottom: "10px",
              fontSize: "0.8rem",
              fontWeight: 700,
            }}
          >
            {info.caption}
          </div>
        ) : (
          ""
        )}
      </div>
    </>
  );
};
