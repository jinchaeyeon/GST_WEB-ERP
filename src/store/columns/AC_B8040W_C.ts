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
        id: "col_splyamt",
        field: "splyamt",
        caption: "TAX 공급가액",
        width: 100,
      },
      {
        id: "col_taxamt",
        field: "taxamt",
        caption: "TAX 세액",
        width: 100,
      },
      {
        id: "col_splyamt2",
        field: "splyamt2",
        caption: "전표 공급가액",
        width: 100,
      },
      {
        id: "col_taxamt2",
        field: "taxamt2",
        caption: "전표 세액",
        width: 100,
      },
      {
        id: "col_splyamt3",
        field: "splyamt3",
        caption: "차이 공급가액",
        width: 100,
      },
      {
        id: "col_taxamt3",
        field: "taxamt3",
        caption: "차이 세액",
        width: 100,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_reqdt",
        field: "reqdt",
        caption: "계산서NO",
        width: 150,
      },
      {
        id: "col_seq",
        field: "seq",
        caption: "순번",
        width: 100,
      },
      {
        id: "col_taxdt",
        field: "taxdt",
        caption: "계산서일자",
        width: 120,
      },
      {
        id: "col_splyamt4",
        field: "splyamt",
        caption: "공급가액",
        width: 100,
      },
      {
        id: "col_taxamt4",
        field: "taxamt",
        caption: "세액",
        width: 100,
      },
    ],
  },
  {
    gridName: "grdList3",
    columns: [
      {
        id: "col_actdt",
        field: "actdt",
        caption: "전표일자",
        width: 120,
      },
      {
        id: "col_acseq1",
        field: "acseq1",
        caption: "전표순번",
        width: 100,
      },
      {
        id: "col_taxdt2",
        field: "taxdt",
        caption: "계산서일자",
        width: 120,
      },
      {
        id: "col_splyamt5",
        field: "splyamt",
        caption: "공급가액",
        width: 100,
      },
      {
        id: "col_taxamt5",
        field: "taxamt",
        caption: "세액",
        width: 100,
      },
    ],
  },
];
