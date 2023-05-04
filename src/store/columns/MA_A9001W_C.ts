import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_taxnum",
        field: "taxnum",
        caption: "계산서번호",
        width: 120,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체명",
        width: 150,
      },
      {
        id: "col_custregnum",
        field: "custregnum",
        caption: "사업자등록번호",
        width: 150,
      },
      {
        id: "col_qty",
        field: "qty",
        caption: "수량",
        width: 100,
      },
      {
        id: "col_splyamt",
        field: "splyamt",
        caption: "공급가액",
        width: 100,
      },
      {
        id: "col_taxamt",
        field: "taxamt",
        caption: "부가세액",
        width: 100,
      },
      {
        id: "col_totamt",
        field: "totamt",
        caption: "합계금액",
        width: 100,
      },
      {
        id: "col_items",
        field: "items",
        caption: "거래품목",
        width: 200,
      },
      {
        id: "col_taxtype",
        field: "taxtype",
        caption: "계산서유형",
        width: 120,
      },
      {
        id: "col_rtxisuyn",
        field: "rtxisuyn",
        caption: "역발행여부",
        width: 120,
      },
      {
        id: "col_etax",
        field: "etax",
        caption: "TAX구분",
        width: 120,
      },
      {
        id: "col_exceptyn",
        field: "exceptyn",
        caption: "구분",
        width: 120,
      },
      {
        id: "col_actkey",
        field: "actkey",
        caption: "전표번호",
        width: 120,
      },
      {
        id: "col_insert_userid",
        field: "insert_userid",
        caption: "등록자",
        width: 120,
      },
      {
        id: "col_update_userid",
        field: "update_userid",
        caption: "수정자",
        width: 120,
      },
      {
        id: "col_update_time",
        field: "update_time",
        caption: "수정일자",
        width: 120,
      },
      {
        id: "col_paymentnum",
        field: "paymentnum",
        caption: "지급번호",
        width: 120,
      },
      {
        id: "col_paydt",
        field: "paydt",
        caption: "지급예정일",
        width: 120,
      },
      {
        id: "col_payactkey",
        field: "payactkey",
        caption: "지급전표번호",
        width: 120,
      },
      {
        id: "col_actdt",
        field: "actdt",
        caption: "전표일자",
        width: 120,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_recnum1",
        field: "recnum",
        caption: "입고번호",
        width: 120,
      },
      {
        id: "col_itemcd1",
        field: "itemcd",
        caption: "품목코드",
        width: 120,
      },
      {
        id: "col_itemnm1",
        field: "itemnm",
        caption: "품목명",
        width: 200,
      },
      {
        id: "col_insiz1",
        field: "insiz",
        caption: "규격",
        width: 120,
      },
      {
        id: "col_itemacnt1",
        field: "itemacnt",
        caption: "품목계정",
        width: 120,
      },
      {
        id: "col_qty1",
        field: "qty",
        caption: "수량",
        width: 100,
      },
      {
        id: "col_wonamt1",
        field: "wonamt",
        caption: "원화금액",
        width: 100,
      },
      {
        id: "col_taxamt1",
        field: "taxamt",
        caption: "세액",
        width: 100,
      },
      {
        id: "col_totamt1",
        field: "totamt",
        caption: "합계금액",
        width: 100,
      },
    ],
  },
  {
    gridName: "grdList3",
    columns: [
      {
        id: "col_ackey2",
        field: "ackey",
        caption: "전표번호",
        width: 120,
      },
      {
        id: "col_drcrdiv2",
        field: "drcrdiv",
        caption: "차대구분",
        width: 120,
      },
      {
        id: "col_acntcd2",
        field: "acntcd",
        caption: "계정코드",
        width: 120,
      },
      {
        id: "col_acntnm2",
        field: "acntnm",
        caption: "계정명",
        width: 150,
      },
      {
        id: "col_slipamt_12",
        field: "slipamt_1",
        caption: "차변금액",
        width: 100,
      },
      {
        id: "col_slipamt_22",
        field: "slipamt_2",
        caption: "대변금액",
        width: 100,
      },
      {
        id: "col_remark2",
        field: "remark",
        caption: "비고",
        width: 120,
      },
      {
        id: "col_custcd2",
        field: "custcd",
        caption: "업체코드",
        width: 120,
      },
      {
        id: "col_custnm2",
        field: "custnm",
        caption: "업체명",
        width: 120,
      },
      {
        id: "col_mngamt2",
        field: "mngamt",
        caption: "관리금액",
        width: 100,
      },
      {
        id: "col_rate2",
        field: "rate",
        caption: "비율",
        width: 80,
      },
      {
        id: "col_taxtype2",
        field: "taxtype",
        caption: "계산서유형",
        width: 120,
      },
    ],
  },
  {
    gridName: "grdList4",
    columns: [
      {
        id: "col_drcrdiv3",
        field: "drcrdiv",
        caption: "차대구분",
        width: 120,
      },
      {
        id: "col_amt_13",
        field: "amt_1",
        caption: "차변금액",
        width: 100,
      },
      {
        id: "col_amt_23",
        field: "amt_2",
        caption: "대변금액",
        width: 100,
      },
      {
        id: "col_acntcd3",
        field: "acntcd",
        caption: "계정코드",
        width: 120,
      },
      {
        id: "col_acntnm3",
        field: "acntnm",
        caption: "계정명",
        width: 150,
      },
      {
        id: "col_bankcd3",
        field: "bankcd",
        caption: "은행",
        width: 120,
      },
      {
        id: "col_remark3",
        field: "remark",
        caption: "적요",
        width: 200,
      },
      {
        id: "col_payactkey3",
        field: "payactkey",
        caption: "지급전표번호",
        width: 200,
      },
    ],
  },
];
