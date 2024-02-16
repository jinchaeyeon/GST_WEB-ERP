import { Button } from "@progress/kendo-react-buttons";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import { useEffect, useRef, useState } from "react";
import ReactToPrint from "react-to-print";
import { useSetRecoilState } from "recoil";
import { BottomContainer, ButtonContainer } from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { isLoading } from "../../store/atoms";
import FileViewers from "../Viewer/FileViewers";

type IWindow = {
  para: any;
  setVisible(t: boolean): void;
  modal?: boolean;
};

const CopyWindow = ({ setVisible, para, modal = false }: IWindow) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 800,
    height: 900,
  });

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
    if (isInitSearch === false && para != undefined) {
      fetchMainGrid();
      setIsInitSearch(true);
    }
  }, [para]);

  const componentRef = useRef(null);

  return (
    <>
      <Window
        title={"지출결의서 미리보기"}
        width={position.width}
        height={position.height}
        onMove={handleMove}
        onResize={handleResize}
        onClose={onClose}
        modal={modal}
      >
        <ButtonContainer>
          <></>
          <ReactToPrint
            trigger={() => (
              <Button fillMode="outline" themeColor={"primary"} icon="print">
                출력
              </Button>
            )}
            content={() => componentRef.current}
          />
        </ButtonContainer>
        <div
          style={{
            height: "700px",
            border: "1px solid gray",
            marginBottom: "10px",
            marginTop: "10px",
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
