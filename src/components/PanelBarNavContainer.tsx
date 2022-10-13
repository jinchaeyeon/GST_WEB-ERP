import { useCallback, useState, useEffect } from "react";
import {
  PanelBar,
  PanelBarItem,
  PanelBarSelectEventArguments,
} from "@progress/kendo-react-layout";
import { withRouter } from "react-router-dom";
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
import { clientWidth, gnvWidth } from "../components/CommonString";
import UserEffect from "./UserEffect";
import { useApi } from "../hooks/api";
import { Iparameters, Tmenu, Tpath } from "../store/types";

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
  min-width: ${gnvWidth}px;
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
  clientWidth?: number;
};
export const Content = styled.div<ContentType>`
  width: calc(${(props) => props.clientWidth}px - ${gnvWidth}px);

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
  font-size: 28px;
  font-weight: 600;
  padding: 10px 0;
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
  min-width: ${gnvWidth}px;
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
//   { path: "/SA_B2000W", index: ".3.0" },
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
  const [token, setToken] = useRecoilState(tokenState);
  const [menus, setMenus] = useRecoilState(menusState);
  const [sessionItem, setSessionItem] = useRecoilState(sessionItemState);
  const [isMenuOpend, setIsMenuOpend] = useRecoilState(isMenuOpendState);
  const companyCode = token ? token.companyCode : "";

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
            {/*
            <PanelBarItem title={"Home"} route="/"></PanelBarItem>
            <PanelBarItem title={"물류관리"}>
              <PanelBarItem title={"재고조회"} route="/MA_B7000W" />
            </PanelBarItem>
            <PanelBarItem title={"생산관리"} icon={""}>
              <PanelBarItem title={"계획생산"} route="/PR_A1100W" />
            </PanelBarItem>
            <PanelBarItem title={"영업관리"}>
              <PanelBarItem title={"수주처리"} route="/SA_B2000W" />
              <PanelBarItem title={"매출집계(업체)"} route="/SA_B3000W" />
            </PanelBarItem>
            <PanelBarItem title={"품질관리"}>
              <PanelBarItem title={"불량내역조회"} route="/QC_A0120W" />
            </PanelBarItem>
            <PanelBarItem title={"시스템"}>
              <PanelBarItem title={"로그인 현황"} route="/SY_A0120W" />
              <PanelBarItem title={"사용자 이용 현황"} route="/SY_A0110W" />
              <PanelBarItem title={"공통코드 정보"} route="/SY_A0010W" />
              <PanelBarItem title={"사용자 정보"} route="/SY_A0012W" />
              <PanelBarItem title={"사용자 권한"} route="/SY_A0013W" />
              <PanelBarItem title={"사용자 그룹"} route="/SY_A0011W" />
            </PanelBarItem>

            <PanelBarItem title={"전사관리"}>
              <PanelBarItem title={"Scheduler"} route="/CM_A1600W" />
            </PanelBarItem>
            <PanelBarItem title={"전자결재"}>
              <PanelBarItem title={"결재관리"} route="/EA_A2000W" />
            </PanelBarItem> */}
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
      <Content clientWidth={clientWidth}>
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
