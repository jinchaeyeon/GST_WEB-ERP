import { Button } from "@progress/kendo-react-buttons";
import {
    WindowActionsEvent,
    Window as WindowKendo,
    WindowMoveEvent,
} from "@progress/kendo-react-dialogs";
import {
    minusIcon,
    windowIcon,
    windowRestoreIcon,
} from "@progress/kendo-svg-icons";
import { ReactNode, useState } from "react";
import { IWindowPosition } from "../../../hooks/interfaces";

type TChildren = {
  children: ReactNode;
  positions: any;
  titles: any;
  modals: any;
  Close(): void;
};

const minButton = (props: any) => {
  return (
    <Button
      svgIcon={minusIcon}
      fillMode="flat"
      onClick={(e) => {
        if (props.onClick) {
          props.onClick(e);
        }
      }}
    />
  );
};

const maxButton = (props: any) => {
  return (
    <Button
      svgIcon={windowIcon}
      fillMode="flat"
      onClick={(e) => {
        if (props.onClick) {
          props.onClick(e);
        }
      }}
    />
  );
};

const maxRestoreButton = (props: any) => {
  return (
    <Button
      svgIcon={windowRestoreIcon}
      fillMode="flat"
      onClick={(e) => {
        if (props.onClick) {
          props.onClick(e);
        }
      }}
    />
  );
};

const NoneDiv = () => {
  return <div></div>;
};

const Window = ({ children, positions, titles, modals, Close }: TChildren) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  const [windowStage, setWindowStage] = useState<
    "MINIMIZED" | "full" | "DEFAULT" | undefined
  >("DEFAULT");
  const [position, setPosition] = useState<IWindowPosition>(positions);
  const handleMove = (event: WindowMoveEvent) => {
    setPosition({ ...position, left: event.left, top: event.top });
  };
  const handleResize = (event: WindowMoveEvent) => {
    setPosition({
      left: event.left,
      top: event.top,
      width: event.width,
      height: event.height,
    });
  };

  const onClose = () => {
    Close();
  };

  const handleStageChange = (e: WindowActionsEvent) => {
    if (e.state == "FULLSCREEN" && windowStage != "full") {
      setWindowStage("full");
      setPosition({
        top: 0,
        left: 0,
        width: deviceWidth,
        height: deviceHeight,
      });
      e.target.setState((prev) => ({
        ...prev,
        stage: "DEFAULT",
        top: 0,
        left: 0,
        width: deviceWidth,
        height: deviceHeight,
      }));
    } else if (e.state == "MINIMIZED") {
      setWindowStage("MINIMIZED");
      e.target.setState((prev) => ({
        ...prev,
        stage: "MINIMIZED",
      }));
    } else if (windowStage == "full") {
      setWindowStage("DEFAULT");
      setPosition(positions);
      e.target.setState((prev) => ({
        ...prev,
        stage: "DEFAULT",
        top: positions.top,
        left: positions.left,
        width: positions.width,
        height: positions.height,
      }));
    } else if (windowStage == "MINIMIZED") {
      setWindowStage("DEFAULT");
      e.target.setState((prev) => ({
        ...prev,
        stage: "DEFAULT",
      }));
    }
  };

  return (
    <WindowKendo
      stage={windowStage == "full" ? "DEFAULT" : windowStage}
      onStageChange={handleStageChange}
      title={titles}
      width={position.width}
      height={position.height}
      top={position.top}
      left={position.left}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={modals}
      doubleClickStageChange={false}
      minimizeButton={windowStage == "DEFAULT" ? minButton : NoneDiv}
      maximizeButton={windowStage == "DEFAULT" ? maxButton : maxRestoreButton}
    >
      {children}
    </WindowKendo>
  );
};

export default Window;
