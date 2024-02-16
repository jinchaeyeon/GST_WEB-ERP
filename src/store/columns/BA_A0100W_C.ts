import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_roomnum",
        field: "roomnum",
        caption: "룸번호",
        width: 120,
      },
      {
        id: "col_roomdiv",
        field: "roomdiv",
        caption: "구분",
        width: 120,
      },
      {
        id: "col_load_place",
        field: "load_place",
        caption: "위치",
        width: 120,
      },
      {
        id: "col_area",
        field: "area",
        caption: "지역",
        width: 120,
      },
      {
        id: "col_animalkind",
        field: "animalkind",
        caption: "동물종",
        width: 120,
      },
      {
        id: "col_testpart",
        field: "testpart",
        caption: "시험파트",
        width: 120,
      },
      {
        id: "col_inspect_yn",
        field: "inspect_yn",
        caption: "검사기기 보유 여부",
        width: 80,
      },
      {
        id: "col_use_yn",
        field: "use_yn",
        caption: "사용여부",
        width: 80,
      },
      {
        id: "col_calculate_yn",
        field: "calculate_yn",
        caption: "계산반영여부",
        width: 80,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "비고",
        width: 200,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_lacno",
        field: "lacno",
        caption: "렉번호",
        width: 120,
      },
      {
        id: "col_cageqty",
        field: "cageqty",
        caption: "케이시수량",
        width: 100,
      },
      {
        id: "col_use_yn2",
        field: "use_yn",
        caption: "사용여부",
        width: 80,
      },
      {
        id: "col_remark2",
        field: "remark",
        caption: "비고",
        width: 158,
      },
    ],
  },
];
