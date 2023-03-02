import { useCallback, useState, useEffect } from "react";
import {
  PanelBar,
  PanelBarItem,
  PanelBarSelectEventArguments,
} from "@progress/kendo-react-layout";
import { useLocation, withRouter } from "react-router-dom";
import { Button } from "@progress/kendo-react-buttons";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  isLoading,
  isMenuOpendState,
  menusState,
  passwordExpirationInfoState,
  sessionItemState,
  loginResultState,
} from "../store/atoms";
import UserOptionsWindow from "./Windows/CommonWindows/UserOptionsWindow";
import ChangePasswordWindow from "./Windows/CommonWindows/ChangePasswordWindow";
import SystemOptionWindow from "./Windows/CommonWindows/SystemOptionWindow";
import { CLIENT_WIDTH } from "../components/CommonString";
import { useApi } from "../hooks/api";
import { Iparameters, TLogParaVal, TPath } from "../store/types";
import Loading from "./Loading";
import {
  AppName,
  ButtonContainer,
  Content,
  Gnv,
  Logo,
  Modal,
  PageWrap,
  TopTitle,
  Wrapper,
} from "../CommonStyled";
import {
  getBrowser,
  getToday,
  resetLocalStorage,
  UseGetIp,
} from "./CommonFunction";

const PanelBarNavContainer = (props: any) => {
  const processApi = useApi();
  const location = useLocation();
  const [loginResult, setLoginResult] = useRecoilState(loginResultState);
  const accessToken = localStorage.getItem("accessToken");
  const [token, setToken] = useState(accessToken);
  const [pwExpInfo, setPwExpInfo] = useRecoilState(passwordExpirationInfoState);
  useEffect(() => {
    if (token === null) fetchMenus();
  }, [token]);
  const [menus, setMenus] = useRecoilState(menusState);
  const [isMenuOpend, setIsMenuOpend] = useRecoilState(isMenuOpendState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const userId = loginResult ? loginResult.userId : "";
  const loginKey = loginResult ? loginResult.loginKey : "";
  const role = loginResult ? loginResult.role : "";
  const isAdmin = role === "ADMIN" || role === "DEVELOPER" ? true : false;

  const [previousRoute, setPreviousRoute] = useState("");
  const [formKey, setFormKey] = useState("");
  const setSessionItem = useSetRecoilState(sessionItemState);
  const setLoading = useSetRecoilState(isLoading);

  const [ip, setIp] = useState(null);
  UseGetIp(setIp);

  let broswer = getBrowser();
  broswer = broswer.substring(broswer.lastIndexOf("/") + 1);

  // 반응형 처리
  const [clientWidth, setClientWidth] = useState(
    document.documentElement.getBoundingClientRect().width
  );
  useEffect(() => {
    const handleWindowResize = () => {
      setClientWidth(document.documentElement.getBoundingClientRect().width);
    };
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  });

  // useEffect(() => {
  //   const handleTabClose = (event: BeforeUnloadEvent) => {
  //     event.preventDefault();
  //     fetchToLog({
  //       work_type: "OPEN",
  //       form_id: previousRoute,
  //       form_name: "",
  //       form_login_key: formKey,
  //       t: "2",
  //     });

  //     //return (event.returnValue = "true");
  //   };

  //   window.addEventListener("beforeunload", handleTabClose);

  //   return () => {
  //     window.removeEventListener("beforeunload", handleTabClose);
  //   };
  // }, []);

  useEffect(() => {
    if (token && menus === null) fetchMenus();
  }, [menus]);

  useEffect(() => {
    checkPwExpInfo();
  }, []);

  const checkPwExpInfo = () => {
    if (pwExpInfo && pwExpInfo.useExpiration) {
      if (pwExpInfo.status !== "Ok") {
        setChangePasswordWindowVisible(true);
      }
      // 로그인 후 최초 한번만 팝업 뜨도록
      setPwExpInfo((prev) => ({ ...prev, useExpiration: false }));
    }
  };

  const fetchMenus = useCallback(async () => {
    try {
      let menuPara = {
        para: "menus?userId=" + userId + "&category=WEB",
      };
      const menuResponse = await processApi<any>("menus", menuPara);
      setMenus(menuResponse.usableMenu);
    } catch (e: any) {
      console.log("menus error", e);
    }
  }, []);

  let paths: Array<TPath> = [];
  if (menus !== null) {
    // Home push
    menus
      .filter((menu: any) => menu.formId === "Home")
      .forEach((menu: any, idx: number) => {
        paths.push({
          path: "/" + menu.formId,
          menuName: menu.menuName,
          index: "." + idx,
          menuId: menu.menuId,
          parentMenuId: menu.parentMenuId,
          menuCategory: menu.menuCategory,
        });
      });

    // Group push (Home, PlusWin6 Group 제외)
    menus
      .filter(
        (menu: any) =>
          menu.menuCategory === "GROUP" &&
          menu.menuName !== "Home" &&
          menu.menuName !== "PlusWin6"
      )
      .forEach((menu: any, idx: number) => {
        paths.push({
          path: "/" + menu.formId,
          menuName: menu.menuName,
          index: "." + (idx + 1),
          menuId: menu.menuId,
          parentMenuId: menu.parentMenuId,
          menuCategory: menu.menuCategory,
        });
      });

    // Group별 Menu push
    paths.forEach((path: TPath) => {
      menus
        .filter(
          (menu: any) =>
            menu.menuCategory === "WEB" && path.menuId === menu.parentMenuId
        )
        .forEach((menu: any, idx: number) => {
          paths.push({
            path: "/" + menu.formId,
            menuName: menu.menuName,
            index: path.index + "." + idx,
            menuId: menu.menuId,
            parentMenuId: menu.parentMenuId,
            menuCategory: menu.menuCategory,
          });
        });
    });
  }

  const [userOptionsWindowVisible, setUserOptionsWindowVisible] =
    useState<boolean>(false);
  const [changePasswordWindowVisible, setChangePasswordWindowVisible] =
    useState<boolean>(false);
  const [systemOptionWindowWindowVisible, setSystemOptionWindowVisible] =
    useState<boolean>(false);

  const onSelect = (event: PanelBarSelectEventArguments) => {
    const { route, className = "" } = event.target.props;
    props.history.push(route);

    if (route) {
      setIsMenuOpend(false);
      setUserOptionsWindowVisible(false);
      setChangePasswordWindowVisible(false);
      setSystemOptionWindowVisible(false);
    }

    if (className.includes("custom-option")) {
      setUserOptionsWindowVisible(true);
    } else if (className.includes("change-password")) {
      setChangePasswordWindowVisible(true);
    } else if (className.includes("system-option")) {
      setSystemOptionWindowVisible(true);
    }
  };

  useEffect(() => {
    if (token && ip !== null) {
      const pathname = location.pathname.replace("/", "");

      // 폼 로그 처리
      if (previousRoute === "") {
        const pathitem = paths.find(
          (item) => item.path.replace("/", "") === pathname
        );

        //최초 오픈
        fetchToLog({
          work_type: "OPEN",
          form_id: pathname,
          form_name: pathitem ? pathitem.menuName : "",
          form_login_key: "",
        });
      } else if (pathname !== previousRoute) {
        const pathitem = paths.find(
          (item) => item.path.replace("/", "") === pathname
        );
        const previousPathitem = paths.find(
          (item) => item.path.replace("/", "") === previousRoute
        );
        // 오픈, 클로즈
        fetchToLog({
          work_type: "CLOSE",
          form_id: previousRoute,
          form_name: previousPathitem ? previousPathitem.menuName : "",
          form_login_key: formKey,
        });
        fetchToLog({
          work_type: "OPEN",
          form_id: pathname,
          form_name: pathitem ? pathitem.menuName : "",
          form_login_key: "",
        });
      }

      // 이전 루트 저장
      setPreviousRoute(pathname);
    }
  }, [location, ip]);

  const fetchToLog = async (logParaVal: TLogParaVal) => {
    let data: any;

    const logPara: Iparameters = {
      procedureName: "sys_sav_form_access_log",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": logParaVal.work_type,
        "@p_user_id": userId,
        "@p_form_id": logParaVal.form_id,
        "@p_form_name": logParaVal.form_name,

        "@p_login_key": logParaVal.form_login_key,
        "@p_parent_login_key": loginKey,

        "@p_ip_address": ip,
        "@p_pc": broswer,
        "@p_mac_address": "",
      },
    };

    try {
      data = await processApi<any>("procedure", logPara);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      if (logParaVal.work_type === "OPEN") {
        const { form_login_key } = data.tables[0].Rows[0];
        setFormKey(form_login_key);
      }
    } else {
      console.log("[An error occured to log]");
      console.log(data);
    }
  };

  const setSelectedIndex = (pathName: any) => {
    let currentPath: any = paths.find((item: any) => item.path === pathName);

    return currentPath ? currentPath.index : 0;
  };

  const selected = setSelectedIndex(props.location.pathname);

  const logout = useCallback(() => {
    fetchLogout();
    resetLocalStorage();
    window.location.href = "/";
  }, []);

  const fetchLogout = async () => {
    let data: any;

    const para = {
      accessToken: accessToken,
    };

    try {
      data = await processApi<any>("logout", para);
    } catch (error) {
      data = null;
    }
    if (data === null) {
      console.log("[An error occured to log for logout]");
      console.log(data);
    }
  };

  const onMenuBtnClick = () => {
    setIsMenuOpend((prev) => !prev);
  };

  const onClickChatbot = () => {
    window.open("/CHAT_A0001W", "_blank");
  };

  const panelBars: TPath[] = [
    ...paths.filter((path) => path.path === "/Home"),
    ...paths.filter((path) => path.menuCategory === "GROUP"),
  ];
  if (companyCode !== "2207C612") {
    panelBars.push({
      path: "/WORD_EDITOR",
      menuName: "EDITOR",
      index: "",
      menuId: "",
      parentMenuId: "",
      menuCategory: "",
    });
    panelBars.push({
      path: "/GANTT",
      menuName: "GANTT",
      index: "",
      menuId: "",
      parentMenuId: "",
      menuCategory: "",
    });
    panelBars.push({
      path: "/",
      menuName: "설정",
      index: "",
      menuId: "setting",
      parentMenuId: "",
      menuCategory: "WEB",
    });
    paths.push({
      path: "/",
      menuName: "비밀번호 변경",
      index: "",
      menuId: "change-password",
      parentMenuId: "setting",
      menuCategory: "WEB",
    });
    paths.push({
      path: "/",
      menuName: "사용자 옵션",
      index: "",
      menuId: "custom-option",
      parentMenuId: "setting",
      menuCategory: "WEB",
    });
    if (isAdmin) {
      paths.push({
        path: "/",
        menuName: "시스템 옵션",
        index: "",
        menuId: "system-option",
        parentMenuId: "setting",
        menuCategory: "WEB",
      });
    }
  }

  // Parent 그룹 없는 메뉴 Array
  const singleMenus = ["/Home", "/GANTT", "/WORD_EDITOR"];

  return (
    <Wrapper isMenuOpend={isMenuOpend}>
      <Modal isMenuOpend={isMenuOpend} onClick={onMenuBtnClick} />
      <Gnv isMenuOpend={isMenuOpend}>
        <AppName>
          <Logo size="32px" />
          GST ERP
        </AppName>
        {paths.length > 0 && (
          <PanelBar
            selected={selected}
            expandMode={"single"}
            onSelect={onSelect}
          >
            {panelBars.map((path: TPath, idx: number) => {
              return singleMenus.includes(path.path) ? (
                <PanelBarItem
                  key={idx}
                  title={path.menuName}
                  route={path.path}
                />
              ) : (
                <PanelBarItem
                  key={idx}
                  title={path.menuName}
                  icon={path.menuId === "setting" ? "gear" : undefined}
                >
                  {paths
                    .filter(
                      (childPath: TPath) =>
                        childPath.menuCategory === "WEB" &&
                        childPath.parentMenuId === path.menuId
                    )
                    .map((childPath: TPath, childIdx: number) => (
                      <PanelBarItem
                        key={childIdx}
                        title={childPath.menuName}
                        route={
                          path.menuId === "setting" ? undefined : childPath.path
                        }
                        className={childPath.menuId}
                      />
                    ))}
                </PanelBarItem>
              );
            })}
          </PanelBar>
        )}

        {/* GST */}
        {/* {companyCode === "2207C612" && (
          <PanelBar
            selected={selected}
            expandMode={"single"}
            onSelect={onSelect}
          >
            <PanelBarItem title={"Home"} route="/Home"></PanelBarItem>

            <PanelBarItem title={"전사관리"}>
              <PanelBarItem title={"Scheduler"} route="/CM_A1600W" />
            </PanelBarItem>
            <PanelBarItem title={"전자결재"}>
              <PanelBarItem title={"결재관리"} route="/EA_A2000W" />
            </PanelBarItem>
          </PanelBar>
        )} */}

        <ButtonContainer
          flexDirection={"column"}
          style={{ marginTop: "10px", gap: "5px" }}
        >
          <Button
            onClick={onClickChatbot}
            icon={"hyperlink-open-sm"}
            fillMode={"solid"}
            shape={"rectangle"}
            themeColor={"secondary"}
            rounded={"full"}
            size="small"
          >
            Chatbot
          </Button>
          {isAdmin && (
            <Button
              onClick={() => setUserOptionsWindowVisible(true)}
              fillMode={"flat"}
              themeColor={"secondary"}
            >
              사용자 옵션
            </Button>
          )}
          <Button
            onClick={logout}
            icon={"logout"}
            fillMode={"flat"}
            themeColor={"secondary"}
          >
            로그아웃
          </Button>
        </ButtonContainer>
      </Gnv>
      <Content CLIENT_WIDTH={clientWidth}>
        <TopTitle>
          <div style={{ width: "30px" }}></div>
          <AppName>
            <Logo size="32px" />
          </AppName>
          <Button
            icon="menu"
            themeColor={"primary"}
            fillMode={"flat"}
            onClick={onMenuBtnClick}
          />
        </TopTitle>
        <PageWrap>{props.children}</PageWrap>
      </Content>
      {userOptionsWindowVisible && (
        <UserOptionsWindow setVisible={setUserOptionsWindowVisible} />
      )}
      {changePasswordWindowVisible && (
        <ChangePasswordWindow setVisible={setChangePasswordWindowVisible} />
      )}
      {systemOptionWindowWindowVisible && (
        <SystemOptionWindow setVisible={setSystemOptionWindowVisible} />
      )}

      <Loading />
    </Wrapper>
  );
};

export default withRouter(PanelBarNavContainer);
