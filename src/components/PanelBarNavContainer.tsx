import { useCallback, useState, useEffect } from "react";
import {
  PanelBar,
  PanelBarItem,
  PanelBarSelectEventArguments,
} from "@progress/kendo-react-layout";
import { useHistory, useLocation, withRouter } from "react-router-dom";
import styled from "styled-components";
import { Button } from "@progress/kendo-react-buttons";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  isMenuOpendState,
  menusState,
  sessionItemState,
  tokenState,
  userState,
} from "../store/atoms";
import UserOptionsWindow from "./Windows/CommonWindows/UserOptionsWindow";
import { CLIENT_WIDTH, GNV_WIDTH } from "../components/CommonString";
import UserEffect from "./UserEffect";
import { useApi } from "../hooks/api";
import { Iparameters, TLogParaVal, Tmenu, Tpath } from "../store/types";

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

// const paths = [
//   {
//     path: "/",
//     index: ".0",
//     menuName: "home",
//     menuCategory: "GROUP",
//     parentMenuId: "",
//   },
//   { index: ".1" },
//   { path: "/MA_B7000W", index: ".1.0" },
//   { index: ".2" },
//   { path: "/PR_A1100W", index: ".2.0" },
//   { index: ".3" },
//   { path: "/SA_A2000W", index: ".3.0" },
//   { path: "/SA_B3000W", index: ".3.1" },
//   { index: ".4" },
//   { path: "/QC_A0120W", index: ".4.0" },
//   { index: ".5" },
//   { path: "/SY_A0120W", index: ".5.0" },
//   { path: "/SY_A0110W", index: ".5.1" },
//   { path: "/SY_A0010W", index: ".5.2" },
//   { path: "/SY_A0012W", index: ".5.3" },
//   { path: "/SY_A0013W", index: ".5.4" },
//   { path: "/SY_A0011W", index: ".5.5" },
//   { index: ".6" },
//   { path: "/CM_A1600W", index: ".6.0" },
//   { index: ".7" },
//   { path: "/EA_A2000W", index: ".7.0" },
// ];

const PanelBarNavContainer = (props: any) => {
  const processApi = useApi();
  const location = useLocation();
  const [token, setToken] = useRecoilState(tokenState);
  const [menus, setMenus] = useRecoilState(menusState);
  const [sessionItem, setSessionItem] = useRecoilState(sessionItemState);
  const [isMenuOpend, setIsMenuOpend] = useRecoilState(isMenuOpendState);
  const companyCode = token ? token.companyCode : "";
  const [previousRoute, setPreviousRoute] = useState("");
  const [formKey, setFormKey] = useState("");

  useEffect(() => {
    if (menus === null) fetchMenus();
  }, [menus]);

  useEffect(() => {
    if (sessionItem === null) fetchSessionItem();
  }, [sessionItem]);

  const fetchMenus = useCallback(async () => {
    try {
      let menuPara = {
        para: "menus?userId=" + token.userId + "&category=WEB",
      };
      const menuResponse = await processApi<any>("menus", menuPara);
      setMenus(menuResponse.usableMenu);
    } catch (e: any) {
      console.log("menus error", e);
    }
  }, []);

  const fetchSessionItem = useCallback(async () => {
    let data;
    try {
      const para: Iparameters = {
        procedureName: "sys_biz_configuration",
        pageNumber: 0,
        pageSize: 0,
        parameters: {
          "@p_user_id": token.userId,
        },
      };

      data = await processApi<any>("procedure", para);

      if (data.isSuccess === true) {
        const rows = data.tables[0].Rows;
        setSessionItem(
          rows
            .filter((item: any) => item.class === "Session")
            .map((item: any) => ({
              code: item.code,
              value: item.value,
            }))
        );
      }
    } catch (e: any) {
      console.log("menus error", e);
    }
  }, []);

  let paths: Array<Tpath> = [];
  if (menus !== null) {
    menus
      .filter(
        (menu: any) =>
          (menu.menuCategory === "GROUP" && menu.parentMenuId !== "") ||
          menu.menuName === "Home"
      )
      .forEach((menu: any, idx: number) => {
        paths.push({
          path: "/" + menu.formId,
          menuName: menu.menuName,
          index: "." + idx,
          menuId: menu.menuId,
          parentMenuId: menu.parentMenuId,
        });
      });

    paths.forEach((path: Tpath) => {
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
  }, [location]);

  const fetchToLog = async (logParaVal: TLogParaVal) => {
    let data: any;

    const logPara: Iparameters = {
      procedureName: "sys_sav_form_access_log",
      pageNumber: 1,
      pageSize: 50,
      parameters: {
        "@p_work_type": logParaVal.work_type,
        "@p_user_id": token.userId,
        "@p_form_id": logParaVal.form_id,
        "@p_form_name": logParaVal.form_name,
        "@p_form_login_key": logParaVal.form_login_key,
        "@p_browser_login_key": token.loginKey,
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
    // setToken(null as any);
    // setMenus(null as any);
    // 전체 페이지 reload (cache 삭제)
    (window as any).location = "/Login";
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
        {menus !== null && (
          <PanelBar
            selected={selected}
            expandMode={"single"}
            onSelect={onSelect}
          >
            {menus
              .filter(
                (menu: any) =>
                  (menu.menuCategory === "GROUP" && menu.parentMenuId !== "") ||
                  menu.menuName === "Home"
              )
              .map((menu: any, idx: number) => {
                return menu.menuName === "Home" ? (
                  <PanelBarItem
                    key={idx}
                    title={menu.menuName}
                    route={"/" + menu.formId}
                  />
                ) : (
                  <PanelBarItem key={idx} title={menu.menuName}>
                    {menus
                      .filter(
                        (childMenu: any) =>
                          childMenu.menuCategory === "WEB" &&
                          childMenu.parentMenuId === menu.menuId
                      )
                      .map((childMenu: any, childIdx: number) => (
                        <PanelBarItem
                          key={childIdx}
                          title={childMenu.menuName}
                          route={"/" + childMenu.formId}
                        />
                      ))}
                  </PanelBarItem>
                );
              })}

            <PanelBarItem title={"CHAT BOT"} route="/CHAT_BOT" />
          </PanelBar>
        )}

        {companyCode === "2207C612" && (
          <PanelBar
            selected={selected}
            expandMode={"single"}
            onSelect={onSelect}
          >
            <PanelBarItem title={"Home"} route="/"></PanelBarItem>

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
          <div></div>
          <AppName>GST ERP</AppName>
          <Button
            icon="menu"
            themeColor={"inverse"}
            fillMode={"flat"}
            onClick={onMenuBtnClick}
          />
        </TopTitle>
        <PageWrap>{props.children}</PageWrap>
      </Content>
      {userOptionsWindowVisible && (
        <UserOptionsWindow getVisible={setUserOptionsWindowVisible} />
      )}
    </Wrapper>
  );
};

export default withRouter(PanelBarNavContainer);
