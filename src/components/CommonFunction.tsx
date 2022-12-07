import { GridEvent, GridItemChangeEvent } from "@progress/kendo-react-grid";
import React, { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { useApi } from "../hooks/api";
import { sessionItemState, tokenState } from "../store/atoms";
import { COM_CODE_DEFAULT_VALUE } from "./CommonString";
import { detect } from "detect-browser";
import { bytesToBase64 } from "byte-base64";
import { TSessionItemCode } from "../store/types";

//오늘 날짜 8자리 string 반환 (ex. 20220101)
export const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = ("0" + (1 + date.getMonth())).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);

  return year + month + day;
};

//Date 타입 인수를 8자리 YYYYMMDD string로 날짜 변환하여 반환 (ex. => 20220101)
export const convertDateToStr = (date: Date) => {
  const year = date.getFullYear();
  const month = ("0" + (1 + date.getMonth())).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);

  return year + month + day;
};

//Date 타입 인수를 YYYYMMDD hh:mm string로 날짜 변환하여 반환 (ex. => 20220101 00:00)
export const convertDateToStrWithTime = (date: Date) => {
  //if (date.getFullYear || date.getMonth || date.getDate) {
  const dateTime: string =
    date.getFullYear() +
    "" +
    (date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1) +
    "" +
    (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) +
    " " +
    date.getHours() +
    ":" +
    date.getMinutes();
  return dateTime;
  // } else {
  //   return date;
  // }
};

//Date 타입 인수를 YYYY-MM-DD hh:mm:ss string로 날짜 변환하여 반환 (ex. => 2022-01-01 00:00:00)
export const convertDateToStrWithTime2 = (date: Date) => {
  //if (date.getFullYear || date.getMonth || date.getDate) {

  const dateTime: string =
    date.getFullYear() +
    "-" +
    (date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1) +
    "-" +
    (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) +
    " " +
    (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) +
    ":" +
    (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) +
    ":" +
    (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds());

  return dateTime;
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

// 밀리세컨트 인수를 hh:mm:ss string로 변환하여 반환 (ex. => 08:05:25)
export const convertMilliSecondsToTimeStr = (secs: number) => {
  let seconds = Math.floor((secs / 1000) % 60);
  let minutes = Math.floor((secs / (1000 * 60)) % 60);
  let hours = Math.floor((secs / (1000 * 60 * 60)) % 24);

  return (
    (hours < 10 ? "0" + hours : hours) +
    ":" +
    (minutes < 10 ? "0" + minutes : minutes) +
    ":" +
    (seconds < 10 ? "0" + seconds : seconds)
  );
};

export const numberWithCommas = (num: number) => {
  if (typeof num === "number") {
    //소수점 제외
    let numWithCommas = num.toString().split(".");
    return (
      numWithCommas[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
      (numWithCommas[1] ? "." + numWithCommas[1] : "")
    );
  } else {
    return num;
  }
};

//쿼리 스트링을 받아서 조회 후 결과값을 반환
export const UseCommonQuery = (queryStr: string, setListData: any) => {
  const processApi = useApi();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    let data: any;

    const bytes = require("utf8-bytes");
    const convertedQueryStr = bytesToBase64(bytes(queryStr));

    let query = {
      query: convertedQueryStr,
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

//messages API 데이터에서 ID가 매칭되는 메시지를 찾아서 반환
export const findMessage = (messagesData: any, id: string) => {
  return messagesData.find((item: any) => item.messageId === id).message;
};

//현재 경로를 받아서 메시지 조회 후 결과값을 반환
export const UseMessages = (pathname: string, setListData: any) => {
  const processApi = useApi();

  React.useEffect(() => {
    fetchMessagesData();
  }, []);

  //커스텀 옵션 조회
  const fetchMessagesData = React.useCallback(async () => {
    let data: any;
    try {
      data = await processApi<any>("messages", {
        formId: pathname.replace("/", ""),
      });
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      setListData(data);
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
  }, []);
};

//현재 경로를 받아서 커스텀 옵션 조회 후 결과값을 반환
export const UseCustomOption = (pathname: string, setListData: any) => {
  const processApi = useApi();
  const [sessionItem] = useRecoilState(sessionItemState);
  const [token] = useRecoilState(tokenState);
  useEffect(() => {
    if (token) {
      fetchCustomOptionData();
    }
  }, []);

  //커스텀 옵션 조회
  const fetchCustomOptionData = React.useCallback(async () => {
    let data: any;

    let userId = "";
    const userIdObj = sessionItem.find(
      (sessionItem) => sessionItem.code === "user_id"
    );
    if (userIdObj) {
      userId = userIdObj.value;
    }
    try {
      data = await processApi<any>("custom-option", {
        formId: pathname.replace("/", ""),
        para: "custom-option?userId=" + userId,
      });
    } catch (error) {
      data = null;
    }

    const queryOptionsData = data.menuCustomDefaultOptions.query;
    const newOptionsData = data.menuCustomDefaultOptions.new;

    if (data !== null) {
      // sessionItem 데이터 있고 지정된 value 값이 없는 경우, 세션 값 참조하여 value 업데이트
      if (newOptionsData) {
        newOptionsData.forEach((optionsItem: any) => {
          if (optionsItem.sessionItem !== "" && optionsItem.valueCode === "") {
            optionsItem.valueCode = sessionItem.find(
              (sessionItem) => sessionItem.code === optionsItem.sessionItem
            )?.value;
          }
        });
      }
      if (queryOptionsData) {
        queryOptionsData.forEach((optionsItem: any) => {
          if (optionsItem.sessionItem !== "" && optionsItem.valueCode === "") {
            optionsItem.valueCode = sessionItem.find(
              (sessionItem) => sessionItem.code === optionsItem.sessionItem
            )?.value;
          }
        });
      }

      fetchBizComponentData(data);
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
  }, []);

  //비즈니스 컴포넌트 조회
  const fetchBizComponentData = useCallback(async (customOptionData: any) => {
    let data: any;

    if (Object.keys(customOptionData.menuCustomDefaultOptions).length === 0) {
      setListData(customOptionData);
      return false;
    }

    let bizComponentIdArr = [];
    const queryOptionsData = customOptionData.menuCustomDefaultOptions.query;
    const newOptionsData = customOptionData.menuCustomDefaultOptions.new;

    if (queryOptionsData) {
      bizComponentIdArr.push(
        ...[
          Object.values(
            queryOptionsData.map((item: any) => item.bizComponentId)
          ),
        ]
      );
    }

    if (newOptionsData) {
      bizComponentIdArr.push(
        ...[
          Object.values(newOptionsData.map((item: any) => item.bizComponentId)),
        ]
      );
    }

    const bizComponentId = bizComponentIdArr.toString();

    if (bizComponentId === "") {
      console.log(
        "비즈니스 컴포넌트 ID 등록이 안 된 사용자 옵션 기본값이 존재함"
      );
      setListData(customOptionData);
      return false;
    }

    let id = {
      id: "biz-components?id=" + bizComponentId + "&data=true",
    };

    try {
      data = await processApi<any>("biz-components", id);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      //비즈니스 컴포넌트 조회 반환문 참조하여 쿼리 및 컬럼정보 추가
      data.forEach((bcItem: any) => {
        if (queryOptionsData) {
          queryOptionsData.forEach((defaultItem: any) => {
            if (bcItem.bizComponentId === defaultItem.bizComponentId) {
              defaultItem["query"] = (
                bcItem["querySelect"] +
                " " +
                bcItem["queryWhere"] +
                " " +
                bcItem["queryFooter"]
              ).replace(/\r\n/gi, " ");
              defaultItem["bizComponentItems"] = bcItem["bizComponentItems"];
              defaultItem.Rows = bcItem.data.Rows;
            }
          });
        }
        if (newOptionsData) {
          newOptionsData.forEach((defaultItem: any) => {
            if (bcItem.bizComponentId === defaultItem.bizComponentId) {
              defaultItem["query"] = (
                bcItem["querySelect"] +
                " " +
                bcItem["queryWhere"] +
                " " +
                bcItem["queryFooter"]
              ).replace(/\r\n/gi, " ");
              defaultItem["bizComponentItems"] = bcItem["bizComponentItems"];
              defaultItem.Rows = bcItem.data.Rows;
            }
          });
        }
      });

      setListData(customOptionData);
    }
  }, []);
};

//현재 경로를 받아서 디자인 정보 조회 후 결과값을 반환
export const UseDesignInfo = (pathname: string, setListData: any) => {
  const processApi = useApi();
  const [token] = useRecoilState(tokenState);

  useEffect(() => {
    if (token) {
      fetchDesignInfoData();
    }
  }, []);

  //디자인 정보 조회
  const fetchDesignInfoData = React.useCallback(async () => {
    let data: any;
    try {
      data = await processApi<any>("design-info", {
        formId: pathname.replace("/", ""),
      });
    } catch (error) {
      data = null;
    }

    if (data !== null && data.words) {
      setListData(data.words);
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
  }, []);
};

// 권한 조회 후 결과값을 반환
export const UsePermissions = (setListData: any) => {
  const processApi = useApi();
  const pathname = window.location.pathname.replace("/", "");
  const [token] = useRecoilState(tokenState);
  const userId = token ? token.userId : "";

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, []);

  //커스텀 옵션 조회
  const fetchData = useCallback(async () => {
    let para = {
      para: pathname + "/permissions?userId=" + userId,
    };

    let data: any;
    try {
      data = await processApi<any>("permissions", para);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      setListData(data);
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
  }, []);
};

//비즈니스 컴포넌트 조회
export const UseBizComponent = (bizComponentId: string, setListData: any) => {
  const processApi = useApi();
  const [token] = useRecoilState(tokenState);

  useEffect(() => {
    if (token) {
      fetchBizComponentData();
    }
  }, []);

  const fetchBizComponentData = useCallback(async () => {
    let data: any;

    let id = {
      id: "biz-components?id=" + bizComponentId + "&data=true",
    };

    try {
      data = await processApi<any>("biz-components", id);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      //setListData((prev: any) => [...prev, ...data]);
      setListData([...data]);
    }
  }, []);
};

//비즈니스 컴포넌트 객체를 인수로 받아서 쿼리문을 반환
export const getQueryFromBizComponent = (bcItem: any) => {
  return (
    bcItem["querySelect"] +
    " " +
    bcItem["queryWhere"] +
    " " +
    bcItem["queryFooter"]
  ).replace(/\r\n/gi, " ");
};

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
  return JSON.stringify(value) === JSON.stringify(COM_CODE_DEFAULT_VALUE) ||
    !value
    ? false
    : true;
};

// 선택된 콤보박스의 객체 값 (ex. {sub_code: "test", code_name:"test"} )와 비교 객체(ex. {sub_code: "", code_name: ""} ) 를 인자로 받아서 일치하는 값인지 체크
//=> 빈 값인 경우 false 반환
export const checkIsObjValid = (value: object, comparisonValue: object) => {
  return JSON.stringify(value) === JSON.stringify(comparisonValue) || !value
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

// //[조회조건] queryStr 변수값 구하기
// export const findCustomOptionQuery = (customOptionData: any, id: string) => {
//   return customOptionData.menuCustomDefaultOptions.query.find(
//     (item: any) => item.id === id
//   ).query;
// };

// //[조회조건] columns 변수값 구하기
// export const findCustomOptionColumns = (customOptionData: any, id: string) => {
//   return customOptionData.menuCustomDefaultOptions.query.find(
//     (item: any) => item.id === id
//   ).bizComponentItems;
// };

//Date 디폴트 값 반환
export const setDefaultDate = (customOptionData: any, id: string) => {
  const date = customOptionData.menuCustomDefaultOptions.query.find(
    (item: any) => item.id === id
  );

  const addYear = date ? date.addYear : 0;
  const addMonth = date ? date.addMonth : 0;
  const addDay = date ? date.addDay : 0;

  const newDate = new Date();
  newDate.setFullYear(newDate.getFullYear() + addYear);
  newDate.setMonth(newDate.getMonth() + addMonth);
  newDate.setDate(newDate.getDate() + addDay);

  return newDate;
};

// Validate the entire Form
export const arrayLengthValidator = (value: any) => {
  return value && value.length ? "" : "최소 1개 행을 입력해주세요";
};

export const requiredValidator = (value: any) => (value ? "" : "*필수입력");

export const validator = (value: string) =>
  value !== "" ? "" : "Please enter value.";

export const DDLValidator = (value: object) =>
  checkIsDDLValid(value) ? "" : "*필수선택";

export const minValidator = (value: any) => (value > 0 ? "" : "*필수입력");

export const getQueryFromCustomOptionData = (
  customOptionData: any,
  name: string
) => {
  return customOptionData.menuCustomDefaultOptions.query.find(
    (item: any) => item.id === name
  ).query;
};

export const getBciFromCustomOptionData = (
  customOptionData: any,
  name: string
) => {
  return customOptionData.menuCustomDefaultOptions.query.find(
    (item: any) => item.id === name
  ).bizComponentItems;
};

// 인수 value로부터 code 값을 반환 ()
export const getCodeFromValue = (value: any, valueField?: string) => {
  const code = !value
    ? ""
    : typeof value === "string" || typeof value === "number"
    ? value
    : value[valueField ?? "sub_code"];
  return code;
};

export const getYn = (value: string | boolean) => {
  return value === "Y" || value === true ? "Y" : "N";
};

// 선택된 행 중 첫번째 행의 데이터를 반환
export const getSelectedFirstData = (
  selectedState: {
    [id: string]: boolean | number[];
  },
  data: any[],
  DATA_ITEM_KEY: string
) => {
  const selectedRowKeyVal: number =
    Number(Object.getOwnPropertyNames(selectedState)[0]) ?? null;
  if (selectedRowKeyVal === null) return false;
  const selectedRowData = data.find(
    (item) => item[DATA_ITEM_KEY] === selectedRowKeyVal
  );
  return selectedRowData;
};

export const getUnpQuery = (custcd: string) => {
  return `
  SELECT * 
  FROM (  SELECT	'1' as gb,
                  BA025T.recdt,
                  BA025T.itemcd,
                  BA025T.itemacnt,
                  BA025T.amtunit,
                  BA025T.unp   
          FROM BA025T JOIN BA020T 
                      ON BA025T.unpitem = BA020T.unpitem
                      AND BA020T.custcd =  '${custcd}'
          UNION ALL
  
          SELECT	'2' as gb,
                  A.recdt,
                  A.itemcd,
                  A.itemacnt,
                  A.amtunit,
                  A.unp 
          FROM BA025T A
          WHERE unpitem = 'SYS01'
          AND itemcd NOT IN ( SELECT itemcd 
                              FROM ba025t JOIN ba020t 
                                          ON BA025T.unpitem = BA020T.unpitem 
                                          AND BA020T.custcd =  '${custcd}'
                              GROUP BY itemcd )
      ) as A 
      ORDER BY itemcd, recdt desc
      `;
};

// code값을 인수로 받아 sessionItem value 반환
export const UseGetValueFromSessionItem = (code: TSessionItemCode) => {
  const [sessionItem] = useRecoilState(sessionItemState);

  if (sessionItem) {
    return sessionItem.find((sessionItem) => sessionItem.code === code)!.value;
  } else {
    console.log("sessionItem 오류");
    return "";
  }
};

// ip를 세팅 (hook방식)
export const UseGetIp = (setListData: any) => {
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    let locationIp: any;
    try {
      const ipData = await fetch("https://geolocation-db.com/json/");
      locationIp = await ipData.json();
    } catch (error) {
      locationIp = "";
    }

    setListData(locationIp.IPv4);
  }, []);
};

// 클라이언트 정보를 반환 (OS,브라우저명,브라우저정보)
export const getBrowser = () => {
  const browser = detect();

  if (browser) {
    return browser.os + "/" + browser.name + "/" + browser.version;
  } else {
    console.log("브라우저 정보 조회 오류");
    return "";
  }
};
