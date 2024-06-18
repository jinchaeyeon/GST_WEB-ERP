import { DataResult, State, process } from "@progress/kendo-data-query";
import { Barcode } from "@progress/kendo-react-barcodes";
import { Button } from "@progress/kendo-react-buttons";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactToPrint from "react-to-print";
import { useRecoilState } from "recoil";
import { BottomContainer, ButtonContainer } from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { loginResultState } from "../../store/atoms";
import { Iparameters, TPermissions } from "../../store/types";
import {
  UseGetValueFromSessionItem,
  UsePermissions,
  getHeight,
  getWindowDeviceHeight,
} from "../CommonFunction";
import Window from "./WindowComponent/Window";

type barcode = {
  barcode: string;
  chk: string;
  custnm: string;
  itemcd: string;
  itemnm: string;
  insiz: string;
  lotnum: string;
  ordkey: string;
  project: string;
  qty: string;
};

type IWindow = {
  data: barcode[];
  setVisible(t: boolean): void;
  total: number;
  modal?: boolean;
};

var height = 0;
var height2 = 0;
var height3 = 0;

const CopyWindow = ({ setVisible, data, total, modal = false }: IWindow) => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
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

  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";

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
    lotnum_s: "",
    prntqty_s: "",
  });

  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const BarCodeParameters: Iparameters = {
    procedureName: "P_PR_A5000W_Q",
    pageNumber: 1,
    pageSize: barcodeFilters.pgSize,
    parameters: {
      "@p_work_type": "BARCODE",
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": "",
      "@p_person": "",
      "@p_frdt": "",
      "@p_todt": "",
      "@p_finyn": "",
      "@p_lotnum_s": barcodeFilters.lotnum_s,
      "@p_prntqty_s": barcodeFilters.prntqty_s,
      "@p_find_row_value": "",
      "@p_company_code": companyCode,
    },
  };

  const fetchBarcordGrid = async () => {
    if (!permissions.view) return;

    let data: any;
    try {
      data = await processApi<any>("procedure", BarCodeParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
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
    if (permissions.view) {
      fetchBarcordGrid();
    }
  }, [barcodeFilters, permissions]);

  useEffect(() => {
    let lotnum: any = [];
    let prntqty: any = [];
    data.map((item: any) => {
      lotnum.push(item.makey);
      prntqty.push(String(item.prntqty));
    });
    setBarCodeFilters({
      pgSize: 20,
      lotnum_s: lotnum.join("|"),
      prntqty_s: prntqty.join("|"),
    });
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
        <ButtonContainer className="WindowTitleContainer">
          <ReactToPrint
            trigger={() => (
              <Button
                fillMode="outline"
                themeColor={"primary"}
                icon="print"
                disabled={permissions.print ? false : true}
              >
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
          {mainDataResult.data[0] != null &&
            mainDataResult.data[0].map((item: any) => (
              <div key={item.ordkey}>
                <table style={{ width: "100%" }}>
                  <tbody>
                    <tr>
                      <th>품명</th>
                      <td colSpan={2}>{item.itemnm}</td>
                    </tr>
                    <tr>
                      <th>규격</th>
                      <td colSpan={2}>{item.insiz}</td>
                    </tr>
                    <tr>
                      <th>LOT NO</th>
                      <td>{item.lotnum}</td>
                      <td>{item.qty}</td>
                    </tr>
                    <tr>
                      <th></th>
                      <td></td>
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
              </div>
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
