import { TextField } from "@mui/material";
import { Button } from "@progress/kendo-react-buttons";
import { useLayoutEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  Title,
} from "../../../CommonStyled";
import { useApi } from "../../../hooks/api";
import { IWindowPosition } from "../../../hooks/interfaces";
import { isLoading } from "../../../store/atoms";
import { getHeight, getWindowDeviceHeight } from "../../CommonFunction";
import { GAP } from "../../CommonString";
import Window from "../WindowComponent/Window";

type IKendoWindow = {
  setVisible(t: boolean): void;
  modal?: boolean;
};

var height = 0;
var height2 = 0;
var height3 = 0;

const KendoWindow = ({ setVisible, modal = false }: IKendoWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;

  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);

  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1000) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 400) / 2,
    width: isMobile == true ? deviceWidth : 1000,
    height: isMobile == true ? deviceHeight : 400,
  });

  useLayoutEffect(() => {
    height = getHeight(".k-window-titlebar");
    height2 = getHeight(".ButtonContainer"); //하단 버튼부분
    height3 = getHeight(".ButtonContainer2"); //하단 버튼부분

    setMobileHeight(
      getWindowDeviceHeight(false, deviceHeight) - height - height2
    );
    setMobileHeight2(
      getWindowDeviceHeight(false, deviceHeight) - height - height3
    );
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height2
    );
    setWebHeight2(
      getWindowDeviceHeight(false, position.height) - height - height3
    );
  }, [position]);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height2
    );
    setWebHeight2(
      getWindowDeviceHeight(false, position.height) - height - height3
    );
  };

  const setLoading = useSetRecoilState(isLoading);

  const onClose = () => {
    setVisible(false);
  };

  const processApi = useApi();

  const [filters, setFilters] = useState({
    name: "",
    email: "",
  });

  const [filters2, setFilters2] = useState({
    id: "",
  });

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterInputChange2 = (e: any) => {
    const { value, name } = e.target;

    setFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Window
      titles={"아이디/비밀번호 찾기"}
      positions={position}
      Close={onClose}
      modals={modal}
      onChangePostion={onChangePostion}
    >
      <GridContainerWrap style={{ height: "100%" }}>
        <GridContainer width="50%">
          <div className="ButtonContainer" style={{paddingLeft: "10px"}}>
            <Title>아이디 찾기</Title>
            <GridTitle>
              회원가입 시 등록하신 이름과 이메일을 입력해주세요.
            </GridTitle>
          </div>
          <FormBoxWrap
            style={{
              height: isMobile ? mobileheight : webheight,
              display: "flex",
              alignItems: "center",
            }}
            border={true}
          >
            <FormBox>
              <tbody>
                <tr>
                  <th>
                    <TextField
                      id="outlined-controlled"
                      label="이름"
                      value={filters.name}
                      fullWidth
                      margin="dense"
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        setFilters((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }));
                      }}
                    />
                  </th>
                </tr>
                <tr>
                  <th>
                    <TextField
                      id="outlined-controlled"
                      label="E-mail 주소"
                      value={filters.email}
                      fullWidth
                      margin="dense"
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        setFilters((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }));
                      }}
                    />
                  </th>
                </tr>
                <tr>
                  <th>
                    <Button
                      themeColor={"primary"}
                      onClick={onClose}
                      style={{ width: "100%", marginTop: "15px" }}
                      size={"large"}
                    >
                      아이디 찾기
                    </Button>
                  </th>
                </tr>
              </tbody>
            </FormBox>
          </FormBoxWrap>
        </GridContainer>
        <GridContainer width={`calc(50% - ${GAP}px)`}>
          <div className="ButtonContainer2" style={{paddingLeft: "10px"}}>
            <Title>비밀번호 찾기</Title>
            <GridTitle>
              본인인증 진행 후에 입력한 메일주소로 비밀번호가 발송됩니다.
            </GridTitle>
          </div>
          <FormBoxWrap
            style={{
              height: isMobile ? mobileheight2 : webheight2,
              display: "flex",
              alignItems: "center",
            }}
            border={true}
          >
            <FormBox>
              <tbody>
                <tr>
                  <th>
                    <TextField
                      id="outlined-controlled"
                      label="아이디"
                      value={filters2.id}
                      fullWidth
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        setFilters2((prev) => ({
                          ...prev,
                          id: event.target.value,
                        }));
                      }}
                    />
                  </th>
                </tr>
                <tr>
                  <th>
                    <Button
                      themeColor={"primary"}
                      onClick={onClose}
                      style={{ width: "100%", marginTop: "15px" }}
                      size={"large"}
                    >
                      휴대전화(SMS) 인증
                    </Button>
                  </th>
                </tr>
              </tbody>
            </FormBox>
          </FormBoxWrap>
        </GridContainer>
      </GridContainerWrap>
    </Window>
  );
};

export default KendoWindow;
