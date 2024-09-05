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
} from "../CommonFunction";
import { PAGE_SIZE } from "../CommonString";
import styles from "./AC_B2060W_INCOME_PRINT.module.css";

const AC_B2060W_INCOME_PRINT = (data: any) => {
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
    workType: "TAB2",
    orgdiv: sessionOrgdiv,
    stddt: new Date(),
    acntdt: new Date(),
    acseq1: "",
    reportgb: "04",
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
        workType: data.workType,
        stddt: data.stddt,
        reportgb: data.reportgb,
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
      const totalRowCnt = data.tables[3].RowCount;
      const rows = data.tables[3].Rows;
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

  const getTitle = () => {
    switch (data.workType) {
      case "TAB2":
        return "손익계산서";  // report_inconme
      case "TAB3":
        return "제조원가명세서";  // report_cost
      case "TAB4":
        return "이익잉여금처분계산서";  // report_appr
      case "TAB5":
        return "재무상태표";  // report_fin
      default:
        return "손익계산서";
    }
  };

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
        <p>{getTitle()}</p>
        {mainDataResult && mainDataResult.length > 0 && (
          <div className={styles.printable} ref={componentRef}>
            <>
              <div className={styles.header_wrap}>
                <div className={styles.center}>
                  <h1>{getTitle()}</h1>
                  <p>{mainDataResult[0].nowdt}</p>
                  <p>{mainDataResult[0].beforedt}</p>
                </div>
              </div>
              <table className={styles.tg}>
                <tbody>
                  <>
                    <tr>
                      <th rowSpan={2} style={{ width: "20%" }}>
                        과목
                      </th>
                      <th colSpan={2} style={{ width: "40%" }}>
                        {mainDataResult[0].danggi}
                      </th>
                      <th colSpan={2} style={{ width: "40%" }}>
                        {mainDataResult[0].jungi}
                      </th>
                    </tr>
                    <tr>
                      <td style={{ textAlign: "center", width: "20%" }}>
                        금액
                      </td>
                      <td style={{ textAlign: "center", width: "20%" }}>
                        금액
                      </td>
                      <td style={{ textAlign: "center", width: "20%" }}>
                        금액
                      </td>
                      <td style={{ textAlign: "center", width: "20%" }}>
                        금액
                      </td>
                    </tr>
                    {mainDataResult.map((item: any) => (
                      <tr
                        className={styles.noBorderRow}
                        style={
                          item.p_border === "Y"
                            ? { backgroundColor: "#d9d9d9", fontWeight: "bold" }
                            : item.p_color && item.p_color!== ""
                            ? { color: item.p_color, fontWeight: "bold" }
                            : {}
                        }
                      >
                        <td
                          style={{ textAlign: "center", paddingRight: "3px" }}
                        >
                          {item.subject}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {item.thisyear1}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {item.thisyear2}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {item.lastyear1}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "3px" }}>
                          {item.lastyear2}
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

export default AC_B2060W_INCOME_PRINT;
