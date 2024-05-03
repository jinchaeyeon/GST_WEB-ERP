import { DataResult, State, process } from "@progress/kendo-data-query";
import { Barcode } from "@progress/kendo-react-barcodes";
import { Button } from "@progress/kendo-react-buttons";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import ReactToPrint from "react-to-print";
import { BottomContainer, ButtonContainer } from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { Iparameters } from "../../store/types";
import {
  UseGetValueFromSessionItem,
  convertDateToStr,
} from "../CommonFunction";

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

const CopyWindow = ({
  setVisible,
  filter,
  data,
  total,
  modal = false,
}: IWindow) => {
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

  React.useEffect(() => {
    if (total > 2) {
      setPosition((prev: any) => ({
        left: 300,
        top: 100,
        width: prev.width,
        height: 900,
      }));
    } else if (total > 1) {
      setPosition((prev: any) => ({
        left: 300,
        top: 100,
        width: prev.width,
        height: 750,
      }));
    } else {
      setPosition((prev: any) => ({
        left: 300,
        top: 100,
        width: prev.width,
        height: 500,
      }));
    }
  }, []);

  return (
    <>
      <Window
        title={"바코드 출력"}
        width={position.width}
        height={position.height}
        onMove={handleMove}
        onResize={handleResize}
        onClose={onClose}
        modal={modal}
      >
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
        <div id="BarcodePrint" className="printable barcode" ref={componentRef}>
          {mainDataResult.data != null &&
            mainDataResult.data.map((item: any) => (
              <>
                <table style={{ width: "650px" }}>
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
                <table style={{ width: "650px" }}>
                  <tbody>
                    <tr>
                      <th>바코드</th>
                    </tr>
                    <tr>
                      <td>
                        <Barcode
                          type="Code128"
                          width={630}
                          value={item.barcode}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </>
            ))}
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
