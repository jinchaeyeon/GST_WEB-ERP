import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_quokey",
        field: "quokey",
        caption: "PJT NO.",
        width: 150,
      },
      {
        id: "col_contractno",
        field: "contractno",
        caption: "계약번호",
        width: 150,
      },
      {
        id: "col_ordnum",
        field: "ordnum",
        caption: "수주번호",
        width: 120,
      },
      {
        id: "col_ordsts",
        field: "ordsts",
        caption: "수주상태",
        width: 120,
      },
      {
        id: "col_testnum",
        field: "testnum",
        caption: "시험번호",
        width: 150,
      },
      {
        id: "col_quotestnum",
        field: "quotestnum",
        caption: "예약번호",
        width: 150,
      },
      {
        id: "col_exdlvdt2",
        field: "exdlvdt2",
        caption: "시험예약일",
        width: 120,
      },
      {
        id: "col_d_day",
        field: "d_day",
        caption: "경과기간",
        width: 100,
      },
      {
        id: "col_rule_status",
        field: "rule_status",
        caption: "예약관리",
        width: 120,
      },
      {
        id: "col_orddt",
        field: "orddt",
        caption: "수주일자",
        width: 120,
      },
      
      {
        id: "col_custcd",
        field: "custcd",
        caption: "업체코드",
        width: 150,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체명",
        width: 150,
      },
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
        width: 150,
      },
      {
        id: "col_itemacnt",
        field: "itemacnt",
        caption: "품목계정",
        width: 120,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "비고",
        width: 200,
      },
    ],
  },
];
