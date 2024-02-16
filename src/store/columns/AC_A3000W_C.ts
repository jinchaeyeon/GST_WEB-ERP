import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_fxactnm",
        field: "fxactnm",
        caption: "계정과목명",
        width: 120,
      },
      {
        id: "col_baseamt",
        field: "baseamt",
        caption: "기초금액",
        width: 100,
      },
      {
        id: "col_growamt",
        field: "growamt",
        caption: "당기증가액",
        width: 100,
      },
      {
        id: "col_dropamt",
        field: "dropamt",
        caption: "당기감소액",
        width: 100,
      },
      {
        id: "col_predamt",
        field: "predamt",
        caption: "기말잔액",
        width: 100,
      },
      {
        id: "col_fxdepacyndpyr",
        field: "fxdepacyndpyr",
        caption: "전기충당금누계액",
        width: 100,
      },
      {
        id: "col_depjanamt",
        field: "depjanamt",
        caption: "상각대상금액",
        width: 100,
      },
      {
        id: "col_curdamt",
        field: "curdamt",
        caption: "당기감가상각비",
        width: 100,
      },
      {
        id: "col_curalldamt",
        field: "curalldamt",
        caption: "감가상각누계액",
        width: 100,
      },
      {
        id: "col_chamt",
        field: "chamt",
        caption: "미상각잔액",
        width: 100,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_fxcode",
        field: "fxcode",
        caption: "자산코드",
        width: 120,
      },
      {
        id: "col_fxname",
        field: "fxname",
        caption: "자산명",
        width: 120,
      },
      {
        id: "col_fxsize",
        field: "fxsize",
        caption: "규격",
        width: 120,
      },
      {
        id: "col_indt",
        field: "indt",
        caption: "취득일자",
        width: 120,
      },
      {
        id: "col_baseamt2",
        field: "baseamt",
        caption: "기초금액",
        width: 100,
      },
      {
        id: "col_growamt2",
        field: "growamt",
        caption: "당기증가액",
        width: 100,
      },
      {
        id: "col_dropamt2",
        field: "dropamt",
        caption: "당기감소액",
        width: 100,
      },
      {
        id: "col_fbaseamt",
        field: "fbaseamt",
        caption: "기말잔액",
        width: 100,
      },
      {
        id: "col_pcurdamt",
        field: "pcurdamt",
        caption: "전기충당금누계액",
        width: 100,
      },
      {
        id: "col_janamt",
        field: "janamt",
        caption: "상각대상금액",
        width: 100,
      },
      {
        id: "col_fxdepyrmm",
        field: "fxdepyrmm",
        caption: "내용년수",
        width: 100,
      },
      {
        id: "col_rate",
        field: "rate",
        caption: "상각율",
        width: 100,
      },
      {
        id: "col_mm",
        field: "mm",
        caption: "월수",
        width: 100,
      },
      {
        id: "col_curdamt2",
        field: "curdamt",
        caption: "당기감가상각비",
        width: 100,
      },
      {
        id: "col_allcurdamt",
        field: "allcurdamt",
        caption: "감가상각누계액",
        width: 100,
      },
      {
        id: "col_chamt2",
        field: "chamt",
        caption: "미상각잔액",
        width: 100,
      },
    ],
  },
];
