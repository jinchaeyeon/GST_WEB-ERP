import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_location",
        field: "location",
        caption: "사업장",
        width: 120,
      },
      {
        id: "col_position",
        field: "position",
        caption: "사업부",
        width: 120,
      },
      {
        id: "col_amt",
        field: "amt",
        caption: "관리금액",
        width: 100,
      },
      {
        id: "col_wonchgrat",
        field: "wonchgrat",
        caption: "환율",
        width: 100,
      },
      {
        id: "col_wonamt",
        field: "wonamt",
        caption: "공급가액",
        width: 100,
      },
      {
        id: "col_diffamt",
        field: "diffamt",
        caption: "차이",
        width: 100,
      },
      {
        id: "col_custcd",
        field: "custcd",
        caption: "업체코드",
        width: 120,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체명",
        width: 120,
      },
      {
        id: "col_importnum",
        field: "importnum",
        caption: "수출신고번호",
        width: 150,
      },
      {
        id: "col_indt",
        field: "indt",
        caption: "판매일자",
        width: 120,
      },
      {
        id: "col_slipyn",
        field: "slipyn",
        caption: "전표",
        width: 80,
      },
      {
        id: "col_act_key",
        field: "act_key",
        caption: "전표번호",
        width: 150,
      },
      {
        id: "col_ref_key",
        field: "ref_key",
        caption: "판매번호",
        width: 150,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_itemcd",
        field: "itemcd",
        caption: "품목코드",
        width: 120,
      },
      {
        id: "col_itemnm",
        field: "itemnm",
        caption: "픔목명",
        width: 120,
      },
      {
        id: "col_itemacnt",
        field: "itemacnt",
        caption: "품목계정",
        width: 120,
      },
      {
        id: "col_insiz",
        field: "insiz",
        caption: "규격",
        width: 120,
      },
      {
        id: "col_qty",
        field: "qty",
        caption: "수량",
        width: 100,
      },
      {
        id: "col_wonamt2",
        field: "wonamt",
        caption: "원화금액",
        width: 100,
      },
      {
        id: "col_taxamt",
        field: "taxamt",
        caption: "세액",
        width: 100,
      },
    ],
  },
  {
    gridName: "grdList3",
    columns: [
      {
        id: "col_actdt",
        field: "actdt",
        caption: "전표일자",
        width: 120,
      },
      {
        id: "col_drcrdiv",
        field: "drcrdiv",
        caption: "차대구분",
        width: 120,
      },
      {
        id: "col_acntcd",
        field: "acntcd",
        caption: "계정코드",
        width: 120,
      },
      {
        id: "col_acntnm",
        field: "acntnm",
        caption: "계정명",
        width: 120,
      },
      {
        id: "col_slipamt_1",
        field: "slipamt_1",
        caption: "차변금액",
        width: 100,
      },
      {
        id: "col_slipamt_2",
        field: "slipamt_2",
        caption: "대변금액",
        width: 100,
      },
      {
        id: "col_remark3",
        field: "remark3",
        caption: "비고",
        width: 200,
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
        id: "col_mngamt",
        field: "mngamt",
        caption: "관리금액",
        width: 100,
      },
      {
        id: "col_rate",
        field: "rate",
        caption: "비율",
        width: 100,
      },
    ],
  },
];
