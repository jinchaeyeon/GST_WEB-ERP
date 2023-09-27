import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_valueboxcd",
        field: "valueboxcd",
        caption: "ValueBox코드",
        width: 150,
      },
      {
        id: "col_valueboxnm",
        field: "valueboxnm",
        caption: "ValueBox명",
        width: 150,
      },
      {
        id: "col_fnscore",
        field: "fnscore",
        caption: "기능점수",
        width: 100,
      },
      {
        id: "col_level",
        field: "level",
        caption: "난이도",
        width: 120,
      },
      {
        id: "col_exptime",
        field: "exptime",
        caption: "개발예상시간",
        width: 100,
      },
      {
        id: "col_useyn",
        field: "useyn",
        caption: "사용유무",
        width: 100,
      },
      {
        id: "col_remark2",
        field: "remark2",
        caption: "비고",
        width: 200,
      },
      {
        id: "col_valBasecode",
        field: "valBasecode",
        caption: "기준코드",
        width: 100,
      },
      {
        id: "col_absolutedays",
        field: "absolutedays",
        caption: "절대공기",
        width: 100,
      },
      {
        id: "col_DesignPerson",
        field: "DesignPerson",
        caption: "설계자",
        width: 120,
      },
      {
        id: "col_DevPerson",
        field: "DevPerson",
        caption: "개발자",
        width: 120,
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
    ],
  },
];
