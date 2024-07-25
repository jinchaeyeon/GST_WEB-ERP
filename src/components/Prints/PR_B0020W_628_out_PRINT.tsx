import React, { forwardRef } from "react";
import styles from "./PR_B0020W_628_out_PRINT.module.css";

interface DataItem {
  custnm: string;
  rcvcustnm2: string;
  totqty: number;
  invunit: string;
  qty: number;
  itemnm2: string;
  tagarea: string;
  addrgb_custnm: string;
  addrgb_addr: string;
  // 추가 필요
}

interface PrintComponentProps {
    datas: DataItem[];
  }

const PrintComponent = forwardRef<HTMLDivElement, PrintComponentProps>(({ datas }, ref) => {
    // 날짜 형식 변환필요     
    return (
      <div ref={ref} className={styles.print_container}>
        {/* <div className={styles.print_page}>
          <div className={styles.rotate_text}>
            <ul>
              <li>
                <span>{datas[0].custnm}</span>
              </li>
              <li>
                <span>{datas[0].rcvcustnm2}</span>
              </li>
              <li>
                <span>{`${datas[0].totqty}${datas[0].invunit} 중 ${datas[0].qty}${datas[0].invunit}`}</span>
              </li>
              <li>
                <span>{datas[0].itemnm2}</span>
              </li>
              <li>
                <span>{datas[0].tagarea}</span>
              </li>
              <li>
                <span>{datas[0].addrgb_custnm}</span>
              </li>
              <li>
                <span>{datas[0].addrgb_addr}</span>
              </li>
            </ul>
          </div>
          <div className={styles.right_table}>
            <ul>
              <li>
                <span>{`${datas[0].custnm}${
                  datas[0].rcvcustnm ? "/" + datas[0].rcvcustnm : ""
                }`}</span>
              </li>
              <li>
                <span>{datas[0].itemnm}</span>
              </li>
              <li>
                <span>{`${datas[0].totqty}${datas[0].invunit} 중 ${datas[0].qty}${datas[0].invunit}`}</span>{" "}
                <span>
                  사이즈 :
                  <span style={{ fontWeight: "bold" }}>{datas[0].spec}</span>
                </span>
              </li>
              <li>
                <span>{datas[0].specnum}</span>{" "}
                <span>형태 : {datas[0].form}</span>
              </li>
              <li>
                <div>
                  성분및함량 :{" "}
                  <span className={`ingredgb ingred${datas[0].ingredgb}`}>
                    {datas[0].ingred}
                  </span>
                </div>
                <div>
                  품질등급 :{" "}
                  <div style={{ fontWeight: "bold" }}>{datas[0].itemgrade}</div>{" "}
                  생산년도 :{" "}
                  <div style={{ fontWeight: "bold" }}>{datas[0].proyr}</div>
                </div>
              </li>
              <li>
                <span>
                  제조(포장) :{" "}
                  <span style={{ fontWeight: "bold" }}>
                    {dateformat4(datas[0].comdt)}
                  </span>
                </span>
                <span>
                  소비가한 :{" "}
                  <span style={{ fontWeight: "bold" }}>
                    {datas[0].shlife === "9"
                      ? "별도표기"
                      : `${dateformat4(datas[0].shldt)}까지`}
                  </span>
                </span>
                <span>{datas[0].ba030t_remark}</span>
              </li>
              <li>
                <span>식품의 유형 : {datas[0].foodkind}</span>
              </li>
              <li>
                <span>포장재질 : {datas[0].packing}</span>{" "}
                <span>{datas[0].tagtemp5}</span>
              </li>
              <li>
                <span>{datas[0].tagtemp1}</span>
              </li>
              <li>
                <span>{datas[0].tagtemp2}</span>
              </li>
              <li>
                <span>{datas[0].tagtemp3}</span>
              </li>
              <li>
                <span>{datas[0].remark}</span>
              </li>
            </ul>
          </div>
        </div> */}
      </div>
    );
  }
);

export default PrintComponent;
