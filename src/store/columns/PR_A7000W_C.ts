import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_attyn",
        field: "attyn",
        caption: "도면여부",
        width: 100,
      },
      {
        id: "col_plandt",
        field: "plandt",
        caption: "계획일자",
        width: 120,
      },
      {
        id: "col_finexpdt",
        field: "finexpdt",
        caption: "완료예정일",
        width: 120,
      },
      {
        id: "col_itemcd",
        field: "itemcd",
        caption: "품목코드",
        width: 120,
      },
      {
        id: "col_itemnm",
        field: "itemnm",
        caption: "품목명",
        width: 150,
      },
      {
        id: "col_insiz",
        field: "insiz",
        caption: "규격",
        width: 120,
      },
      {
        id: "col_reqty",
        field: "reqty",
        caption: "지시량",
        width: 100,
      },
      {
        id: "col_finyn",
        field: "finyn",
        caption: "완료여부",
        width: 100,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체명",
        width: 120,
      },
      {
        id: "col_planno",
        field: "planno",
        caption: "생산계획번호",
        width: 150,
      },
      {
        id: "col_ordnum",
        field: "ordnum",
        caption: "수주번호",
        width: 150,
      },
      {
        id: "col_qty",
        field: "qty",
        caption: "수량",
        width: 100,
      },
      {
        id: "col_plqty",
        field: "plqty",
        caption: "계획수량",
        width: 100,
      },
      {
        id: "col_attdatnum",
        field: "attdatnum",
        caption: "첨부파일",
        width: 100,
      },
      {
        id: "col_bnatur",
        field: "bnatur",
        caption: "재질",
        width: 100,
      },
    ],
  },
];
