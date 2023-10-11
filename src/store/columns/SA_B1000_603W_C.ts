import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    // 요약정보
    gridName: "grdList",
    columns: [ 
      {
        id: "col_projectnum",
        field: "projectnum",
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
        id: "col_user_name",
        field: "user_name",
        caption: "고객",
        width: 120,
      },
      {
        id: "col_smperson",
        field: "smperson",
        caption: "SM담당자",
        width: 120,
      },
      {
        id: "col_projectnm",
        field: "projectnm",
        caption: "프로젝트명",
        width: 150,
      },
    ],
  },
];