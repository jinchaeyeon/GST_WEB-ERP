import axios from "axios";
import { useRecoilState } from "recoil";
import {
  UseGetValueFromSessionItem,
  resetLocalStorage,
} from "../components/CommonFunction";
import { linkState, loginResultState, sessionItemState } from "../store/atoms";
import { Iparameters } from "../store/types";
import { useEffect, useState } from "react";

const cachios = require("cachios");
const domain: any = {
  query: { action: "post", url: "api/data/sql-query" },
  procedure: { action: "post", url: "api/data/sql-procedure" },
  "platform-query": { action: "post", url: "api/data/sql-query" },
  "platform-procedure": { action: "post", url: "api/data/sql-procedure" },
  fav: { action: "post", url: "api/data/menus/fav/:formId" },
  "del-fav": { action: "delete", url: "api/data/menus/fav/:formId" },
  "custom-option": { action: "get", url: "api/data/:formId/:para" },
  messages: { action: "get", url: "api/data/:formId/messages" },
  "design-info": { action: "get", url: "api/data/:formId/design-info" },
  "biz-components": { action: "get", url: "api/data/:id" },
  permissions: { action: "get", url: "api/data/:para" },
  "culture-codes": { action: "get", url: "api/data/culture-codes" },
  icons: { action: "get", url: "api/data/process-layout/:para" },
  "get-password-requirements": {
    action: "get",
    url: "api/data/password-requirements",
  },
  "set-password-requirements": {
    action: "post",
    url: "api/data/password-requirements",
  },
  "change-password": { action: "post", url: "api/auth/change-password" },
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
  "popup-data": { action: "post", url: "api/data/biz-components/:para" },
  logout: { action: "post", url: "api/auth/logout" },
  login: {
    action: "post",
    url: "api/auth/login?withImage=true&withConfig=true",
  },
  "login-old": { action: "post", url: "api/auth/login-old" },
  "company-codes": { action: "get", url: "api/auth/company-codes" },
  "file-list": { action: "get", url: "api/files/attached/:attached" },
  "file-upload": { action: "post", url: "api/files/:attached" },
  "file-download": {
    action: "get",
    url: "api/files/attached/:attached",
  },
  "file-delete": { action: "delete", url: "api/files/attached/:attached" }, // 하나의 AttachmentNum에 할당된 파일을 삭제
  "attachment-delete": {
    action: "delete",
    url: "api/files/:attached",
  }, // AttachmentNum 자체를 삭제
  "html-query": { action: "get", url: "api/data/html-doc" },
  "html-save": { action: "post", url: "api/data/:folder" },
  "html-download": { action: "get", url: "api/data/html-doc/file" },
  "excel-view": { action: "post", url: "api/data/emm-printout/:para" },
  "excel-view-mail": { action: "get", url: "api/data/emm-printout/:para" },
  //메뉴얼
  "manual-list": { action: "get", url: "api/files/manual-json/:para" },
  "manual-upload": { action: "post", url: "api/files/manual/:para" },
  "manual-delete": { action: "delete", url: "api/files/manual/:para" },
  "send-email": {
    action: "post",
    url: "api/data/emm-printout/:para",
  },
  "excel-view2": {
    action: "post",
    url: "api/data/emm-printout/send-mail?id=S2023744A53",
  },
};

let isTokenRefreshing = false;
let refreshSubscribers: any[] = [];

const onTokenRefreshed = (accessToken: any) => {
  refreshSubscribers.map((callback) => callback(accessToken));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: any) => {
  refreshSubscribers.push(callback);
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

const generateGetUrl = () => {
  const [Link, setLink] = useRecoilState(linkState);

  if (Link == "") {
    axios.get(`/apiserver.json`).then((res: any) => {
      setLink(res.data[0].url);
    });
  }
};

export const useApi = () => {
  const token = localStorage.getItem("accessToken");
  const [sessionItem, setSessionItem] = useRecoilState(sessionItemState);
  const [loginResult, setLoginResult] = useRecoilState(loginResultState);
  const userId = loginResult ? loginResult.userId : "";
  const [Link, setLink] = useRecoilState(linkState);
  generateGetUrl();
  const pc = UseGetValueFromSessionItem("pc");
  const [sessionItemFetched, setSessionItemFetched] = useState(false); // 세션 아이템을 가져왔는지 여부
  const sessionItemCheck = localStorage.getItem("sessionItem");
  const isSessionValid = !!sessionItemCheck;
  
  const fetchSessionItem = async () => {
    let data;
    try {
      const para: Iparameters = {
        procedureName: "sys_biz_configuration",
        pageNumber: 0,
        pageSize: 0,
        parameters: {
          "@p_user_id": userId,
        },
      };

      data = await processApi<any>("procedure", para);

      if (data.isSuccess == true) {
        const rows = data.tables[0].Rows;
        let array = rows
          .filter((item: any) => item.class == "Session")
          .map((item: any) => ({
            code: item.code,
            value: item.value,
          }))
          .concat([{ code: "pc", value: pc }]);
        setSessionItem(array);
        setSessionItemFetched(true); // 세션 아이템을 가져왔음을 표시
      }
    } catch (e: any) {
      console.log("menus error", e);
    }
  }

  useEffect(() => {
    const checkSessionAndFetchItem = async () => {
      if (window.location.pathname !== "/") {
        if (!isSessionValid && !sessionItemFetched) {
          if (token && loginResult) {
            setSessionItemFetched(true); // 세션 아이템을 가져온다고 표시
            await fetchSessionItem(); // 세션 아이템 가져오는 함수 호출
            // 상태가 변경될 때 무한 새로고침을 방지하기 위해 조건 추가
            if (!isSessionValid) {
              window.location.reload(); // 페이지 새로고침
            }
          } else {
            resetLocalStorage(); // 토큰, 로그인결과가 없을시
            window.location.href = "/"; // 리다이렉션 처리
          }
        }
      }
    };
  
    checkSessionAndFetchItem();
  }, [isSessionValid, sessionItemFetched, token, loginResult]);

  const processApi = async <T>(name: string, params: any = null): Promise<T> => {    
    if (window.location.pathname !== "/") {
      if (!token || !loginResult) {
        resetLocalStorage(); // 토큰, 로그인결과가 없을시
        window.location.href = "/"; // 리다이렉션 처리
      }
    }
    
    return new Promise((resolve, reject) => {
      let info: any = domain[name];
      let url: string | string[] | null = null;
      let p = null;
      url = generateUrl(info.url, params);

      if (Link == undefined || Link == "" || Link == null) {
        axios.get(`/apiserver.json`).then((res: any) => {
          setLink(res.data[0].url);
          url = `${res.data[0].url}${url}`;

          let headers: any = {};

          if (
            name == "file-upload" ||
            name == "file-download" ||
            name == "excel-view2" ||
            name == "send-email"
          )
            headers = {
              "Content-Type": "multipart/form-data",
              responseType: "stream",
              accept: "*/*",
            };

          if (name == "manual-list" || name == "excel-view")
            headers = {
              ...headers,
              responseType: "application/pdf",
            };

          if (name == "file-list" || name == "manual-upload")
            headers = { "Content-Type": "multipart/form-data", accept: "*/*" };

          if (name == "platform-procedure" || name == "platform-query")
            headers = { ...headers, DBAlias: "Platform" };

          if (loginResult) {
            headers = { ...headers, CultureName: loginResult.langCode };
          }

          if (
            token &&
            !headers.hasOwnProperty("Authorization") &&
            !info.url.includes("auth/login")
          ) {
            headers = { ...headers, Authorization: `Bearer ${token}` };
          }

          if (info.action != "get") {
            initCache();
          }
          const getHeader: any = {
            params: params,
            headers: headers,
          };

          if (name == "file-download") {
            getHeader.responseType = "blob";
            // 캐싱 방지용 타임스탬프
            url +=
              (url.includes("?") ? "&" : "?") +
              "timestamp=" +
              new Date().getTime();
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
          return p
            .then((response: any) => {
              return name == "file-download"
                ? resolve(response)
                : resolve(response.data);
            })
            .catch((err: any) => {
              const res = err.response;
              if (info.url.includes("auth/login")) {
                reject(
                  new Error(
                    "일치하는 로그인 정보를 찾을 수 없습니다.\r\n올바른 회사코드, 아이디, 비밀번호를 입력해주세요."
                  )
                );
              } else {
                axiosInstance.interceptors.response.use(
                  (response: any) => {
                    return response;
                  },
                  async (error: {
                    config: any;
                    request: { responseURL: string };
                    response: { status: any };
                    message: string;
                  }) => {
                    let errResponseStatus = null;
                    let errResponseURL = "";
                    const originalRequest = error.config;

                    try {
                      errResponseStatus = error.response.status;
                      errResponseURL = error.request.responseURL;
                    } catch (e) {}

                    // 로그인 페이지에서는 토큰 만료 로직을 실행하지 않음
                    if (errResponseURL.includes("auth/login")) {
                      return reject(error);
                    }

                    if (
                      errResponseStatus == 401 &&
                      !errResponseURL.includes("auth/login")
                    ) {
                      if (!isTokenRefreshing) {
                        let token = localStorage.getItem("accessToken");
                        let refreshToken = localStorage.getItem("refreshToken");
                        // const [token, setAccessToken] = useRecoilState(accessTokenState);
                        // let refreshToken = cookie.load("refreshToken");

                        isTokenRefreshing = true;

                        const url = `${res.data[0].url}api/auth/refresh`;
                        let p;

                        // refresh token을 이용하여 access token 재발행 받기
                        p = axios.post(url, {
                          accessToken: token,
                          // accessToken: token ?? refreshToken,
                          refreshToken: refreshToken,
                        });

                        p.then((res: any) => {
                          const { token, refreshToken } = res.data;

                          localStorage.setItem("accessToken", token);
                          localStorage.setItem("refreshToken", refreshToken);
                          // AccessToken : Recoil 저장 / RefreshToken(만료기한 짧음) : Cash 저장
                          /*setAccessToken(token);
                        const expires = new Date();
                        expires.setMinutes(expires.getMinutes() + 60);
                        cookie.save("refreshToken", refreshToken, {
                          path: "/",
                          expires,
                          // secure: true,
                          // httpOnly: true,
                        });*/

                          isTokenRefreshing = false;
                          originalRequest.headers.Authorization = `Bearer ${token}`;

                          // 새로운 토큰으로 재요청 진행
                          onTokenRefreshed(token);
                        }).catch((err: any) => {
                          // access token을 받아오지 못하는 오류 발생시 logout 처리
                          resetLocalStorage();
                          window.location.href = "/";

                          return false;
                        });
                      }

                      // token이 재발급 되는 동안의 요청은 refreshSubscribers에 저장
                      const retryOriginalRequest = new Promise((resolve) => {
                        addRefreshSubscriber((accessToken: any) => {
                          originalRequest.headers.Authorization =
                            "Bearer " + accessToken;
                          // axios(originalRequest);
                          resolve(axios(originalRequest));
                        });
                      });
                      return retryOriginalRequest;
                    }
                    // 오류 발생 시 오류 내용 출력 후 요청 거절
                    return reject(error);
                  }
                );
              }
            });
        });
      } else {
        url = `${Link}${url}`;

        let headers: any = {};

        if (
          name == "file-upload" ||
          name == "file-download" ||
          name == "excel-view2" ||
          name == "send-email"
        )
          headers = {
            "Content-Type": "multipart/form-data",
            responseType: "stream",
            accept: "*/*",
          };

        if (name == "manual-list" || name == "excel-view")
          headers = {
            ...headers,
            responseType: "application/pdf",
          };

        if (name == "file-list" || name == "manual-upload")
          headers = { "Content-Type": "multipart/form-data", accept: "*/*" };

        if (name == "platform-procedure" || name == "platform-query")
          headers = { ...headers, DBAlias: "Platform" };

        if (loginResult) {
          headers = { ...headers, CultureName: loginResult.langCode };
        }

        if (
          token &&
          !headers.hasOwnProperty("Authorization") &&
          !info.url.includes("auth/login")
        ) {
          headers = { ...headers, Authorization: `Bearer ${token}` };
        }

        if (info.action != "get") {
          initCache();
        }
        const getHeader: any = {
          params: params,
          headers: headers,
        };

        if (name == "file-download") {
          getHeader.responseType = "blob";
          // 캐싱 방지용 타임스탬프
          url +=
            (url.includes("?") ? "&" : "?") +
            "timestamp=" +
            new Date().getTime();
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
        return p
          .then((response: any) => {
            return name == "file-download"
              ? resolve(response)
              : resolve(response.data);
          })
          .catch((err: any) => {
            const res = err.response;
            if (info.url.includes("auth/login")) {
              reject(
                new Error(
                  "일치하는 로그인 정보를 찾을 수 없습니다.\r\n올바른 회사코드, 아이디, 비밀번호를 입력해주세요."
                )
              );
            } else {
              axiosInstance.interceptors.response.use(
                (response: any) => {
                  return response;
                },
                async (error: {
                  config: any;
                  request: { responseURL: string };
                  response: { status: any };
                  message: string;
                }) => {
                  let errResponseStatus = null;
                  let errResponseURL = "";
                  const originalRequest = error.config;

                  try {
                    errResponseStatus = error.response.status;
                    errResponseURL = error.request.responseURL;
                  } catch (e) {}

                  // 로그인 페이지에서는 토큰 만료 로직을 실행하지 않음
                  if (errResponseURL.includes("auth/login")) {
                    return reject(error);
                  }

                  if (
                    errResponseStatus == 401 &&
                    !errResponseURL.includes("auth/login")
                  ) {
                    if (!isTokenRefreshing) {
                      let token = localStorage.getItem("accessToken");
                      let refreshToken = localStorage.getItem("refreshToken");
                      // const [token, setAccessToken] = useRecoilState(accessTokenState);
                      // let refreshToken = cookie.load("refreshToken");

                      isTokenRefreshing = true;

                      const url = `${Link}api/auth/refresh`;
                      let p;

                      // refresh token을 이용하여 access token 재발행 받기
                      p = axios.post(url, {
                        accessToken: token,
                        // accessToken: token ?? refreshToken,
                        refreshToken: refreshToken,
                      });

                      p.then((res: any) => {
                        const { token, refreshToken } = res.data;

                        localStorage.setItem("accessToken", token);
                        localStorage.setItem("refreshToken", refreshToken);
                        // AccessToken : Recoil 저장 / RefreshToken(만료기한 짧음) : Cash 저장
                        /*setAccessToken(token);
                        const expires = new Date();
                        expires.setMinutes(expires.getMinutes() + 60);
                        cookie.save("refreshToken", refreshToken, {
                          path: "/",
                          expires,
                          // secure: true,
                          // httpOnly: true,
                        });*/

                        isTokenRefreshing = false;
                        originalRequest.headers.Authorization = `Bearer ${token}`;

                        // 새로운 토큰으로 재요청 진행
                        onTokenRefreshed(token);
                      }).catch((err: any) => {
                        // access token을 받아오지 못하는 오류 발생시 logout 처리
                        resetLocalStorage();
                        window.location.href = "/";

                        return false;
                      });
                    }

                    // token이 재발급 되는 동안의 요청은 refreshSubscribers에 저장
                    const retryOriginalRequest = new Promise((resolve) => {
                      addRefreshSubscriber((accessToken: any) => {
                        originalRequest.headers.Authorization =
                          "Bearer " + accessToken;
                        // axios(originalRequest);
                        resolve(axios(originalRequest));
                      });
                    });
                    return retryOriginalRequest;
                  }
                  // 오류 발생 시 오류 내용 출력 후 요청 거절
                  return reject(error);
                }
              );
            }
          });
      }
    });
  };

  return processApi;
};
