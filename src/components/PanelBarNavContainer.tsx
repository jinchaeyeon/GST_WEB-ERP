import { useCallback, useState, useEffect } from "react";
import {
  PanelBar,
  PanelBarItem,
  PanelBarSelectEventArguments,
} from "@progress/kendo-react-layout";
import { useLocation, withRouter } from "react-router-dom";
import styled from "styled-components";
import { Button } from "@progress/kendo-react-buttons";
import { useRecoilState } from "recoil";
import {
  isMenuOpendState,
  menusState,
  sessionItemState,
  tokenState,
} from "../store/atoms";
import UserOptionsWindow from "./Windows/CommonWindows/UserOptionsWindow";
import { CLIENT_WIDTH, GNV_WIDTH } from "../components/CommonString";
import { useApi } from "../hooks/api";
import { Iparameters, TLogParaVal, TPath } from "../store/types";
import { UseGetValueFromSessionItem } from "./CommonFunction";
import Loading from "./Loading";
import path from "path";

type TWrapper = {
  isMenuOpend: boolean;
};

export const Wrapper = styled.div<TWrapper>`
  display: flex;
  width: 100%;
  //overflow: ${(props) => (props.isMenuOpend ? "hidden" : "auto")};
`;

type TGnv = TWrapper;
export const Gnv = styled.div<TGnv>`
  min-width: ${GNV_WIDTH}px;
  text-align: center;

  min-height: 100vh;
  background-color: #fff;

  .logout span {
    color: #656565;
  }
  .logout > .k-link {
    justify-content: center;
  }

  /*=========================================================================
	미디어 쿼리
	##Device = 모바일
	##Screen = 768px 이하 해상도 모바일
  =========================================================================*/
  @media (max-width: 768px) {
    display: ${(props) => (props.isMenuOpend ? "block" : "none")};
    z-index: 10;
    position: absolute;

    h1 {
      display: none;
    }
  }
`;

type ContentType = {
  CLIENT_WIDTH?: number;
};
export const Content = styled.div<ContentType>`
  width: calc(${(props) => props.CLIENT_WIDTH}px - ${GNV_WIDTH}px);

  /*=========================================================================
  미디어 쿼리
  ##Device = 모바일
  ##Screen = 768px 이하 해상도 모바일
  =========================================================================*/
  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const PageWrap = styled.div`
  padding: 0 15px;
`;

export const AppName = styled.h1`
  font-size: 26px;
  color: #ff6358;
  font-weight: 400;
  /* padding: 10px 0; */
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-right: 1px solid #ebebeb;

  /*=========================================================================
  미디어 쿼리
  ##Device = 모바일
  ##Screen = 768px 이하 해상도 모바일
  =========================================================================*/
  @media (max-width: 768px) {
    border: none;
  }
`;

export const TopTitle = styled.div`
  min-width: ${GNV_WIDTH}px;
  /* text-align: center; */
  padding: 0 15px;
  display: none;
  justify-content: space-between;
  align-items: center;

  button {
    height: 30px;
  }

  /*=========================================================================
  미디어 쿼리
  ##Device = 모바일
  ##Screen = 768px 이하 해상도 모바일
  =========================================================================*/
  @media (max-width: 768px) {
    display: flex;
  }
`;

type TModal = TGnv;
export const Modal = styled.div<TModal>`
  position: absolute;
  z-index: 10;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: ${(props) => (props.isMenuOpend ? "block" : "none")};
  background-color: rgba(0, 0, 0, 0.4);
`;

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
  const [sessionItem, setSessionItem] = useRecoilState(sessionItemState);

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

  const onSelect = (event: PanelBarSelectEventArguments) => {
    const route = event.target.props.route;
    props.history.push(route);

    if (route) {
      setIsMenuOpend(false);
    }
  };

  useEffect(() => {
    if (token) {
      const pathname = location.pathname.replace("/", "");

      // 폼 로그 처리
      if (previousRoute === "") {
        //최초 오픈
        fetchToLog({
          work_type: "OPEN",
          form_id: pathname,
          form_name: "",
          form_login_key: "",
        });
      } else if (pathname !== previousRoute) {
        // 오픈, 클로즈
        fetchToLog({
          work_type: "CLOSE",
          form_id: previousRoute,
          form_name: "",
          form_login_key: formKey,
        });
        fetchToLog({
          work_type: "OPEN",
          form_id: pathname,
          form_name: "",
          form_login_key: "",
        });
      }

      // 이전 루트 저장
      setPreviousRoute(pathname);
    }
  }, [location]);

  const fetchToLog = async (logParaVal: TLogParaVal) => {
    let data: any;

    const logPara: Iparameters = {
      procedureName: "sys_sav_form_access_log",
      pageNumber: 1,
      pageSize: 50,
      parameters: {
        "@p_work_type": logParaVal.work_type,
        "@p_user_id": userId,
        "@p_form_id": logParaVal.form_id,
        "@p_form_name": logParaVal.form_name,
        "@p_form_login_key": logParaVal.form_login_key,
        "@p_browser_login_key": loginKey,
        "@p_ip": "", //ip 추가 필요
        "@p_client_pc": "", //브라우저 정보 추가 필요
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
    setToken(null as any);
    setMenus(null as any);
    setSessionItem(null as any);
    // 전체 페이지 reload (cache 삭제)
    (window as any).location = "/";
  }, []);

  const onClickUserOptions = () => {
    setUserOptionsWindowVisible(true);
  };

  const onMenuBtnClick = () => {
    setIsMenuOpend((prev) => !prev);
  };

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
            {paths
              .filter((path: TPath) => path.path === "/Home")
              .map((path: TPath, idx: number) => {
                return (
                  <PanelBarItem
                    key={idx}
                    title={path.menuName}
                    route={path.path}
                  />
                );
              })}

            {paths
              .filter((path: TPath) => path.menuCategory === "GROUP")
              .map((path: TPath, idx: number) => {
                return (
                  <PanelBarItem key={idx} title={path.menuName}>
                    {paths
                      .filter(
                        (childPath: TPath) =>
                          childPath.menuCategory === "WEB" &&
                          childPath.parentMenuId === path.menuId
                      )
                      .map((childPath: any, childIdx: number) => (
                        <PanelBarItem
                          key={childIdx}
                          title={childPath.menuName}
                          route={childPath.path}
                        />
                      ))}
                  </PanelBarItem>
                );
              })}
            {companyCode !== "2207C612" && (
              <PanelBarItem title={"CHAT BOT"} route="/CHAT_BOT" />
            )}
            {companyCode !== "2207C612" && (
              <PanelBarItem title={"CHAT BOT 관리"} route="/CHAT_BOT_MNG" />
            )}
          </PanelBar>
        )}

        {/* GST */}
        {companyCode === "2207C612" && (
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
        )}

        <Button
          onClick={logout}
          icon={"logout"}
          fillMode={"flat"}
          themeColor={"secondary"}
        >
          로그아웃
        </Button>
        <Button
          onClick={onClickUserOptions}
          fillMode={"flat"}
          themeColor={"secondary"}
        >
          사용자 옵션
        </Button>
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
        <UserOptionsWindow getVisible={setUserOptionsWindowVisible} />
      )}

      <Loading />
    </Wrapper>
  );
};

export default withRouter(PanelBarNavContainer);
