import { useLayoutEffect, useState } from "react";
import DaumPostcode from "react-daum-postcode";
import { IWindowPosition } from "../../../hooks/interfaces";
import { getHeight, getWindowDeviceHeight } from "../../CommonFunction";
import Window from "../WindowComponent/Window";

type IWindow = {
  setVisible(arg: boolean): void;
  setData(zipcode: string, address: string): void;
  para: string;
  modal?: boolean;
};

const DATA_ITEM_KEY = "prsnnum";
var height = 0;
const ZipCodeWindow = ({
  setVisible,
  setData,
  para,
  modal = false,
}: IWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 600) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 530) / 2,
    width: isMobile == true ? deviceWidth : 600,
    height: isMobile == true ? deviceHeight : 530,
  });
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  useLayoutEffect(() => {
    height = getHeight(".k-window-titlebar"); //공통 해더

    setMobileHeight(getWindowDeviceHeight(false, deviceHeight) - height);
    setWebHeight(getWindowDeviceHeight(false, position.height) - height);
  }, []);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(getWindowDeviceHeight(false, position.height) - height);
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

    if (data.addressType == "R") {
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
      titles={"우편번호"}
      positions={position}
      Close={onClose}
      modals={modal}
      onChangePostion={onChangePostion}
    >
      <DaumPostcode
        onComplete={handlePostCode}
        style={{ height: isMobile ? mobileheight : webheight }}
      />
    </Window>
  );
};

export default ZipCodeWindow;
