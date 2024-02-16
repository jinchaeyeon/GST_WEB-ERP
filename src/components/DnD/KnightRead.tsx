import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FC,
} from "react";

const knightStyle: CSSProperties = {
  fontSize: 1,
  fontWeight: "bold",
};

export const ItemTypes = {
  KNIGHT: "knight",
};

export interface KnightProps {
  info: any;
}

export const KnightRead: FC<KnightProps> = ({ info }) => {
  const [imgBase64, setImgBase64] = useState<string>(""); // 파일 base64
  const excelInput: any = useRef();
  useEffect(() => {
    if (info.length == 1) {
      setImgBase64("data:image/png;base64," + info[0].icon);
    }
  }, [info]);

  return (
    <>
      <div
        style={{
          ...knightStyle,
          height: "100%",
          textAlign: "center",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "auto",
            height: "90%",
          }}
        >
          <img
            style={{ height: "100%", width: "100%", objectFit: "contain" }}
            ref={excelInput}
            src={imgBase64}
            alt="UserImage"
          />
        </div>
        {info.length == 1 ? (
          <div
            style={{
              position: "absolute",
              width: "100%",
              bottom: "10px",
              fontSize: "0.8rem",
              fontWeight: 700,
            }}
          >
            {info[0].caption}
          </div>
        ) : (
          ""
        )}
      </div>
    </>
  );
};
