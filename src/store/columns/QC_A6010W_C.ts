import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_qcreqdt",
        field: "qcreqdt",
        caption: "검사신청일자",
        width: 120,
      },
      {
        id: "col_person",
        field: "person",
        caption: "검사신청자",
        width: 120,
      },
      {
        id: "col_div",
        field: "div",
        caption: "재검사",
        width: 100,
      },
      {
        id: "col_ordkey",
        field: "ordkey",
        caption: "수주번호",
        width: 150,
      },
      {
        id: "col_orddt",
        field: "orddt",
        caption: "수주일자",
        width: 120,
      },
      {
        id: "col_dlvdt",
        field: "dlvdt",
        caption: "납기일자",
        width: 120,
      },
      {
        id: "col_poregnum",
        field: "poregnum",
        caption: "PO번호",
        width: 150,
      },
      {
        id: "col_project",
        field: "project",
        caption: "프로젝트",
        width: 150,
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
        id: "col_rcvcustcd",
        field: "rcvcustcd",
        caption: "인수처코드",
        width: 150,
      },
      {
        id: "col_rcvcustnm",
        field: "rcvcustnm",
        caption: "인수처명",
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
        id: "col_qty",
        field: "qty",
        caption: "수량",
        width: 100,
      },
    ],
  },
];
