import { Barcode } from "@progress/kendo-react-barcodes";
import { Button } from "@progress/kendo-react-buttons";
import { useLayoutEffect, useRef, useState } from "react";
import ReactToPrint from "react-to-print";
import { BottomContainer, ButtonContainer } from "../../CommonStyled";
import { IWindowPosition } from "../../hooks/interfaces";
import { getHeight, getWindowDeviceHeight } from "../CommonFunction";
import Window from "./WindowComponent/Window";

type barcode = {
  barcode: string;
  custnm: string;
  indt: string;
  insiz: string;
  itemacnt: string;
  itemnm: string;
  lotnum: string;
  qty: string;
};

type IWindow = {
  data: barcode;
  setVisible(t: boolean): void;
  modal?: boolean;
};

var height = 0;
var height2 = 0;
var height3 = 0;

const CopyWindow = ({ setVisible, data, modal = false }: IWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 800) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 500) / 2,
    width: isMobile == true ? deviceWidth : 800,
    height: isMobile == true ? deviceHeight : 500,
  });

  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  useLayoutEffect(() => {
    height = getHeight(".k-window-titlebar"); //공통 해더
    height2 = getHeight(".BottomContainer"); //하단 버튼부분
    height3 = getHeight(".WindowTitleContainer");

    setMobileHeight(
      getWindowDeviceHeight(false, deviceHeight) - height - height2 - height3
    );
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height2 - height3
    );
  }, []);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height2 - height3
    );
  };

  const onClose = () => {
    setVisible(false);
  };
  const componentRef = useRef(null);

  return (
    <>
      <Window
        titles={"바코드 출력"}
        positions={position}
        Close={onClose}
        modals={modal}
        onChangePostion={onChangePostion}
      >
        <ButtonContainer className="WindowTitleContainer">
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
          id="BarcodePrint"
          style={{
            height: isMobile ? mobileheight : webheight,
            overflow: "auto",
          }}
          ref={componentRef}
        >
          <table style={{ width: "100%" }}>
            <tbody>
              <tr>
                <th>입고일자</th>
                <td>{data.indt}</td>
                <th>품목계정</th>
                <td>{data.itemacnt}</td>
              </tr>
              <tr>
                <th>품명</th>
                <td colSpan={3}>{data.itemnm}</td>
              </tr>
              <tr>
                <th>규격</th>
                <td>{data.insiz}</td>
                <th>수량</th>
                <td>{data.qty}</td>
              </tr>
            </tbody>
          </table>
          <table style={{ width: "100%" }}>
            <tbody>
              <tr>
                <th>바코드</th>
              </tr>
              <tr>
                <td>
                  <Barcode
                    type="Code128"
                    width={position.width - 32}
                    value={data.barcode}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <BottomContainer className="BottomContainer">
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
