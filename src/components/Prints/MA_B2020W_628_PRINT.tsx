import { Button } from "@progress/kendo-react-buttons";
import { useEffect, useRef, useState } from "react";
import ReactToPrint from "react-to-print";
import { ButtonContainer, LandscapePrint } from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { Iparameters, TPermissions } from "../../store/types";
import {
  UsePermissions,
  convertDateToStr,
  convertDateToStrWithTime2,
  dateformat2,
  numberWithCommas,
} from "../CommonFunction";
import styles from "./MA_B2020W_628_PRINT.module.css";

const MA_B2020W_628_PRINT = (data: any) => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const processApi = useApi();
  const [mainDataResult, setMainDataResult] = useState<any>(null);
  const [total, setTotal] = useState<any>(null);

  useEffect(() => {
    if (data !== null && permissions.view) {
      fetchMainData(data.data);
    }
  }, [data, permissions]);

  //그리드 데이터 조회
  const fetchMainData = async (para: any) => {
    if (!permissions.view) return;
    let data: any;

    const parameters: Iparameters = {
      procedureName: "P_MA_B2020W_628_Q",
      pageNumber: 1,
      pageSize: 500,
      parameters: {
        "@p_work_type": "Q",
        "@p_orgdiv": para.orgdiv,
        "@p_frdt": convertDateToStr(para.frdt),
        "@p_todt": convertDateToStr(para.todt),
        "@p_custcd": para.custcd,
        "@p_ordsts": para.ordsts,
        "@p_itemnm": para.itemnm,
        "@p_rcvcustnm": para.rcvcustnm,
        "@p_itemcd": "",
        "@p_today": "",
        "@p_find_row_value": para.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      //요약
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;
      if (totalRowCnt > 0) {
        setMainDataResult(rows);
        setTotal(totalRowCnt);
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
  };

  const componentRef = useRef(null);

  return (
    <LandscapePrint>
      <ButtonContainer>
        <></>
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

      <div className={styles.printable} ref={componentRef}>
        <div className={styles.header_wrap}>
          <div className={styles.left}>
            <p>
              납품예정기간: {dateformat2(convertDateToStr(data.data.frdt))} ~{" "}
              {dateformat2(convertDateToStr(data.data.todt))}
            </p>
          </div>
          <div className={styles.center}>
            <h1>발주 List</h1>
          </div>
          <div className={styles.right}>
            <p>출력일시: {convertDateToStrWithTime2(new Date())}</p>
          </div>
        </div>

        {mainDataResult !== null &&
          mainDataResult.map((item1: any, idx1: number) =>
            idx1 == 0 || idx1 % total == 0 ? (
              <>
                <table className={styles.tg}>
                  <colgroup>
                    <col width="10%" />
                    <col width="20%" />
                    <col width="15%" />
                    <col width="10%" />
                    <col width="15%" />
                    <col width="20%" />
                    <col width="10%" />
                  </colgroup>
                  <tbody>
                    <tr style={{ backgroundColor: "#e6e6e6" }}>
                      <th>납품예정일</th>
                      <th>품목명</th>
                      <th>규격</th>
                      <th>수량</th>
                      <th>납품처</th>
                      <th>비고</th>
                      <th>단가</th>
                    </tr>
                    {mainDataResult.map((item2: any, idx2: number) => (
                      <tr key={item2.rownum}>
                        <td>{dateformat2(item2.dlvdt)}</td>
                        <td>{item2.itemnm}</td>
                        <td>{item2.spec}</td>
                        <td>{numberWithCommas(item2.qty) + item2.qtyunit}</td>
                        <td>{item2.rcvcustnm}</td>
                        <td>{item2.remark}</td>
                        <td>{numberWithCommas(item2.unp)}</td>
                      </tr>
                    ))}
                    <tr style={{ backgroundColor: "#e6e6e6" }}>
                      <td colSpan={2}>계</td>
                      <td>{total + "건"}</td>
                      <td>{total > 0 ? numberWithCommas(mainDataResult[0].total_qty) : 0}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ pageBreakBefore: "always" }} />
              </>
            ) : (
              ""
            )
          )}
      </div>
    </LandscapePrint>
  );
};

export default MA_B2020W_628_PRINT;
