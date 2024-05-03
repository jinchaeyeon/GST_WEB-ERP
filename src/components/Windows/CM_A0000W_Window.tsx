import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridItemChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, Input, TextArea } from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IAttachmentData, IWindowPosition } from "../../hooks/interfaces";
import { deletedNameState, unsavedNameState } from "../../store/atoms";
import { Iparameters } from "../../store/types";
import CheckBoxCell from "../Cells/CheckBoxCell";
import CheckBoxReadOnlyCell from "../Cells/CheckBoxReadOnlyCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UseParaPc,
  convertDateToStr,
  dateformat,
  getGridItemChangedData,
  getQueryFromBizComponent,
  setDefaultDate2,
} from "../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../CommonString";
import { CellRender, RowRender } from "../Renderers/Renderers";
import PopUpAttachmentsWindow from "./CommonWindows/PopUpAttachmentsWindow";

const DATA_ITEM_KEY = "num";

type TKendoWindow = {
  getVisible(t: boolean): void;
  reloadData(workType: string): void;
  workType: "U" | "N";
  datnum?: string;
  categories?: string;
  para?: Iparameters; //{};
  modal?: boolean;
  pathname: string;
};

type TDetailData = {
  person2: string[];
  chooses: string[];
  loadok: string[];
  readok: string[];
};

const KendoWindow = ({
  getVisible,
  reloadData,
  workType,
  datnum,
  categories,
  para,
  modal = false,
  pathname,
}: TKendoWindow) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const userId = UseGetValueFromSessionItem("user_id");
  const user_name = UseGetValueFromSessionItem("user_name");

  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);
  const idGetter = getter(DATA_ITEM_KEY);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1200,
    height: 550,
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

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    fetchGrid(value);
  };

  const onClose = () => {
    if (unsavedName.length > 0) setDeletedName(unsavedName);

    getVisible(false);
  };

  const processApi = useApi();

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const [filters, setFilters] = useState<{ [name: string]: any }>({
    datnum: workType == "N" ? "" : datnum,
    orgdiv: sessionOrgdiv,
    category: categories == undefined ? "" : categories,
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
    if (customOptionData !== null && workType == "N") {
      setFilters((prev) => {
        return {
          ...prev,
          publish_start_date: setDefaultDate2(
            customOptionData,
            "publish_start_date"
          ),
          publish_end_date: setDefaultDate2(
            customOptionData,
            "publish_end_date"
          ),
          category: GetPropertyValueByName(
            customOptionData.menuCustomDefaultOptions,
            "new"
          ).find((item: any) => item.id == "category")?.valueCode,
          publish_yn: GetPropertyValueByName(
            customOptionData.menuCustomDefaultOptions,
            "new"
          ).find((item: any) => item.id == "publish_yn")?.valueCode,
          person: user_name,
        };
      });
    }
  }, [customOptionData]);

  useEffect(() => {
    if (workType == "U") {
      fetchMain(para);
    }
    fetchGrid(categories == undefined ? "" : categories);
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
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  //상세그리드 조회
  const fetchGrid = async (value: string) => {
    let data: any;
    const subparameters: Iparameters = {
      procedureName: "P_CM_A0000W_Q",
      pageNumber: 1,
      pageSize: 10000,
      parameters: {
        "@p_work_type": "LOAD",
        "@p_orgdiv": sessionOrgdiv,
        "@p_datnum": datnum,
        "@p_dtgb": "",
        "@p_frdt": "",
        "@p_category": value,
        "@p_title": "",
        "@p_yn": "",
        "@p_attdatnum": "",
        "@p_userid": userId,
        "@p_newDiv": "N",
      },
    };

    const subparameters2: Iparameters = {
      procedureName: "P_CM_A0000W_Q",
      pageNumber: 1,
      pageSize: 10000,
      parameters: {
        "@p_work_type": "LOAD",
        "@p_orgdiv": sessionOrgdiv,
        "@p_datnum": datnum,
        "@p_dtgb": "",
        "@p_frdt": "",
        "@p_category": "300",
        "@p_title": "",
        "@p_yn": "",
        "@p_attdatnum": "",
        "@p_userid": userId,
        "@p_newDiv": "N",
      },
    };
    if (categories == "300") {
      try {
        data = await processApi<any>("procedure", subparameters2);
      } catch (error) {
        data = null;
      }

      if (data.isSuccess == true) {
        const totalRowCnt = data.tables[0].RowCount;
        const rows = data.tables[0].Rows.map((item: any) => ({
          ...item,
          rowstatus: "",
        }));

        setMainDataResult(() => {
          return {
            data: rows,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });

        if (totalRowCnt > 0) {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        }
      }
    } else {
      try {
        data = await processApi<any>("procedure", subparameters);
      } catch (error) {
        data = null;
      }

      if (data.isSuccess == true) {
        const totalRowCnt = data.tables[0].RowCount;
        const rows = data.tables[0].Rows;

        setMainDataResult(() => {
          return {
            data: rows,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });

        if (totalRowCnt > 0) {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        }
      }
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

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
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
        resetAllGrid();
        reloadData(data.returnString);
        fetchMain(para);
        fetchGrid(filters.category);
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
    let detailArr: TDetailData = {
      person2: [],
      chooses: [],
      loadok: [],
      readok: [],
    };
    mainDataResult.data.forEach((item: any) => {
      const { chooses, loadok, readok, user_id } = item;
      detailArr.chooses.push(
        chooses == "Y" ? "Y" : chooses == true ? "Y" : "N"
      );
      detailArr.loadok.push(loadok == "Y" ? "Y" : loadok == true ? "Y" : "N");
      detailArr.person2.push(user_id);
      detailArr.readok.push(readok);
    });

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
      person2: detailArr.person2.join("|"),
      chooses: detailArr.chooses.join("|"),
      loadok: detailArr.loadok.join("|"),
      readok: detailArr.readok.join("|"),
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

  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_dptcd_001,L_HU005", setBizComponentData);
  //공통코드 리스트 조회 ()
  const [dptcdListData, setdptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [postcdListData, setpostcdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const dptcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_dptcd_001"
        )
      );
      const postcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_HU005")
      );

      fetchQuery(postcdQueryStr, setpostcdListData);
      fetchQuery(dptcdQueryStr, setdptcdListData);
    }
  }, [bizComponentData]);

  const fetchQuery = useCallback(async (queryStr: string, setListData: any) => {
    let data: any;

    const bytes = require("utf8-bytes");
    const convertedQueryStr = bytesToBase64(bytes(queryStr));

    let query = {
      query: convertedQueryStr,
    };

    try {
      data = await processApi<any>("query", query);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setMainDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };

  const customCellRender = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit}
      editField={EDIT_FIELD}
    />
  );

  const customRowRender = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit}
      editField={EDIT_FIELD}
    />
  );
  const enterEdit = (dataItem: any, field: string) => {
    if (field == "chooses") {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult((prev) => {
        return {
          data: mainDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != mainDataResult.data) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
              [EDIT_FIELD]: undefined,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
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
      <GridContainerWrap>
        <GridContainer width="55%">
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
                  <th>분류</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="category"
                        value={filters.category}
                        type="new"
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        className="required"
                      />
                    )}
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
                  <th>시작일자</th>
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
                  <th>종료일자</th>
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
        <GridContainer width={`calc(45% - ${GAP}px)`}>
          <GridTitleContainer>
            <GridTitle>참조</GridTitle>
          </GridTitleContainer>
          <Grid
            style={{ height: "36vh" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                dptcd: dptcdListData.find(
                  (item: any) => item.dptcd == row.dptcd
                )?.dptnm,
                postcd: postcdListData.find(
                  (item: any) => item.sub_code == row.postcd
                )?.code_name,
                chooses:
                  row.chooses == "Y"
                    ? true
                    : row.chooses == "N"
                    ? false
                    : row.chooses,
                loadok:
                  row.loadok == "Y"
                    ? true
                    : row.loadok == "N"
                    ? false
                    : row.loadok,
                [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
              })),
              mainDataState
            )}
            onDataStateChange={onMainDataStateChange}
            {...mainDataState}
            dataItemKey={DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onSelectionChange}
            //스크롤 조회기능
            fixedScroll={true}
            total={mainDataResult.total}
            //정렬기능
            sortable={true}
            onSortChange={onMainSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            onItemChange={onMainItemChange}
            cellRender={customCellRender}
            rowRender={customRowRender}
            editField={EDIT_FIELD}
          >
            <GridColumn field="rowstatus" title=" " width="50px" />
            <GridColumn field="user_name" title="성명" width="100px" />
            <GridColumn field="dptcd" title="부서" width="120px" />
            <GridColumn field="postcd" title="직위" width="90px" />
            <GridColumn
              field="chooses"
              title="참조"
              width="60px"
              cell={
                filters.category == "200" ? CheckBoxCell : CheckBoxReadOnlyCell
              }
            />
            <GridColumn
              field="loadok"
              title="확인"
              width="60px"
              cell={CheckBoxReadOnlyCell}
            />
            <GridColumn field="readok" title="열람" width="60px" />
          </Grid>
        </GridContainer>
      </GridContainerWrap>
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
