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
  fxmngnum: string;
};

type filters = {
  pgSize: number;
  orgdiv: string;
  frdt: Date;
  todt: Date;
  fxmngnum: string;
  itemcd: string;
  itemnm: string;
  custcd: string;
  custnm: string;
  srialno: string;
  iteminsiz: string;
  rcvcustcd: string;
  rcvcustnm: string;
  devmngnum: string;
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
  let deviceWidth = document.documentElement.clientWidth;
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
  const [barcodeFilters, setBarCodeFilters] = useState({
    pgSize: total,
    orgdiv: sessionOrgdiv,
    frdt: new Date(),
    todt: new Date(),
    fxmngnum: "",
    itemcd: "",
    itemnm: "",
    custcd: "",
    custnm: "",
    srialno: "",
    iteminsiz: "",
    rcvcustcd: "",
    rcvcustnm: "",
    devmngnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const BarCodeParameters: Iparameters = {
    procedureName: "P_MA_A3000W_Q",
    pageNumber: 1,
    pageSize: barcodeFilters.pgSize,
    parameters: {
      "@p_work_type": "BARCODE",
      "@p_orgdiv": sessionOrgdiv,
      "@p_fxmngnum": barcodeFilters.fxmngnum,
      "@p_frdt": convertDateToStr(barcodeFilters.frdt),
      "@p_todt": convertDateToStr(barcodeFilters.todt),
      "@p_custcd": "",
      "@p_custnm": "",
      "@p_itemcd": "",
      "@p_itemnm": "",
      "@p_srialno": "",
      "@p_iteminsiz": "",
      "@p_rcvcustcd": "",
      "@p_rcvcustnm": "",
      "@p_devmngnum": "",
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
    let fxmngnum: any = [];
    data.map((item: any) => {
      fxmngnum.push(item.fxmngnum);
    });
    setBarCodeFilters((prev) => ({
      ...prev,
      fxmngnum: fxmngnum.join("|"),
      frdt: filter.frdt,
      todt: filter.todt,
      isSearch: true,
    }));
  }, []);

  React.useEffect(() => {
    if (total > 2) {
      setPosition((prev: any) => ({
        left: 300,
        top: 100,
        width: prev.width,
        height: 780,
      }));
    } else if (total > 1) {
      setPosition((prev: any) => ({
        left: 300,
        top: 100,
        width: prev.width,
        height: 620,
      }));
    } else {
      setPosition((prev: any) => ({
        left: 300,
        top: 100,
        width: prev.width,
        height: 420,
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
              <div key={item.ordkey} style={{ marginBottom: "10px" }}>
                <table style={{ width: "650px" }}>
                  <tbody>
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
              </div>
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
