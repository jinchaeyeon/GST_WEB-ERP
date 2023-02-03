import { useCallback, useState, useEffect } from "react";
import {
  PanelBar,
  PanelBarItem,
  PanelBarSelectEventArguments,
} from "@progress/kendo-react-layout";
import { useLocation, withRouter } from "react-router-dom";
import { Button } from "@progress/kendo-react-buttons";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  isLoading,
  isMenuOpendState,
  menusState,
  sessionItemState,
  tokenState,
} from "../store/atoms";
import UserOptionsWindow from "./Windows/CommonWindows/UserOptionsWindow";
import ChangePasswordWindow from "./Windows/CommonWindows/ChangePasswordWindow";
import { CLIENT_WIDTH } from "../components/CommonString";
import { useApi } from "../hooks/api";
import { Iparameters, TLogParaVal, TPath } from "../store/types";
import Loading from "./Loading";
import {
  AppName,
  ButtonContainer,
  Content,
  Gnv,
  Modal,
  PageWrap,
  TopTitle,
  Wrapper,
} from "../CommonStyled";
import { getBrowser, UseGetIp } from "./CommonFunction";

const PanelBarNavContainer = (props: any) => {
  const processApi = useApi();
  const location = useLocation();
  const [token, setToken] = useRecoilState(tokenState);
  const [menus, setMenus] = useRecoilState(menusState);
  const [isMenuOpend, setIsMenuOpend] = useRecoilState(isMenuOpendState);
  const companyCode = token ? token.companyCode : "";
  const userId = token ? token.userId : "";
  const loginKey = token ? token.loginKey : "";
  const [previousRoute, setPreviousRoute] = useState("");
  const [formKey, setFormKey] = useState("");
  const setSessionItem = useSetRecoilState(sessionItemState);
  const setLoading = useSetRecoilState(isLoading);

  const [ip, setIp] = useState(null);
  UseGetIp(setIp);

  let broswer = getBrowser();
  broswer = broswer.substring(broswer.lastIndexOf("/") + 1);

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

  const onSelect = (event: PanelBarSelectEventArguments) => {
    const { route, id } = event.target.props;
    props.history.push(route);

    if (route) {
      setIsMenuOpend(false);
      setUserOptionsWindowVisible(false);
      setChangePasswordWindowVisible(false);
    }

    if (id === "custom-option") {
      setUserOptionsWindowVisible(true);
    } else if (id === "change-password") {
      setChangePasswordWindowVisible(true);
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
    if (data && data.isSuccess === true) {
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
    setLoading(true);
    setToken(null as any);
    setMenus(null as any);
    setSessionItem(null as any);
    // 전체 페이지 reload (cache 삭제)
    (window as any).location = "/";
    setLoading(false);
  }, []);

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
    paths.push({
      path: "/",
      menuName: "시스템 옵션",
      index: "",
      menuId: "system-option",
      parentMenuId: "setting",
      menuCategory: "WEB",
    });
  }

  // Parent 그룹 없는 메뉴 Array
  const singleMenus = ["/Home", "/GANTT", "/WORD_EDITOR"];

  return (
    <Wrapper isMenuOpend={isMenuOpend}>
      <Modal isMenuOpend={isMenuOpend} onClick={onMenuBtnClick} />
      <Gnv isMenuOpend={isMenuOpend}>
        <AppName>GST ERP</AppName>
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
                        id={childPath.menuId}
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

        <ButtonContainer flexDirection={"column"}>
          <Button
            onClick={logout}
            icon={"logout"}
            fillMode={"flat"}
            themeColor={"secondary"}
          >
            로그아웃
          </Button>
          {/* <Button
            onClick={onClickUserOptions}
            fillMode={"flat"}
            themeColor={"secondary"}
          >
            사용자 옵션
          </Button> */}
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
        </ButtonContainer>
      </Gnv>
      <Content CLIENT_WIDTH={CLIENT_WIDTH}>
        <TopTitle>
          <div style={{ width: "30px" }}></div>
          <AppName>GST ERP</AppName>
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

      <Loading />
    </Wrapper>
  );
};

export default withRouter(PanelBarNavContainer);
