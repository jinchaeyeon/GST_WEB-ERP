import { FieldRenderProps } from "@progress/kendo-react-form";
import { GridEvent, GridItemChangeEvent } from "@progress/kendo-react-grid";
import React, { useCallback, useEffect } from "react";
import { useApi } from "../hooks/api";
import { Iparameters } from "../store/types";
import { commonCodeDefaultValue } from "./CommonString";

//오늘 날짜 8자리 string 반환 (ex. 20220101)
export const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = ("0" + (1 + date.getMonth())).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);

  return year + month + day;
};

//Date 타입 인수를 8자리 string로 날짜 변환하여 반환 (ex. => 20220101)
export const convertDateToStr = (date: Date) => {
  const year = date.getFullYear();
  const month = ("0" + (1 + date.getMonth())).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);

  return year + month + day;
};

//8자리 날짜 stirng에 구분자 추가
export const dateformat = (str: string) => {
  if (!str) return "";
  //구분자 -> '/'
  const date_str =
    str.substring(0, 4) + "/" + str.substring(4, 6) + "/" + str.substring(6);
  return date_str;
};

export const dateformat2 = (str: string) => {
  //구분자 -> '-'
  const date_str =
    str.substring(0, 4) + "-" + str.substring(4, 6) + "-" + str.substring(6);
  return date_str;
};

export const dateformat3 = (str: string) => {
  //구분자 -> '년 월 일'
  const date_str =
    str.substring(0, 4) +
    "년 " +
    str.substring(4, 6) +
    "월 " +
    str.substring(6) +
    "일";
  return date_str;
};

export const dateformat4 = (str: string) => {
  //구분자 -> '.'
  const date_str =
    str.substring(0, 4) +
    "." +
    str.substring(4, 6) +
    "." +
    str.substring(6) +
    ".";
  return date_str;
};

export const numberWithCommas = (num: number) => {
  if (typeof num === "string") {
    return num;
  }
  if (typeof num === "number") {
    //소수점 제외
    let numWithCommas = num.toString().split(".");
    return (
      numWithCommas[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
      (numWithCommas[1] ? "." + numWithCommas[1] : "")
    );
  }
};

//비즈니스 컴포넌트 조회
export const UseBizComponents = (bizComponentId: string, setListData: any) => {
  const processApi = useApi();

  useEffect(() => {
    console.log("bizComponentId");
    console.log(bizComponentId);

    if (bizComponentId !== null) {
      fetchData();
    }
  }, []);

  const fetchData = useCallback(async () => {
    let data: any;

    let id = {
      id: "biz-components?id=" + bizComponentId,
    };

    console.log("id~!");
    console.log(id);

    try {
      data = await processApi<any>("biz-components", id);
    } catch (error) {
      data = null;
    }

    console.log("data~!");
    console.log(data);

    if (data.isSuccess === true) {
      setListData(data);
    }
  }, []);
};

//쿼리 스트링을 받아서 조회 후 결과값을 반환
export const UseCommonQuery = (queryStr: string, setListData: any) => {
  const processApi = useApi();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    let data: any;

    let query = {
      query: "query?query=" + encodeURIComponent(queryStr),
    };

    try {
      data = await processApi<any>("query", query);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);
};

//현재 경로를 받아서 커스텀 옵션 조회 후 결과값을 반환
export const UseCustomOption = (pathname: string, setListData: any) => {
  //const [bizComponentData, setBizComponentData] = React.useState(null);
  const processApi = useApi();

  React.useEffect(() => {
    fetchCustomOptionData();
  }, []);

  //커스텀 옵션 조회
  const fetchCustomOptionData = React.useCallback(async () => {
    let data: any;
    try {
      data = await processApi<any>("custom-option", {
        formId: pathname.replace("/", ""),
      });
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      fetchBizComponentData(data);
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
  }, []);

  //비즈니스 컴포넌트 조회
  const fetchBizComponentData = useCallback(async (customOptionData: any) => {
    let data: any;

    const bizComponentId = Object.values(
      customOptionData.menuCustomDefaultOptions.query.map(
        (item: any) => item.bizComponentId
      )
    ).toString();

    let id = {
      id: "biz-components?id=" + bizComponentId,
    };

    try {
      data = await processApi<any>("biz-components", id);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      //비즈니스 컴포넌트 조회 반환문 참조하여 쿼리 및 컬럼정보 추가
      data.forEach((bcItem: any) => {
        customOptionData.menuCustomDefaultOptions.query.forEach(
          (defaultItem: any) => {
            if (bcItem.bizComponentId === defaultItem.bizComponentId) {
              defaultItem["query"] = (
                bcItem["querySelect"] +
                " " +
                bcItem["queryWhere"] +
                " " +
                bcItem["queryFooter"]
              ).replace(/\r\n/gi, " ");
              defaultItem["bizComponentItems"] = bcItem["bizComponentItems"];
            }
          }
        );
      });

      setListData(customOptionData);
    }
  }, []);
};

//현재 경로를 받아서 컬럼 리스트 조회 후 결과값을 반환
export const UseMenuColumns = (pathname: string, setListData: any) => {
  const processApi = useApi();

  React.useEffect(() => {
    fetchData();
  }, []);

  const parameters: Iparameters = {
    procedureName: "WEB_sys_sel_column_view_config",
    pageNumber: 1,
    pageSize: 200,
    parameters: {
      "@p_work_type": "CustomDetail",
      "@p_dbname": "SYSTEM",
      "@p_form_id": pathname,
      "@p_lang_id": "",
      "@p_parent_component": "",
      "@p_message": "",
    },
  };

  const fetchData = React.useCallback(async () => {
    let data: any;

    try {
      data = await processApi<any>("platform-procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
  }, []);
};

//현재 경로를 받아서 기본값 리스트 조회 후 결과값을 반환
// export const UseMenuDefaults = (pathname: string, setListData: any) => {
//   const processApi = useApi();

//   React.useEffect(() => {
//     fetchData();
//   }, []);

//   const parameters: Iparameters = {
//     procedureName: "WEB_sys_sel_default_management",
//     pageNumber: 1,
//     pageSize: 200,
//     parameters: {
//       "@p_work_type": "FormDefault",
//       "@p_form_id": pathname.replace("/", ""),
//       "@p_lang_id": "",
//       "@p_process_type": "",
//       "@p_message": "",
//     },
//   };

//   const fetchData = React.useCallback(async () => {
//     let data: any;

//     try {
//       data = await processApi<any>("platform-procedure", parameters);
//     } catch (error) {
//       data = null;
//     }

//     if (data.isSuccess === true) {
//       const rows = data.tables[0].Rows;
//       setListData(rows);
//     } else {
//       console.log("[오류 발생]");
//       console.log(data);
//     }
//   }, []);
// };

//그리드 스크롤을 맨 아래로 내렸을 때, 조회할 데이터가 남았으면 true 반환
export const chkScrollHandler = (
  event: GridEvent,
  PgNum: number,
  PgSize: number
) => {
  const totalNumber = event.target.props.total;
  const e = event.nativeEvent;
  let chk = false;

  if (totalNumber === undefined) {
    console.log("[scrollHandler check!] grid 'total' property를 입력하세요.");
    return false;
  }

  if (
    e.target.scrollTop + 10 >=
    e.target.scrollHeight - e.target.clientHeight
  ) {
    if (totalNumber > PgNum * PgSize) {
      chk = true;
    }
  }
  return chk;
};

//object로 custcd, custnm 받아서 업체정보 조회 쿼리 스트링 반환
export const getCustQuery = (para: any) => {
  return (
    "SELECT * FROM ba020t WHERE custcd LIKE '" +
    para.custcd +
    "'% AND custnm like '" +
    para.custnm +
    "'"
  );
};

//object로 itemcd, itemnm 받아서 품목정보 조회 쿼리 스트링 반환
export const getItemQuery = (para: any) => {
  return (
    "SELECT * FROM ba030t WHERE itemcd = '" +
    para.itemcd +
    "' AND itemnm LIKE '" +
    para.itemnm +
    "%'"
  );
};

//선택된 드롭다운리스트 값 (ex. {sub_code: "test", code_name:"test"} )을 인자로 받아서 빈 값(ex. {sub_code: "", code_name: ""} )인지 체크
//=> 빈 값인 경우 false 반환
export const checkIsDDLValid = (value: object) => {
  return JSON.stringify(value) === JSON.stringify(commonCodeDefaultValue) ||
    !value
    ? false
    : true;
};

export const getGridItemChangedData = (
  event: GridItemChangeEvent,
  dataResult: any,
  setDataResult: any,
  DATA_ITEM_KEY: string
) => {
  let field = event.field || "";
  event.dataItem[field] = event.value;
  let newData = dataResult.data.map((item: any) => {
    if (item[DATA_ITEM_KEY] === event.dataItem[DATA_ITEM_KEY]) {
      item[field] = event.value;
    }

    return item;
  });

  if (event.value)
    newData = newData.map((item: any) => {
      const result =
        item.inEdit &&
        typeof event.value === "object" &&
        !Array.isArray(event.value) &&
        event.value !== null
          ? {
              ...item,
              [field]: item[field].sub_code ?? "",
            }
          : item;

      return result;
    });

  //return newData;

  setDataResult((prev: any) => {
    return {
      data: newData,
      total: prev.total,
    };
  });
};

//[조회조건] queryStr 변수값 구하기
export const findCustomOptionQuery = (customOptionData: any, id: string) => {
  return customOptionData.menuCustomDefaultOptions.query.find(
    (item: any) => item.id === id
  ).query;
};

//[조회조건] columns 변수값 구하기
export const findCustomOptionColumns = (customOptionData: any, id: string) => {
  return customOptionData.menuCustomDefaultOptions.query.find(
    (item: any) => item.id === id
  ).bizComponentItems;
};
