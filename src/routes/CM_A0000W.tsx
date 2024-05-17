import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CenterCell from "../components/Cells/CenterCell";
import CheckBoxReadOnlyCell from "../components/Cells/CheckBoxReadOnlyCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UseParaPc,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  useSysMessage,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import DetailWindow from "../components/Windows/CM_A0000W_Window";
import DetailWindow2 from "../components/Windows/CM_A0000_301W_Window";
import { useApi } from "../hooks/api";
import {
  deletedAttadatnumsState,
  heightstate,
  isLoading,
} from "../store/atoms";
import { gridList } from "../store/columns/CM_A0000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const CheckBoxReadOnlyCellField = ["publish_yn"];
const DATA_ITEM_KEY = "num";
const CenterCellField = [
  "chooses_s",
  "loadok_s",
  "readok_s",
  "person",
  "publishdate",
];
let targetRowIndex: null | number = null;
const CM_A0000W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  const userId = UseGetValueFromSessionItem("user_id");
  UseParaPc(setPc);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  let deviceWidth = document.documentElement.clientWidth;
  let isMobile = deviceWidth <= 1200;
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  var height = 0;
  var container = document.querySelector(".ButtonContainer");
  if (container?.clientHeight != undefined) {
    height = container == undefined ? 0 : container.clientHeight;
  }
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  // 삭제할 첨부파일 리스트를 담는 함수
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("CM_A0000W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("CM_A0000W", setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        cbocategory: defaultOption.find((item: any) => item.id == "cbocategory")
          ?.valueCode,
        cboPerson: defaultOption.find((item: any) => item.id == "cboPerson")
          ?.valueCode,
        radPublish_yn: defaultOption.find(
          (item: any) => item.id == "radPublish_yn"
        )?.valueCode,
        cbodtgb: defaultOption.find((item: any) => item.id == "cbodtgb")
          ?.valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_SYS007,L_sysUserMaster_001,L_SYS2200_dt,R_FINYN",
    //공지사항 카테고리,담당자, 공지사항날짜(일자)구분, 라디오버튼
    setBizComponentData
  );

  //공통코드 리스트 조회 ()

  const [categoryListData, setCategoryListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [usersListData, setUsersListData] = useState([
    { user_id: "", user_name: "" },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const categoryQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_SYS007")
      );
      const usersQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_sysUserMaster_001"
        )
      );

      fetchQuery(categoryQueryStr, setCategoryListData);
      fetchQuery(usersQueryStr, setUsersListData);
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

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  //window
  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);
  const [detailWindowVisible2, setDetailWindowVisible2] =
    useState<boolean>(false);
  const CommandCell = (props: GridCellProps) => {
    const onEditClick = () => {
      //요약정보 행 클릭, 디테일 팝업 창 오픈 (수정용)
      const rowData = props.dataItem;

      setSelectedState({ [rowData[DATA_ITEM_KEY]]: true });

      const categories = categoryListData.find(
        (item: any) => item.code_name == rowData.category
      )?.sub_code;

      setDetailFilters((prev) => ({
        ...prev,
        location: rowData.location,
        datnum: rowData.datnum,
        category: categories == undefined ? "" : categories,
        pgNum: 1,
        find_row_value: "",
        isSearch: true,
      }));
      setWorkType("U");
      path.includes("localhost")
        ? //WEB ERP개발할떄 바꿀부분입니다.(setDetailWindowVisible: WEB ERP, setDetailWindowVisible2: DDGD)
          //setDetailWindowVisible2(true)
          setDetailWindowVisible(true)
        : path.split("/")[2].split(".")[1] == "ddgd"
        ? setDetailWindowVisible2(true)
        : setDetailWindowVisible(true);
    };

    return (
      <>
        {props.rowType == "groupHeader" ? null : (
          <td className="k-command-cell">
            <Button
              className="k-grid-edit-command"
              themeColor={"primary"}
              fillMode="outline"
              onClick={onEditClick}
              icon="edit"
            ></Button>
          </td>
        )}
      </>
    );
  };

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [workType, setWorkType] = useState<"N" | "U">("N");

  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    datnum: "",
    attdatnum: "",
  });

  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick = (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }
    if (mainDataResult.total > 0) {
      const data = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];
      setParaDataDeleted((prev) => ({
        ...prev,
        work_type: "D",
        datnum: data.datnum,
        attdatnum: data.attdatnum,
      }));
    } else {
      alert("데이터가 없습니다.");
    }
  };
  const path = window.location.href;

  const onAddClick = () => {
    setWorkType("N");
    path.includes("localhost")
      ? //WEB ERP개발할떄 바꿀부분입니다.
        //setDetailWindowVisible2(true)
        setDetailWindowVisible(true)
      : path.split("/")[2].split(".")[1] == "gsti"
      ? setDetailWindowVisible(true)
      : path.split("/")[2].split(".")[1] == "ddgd"
      ? setDetailWindowVisible2(true)
      : setDetailWindowVisible(true);
  };

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: any) => {
    const { name, value } = e;

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
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    cbocategory: "",
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    cboPerson: "",
    publishdate: new Date(),
    title: "",
    contents2: "",
    chooses_s: "",
    loadok_s: "",
    readok_s: "",
    cbodtgb: "C",
    datnum: "",
    radPublish_yn: "%",
    publish_start_date: new Date(),
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [detailFilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    location: sessionLocation,
    datnum: "",
    category: "",
    pgNum: 1,
    find_row_value: "",
    isSearch: true,
  });

  const paraDeleted: Iparameters = {
    procedureName: "P_CM_A0000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": "",
      "@p_datnum": paraDataDeleted.datnum,
      "@p_category": "",
      "@p_title": "",
      "@p_attdatnum": "",
      "@p_userid": userId,
      "@p_contents": "",
      "@p_publish_yn": "",
      "@p_publish_start_date": "",
      "@p_publish_end_date": "",
      "@p_person": "",
      "@p_pc": pc,
      "@p_person2": "",
      "@p_chooses": "",
      "@p_loadok": "",
      "@p_readok": "",
      "@p_form_id": "",
    },
  };

  const detailParameters: Iparameters = {
    procedureName: "P_CM_A0000W_Q",
    pageNumber: 1,
    pageSize: detailFilters.pgSize,
    parameters: {
      "@p_work_type": "Q",
      "@p_orgdiv": sessionOrgdiv,
      "@p_datnum": detailFilters.datnum,
      "@p_dtgb": filters.cbodtgb,
      "@p_frdt": convertDateToStr(filters.publish_start_date),
      "@p_category": detailFilters.category,
      "@p_title": "",
      "@p_yn": filters.radPublish_yn,
      "@p_attdatnum": "",
      "@p_userid": userId,
      "@p_newDiv": "N",
      "@p_find_row_value": filters.find_row_value,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_CM_A0000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "Q",
        "@p_orgdiv": sessionOrgdiv,
        "@p_datnum": filters.datnum,
        "@p_dtgb": filters.cbodtgb,
        "@p_frdt": convertDateToStr(filters.publish_start_date),
        "@p_category": filters.cbocategory,
        "@p_title": filters.title,
        "@p_yn": filters.radPublish_yn,
        "@p_attdatnum": "",
        "@p_userid": userId,
        "@p_newDiv": "N",
        "@p_find_row_value": filters.find_row_value,
      },
    };

    setLoading(true);
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
            (row: any) => row.datnum == filters.find_row_value
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
            : rows.find((row: any) => row.datnum == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setDetailFilters((prev) => ({
            ...prev,
            location: selectedRow.location,
            datnum: selectedRow.datnum,
            category: selectedRow.category,
            pgNum: 1,
            find_row_value: "",
            isSearch: true,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setDetailFilters((prev) => ({
            ...prev,
            location: rows[0].location,
            datnum: rows[0].datnum,
            category: rows[0].category,
            pgNum: 1,
            find_row_value: "",
            isSearch: true,
          }));
        }
      }
    }
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

  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const isLastDataDeleted =
        mainDataResult.data.length == 1 && filters.pgNum > 0;
      const findRowIndex = mainDataResult.data.findIndex(
        (row: any) => row.num == Object.getOwnPropertyNames(selectedState)[0]
      );
      // 첨부파일 삭제
      if (paraDataDeleted.attdatnum)
        setDeletedAttadatnums([paraDataDeleted.attdatnum]);

      resetAllGrid();

      if (isLastDataDeleted) {
        setPage({
          skip:
            filters.pgNum == 1 || filters.pgNum == 0
              ? 0
              : PAGE_SIZE * (filters.pgNum - 2),
          take: PAGE_SIZE,
        });

        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: isLastDataDeleted
            ? prev.pgNum != 1
              ? prev.pgNum - 1
              : prev.pgNum
            : prev.pgNum,
          isSearch: true,
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
          find_row_value:
            mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1].datnum,
          pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
          isSearch: true,
        }));
      }

      if (paraDataDeleted.attdatnum)
        setDeletedAttadatnums([paraDataDeleted.attdatnum]);
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    //초기화
    setParaDataDeleted((prev) => ({
      work_type: "",
      datnum: "",
      attdatnum: "",
    }));
  };

  useEffect(() => {
    if (paraDataDeleted.work_type == "D") fetchToDelete();
  }, [paraDataDeleted]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions !== null) {
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

  let gridRef: any = useRef(null);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setMainDataResult(process([], mainDataState));
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    const categories = categoryListData.find(
      (item: any) => item.code_name == selectedRowData.category
    )?.sub_code;

    setDetailFilters((prev) => ({
      ...prev,
      location: selectedRowData.location,
      datnum: selectedRowData.datnum,
      category: categories == undefined ? "" : categories,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
  };

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "요약정보";
      _export.save(optionsGridOne);
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

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

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    try {
      if (
        filters.cbodtgb == null ||
        filters.cbodtgb == undefined ||
        filters.cbodtgb == ""
      ) {
        throw findMessage(messagesData, "CM_A0000W_005");
      } else if (
        convertDateToStr(filters.publish_start_date).substring(0, 4) < "1997" ||
        convertDateToStr(filters.publish_start_date).substring(6, 8) > "31" ||
        convertDateToStr(filters.publish_start_date).substring(6, 8) < "01" ||
        convertDateToStr(filters.publish_start_date).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A0000W_006");
      } else {
        resetAllGrid();
        setPage(initialPageState); // 페이지 초기화
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>공지사항</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="CM_A0000W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>일자구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="cbodtgb"
                    value={filters.cbodtgb}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="기준일"
                    valueField="dtgb"
                    className="required"
                  />
                )}
              </td>
              <th>기준일자</th>
              <td>
                <DatePicker
                  name="publish_start_date"
                  value={filters.publish_start_date}
                  format="yyyy-MM-dd"
                  onChange={filterInputChange}
                  className="required"
                  placeholder=""
                />
              </td>

              <th></th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="cbocategory"
                    value={filters.cbocategory}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>제목</th>
              <td>
                <Input
                  name="contents2"
                  type="text"
                  value={filters.contents2}
                  onChange={filterInputChange}
                />
              </td>
              <th>공지사용여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="radPublish_yn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>문서번호</th>
              <td>
                <Input
                  name="datnum"
                  type="text"
                  value={filters.datnum}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>

      <GridContainer
        style={{ width: `${deviceWidth - 30}px`, overflow: "auto" }}
      >
        <GridTitleContainer className="ButtonContainer">
          <GridTitle>요약정보</GridTitle>
          <ButtonContainer>
            <Button onClick={onAddClick} themeColor={"primary"} icon="file-add">
              공지추가
            </Button>
            <Button
              onClick={onDeleteClick}
              icon="delete"
              fillMode="outline"
              themeColor={"primary"}
            >
              공지삭제
            </Button>
          </ButtonContainer>
        </GridTitleContainer>
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
          fileName="공지사항"
        >
          <Grid
            style={{
              height: isMobile ? deviceHeight - height : "76vh",
            }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                category: categoryListData.find(
                  (item: any) => item.sub_code == row.category
                )?.code_name,
                person: usersListData.find(
                  (item: any) => item.user_id == row.person
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
          >
            <GridColumn cell={CommandCell} width="50px" />
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList"]?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)?.map(
                (item: any, idx: number) =>
                  item.sortOrder !== -1 && (
                    <GridColumn
                      key={idx}
                      field={item.fieldName}
                      title={item.caption}
                      width={item.width}
                      cell={
                        CenterCellField.includes(item.fieldName)
                          ? CenterCell
                          : CheckBoxReadOnlyCellField.includes(item.fieldName)
                          ? CheckBoxReadOnlyCell
                          : undefined
                      }
                      footerCell={
                        item.sortOrder == 0 ? mainTotalFooterCell : undefined
                      }
                      locked={item.fixed == "None" ? false : true}
                    ></GridColumn>
                  )
              )}
          </Grid>
        </ExcelExport>
      </GridContainer>
      {detailWindowVisible && (
        <DetailWindow
          getVisible={setDetailWindowVisible}
          workType={workType} //신규 : N, 수정 : U
          datnum={detailFilters.datnum}
          categories={
            categoryListData.find(
              (item: any) => item.code_name == detailFilters.category
            )?.sub_code == undefined
              ? "100"
              : categoryListData.find(
                  (item: any) => item.code_name == detailFilters.category
                )?.sub_code
          }
          reloadData={(returnString: string) => {
            setFilters((prev) => ({
              ...prev,
              find_row_value: returnString,
              isSearch: true,
            }));
          }}
          para={detailParameters}
          modal={true}
          pathname="CM_A0000W"
        />
      )}
      {detailWindowVisible2 && (
        <DetailWindow2
          getVisible={setDetailWindowVisible2}
          workType={workType} //신규 : N, 수정 : U
          datnum={detailFilters.datnum}
          reloadData={(returnString: string) => {
            setFilters((prev) => ({
              ...prev,
              find_row_value: returnString,
              isSearch: true,
            }));
          }}
          para={detailParameters}
          modal={true}
          pathname="CM_A0000W"
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

export default CM_A0000W;
