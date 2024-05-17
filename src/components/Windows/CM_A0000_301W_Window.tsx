import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import { Checkbox, Input, TextArea } from "@progress/kendo-react-inputs";
import * as React from "react";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FormBox,
  FormBoxWrap,
  GridContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IAttachmentData, IWindowPosition } from "../../hooks/interfaces";
import { deletedNameState, unsavedNameState } from "../../store/atoms";
import { Iparameters } from "../../store/types";
import {
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UseParaPc,
  convertDateToStr,
  dateformat,
} from "../CommonFunction";
import { PAGE_SIZE } from "../CommonString";
import PopUpAttachmentsWindow from "./CommonWindows/PopUpAttachmentsWindow";

type TKendoWindow = {
  getVisible(t: boolean): void;
  reloadData(workType: string): void;
  workType: "U" | "N";
  datnum?: string;
  para?: Iparameters; //{};
  modal?: boolean;
  pathname: string;
};

const KendoWindow = ({
  getVisible,
  reloadData,
  workType,
  datnum,
  para,
  modal = false,
  pathname,
}: TKendoWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const userId = UseGetValueFromSessionItem("user_id");
  const user_name = UseGetValueFromSessionItem("user_name");

  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 800,
    height: isMobile == true ? deviceHeight : 550,
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
  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onClose = () => {
    if (unsavedName.length > 0) setDeletedName(unsavedName);

    getVisible(false);
  };

  const processApi = useApi();
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const [filters, setFilters] = useState<{ [name: string]: any }>({
    datnum: workType == "N" ? "" : datnum,
    orgdiv: sessionOrgdiv,
    category: "100",
    location: sessionLocation,
    publish_start_date: new Date(),
    publish_end_date: new Date(),
    title: "",
    contents: "",
    publish_yn: "Y",
    publishdate: new Date(),
    pgSize: PAGE_SIZE,
    person: "",
    attdatnum: "",
    user_id: userId,
    pc: pc,
    person2: "",
    chooses: "",
    loadok: "", //"KRW",
    readok: 0,
    custcd_s: 0,
    form_id: "",
    files: "",
    dtgb: "C",
    Insert_form_id: "",
    Update_form_id: "",
    insert_time: "",
    insert_userid: userId,
    update_pc: pc,
    update_time: "",
    update_userid: "",
    user_name: "",
    pgNum: 1,
    find_row_value: "",
    isSearch: true,
  });

  useEffect(() => {
    if (workType == "U") {
      fetchMain(para);
    }
  }, []);

  //요약정보 조회
  const fetchMain = async (parameters: any) => {
    let data: any;

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true && data.tables[0].Rows.length > 0) {
      const row = data.tables[0].Rows[0];

      setFilters((prev) => {
        return {
          ...prev,
          datnum: row.datnum == undefined ? "" : row.datnum,
          orgdiv: row.orgdiv,
          category: row.category,
          location: row.location,
          publish_start_date: new Date(dateformat(row.publish_start_date)),
          publish_end_date: new Date(dateformat(row.publish_end_date)),
          title: row.title,
          contents: row.contents,
          publish_yn: row.publish_yn,
          person: row.user_name,
          attdatnum: row.attdatnum,
          person2: row.person2,
          chooses: row.chooses_s,
          loadok: row.loadok_s,
          readok: row.readok_s, //0,
          custcd_s: row.custcd_s, //0,
          form_id: row.form_id,
          Insert_form_id: row.Insert_form_id,
          Update_form_id: row.Update_form_id,
          pc: row.insert_pc,
          insert_time: row.insert_time,
          insert_userid: row.insert_userid,
          publishdate: row.publishdate,
          update_pc: row.update_pc,
          update_time: row.update_time,
          update_userid: row.update_userid,
          user_name: row.user_name,
        };
      });
    }
  };

  //프로시저 파라미터 초기값
  const [paraData, setParaData] = useState({
    work_type: "",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    datnum: filters.datnum,
    category: "100",
    title: "",
    contents: "",
    publish_yn: "Y",
    publish_start_date: "",
    publish_end_date: "",
    person: "",
    attdatnum: "",
    user_id: filters.user_id,
    pc: filters.pc,
    person2: "",
    chooses: "",
    loadok: "",
    readok: "",
  });

  //프로시저 파라미터
  const paraSaved: Iparameters = {
    procedureName: "P_CM_A0000W_S",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": paraData.work_type,
      "@p_orgdiv": paraData.orgdiv,
      "@p_location": paraData.location,
      "@p_datnum": paraData.datnum,
      "@p_category": paraData.category,
      "@p_title": paraData.title,
      "@p_contents": paraData.contents,
      "@p_publish_yn": paraData.publish_yn,
      "@p_publish_start_date": paraData.publish_start_date,
      "@p_publish_end_date": paraData.publish_end_date,
      "@p_person": paraData.person,
      "@p_attdatnum": paraData.attdatnum,
      "@p_userid": paraData.user_id,
      "@p_pc": paraData.pc,
      "@p_person2": paraData.person2,
      "@p_chooses": paraData.chooses,
      "@p_loadok": paraData.loadok,
      "@p_readok": paraData.readok,
      "@p_form_id": "CM_A0000W",
    },
  };

  const fetchGridSaved = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess == true) {
      if (workType == "U") {
        reloadData(data.returnString);
        fetchMain(para);
      } else {
        reloadData(data.returnString);
        getVisible(false);
      }
      setUnsavedName([]);
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }

    paraData.work_type = ""; //초기화
  };

  const handleSubmit = () => {
    setParaData((prev) => ({
      ...prev,
      work_type: workType,
      orgdiv: sessionOrgdiv,
      location: sessionLocation,
      category: filters.category,
      title: filters.title,
      contents: filters.contents,
      publish_yn:
        filters.publish_yn == true
          ? "Y"
          : filters.publish_yn == false
          ? "N"
          : filters.publish_yn,
      publish_start_date: convertDateToStr(filters.publish_start_date),
      publish_end_date: convertDateToStr(filters.publish_end_date),
      person: filters.user_id,
      attdatnum: filters.attdatnum,
      user_id: filters.user_id,
      pc: filters.pc,
      person2: "",
      chooses: "",
      loadok: "",
      readok: "",
    }));
  };

  useEffect(() => {
    if (paraData.work_type !== "") fetchGridSaved();
  }, [paraData]);

  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const getAttachmentsData = (data: IAttachmentData) => {
    setFilters((prev) => {
      return {
        ...prev,
        attdatnum: data.attdatnum,
        files:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
      };
    });
  };

  return (
    <Window
      title={workType == "N" ? "공지생성" : "공지정보"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={modal}
    >
      <GridContainer>
        <FormBoxWrap>
          <FormBox>
            <tbody>
              <tr>
                <th>문서번호</th>
                <td>
                  <Input
                    name="datnum"
                    type="text"
                    value={filters.datnum}
                    className="readonly"
                  />
                </td>
                <th>직성자</th>
                <td>
                  <Input
                    name="person"
                    type="text"
                    value={filters.person}
                    className="readonly"
                  />
                </td>
              </tr>
              <tr>
                <th>카테고리</th>
                <td>
                  <Input
                    name="category"
                    type="text"
                    value="전체공지"
                    className="readonly"
                  />
                </td>
                <th>공지게시여부</th>
                <td>
                  <Checkbox
                    name="publish_yn"
                    value={
                      filters.publish_yn == "Y"
                        ? true
                        : filters.publish_yn == "N"
                        ? false
                        : filters.publish_yn
                    }
                    onChange={filterInputChange}
                  ></Checkbox>
                </td>
              </tr>
              <tr>
                <th>공지시작일</th>
                <td>
                  <DatePicker
                    name="publish_start_date"
                    value={filters.publish_start_date}
                    format="yyyy-MM-dd"
                    onChange={filterInputChange}
                    placeholder=""
                    className="required"
                  />
                </td>
                <th>공지종료일</th>
                <td>
                  <DatePicker
                    name="publish_end_date"
                    value={filters.publish_end_date}
                    format="yyyy-MM-dd"
                    onChange={filterInputChange}
                    placeholder=""
                    className="required"
                  />
                </td>
              </tr>
              <tr>
                <th>제목</th>
                <td colSpan={3}>
                  <Input
                    name="title"
                    type="text"
                    value={filters.title}
                    onChange={filterInputChange}
                  />
                </td>
              </tr>
              <tr>
                <th></th>
                <td colSpan={3}>
                  <TextArea
                    value={filters.contents}
                    name="contents"
                    rows={7}
                    onChange={filterInputChange}
                  />
                </td>
              </tr>
              <tr>
                <th>첨부파일</th>
                <td colSpan={3}>
                  <Input
                    name="files"
                    type="text"
                    value={filters.files}
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
      </GridContainer>
      <BottomContainer>
        <ButtonContainer>
          <Button themeColor={"primary"} onClick={handleSubmit}>
            저장
          </Button>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>
      {attachmentsWindowVisible && (
        <PopUpAttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={filters.attdatnum}
        />
      )}
    </Window>
  );
};

export default KendoWindow;
