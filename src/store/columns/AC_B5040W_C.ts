import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_inoutdiv",
        field: "inoutdiv",
        caption: "매입매출",
        width: 120,
      },
      {
        id: "col_taxdiv",
        field: "taxdiv",
        caption: "세금계산서분류",
        width: 120,
      },
      {
        id: "col_recdt",
        field: "recdt",
        caption: "작성일자",
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
        id: "col_custregnum",
        field: "custregnum",
        caption: "공급받는자사업자번호",
        width: 150,
      },
      {
        id: "col_splyamt",
        field: "splyamt",
        caption: "공급가액",
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
        caption: "총 금액",
        width: 100,
      },
      {
        id: "col_recnum",
        field: "recnum",
        caption: "승인번호",
        width: 150,
      },
      {
        id: "col_custname",
        field: "custname",
        caption: "상호",
        width: 150,
      },
      {
        id: "col_taxkind",
        field: "taxkind",
        caption: "계산서종류",
        width: 120,
      },
      {
        id: "col_balkind",
        field: "balkind",
        caption: "발급유형",
        width: 120,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "적요",
        width: 120,
      },
    ],
  },
];
