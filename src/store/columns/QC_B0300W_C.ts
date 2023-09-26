import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_fxnum",
        field: "fxnum",
        caption: "설비번호",
        width: 150,
      },
      {
        id: "col_fxnm",
        field: "fxnm",
        caption: "설비명",
        width: 150,
      },
      {
        id: "col_proccd",
        field: "proccd",
        caption: "공정",
        width: 120,
      },
      {
        id: "col_itemnm",
        field: "itemnm",
        caption: "품목명",
        width: 150,
      },
      {
        id: "col_inspeccd",
        field: "inspeccd",
        caption: "검사항목",
        width: 120,
      },
      {
        id: "col_qc_spec",
        field: "qc_spec",
        caption: "측정기준명",
        width: 120,
      },
      {
        id: "col_sample",
        field: "sample",
        caption: "시료수",
        width: 100,
      },
      {
        id: "col_max_value",
        field: "max_value",
        caption: "측정 최대값",
        width: 120,
      },
      {
        id: "col_min_value",
        field: "min_value",
        caption: "측정 최소값",
        width: 120,
      },
      {
        id: "col_x_cl",
        field: "x_cl",
        caption: "평균",
        width: 120,
      },
      {
        id: "col_deviation",
        field: "deviation",
        caption: "산포",
        width: 120,
      },
      {
        id: "col_Cpk",
        field: "Cpk",
        caption: "단기공정능력",
        width: 120,
      },
    ],
  },
];
