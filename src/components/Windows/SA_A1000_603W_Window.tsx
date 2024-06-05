import { Button } from "@progress/kendo-react-buttons";
import { useEffect, useLayoutEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { BottomContainer, ButtonContainer } from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { isLoading } from "../../store/atoms";
import {
  UseGetValueFromSessionItem,
  getHeight,
  getWindowDeviceHeight,
} from "../CommonFunction";
import FileViewers from "../Viewer/FileViewers";
import Window from "./WindowComponent/Window";

type IWindow = {
  setVisible(t: boolean): void;
  quonum: string;
  quorev: number;
  modal?: boolean;
};

var height = 0;
var height2 = 0;

const SA_A1000_603W_Window = ({
  setVisible,
  quonum,
  quorev,
  modal = false,
}: IWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;

  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1000) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 900) / 2,
    width: isMobile == true ? deviceWidth : 1000,
    height: isMobile == true ? deviceHeight : 900,
  });
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  useLayoutEffect(() => {
    height = getHeight(".k-window-titlebar"); //공통 해더
    height2 = getHeight(".BottomContainer"); //조회버튼있는 title부분

    setMobileHeight(
      getWindowDeviceHeight(false, deviceHeight) - height - height2
    );
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height2
    );
  }, []);
  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height2
    );
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
      para: "document-json?id=S20243218C8", //70번(바이오): S20243218C8 / 90번 S202452F7E0
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

  return (
    <Window
      titles={"시험의뢰서출력"}
      positions={position}
      Close={onClose}
      modals={modal}
      onChangePostion={onChangePostion}
      className="print-hidden"
    >
      <div
        style={{
          height: isMobile ? mobileheight : webheight,
        }}
      >
        {url != "" ? <FileViewers fileUrl={url} /> : ""}
      </div>
      <BottomContainer className="BottomContainer">
        <ButtonContainer>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>
    </Window>
  );
};

export default SA_A1000_603W_Window;
