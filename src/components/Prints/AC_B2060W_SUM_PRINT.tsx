import { Button } from "@progress/kendo-react-buttons";
import { useEffect, useRef, useState } from "react";
import ReactToPrint from "react-to-print";
import { useRecoilState } from "recoil";
import { ButtonContainer, LandscapePrint } from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { loginResultState } from "../../store/atoms";
import { Iparameters, TPermissions } from "../../store/types";
import {
  UseGetValueFromSessionItem,
  UsePermissions,
  convertDateToStr,
  dateformat2,
  dateformat3,
  numberWithCommas,
} from "../CommonFunction";
import { PAGE_SIZE } from "../CommonString";
import styles from "./AC_B2060W_SUM_PRINT.module.css";

interface Totals {
  total_Drbalamt: string;
  total_Drtotamt: string;
  total_Drmonamt: string;
  total_Crmonamt: string;
  total_Crtotamt: string;
  total_Crbalamt: string;
}

function getDayOfWeek(date: Date) {
  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
  return daysOfWeek[date.getDay()];
}

const AC_B2060W_SUM_PRINT = (data: any) => {
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
  const custnm = UseGetValueFromSessionItem("custnm");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";

  //조회조건 초기값
  const [filters, setFilters] = useState({
    workType: "REPORT2",
    orgdiv: sessionOrgdiv,
    stddt: new Date(),
    acntdt: new Date(),
    acseq1: "",
    reportgb: "01",
    acntgrpcd: "",
    position: "",
    companyCode: companyCode,
    find_row_value: "",
    pgNum: 1,
    pgSize: PAGE_SIZE,
    isSearch: false,
  });

  const [totals, setTotals] = useState<Totals>({
    total_Drbalamt: "",
    total_Drtotamt: "",
    total_Drmonamt: "",
    total_Crmonamt: "",
    total_Crtotamt: "",
    total_Crbalamt: "",
  });

  useEffect(() => {
    if (data !== null && permissions.view) {
      setFilters((prev) => ({
        ...prev,
        stddt: data.stddt,
        isSearch: true,
      }));
    }
  }, [data, permissions]);

  useEffect(() => {
    if (data !== null && permissions.view && filters.isSearch) {
      fetchMainData(filters);
    }
  }, [filters, permissions]);

  //그리드 데이터 조회
  const fetchMainData = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_B2060W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_stddt": convertDateToStr(filters.stddt).substring(0, 6),
        "@p_acntdt": "",
        "@p_acseq1": "",
        "@p_reportgb": "01",
        "@p_acntgrpcd": filters.acntgrpcd,
        "@p_position": "",
        "@p_company_code": filters.companyCode,
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
      const rows2 = data.tables[1].Rows[0];
      console.log(rows2);
      if (totalRowCnt > 0) {
        setMainDataResult(rows);
        setTotal(totalRowCnt);
        setTotals((prevTotals) => ({
          ...prevTotals,
          total_Drbalamt: rows2.drbalamt,
          total_Drtotamt: rows2.drtotamt,
          total_Drmonamt: rows2.drmonamt,
          total_Crmonamt: rows2.crmonamt,
          total_Crtotamt: rows2.crtotamt,
          total_Crbalamt: rows2.crbalamt,
        }));
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setFilters((prev) => ({
      ...prev,
      stddt: data.stddt,
      isSearch: false,
    }));
  };
  const componentRef = useRef(null);

  return (
    <LandscapePrint>
      <>
        <ButtonContainer>
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
        {mainDataResult && mainDataResult.length > 0 && (
          <div className={styles.printable} ref={componentRef}>
            <>
              <div className={styles.header_wrap}>
                <div className={styles.center}>
                  <h1>합계잔액시산표</h1>
                  <p>
                    [ 기간{"  "}
                    {mainDataResult[0].frdt} - {mainDataResult[0].todt} ]
                  </p>
                  <div className={styles.row}>
                    <div className={styles.left}>
                      <p>회사명: {mainDataResult[0].compnm}</p>
                    </div>
                    <div className={styles.right}>
                      <p>
                        출력일자: {dateformat3(convertDateToStr(new Date()))}{" "}
                        {getDayOfWeek(new Date())}요일
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <table className={styles.tg}>
                <colgroup>
                  <col width="14%" />
                  <col width="14%" />
                  <col width="14%" />
                  <col width="16%" />
                  <col width="14%" />
                  <col width="14%" />
                  <col width="14%" />
                </colgroup>
                <tbody>
                  <>
                    <tr>
                      <th>차변잔액</th>
                      <th>차변합계</th>
                      <th>차변당월</th>
                      <th>계정과목</th>
                      <th>대변당월</th>
                      <th>대변합계</th>
                      <th>대변잔액</th>
                    </tr>
                    {mainDataResult.map((item: any) => (
                      <tr
                        className={styles.noBorderRow}
                        style={
                          item.p_border === "Y"
                            ? { backgroundColor: "#d9d9d9", fontWeight: "bold" }
                            : item.color !== ""
                            ? { color: item.color, fontWeight: "bold" }
                            : {}
                        }
                      >
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {item.drbalamt}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {item.drtotamt}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {item.drmonamt}
                        </td>
                        <td
                          style={{ textAlign: "center", paddingRight: "3px" }}
                        >
                          {item.acntnm}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {item.crmonamt}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {item.crtotamt}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {item.crbalamt}
                        </td>
                      </tr>
                    ))}

                    <tr
                      style={{
                        fontWeight: "bold",
                      }}
                    >
                      <td style={{ textAlign: "right", paddingRight: "3px" }}>
                        {totals.total_Drbalamt}
                      </td>
                      <td style={{ textAlign: "right", paddingRight: "3px" }}>
                        {totals.total_Drtotamt}
                      </td>
                      <td style={{ textAlign: "right", paddingRight: "3px" }}>
                        {totals.total_Drmonamt}
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                        }}
                      >
                        합&nbsp;&nbsp;계
                      </td>
                      <td style={{ textAlign: "right", paddingRight: "3px" }}>
                        {totals.total_Crmonamt}
                      </td>
                      <td style={{ textAlign: "right", paddingRight: "3px" }}>
                        {totals.total_Crtotamt}
                      </td>
                      <td style={{ textAlign: "right", paddingRight: "3px" }}>
                        {totals.total_Crbalamt}
                      </td>
                    </tr>
                  </>
                </tbody>
              </table>
            </>
          </div>
        )}
      </>
    </LandscapePrint>
  );
};

export default AC_B2060W_SUM_PRINT;
