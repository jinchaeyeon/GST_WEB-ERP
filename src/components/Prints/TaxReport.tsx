import React, { useRef, useCallback, useEffect, useState } from "react";
import { ButtonContainer, LandscapePrint } from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { Iparameters } from "../../store/types";
import { convertDateToStr, numberWithCommas } from "../CommonFunction";
import ReactToPrint from "react-to-print";
import { Button } from "@progress/kendo-react-buttons";

const TaxReport = (data: any) => {
  const [mainDataResult, setMainDataResult] = useState<any>(null);

  useEffect(() => {
    if (data.data.total !== 0) {
      setMainDataResult(data.data);
    }
  }, [data]);

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
          <h1 className="title">세금계산서조회</h1>
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
                    <col width="8%" />
                    <col width="8%" />
                    <col width="10%" />
                    <col width="8%" />
                    <col width="auto" />
                    <col width="10%" />
                    <col width="8%" />
                  </colgroup>
                  <tbody>
                    <tr>
                      <th>계산서일자</th>
                      <th>업체명</th>
                      <th>공급가액</th>
                      <th>세액</th>
                      <th>거래품목</th>
                      <th>계산서유형</th>
                      <th>출력유무</th>
                    </tr>
                    {mainDataResult.data.map((item2: any, idx2: number) =>
                      idx1 + 10 > idx2 && idx1 <= idx2 ? (
                        <tr key={item2.num}>
                          <td className="center">{item2.reqdt}</td>
                          <td>{item2.custnm}</td>
                          <td className="number">{numberWithCommas(item2.splyamt)}</td>
                          <td className="number">{numberWithCommas(item2.taxamt)}</td>
                          <td>{item2.items}</td>
                          <td>{item2.taxtype}</td>
                          <td>{item2.prtyn}</td>
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

export default TaxReport;
