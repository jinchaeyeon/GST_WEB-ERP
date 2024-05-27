import { Button } from "@progress/kendo-react-buttons";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import { useEffect, useState } from "react";
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
import { UseGetValueFromSessionItem } from "../CommonFunction";
import FileViewers from "../Viewer/FileViewers";

const NoneDiv = () => {
  return <div></div>;
};
type IWindow = {
  setVisible(t: boolean): void;
  quonum: string;
  quorev: number;
  modal?: boolean;
};

const SA_A1001_603W_Window = ({
  setVisible,
  quonum,
  quorev,
  modal = false,
}: IWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;

  const [loginResult] = useRecoilState(loginResultState);
  const serviceCategory = loginResult ? loginResult.serviceCategory : "";
  const defaultCulture = loginResult ? loginResult.defaultCulture : "";

  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1000,
    height: isMobile == true ? deviceHeight : 900,
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
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  //그리드 데이터 조회
  const fetchmanualGrid = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    const parameters = {
      para: "document-json?id=S2023744A53",
      "@p_orgdiv": sessionOrgdiv,
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
      setUrl(URL.createObjectURL(blob) );
    } else {
      //데이터 없을 경우
      setUrl("");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchmanualGrid();
  }, []);

  return (
    <Window
      minimizeButton={NoneDiv}
      maximizeButton={NoneDiv}
      title={"견적서출력"}
      initialWidth={position.width}
      initialHeight={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={modal}
      className="print-hidden"
    >
      <TitleContainer>
        <Title>견적서</Title>
      </TitleContainer>
      <div
        style={{
          height: position.height - 220,
          width: position.width - 40,
          marginBottom: "10px",
        }}
      >
        {url != "" ? <FileViewers fileUrl={url} /> : ""}
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

export default SA_A1001_603W_Window;
