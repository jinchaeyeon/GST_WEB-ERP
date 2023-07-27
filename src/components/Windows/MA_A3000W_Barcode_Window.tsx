import { useEffect, useState, useCallback, useRef } from "react";
import * as React from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  BottomContainer,
  ButtonContainer,
  GridContainer,
  LandscapePrint,
  MainWorkStartEndContainer,
} from "../../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import { IWindowPosition } from "../../hooks/interfaces";
import { Barcode } from "@progress/kendo-react-barcodes";
import {
  Grid,
  GridColumn,
  GridCellProps,
  GridDataStateChangeEvent,
} from "@progress/kendo-react-grid";
import { DataResult, getter, process, State } from "@progress/kendo-data-query";
import ReactToPrint from "react-to-print";
import { useApi } from "../../hooks/api";
import { Iparameters } from "../../store/types";
import { TabStripNavigation } from "@progress/kendo-react-layout";
import { convertDateToStr } from "../CommonFunction";

type barcode = {
  fxmngnum: string;
};

type filters = {
  frdt: Date;
  todt: Date;
};

type IWindow = {
  data: barcode[];
  filter: filters;
  setVisible(t: boolean): void;
  total: number;
};

const CopyWindow = ({ setVisible, filter, data, total }: IWindow) => {
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 800,
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
  const [barcodeFilters, setBarCodeFilters] = useState({
    pgSize: 20,
    fxmngnum: "",
    frdt: "",
    todt: "",
  });

  const BarCodeParameters: Iparameters = {
    procedureName: "P_MA_A3000W_Q",
    pageNumber: 1,
    pageSize: barcodeFilters.pgSize,
    parameters: {
      "@p_work_type": "BARCODE",
      "@p_orgdiv": "01",
      "@p_fxmngnum": barcodeFilters.fxmngnum,
      "@p_frdt": barcodeFilters.frdt,
      "@p_todt": barcodeFilters.todt,
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
  
    if (data.isSuccess === true) {
        const totalRowCnt = data.tables[0].RowCount;
        const rows = data.tables[0].Rows;

        if (totalRowCnt > 0)
          setMainDataResult((prev) => {
            return {
              data: [...prev.data, rows],
              total: totalRowCnt == -1 ? 0 : totalRowCnt,
            };
          });
    }  
  };

  useEffect(() => {
    fetchBarcordGrid();
  }, [barcodeFilters]);

  useEffect(() => {
    let fxmngnum: any = [];
    data.map((item: any) => {
      fxmngnum.push(item.fxmngnum);
    });
    setBarCodeFilters({
      pgSize: 20,
      fxmngnum: fxmngnum.join("|"),
      frdt: convertDateToStr(filter.frdt),
      todt: convertDateToStr(filter.todt),
    });
  }, []);

  React.useEffect(() => {
    if (total > 2) {
      setPosition((prev: any) => ({
        left: 300,
        top: 100,
        width: 800,
        height: 780,
      }));
    } else if (total > 1) {
      setPosition((prev: any) => ({
        left: 300,
        top: 100,
        width: 800,
        height: 620,
      }));
    } else {
      setPosition((prev: any) => ({
        left: 300,
        top: 100,
        width: 800,
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
        modal={true}
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
          {mainDataResult.data[0] != null &&
            mainDataResult.data[0].map((item: any) => (
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
