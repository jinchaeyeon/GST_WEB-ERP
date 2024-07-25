import { forwardRef, useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { useApi } from "../../hooks/api";
import { isLoading } from "../../store/atoms";
import { Iparameters, TPermissions } from "../../store/types";
import { dateformat4, UsePermissions } from "../CommonFunction";
import { PAGE_SIZE } from "../CommonString";
import styles from "./PR_B0020W_628_out_PRINT.module.css";

interface PrintComponentProps {
  data: any[];
}

const PrintComponent = forwardRef<HTMLDivElement, PrintComponentProps>(
  ({ data }, ref) => {
    return (
      <div ref={ref} className={styles.printable2}>
        {data.length > 0 ? (
          <>
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
                          성분및함량 :{" "}
                          <span className={`ingredgb ingred${item.ingredgb}`}>
                            {item.Ingredients}
                          </span>
                        </div>
                        <div>
                          품질등급 :{" "}
                          <div style={{ fontWeight: "bold" }}>{item.dwgno}</div>{" "}
                          생산년도 :{" "}
                          <div style={{ fontWeight: "bold" }}>
                            {item.project}
                          </div>
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
                          소비가한 :{" "}
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
                        <span>{item.tagtemp5}</span>
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
          <></>
        )}
      </div>
    );
  }
);

export default PrintComponent;
