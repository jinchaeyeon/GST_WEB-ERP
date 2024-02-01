import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_prodmac",
        field: "prodmac",
        caption: "수집위치",
        width: 120,
      },
      {
        id: "col_insert_date",
        field: "insert_date",
        caption: "일자",
        width: 120,
      },
      {
        id: "col_insert_time",
        field: "insert_time",
        caption: "시간",
        width: 120,
      },
      {
        id: "col_temperature",
        field: "temperature",
        caption: "온도",
        width: 100,
      },
      {
        id: "col_humidity",
        field: "humidity",
        caption: "습도",
        width: 100,
      },
      {
        id: "col_defrost",
        field: "defrost",
        caption: "재상",
        width: 120,
      }
    ],
  },
];
