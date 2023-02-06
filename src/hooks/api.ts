import { useRecoilState } from "recoil";
import { menusState, tokenState } from "../store/atoms";
import axios from "axios";
import { useState } from "react";
import { UseGetIp } from "../components/CommonFunction";

let BASE_URL = process.env.REACT_APP_API_URL;
const cachios = require("cachios");
const domain: any = {
  query: { action: "post", url: "api/data/sql-query" },
  procedure: { action: "post", url: "api/data/sql-procedure" },
  "platform-query": { action: "post", url: "api/data/sql-query" },
  "platform-procedure": { action: "post", url: "api/data/sql-procedure" },
  "custom-option": { action: "get", url: "api/data/:formId/:para" },
  messages: { action: "get", url: "api/data/:formId/messages" },
  "design-info": { action: "get", url: "api/data/:formId/design-info" },
  "biz-components": { action: "get", url: "api/data/:id" },
  permissions: { action: "get", url: "api/data/:para" },
  "get-password-requirements": {
    action: "get",
    url: "api/data/password-requirements",
  },
  "set-password-requirements": {
    action: "post",
    url: "api/data/password-requirements",
  },
  menus: { action: "get", url: "api/data/:para" },
  "default-list": {
    action: "get",
    url: "api/data/:formId/custom-option/default-list",
  },
  "default-detail": {
    action: "get",
    url: "api/data/:formId/custom-option/:para",
  },
  "column-list": {
    action: "get",
    url: "api/data/:formId/custom-option/column-list",
  },
  "column-detail": {
    action: "get",
    url: "api/data/:formId/custom-option/:para",
  },
  logout: { action: "post", url: "api/auth/logout" },
  login: { action: "post", url: "api/auth/login" },
  "login-old": { action: "post", url: "api/auth/login-old" },
  "company-code": { action: "get", url: "api/auth/company-codes" },
  "file-list": { action: "get", url: "api/files/attached/:attached" },
  "file-upload": { action: "post", url: "api/files/:attached" },
  "file-download": {
    action: "get",
    url: "api/files/attached/:attached",
  },
  "file-delete": { action: "delete", url: "api/files/attached/:attached" },
};

const initCache = () => {
  cachedHttp = cachios.create(axiosInstance, { stdTTL: 30, checkperiod: 120 });
};

const axiosInstance: any = axios.create({
  baseURL: "/",
  headers: { "Cache-Control": "no-cache" },
});
let cachedHttp = cachios.create(axiosInstance, {
  checkperiod: 120,
  stdTTL: 30,
});

const generateUrl = (url: string, params: any) => {
  if (params == null) {
    return url;
  } else {
    let result = [];
    let list = url.split("/");
    for (let item of list) {
      let resultItem = item;
      if (item.startsWith(":")) {
        let key = item.substring(1);
        if (key && key.length > 0) {
          resultItem = params[key] ? params[key] : "";
          delete params[key];
        }
      }
      result.push(resultItem);
    }

    return result.join("/");
  }
};

export const useApi = () => {
  const [token, setToken] = useRecoilState(tokenState);
  const [menus, setMenus] = useRecoilState(menusState);

  const processApi = <T>(name: string, params: any = null): Promise<T> => {
    return new Promise((resolve, reject) => {
      // 로그인 시 반환된 url로 api 호출하도록 함 (22.12.02 서버에서 처리 되도록 방식 변경)
      // if (token) {
      //   BASE_URL = token.serviceUrl + "/";
      // }
      let info: any = domain[name];
      let url = null;
      let p = null;
      url = generateUrl(info.url, params);
      url = `${BASE_URL}${url}`;

      let headers = {};

      if (name === "file-upload" || name === "file-download")
        headers = {
          "Content-Type": "multipart/form-data",
          responseType: "stream",
          accept: "*/*",
        };

      if (name === "file-list")
        headers = { "Content-Type": "multipart/form-data", accept: "*/*" };

      if (name === "platform-procedure" || name === "platform-query")
        headers = { ...headers, DBAlias: "Platform" };

      if (token) {
        headers = { ...headers, Authorization: `Bearer ${token.token}` };
        headers = { ...headers, CultureName: token.langCode };
      }

      if (info.action != "get") {
        initCache();
      }
      const getHeader: any = {
        params: params,
        headers: headers,
      };

      if (name === "file-download") {
        getHeader.responseType = "blob";
      }

      switch (info.action) {
        case "get":
          p = cachedHttp.get(url, getHeader);
          break;
        case "post":
          p = axiosInstance.post(url, params, { headers: headers });
          break;
        case "delete":
          p = axiosInstance.delete(url, {
            params: params,
            headers: headers,
          });
          break;
        case "put":
          p = axiosInstance.put(url, params, { headers: headers });
          break;
        default:
          const message =
            "Please check the axios request type(get, post, put, delete)";
          console.error(message);
          throw message;
      }
      return (
        p
          //.then((response: any) => resolve(response.data))
          .then((response: any) => {
            return name === "file-download"
              ? resolve(response)
              : resolve(response.data);
          })
          .catch((err: any) => {
            const res = err.response;
            if (res && res.status == 401) {
              setToken(null as any);
              setMenus(null as any);

              // 전체 페이지 reload
              //(window as any).location = "/"; //로그인 실패시 새로고침돼서 일단 주석 처리 해둠
            }
            reject(res.data);
          })
      );
    });
  };

  return processApi;
};
