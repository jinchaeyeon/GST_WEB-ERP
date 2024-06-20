import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { useLayoutEffect, useState } from "react";
import {
  BottomContainer,
  ButtonContainer,
  FormBox,
  FormBoxWrap,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import {
  getHeight,
  getWindowDeviceHeight
} from "../CommonFunction";
import Window from "./WindowComponent/Window";

type IWindow = {
  setVisible(t: boolean): void;
  setData(amt: number): void;
  modal?: boolean;
};

var height = 0;
var height2 = 0;

const CopyWindow = ({ setVisible, setData, modal = false }: IWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 400) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 230) / 2,
    width: isMobile == true ? deviceWidth : 400,
    height: isMobile == true ? deviceHeight : 230,
  });
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
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
  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onClose = () => {
    setVisible(false);
  };

  const processApi = useApi();

  const [filters, setFilters] = useState({
    amt: 0,
  });

  // 부모로 데이터 전달, 창 닫기 (그리드 인라인 오픈 제외)
  const selectData = (selectedData: any) => {
    setData(filters.amt);
    onClose();
  };

  return (
    <>
      <Window
        titles={"금액입력"}
        positions={position}
        Close={onClose}
        modals={modal}
        onChangePostion={onChangePostion}
      >
        <FormBoxWrap style={{ height: isMobile ? mobileheight : webheight }}>
          <FormBox>
            <tbody>
              <tr>
                <th>금액</th>
                <td>
                  <Input
                    name="amt"
                    type="number"
                    value={filters.amt}
                    onChange={filterInputChange}
                  />
                </td>
              </tr>
            </tbody>
          </FormBox>
        </FormBoxWrap>
        <BottomContainer className="BottomContainer">
          <ButtonContainer style={{ paddingRight: "70px" }}>
            <Button themeColor={"primary"} onClick={selectData}>
              저장
            </Button>
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
    </>
  );
};

export default CopyWindow;
