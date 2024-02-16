import { Button } from "@progress/kendo-react-buttons";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import { Input } from "@progress/kendo-react-inputs";
import { MuiChipsInput, MuiChipsInputChip } from "mui-chips-input";
import { useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  FormBox,
  FormBoxWrap,
  GridContainer,
} from "../../../CommonStyled";
import { useApi } from "../../../hooks/api";
import { IWindowPosition } from "../../../hooks/interfaces";
import { isLoading } from "../../../store/atoms";
import { TEditorHandle } from "../../../store/types";
import RichEditor from "../../RichEditor";

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
    height: 780,
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
  });
  const [files, setFiles] = useState<FileList | null>();

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
        let editorContent: any = "";
        if (docEditorRef.current) {
          editorContent = docEditorRef.current.getContent();
        }
        const formData = new FormData();
        filters.recieveuser.map((item: string | Blob) => {
          formData.append("to", item);
        });
        formData.append("title", filters.title);
        formData.append("htmlBody", editorContent);
        formData.append("printoutName", `견적서_${quonum}.pdf`);
        formData.append(
          "queryParamValues",
          `{
          "@p_orgidv": "01",
          "@p_quonum": ${quonum},
          "@p_quorev": ${quorev},
        }`
        );
        if (files != null) {
          for (const file of files) {
            formData.append("files", file);
          }
        }

        try {
          data = await processApi<any>("excel-view2", formData);
        } catch (error) {
          data = null;
        }

        alert("전송했습니다.");
        onClose();
      } else {
        alert("이메일 형식을 맞춰주세요.");
      }
    }
    setLoading(false);
  };

  const docEditorRef = useRef<TEditorHandle>(null);
  const excelInput: any = useRef();
  const upload = () => {
    const uploadInput = document.getElementById("uploadAttachment");
    uploadInput!.click();
  };

  const [placeholder, setPlaceholder] = useState("파일 선택");
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
              <th style={{ width: "10%" }}>보내는 사람</th>
              <td>
                <Input
                  name="sender_name"
                  type="text"
                  value={"no-reply@gsti.co.kr"}
                  className="readonly"
                />
              </td>
            </tr>
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
              <th>첨부파일</th>
              <td>
                <Button
                  onClick={upload}
                  themeColor={"primary"}
                  fillMode={"outline"}
                  icon={"upload"}
                  style={{ width: "100%" }}
                >
                  {placeholder}
                  <input
                    id="uploadAttachment"
                    style={{ display: "none" }}
                    type="file"
                    accept="*"
                    multiple
                    ref={excelInput}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setFiles(event.target.files);
                      if (event.target.files != null) {
                        if (event.target.files.length > 0) {
                          setPlaceholder(
                            "현재 파일 : " +
                              (event.target.files.length > 1
                                ? event.target.files[0].name +
                                  "외 " +
                                  (event.target.files.length - 1) +
                                  "건"
                                : event.target.files[0].name)
                          );
                        } else {
                          setPlaceholder("파일 선택");
                        }
                      }
                    }}
                  />
                </Button>
              </td>
            </tr>
          </tbody>
        </FormBox>
      </FormBoxWrap>
      <GridContainer height="400px">
        <RichEditor id="docEditor" ref={docEditorRef} />
      </GridContainer>
      <BottomContainer>
        <ButtonContainer>
          <Button themeColor={"primary"} onClick={onSend}>
            전송
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
