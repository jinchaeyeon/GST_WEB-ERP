import { forwardRef } from "react";
import { dateformat4 } from "../CommonFunction";
import styles from "./PR_B0020W_628_in_PRINT.module.css";

interface PrintComponentProps {
  data: any[];
}

const PrintComponent = forwardRef<HTMLDivElement, PrintComponentProps>(
  ({ data }, ref) => {
    return (
      <div ref={ref} className={styles.printable1}>
        {data.length > 0 ? (
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
                        {item.ordsiz}
                        {item.insiz}
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
                      <span className={`ingredgb ingred${item.ingredgb}`}>
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
                          <img src={`/HACCP.jpg`} style={{width: "100%"}}/>
                        </div>
                      ) : (
                        ""
                      )}
                      <span>{item.ba030t_remark}</span>
                    </li>
                    <li>
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
                    <li className="remark">
                      <span>{item.remark}</span>
                    </li>
                    <li>*부정불량식품 신고는 국번없이 1399</li>
                  </ul>
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
