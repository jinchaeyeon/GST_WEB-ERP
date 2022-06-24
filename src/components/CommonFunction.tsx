import { FieldRenderProps } from "@progress/kendo-react-form";
import { GridEvent } from "@progress/kendo-react-grid";
import * as React from "react";
import { useApi } from "../hooks/api";

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

//쿼리 스트링을 받아서 조회 후 결과값을 반환
export const UseCommonQuery = (queryStr: string, setListData: any) => {
  const processApi = useApi();

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = React.useCallback(async () => {
    let data: any;

    let query = {
      query: "query?query=" + queryStr,
    };

    try {
      data = await processApi<any>("query", query);
    } catch (error) {
      data = null;
    }

    if (data != null) {
      const rows = data.result.data.Rows;
      setListData(rows);
    }
  }, []);
};

//한번에 조회할 데이터 수 디폴트 값
export const pageSize = 10;

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
      //setMainPgNum((prev) => prev + 1);
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
    "SELECT * FROM ba030t WHERE itemcd LIKE '" +
    para.itemcd +
    "%' AND itemnm LIKE '" +
    para.itemnm +
    "%'"
  );
};
