import { useRecoilState } from "recoil";
import { tokenState } from "../store/atoms";
import axios from "axios";
import cachios from "cachios";

const BASE_URL = process.env.REACT_APP_API_URL;

const domain: any = {
  query: { action: "get", url: "api/data/:query" },
  "platform-query": { action: "get", url: "api/data/:query" },
  procedure: { action: "post", url: "api/data/procedure" },
  login: { action: "post", url: "api/auth/login" },
  "file-upload": {
    action: "post",
    url: "api/FileUpload/file-upload",
  },
  "file-upload-multi": {
    action: "post",
    url: "api/FileUpload/file-upload-multi",
  },
  "file-download": {
    action: "get",
    url: "api/FileUpload/file-download/:filename",
  },
};

const initCache = () => {
  cachedHttp = cachios.create(axiosInstance, { stdTTL: 30, checkperiod: 120 });
};

const axiosInstance: any = axios.create({
  baseURL: "/",
  headers: { "Cache-Control": "no-cache" },
});
let cachedHttp = cachios.create(axiosInstance, {
  stdTTL: 30,
  checkperiod: 120,
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

  const processApi = <T>(name: string, params: any = null): Promise<T> => {
    return new Promise((resolve, reject) => {
      let info: any = domain[name];
      let url = null;
      let p = null;
      url = generateUrl(info.url, params);
      url = `${BASE_URL}${url}`;

      let headers = {};
      if (
        name === "file-upload" ||
        name === "file-upload-multi" ||
        name === "file-download"
      )
        headers = { "Content-Type": "multipart/form-data" };

      if (token) {
        headers = { ...{ Authorization: `Bearer ${token.token}` } };
      }
      if (info.action != "get") {
        initCache();
      }

      switch (info.action) {
        case "get":
          p = cachedHttp.get(url, {
            params: params,
            headers: headers,
          });
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
      return p
        .then((response: any) => resolve(response.data))
        .catch((err: any) => {
          const res = err.response;
          if (res && res.status == 401) {
            setToken(null as any);
            // 전체 페이지 reload
            //(window as any).location = "/"; //로그인 실패시 새로고침돼서 일단 주석 처리 해둠
          }
          reject(res.data);
        });
    });
  };

  return processApi;
};
