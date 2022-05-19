import * as React from "react";
import {
  PanelBar,
  PanelBarItem,
  PanelBarSelectEventArguments,
} from "@progress/kendo-react-layout";
import { withRouter } from "react-router-dom";

const paths = [
  { path: "/", index: ".0" },
  { path: "/MA_B7000", index: ".1" },
  { path: "/about", index: ".2" },
  { path: "/about/team", index: ".2.0" },
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

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
      }}
    >
      <div>
        <PanelBar selected={selected} expandMode={"single"} onSelect={onSelect}>
          <PanelBarItem title={"Home"} route="/" />
          <PanelBarItem title={"재고조회"} route="/MA_B7000" />
          <PanelBarItem title={"About"} route="/about">
            <PanelBarItem title={"Team"} route="/about/team" />
          </PanelBarItem>
        </PanelBar>
      </div>
      <div
        style={{
          paddingLeft: "10pt",
        }}
      >
        {props.children}
      </div>
    </div>
  );
};

export default withRouter(PanelBarNavContainer);
