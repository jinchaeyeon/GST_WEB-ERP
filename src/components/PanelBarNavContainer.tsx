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
import { tokenState } from "../store/atoms";
import UserOptionsWindow from "./Windows/CommonWindows/UserOptionsWindow";
import { clientWidth, gnvWidth } from "../components/CommonString";

export const Wrapper = styled.div`
  display: flex;
  width: 100%;
`;

export const Gnv = styled.div`
  min-width: ${gnvWidth}px;
  text-align: center;
  .logout span {
    color: #656565;
  }
  .logout > .k-link {
    justify-content: center;
  }
`;

type ContentType = {
  clientWidth?: number;
};
export const Content = styled.div<ContentType>`
  padding: 0 15px;
  width: calc(${(props) => props.clientWidth}px - ${gnvWidth}px);
`;

export const AppName = styled.h1`
  font-size: 28px;
  font-weight: 600;
  padding: 10px 0;
  border-right: 1px solid #ebebeb;
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
  { path: "/MA_B7000", index: ".1.0" },
  { index: ".2" },
  { path: "/PR_A1100", index: ".2.0" },
  { index: ".3" },
  { path: "/SA_B2000", index: ".3.0" },
  { index: ".4" },
  { path: "/QC_A0120", index: ".4.0" },
  { index: ".5" },
  { path: "/SY_A0120", index: ".5.0" },
  { path: "/SY_A0110", index: ".5.1" },
  { path: "/SY_A0010", index: ".5.2" },
  { path: "/SY_A0012", index: ".5.3" },
  { path: "/SY_A0013", index: ".5.4" },
  { path: "/SY_A0011", index: ".5.5" },
  { index: ".6" },
  { path: "/CM_A1600", index: ".6.0" },
];

const PanelBarNavContainer = (props: any) => {
  const [token, setToken] = useRecoilState(tokenState);

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
  return (
    <Wrapper>
      <Gnv>
        <AppName>GST ERP</AppName>
        <PanelBar selected={selected} expandMode={"single"} onSelect={onSelect}>
          <PanelBarItem title={"Home"} href="/" route="/" />
          <PanelBarItem title={"물류관리"}>
            <PanelBarItem title={"재고조회"} route="/MA_B7000" />
          </PanelBarItem>
          <PanelBarItem title={"생산관리"} icon={""}>
            <PanelBarItem title={"계획생산"} route="/PR_A1100" />
          </PanelBarItem>
          <PanelBarItem title={"영업관리"}>
            <PanelBarItem title={"수주처리"} route="/SA_B2000" />
          </PanelBarItem>
          <PanelBarItem title={"품질관리"}>
            <PanelBarItem title={"불량내역조회"} route="/QC_A0120" />
          </PanelBarItem>
          <PanelBarItem title={"시스템"}>
            <PanelBarItem title={"로그인 현황"} route="/SY_A0120" />
            <PanelBarItem title={"사용자 이용 현황"} route="/SY_A0110" />
            <PanelBarItem title={"공통코드 정보"} route="/SY_A0010" />
            <PanelBarItem title={"사용자 정보"} route="/SY_A0012" />
            <PanelBarItem title={"사용자 권한"} route="/SY_A0013" />
            <PanelBarItem title={"사용자 그룹"} route="/SY_A0011" />
          </PanelBarItem>

          <PanelBarItem title={"전사관리"}>
            <PanelBarItem title={"Scheduler"} route="/CM_A1600" />
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
      <Content clientWidth={clientWidth}>{props.children}</Content>
      {userOptionsWindowVisible && (
        <UserOptionsWindow getVisible={setUserOptionsWindowVisible} />
      )}
    </Wrapper>
  );
};

export default withRouter(PanelBarNavContainer);
