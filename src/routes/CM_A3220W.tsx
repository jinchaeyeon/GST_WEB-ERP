import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input, TextArea } from "@progress/kendo-react-inputs";
import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useSetRecoilState } from "recoil";
import "swiper/css";
import {
  ButtonContainer,
  ButtonInGridInput,
  ButtonInInput,
  FilterBox,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import DateCell from "../components/Cells/DateCell";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getBizCom,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
  setDefaultDate,
  toDate,
  useSysMessage,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import CM_A3220W_PRINT from "../components/Prints/CM_A3220W_PRINT";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import { useApi } from "../hooks/api";
import { IAttachmentData, IWindowPosition } from "../hooks/interfaces";
import { deletedAttadatnumsState, isLoading } from "../store/atoms";
import { gridList } from "../store/columns/CM_A3220W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
let targetRowIndex: null | number = null;
var height = 0;
var height2 = 0;
var height3 = 0;
const DateField = ["recdt"];
const fileField = ["files"];

export const FormContext = createContext<{
  attdatnum: string;
  files: string;
  setAttdatnum: (d: any) => void;
  setFiles: (d: any) => void;
  mainDataState: State;
  setMainDataState: (d: any) => void;
  // fetchGrid: (n: number) => any;
}>({} as any);

const ColumnCommandCell = (props: GridCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    className = "",
  } = props;
  const { setAttdatnum, setFiles } = useContext(FormContext);
  let isInEdit = field == dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const onAttWndClick2 = () => {
    setAttachmentsWindowVisible(true);
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    setAttdatnum(data.attdatnum);
    setFiles(
      data.original_name +
        (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : "")
    );
  };

  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {value}
      <ButtonInGridInput>
        <Button
          name="itemcd"
          onClick={onAttWndClick2}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInGridInput>
    </td>
  );

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={dataItem.attdatnum}
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

const CM_A3220W: React.FC = () => {
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const idGetter = getter(DATA_ITEM_KEY);
  const userId = UseGetValueFromSessionItem("user_id");
  const pc = UseGetValueFromSessionItem("pc");
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1200) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 800) / 2,
    width: isMobile == true ? deviceWidth : 1200,
    height: isMobile == true ? deviceHeight : 800,
  });
  const onChangePostion = (position: any) => {
    setPosition(position);
  };
  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".ButtonContainer");
      height3 = getHeight(".ButtonContainer2");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setWebHeight(getDeviceHeight(true) - height - height2);
        setWebHeight2(getDeviceHeight(true) - height - height3);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2]);
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  let gridRef: any = useRef(null);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A3220W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A3220W_001");
      } else {
        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
      }
    } catch (e) {
      alert(e);
    }
  };

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        person: defaultOption.find((item: any) => item.id == "person")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  //비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_sysUserMaster_001", setBizComponentData);

  const [personListData, setPersonListData] = useState([
    { user_id: "", user_name: "" },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setPersonListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
    }
  }, [bizComponentData]);
  const [attdatnum, setAttdatnum] = useState<string>("");
  const [files, setFiles] = useState<string>("");
  useEffect(() => {
    const newData = mainDataResult.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
        ? {
            ...item,
            attdatnum: attdatnum,
            files: files,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
          }
        : {
            ...item,
          }
    );

    setMainDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [attdatnum, files]);

  // 조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: sessionOrgdiv,
    frdt: new Date(),
    todt: new Date(),
    draftnum: "",
    person: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [information, setInformation] = useState<{ [name: string]: any }>({
    workType: "N",
    appyn: "",
    attdatnum: "",
    contents: "",
    draftnum: "",
    files: "",
    orgdiv: sessionOrgdiv,
    person: "",
    recdt: new Date(),
    title: "",
  });
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "요약정보";
      _export.save(optionsGridOne);
    }
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_CM_A3220W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_draftnum": filters.draftnum,
        "@p_person": filters.person,
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.draftnum == filters.find_row_value
          );
          targetRowIndex = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef.current) {
          targetRowIndex = 0;
        }
      }

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.draftnum == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setInformation({
            workType: "U",
            appyn: selectedRow.appyn,
            attdatnum: selectedRow.attdatnum,
            contents: selectedRow.contents,
            draftnum: selectedRow.draftnum,
            files: selectedRow.files,
            orgdiv: selectedRow.orgdiv,
            person: selectedRow.person,
            recdt: selectedRow.recdt == "" ? null : toDate(selectedRow.recdt),
            title: selectedRow.title,
          });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setInformation({
            workType: "U",
            appyn: rows[0].appyn,
            attdatnum: rows[0].attdatnum,
            contents: rows[0].contents,
            draftnum: rows[0].draftnum,
            files: rows[0].files,
            orgdiv: rows[0].orgdiv,
            person: rows[0].person,
            recdt: rows[0].recdt == "" ? null : toDate(rows[0].recdt),
            title: rows[0].title,
          });
        }
      } else {
        setInformation({
          workType: "N",
          appyn: "",
          attdatnum: "",
          contents: "",
          draftnum: "",
          files: "",
          orgdiv: sessionOrgdiv,
          person: "",
          recdt: new Date(),
          title: "",
        });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, bizComponentData, customOptionData]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState); // 페이지 초기화
    setMainDataResult(process([], mainDataState));
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    const person = personListData.find(
      (items: any) => items.user_name == selectedRowData.person
    )?.user_id;

    setInformation({
      workType: "U",
      appyn: selectedRowData.appyn,
      attdatnum: selectedRowData.attdatnum,
      contents: selectedRowData.contents,
      draftnum: selectedRowData.draftnum,
      files: selectedRowData.files,
      orgdiv: selectedRowData.orgdiv,
      person: person,
      recdt: selectedRowData.recdt == "" ? null : toDate(selectedRowData.recdt),
      title: selectedRowData.title,
    });
  };

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);
  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    setInformation((prev) => {
      return {
        ...prev,
        attdatnum: data.attdatnum,
        files:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
      };
    });
  };

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

  const enterEdit = (dataItem: any, field: string) => {};
  const exitEdit = () => {};

  const onAddClick = () => {
    const defaultOption = GetPropertyValueByName(
      customOptionData.menuCustomDefaultOptions,
      "new"
    );

    setInformation({
      workType: "N",
      appyn: "",
      attdatnum: "",
      contents: "",
      draftnum: "",
      files: "",
      orgdiv: sessionOrgdiv,
      person: defaultOption.find((item: any) => item.id == "person")?.valueCode,
      recdt: new Date(),
      title: "",
    });
  };

  const onSaveClick = () => {
    if (!permissions.save) return;
    let valid = true;
    try {
      if (
        convertDateToStr(information.recdt).substring(0, 4) < "1997" ||
        convertDateToStr(information.recdt).substring(6, 8) > "31" ||
        convertDateToStr(information.recdt).substring(6, 8) < "01" ||
        convertDateToStr(information.recdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A3220W_001");
      } else if (information.title == "") {
        throw findMessage(messagesData, "CM_A3220W_001");
      }
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    setParaData({
      workType: information.workType,
      orgdiv: information.orgdiv,
      draftnum: information.draftnum,
      recdt:
        information.recdt == null ? "" : convertDateToStr(information.recdt),
      person: information.person,
      title: information.title,
      contents: information.contents,
      attdatnum: information.attdatnum,
    });
  };

  const [paraData, setParaData] = useState({
    workType: "",
    orgdiv: "",
    draftnum: "",
    recdt: "",
    person: "",
    title: "",
    contents: "",
    attdatnum: "",
  });

  const para: Iparameters = {
    procedureName: "P_CM_A3220W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": paraData.orgdiv,
      "@p_draftnum": paraData.draftnum,
      "@p_recdt": paraData.recdt,
      "@p_person": paraData.person,
      "@p_title": paraData.title,
      "@p_contents": paraData.contents,
      "@p_attdatnum": paraData.attdatnum,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "CM_A3220W",
    },
  };

  const questionToDelete = useSysMessage("QuestionToDelete");
  const onDeleteClick = () => {
    if (!permissions.delete) return;
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    if (mainDataResult.data.length == 0) {
      alert("데이터가 없습니다.");
    } else {
      const selectRows = mainDataResult.data.filter(
        (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      setParaData((prev) => ({
        ...prev,
        workType: "D",
        orgdiv: information.orgdiv,
        draftnum: information.draftnum,
        recdt:
          information.recdt == null ? "" : convertDateToStr(information.recdt),
        person: information.person,
        title: information.title,
        contents: information.contents,
        attdatnum: information.attdatnum,
      }));
    }
  };

  useEffect(() => {
    if (
      paraData.workType != "" &&
      permissions.save &&
      paraData.workType != "D"
    ) {
      fetchTodoGridSaved();
    }
    if (paraData.workType == "D" && permissions.delete) {
      fetchTodoGridSaved();
    }
  }, [paraData]);

  const fetchTodoGridSaved = async () => {
    if (!permissions.save && paraData.workType != "D") return;
    if (!permissions.delete && paraData.workType == "D") return;
    let data: any;
    setLoading(true);

    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      if (paraData.workType == "D") {
        if (information.attdatnum != "")
          setDeletedAttadatnums([information.attdatnum]);
      }
      setParaData({
        workType: "",
        orgdiv: "",
        draftnum: "",
        recdt: "",
        person: "",
        title: "",
        contents: "",
        attdatnum: "",
      });
      resetAllGrid();
      setFilters((prev) => ({
        ...prev,
        pgNum: 1,
        find_row_value: data.returnString,
        isSearch: true,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      if (data.resultMessage != undefined) {
        alert(data.resultMessage);
      }
    }
    setLoading(false);
  };

  const [previewVisible, setPreviewVisible] = React.useState<boolean>(false);

  const onPrintWndClick = () => {
    if (!permissions.print) return;
    if (mainDataResult.total > 0) {
      if (information.work_type == "N") {
        alert("저장 후 조회해주세요.");
      } else {
        window.scrollTo(0, 0);
        setPreviewVisible((prev) => !prev);
      }
    } else {
      alert("데이터가 없습니다.");
    }
  };

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>{getMenuName()}</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>기안기간</th>
              <td>
                <CommonDateRangePicker
                  value={{
                    start: filters.frdt,
                    end: filters.todt,
                  }}
                  onChange={(e: { value: { start: any; end: any } }) =>
                    setFilters((prev) => ({
                      ...prev,
                      frdt: e.value.start,
                      todt: e.value.end,
                    }))
                  }
                  className="required"
                />
              </td>
              <th>기안자</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="person"
                    value={filters.person}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    valueField="user_id"
                    textField="user_name"
                  />
                )}
              </td>
              <th>기안번호</th>
              <td>
                <Input
                  name="draftnum"
                  type="text"
                  value={filters.draftnum}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainerWrap>
        <GridContainer width="50%">
          <GridTitleContainer className="ButtonContainer">
            <GridTitle>기본정보</GridTitle>
          </GridTitleContainer>
          <ExcelExport
            data={mainDataResult.data}
            ref={(exporter) => {
              _export = exporter;
            }}
            fileName={getMenuName()}
          >
            <FormContext.Provider
              value={{
                attdatnum,
                files,
                setAttdatnum,
                setFiles,
                mainDataState,
                setMainDataState,
                // fetchGrid,
              }}
            >
              <Grid
                style={{
                  height: webheight,
                }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    person: personListData.find(
                      (items: any) => items.user_id == row.person
                    )?.user_name,
                    [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                  })),
                  mainDataState
                )}
                {...mainDataState}
                onDataStateChange={onMainDataStateChange}
                // 선택기능
                dataItemKey={DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onSelectionChange}
                //스크롤 조회 기능
                fixedScroll={true}
                total={mainDataResult.total}
                skip={page.skip}
                take={page.take}
                pageable={true}
                onPageChange={pageChange}
                //원하는 행 위치로 스크롤 기능
                ref={gridRef}
                rowHeight={30}
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
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdList"]
                    ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                    ?.map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            id={item.id}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            cell={
                              DateField.includes(item.fieldName)
                                ? DateCell
                                : fileField.includes(item.fieldName)
                                ? ColumnCommandCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder == 0
                                ? mainTotalFooterCell
                                : undefined
                            }
                          />
                        )
                    )}
              </Grid>
            </FormContext.Provider>
          </ExcelExport>
        </GridContainer>
        <GridContainer width={`calc(50% - ${GAP}px)`}>
          <GridTitleContainer className="ButtonContainer2">
            <GridTitle>상세정보</GridTitle>
            <ButtonContainer>
              <Button
                onClick={onPrintWndClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="print"
                disabled={permissions.print ? false : true}
              >
                출력
              </Button>
              <Button
                onClick={onAddClick}
                themeColor={"primary"}
                icon="file-add"
                disabled={permissions.save ? false : true}
              >
                신규
              </Button>
              <Button
                onClick={onDeleteClick}
                themeColor={"primary"}
                fillMode={"outline"}
                icon="delete"
                disabled={permissions.delete ? false : true}
              >
                삭제
              </Button>
              <Button
                onClick={onSaveClick}
                themeColor={"primary"}
                fillMode={"outline"}
                icon="save"
                disabled={permissions.delete ? false : true}
              >
                저장
              </Button>
            </ButtonContainer>
          </GridTitleContainer>
          <FormBoxWrap
            border={true}
            style={{
              height: webheight2,
            }}
          >
            <FormBox>
              <tbody>
                <tr>
                  <th>기안번호</th>
                  <td>
                    <Input
                      name="draftnum"
                      type="text"
                      value={information.draftnum}
                      className="readonly"
                    />
                  </td>
                  <th>기안일자</th>
                  <td>
                    <DatePicker
                      name="recdt"
                      value={information.recdt}
                      format="yyyy-MM-dd"
                      onChange={InputChange}
                      placeholder=""
                      className="required"
                    />
                  </td>
                  <th>기안자</th>
                  <td>
                    {information.workType == "N" ? (
                      <>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="person"
                            value={information.person}
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                            valueField="user_id"
                            textField="user_name"
                            type="new"
                          />
                        )}
                      </>
                    ) : (
                      <>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="person"
                            value={information.person}
                            bizComponentId="L_sysUserMaster_001"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                            textField="user_name"
                            valueField="user_id"
                          />
                        )}
                      </>
                    )}
                  </td>
                </tr>
                <tr>
                  <th>제목</th>
                  <td colSpan={5}>
                    <Input
                      name="title"
                      type="text"
                      value={information.title}
                      onChange={InputChange}
                      className="required"
                    />
                  </td>
                </tr>
                <tr>
                  <th>품의내용</th>
                  <td colSpan={5}>
                    <TextArea
                      value={information.contents}
                      name="contents"
                      rows={30}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>첨부파일</th>
                  <td colSpan={5}>
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
        </GridContainer>
      </GridContainerWrap>
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={information.attdatnum}
          modal={true}
          permission={{
            upload: permissions.save,
            download: permissions.view,
            delete: permissions.save,
          }}
        />
      )}
      {previewVisible && (
        <CM_A3220W_PRINT
          setVisible={setPreviewVisible}
          para={
            mainDataResult.data.filter(
              (item) =>
                item[DATA_ITEM_KEY] ==
                Object.getOwnPropertyNames(selectedState)[0]
            )[0] != undefined
              ? mainDataResult.data.filter(
                  (item) =>
                    item[DATA_ITEM_KEY] ==
                    Object.getOwnPropertyNames(selectedState)[0]
                )[0]
              : ""
          }
          modal={true}
        />
      )}
      {gridList.map((grid: TGrid) =>
        grid.columns.map((column: TColumn) => (
          <div
            key={column.id}
            id={column.id}
            data-grid-name={grid.gridName}
            data-field={column.field}
            data-caption={column.caption}
            data-width={column.width}
            hidden
          />
        ))
      )}
    </>
  );
};

export default CM_A3220W;
