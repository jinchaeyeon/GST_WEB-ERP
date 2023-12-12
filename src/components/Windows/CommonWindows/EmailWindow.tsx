import { Button } from "@progress/kendo-react-buttons";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import { Input, TextArea } from "@progress/kendo-react-inputs";
import { MuiChipsInput, MuiChipsInputChip } from "mui-chips-input";
import { useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  FormBox,
  FormBoxWrap,
} from "../../../CommonStyled";
import { useApi } from "../../../hooks/api";
import { IWindowPosition } from "../../../hooks/interfaces";
import { isLoading } from "../../../store/atoms";

type TKendoWindow = {
  setVisible(isVisible: boolean): void;
  quonum: string;
  quorev: number;
  modal?: boolean;
};

const KendoWindow = ({
  setVisible,
  quonum,
  quorev,
  modal = false,
}: TKendoWindow) => {
  const setLoading = useSetRecoilState(isLoading);
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const processApi = useApi();
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1000,
    height: 600,
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
  const handleChange = (newValue: MuiChipsInputChip[]) => {
    setFilters((prev) => ({
      ...prev,
      recieveuser: newValue,
    }));
  };
  const onClose = () => {
    setVisible(false);
  };

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [filters, setFilters] = useState<{ [name: string]: any }>({
    recieveuser: [],
    title: "",
    contents: "",
  });

  const onSend = async () => {
    let data: any;
    setLoading(true);

    if (filters.recieveuser.length == 0) {
      alert("이메일을 입력해주세요.");
    } else {
      let regex = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");
      let valid = true;
      filters.recieveuser.forEach((address: string) => {
        if (regex.test(address) == false) {
          valid = false;
        }
      });

      if (valid == true) {
        const parameters = {
          para: "send-mail?id=S2023744A53",
          to: filters.recieveuser,
          title: filters.title,
          textBody: filters.contents,
          printoutName: `견적서_${quonum}.pdf`,
          queryParamValues: {
            "@p_orgidv": "01",
            "@p_quonum": quonum,
            "@p_quorev": quorev,
          },
        };

        try {
          data = await processApi<any>("excel-view", parameters);
        } catch (error) {
          data = null;
        }

        alert("발송했습니다.");
        onClose();
      } else {
        alert("이메일 형식을 맞춰주세요.");
      }
    }
    setLoading(false);
  };

  return (
    <Window
      title={"Email"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={modal}
    >
      <FormBoxWrap border={true}>
        <FormBox>
          <tbody>
            <tr>
              <th style={{ width: "10%" }}>받는 사람</th>
              <td>
                <MuiChipsInput
                  value={filters.recieveuser}
                  onChange={handleChange}
                  size="small"
                  placeholder="이메일 입력 후 Enter를 눌러주세요"
                  hideClearAll
                />
              </td>
            </tr>
            <tr>
              <th style={{ width: "10%" }}>제목</th>
              <td>
                <Input
                  name="title"
                  type="text"
                  value={filters.title}
                  onChange={InputChange}
                />
              </td>
            </tr>
            <tr>
              <th style={{ width: "10%" }}>내용</th>
              <td>
                <TextArea
                  value={filters.contents}
                  name="contents"
                  rows={15}
                  onChange={InputChange}
                />
              </td>
            </tr>
          </tbody>
        </FormBox>
      </FormBoxWrap>
      <BottomContainer>
        <ButtonContainer>
          <Button themeColor={"primary"} onClick={onSend}>
            발송
          </Button>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>
    </Window>
  );
};

export default KendoWindow;
