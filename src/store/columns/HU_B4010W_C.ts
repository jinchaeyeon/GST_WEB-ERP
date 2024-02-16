import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_prsnnum",
        field: "prsnnum",
        caption: "사번",
        width: 120,
      },
      {
        id: "col_prsnnm",
        field: "prsnnm",
        caption: "이름",
        width: 120,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_reviewlvl1",
        field: "reviewlvl1",
        caption: "구분",
        width: 120,
      },
      {
        id: "col_title",
        field: "title",
        caption: "항목",
        width: 150,
      },
      {
        id: "col_quantitative_evalution",
        field: "quantitative_evalution",
        caption: "항목",
        width: 150,
      },
      {
        id: "col_qualitative_evalution",
        field: "qualitative_evalution",
        caption: "비고",
        width: 200,
      },
    ],
  },
  {
    gridName: "grdList3",
    columns: [
      {
        id: "col_baddt",
        field: "baddt",
        caption: "불량일자",
        width: 120,
      },
      {
        id: "col_badcd",
        field: "badcd",
        caption: "불량내역",
        width: 120,
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
    gridName: "grdList4",
    columns: [
      {
        id: "col_reqdt",
        field: "reqdt",
        caption: "일자",
        width: 120,
      },
      {
        id: "col_rnpdiv",
        field: "rnpdiv",
        caption: "상벌구분",
        width: 120,
      },
      {
        id: "col_reloffice",
        field: "reloffice",
        caption: "기관",
        width: 120,
      },
      {
        id: "col_contents",
        field: "contents",
        caption: "내용",
        width: 150,
      },
      {
        id: "col_files",
        field: "files",
        caption: "첨부파일",
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
];
