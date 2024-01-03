import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_custnm",
        field: "custnm",
        caption: "거래처명",
        width: 120,
      },
      {
        id: "col_custregnum",
        field: "custregnum",
        caption: "사업자등록번호",
        width: 150,
      },
      {
        id: "col_maesu",
        field: "maesu",
        caption: "매수",
        width: 100,
      },
      {
        id: "col_amt",
        field: "amt",
        caption: "공급가액",
        width: 100,
      },
      {
        id: "col_vat",
        field: "vat",
        caption: "부가세",
        width: 100,
      },
      {
        id: "col_ceonm",
        field: "ceonm",
        caption: "대표자명",
        width: 120,
      },
      {
        id: "col_compclass",
        field: "compclass",
        caption: "업태",
        width: 120,
      },
      {
        id: "col_comptype",
        field: "comptype",
        caption: "업종",
        width: 120,
      },
    ],
  },
];
