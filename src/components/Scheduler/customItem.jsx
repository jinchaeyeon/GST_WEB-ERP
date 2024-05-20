import { SchedulerItem } from "@progress/kendo-react-scheduler";
import { useEffect, useState } from "react";
import { useApi } from "../../hooks/api";
import { UseBizComponent, getBizCom } from "../CommonFunction";

export const CustomItem = (props) => {
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

  return (
    <SchedulerItem
      {...props}
      style={{
        ...props.style,
        backgroundColor: colorCode,
      }}
    />
  );
};
