import * as React from "react";
import {
  PanelBar,
  PanelBarItem,
  PanelBarSelectEventArguments,
} from "@progress/kendo-react-layout";
import { withRouter } from "react-router-dom";
import styled from "styled-components";
import { Button } from "@progress/kendo-react-buttons";
import { useRecoilState } from "recoil";
import { apiState, tokenState } from "../store/atoms";

export const Wrapper = styled.div`
  display: flex;
  width: 100%;
`;

export const Gnv = styled.div`
  min-width: 150px;
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
  width: calc(${(props) => props.clientWidth}px - 150px);
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
  { path: "/MA_B70002", index: ".1.1" },
  { index: ".2" },
  { path: "/PR_A1100", index: ".2.0" },
  { index: ".3" },
  { path: "/SA_B2000", index: ".3.0" },
];

const PanelBarNavContainer = (props: any) => {
  const [token, setToken] = useRecoilState(tokenState);
  const [api, setApi] = useRecoilState(apiState);

  const onSelect = (event: PanelBarSelectEventArguments) => {
    console.log(event.target.props.route);
    props.history.push(event.target.props.route);
  };

  const setSelectedIndex = (pathName: any) => {
    let currentPath: any = paths.find((item) => item.path === pathName);

    return currentPath.index;
  };

  const selected = setSelectedIndex(props.location.pathname);

  const clientWidth = document.documentElement.clientWidth;

  const logout = React.useCallback(() => {
    setToken(null as any);
    setApi(null as any);
    // 전체 페이지 reload (cache 삭제)
    (window as any).location = "/Login";
  }, []);
  return (
    <Wrapper>
      <Gnv>
        <AppName>GST ERP</AppName>
        <PanelBar selected={selected} expandMode={"single"} onSelect={onSelect}>
          <PanelBarItem title={"Home"} href="/" route="/" />
          <PanelBarItem title={"물류"}>
            <PanelBarItem title={"재고조회"} route="/MA_B7000" />
            <PanelBarItem title={"재고조회2"} route="/MA_B70002" />
          </PanelBarItem>
          <PanelBarItem title={"생산"} icon={""}>
            <PanelBarItem title={"계획생산"} route="/PR_A1100" />
          </PanelBarItem>
          <PanelBarItem title={"영업"}>
            <PanelBarItem title={"수주처리"} route="/SA_B2000" />
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
      </Gnv>
      <Content clientWidth={clientWidth}>{props.children}</Content>
    </Wrapper>
  );
};

export default withRouter(PanelBarNavContainer);
