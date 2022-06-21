import * as React from "react";
import {
  PanelBar,
  PanelBarItem,
  PanelBarSelectEventArguments,
} from "@progress/kendo-react-layout";
import { withRouter } from "react-router-dom";
import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  width: 100%;
`;

export const Gnv = styled.div`
  min-width: 150px;
  text-align: center;
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
  { path: "/", index: ".0" },
  { index: ".1" },
  { path: "/MA_B7000", index: ".1.0" },
  { index: ".2" },
  { path: "/SA_B2000", index: ".2.0" },
];

const PanelBarNavContainer = (props: any) => {
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

  return (
    <Wrapper>
      <Gnv>
        <AppName>GST ERP</AppName>
        <PanelBar selected={selected} expandMode={"single"} onSelect={onSelect}>
          <PanelBarItem title={"Home"} href="/" route="/" />
          <PanelBarItem title={"물류"}>
            <PanelBarItem title={"재고조회"} route="/MA_B7000" />
          </PanelBarItem>
          <PanelBarItem title={"영업"}>
            <PanelBarItem title={"수주처리"} route="/SA_B2000" />
          </PanelBarItem>
        </PanelBar>
      </Gnv>
      <Content clientWidth={clientWidth}>{props.children}</Content>
    </Wrapper>
  );
};

export default withRouter(PanelBarNavContainer);
