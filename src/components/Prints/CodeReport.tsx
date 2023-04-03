import React, { useRef, useCallback, useEffect, useState } from "react";
import { ButtonContainer, LandscapePrint } from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { Iparameters } from "../../store/types";
import { convertDateToStr, numberWithCommas } from "../CommonFunction";
import ReactToPrint from "react-to-print";
import { Button } from "@progress/kendo-react-buttons";

const CodeReport = (data: any) => {
  const [mainDataResult, setMainDataResult] = useState<any>(null);

  useEffect(() => {
    if (data.data.total !== 0) {
      setMainDataResult(data.data);
    }
  }, [data]);

  console.log(mainDataResult)
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
            idx1 === 0 || idx1 % 10 === 0 ? (
              <>
                <table className="main_tb">
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
                          <td className="number">{numberWithCommas(item2.dramt)}</td>
                          <td className="number">{numberWithCommas(item2.cramt)}</td>
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
