import { Button } from "@progress/kendo-react-buttons";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import { useEffect, useRef, useState } from "react";
import ReactToPrint from "react-to-print";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  Title,
  TitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { isLoading, loginResultState, menuList } from "../../store/atoms";
import FileViewers from "../Viewer/FileViewers";

type IWindow = {
  setVisible(t: boolean): void;
  quonum: string;
  quorev: number;
  modal?: boolean;
};

const UserWindow = ({ setVisible, quonum, quorev, modal = false }: IWindow) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;

  const [loginResult] = useRecoilState(loginResultState);
  const serviceCategory = loginResult ? loginResult.serviceCategory : "";
  const defaultCulture = loginResult ? loginResult.defaultCulture : "";

  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 830,
    height: 900,
  });
  const [menulist, setMenuList] = useRecoilState(menuList);

  const handleMove = (event: WindowMoveEvent) => {
    setPosition({ ...position, left: event.left, top: event.top });
  };
  const handleResize = (event: WindowMoveEvent) => {
    setPosition({
      left: event.left,
      top: event.top,
      width: event.width,
      height: event.height,
    });
  };

  const onClose = () => {
    setVisible(false);
  };

  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();

  const [url, setUrl] = useState("");

  //그리드 데이터 조회
  const fetchmanualGrid = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    const parameters = {
      para: "document-json?id=S2023744A53",
      "@p_orgdiv": "01",
      "@p_quonum": quonum,
      "@p_quorev": quorev,
    };

    try {
      data = await processApi<any>("excel-view", parameters);
    } catch (error) {
      data = null;
    }

    if (data != null) {
      const byteCharacters = atob(data.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      setUrl(URL.createObjectURL(blob));
    } else {
      //데이터 없을 경우
      setUrl("");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchmanualGrid();
  }, []);

  const componentRef = useRef(null);

  return (
    <Window
      title={"견적서출력"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={modal}
    >
      <TitleContainer>
        <Title>견적서</Title>
        <ButtonContainer>
          <ReactToPrint
            trigger={() => (
              <Button fillMode="outline" themeColor={"primary"} icon="print">
                출력
              </Button>
            )}
            content={() => componentRef.current}
          />
        </ButtonContainer>
      </TitleContainer>
      <div
        style={{
          height: "680px",
          border: "1px solid gray",
          marginBottom: "10px",
          overflow: "scroll",
        }}
      >
        {url != "" ? (
          <FileViewers file={url} ref={componentRef} type="pdf" />
        ) : (
          ""
        )}
      </div>
      <BottomContainer>
        <ButtonContainer>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>
    </Window>
  );
};

export default UserWindow;
