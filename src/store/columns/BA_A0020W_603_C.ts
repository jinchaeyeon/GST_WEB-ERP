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
        id: "col_companyName",
        field: "companyName",
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
        id: "col_devdiv",
        field: "devdiv",
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
        id: "col_class",
        field: "class",
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
        id: "col_employeesNumber",
        field: "employeesNumber",
        caption: "종업원 수",
        width: 100,
      },
      {
        id: "col_Totalassets",
        field: "Totalassets",
        caption: "자산총계",
        width: 100,
      },
      {
        id: "col_Totalliabilities",
        field: "Totalliabilities",
        caption: "부채총계",
        width: 100,
      },
      {
        id: "col_Totalcapital",
        field: "Totalcapital",
        caption: "자본총계",
        width: 100,
      },
      {
        id: "col_Sales",
        field: "Sales",
        caption: "매출액",
        width: 100,
      },
      {
        id: "col_businessprofits",
        field: "businessprofits",
        caption: "영업이익",
        width: 100,
      },
      {
        id: "col_Currentprofit",
        field: "Currentprofit",
        caption: "당기순이익",
        width: 100,
      },
      {
        id: "col_files",
        field: "files",
        caption: "첨부파일",
        width: 120,
      },
    ],
  },
  {
    gridName: "grdList3",
    columns: [
      {
        id: "col_name",
        field: "name",
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
        id: "col_position",
        field: "position",
        caption: "직위/직책",
        width: 120,
      },
      {
        id: "col_address_customer",
        field: "address_customer",
        caption: "주소",
        width: 150,
      },
      {
        id: "col_number",
        field: "number",
        caption: "전화번호",
        width: 150,
      },
      {
        id: "col_phonenumber",
        field: "phonenumber",
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
    ],
  },
];
