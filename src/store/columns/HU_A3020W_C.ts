import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_payitemcd",
        field: "payitemcd",
        caption: "지급항목코드",
        width: 120,
      },
      {
        id: "col_payitemnm",
        field: "payitemnm",
        caption: "지급항목명",
        width: 150,
      },
      {
        id: "col_payitemkind",
        field: "payitemkind",
        caption: "지급항목종류",
        width: 150,
      },
      {
        id: "col_payitemgroup",
        field: "payitemgroup",
        caption: "항목그룹",
        width: 120,
      },
      {
        id: "col_taxcd",
        field: "taxcd",
        caption: "세액구분",
        width: 120,
      },
      {
        id: "col_notaxlmt",
        field: "notaxlmt",
        caption: "비과세한도액",
        width: 100,
      },
      {
        id: "col_empinsuranceyn",
        field: "empinsuranceyn",
        caption: "고용보험적용여부",
        width: 130,
      },
      {
        id: "col_monthlypayyn",
        field: "monthlypayyn",
        caption: "월정급여포함여부",
        width: 130,
      },
      {
        id: "col_avgwageyn",
        field: "avgwageyn",
        caption: "평균임금포함여부",
        width: 130,
      },
      {
        id: "col_ordwageyn",
        field: "ordwageyn",
        caption: "통상임금포함여부",
        width: 130,
      },
      {
        id: "col_daycalyn",
        field: "daycalyn",
        caption: "퇴직평균급여포함여부",
        width: 130,
      },
      {
        id: "col_rtrpayyn",
        field: "rtrpayyn",
        caption: "일할계산여부",
        width: 130,
      },
      {
        id: "col_totincluyn",
        field: "totincluyn",
        caption: "총액포함여부",
        width: 130,
      },
      {
        id: "col_stdamt",
        field: "stdamt",
        caption: "끝전처리 기준액",
        width: 150,
      },
      {
        id: "col_fraction",
        field: "fraction",
        caption: "끝전처리",
        width: 400,
      },
    ]
  }, 
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_payitemcd2",
        field: "payitemcd",
        caption: "공제항목코드",
        width: 250,
      },
      {
        id: "col_payitemnm2",
        field: "payitemnm",
        caption: "공제항목명",
        width: 250,
      },
      {
        id: "col_payitemgroup2",
        field: "payitemgroup",
        caption: "항목그룹",
        width: 250,
      },
      {
        id: "col_totincluyn2",
        field: "totincluyn",
        caption: "총액포함여부",
        width: 200,
      },
      {
        id: "col_stdamt2",
        field: "stdamt",
        caption: "끝전처리 기준액",
        width: 200,
      },
      {
        id: "col_fraction2",
        field: "fraction",
        caption: "끝전처리",
        width: 400,
      },
    ]
  },
];
