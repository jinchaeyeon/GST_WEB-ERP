import React, { useRef, useCallback, useEffect, useState } from "react";
import { ButtonContainer, LandscapePrint } from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { Iparameters } from "../../store/types";
import { convertDateToStr, numberWithCommas, toDate } from "../CommonFunction";
import ReactToPrint from "react-to-print";
import { Button } from "@progress/kendo-react-buttons";
import { DataResult, process, State } from "@progress/kendo-data-query";
import { PAGE_SIZE } from "../CommonString";

const ReplaceTaxReport = (data?: any) => {
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const processApi = useApi();

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    location: "",
    acntdt: new Date(),
    position: "",
    inoutdiv: "",
    files: "",
    attdatnum: "",
    acseq1: 0,
    ackey: "",
    actdt: new Date(),
    apperson: "",
    approvaldt: "",
    closeyn: "",
    consultdt: "",
    consultnum: 0,
    custnm: "",
    dptcd: "",
    inputpath: "",
    remark3: "",
    slipdiv: "",
    sumslipamt: 0,
    sumslipamt_1: 0,
    sumslipamt_2: 0,
    bizregnum: "",
    mngamt: 0,
    rate: 0,
    usedptcd: "",
    propertykind: "",
    evidentialkind: "",
    creditcd: "",
    reason_intax_deduction: "",
  });

  const parameters: Iparameters = {
    procedureName: "P_AC_A1000W_Q",
    pageNumber: 1,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "DETAIL",
      "@p_orgdiv": filters.orgdiv,
      "@p_actdt": convertDateToStr(filters.acntdt),
      "@p_acseq1": filters.acseq1,
      "@p_acnum": "",
      "@p_acseq2": 0,
      "@p_acntcd": "",
      "@p_frdt": "",
      "@p_todt": "",
      "@p_location": filters.location,
      "@p_person": "",
      "@p_inputpath": "",
      "@p_custcd": "",
      "@p_custnm": "",
      "@p_slipdiv": "",
      "@p_remark3": "",
      "@p_maxacseq2": 0,
      "@p_framt": 0,
      "@p_toamt": 0,
      "@p_position": filters.position,
      "@p_inoutdiv": filters.inoutdiv,
      "@p_drcrdiv": "",
      "@p_actdt_s": "",
      "@p_acseq1_s": "",
      "@p_printcnt_s": "",
      "@p_rowstatus_s": "",
      "@p_chk_s": "",
      "@p_ackey_s": "",
      "@p_acntnm": "",
      "@p_find_row_value": "",
    },
  };

  useEffect(() => {
    if (data.data != undefined) {
      data.data.map((item: any) => {
        const fetchMainGrid = async (items: any) => {
          let data: any;
          const parameters2: Iparameters = {
            procedureName: "P_AC_A1000W_Q",
            pageNumber: 1,
            pageSize: 20,
            parameters: {
              "@p_work_type": "DETAIL",
              "@p_orgdiv": items.orgdiv,
              "@p_actdt": items.acntdt,
              "@p_acseq1": items.acseq1,
              "@p_acnum": "",
              "@p_acseq2": 0,
              "@p_acntcd": "",
              "@p_frdt": "",
              "@p_todt": "",
              "@p_location": items.location,
              "@p_person": "",
              "@p_inputpath": "",
              "@p_custcd": "",
              "@p_custnm": "",
              "@p_slipdiv": "",
              "@p_remark3": "",
              "@p_maxacseq2": 0,
              "@p_framt": 0,
              "@p_toamt": 0,
              "@p_position": items.position,
              "@p_inoutdiv": items.inoutdiv,
              "@p_drcrdiv": "",
              "@p_actdt_s": "",
              "@p_acseq1_s": "",
              "@p_printcnt_s": "",
              "@p_rowstatus_s": "",
              "@p_chk_s": "",
              "@p_ackey_s": "",
              "@p_acntnm": "",
              "@p_find_row_value": "",
            },
          };
          try {
            data = await processApi<any>("procedure", parameters2);
          } catch (error) {
            data = null;
          }

          if (data.isSuccess === true) {
            const totalRowCnt = data.tables[0].TotalRowCount;
            const rows = data.tables[0].Rows;

            if (totalRowCnt > 0) {
              setMainDataResult((prev) => {
                return {
                  data: [...prev.data, ...[rows]],
                  total: totalRowCnt == -1 ? 0 : totalRowCnt,
                };
              });
            }
          }
        };
        fetchMainGrid(item);
      });
    }
  }, []);

  const componentRef = useRef(null);

  return (
    <LandscapePrint>
      <ButtonContainer>
        <></>
        <ReactToPrint
          trigger={() => (
            <Button fillMode="outline" themeColor={"primary"} icon="print">
              출력
            </Button>
          )}
          content={() => componentRef.current}
        />
      </ButtonContainer>

      <div
        id="WorkDailyReport"
        className="printable landscape"
        ref={componentRef}
      >
        {data.Type == "M" ? (
          <div>
            <div className="title_container">
              <h1 className="title">대체전표</h1>
              <table className="tb_approval right">
                <tbody>
                  <tr>
                    <th>담당</th>
                    <th>검토</th>
                    <th>승인</th>
                  </tr>
                  <tr className="contents">
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h4>회사명: (주)지에스티</h4>
            {mainDataResult != null &&
              mainDataResult.data.map((item: any, idx: number) => (
                <div>
                  {item != null &&
                    item.map((item1: any, idx1: number) =>
                      idx1 === 0 || idx1 % 10 === 0 ? (
                        <>
                          <table className="main_tb" style={{ width: "100%" }}>
                            <colgroup>
                              <col width="14%" />
                              <col width="15%" />
                              <col width="10%" />
                              <col width="10%" />
                              <col width="auto" />
                            </colgroup>
                            <tbody>
                              <tr>
                                <th>전표일자</th>
                                <th>계정과목</th>
                                <th>차변금액</th>
                                <th>대변금액</th>
                                <th>적요</th>
                              </tr>
                              {item.map((item2: any, idx2: number) =>
                                idx1 + 10 > idx2 && idx1 <= idx2 ? (
                                  <tr key={item2.ackey}>
                                    <td className="center">
                                      {item2.acntdt}
                                      <br />
                                      {item2.acseq1} - {item2.acseq2}
                                    </td>
                                    <td>{item2.acntnm}</td>
                                    <td className="number">
                                      {numberWithCommas(item2.slipamt_1)}
                                    </td>
                                    <td className="number">
                                      {numberWithCommas(item2.slipamt_2)}
                                    </td>
                                    <td>
                                      {item2.remark3}
                                      <br />
                                      {item2.custcd} &nbsp;{item2.custnm}
                                    </td>
                                  </tr>
                                ) : (
                                  ""
                                )
                              )}
                              <tr style={{ backgroundColor: "#EEEEEE" }}>
                                <td className="center" colSpan={2}>
                                  [합계]
                                </td>
                                <td className="number">
                                  {numberWithCommas(item1.total_slipamt_1)}
                                </td>
                                <td className="number">
                                  {numberWithCommas(item1.total_slipamt_2)}
                                </td>
                                <td></td>
                              </tr>
                            </tbody>
                          </table>
                          {data.Type == "S" ? (
                            <div style={{ pageBreakBefore: "always" }} />
                          ) : (
                            ""
                          )}
                        </>
                      ) : (
                        ""
                      )
                    )}
                </div>
              ))}
          </div>
        ) : (
          mainDataResult != null &&
          mainDataResult.data.map((item: any, idx: number) => (
            <div>
              {idx != 0 ? ( <div style={{ pageBreakAfter: "always" }}/>) : (<div/>)}
              <div className="title_container">
                <h1 className="title">대체전표</h1>
                <table className="tb_approval right">
                  <tbody>
                    <tr>
                      <th>담당</th>
                      <th>검토</th>
                      <th>승인</th>
                    </tr>
                    <tr className="contents">
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <h4>회사명: (주)지에스티</h4>
              {item != null &&
                item.map((item1: any, idx1: number) =>
                  idx1 === 0 || idx1 % 10 === 0 ? (
                    <>
                      <table
                        className="main_tb"
                        style={{ width: "100%", marginBottom: "200px" }}
                      >
                        <colgroup>
                          <col width="14%" />
                          <col width="15%" />
                          <col width="10%" />
                          <col width="10%" />
                          <col width="auto" />
                        </colgroup>
                        <tbody>
                          <tr>
                            <th>전표일자</th>
                            <th>계정과목</th>
                            <th>차변금액</th>
                            <th>대변금액</th>
                            <th>적요</th>
                          </tr>
                          {item.map((item2: any, idx2: number) =>
                            idx1 + 10 > idx2 && idx1 <= idx2 ? (
                              <tr key={item2.ackey}>
                                <td className="center">
                                  {item2.acntdt}
                                  <br />
                                  {item2.acseq1} - {item2.acseq2}
                                </td>
                                <td>{item2.acntnm}</td>
                                <td className="number">
                                  {numberWithCommas(item2.slipamt_1)}
                                </td>
                                <td className="number">
                                  {numberWithCommas(item2.slipamt_2)}
                                </td>
                                <td>
                                  {item2.remark3}
                                  <br />
                                  {item2.custcd} &nbsp;{item2.custnm}
                                </td>
                              </tr>
                            ) : (
                              ""
                            )
                          )}
                          <tr style={{ backgroundColor: "#EEEEEE" }}>
                            <td className="center" colSpan={2}>
                              [합계]
                            </td>
                            <td className="number">
                              {numberWithCommas(item1.total_slipamt_1)}
                            </td>
                            <td className="number">
                              {numberWithCommas(item1.total_slipamt_2)}
                            </td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </>
                  ) : (
                    ""
                  )
                )}
            </div>
          ))
        )}
      </div>
    </LandscapePrint>
  );
};

export default ReplaceTaxReport;
