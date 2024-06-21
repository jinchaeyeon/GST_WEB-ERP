import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { useEffect, useRef, useState } from "react";
import ReactToPrint from "react-to-print";
import { ButtonContainer, LandscapePrint } from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { Iparameters, TPermissions } from "../../store/types";
import {
  UsePermissions,
  convertDateToStr,
  numberWithCommas,
} from "../CommonFunction";

const CodeReport = (filters: any) => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const processApi = useApi();

  const parameters: Iparameters = {
    procedureName: "P_AC_B1280W_Q",
    pageNumber: filters.data.pgNum,
    pageSize: filters.data.pgSize,
    parameters: {
      "@p_work_type": "LIST",
      "@p_orgdiv": filters.data.orgdiv,
      "@p_frdt": convertDateToStr(filters.data.frdt),
      "@p_todt": convertDateToStr(filters.data.todt),
      "@p_acntcd": filters.data.acntcd,
      "@p_acntnm": filters.data.acntnm,
      "@p_stdrmkcd": filters.data.stdrmkcd,
      "@p_stdrmknm": filters.data.stdrmknm,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    if (!permissions.view) return;
    let data: any;
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
    }
  };

  useEffect(() => {
    if (mainDataResult.total == 0 && permissions.view) {
      fetchMainGrid();
    }
  }, [permissions]);

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

      <div
        id="WorkDailyReport"
        className="printable landscape"
        ref={componentRef}
      >
        <div className="title_container">
          <h1 className="title">단축코드별리스트</h1>
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

        {mainDataResult != null &&
          mainDataResult.data.map((item1: any, idx1: number) =>
            idx1 == 0 || idx1 % 10 == 0 ? (
              <>
                <table className="main_tb" style={{ width: "100%" }}>
                  <colgroup>
                    <col width="10%" />
                    <col width="8%" />
                    <col width="8%" />
                    <col width="8%" />
                    <col width="8%" />
                    <col width="auto" />
                    <col width="9%" />
                  </colgroup>
                  <tbody>
                    <tr>
                      <th>전표번호</th>
                      <th>계정과목</th>
                      <th>단축코드</th>
                      <th>차변금액</th>
                      <th>대변금액</th>
                      <th>적요</th>
                      <th>거래처</th>
                    </tr>
                    {mainDataResult.data.map((item2: any, idx2: number) =>
                      idx1 + 10 > idx2 && idx1 <= idx2 ? (
                        <tr key={item2.ackey}>
                          <td className="center">{item2.ackey}</td>
                          <td>{item2.acntnm}</td>
                          <td>{item2.stdrmknm1}</td>
                          <td className="number">
                            {numberWithCommas(item2.dramt)}
                          </td>
                          <td className="number">
                            {numberWithCommas(item2.cramt)}
                          </td>
                          <td>{item2.remark3}</td>
                          <td className="center">{item2.custnm}</td>
                        </tr>
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

export default CodeReport;
