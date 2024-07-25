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
import styles from "./MA_B2500W_628_PRINT.module.css";

const MA_B2500W_628_PRINT = (data: any) => {
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
      procedureName: "P_MA_B2500W_628_Q",
      pageNumber: 1,
      pageSize: 500,
      parameters: {
        "@p_work_type": "LIST",
        "@p_orgdiv": para.orgdiv,
        "@p_location": para.location,
        "@p_todt": convertDateToStr(para.todt),
        "@p_custcd": para.custcd,
        "@p_itemtype": para.itemtype,
        "@p_itemnm": para.itemnm,
        "@p_frdt": convertDateToStr(para.frdt),
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

// 숫자를 포맷하는 함수
const formatNumber = (numStr: string) => {
  const parsedNum = parseFloat(numStr);
  if (isNaN(parsedNum)) return "0.00";
  const flooredNum = Math.floor(parsedNum * 100) / 100;
  const formattedNum = flooredNum.toFixed(2);

  return formattedNum.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

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
              기간: {dateformat2(convertDateToStr(data.data.frdt))} ~{" "}
              {dateformat2(convertDateToStr(data.data.todt))}
            </p>
          </div>
          <div className={styles.center}>
            <h1>매입 현황</h1>
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
                    <col width="5%" />
                    <col width="10%" />
                    <col width="10%" />
                    <col width="10%" />
                    <col width="10%" />
                    <col width="10%" />
                    <col width="15%" />
                    <col width="10%" />
                  </colgroup>
                  <tbody>
                    <tr style={{ backgroundColor: "#e6e6e6" }}>
                      <th>매입일자</th>
                      <th>품목명</th>
                      <th>단위</th>
                      <th>수량</th>
                      <th>단가</th>
                      <th>금액</th>
                      <th>세액</th>
                      <th>합계액</th>
                      <th>납품처</th>
                      <th>원산지</th>
                    </tr>
                    {mainDataResult.map((item2: any, idx2: number) => (
                      <tr key={item2.rownum}>
                        <td style={{ textAlign: "center"}}>{dateformat2(item2.outdt)}</td>
                        <td>{item2.itemnm}</td>
                        <td style={{ textAlign: "center"}}>{item2.qtyunit}</td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                        {formatNumber(item2.qty)}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {numberWithCommas(item2.unp)}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {numberWithCommas(Math.trunc(item2.wonamt))}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {numberWithCommas(Math.trunc(item2.taxamt))}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {numberWithCommas(Math.trunc(item2.totamt))}
                        </td>
                        <td>{item2.rcvcustnm}</td>
                        <td>{item2.specnum}</td>
                      </tr>
                    ))}
                    <tr style={{ backgroundColor: "#e6e6e6" }}>
                      <td style={{ textAlign: "center"}}>계</td>
                      <td style={{ textAlign: "center"}}>{total + "건"}</td>
                      <td></td>
                      <td style={{ textAlign: "right", paddingRight: "3px" }}>
                        {total > 0
                          ? formatNumber(mainDataResult[0].total_qty)
                          : 0}
                      </td>
                      <td></td>
                      <td style={{ textAlign: "right", paddingRight: "3px" }}>
                        {total > 0
                          ? numberWithCommas(Math.trunc(mainDataResult[0].total_wonamt))
                          : 0}
                      </td>
                      <td style={{ textAlign: "right", paddingRight: "3px" }}>
                        {total > 0
                          ? numberWithCommas(Math.trunc(mainDataResult[0].total_taxamt))
                          : 0}
                      </td>
                      <td style={{ textAlign: "right", paddingRight: "3px" }}>
                        {total > 0
                          ? numberWithCommas(Math.trunc(mainDataResult[0].total_totamt))
                          : 0}
                      </td>
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

export default MA_B2500W_628_PRINT;
