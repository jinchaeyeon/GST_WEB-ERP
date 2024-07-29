import { forwardRef } from "react";
import { dateformat4, UseGetValueFromSessionItem } from "../CommonFunction";
import styles from "./PR_B0020W_628_PRINT.module.css";

interface PrintComponentProps {
  data: any[];
  type: any;
}

const PrintComponent = forwardRef<HTMLDivElement, PrintComponentProps>(
  ({ data, type }, ref) => {
    const custcd = UseGetValueFromSessionItem("custcd");

    return (
      <div
        ref={ref}
        id={
          custcd == "03874" || custcd == "04928"
            ? type == 1
              ? `${styles.printable2} osung`
              : `${styles.printable1} osung`
            : custcd == "04373"
            ? type == 1
              ? `${styles.printable2} wave`
              : `${styles.printable1} wave`
            : type == 1
            ? styles.printable2
            : styles.printable1
        }
      >
        {type == 1 ? (
          <>
            <style type="text/css" media="print">
              {
                "\
   @page { size: landscape; }\
"
              }
            </style>
            {data.map((item: any) => {
              return (
                <>
                  <div className={styles.tag_table}>
                    <ul>
                      <li>
                        <span>{item.custnm}</span>
                      </li>
                      <li>
                        <span>{item.rcvcustnm2}</span>
                      </li>
                      <li>
                        <span>{`${item.totqty}${item.qtyunit} 중 ${item.qty}${item.qtyunit}`}</span>
                      </li>
                      <li>
                        <span>{item.itemnm2}</span>
                      </li>
                      <li>
                        <span>{item.tagarea}</span>
                      </li>
                      <li>
                        <span>{item.addrgb_custnm}</span>
                      </li>
                      <li>
                        <span>{item.addrgb_addr}</span>
                      </li>
                    </ul>

                    <ul>
                      <li>
                        <span>{`${item.custnm}${
                          item.extra_field6 ? "/" + item.extra_field6 : ""
                        }`}</span>
                      </li>
                      <li>
                        <span>{item.itemnm}</span>
                      </li>
                      <li>
                        <span>{`${item.totqty}${item.qtyunit} 중 ${item.qty}${item.qtyunit}`}</span>{" "}
                        <span>
                          사이즈 :
                          <span style={{ fontWeight: "bold" }}>
                            {item.spec}
                          </span>
                        </span>
                      </li>
                      <li>
                        <span>{item.specnum}</span>{" "}
                        <span>형태 : {item.insiz}</span>
                      </li>
                      <li>
                        <div>
                          <span>
                            {" "}
                            성분및함량 :{" "}
                            <span
                              className={
                                item.ingredgb == 1
                                  ? styles.ingred1
                                  : item.ingredgb == 2
                                  ? styles.ingred2
                                  : item.ingredgb == 3
                                  ? styles.ingred3
                                  : styles.ingred4
                              }
                            >
                              {item.Ingredients}
                            </span>
                          </span>
                        </div>
                        <div>
                          <span>
                            {" "}
                            품질등급 :{" "}
                            <div style={{ fontWeight: "bold" }}>
                              {item.dwgno}
                            </div>
                          </span>
                          <span>
                            {" "}
                            생산년도 :{" "}
                            <div style={{ fontWeight: "bold" }}>
                              {item.project}
                            </div>
                          </span>
                        </div>
                      </li>
                      <li>
                        <span>
                          제조(포장) :{" "}
                          <span style={{ fontWeight: "bold" }}>
                            {dateformat4(item.poregnum)}
                          </span>
                        </span>
                        <span>
                          소비기한 :{" "}
                          <span style={{ fontWeight: "bold" }}>
                            {item.extra_field3 === "9"
                              ? "별도표기"
                              : `${dateformat4(item.extra_field7)}까지`}
                          </span>
                        </span>
                        <span>{item.ba030t_remark}</span>
                      </li>
                      <li>
                        <span>식품의 유형 : {item.extra_field1}</span>
                      </li>
                      <li>
                        <span>포장재질 : {item.extra_field2}</span>{" "}
                        <span style={{ float: "right" }}>
                          품목보고번호: {item.tagtemp5}
                        </span>
                      </li>
                      <li>
                        <span>{item.tagtemp1}</span>
                      </li>
                      <li>
                        <span>{item.tagtemp2}</span>
                      </li>
                      <li>
                        <span>{item.tagtemp3}</span>
                      </li>
                      <li>
                        <span>{item.remark}</span>
                      </li>
                    </ul>
                  </div>
                </>
              );
            })}
          </>
        ) : (
          <>
            {data.map((item: any) => {
              return (
                <>
                  <ul className={styles.tag_table}>
                    <li>
                      제품명:
                      <span>{item.itemnm}</span>
                    </li>
                    <li>
                      사이즈:
                      <span>
                        {item.spec}
                      </span>
                    </li>
                    <li>
                      원산지:
                      <span>{item.specnum}</span>
                      <div className={styles.right}>
                        내용량: <span>{`${item.qty}${item.qtyunit}`}</span>
                      </div>
                    </li>
                    <li>
                      <span>{item.tagtemp5}</span>
                      <div className={styles.right}>
                        <span>{`(총 ${item.totqty}${item.qtyunit})`}</span>
                      </div>
                    </li>
                    <li>
                      <div className={styles.right}>
                        품질등급: <span>{item.dwgno}</span>
                      </div>
                    </li>
                    <li>
                      <div>원재료명:</div>
                      <span
                        className={
                          item.ingredgb == 1
                            ? styles.ingred1
                            : item.ingredgb == 2
                            ? styles.ingred2
                            : item.ingredgb == 3
                            ? styles.ingred3
                            : styles.ingred4
                        }
                      >
                        {item.Ingredients}
                      </span>
                    </li>
                    <li>
                      제조(포장) :
                      <span className={styles.right}>
                        {dateformat4(item.poregnum)}
                      </span>
                      {item.color == "Y" ? (
                        <div className={styles.logo}>
                          <img src={`/HACCP.jpg`} style={{ width: "100%" }} />
                        </div>
                      ) : (
                        ""
                      )}
                      <span>{item.ba030t_remark}</span>
                    </li>
                    <li style={{ marginBottom: "10px" }}>
                      소비기한:
                      <span>
                        {item.extra_field3 === "9"
                          ? "별도표기"
                          : `${dateformat4(item.extra_field7)}까지`}
                      </span>
                      <div className={styles.right}>
                        생산년도: <span>{item.project}</span>
                      </div>
                    </li>
                    <li>
                      식품의유형:
                      <span> {item.extra_field1} </span>
                    </li>
                    <li>
                      포장재질:
                      <span> {item.extra_field2} </span>
                    </li>
                    <li>
                      <span>{item.tagtemp1}</span>
                    </li>
                    <li>
                      <span>{item.tagtemp2}</span>
                    </li>
                    <li>
                      <span>{item.tagtemp3}</span>
                    </li>
                    <li className={styles.remark}>
                      <span>{item.remark}</span>
                    </li>
                    <li>*부정불량식품 신고는 국번없이 1399</li>
                  </ul>
                  <div style={{ pageBreakBefore: "always" }} />
                </>
              );
            })}
          </>
        )}
      </div>
    );
  }
);

export default PrintComponent;
