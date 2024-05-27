import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
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
import { InputChangeEvent } from "@progress/kendo-react-inputs";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { v4 as uuidv4 } from "uuid";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInGridInput,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../../../CommonStyled";
import { useApi } from "../../../hooks/api";
import { IAttachmentData, IWindowPosition } from "../../../hooks/interfaces";
import {
  deletedAttadatnumsState,
  deletedNameState,
  isLoading,
  loginResultState,
  menuList,
  unsavedAttadatnumsState,
  unsavedNameState,
} from "../../../store/atoms";
import { Iparameters } from "../../../store/types";
import {
  UseBizComponent,
  UseGetValueFromSessionItem,
  getBizCom,
  getGridItemChangedData,
  useSysMessage,
} from "../../CommonFunction";
import { EDIT_FIELD, PAGE_SIZE, SELECTED_FIELD } from "../../CommonString";
import { CellRender, RowRender } from "../../Renderers/Renderers";
import FileViewers from "../../Viewer/FileViewers";
import Window from "../WindowComponent/Window";
import PopUpAttachmentsWindow from "./PopUpAttachmentsWindow";

type IWindow = {
  setVisible(t: boolean): void;
  modal?: boolean;
};

const DATA_ITEM_KEY = "num";
let deletedMainRows: object[] = [];
let temp = 0;

export const FormContext = createContext<{
  attdatnum: string;
  is_attached: string;
  setAttdatnum: (d: any) => void;
  setIs_attached: (d: any) => void;
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
  const { setAttdatnum, setIs_attached } = useContext(FormContext);
  let isInEdit = field == dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";

  const handleChange = (e: InputChangeEvent) => {
    if (onChange) {
      onChange({
        dataIndex: 0,
        dataItem: dataItem,
        field: field,
        syntheticEvent: e.syntheticEvent,
        value: e.target.value ?? "",
      });
    }
  };

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const onAttWndClick2 = () => {
    setAttachmentsWindowVisible(true);
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    setAttdatnum(data.attdatnum);
    setIs_attached(data.rowCount > 0 ? "Y" : "N");
  };

  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      <div style={{ textAlign: "center", marginRight: "10px" }}>
        {dataItem.is_attached == "Y" ? (
          <span className="k-icon k-i-file k-icon-md"></span>
        ) : (
          ""
        )}
      </div>
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
        <PopUpAttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={dataItem.attdatnum}
          modal={true}
        />
      )}
    </>
  );
};

const HelpWindow = ({ setVisible, modal = false }: IWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  // 삭제할 첨부파일 리스트를 담는 함수
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );
  const [loginResult] = useRecoilState(loginResultState);
  const serviceCategory = loginResult ? loginResult.serviceCategory : "";
  const defaultCulture = loginResult ? loginResult.defaultCulture : "";

  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 830) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 900) / 2,
    width: isMobile == true ? deviceWidth : 830,
    height: isMobile == true ? deviceHeight : 900,
  });
  const [menulist, setMenuList] = useRecoilState(menuList);

  const onClose = () => {
    setVisible(false);
  };

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

  const idGetter = getter(DATA_ITEM_KEY);

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

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  let gridRef: any = useRef(null);

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const pathname: string = window.location.pathname.replace("/", "");

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "list",
    orgdiv: orgdiv,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const menu_id = menulist.filter((item) => item.formId == pathname)[0];
  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "sys_sel_help_comments",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_menu_id": menu_id != undefined ? menu_id.menuId : "",
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
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

  const [url, setUrl] = useState("");

  //그리드 데이터 조회
  const fetchmanualGrid = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    const parameters = {
      para:
        pathname +
        "_" +
        (menu_id != undefined ? menu_id.menuId : "") +
        "_" +
        defaultCulture +
        ".pdf",
    };

    try {
      data = await processApi<any>("manual-list", parameters);
    } catch (error) {
      data = null;
    }

    if (data != null) {
      const byteCharacters = atob(data.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      setUrl(URL.createObjectURL(blob));
    } else {
      //데이터 없을 경우
      setUrl("");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchmanualGrid();
  }, []);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult.data[Math.min(...Object2)];
    } else {
      data = mainDataResult.data[Math.min(...Object) - 1];
    }

    setMainDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState({
        [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
      });
    }
  };

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      menu_id: menu_id != undefined ? menu_id.menuId : "",
      guid: uuidv4(),
      contents: "",
      orgdiv: filters.orgdiv,
      attdatnum: "",
      files: "",
      rowstatus: "N",
    };

    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
    setPage((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  //계획 저장 파라미터 초기값
  const [paraDataSaved, setParaDataSaved] = useState({
    work_type: "",
    rowstatus: "",
    guid: "",
    contents: "",
    attdatnum: "",
    user_id: "",
  });

  const pc = UseGetValueFromSessionItem("pc");

  const onSaveClick = () => {
    const dataItem: { [name: string]: any } = mainDataResult.data.filter(
      (item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      }
    );
    if (dataItem.length == 0 && deletedMainRows.length == 0) return false;

    type TData = {
      rowstatus: string[];
      guid: string[];
      contents: string[];
      attdatnum: string[];
      user_id: string[];
    };

    let dataArr: TData = {
      rowstatus: [],
      guid: [],
      contents: [],
      attdatnum: [],
      user_id: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const { guid, rowstatus, contents, seq, attdatnum, user_id } = item;

      dataArr.rowstatus.push(rowstatus);
      dataArr.guid.push(guid);
      dataArr.contents.push(contents);
      dataArr.attdatnum.push(attdatnum);
      dataArr.user_id.push(user_id);
    });

    deletedMainRows.forEach((item: any, idx: number) => {
      const { guid, rowstatus, contents, seq, attdatnum, user_id } = item;

      dataArr.rowstatus.push(rowstatus);
      dataArr.guid.push(guid);
      dataArr.contents.push(contents);
      dataArr.attdatnum.push(attdatnum);
      dataArr.user_id.push(user_id);
    });

    setParaDataSaved((prev) => ({
      ...prev,
      work_type: "save",
      rowstatus: dataArr.rowstatus.join("|"),
      guid: dataArr.guid.join("|"),
      contents: dataArr.contents.join("|"),
      attdatnum: dataArr.attdatnum.join("|"),
      user_id: dataArr.user_id.join("|"),
    }));
  };

  const paraSaved: Iparameters = {
    procedureName: "sys_sav_help_comments",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataSaved.work_type,
      "@p_orgdiv": filters.orgdiv,
      "@p_menu_id": menu_id != undefined ? menu_id.menuId : "",
      "@p_row_status": paraDataSaved.rowstatus,
      "@p_guid": paraDataSaved.guid,
      "@p_contents": paraDataSaved.contents,
      "@p_attdatnum": paraDataSaved.attdatnum,
      "@p_user_id": paraDataSaved.user_id,
      "@p_pc": pc,
    },
  };

  const fetchGridSaved = async () => {
    let data: any;
    setLoading(true);

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
      let array: any[] = [];
      deletedMainRows.map((item: any) => {
        array.push(item.attdatnum);
      });
      setDeletedAttadatnums(array);

      setUnsavedAttadatnums([]);
      setUnsavedName([]);
      deletedMainRows = [];
    } else {
      alert(data.resultMessage);
    }

    //초기화
    setParaDataSaved((prev) => ({ ...prev, work_type: "" }));

    setLoading(false);
  };

  useEffect(() => {
    if (paraDataSaved.work_type !== "") fetchGridSaved();
  }, [paraDataSaved]);

  // 비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_sysUserMaster_001", setBizComponentData);

  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);

  // 그룹 카테고리 조회
  useEffect(() => {
    if (bizComponentData !== null) {
      setUserListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
    }
  }, [bizComponentData]);

  const [attdatnum, setAttdatnum] = useState<string>("");
  const [is_attached, setIs_attached] = useState<string>("");

  useEffect(() => {
    const datas = mainDataResult.data.filter(
      (item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
    )[0];
    if (datas != undefined) {
      if (is_attached == "N") {
        setUnsavedAttadatnums((prev: any) => [...prev, attdatnum]);
      }
    }

    const newData = mainDataResult.data.map((item) =>
      item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        ? {
            ...item,
            attdatnum: is_attached == "N" ? "" : attdatnum,
            is_attached: is_attached,
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
  }, [attdatnum, is_attached]);

  const onItemChange = (event: GridItemChangeEvent) => {
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
    if (
      field != "rowstatus" &&
      field != "update_userid" &&
      field != "update_time"
    ) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult((prev: { total: any }) => {
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
      setTempResult((prev: { total: any }) => {
        return {
          data: mainDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != mainDataResult.data) {
      const newData = mainDataResult.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
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
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const excelInput: any = useRef();

  const upload = () => {
    const uploadInput = document.getElementById("uploadAttachmentManual");
    uploadInput!.click();
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (files == null) return false;
    setLoading(true);

    let data: any;

    const parameters = {
      para:
        pathname +
        "_" +
        (menu_id != undefined ? menu_id.menuId : "") +
        "_" +
        defaultCulture +
        ".pdf",
      file: files[0], //.FileList,
    };

    try {
      data = await processApi<any>("manual-upload", parameters);
    } catch (error) {
      data = null;
    }

    fetchmanualGrid();
    setLoading(false);
  };

  const questionToDelete = useSysMessage("QuestionToDelete");
  const handleDelete = async () => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    let data: any;

    const parameters = {
      para:
        pathname +
        "_" +
        (menu_id != undefined ? menu_id.menuId : "") +
        "_" +
        defaultCulture +
        ".pdf",
    };

    try {
      data = await processApi<any>("manual-delete", parameters);
    } catch (error) {
      data = null;
    }

    fetchmanualGrid();
  };

  return (
    <Window
      titles={"도움말"}
      positions={position}
      Close={onClose}
      modals={modal}
      className="print-hidden"
    >
      <TitleContainer>
        <Title>메뉴얼</Title>
      </TitleContainer>
      <div
        style={{
          height: position.height - 570,
          marginBottom: "10px",
        }}
      >
        {url != "" ? <FileViewers fileUrl={url} /> : ""}
      </div>
      <FormContext.Provider
        value={{
          attdatnum,
          is_attached,
          setAttdatnum,
          setIs_attached,
          mainDataState,
          setMainDataState,
          // fetchGrid,
        }}
      >
        <GridContainer>
          <GridTitleContainer>
            <GridTitle>코멘트</GridTitle>
            <ButtonContainer>
              <Button
                onClick={onAddClick}
                themeColor={"primary"}
                icon="plus"
                title="행 추가"
              ></Button>
              <Button
                onClick={onDeleteClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="minus"
                title="행 삭제"
              ></Button>
              <Button
                onClick={onSaveClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="save"
              ></Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: "300px" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                update_userid: userListData.find(
                  (items: any) => items.user_id == row.update_userid
                )?.user_name,
                [SELECTED_FIELD]: selectedState[idGetter(row)],
              })),
              mainDataState
            )}
            {...mainDataState}
            onDataStateChange={onMainDataStateChange}
            //선택 기능
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
            onItemChange={onItemChange}
            cellRender={customCellRender}
            rowRender={customRowRender}
            editField={EDIT_FIELD}
          >
            <GridColumn field="rowstatus" title=" " width="50px" />
            <GridColumn
              field="contents"
              title="내용"
              width="250px"
              footerCell={mainTotalFooterCell}
            />
            <GridColumn
              field="is_attached"
              title="첨부"
              width="120px"
              cell={ColumnCommandCell}
            />
            <GridColumn
              field="update_userid"
              title="마지막 수정자"
              width="120px"
            />
            <GridColumn
              field="update_time"
              title="마지막 수정일시"
              width="150px"
            />
          </Grid>
        </GridContainer>
      </FormContext.Provider>
      <BottomContainer>
        <ButtonContainer>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            닫기
          </Button>
        </ButtonContainer>
        {serviceCategory == "MANAGEMENT" ? (
          <div>
            <Button
              themeColor={"primary"}
              onClick={upload}
              style={{ marginRight: "10px" }}
            >
              업로드
              <input
                id="uploadAttachmentManual"
                style={{ display: "none" }}
                type="file"
                accept="application/pdf"
                ref={excelInput}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  handleFileUpload(event.target.files);
                }}
              />
            </Button>
            <Button
              themeColor={"primary"}
              fillMode={"outline"}
              onClick={handleDelete}
            >
              삭제
            </Button>
          </div>
        ) : (
          ""
        )}
      </BottomContainer>
    </Window>
  );
};

export default HelpWindow;
