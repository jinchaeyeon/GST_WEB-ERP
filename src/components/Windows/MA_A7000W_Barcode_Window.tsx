import { DataResult, State, process } from "@progress/kendo-data-query";
import { Barcode } from "@progress/kendo-react-barcodes";
import { Button } from "@progress/kendo-react-buttons";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactToPrint from "react-to-print";
import { BottomContainer, ButtonContainer } from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { Iparameters } from "../../store/types";
import {
  UseGetValueFromSessionItem,
  convertDateToStr,
  getHeight,
} from "../CommonFunction";
import Window from "./WindowComponent/Window";

type barcode = {
  lotnum: string;
};

type filters = {
  pgSize: number;
  orgdiv: string;
  yyyymm: Date;
  location: string;
  itemacnt: string;
  itemcd: string;
  itemnm: string;
  insiz: string;
  lotnum: string;
  position: string;
  find_row_value: string;
  pgNum: number;
  isSearch: boolean;
};

type IWindow = {
  data: barcode[];
  filter: filters;
  setVisible(t: boolean): void;
  total: number;
  modal?: boolean;
};

var height = 0;
var height2 = 0;
var height3 = 0;

const CopyWindow = ({
  setVisible,
  filter,
  data,
  total,
  modal = false,
}: IWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 800) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 900) / 2,
    width: isMobile == true ? deviceWidth : 800,
    height: isMobile == true ? deviceHeight : 900,
  });
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  useLayoutEffect(() => {
    height = getHeight(".k-window-titlebar"); //공통 해더
    height2 = getHeight(".BottomContainer"); //하단 버튼부분
    height3 = getHeight(".TitleContainer");

    setMobileHeight(deviceHeight - height - height2 - height3);
    setWebHeight(position.height - height - height2 - height3);
  }, []);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(position.height - height - height2 - height3);
  };
  const onClose = () => {
    setVisible(false);
  };
  const componentRef = useRef(null);
  const processApi = useApi();

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const [barcodeFilters, setBarCodeFilters] = useState({
    pgSize: total,
    orgdiv: sessionOrgdiv,
    yyyymm: new Date(),
    location: sessionLocation,
    itemacnt: "",
    itemcd: "",
    itemnm: "",
    insiz: "",
    lotnum: "",
    position: "",
    isSearch: false,
  });

  const BarCodeParameters: Iparameters = {
    procedureName: "P_MA_A7000W_Q",
    pageNumber: 1,
    pageSize: barcodeFilters.pgSize,
    parameters: {
      "@p_work_type": "BARCODE",
      "@p_orgdiv": barcodeFilters.orgdiv,
      "@p_yyyymm": convertDateToStr(barcodeFilters.yyyymm).substr(0, 4) + "00",
      "@p_location": barcodeFilters.location,
      "@p_itemacnt": barcodeFilters.itemacnt,
      "@p_itemcd": barcodeFilters.itemcd,
      "@p_itemnm": barcodeFilters.itemnm,
      "@p_insiz": barcodeFilters.insiz,
      "@p_lotnum": barcodeFilters.lotnum,
      "@p_position": barcodeFilters.position,
    },
  };

  const fetchBarcordGrid = async () => {
    let data: any;
    try {
      data = await processApi<any>("procedure", BarCodeParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
    }
  };

  useEffect(() => {
    if (barcodeFilters.isSearch) {
      setBarCodeFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchBarcordGrid();
    }
  }, [barcodeFilters]);

  useEffect(() => {
    let lotnum: any = [];
    data.map((item: any) => {
      lotnum.push(item.lotnum);
    });
    setBarCodeFilters((prev) => ({
      ...prev,
      lotnum: lotnum.join("|"),
      isSearch: true,
    }));
  }, []);

  return (
    <>
      <Window
        titles={"바코드 출력"}
        positions={position}
        Close={onClose}
        modals={modal}
        onChangePostion={onChangePostion}
      >
        <ButtonContainer className="TitleContainer">
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
          {mainDataResult.data != null &&
            mainDataResult.data.map((item: any) => (
              <>
                <table style={{ width: "100%" }}>
                  <tbody>
                    <tr>
                      <th>입고년도</th>
                      <td>{item.yyyymm}</td>
                      <th>품목계정</th>
                      <td>{item.itemacnt}</td>
                    </tr>
                    <tr>
                      <th>품명</th>
                      <td colSpan={3}>{item.itemnm}</td>
                    </tr>
                    <tr>
                      <th>규격</th>
                      <td>{item.insiz}</td>
                      <th>수량</th>
                      <td>{item.qty}</td>
                    </tr>
                    <tr>
                      <th>LOT NO</th>
                      <td colSpan={3}>{item.lotnum}</td>
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
                          value={item.barcode}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </>
            ))}
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
