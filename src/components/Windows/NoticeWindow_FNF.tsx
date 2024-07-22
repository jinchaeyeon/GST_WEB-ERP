import { Button } from "@progress/kendo-react-buttons";
import { Input, TextArea } from "@progress/kendo-react-inputs";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FormBox,
  FormBoxWrap,
} from "../../CommonStyled";
import { IWindowPosition } from "../../hooks/interfaces";
import { TPermissions } from "../../store/types";
import {
  UsePermissions,
  getHeight,
  getWindowDeviceHeight,
} from "../CommonFunction";
import PopUpAttachmentsWindow from "./CommonWindows/PopUpAttachmentsWindow";
import Window from "./WindowComponent/Window";

type IKendoWindow = {
  setVisible(t: boolean): void;
  data: any;
  modal?: boolean;
};

var height = 0;
var height2 = 0;
const KendoWindow = ({ setVisible, data, modal = false }: IKendoWindow) => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);
  useLayoutEffect(() => {
    height = getHeight(".k-window-titlebar"); //공통 해더
    height2 = getHeight(".BottomContainer"); //하단 버튼부분

    setMobileHeight(
      getWindowDeviceHeight(false, deviceHeight) - height - height2
    );
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height2
    );
  }, []);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height2
    );
  };

  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1200) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 800) / 2,
    width: isMobile == true ? deviceWidth : 1200,
    height: isMobile == true ? deviceHeight : 800,
  });

  const [information, setInformation] = useState({
    ATTDATNUM: "",
    DATNUM: "",
    LOADOK: 0,
    NOTDATE: "",
    ORGDIV: "",
    PRSNNUM: "",
    SCTEXT: "",
    SEQ: 0,
    TITLE: "",
    USERNM: "",
    files: data.files,
  });

  useEffect(() => {
    if (data != undefined) {
      setInformation({
        ATTDATNUM: data.ATTDATNUM,
        DATNUM: data.DATNUM,
        LOADOK: data.LOADOK,
        NOTDATE: data.NOTDATE,
        ORGDIV: data.ORGDIV,
        PRSNNUM: data.PRSNNUM,
        SCTEXT: data.SCTEXT,
        SEQ: data.SEQ,
        TITLE: data.TITLE,
        USERNM: data.USERNM,
        files: data.files,
      });
    }
  }, [data]);

  const onClose = () => {
    setVisible(false);
  };

  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };

  return (
    <>
      <Window
        titles={"공지사항"}
        positions={position}
        Close={onClose}
        modals={modal}
        onChangePostion={onChangePostion}
      >
        <FormBoxWrap
          border={true}
          style={{ height: isMobile ? mobileheight : webheight }}
        >
          <FormBox>
            <tbody>
              <tr>
                <th style={{ width: "10%" }}>제목</th>
                <td>
                  <Input name="TITLE" type="text" value={information.TITLE} />
                </td>
              </tr>
              <tr>
                <th>날짜</th>
                <td>
                  <Input
                    name="NOTDATE"
                    type="text"
                    value={information.NOTDATE}
                  />
                </td>
              </tr>
              <tr>
                <td colSpan={2}>
                  <TextArea
                    value={information.SCTEXT}
                    name="SCTEXT"
                    rows={25}
                  />
                </td>
              </tr>
              <tr>
                <th>첨부파일</th>
                <td>
                  <Input
                    name="files"
                    type="text"
                    value={information.files}
                    className="readonly"
                  />
                  <ButtonInInput>
                    <Button
                      type={"button"}
                      onClick={onAttachmentsWndClick}
                      icon="more-horizontal"
                      fillMode="flat"
                    />
                  </ButtonInInput>
                </td>
              </tr>
            </tbody>
          </FormBox>
        </FormBoxWrap>
        <BottomContainer className="BottomContainer">
          <ButtonContainer>
            <Button
              themeColor={"primary"}
              fillMode={"outline"}
              onClick={onClose}
            >
              닫기
            </Button>
          </ButtonContainer>
        </BottomContainer>
      </Window>
      {attachmentsWindowVisible && (
        <PopUpAttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          para={information.ATTDATNUM}
          permission={{
            upload: false,
            download: permissions.view,
            delete: false,
          }}
        />
      )}
    </>
  );
};

export default KendoWindow;
