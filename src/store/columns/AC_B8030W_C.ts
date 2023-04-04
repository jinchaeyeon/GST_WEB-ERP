import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_actdt",
        field: "actdt",
        caption: "전표일자",
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
        caption: "업체코드명",
        width: 150,
      },
      {
        id: "col_bizregnum",
        field: "bizregnum",
        caption: "사업자등록번호",
        width: 150,
      },
      {
        id: "col_taxdt",
        field: "taxdt",
        caption: "계산서일자",
        width: 120,
      },
      {
        id: "col_amt",
        field: "amt",
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
        id: "col_totamt",
        field: "totamt",
        caption: "합계금액",
        width: 100,
      },
      {
        id: "col_taxtype",
        field: "taxtype",
        caption: "계산서유형",
        width: 150,
      },
      {
        id: "col_remark3",
        field: "remark3",
        caption: "회계전표",
        width: 200,
      },
      {
        id: "col_acseq1",
        field: "acseq1",
        caption: "전표순번1",
        width: 120,
      },
      {
        id: "col_acseq2",
        field: "acseq2",
        caption: "전표순번2",
        width: 120,
      },
      {
        id: "col_creditnum",
        field: "creditnum",
        caption: "신용카드번호",
        width: 150,
      },
    ],
  },
];
