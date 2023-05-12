import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_extra_field1",
        field: "extra_field1",
        caption: "구분",
        width: 200,
      },
      {
        id: "col_prodemp",
        field: "prodemp",
        caption: "작업자",
        width: 200,
      },
      {
        id: "col_amt",
        field: "amt",
        caption: "금액",
        width: 100,
      },
      {
        id: "col_rate",
        field: "rate",
        caption: "시간당임률",
        width: 100,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "비고",
        width: 700,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_extra_field12",
        field: "extra_field1",
        caption: "구분",
        width: 120,
      },
      {
        id: "col_prodmac",
        field: "prodmac",
        caption: "설비",
        width: 120,
      },
      {
        id: "col_amt2",
        field: "amt",
        caption: "금액",
        width: 100,
      },
      {
        id: "col_rate2",
        field: "rate",
        caption: "시간당임률",
        width: 100,
      },
      {
        id: "col_fx_depre_price",
        field: "fx_depre_price",
        caption: "기계상각비",
        width: 100,
      },
      {
        id: "col_std_dir_depre_price",
        field: "std_dir_depre_price",
        caption: "직접상각비(표준)",
        width: 100,
      },
      {
        id: "col_depre_price",
        field: "depre_price",
        caption: "직접상각비",
        width: 100,
      },
      {
        id: "col_worktime",
        field: "worktime",
        caption: "작업시간",
        width: 100,
      },
      {
        id: "col_remark2",
        field: "remark",
        caption: "비고",
        width: 500,
      },
    ],
  },
];
