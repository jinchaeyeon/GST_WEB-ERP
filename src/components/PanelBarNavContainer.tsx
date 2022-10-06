import { useCallback, useState } from "react";
import {
  PanelBar,
  PanelBarItem,
  PanelBarSelectEventArguments,
} from "@progress/kendo-react-layout";
import { withRouter } from "react-router-dom";
import styled from "styled-components";
import { Button } from "@progress/kendo-react-buttons";
import { useRecoilState } from "recoil";
import { isMenuOpendState, tokenState } from "../store/atoms";
import UserOptionsWindow from "./Windows/CommonWindows/UserOptionsWindow";
import { clientWidth, gnvWidth } from "../components/CommonString";
import UserEffect from "./UserEffect";

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

const paths = [
  {
    path: "/",
    index: ".0",
    menuName: "home",
    menuCategory: "GROUP",
    parentMenuId: "",
  },
  { index: ".1" },
  { path: "/MA_B7000W", index: ".1.0" },
  { index: ".2" },
  { path: "/PR_A1100W", index: ".2.0" },
  { index: ".3" },
  { path: "/SA_B2000W", index: ".3.0" },
  { path: "/SA_B3000W", index: ".3.1" },
  { index: ".4" },
  { path: "/QC_A0120W", index: ".4.0" },
  { index: ".5" },
  { path: "/SY_A0120W", index: ".5.0" },
  { path: "/SY_A0110W", index: ".5.1" },
  { path: "/SY_A0010W", index: ".5.2" },
  { path: "/SY_A0012W", index: ".5.3" },
  { path: "/SY_A0013W", index: ".5.4" },
  { path: "/SY_A0011W", index: ".5.5" },
  { index: ".6" },
  { path: "/CM_A1600W", index: ".6.0" },
  { index: ".7" },
  { path: "/EA_A2000W", index: ".7.0" },
];

const PanelBarNavContainer = (props: any) => {
  const [token, setToken] = useRecoilState(tokenState);
  const [isMenuOpend, setIsMenuOpend] = useRecoilState(isMenuOpendState); //상태

  UserEffect(() => {
    alert(isMenuOpend);
  }, [isMenuOpend]);

  const [userOptionsWindowVisible, setUserOptionsWindowVisible] =
    useState<boolean>(false);

  const onSelect = (event: PanelBarSelectEventArguments) => {
    console.log(event.target.props.route);
    props.history.push(event.target.props.route);
  };

  const setSelectedIndex = (pathName: any) => {
    let currentPath: any = paths.find((item) => item.path === pathName);

    return currentPath.index;
  };

  const selected = setSelectedIndex(props.location.pathname);

  const logout = useCallback(() => {
    setToken(null as any);
    // 전체 페이지 reload (cache 삭제)
    (window as any).location = "/Login";
  }, []);

  const onClickUserOptions = () => {
    setUserOptionsWindowVisible(true);
  };

  const onMenuBtnClick = () => {
    setIsMenuOpend((prev: boolean) => !prev);
  };
  return (
    <Wrapper isMenuOpend={isMenuOpend}>
      <Modal isMenuOpend={isMenuOpend} onClick={onMenuBtnClick} />
      <Gnv isMenuOpend={isMenuOpend}>
        <AppName>GST ERP</AppName>
        <PanelBar selected={selected} expandMode={"single"} onSelect={onSelect}>
          <PanelBarItem title={"Home"} href="/" route="/" />
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
          </PanelBarItem>
        </PanelBar>
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
