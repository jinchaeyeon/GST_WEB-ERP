import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_reqkey",
        field: "reqkey",
        caption: "청구번호",
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
        id: "col_dptcd",
        field: "dptcd",
        caption: "청구부서",
        width: 120,
      },
      {
        id: "col_person",
        field: "person",
        caption: "담당자",
        width: 120,
      },
      {
        id: "col_recdt",
        field: "recdt",
        caption: "일자",
        width: 120,
      },
      {
        id: "col_qty",
        field: "qty",
        caption: "청구수량",
        width: 100,
      },
      {
        id: "col_amt",
        field: "amt",
        caption: "금액",
        width: 100,
      },
      {
        id: "col_taxamt",
        field: "taxamt",
        caption: "세액",
        width: 100,
      },
      {
        id: "col_totamt",
        field: "totamt",
        caption: "합계금액",
        width: 100,
      },
      {
        id: "col_project",
        field: "project",
        caption: "프로젝트",
        width: 150,
      },
      {
        id: "col_poregnum",
        field: "poregnum",
        caption: "PO번호",
        width: 150,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_inexpdt",
        field: "inexpdt",
        caption: "입고예정일",
        width: 120,
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
        id: "col_insiz",
        field: "insiz",
        caption: "규격",
        width: 120,
      },
      {
        id: "col_load_place",
        field: "load_place",
        caption: "창고",
        width: 120,
      },
      {
        id: "col_qty2",
        field: "qty",
        caption: "청구수량",
        width: 100,
      },
      {
        id: "col_qtyunit",
        field: "qtyunit",
        caption: "수량단위",
        width: 100,
      },
      {
        id: "col_unpcalmeth",
        field: "unpcalmeth",
        caption: "단가산정방법",
        width: 100,
      },
      {
        id: "col_unp",
        field: "unp",
        caption: "단가",
        width: 100,
      },
      {
        id: "col_amt2",
        field: "amt",
        caption: "금액",
        width: 100,
      },
      {
        id: "col_wonamt",
        field: "wonamt",
        caption: "원화금액",
        width: 100,
      },
      {
        id: "col_taxamt2",
        field: "taxamt",
        caption: "세액",
        width: 100,
      },
      {
        id: "col_totamt2",
        field: "totamt",
        caption: "합계금액",
        width: 100,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "비고",
        width: 200,
      },
      {
        id: "col_reqkey2",
        field: "reqkey",
        caption: "청구번호",
        width: 150,
      },
      {
        id: "col_finyn",
        field: "finyn",
        caption: "완료여부",
        width: 100,
      },
    ],
  },
];
