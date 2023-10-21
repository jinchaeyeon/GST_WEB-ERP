import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    // 요약정보
    gridName: "grdList",
    columns: [ 
      {
        id: "col_ref_key",
        field: "ref_key",
        caption: "프로젝트 번호",
        width: 150,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "고객사",
        width: 150,
      },
      {
        id: "col_smperson",
        field: "smperson",
        caption: "SM담당자",
        width: 120,
      },
      {
        id: "col_materialtype",
        field: "materialtype",
        caption: "물질분류",
        width: 120,
      },
      {
        id: "col_materialnm",
        field: "materialnm",
        caption: "시험물질명",
        width: 150,
      },
    ],
  },
];