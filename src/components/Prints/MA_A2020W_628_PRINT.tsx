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
} from "../CommonFunction";
import styles from "./MA_A2020W_628_PRINT.module.css";

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
      fetchMainData(data.data, data.rows);
    }
  }, [data, permissions]);

  //그리드 데이터 조회
  const fetchMainData = async (para: any, rows2: any[]) => {
    if (!permissions.view) return;
    let data: any;
    console.log(rows2);
    let rowsarray: any[] = [];
    rows2.map((item: any) => {
      rowsarray.push(item.ordnum);
    });

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_MA_A2020W_628_Q",
      pageNumber: para.pgNum,
      pageSize: para.pgSize,
      parameters: {
        "@p_work_type": "PRINT",
        "@p_orgdiv": para.orgdiv,
        "@p_frdt": convertDateToStr(para.frdt),
        "@p_todt": convertDateToStr(para.todt),
        "@p_custcd": para.custcd,
        "@p_custnm": para.custnm,
        "@p_chkyn": para.chkyn,
        "@p_gubun": para.gubun,
        "@p_kind": para.kind,
        "@p_location": para.location,
        "@p_itemnm": para.itemnm,
        "@p_pgubun": para.pgubun,
        "@p_taxdiv": para.taxdiv,
        "@p_itemsts": para.itemsts,
        "@p_rows": rowsarray.join(","),
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
        {data.data.pgubun == "8" ? (
          <>
            <div className={styles.header_wrap}>
              <div className={styles.left}>
                <p>{data.data.custnm}</p>
              </div>
              <div className={styles.center}>
                <h1>품명별 합계</h1>
                <p>
                  출고일자: {dateformat2(convertDateToStr(data.data.frdt))} ~{" "}
                  {dateformat2(convertDateToStr(data.data.todt))}
                </p>
              </div>
              <div className={styles.right}>
                <p>출력일시: {convertDateToStrWithTime2(new Date())}</p>
              </div>
            </div>
            {mainDataResult !== null &&
              mainDataResult.map((item1: any, idx1: number) =>
                idx1 == 0 || idx1 % 10 == 0 ? (
                  <>
                    <table className={styles.tg}>
                      <colgroup>
                        <col width="20%" />
                        <col width="15%" />
                        <col width="10%" />
                        <col width="10%" />
                        <col width="15%" />
                        <col width="15%" />
                        <col width="15%" />
                      </colgroup>
                      <tbody>
                        <tr style={{ backgroundColor: "#e6e6e6" }}>
                          <th>품목명</th>
                          <th>사이즈</th>
                          <th>수주량(kg)</th>
                          <th>소분량</th>
                          <th>납품처</th>
                          <th>비고</th>
                          <th>대리점명</th>
                        </tr>
                        {mainDataResult.map((item2: any, idx2: number) => (
                          <tr key={item2.rownum}>
                            <td>{item2.itemnm}</td>
                            <td>{item2.ordsiz}</td>
                            <td>{item2.qty}</td>
                            <td>{item2.sqty}</td>
                            <td>{item2.rcvcustnm}</td>
                            <td>{item2.remark}</td>
                            <td>{item2.orgnm}</td>
                          </tr>
                        ))}
                        <tr style={{ backgroundColor: "#e6e6e6" }}>
                          <td colSpan={2}>소 계 ({total})</td>
                          <td>{total > 0 ? mainDataResult[0].total_qty : 0}</td>
                          <td>
                            {total > 0 ? mainDataResult[0].total_sqty : 0}
                          </td>
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
          </>
        ) : (
          <></>
        )}
      </div>
    </LandscapePrint>
  );
};

export default MA_B2020W_628_PRINT;
