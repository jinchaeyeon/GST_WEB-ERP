import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_mngitemcd",
        field: "mngitemcd",
        caption: "관리항목코드",
        width: 150,
      },
      {
        id: "col_mngitemnm",
        field: "mngitemnm",
        caption: "관리항목명",
        width: 150,
      },
      {
        id: "col_system_yn",
        field: "system_yn",
        caption: "시스템코드여부",
        width: 80,
      },
      {
        id: "col_extra_field1",
        field: "extra_field1",
        caption: "여유필드1",
        width: 120,
      },
      {
        id: "col_extra_field2",
        field: "extra_field2",
        caption: "여유필드2",
        width: 120,
      },
      {
        id: "col_extra_field3",
        field: "extra_field3",
        caption: "여유필드3",
        width: 120,
      },
      {
        id: "col_controltype",
        field: "controltype",
        caption: "컨트롤유형",
        width: 120,
      },
      {
        id: "col_table_id",
        field: "table_id",
        caption: "참조테이블",
        width: 120,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "적요",
        width: 200,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_acntgrpcd",
        field: "acntgrpcd",
        caption: "그룹코드",
        width: 150,
      },
      {
        id: "col_acntgrpnm",
        field: "acntgrpnm",
        caption: "그룹명",
        width: 150,
      },
      {
        id: "col_acntgrpgb",
        field: "acntgrpgb",
        caption: "그룹구분",
        width: 120,
      },
      {
        id: "col_grpchr",
        field: "grpchr",
        caption: "그룹특성",
        width: 120,
      },
      {
        id: "col_prntacntgrp",
        field: "prntacntgrp",
        caption: "상위그룹코드",
        width: 120,
      },
      {
        id: "col_extra_field12",
        field: "extra_field1",
        caption: "여유필드1",
        width: 120,
      },
      {
        id: "col_extra_field22",
        field: "extra_field2",
        caption: "여유필드2",
        width: 120,
      },
      {
        id: "col_extra_field32",
        field: "extra_field3",
        caption: "여유필드3",
        width: 120,
      },
      {
        id: "col_acntgrpauto",
        field: "acntgrpauto",
        caption: "그룹코드자동항목",
        width: 120,
      },
      {
        id: "col_p_line",
        field: "p_line",
        caption: "출력line",
        width: 120,
      },
      {
        id: "col_p_border",
        field: "p_border",
        caption: "출력border",
        width: 120,
      },
      {
        id: "col_p_color",
        field: "p_color",
        caption: "출력color",
        width: 120,
      },
      {
        id: "col_p_seq",
        field: "p_seq",
        caption: "출력순서",
        width: 100,
      },
    ],
  },{
    gridName: "grdList3",
    columns: [
      {
        id: "col_acntcd",
        field: "acntcd",
        caption: " 계정과목코드",
        width: 150,
      },
      {
        id: "col_acntnm",
        field: "acntnm",
        caption: "계정명",
        width: 150,
      },
      {
        id: "col_caculationgb",
        field: "caculationgb",
        caption: "계산방식",
        width: 120,
      },
    ],
  },{
    gridName: "grdList4",
    columns: [
      {
        id: "col_stdrmkcd",
        field: "stdrmkcd",
        caption: " 단축계정코드",
        width: 150,
      },
      {
        id: "col_acntcd2",
        field: "acntcd",
        caption: "계정과목코드",
        width: 150,
      },
      {
        id: "col_acntnm2",
        field: "acntnm",
        caption: "계정명",
        width: 150,
      },
      {
        id: "col_stdrmknm1",
        field: "stdrmknm1",
        caption: "단축계정명1",
        width: 150,
      },
      {
        id: "col_stdrmknm2",
        field: "stdrmknm2",
        caption: "단축계정명2",
        width: 150,
      },
    ],
  },
];
