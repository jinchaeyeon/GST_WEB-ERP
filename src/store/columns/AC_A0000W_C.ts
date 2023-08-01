import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_taxloca",
        field: "taxloca",
        caption: "사업장",
        width: 150,
      },
      {
        id: "col_compnm",
        field: "compnm",
        caption: "회사명",
        width: 250,
      },
      {
        id: "col_bizregnum",
        field: "bizregnum",
        caption: "사업자등록번호",
        width: 200,
      },
      {
        id: "col_reprenm",
        field: "reprenm",
        caption: "대표자명",
        width: 150,
      },
      {
        id: "col_phonenum",
        field: "phonenum",
        caption: "전화번호",
        width: 200,
      },
      {
        id: "col_faxnum",
        field: "faxnum",
        caption: "팩스번호",
        width: 200,
      },
      {
        id: "col_address",
        field: "address",
        caption: "주소",
        width: 535,
      },
    ],
  },
];
