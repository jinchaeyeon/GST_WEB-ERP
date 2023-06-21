import React, { useRef, useCallback, useEffect, useState } from "react";
import { ButtonContainer, LandscapePrint } from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { Iparameters } from "../../store/types";
import { UseGetValueFromSessionItem, convertDateToStr, numberWithCommas } from "../CommonFunction";
import ReactToPrint from "react-to-print";
import { Button } from "@progress/kendo-react-buttons";
import { DataResult, process, State } from "@progress/kendo-data-query";

const DaliyReport = (filters: any) => {
  const userId = UseGetValueFromSessionItem("user_id");
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const processApi = useApi();

  const parameters: Iparameters = {
    procedureName: "P_CM_A1000W_Q",
    pageNumber: filters.data.pgNum,
    pageSize: filters.data.pgSize,
    parameters: {
      "@p_work_type": "daliy_report",
      "@p_orgdiv": filters.data.orgdiv,
      "@p_frdt": convertDateToStr(filters.data.frdt),
      "@p_todt": convertDateToStr(filters.data.todt),
      "@p_datnum": "",
      "@p_title": "",
      "@p_kind1": "",
      "@p_planyn": "",
      "@p_person": userId,
      "@p_user_id": userId,
      "@p_yyyymm": convertDateToStr(filters.data.todt).substring(0, 6),
      "@p_find_row_value": filters.data.find_row_value,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    // if (!permissions?.view) return;
    let data: any;
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
 
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        setMainDataResult((prev) => {
          return {
            data: rows,
            total: totalRowCnt,
          };
        });
      }
    }
  };

  useEffect(() => {
    if(mainDataResult.total == 0){
      fetchMainGrid();
    }
  });


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
        <div className="title_container">
          <h1 className="title">일일업무일지</h1>
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
        <table style={{width: "100%"}}>
            <tbody>
              <tr>
                <th style={{backgroundColor: "#D3D3D3"}}>작성일</th>
                <td style={{textAlign: "center"}}>{mainDataResult.data.length == 0 ? "" : mainDataResult.data[0].recdt}</td>
                <th style={{backgroundColor: "#D3D3D3"}}>업무지시</th>
                <td style={{textAlign: "center"}}>{mainDataResult.data.length == 0 ? "" : mainDataResult.data[0].total_exptime}</td>
                <th style={{backgroundColor: "#D3D3D3"}}>출근시간</th>
                <td style={{textAlign: "center"}}>{mainDataResult.data.length == 0 ? "" : mainDataResult.data[0].workstart}</td>
                <th style={{backgroundColor: "#D3D3D3"}}>퇴근시간</th>
                <td style={{textAlign: "center"}}>{mainDataResult.data.length == 0 ? "" : mainDataResult.data[0].workend}</td>
                <th style={{backgroundColor: "#D3D3D3"}}>지각여부</th>
                <td style={{textAlign: "center"}}>{mainDataResult.data.length == 0 ? "" : mainDataResult.data[0].is_late}</td>
              </tr>
              <tr>
                <th style={{backgroundColor: "#D3D3D3"}}>작성자</th>
                <td style={{textAlign: "center"}}>{mainDataResult.data.length == 0 ? "" : mainDataResult.data[0].writer}</td>
                <th style={{backgroundColor: "#D3D3D3"}}>소요시간</th>
                <td style={{textAlign: "center"}}>{mainDataResult.data.length == 0 ? "" : mainDataResult.data[0].total_usetime}</td>
                <th style={{backgroundColor: "#D3D3D3"}}>신규</th>
                <td style={{textAlign: "center"}}>{mainDataResult.data.length == 0 ? "" : mainDataResult.data[0].cnt1}</td>
                <th style={{backgroundColor: "#D3D3D3"}}>수정</th>
                <td style={{textAlign: "center"}}>{mainDataResult.data.length == 0 ? "" : mainDataResult.data[0].cnt2}</td>
                <th style={{backgroundColor: "#D3D3D3"}}>오류</th>
                <td style={{textAlign: "center"}}>{mainDataResult.data.length == 0 ? "" : mainDataResult.data[0].cnt3}</td>
              </tr>
            </tbody>
          </table>
        {mainDataResult != null &&
          mainDataResult.data.map((item1: any, idx1: number) =>
            idx1 === 0 || idx1 % 10 === 0 ? (
              <>
                <table className="main_tb" style={{width: "100%"}}>
                  <tbody>
                    {mainDataResult.data.map((item2: any, idx2: number) =>
                      idx1 + 10 > idx2 && idx1 <= idx2 ? (
                        <>
                        <tr>
                          <th style={{backgroundColor: "#D3D3D3"}}>고객사</th>
                          <td colSpan={3} className="center">{item2.custnm}</td>
                          <th style={{backgroundColor: "#D3D3D3"}}>제목</th>
                          <td colSpan={5}>{item2.title}</td>
                          <th style={{backgroundColor: "#D3D3D3"}}>구분</th>
                          <td>{item2.kind1_name}</td>
                          <th style={{backgroundColor: "#D3D3D3"}}>ET</th>
                          <td className="number">{numberWithCommas(item2.expect_time)}</td>
                          <th style={{backgroundColor: "#D3D3D3"}}>AT</th>
                          <td className="number">{numberWithCommas(item2.usetime)}</td>
                          <th style={{backgroundColor: "#D3D3D3"}}>DT</th>
                          <td className="number">{numberWithCommas(item2.over_time)}</td>
                        </tr>
                        <tr>
                          <td colSpan={18}>{item2.contents}</td>
                        </tr>
                        </>
                      ) : (
                        ""
                      )
                    )}
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

export default DaliyReport;
