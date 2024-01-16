import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_appsts",
        field: "appsts",
        caption: "결재상태",
        width: 120,
      },
      {
        id: "col_expensedt",
        field: "expensedt",
        caption: "신청일자",
        width: 120,
      },
      {
        id: "col_carddt",
        field: "carddt",
        caption: "사용일",
        width: 120,
      },
      {
        id: "col_expenseno",
        field: "expenseno",
        caption: "결의서 NO",
        width: 150,
      },
      {
        id: "col_location",
        field: "location",
        caption: "사업장",
        width: 120,
      },
      {
        id: "col_dptcd",
        field: "dptcd",
        caption: "비용부서",
        width: 120,
      },
      {
        id: "col_prsnnm",
        field: "prsnnm",
        caption: "요청자",
        width: 120,
      },
      {
        id: "col_itemnm",
        field: "itemnm",
        caption: "예산항목",
        width: 120,
      },
      {
        id: "col_amt",
        field: "amt",
        caption: "지출금액",
        width: 100,
      },
      {
        id: "col_taxamt",
        field: "taxamt",
        caption: "세액",
        width: 100,
      },
      {
        id: "col_remarkcnt",
        field: "remarkcnt",
        caption: "품의내역",
        width: 120,
      },
      {
        id: "col_appnum",
        field: "appnum",
        caption: "결재번호",
        width: 120,
      },
      {
        id: "col_acntdiv",
        field: "acntdiv",
        caption: "전표처리유무",
        width: 120,
      },
    ],
  },
];
