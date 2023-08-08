import { useEffect, useState } from "react";
import * as React from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridFooterCellProps,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridDataStateChangeEvent,
} from "@progress/kendo-react-grid";
import { DataResult, getter, process, State } from "@progress/kendo-data-query";
import { useApi } from "../../../hooks/api";
import {
  BottomContainer,
  ButtonContainer,
  FilterBox,
  GridContainer,
  Title,
  TitleContainer,
} from "../../../CommonStyled";
import { Input } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import {
  chkScrollHandler,
  getQueryFromBizComponent,
  UseBizComponent,
} from "../../CommonFunction";
import { IWindowPosition } from "../../../hooks/interfaces";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../../CommonString";
import BizComponentRadioGroup from "../../RadioGroups/BizComponentRadioGroup";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../../../store/atoms";
import { handleKeyPressSearch } from "../../CommonFunction";
import { bytesToBase64 } from "byte-base64";
import FilterContainer from "../../../components/Containers/FilterContainer";
import DaumPostcode from "react-daum-postcode";

type IWindow = {
  setVisible(arg: boolean): void;
  setData(zipcode: string, address: string): void;
  para: string;
  modal?: boolean;
};

const DATA_ITEM_KEY = "prsnnum";

const ZipCodeWindow = ({
  setVisible,
  setData,
  para,
  modal = false,
}: IWindow) => {
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 600,
    height: 510,
  });

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
    setVisible(false);
  };

  const handlePostCode = (data: {
    address: any;
    addressType: string;
    bname: string;
    buildingName: string;
    zonecode: any;
  }) => {
    let fullAddress = data.address;
    let extraAddress = "";

    if (data.addressType === "R") {
      if (data.bname !== "") {
        extraAddress += data.bname;
      }
      if (data.buildingName !== "") {
        extraAddress +=
          extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }
    setData(data.zonecode, fullAddress);
    onClose();
  };

  return (
    <Window
      title={"우편번호"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={modal}
    >
      <DaumPostcode onComplete={handlePostCode} />
    </Window>
  );
};

export default ZipCodeWindow;
