import { Button } from "@progress/kendo-react-buttons";
import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { BottomContainer, ButtonContainer } from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { isLoading } from "../../store/atoms";
import FileViewers from "../Viewer/FileViewers";
import Window from "./WindowComponent/Window";

type IWindow = {
  para: any;
  setVisible(t: boolean): void;
  modal?: boolean;
};

const CopyWindow = ({ setVisible, para, modal = false }: IWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 800) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 900) / 2,
    width: isMobile == true ? deviceWidth : 800,
    height: isMobile == true ? deviceHeight : 900,
  });

  const onClose = () => {
    setVisible(false);
  };

  const processApi = useApi();

  const [url, setUrl] = useState("");
  const [isInitSearch, setIsInitSearch] = useState(false);
  const setLoading = useSetRecoilState(isLoading);
  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    const parameters = {
      para: "document-json?id=S202355E39F",
      "@p_orgdiv": para.orgdiv,
      "@p_expensedt": para.expensedt,
      "@p_expenseseq1": para.expenseseq1,
    };

    try {
      data = await processApi<any>("excel-view", parameters);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      const byteCharacters = atob(data.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: "application/pdf",
      });
      setUrl(URL.createObjectURL(blob));
    } else {
      setUrl("");
    }
    setLoading(false);
  };

  // 최초 한번만 실행
  useEffect(() => {
    if (isInitSearch == false && para != undefined) {
      fetchMainGrid();
      setIsInitSearch(true);
    }
  }, [para]);

  return (
    <>
      <Window
        titles={"지출결의서 미리보기"}
        positions={position}
        Close={onClose}
        modals={modal}
        className="print-hidden"
      >
        <div
          style={{
            height: position.height - 170,
            marginBottom: "10px",
            marginTop: "10px",
          }}
        >
          {url != "" ? <FileViewers fileUrl={url} /> : ""}
        </div>
        <BottomContainer>
          <ButtonContainer>
            <Button
              themeColor={"primary"}
              fillMode={"outline"}
              onClick={onClose}
            >
              닫기
            </Button>
          </ButtonContainer>
        </BottomContainer>
      </Window>
    </>
  );
};
export default CopyWindow;
