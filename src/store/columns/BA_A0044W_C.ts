import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
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
        id: "col_itemlvl2",
        field: "itemlvl2",
        caption: "중분류",
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
        id: "col_bassalunp",
        field: "bassalunp",
        caption: "표준단가",
        width: 100,
      },
      {
        id: "col_spec",
        field: "spec",
        caption: "사양",
        width: 120,
      },
      {
        id: "col_itemacnt",
        field: "itemacnt",
        caption: "품목계정",
        width: 120,
      },
      {
        id: "col_unpcalmeth",
        field: "unpcalmeth",
        caption: "적용기준",
        width: 120,
      },

      {
        id: "col_recdt",
        field: "recdt",
        caption: "적용일",
        width: 120,
      },
      {
        id: "col_unp",
        field: "unp",
        caption: "적용단가",
        width: 100,
      },
      {
        id: "col_useyn",
        field: "useyn",
        caption: "사용여부",
        width: 150,
      },
      {
        id: "col_custitemcd",
        field: "custitemcd",
        caption: "고객품목코드",
        width: 150,
      },
      {
        id: "col_custitemnm",
        field: "custitemnm",
        caption: "고객품목명",
        width: 150,
      },
      {
        id: "col_insert_time",
        field: "insert_time",
        caption: "등록일자",
        width: 150,
      },
      {
        id: "col_insert_userid",
        field: "insert_userid",
        caption: "등록자",
        width: 120,
      },
    ],
  },
];
