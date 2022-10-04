import React, { useCallback, useEffect, useState } from "react";
import { useApi } from "../../hooks/api";
import { Iparameters } from "../../store/types";

const CashDisbursementVoucher = (data: any) => {
  const processApi = useApi();
  const [mainDataResult, setMainDataResult] = useState([]);

  const parameters: Iparameters = {
    procedureName: "web_sel_prints",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": "A",
      "@p_orgdiv": "",
      "@p_recdt": "",
      "@p_seq": "",
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) setMainDataResult(rows);
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
  };

  return (
    <div id="CashDisbursementVoucher" className="printable">
      <table className="top_tb">
        <colgroup>
          <col width="14.3%" />
          <col width="auto" />
          <col width="auto" />
          <col width="auto" />
          <col width="5%" />
          <col width="12%" />
          <col width="12%" />
          <col width="12%" />
        </colgroup>
        <tbody>
          <tr>
            <th colSpan={4}>
              <span className="logo" />
            </th>
            <th colSpan={4} className="title">
              지 출 결 의 서
            </th>
          </tr>
          <tr>
            <th>발의일</th>
            <td />
            <th>발의인</th>
            <td />
            <th rowSpan={3}>
              결<br />재
            </th>
            <th>담당</th>
            <th>검토</th>
            <th>승인</th>
          </tr>
          <tr>
            <th rowSpan={2} className="important-cell">
              지출총액
            </th>
            <td rowSpan={2} colSpan={3} className="important-cell" />
            <td />
            <td />
            <td />
          </tr>
          <tr>
            <td />
            <td />
            <td />
          </tr>
        </tbody>
      </table>
      <table className="title_tb important-cell">
        <tbody>
          <tr>
            <th>사용일자</th>
            <th colSpan={2}>지불처</th>
            <th colSpan={2}>고객사명</th>
            <th colSpan={2}>결의서 NO</th>
          </tr>
          <tr>
            <th>증빙서류</th>
            <th>예산항목</th>
            <th colSpan={2}>계정과목</th>
            <th>공급가액</th>
            <th>세액</th>
            <th>합계금액</th>
          </tr>
        </tbody>
      </table>
      <table className="main_tb">
        <tbody>
          <tr>
            <td />
            <td colSpan={2} />
            <td colSpan={2} />
            <td colSpan={2} />
          </tr>
          <tr>
            <td />
            <td />
            <td colSpan={2} />
            <td className="number" />
            <td className="number" />
            <td className="number" />
          </tr>
          <tr>
            <th className="important-cell">비고</th>
            <td colSpan={6} />
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CashDisbursementVoucher;
