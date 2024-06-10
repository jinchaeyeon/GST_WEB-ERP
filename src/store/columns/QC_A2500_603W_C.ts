import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_ref_key",
        field: "ref_key",
        caption: "PJT NO.",
        width: 120,
      },
      {
        id: "col_ordnum",
        field: "ordnum",
        caption: "수주번호",
        width: 120,
      },
      {
        id: "col_quotestnum",
        field: "quotestnum",
        caption: "예약번호",
        width: 120,
      },
      {
        id: "col_testnum",
        field: "testnum",
        caption: "시험번호",
        width: 120,
      },
      {
        id: "col_status",
        field: "status",
        caption: "진행상태",
        width: 120,
      },
      {
        id: "col_ncrdiv",
        field: "ncrdiv",
        caption: "이슈 유형",
        width: 120,
      },
      {
        id: "col_combytype",
        field: "combytype",
        caption: "세부유형",
        width: 120,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체명",
        width: 120,
      },
      {
        id: "col_chkperson ",
        field: "chkperson ",
        caption: "시험책임자",
        width: 120,
      },
      {
        id: "col_itemnm",
        field: "itemnm",
        caption: "품목명",
        width: 120,
      },
      {
        id: "col_cpmperson",
        field: "cpmperson",
        caption: "영업담당자",
        width: 120,
      },
      {
        id: "col_smperson",
        field: "smperson",
        caption: "PM담당자",
        width: 120,
      },
      {
        id: "col_baddt",
        field: "baddt",
        caption: "등록일자",
        width: 120,
      },
      {
        id: "col_qcdt",
        field: "qcdt",
        caption: "완료일자",
        width: 120,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_insert_userid",
        field: "insert_userid",
        caption: "작성자",
        width: 120,
      },
      {
        id: "col_comment",
        field: "comment",
        caption: "내용",
        width: 400,
      },
      {
        id: "col_insert_time",
        field: "insert_time",
        caption: "완료",
        width: 120,
      },
    ],
  },
  {
    gridName: "grdList3",
    columns: [
      {
        id: "col_insert_userid2",
        field: "insert_userid",
        caption: "작성자",
        width: 120,
      },
      {
        id: "col_comment2",
        field: "comment",
        caption: "내용",
        width: 400,
      },
      {
        id: "col_insert_time2",
        field: "insert_time",
        caption: "완료",
        width: 120,
      },
      {
        id: "col_update_time2",
        field: "update_time",
        caption: "수정일시",
        width: 120,
      },
    ],
  },
  {
    gridName: "grdList4",
    columns: [
      {
        id: "col_insert_userid3",
        field: "insert_userid",
        caption: "작성자",
        width: 120,
      },
      {
        id: "col_comment3",
        field: "comment",
        caption: "내용",
        width: 400,
      },
      {
        id: "col_insert_time3",
        field: "insert_time",
        caption: "완료",
        width: 120,
      },
      {
        id: "col_update_time3",
        field: "update_time",
        caption: "수정일시",
        width: 120,
      },
    ],
  },
];
