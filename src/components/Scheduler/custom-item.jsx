import { Keys } from "@progress/kendo-react-common";
import {
  DRAG_ITEM_ACTION,
  ITEMS_SELECT_ACTION,
  RESIZE_ITEM_ACTION,
  SchedulerEditItem,
} from "@progress/kendo-react-scheduler";
import { useEffect, useState } from "react";
import { useApi } from "../../hooks/api";
import { UseBizComponent, getBizCom } from "../CommonFunction";

export const CustomEditItem = (props) => {
  const [colorData, setColorData] = useState([]);
  const [bizComponentData, setBizComponentData] = useState(null);
  UseBizComponent("L_APPOINTMENT_COLOR", setBizComponentData);
  const processApi = useApi();
  useEffect(() => {
    if (bizComponentData !== null) {
      setColorData(getBizCom(bizComponentData, "L_APPOINTMENT_COLOR"));
    }
  }, [bizComponentData]);

  let colorCode = "";
  if (props.dataItem.colorID != undefined) {
    if (
      typeof props.dataItem.colorID == "number" ||
      typeof props.dataItem.colorID == "string"
    ) {
      colorCode =
        colorData.find((item) => item.sub_code == props.dataItem.colorID) ==
        undefined
          ? ""
          : colorData.find((item) => item.sub_code == props.dataItem.colorID)
              .color;
    } else {
      colorCode =
        colorData.find(
          (item) => item.sub_code == props.dataItem.colorID.sub_code
        ) == undefined
          ? ""
          : colorData.find(
              (item) => item.sub_code == props.dataItem.colorID.sub_code
            ).color;
    }
  }

  const handleClickAction = (event) => {
    return [
      {
        type: event.syntheticEvent.ctrlKey
          ? ITEMS_SELECT_ACTION.add
          : ITEMS_SELECT_ACTION.select,
      },
    ];
  };

  const handleDragAction = (event) => ({
    type: event.dragEvent.originalEvent.ctrlKey
      ? DRAG_ITEM_ACTION.dragSelected
      : DRAG_ITEM_ACTION.drag,
    payload: { x: event.dragEvent.clientX, y: event.dragEvent.clientY },
  });

  const handleResizeStartDragACtion = (event) => ({
    type: event.dragEvent.originalEvent.ctrlKey
      ? RESIZE_ITEM_ACTION.startDragSelected
      : RESIZE_ITEM_ACTION.startDrag,
    payload: { x: event.dragEvent.clientX, y: event.dragEvent.clientY },
  });

  const handleResizeEndDragAction = (event) => ({
    type: event.dragEvent.originalEvent.ctrlKey
      ? RESIZE_ITEM_ACTION.endDragSelected
      : RESIZE_ITEM_ACTION.endDrag,
    payload: { x: event.dragEvent.clientX, y: event.dragEvent.clientY },
  });

  const handleKeyDownAction = (...args) => {
    const [event] = args;
    switch (event.syntheticEvent.keyCode) {
      case Keys.shift:
        return SchedulerEditItem.defaultProps.onKeyDownAction(...args);
      default:
        return SchedulerEditItem.defaultProps.onKeyDownAction(...args);
    }
  };

  return (
    <SchedulerEditItem
      {...props}
      style={{
        ...props.style,
        backgroundColor: colorCode,
      }}
      onClickAction={handleClickAction}
      onDragAction={handleDragAction}
      onKeyDownAction={handleKeyDownAction}
      onResizeStartDragAction={handleResizeStartDragACtion}
      onResizeEndDragAction={handleResizeEndDragAction}
    />
  );
};
