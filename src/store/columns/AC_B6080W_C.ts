import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_매출일자",
        field: "매출일자",
        caption: "매출일자",
        width: 120,
      },
      {
        id: "col_업체명",
        field: "업체명",
        caption: "업체명",
        width: 150,
      },
      {
        id: "col_품목코드",
        field: "품목코드",
        caption: "품목코드",
        width: 150,
      },
      {
        id: "col_품명",
        field: "품명",
        caption: "품명",
        width: 150,
      },
      {
        id: "col_금액",
        field: "금액",
        caption: "금액",
        width: 100,
      },
      {
        id: "col_관리번호",
        field: "관리번호",
        caption: "관리번호",
        width: 150,
      },
    ],
  },
];
