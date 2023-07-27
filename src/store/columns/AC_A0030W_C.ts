import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdHeaderList",
    columns: [
      {
        id: "col_acntcd",
        field: "acntcd",
        caption: "계정코드",
        width: 120,
      },
      {
        id: "col_acntitemnm",
        field: "acntitemnm",
        caption: "계정항목명",
        width: 280,
      },
      {
        id: "col_acntnm",
        field: "acntnm",
        caption: "계정명",
        width: 280,
      },
      {
        id: "col_acntdtelnm",
        field: "acntdtelnm",
        caption: "계정세목명",
        width: 280,
      },
    ],
  },
  {
    gridName: "grdDetailList",
    columns: [
      {
        id: "col_mngitemcd",
        field: "mngitemcd",
        caption: "관리항목",
        width: 120,
      },
      {
        id: "col_mngdrctlyn",
        field: "mngdrctlyn",
        caption: "필수차변",
        width: 120,
      },
      {
        id: "col_mngcrctlyn",
        field: "mngcrctlyn",
        caption: "필수대변",
        width: 120,
      },
    ],
  },
  {
    gridName: "grdFinDetail",
    columns: [
      {
        id: "col_reportgb",
        field: "reportgb",
        caption: "보고서구분",
        width: 120,
      },
      {
        id: "col_acntgrpcd",
        field: "acntgrpcd",
        caption: "그룹코드",
        width: 120,
      },
      {
        id: "col_acntgrpnm",
        field: "acntgrpnm",
        caption: "그룹명",
        width: 120,
      },
    ],
  },
];
