import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_prsnnum",
        field: "prsnnum",
        caption: "이름",
        width: 120,
      },
      {
        id: "col_gubun",
        field: "gubun",
        caption: "구분",
        width: 120,
      },
    ]
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_prsnnum2",
        field: "prsnnum",
        caption: "이름",
        width: 120,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체",
        width: 120,
      },
      {
        id: "col_time",
        field: "time",
        caption: "시간",
        width: 120,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "사유",
        width: 120,
      },
    ]
  },
  {
    gridName: "grdList3",
    columns: [
      {
        id: "col_prsnnum3",
        field: "prsnnum",
        caption: "이름",
        width: 120,
      },
      {
        id: "col_remark2",
        field: "remark",
        caption: "사유",
        width: 120,
      },
    ]
  },
  {
    gridName: "grdList4",
    columns: [
      {
        id: "col_lateprsn",
        field: "lateprsn",
        caption: "이름",
        width: 120,
      },
    ]
  },
];
