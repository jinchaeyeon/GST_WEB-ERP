import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_indt",
        field: "indt",
        caption: "입고일자",
        width: 200,
      },
      {
        id: "col_purdt",
        field: "purdt",
        caption: "대금결제일",
        width: 180,
      },
      {
        id: "col_custcd",
        field: "custcd",
        caption: "업체코드",
        width: 250,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체명",
        width: 200,
      },
      {
        id: "col_person",
        field: "person",
        caption: "담당자",
        width: 200,
      },
      {
        id: "col_doexdiv",
        field: "doexdiv",
        caption: "내수구분",
        width: 130,
      },
      {
        id: "col_taxdiv",
        field: "taxdiv",
        caption: "과세구분",
        width: 130,
      },
      {
        id: "col_taxnum",
        field: "taxnum",
        caption: "계산서번호",
        width: 250,
      },
      {
        id: "col_inqty",
        field: "inqty",
        caption: "입고수량",
        width: 130,
      },
      {
        id: "col_amt",
        field: "amt",
        caption: "금액",
        width: 130,
      },
      {
        id: "col_wonamt",
        field: "wonamt",
        caption: "원화금액",
        width: 130,
      },
      {
        id: "col_taxamt",
        field: "taxamt",
        caption: "세액",
        width: 130,
      },
      {
        id: "col_totamt",
        field: "totamt",
        caption: "합계금액",
        width: 130,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "비고",
        width: 300,
      },
      {
        id: "col_reckey",
        field: "reckey",
        caption: "입고번호",
        width: 200,
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
        width: 250,
      },
      {
        id: "col_itemnm",
        field: "itemnm",
        caption: "품목명",
        width: 200,
      },
      {
        id: "col_insiz",
        field: "insiz",
        caption: "규격",
        width: 200,
      },
      {
        id: "col_lotnum",
        field: "lotnum",
        caption: "LOT NO",
        width: 200,
      },
      {
        id: "col_qty",
        field: "qty",
        caption: "수량",
        width: 180,
      },
      {
        id: "col_qtyunit",
        field: "qtyunit",
        caption: "수량단위",
        width: 180,
      },
      {
        id: "col_totwgt",
        field: "totwgt",
        caption: "중량",
        width: 100,
      },
      {
        id: "col_wgtunit",
        field: "wgtunit",
        caption: "중량단위",
        width: 100,
      },
      {
        id: "col_unpcalmeth",
        field: "unpcalmeth",
        caption: "단가산정방법",
        width: 120,
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
        id: "col_wonamt2",
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
        id: "col_remark2",
        field: "remark",
        caption: "비고",
        width: 400,
      },
      {
        id: "col_purnum",
        field: "purnum",
        caption: "발주번호",
        width: 200,
      },
      {
        id: "col_reckey2",
        field: "reckey",
        caption: "입고번호",
        width: 200,
      },
    ],
  },
];
