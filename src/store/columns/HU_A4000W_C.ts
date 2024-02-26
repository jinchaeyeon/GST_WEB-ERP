import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_reviewlvl1",
        field: "reviewlvl1",
        caption: "고과분류",
        width: 120,
      },
      {
        id: "col_title",
        field: "title",
        caption: "고과요소",
        width: 150,
      },
      {
        id: "col_contents",
        field: "contents",
        caption: "착안점",
        width: 200,
      },
      {
        id: "col_commyn",
        field: "commyn",
        caption: "공통여부",
        width: 80,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_dptcd",
        field: "dptcd",
        caption: "부서코드",
        width: 120,
      },
      {
        id: "col_remark1",
        field: "remark1",
        caption: "비고",
        width: 200,
      },
    ],
  },
  {
    gridName: "grdList3",
    columns: [
      {
        id: "col_monthlyhrreview",
        field: "monthlyhrreview",
        caption: "인사평가번호",
        width: 150,
      },
      {
        id: "col_interviewdt",
        field: "interviewdt",
        caption: "월별인사평가일자",
        width: 120,
      },
      {
        id: "col_dptcd2",
        field: "dptcd",
        caption: "부서",
        width: 120,
      },
      {
        id: "col_interviewee",
        field: "interviewee",
        caption: "면접자",
        width: 120,
      },
      {
        id: "col_difficulty",
        field: "difficulty",
        caption: "업무난이도",
        width: 100,
      },
      {
        id: "col_yyyymm",
        field: "yyyymm",
        caption: "인사평가월",
        width: 120,
      },
    ],
  },
  {
    gridName: "grdList5",
    columns: [
      {
        id: "col_badcd",
        field: "badcd",
        caption: "불량내역",
        width: 120,
      },
      {
        id: "col_baddt",
        field: "baddt",
        caption: "불량일자",
        width: 120,
      },
      {
        id: "col_remark2",
        field: "remark",
        caption: "비고",
        width: 200,
      },
    ],
  },
  {
    gridName: "grdList6",
    columns: [
      {
        id: "col_person",
        field: "person",
        caption: "작성자",
        width: 120,
      },
      {
        id: "col_recdt",
        field: "recdt",
        caption: "작성일",
        width: 120,
      },
      {
        id: "col_title2",
        field: "title",
        caption: "제목",
        width: 150,
      },
      {
        id: "col_contents2",
        field: "contents",
        caption: "내용",
        width: 200,
      },
      {
        id: "col_files",
        field: "files",
        caption: "첨부번호",
        width: 150,
      },
      {
        id: "col_remark3",
        field: "remark",
        caption: "비고",
        width: 200,
      },
    ],
  },
  {
    gridName: "grdList7",
    columns: [
      {
        id: "col_rnpdiv",
        field: "rnpdiv",
        caption: "상벌구분",
        width: 120,
      },
      {
        id: "col_reqdt",
        field: "reqdt",
        caption: "일자",
        width: 120,
      },
      {
        id: "col_reloffice",
        field: "reloffice",
        caption: "기관",
        width: 150,
      },
      {
        id: "col_contents3",
        field: "contents",
        caption: "내용",
        width: 200,
      },
      {
        id: "col_files2",
        field: "files",
        caption: "첨부번호",
        width: 150,
      },
      {
        id: "col_remark4",
        field: "remark",
        caption: "비고",
        width: 200,
      },
    ],
  },
];
