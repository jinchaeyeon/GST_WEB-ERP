import { Button } from "@progress/kendo-react-buttons";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Field,
  Form,
  FormElement,
  FormRenderProps,
} from "@progress/kendo-react-form";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  FieldWrap,
} from "../../../CommonStyled";
import { useApi } from "../../../hooks/api";
import { IWindowPosition } from "../../../hooks/interfaces";
import { passwordExpirationInfoState } from "../../../store/atoms";
import { TPasswordRequirements } from "../../../store/types";
import { getHeight, validator } from "../../CommonFunction";
import { FormInput } from "../../Editors";

type TKendoWindow = {
  setVisible(t: boolean): void;
};

const KendoWindow = ({ setVisible }: TKendoWindow) => {
  const [pwExpInfo, setPwExpInfo] = useRecoilState(passwordExpirationInfoState);
  const [pwReq, setPwReq] = useState<TPasswordRequirements | null>(null);

  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  var height = getHeight(".k-window-titlebar"); //공통 해더
  var height3 = getHeight(".BottomContainer"); //하단 버튼부분
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 500,
    height: isMobile == true ? deviceHeight : 320,
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
    if (
      pwExpInfo &&
      ((pwExpInfo.useExpiration && pwExpInfo.status == "Expired") ||
        pwExpInfo.status == "Initial")
    ) {
      alert("비밀번호를 수정 후 저장해주세요.");
      return false;
    }

    // 만료 알림 상태의 경우, 로그인 후 최초 한번만 팝업 뜨도록
    if (pwExpInfo && pwExpInfo.status == "BeforeExpiry") {
      setPwExpInfo((prev) => ({ ...prev, useExpiration: false }));
    }
    setVisible(false);
  };

  const processApi = useApi();

  //프로시저 파라미터 초기값
  const [paraData, setParaData] = useState({
    work_type: "",
    isLater: false,
    old_password: "",
    new_password: "",
    check_new_password: "",
  });

  //프로시저 파라미터
  const paraSaved = {
    isLater: paraData.isLater,
    currentPassword: paraData.old_password,
    newPassword: paraData.new_password,
    confirmNewPassword: paraData.check_new_password,
  };

  const fetchMainSaved = async () => {
    let data: any;

    try {
      data = await processApi<any>("change-password", paraSaved);
    } catch (error: any) {
      data = null;
      console.log("[오류 발생]");
      console.log(error);
      alert(error.message);
    }

    if (data !== null) {
      alert("처리가 완료되었습니다.");
      setVisible(false);
      setPwExpInfo((prev) => ({ ...prev, status: "Ok", useExpiration: false }));
    }
  };

  const handleSubmit = (dataItem: { [name: string]: any }) => {
    const { old_password, new_password, check_new_password } = dataItem;

    if (new_password != check_new_password) {
      alert("비밀번호 확인이 다릅니다.");
    } else if (new_password.length < 4) {
      alert("비밀번호 최소 4자리를 입력해주세요.");
    } else {
      setParaData((prev) => ({
        ...prev,
        work_type: "change",
        old_password,
        new_password,
        check_new_password,
      }));
    }
  };

  useEffect(() => {
    if (paraData.work_type !== "") {
      // 초기화
      setParaData((prev) => ({
        ...prev,
        work_type: "",
      }));
      fetchMainSaved();
    }
  }, [paraData]);

  useEffect(() => {
    fetchPasswordRequirements();
  }, []);

  const fetchPasswordRequirements = async () => {
    let data: any;
    try {
      data = await processApi<any>("get-password-requirements");
    } catch (error) {
      data = null;
    }

    if (data) {
      setPwReq(data);
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
  };

  return (
    <Window
      title={"비밀번호 변경"}
      initialWidth={position.width}
      initialHeight={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
    >
      <Form
        onSubmit={handleSubmit}
        initialValues={{
          old_password: "",
          new_password: "",
          check_new_password: "",
        }}
        render={(formRenderProps: FormRenderProps) => (
          <FormElement horizontal={true}>
            <fieldset
              className={"k-form-fieldset"}
              style={{
                overflow: isMobile ? "auto" : "hidden",
                height: isMobile
                  ? deviceHeight - height - height3
                  : position.height - height - height3,
              }}
            >
              <FieldWrap fieldWidth="100%">
                <Field
                  name={"old_password"}
                  label={"현재 비밀번호"}
                  component={FormInput}
                  validator={validator}
                  className={"required"}
                  type={"password"}
                />
              </FieldWrap>
              <FieldWrap fieldWidth="100%">
                <Field
                  name={"new_password"}
                  label={"새 비밀번호"}
                  component={FormInput}
                  validator={validator}
                  className="required"
                  type={"password"}
                />
              </FieldWrap>
              <FieldWrap fieldWidth="100%">
                <Field
                  name={"check_new_password"}
                  label={"비밀번호 확인"}
                  component={FormInput}
                  validator={validator}
                  className="required"
                  type={"password"}
                />
              </FieldWrap>
              {pwReq && (
                <div
                  style={{
                    fontSize: "12px",
                    textAlign: "right",
                    marginTop: "10px",
                    color: "#ff6358",
                  }}
                >
                  {pwExpInfo && pwExpInfo.status == "Initial" && (
                    <p>- 초기 비밀번호를 변경해주세요.</p>
                  )}
                  <p>
                    - 비밀번호는 최소 {pwReq.minimumLength}자리를 입력해주세요.
                  </p>
                  {pwReq.useSpecialChar && (
                    <p>- 비밀번호는 영문자, 숫자, 특수문자를 포함해주세요.</p>
                  )}
                </div>
              )}
            </fieldset>
            <BottomContainer className="BottomContainer">
              <ButtonContainer>
                {pwExpInfo &&
                  pwExpInfo.useChangeNext &&
                  pwExpInfo.useExpiration &&
                  pwExpInfo.status !== "Ok" &&
                  pwExpInfo.status !== "Initial" && (
                    <Button
                      type={"button"}
                      themeColor={"primary"}
                      fillMode={"outline"}
                      onClick={() =>
                        setParaData((prev) => ({
                          ...prev,
                          work_type: "change",
                          isLater: true,
                        }))
                      }
                    >
                      다음에 변경
                    </Button>
                  )}
                <Button type={"submit"} themeColor={"primary"} icon="save">
                  저장
                </Button>
              </ButtonContainer>
            </BottomContainer>
          </FormElement>
        )}
      />
    </Window>
  );
};

export default KendoWindow;
