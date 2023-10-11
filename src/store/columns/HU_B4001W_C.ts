import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
    {
      gridName: "grdUse",
      columns: [
        {
          id: "col_yerdt",
          field: "startdate",
          caption: "연차사용일",
          width: 120,        
        },
        {
          id: "col_cnt",
          field: "cnt",
          caption: "횟수",
          width: 100,
        },       
      ]
    },    
    {
      gridName: "grdAdj",
      columns: [
        {
          id: "col_yyyymm",
          field: "yyyymm",
          caption: "기준년도",
          width: 120,
        },      
        {
          id: "col_adjdiv",
          field: "adjdiv",
          caption: "조정구분",
          width: 120,
        },  
        {
          id: "col_qty",
          field: "qty",
          caption: "연차횟수",
          width: 100,
        },  
        {
          id: "col_remark",
          field: "remark",
          caption: "비고",
          width: 200,
        },  
        {
          id: "col_insert_userid",
          field: "insert_userid",
          caption: "등록자",
          width: 120,
        },  
        {
          id: "col_insert_time",
          field: "insert_time",
          caption: "등록일",
          width: 120,
        },      
      ]
    },
];