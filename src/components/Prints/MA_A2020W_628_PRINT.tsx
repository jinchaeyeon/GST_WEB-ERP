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
import styles from "./MA_A2020W_628_PRINT.module.css";

const MA_B2020W_628_PRINT = (data: any) => {
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

  function isInteger(number: number) {
    if (number % 1 === 0) {
      return numberWithCommas(number);
    } else {
      return numberWithCommas(parseFloat(number.toFixed(2)));
    }
  }

  useEffect(() => {
    if (data !== null && permissions.view) {
      fetchMainData(data.data, data.rows);
    }
  }, [data, permissions]);

  //그리드 데이터 조회
  const fetchMainData = async (para: any, rows2: any[]) => {
    if (!permissions.view) return;
    let data: any;

    let rowsarray: any[] = [];
    rows2.map((item: any) => {
      rowsarray.push(item.ordnum + item.ordseq + ",");
    });

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_MA_A2020W_628_Q",
      pageNumber: para.pgNum,
      pageSize: 500,
      parameters: {
        "@p_work_type": "PRINT",
        "@p_orgdiv": para.orgdiv,
        "@p_frdt": convertDateToStr(para.frdt),
        "@p_todt": convertDateToStr(para.todt),
        "@p_custcd": para.custcd,
        "@p_custnm": para.custnm,
        "@p_chkyn": para.chkyn,
        "@p_gubun": para.gubun,
        "@p_kind": para.kind,
        "@p_location": para.location,
        "@p_itemnm": para.itemnm,
        "@p_pgubun": para.pgubun,
        "@p_taxdiv": para.taxdiv,
        "@p_itemsts": para.itemsts,
        "@p_rows": rowsarray.join(","),
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

      let array: any[] = [];

      if (totalRowCnt > 0) {
        if (para.pgubun == "8") {
          rows.map((item1: any, idx1: number) => {
            if (idx1 == 0 || idx1 % 34 == 0) {
              rows.map((item2: any, idx2: number) => {
                if (idx1 + 34 > idx2 && idx1 <= idx2) {
                  if (idx2 != 0 && before_itemnm !== item2.itemnm) {
                    before_itemnm = item2.itemnm;
                    sum_temp_qty = sum_qty;
                    sum_temp_sqty = sum_sqty;
                    sum_temp_count = sum_count;
                    sum_qty = 0;
                    sum_sqty = 0;
                    sum_count = 0;
                    sum_qty += item2.qty;
                    sum_sqty += item2.sqty;
                    sum_count += 1;
                    before_itemnm = item2.itemnm;

                    let temp = {
                      type: "s",
                      temp_count: sum_temp_count,
                      temp_qty: isInteger(sum_temp_qty),
                      temp_sqty:
                        sum_temp_sqty == 0 ? "" : isInteger(sum_temp_sqty),
                    };
                    array.push(temp);
                    array.push(item2);

                    if (idx2 == totalRowCnt - 1) {
                      let temp2 = {
                        type: "s",
                        temp_count: 1,
                        temp_qty: isInteger(sum_qty),
                        temp_sqty: sum_sqty == 0 ? "" : isInteger(sum_sqty),
                      };

                      array.push(temp2);
                    }
                  } else {
                    sum_qty += item2.qty;
                    sum_sqty += item2.sqty;
                    sum_count += 1;
                    before_itemnm = item2.itemnm;

                    let items3 = {
                      ...item2,
                      itemnm: idx2 == 0 ? item2.itemnm : "",
                    };
                    array.push(items3);
                    if (idx2 == totalRowCnt - 1) {
                      let temp2 = {
                        type: "s",
                        temp_count: sum_count,
                        temp_qty: isInteger(sum_qty),
                        temp_sqty: isInteger(sum_sqty),
                      };

                      array.push(temp2);
                    }
                  }
                }
              });
            }
          });
        } else if (para.pgubun == "7") {
          rows.map((item1: any, idx1: number) => {
            if (idx1 == 0 || idx1 % 34 == 0) {
              rows.map((item2: any, idx2: number) => {
                if (idx1 + 34 > idx2 && idx1 <= idx2) {
                  if (idx2 != 0 && before_custnm !== item2.custnm) {
                    before_custnm = item2.custnm;
                    sum_temp_qty = sum_qty;
                    sum_temp_sqty = sum_sqty;
                    sum_temp_count = sum_count;
                    sum_qty = 0;
                    sum_sqty = 0;
                    sum_count = 0;
                    sum_qty += item2.qty;
                    sum_sqty += item2.sqty;
                    sum_count += 1;
                    before_custnm = item2.custnm;

                    let temp = {
                      type: "s",
                      temp_count: sum_temp_count,
                      temp_qty: isInteger(sum_temp_qty),
                      temp_sqty: isInteger(sum_temp_sqty),
                    };
                    array.push(temp);
                    array.push(item2);

                    if (idx2 == totalRowCnt - 1) {
                      let temp2 = {
                        type: "s",
                        temp_count: 1,
                        temp_qty: isInteger(sum_qty),
                        temp_sqty: isInteger(sum_sqty),
                      };

                      array.push(temp2);
                    }
                  } else {
                    sum_qty += item2.qty;
                    sum_sqty += item2.sqty;
                    sum_count += 1;
                    before_custnm = item2.custnm;

                    let items3 = {
                      ...item2,
                      custnm: idx2 == 0 ? item2.custnm : "",
                    };
                    array.push(items3);
                    if (idx2 == totalRowCnt - 1) {
                      let temp2 = {
                        type: "s",
                        temp_count: sum_count,
                        temp_qty: isInteger(sum_qty),
                        temp_sqty: isInteger(sum_sqty),
                      };

                      array.push(temp2);
                    }
                  }
                }
              });
            }
          });
        } else {
          rows.map((item1: any, idx1: number) => {
            if (idx1 == 0 || idx1 % 34 == 0) {
              rows.map((item2: any, idx2: number) => {
                if (idx1 + 34 > idx2 && idx1 <= idx2) {
                  if (idx2 != 0 && before_itemnm !== item2.itemnm) {
                    sum_temp_qty = sum_qty;
                    sum_temp_amt = sum_amt;
                    sum_temp_taxamt = sum_taxamt;
                    sum_temp_totamt = sum_totamt;
                    sum_temp_count = sum_count;
                    sum_qty = 0;
                    sum_amt = 0;
                    sum_taxamt = 0;
                    sum_totamt = 0;
                    sum_count = 0;
                    sum_qty += item2.qty;
                    sum_amt += item2.amt;
                    sum_taxamt += item2.taxamt;
                    sum_totamt += item2.totamt;
                    sum_count += 1;
                    before_itemnm = item2.itemnm;

                    let temp = {
                      type: "s",
                      temp_count: sum_temp_count,
                      temp_qty: isInteger(sum_temp_qty),
                      temp_amt: isInteger(sum_temp_amt),
                      temp_taxamt: isInteger(sum_temp_taxamt),
                      temp_totamt: isInteger(sum_temp_totamt),
                    };
                    array.push(temp);
                    array.push(item2);

                    if (idx2 == totalRowCnt - 1) {
                      let temp2 = {
                        type: "s",
                        temp_count: 1,
                        temp_qty: isInteger(sum_qty),
                        temp_amt: isInteger(sum_amt),
                        temp_taxamt: isInteger(sum_taxamt),
                        temp_totamt: isInteger(sum_totamt),
                      };

                      array.push(temp2);
                    }
                  } else {
                    sum_qty += item2.qty;
                    sum_amt += item2.amt;
                    sum_taxamt += item2.taxamt;
                    sum_totamt += item2.totamt;
                    sum_count += 1;
                    before_itemnm = item2.itemnm;

                    let items3 = {
                      ...item2,
                      itemnm: idx2 == 0 ? item2.itemnm : "",
                    };
                    array.push(items3);
                    if (idx2 == totalRowCnt - 1) {
                      let temp2 = {
                        type: "s",
                        temp_count: sum_count,
                        temp_qty: isInteger(sum_qty),
                        temp_amt: isInteger(sum_amt),
                        temp_taxamt: isInteger(sum_taxamt),
                        temp_totamt: isInteger(sum_totamt),
                      };

                      array.push(temp2);
                    }
                  }
                }
              });
            }
          });
        }

        if (array.length > 0) {
          setMainDataResult(array);
          setTotal(totalRowCnt);
        }
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
  };

  const componentRef = useRef(null);
  let before_itemnm = "";
  let before_custnm = "";
  let sum_qty = 0;
  let sum_sqty = 0;
  let sum_count = 0;
  let sum_amt = 0;
  let sum_taxamt = 0;
  let sum_totamt = 0;
  let sum_temp_qty = 0;
  let sum_temp_sqty = 0;
  let sum_temp_count = 0;
  let sum_temp_amt = 0;
  let sum_temp_taxamt = 0;
  let sum_temp_totamt = 0;

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
        {data.data.pgubun == "8" ? (
          <>
            {mainDataResult !== null &&
              mainDataResult.map((item1: any, idx1: number) =>
                idx1 == 0 || idx1 % 34 == 0 ? (
                  <>
                    <div className={styles.header_wrap}>
                      <div className={styles.left}>
                        <p>{custnm}</p>
                      </div>
                      <div className={styles.center}>
                        <h1>품명별 합계</h1>
                        <p>
                          출고일자:{" "}
                          {dateformat2(convertDateToStr(data.data.frdt))} ~{" "}
                          {dateformat2(convertDateToStr(data.data.todt))}
                        </p>
                      </div>
                      <div className={styles.right}>
                        <p>출력일시: {convertDateToStrWithTime2(new Date())}</p>
                      </div>
                    </div>
                    <table className={styles.tg}>
                      <colgroup>
                        <col width="20%" />
                        <col width="15%" />
                        <col width="10%" />
                        <col width="10%" />
                        <col width="15%" />
                        <col width="15%" />
                        <col width="15%" />
                      </colgroup>
                      <tbody>
                        <>
                          <tr style={{ backgroundColor: "#e6e6e6" }}>
                            <th>품목명</th>
                            <th>사이즈</th>
                            <th>수주량(kg)</th>
                            <th>소분량</th>
                            <th>납품처</th>
                            <th>비고</th>
                            <th>대리점명</th>
                          </tr>
                          {mainDataResult.map((item2: any, idx2: number) =>
                            idx1 + 34 > idx2 && idx1 <= idx2 ? (
                              item2.type == "s" ? (
                                <>
                                  <tr
                                    key={item2.rownum}
                                    style={{
                                      backgroundColor: "#e6e6e6",
                                      textAlign: "center",
                                    }}
                                  >
                                    <td colSpan={2}>
                                      소 계({item2.temp_count})
                                    </td>
                                    <td
                                      style={{
                                        textAlign: "right",
                                        paddingRight: "3px",
                                      }}
                                    >
                                      {item2.temp_qty}
                                    </td>
                                    <td
                                      style={{
                                        textAlign: "center",
                                      }}
                                    >
                                      {item2.temp_sqty}
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                  </tr>
                                  {idx2 == mainDataResult.length - 1 ? (
                                    <tr
                                      style={{
                                        backgroundColor: "#e6e6e6",
                                        textAlign: "center",
                                      }}
                                    >
                                      <td colSpan={2}>합 계 ({total})</td>
                                      <td
                                        style={{
                                          textAlign: "right",
                                          paddingRight: "3px",
                                        }}
                                      >
                                        {isInteger(mainDataResult[0].total_qty)}
                                      </td>
                                      <td>
                                        {mainDataResult[0].total_sqty == 0
                                          ? ""
                                          : isInteger(
                                              mainDataResult[0].total_sqty
                                            )}
                                      </td>
                                      <td></td>
                                      <td></td>
                                      <td></td>
                                    </tr>
                                  ) : (
                                    <></>
                                  )}
                                </>
                              ) : (
                                <tr key={item2.rownum}>
                                  <td>{item2.itemnm}</td>
                                  <td>{item2.ordsiz}</td>
                                  <td
                                    style={{
                                      textAlign: "right",
                                      paddingRight: "3px",
                                    }}
                                  >
                                    {numberWithCommas(item2.qty)}
                                  </td>
                                  <td
                                    style={{
                                      textAlign: "center",
                                    }}
                                  >
                                    {item2.sqty == 0
                                      ? ""
                                      : numberWithCommas(item2.sqty)}
                                  </td>
                                  <td>{item2.rcvcustnm}</td>
                                  <td>{item2.remark}</td>
                                  <td>{item2.orgnm}</td>
                                </tr>
                              )
                            ) : (
                              <></>
                            )
                          )}
                        </>
                      </tbody>
                    </table>
                  </>
                ) : (
                  ""
                )
              )}
          </>
        ) : data.data.pgubun == "7" ? (
          <>
            {mainDataResult !== null &&
              mainDataResult.map((item1: any, idx1: number) =>
                idx1 == 0 || idx1 % 34 == 0 ? (
                  <>
                    <div className={styles.header_wrap}>
                      <div className={styles.left}>
                        <p>{custnm}</p>
                      </div>
                      <div className={styles.center}>
                        <h1>대리점별 합계</h1>
                        <p>
                          출고일자:{" "}
                          {dateformat2(convertDateToStr(data.data.frdt))} ~{" "}
                          {dateformat2(convertDateToStr(data.data.todt))}
                        </p>
                      </div>
                      <div className={styles.right}>
                        <p>출력일시: {convertDateToStrWithTime2(new Date())}</p>
                      </div>
                    </div>
                    <table className={styles.tg}>
                      <colgroup>
                        <col width="20%" />
                        <col width="25%" />
                        <col width="25%" />
                        <col width="15%" />
                        <col width="15%" />
                      </colgroup>
                      <tbody>
                        <>
                          <tr
                            style={{
                              backgroundColor: "#e6e6e6",
                              textAlign: "center",
                            }}
                          >
                            <th>대리점명</th>
                            <th>품목명</th>
                            <th>사이즈</th>
                            <th>수주량(kg)</th>
                            <th>소분량</th>
                          </tr>
                          {mainDataResult.map((item2: any, idx2: number) =>
                            idx1 + 34 > idx2 && idx1 <= idx2 ? (
                              item2.type == "s" ? (
                                <>
                                  <tr
                                    style={{
                                      backgroundColor: "#e6e6e6",
                                      textAlign: "center",
                                    }}
                                  >
                                    <td colSpan={2}>
                                      소 계({item2.temp_count})
                                    </td>
                                    <td></td>
                                    <td
                                      style={{
                                        textAlign: "right",
                                        paddingRight: "3px",
                                      }}
                                    >
                                      {item2.temp_qty}
                                    </td>
                                    <td
                                      style={{
                                        textAlign: "center",
                                      }}
                                    >
                                      {item2.temp_sqty}
                                    </td>
                                  </tr>
                                  {idx2 == mainDataResult.length - 1 ? (
                                    <>
                                      <tr
                                        style={{
                                          backgroundColor: "#e6e6e6",
                                          textAlign: "center",
                                        }}
                                      >
                                        <td colSpan={2}>합 계 ({total})</td>
                                        <td></td>
                                        <td
                                          style={{
                                            textAlign: "right",
                                            paddingRight: "3px",
                                          }}
                                        >
                                          {isInteger(
                                            mainDataResult[0].total_qty
                                          )}
                                        </td>
                                        <td>
                                          {isInteger(
                                            mainDataResult[0].total_sqty
                                          )}
                                        </td>
                                      </tr>
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                </>
                              ) : (
                                <>
                                  <tr key={item2.rownum}>
                                    <td>{item2.custnm}</td>
                                    <td>{item2.itemnm}</td>
                                    <td>{item2.ordsiz}</td>
                                    <td
                                      style={{
                                        textAlign: "right",
                                        paddingRight: "3px",
                                      }}
                                    >
                                      {numberWithCommas(item2.qty)}
                                    </td>
                                    <td
                                      style={{
                                        textAlign: "center",
                                      }}
                                    >
                                      {numberWithCommas(item2.sqty)}
                                    </td>
                                  </tr>
                                </>
                              )
                            ) : (
                              <></>
                            )
                          )}
                        </>
                      </tbody>
                    </table>
                  </>
                ) : (
                  ""
                )
              )}
          </>
        ) : (
          <>
            {mainDataResult !== null &&
              mainDataResult.map((item1: any, idx1: number) =>
                idx1 == 0 || idx1 % 34 == 0 ? (
                  <>
                    <div className={styles.header_wrap}>
                      <div className={styles.left}>
                        <p>{custnm}</p>
                      </div>
                      <div className={styles.center}>
                        <h1>납품현황출력</h1>
                        <p>
                          출고일자:{" "}
                          {dateformat2(convertDateToStr(data.data.frdt))} ~{" "}
                          {dateformat2(convertDateToStr(data.data.todt))}
                        </p>
                      </div>
                      <div className={styles.right}>
                        <p>출력일시: {convertDateToStrWithTime2(new Date())}</p>
                      </div>
                    </div>
                    <table className={styles.tg}>
                      <colgroup>
                        <col width="20%" />
                        <col width="15%" />
                        <col width="10%" />
                        <col width="10%" />
                        <col width="15%" />
                        <col width="15%" />
                        <col width="15%" />
                      </colgroup>
                      <tbody>
                        <>
                          <tr
                            style={{
                              backgroundColor: "#e6e6e6",
                              textAlign: "center",
                            }}
                          >
                            <th>품목명</th>
                            <th>사이즈</th>
                            <th>수주량(kg)</th>
                            <th>단가</th>
                            <th>공급가액</th>
                            <th>부가세</th>
                            <th>합계</th>
                          </tr>
                          {mainDataResult.map((item2: any, idx2: number) =>
                            idx1 + 34 > idx2 && idx1 <= idx2 ? (
                              item2.type == "s" ? (
                                <>
                                  <tr
                                    style={{
                                      backgroundColor: "#e6e6e6",
                                      textAlign: "center",
                                    }}
                                  >
                                    <td colSpan={2}>
                                      소 계 ({item2.temp_count})
                                    </td>
                                    <td
                                      style={{
                                        textAlign: "right",
                                        paddingRight: "3px",
                                      }}
                                    >
                                      {item2.temp_qty}
                                    </td>
                                    <td></td>
                                    <td
                                      style={{
                                        textAlign: "right",
                                        paddingRight: "3px",
                                      }}
                                    >
                                      {item2.temp_amt}
                                    </td>
                                    <td
                                      style={{
                                        textAlign: "right",
                                        paddingRight: "3px",
                                      }}
                                    >
                                      {item2.temp_taxamt}
                                    </td>
                                    <td
                                      style={{
                                        textAlign: "right",
                                        paddingRight: "3px",
                                      }}
                                    >
                                      {item2.temp_totamt}
                                    </td>
                                  </tr>
                                  {idx2 == mainDataResult.length - 1 ? (
                                    <tr
                                      style={{
                                        backgroundColor: "#e6e6e6",
                                        textAlign: "center",
                                      }}
                                    >
                                      <td colSpan={2}>합 계 ({total})</td>
                                      <td
                                        style={{
                                          textAlign: "right",
                                          paddingRight: "3px",
                                        }}
                                      >
                                        {isInteger(mainDataResult[0].total_qty)}
                                      </td>
                                      <td></td>
                                      <td
                                        style={{
                                          textAlign: "right",
                                          paddingRight: "3px",
                                        }}
                                      >
                                        {isInteger(mainDataResult[0].total_amt)}
                                      </td>
                                      <td
                                        style={{
                                          textAlign: "right",
                                          paddingRight: "3px",
                                        }}
                                      >
                                        {isInteger(
                                          mainDataResult[0].total_taxamt
                                        )}
                                      </td>
                                      <td
                                        style={{
                                          textAlign: "right",
                                          paddingRight: "3px",
                                        }}
                                      >
                                        {isInteger(
                                          mainDataResult[0].total_totamt
                                        )}
                                      </td>
                                    </tr>
                                  ) : (
                                    <></>
                                  )}
                                </>
                              ) : (
                                <>
                                  <tr key={item2.rownum}>
                                    <td>{item2.itemnm}</td>
                                    <td>{item2.ordsiz}</td>
                                    <td
                                      style={{
                                        textAlign: "right",
                                        paddingRight: "3px",
                                      }}
                                    >
                                      {numberWithCommas(item2.qty)}
                                    </td>
                                    <td
                                      style={{
                                        textAlign: "right",
                                        paddingRight: "3px",
                                      }}
                                    >
                                      {numberWithCommas(item2.basinvunp)}
                                    </td>
                                    <td
                                      style={{
                                        textAlign: "right",
                                        paddingRight: "3px",
                                      }}
                                    >
                                      {numberWithCommas(item2.amt)}
                                    </td>
                                    <td
                                      style={{
                                        textAlign: "right",
                                        paddingRight: "3px",
                                      }}
                                    >
                                      {numberWithCommas(item2.taxamt)}
                                    </td>
                                    <td
                                      style={{
                                        textAlign: "right",
                                        paddingRight: "3px",
                                      }}
                                    >
                                      {numberWithCommas(item2.totamt)}
                                    </td>
                                  </tr>
                                </>
                              )
                            ) : (
                              <></>
                            )
                          )}
                        </>
                      </tbody>
                    </table>
                  </>
                ) : (
                  <></>
                )
              )}
          </>
        )}
      </div>
    </LandscapePrint>
  );
};

export default MA_B2020W_628_PRINT;
