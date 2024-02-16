import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_purnum",
        field: "purnum",
        caption: "발주번호",
        width: 120,
      },
      {
        id: "col_purdt",
        field: "purdt",
        caption: "발주일자",
        width: 120,
      },
      {
        id: "col_inexpdt",
        field: "inexpdt",
        caption: "입고예정일",
        width: 120,
      },
      {
        id: "col_person",
        field: "person",
        caption: "담당자",
        width: 120,
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
        width: 150,
      },
      {
        id: "col_qty",
        field: "qty",
        caption: "수량",
        width: 100,
      },
      {
        id: "col_wonamt",
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
      {
        id: "col_amt",
        field: "amt",
        caption: "금액",
        width: 100,
      },
      {
        id: "col_totamt",
        field: "totamt",
        caption: "합계금액",
        width: 100,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "비고",
        width: 120,
      },
      {
        id: "col_finyn",
        field: "finyn",
        caption: "완료여부",
        width: 120,
      },
    ],
  },
  {
    gridName: "grdList1",
    columns: [
      {
        id: "col_proccd",
        field: "proccd",
        caption: "공정",
        width: 120,
      },
      {
        id: "col_plankey",
        field: "plankey",
        caption: "생산계획번호",
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
        id: "col_itemlvl1",
        field: "itemlvl1",
        caption: "대분류",
        width: 120,
      },
      {
        id: "col_itemlvl2",
        field: "itemlvl2",
        caption: "중분류",
        width: 120,
      },
      {
        id: "col_itemlvl3",
        field: "itemlvl3",
        caption: "소분류",
        width: 120,
      },
      {
        id: "col_insiz",
        field: "insiz",
        caption: "규격",
        width: 150,
      },
      {
        id: "col_qty1",
        field: "qty",
        caption: "수량",
        width: 100,
      },
      {
        id: "col_inqty",
        field: "inqty",
        caption: "입고수량",
        width: 100,
      },
      {
        id: "col_qtyunit",
        field: "qtyunit",
        caption: "수량단위",
        width: 120,
      },
      {
        id: "col_unp",
        field: "unp",
        caption: "단가",
        width: 100,
      },
      {
        id: "col_amt1",
        field: "amt",
        caption: "금액",
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
      {
        id: "col_remark1",
        field: "remark",
        caption: "비고",
        width: 120,
      },
      {
        id: "col_ordkey",
        field: "ordkey",
        caption: "수주번호",
        width: 120,
      },
    ],
  },
];
