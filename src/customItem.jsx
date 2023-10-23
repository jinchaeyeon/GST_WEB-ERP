import { bytesToBase64 } from "byte-base64";
import { useCallback, useEffect, useState } from "react";
import {
  UseBizComponent,
  getQueryFromBizComponent,
} from "./components/CommonFunction";
import { useApi } from "./hooks/api";
import {
  SchedulerItem
} from "@progress/kendo-react-scheduler";

export const CustomItem = (props) => {
  const [colorData, setColorData] = useState([]);
  const [bizComponentData, setBizComponentData] = useState(null);
  UseBizComponent("L_APPOINTMENT_COLOR", setBizComponentData);
  const processApi = useApi();
  useEffect(() => {
    if (bizComponentData !== null) {
      const colorQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item) => item.bizComponentId === "L_APPOINTMENT_COLOR"
        )
      );

      fetchQuery(colorQueryStr, setColorData);
    }
  }, [bizComponentData]);

  const fetchQuery = useCallback(async (queryStr, setListData) => {
    let data;

    const bytes = require("utf8-bytes");
    const convertedQueryStr = bytesToBase64(bytes(queryStr));

    let query = {
      query: convertedQueryStr,
    };

    try {
      data = await processApi("query", query);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

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
