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

export const UseCommonCodeQuery = (str: string) => {
  const processApi = useApi();
  let rows: [] = [];

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = React.useCallback(async () => {
    let data: any;
    let queryStr =
      "SELECT sub_code, code_name FROM comCodeMaster WHERE group_code = '" +
      str +
      "' AND system_yn = 'Y'";

    let query = {
      query: "query?query=" + queryStr,
    };

    try {
      data = await processApi<any>("query", query);

      console.log("[1]");
      console.log(data);
    } catch (error) {
      data = null;
    }

    if (data != null) {
      rows = data.result.data.Rows;

      console.log("[2]");
      console.log(rows);
    }
  }, []);

  console.log("[3]");
  console.log(rows);

  return rows;
};

type TCommonDataDDLArg = [
  {
    sub_code: any;
    code_name: any;
  }
];
type TUseCommonDataDDL = {
  queryStr: String;
  setData(arg: TCommonDataDDLArg): void;
};

export const UseCommonDataDDL: React.FC<TUseCommonDataDDL> = ({
  queryStr,
  setData,
}: TUseCommonDataDDL) => {
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
      setData(rows);
    }
  }, []);

  return <></>;
};

export const pageSize = 10;

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
