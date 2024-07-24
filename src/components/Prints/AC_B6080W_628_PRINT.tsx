import { Button } from "@progress/kendo-react-buttons";
import { useEffect, useRef, useState } from "react";
import ReactToPrint from "react-to-print";
import { ButtonContainer, LandscapePrint } from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { Iparameters, TPermissions } from "../../store/types";
import {
  UseGetValueFromSessionItem,
  UsePermissions,
  convertDateToStr,
  convertDateToStrWithTime2,
  dateformat2,
  numberWithCommas,
} from "../CommonFunction";
import styles from "./AC_B6080W_628_PRINT.module.css";

const AC_B6080W_628_PRINT = (data: any) => {
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
  const sessionCustcd = UseGetValueFromSessionItem("custcd");
  const sessionUserName = UseGetValueFromSessionItem("user_name");

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
      procedureName: "P_AC_B6080W_628_Q",
      pageNumber: 1,
      pageSize: 500,
      parameters: {
        "@p_work_type": "LIST",
        "@p_orgdiv": para.orgdiv,
        "@p_location": para.location,
        "@p_yyyy": convertDateToStr(para.yyyy).substring(0, 4),
        "@p_custcd": para.custcd,
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
              ({sessionCustcd}){sessionUserName}
            </p>
          </div>
          <div className={styles.center}>
            <h1>미지급 현황</h1>
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
                    <col width="15%" />
                    <col width="15%" />
                    <col width="15%" />
                    <col width="15%" />
                    <col width="15%" />
                    <col width="15%" />                  
                  </colgroup>
                  <tbody>
                    <tr style={{ backgroundColor: "#e6e6e6" }}>
                      <th>구분</th>
                      <th>이월 미지급액</th>
                      <th>공급가액</th>
                      <th>부가세</th>
                      <th>매입합계</th>
                      <th>지급액</th>
                      <th>미지급잔액</th>
                    </tr>
                    {mainDataResult.map((item2: any, idx2: number) => (
                      <tr key={item2.rownum}>
                        <td>{item2.ym}월</td>                    
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {numberWithCommas(item2.iwlamt)}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {numberWithCommas(item2.wonamt)}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {numberWithCommas(item2.taxamt)}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {numberWithCommas(item2.totamt)}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {numberWithCommas(item2.colamt)}
                        </td>  
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {numberWithCommas(item2.janamt)}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ backgroundColor: "#e6e6e6" }}>
                      <td>합 계</td>                      
                      <td style={{ textAlign: "right", paddingRight: "3px" }}>
                        {total > 0
                          ? numberWithCommas(mainDataResult[0].total_iwlamt)
                          : 0}
                      </td>                    
                      <td style={{ textAlign: "right", paddingRight: "3px" }}>
                        {total > 0
                          ? numberWithCommas(mainDataResult[0].total_wonamt)
                          : 0}
                      </td>
                      <td style={{ textAlign: "right", paddingRight: "3px" }}>
                        {total > 0
                          ? numberWithCommas(mainDataResult[0].total_taxamt)
                          : 0}
                      </td>
                      <td style={{ textAlign: "right", paddingRight: "3px" }}>
                        {total > 0
                          ? numberWithCommas(mainDataResult[0].total_totamt)
                          : 0}
                      </td>
                      <td style={{ textAlign: "right", paddingRight: "3px" }}>
                        {total > 0
                          ? numberWithCommas(mainDataResult[0].total_colamt)
                          : 0}
                      </td>
                      <td style={{ textAlign: "right", paddingRight: "3px" }}>
                        {total > 0
                          ? numberWithCommas(mainDataResult[0].total_janamt)
                          : 0}
                      </td>
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

export default AC_B6080W_628_PRINT;
