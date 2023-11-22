import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_custcd",
        field: "custcd",
        caption: "업체코드",
        width: 120,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체명",
        width: 120,
      },
      {
        id: "col_custabbr",
        field: "custabbr",
        caption: "그룹명(모기업)",
        width: 120,
      },
      {
        id: "col_address",
        field: "address",
        caption: "주소",
        width: 120,
      },
      {
        id: "col_custdiv",
        field: "custdiv",
        caption: "기업 분류",
        width: 120,
      },
      {
        id: "col_comptype",
        field: "comptype",
        caption: "개발분야",
        width: 120,
      },
      {
        id: "col_raduseyn",
        field: "raduseyn",
        caption: "상장유무",
        width: 120,
      },
      {
        id: "col_itemlvl1",
        field: "itemlvl1",
        caption: "신용평가 등급",
        width: 120,
      },
      {
        id: "col_contractHistory",
        field: "contractHistory",
        caption: "계약 이력",
        width: 120,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_yyyy",
        field: "yyyy",
        caption: "기준년도",
        width: 120,
      },
      {
        id: "col_totemp",
        field: "totemp",
        caption: "종업원 수",
        width: 100,
      },
      {
        id: "col_totasset",
        field: "totasset",
        caption: "자산총계",
        width: 100,
      },
      {
        id: "col_dedt_ratio",
        field: "dedt_ratio",
        caption: "부채총계",
        width: 100,
      },
      {
        id: "col_totcapital",
        field: "totcapital",
        caption: "자본총계",
        width: 100,
      },
      {
        id: "col_salesmoney",
        field: "salesmoney",
        caption: "매출액",
        width: 100,
      },
      {
        id: "col_operating_profits",
        field: "operating_profits",
        caption: "영업이익",
        width: 100,
      },
      {
        id: "col_current_income",
        field: "current_income",
        caption: "당기순이익",
        width: 100,
      },
    ],
  },
  {
    gridName: "grdList3",
    columns: [
      {
        id: "col_prsnnm",
        field: "prsnnm",
        caption: "성명",
        width: 120,
      },
      {
        id: "col_dptnm",
        field: "dptnm",
        caption: "부서",
        width: 120,
      },
      {
        id: "col_postcd",
        field: "postcd",
        caption: "직위/직책",
        width: 120,
      },
      {
        id: "col_telno",
        field: "telno",
        caption: "전화번호",
        width: 150,
      },
      {
        id: "col_phoneno",
        field: "phoneno",
        caption: "휴대폰번호",
        width: 150,
      },
      {
        id: "col_email",
        field: "email",
        caption: "메일주소",
        width: 150,
      },
      {
        id: "col_remark3",
        field: "remark",
        caption: "비고",
        width: 200,
      },
      {
        id: "col_files",
        field: "files",
        caption: "첨부파일",
        width: 120,
      },
    ],
  },
];
