import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_drbalamt",
        field: "drbalamt",
        caption: "잔액",
        width: 50,
      }, 
      {
        id: "col_drtotamt",
        field: "drtotamt",
        caption: "누계",
        width: 50,
      },    
      {
        id: "col_drmonamt",
        field: "drmonamt",
        caption: "월계",
        width: 50,
      },      
      {
        id: "col_acntnm",
        field: "acntnm",
        caption: "계정명",
        width: 70,
      },    
      {
        id: "col_crmonamt",
        field: "crmonamt",
        caption: "월계",
        width: 50,
      },    
      {
        id: "col_crtotamt",
        field: "crtotamt",
        caption: "누계",
        width: 50,
      },  
      {
        id: "col_crbalamt",
        field: "crbalamt",
        caption: "잔액",
        width: 50,
      },          
    ],
  }, 
  // 재무제표 상세
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_acntcd",
        field: "acntcd",
        caption: "계정과목코드",
        width: 100,
      }, 
      {
        id: "col_acntnm1",
        field: "acntnm",
        caption: "계정명",
        width: 100,
      },    
    ]
  }, 
   // 전표 상세정보
   {
    gridName: "grdList3",
    columns: [  
      {
        id: "col_acntnm2",
        field: "acntnm",
        caption: "계정명",
        width: 100,
      },    
      {
        id: "col_slipamt_1",
        field: "slipamt_1",
        caption: "차변금액",
        width: 100,
      }, 
      {
        id: "col_slipamt_2",
        field: "slipamt_2",
        caption: "대변금액",
        width: 100,
      }, 
      {
        id: "col_remark3",
        field: "remark3",
        caption: "적요",
        width: 100,
      }, 
      {
        id: "col_custcd",
        field: "custcd",
        caption: "업체코드",
        width: 100,
      }, 
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체명",
        width: 100,
      }, 
      {
        id: "col_acntcd1",
        field: "acntcd",
        caption: "계정코드",
        width: 100,
      }, 
      {
        id: "col_ackey",
        field: "ackey",
        caption: "전표번호",
        width: 100,
      }, 
    ]
  }, 
  // 월차손익분석표
  {
    gridName: "grdList4",
    columns: [  
      {
        id: "col_subject1",
        field: "subject",
        caption: "계정과목",
        width: 150,
      },  
      {
        id: "col_01",
        field: "01",
        caption: "01월",
        width: 100,
      },  
      {
        id: "col_02",
        field: "02",
        caption: "02월",
        width: 100,
      },  
      {
        id: "col_03",
        field: "03",
        caption: "03월",
        width: 100,
      },  
      {
        id: "col_04",
        field: "04",
        caption: "04월",
        width: 100,
      },  
      {
        id: "col_05",
        field: "05",
        caption: "05월",
        width: 100,
      },  
      {
        id: "col_06",
        field: "06",
        caption: "06월",
        width: 100,
      },  
      {
        id: "col_07",
        field: "07",
        caption: "07월",
        width: 100,
      },  
      {
        id: "col_08",
        field: "08",
        caption: "08월",
        width: 100,
      },  
      {
        id: "col_09",
        field: "09",
        caption: "09월",
        width: 100,
      },  
      {
        id: "col_10",
        field: "10",
        caption: "10월",
        width: 100,
      },  
      {
        id: "col_11",
        field: "11",
        caption: "11월",
        width: 100,
      },  
      {
        id: "col_12",
        field: "12",
        caption: "12월",
        width: 100,
      },  
      {
        id: "col_合 計",
        field: "合 計",
        caption: "合 計",
        width: 100,
      },  
    ]  
  },
];