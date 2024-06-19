import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_quonum",
        field: "quonum",
        caption: "PJT NO.",
        width: 150,
      },
      {
        id: "col_orddt",
        field: "orddt",
        caption: "수주일자",
        width: 120,
      },
      {
        id: "col_contractno",
        field: "contractno",
        caption: "계약번호",
        width: 130,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체명",
        width: 200,
      },
      {
        id: "col_custprsnnm",
        field: "custprsnnm",
        caption: "의뢰자",
        width: 100,
      },
      {
        id: "col_chkperson",
        field: "chkperson",
        caption: "영업담당자",
        width: 100,
      },
      {
        id: "col_materialtype",
        field: "materialtype",
        caption: "물질분야",
        width: 100,
      },
      {
        id: "col_cnt",
        field: "cnt",
        caption: "시험수",
        width: 80,
      },
      {
        id: "col_conamt",
        field: "conamt",
        caption: "계약금액",
        width: 100,
      },

      {
        id: "col_stramt",
        field: "stramt",
        caption: "개시금액",
        width: 100,
      },

      {
        id: "col_janamt",
        field: "janamt",
        caption: "잔고금액",
        width: 100,
      },
    ]
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_itemcd",
        field: "itemcd",
        caption: "품목코드",
        width: 150,
      },
      {
        id: "col_itemnm",
        field: "itemnm",
        caption: "품목명",
        width: 250,
      },
      {
        id: "col_ordsts",
        field: "ordsts",
        caption: "수주상태",
        width: 100,
      },
      {
        id: "col_amt",
        field: "amt",
        caption: "계약금액",
        width: 100,
      },

      {
        id: "col_stramt2",
        field: "stramt",
        caption: "개시금액",
        width: 100,
      },

      {
        id: "col_janamt2",
        field: "janamt",
        caption: "잔고금액",
        width: 100,
      },
    ]
  }
];
