import { useRecoilState } from "recoil";
import { tokenState } from "../store/atoms";
import axios from "axios";
import cachios from "cachios";

const BASE_URL = process.env.REACT_APP_API_URL;

const domain: any = {
  query: { action: "get", url: "api/data/:query" },
  procedure: { action: "post", url: "api/data/procedure" },
  login: { action: "post", url: "/auth/token" },
  "login-social": { action: "post", url: "/auth/token/social" },

  clinic: { action: "get", url: "/clinic" },
  "clinic-all": { action: "get", url: "/clinic/all" },
  "clinic-item": { action: "get", url: "/clinic/:id" },
  "clinic-count": { action: "get", url: "/clinic/count" },

  promotion: { action: "get", url: "/promotion" },
  video: { action: "get", url: "/video" },
  "video-category": { action: "get", url: "/video/category" },
  "video-item": { action: "get", url: "/video/:id" },
  skinwiki: { action: "get", url: "/skinwiki" },
  "skinwiki-item": { action: "get", url: "/skinwiki/:id" },
  survey: { action: "post", url: "/survey" },
  "check-username": { action: "put", url: "/user/usernameExist/:username" },
  reg: { action: "post", url: "/user" },
  "reg-social": { action: "post", url: "/user/reg/social" },
  "social-url": { action: "get", url: "/social/login/:type" },

  user: { action: "get", url: "/user/me" },
  "update-user": { action: "put", url: "/user/me" },
  "update-password": { action: "put", url: "/user/me/password" },
  "update-password-by-token": { action: "put", url: "/user/password" },
  "update-user-nick": { action: "put", url: "/user/me/nick/:nick" },
  "check-nick": { action: "put", url: "/user/nickExist/:nick" },
  "delete-user": { action: "delete", url: "/user/me" },

  notice: { action: "get", url: "/notice" },
  "notice-item": { action: "get", url: "/notice/:id" },
  terms: { action: "get", url: "/term" },
  "terms-item": { action: "get", url: "/term/:id" },
  faq: { action: "get", url: "/faq" },
  "faq-item": { action: "get", url: "/faq/:id" },
  "faq-category": { action: "get", url: "/faq/category" },
  "clinic-fav": { action: "get", url: "/clinic/fav" },
  "clinic-fav-add": { action: "post", url: "/clinic/fav/:id" },
  "clinic-fav-del": { action: "delete", url: "/clinic/fav/:id" },
  "video-fav": { action: "get", url: "/video/fav" },
  "video-fav-add": { action: "post", url: "/video/fav/:id" },
  "video-fav-del": { action: "delete", url: "/video/fav/:id" },
  main: { action: "get", url: "/main" },
  "video-playcount-increase": { action: "put", url: "/video/:id/playCount" },
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
            (window as any).location = "/";
          }
          reject(res.data);
        });
    });
  };

  return processApi;
};
