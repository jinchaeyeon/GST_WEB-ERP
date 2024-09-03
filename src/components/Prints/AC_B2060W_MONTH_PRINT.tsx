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
  dateformat3
} from "../CommonFunction";
import { PAGE_SIZE } from "../CommonString";
import styles from "./AC_B2060W_MONTH_PRINT.module.css";

function getDayOfWeek(date: Date) {
  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
  return daysOfWeek[date.getDay()];
}

const AC_B2060W_MONTH_PRINT = (data: any) => {
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
  const [compnm, setCompnm] = useState<string>("");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";

  //조회조건 초기값
  const [filters, setFilters] = useState({
    workType: "TAB6",
    orgdiv: sessionOrgdiv,
    stddt: new Date(),
    acntdt: new Date(),
    acseq1: "",
    reportgb: "",
    acntgrpcd: "",
    position: "",
    companyCode: companyCode,
    find_row_value: "",
    pgNum: 1,
    pgSize: PAGE_SIZE,
    isSearch: false,
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
        "@p_reportgb": filters.reportgb,
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
      const companyName = data.tables[1].Rows[0].compnm;
      setCompnm(companyName);
      if (totalRowCnt > 0) {
        setMainDataResult(rows);
        setTotal(totalRowCnt);
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
                  <h1>월차손익분석표</h1>
                  <div className={styles.row}>
                    <div className={styles.left}>
                      <p>회사명: {compnm}</p>
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
                  <col width="22%" />
                  <col width="13%" />
                  <col width="13%" />
                  <col width="13%" />
                  <col width="13%" />
                  <col width="13%" />
                  <col width="13%" />
                  <col width="13%" />
                  <col width="13%" />
                  <col width="13%" />
                  <col width="13%" />
                  <col width="13%" />
                  <col width="13%" />
                  <col width="13%" />
                </colgroup>
                <tbody>
                  <>
                    <tr>
                      <th>계정과목</th>
                      <th>1월</th>
                      <th>2월</th>
                      <th>3월</th>
                      <th>4월</th>
                      <th>5월</th>
                      <th>6월</th>
                      <th>7월</th>
                      <th>8월</th>
                      <th>9월</th>
                      <th>10월</th>
                      <th>11월</th>
                      <th>12월</th>
                      <th>合 計</th>
                    </tr>
                    {mainDataResult.map((item: any, index: number) => (
                      <tr
                        style={
                          item.p_border === "Y"
                            ? { backgroundColor: "#d9d9d9", fontWeight: "bold" }
                            : {}
                        }
                      >
                        <td style={{ textAlign: "left", paddingRight: "3px" }}>
                          {item.subject}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {item["01"]}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {item["02"]}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {item["03"]}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {item["04"]}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {item["05"]}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {item["06"]}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {item["07"]}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {item["08"]}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {item["09"]}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {item["10"]}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {item["11"]}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {item["12"]}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {item["合 計"]}
                        </td>
                      </tr>
                    ))}
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

export default AC_B2060W_MONTH_PRINT;
