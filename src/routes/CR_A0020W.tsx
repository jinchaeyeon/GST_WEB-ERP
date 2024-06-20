import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
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
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
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
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  getDeviceHeight,
  getHeight,
  handleKeyPressSearch,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import { CellRender } from "../components/Renderers/Renderers";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";

import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

import ExcelUploadButton from "../components/Buttons/ExcelUploadButton";
import CR_A0020W_Window from "../components/Windows/CR_A0020W_Window";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import { gridList } from "../store/columns/CR_A0020W_C";

//그리드 별 키 필드값
const DATA_ITEM_KEY = "num";

let targetRowIndex: null | number = null;

const CustomField: string[] = ["owner", "species", "gender", "class"];

const checkField: string[] = [];

const DateField: string[] = ["birdt"];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  // 사용자구분, 사업장, 사업부, 부서코드, 직위, 공개범위
  UseBizComponent("L_BA310, L_SEXCD, L_BA320, L_USERS_EX", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "class"
      ? "L_BA310"
      : field == "gender"
      ? "L_SEXCD"
      : field == "species"
      ? "L_BA320"
      : field == "owner"
      ? "L_USERS_EX"
      : "";

  const textField =
    field == "owner" ? "name" : field == "gender" ? "name" : undefined;
  const valueField =
    field == "owner" ? "code" : field == "gender" ? "code" : undefined;

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField={textField}
      valueField={valueField}
      {...props}
    />
  ) : (
    <td></td>
  );
};

let workType: string = "";

var height = 0;
var height2 = 0;

const CR_A0020W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("CR_A0020W", setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".TitleContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2);
        setWebHeight(getDeviceHeight(true) - height - height2);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight]);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const location = UseGetValueFromSessionItem("location");

  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("CR_A0020W", setMessagesData);

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

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_BA310", setBizComponentData);

  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  //선택 상태
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [DetailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);

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
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "Q",
    orgdiv: orgdiv,
    manager: "",
    species: "",
    custnm: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  let gridRef: any = useRef(null);

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_CR_A0020W_Q ",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_manager": filters.manager,
        "@p_species": filters.species,
        "@p_custcd": "",
        "@p_custnm": filters.custnm,
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

      if (totalRowCnt > 0) {
        if (filters.find_row_value !== "") {
          // find_row_value 행으로 스크롤 이동
          if (gridRef.current) {
            const findRowIndex = rows.findIndex(
              (row: any) => row.custcd == filters.find_row_value
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

        setMainDataResult(() => {
          return {
            data: rows,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
        if (totalRowCnt > 0) {
          const selectedRow =
            filters.find_row_value == ""
              ? rows[0]
              : rows.find((row: any) => row.custcd == filters.find_row_value);

          if (selectedRow != undefined) {
            setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          } else {
            setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          }
        }
      }
    } else {
      console.log("[에러발생]");
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

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "반려견 리스트";
      _export.save(optionsGridOne);
    }
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
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

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

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

  const enterEdit = (dataItem: any, field: string) => {};

  const customCellRender = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit}
      editField={EDIT_FIELD}
    />
  );

  const search = () => {
    resetAllGrid();
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };

  const onClickNew = () => {
    workType = "N";
    setDetailWindowVisible(true);
  };

  const onClickDelete = async () => {
    if (!permissions.delete) return;
    if (!window.confirm("선택한 데이터를 삭제하시겠습니까?")) {
      return;
    }

    let data: any;
    setLoading(true);

    //프로시저 파라미터
    const paraSaved: Iparameters = {
      procedureName: "P_CR_A0020W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": "D",
        "@p_orgdiv": orgdiv,
        "@p_custcd": mainDataResult.data.find(
          (x) => idGetter(x) == Object.getOwnPropertyNames(selectedState)[0]
        ).custcd,
        "@p_location": "",
        "@p_custnm": "",
        "@p_class": "",
        "@p_owner": "",
        "@p_species": "",
        "@p_gender": "",
        "@p_age": 0,
        "@p_manager": "",
        "@p_strdt": "",
        "@p_enddt": "",
        "@p_dayofweek": "",
        "@p_birdt": "",
        "@p_bircd": "",
        "@p_useyn": "",
        "@p_color": "",
        "@p_remark": "",
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "CR_A0020W",
      },
    };

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess == true) {
      const isLastDataDeleted =
        mainDataResult.data.length == 1 && filters.pgNum > 0;

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
          pgNum: prev.pgNum != 1 ? prev.pgNum - 1 : prev.pgNum,
          isSearch: true,
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          isSearch: true,
        }));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);

      alert(data.resultMessage);
    }

    setLoading(false);
  };

  const ColumnCommandCell = (props: GridCellProps) => {
    const { render, dataItem } = props;

    const onAccountWndClick = () => {
      setSelectedState({ [dataItem[DATA_ITEM_KEY]]: true });

      workType = "U";
      setDetailWindowVisible(true);
    };

    const defaultRendering = (
      <td className="k-command-cell">
        <Button
          className="k-grid-edit-command"
          onClick={onAccountWndClick}
          themeColor="primary"
          icon="edit"
          fillMode="outline"
        />
      </td>
    );

    return (
      <>
        {render == undefined
          ? null
          : render?.call(undefined, defaultRendering, props)}
      </>
    );
  };

  const saveExcel = (jsonArr: any[]) => {
    if (!permissions.save) return;
    if (jsonArr.length == 0) {
      alert("데이터가 없습니다.");
      return;
    }

    const columns: string[] = [
      "반려견ID",
      "반려견명",
      "반려인ID",
      "반",
      "담당자ID",
      "월",
      "화",
      "수",
      "목",
      "금",
    ];

    setLoading(true);

    let valid = true;

    jsonArr.map((items: any) => {
      Object.keys(items).map((item: any) => {
        if (!columns.includes(item) && valid == true) {
          alert("양식이 맞지 않습니다.");
          valid = false;
          return;
        }
      });
    });

    // let temp = 0;
    // mainDataResult.data.map((item) => {
    //   if (item.num > temp) {
    //     temp = item.num;
    //   }
    // });

    const bizComponent: any = bizComponentData.find(
      (item: any) => item.bizComponentId == "L_BA310"
    );

    let isSuccess: boolean = true;
    let errorMessage: string = "";
    let returnString: string = "";
    jsonArr.forEach(async (item: any) => {
      const {
        반려견ID = "",
        반려견명 = "",
        반려인ID = "",
        반 = "",
        담당자ID = "",
      } = item;

      const classCode = bizComponent
        ? bizComponent.data.Rows.find((x: any) => x.code_name == 반).sub_code
        : "";

      //프로시저 파라미터
      const paraSaved: Iparameters = {
        procedureName: "P_CR_A0020W_S",
        pageNumber: 0,
        pageSize: 0,
        parameters: {
          "@p_work_type": "N",
          "@p_orgdiv": orgdiv,
          "@p_custcd": 반려견ID,
          "@p_location": location,
          "@p_custnm": 반려견명,
          "@p_class": classCode,
          "@p_owner": 반려인ID,
          "@p_species": "",
          "@p_gender": "",
          "@p_age": 0,
          "@p_manager": 담당자ID,
          "@p_strdt": convertDateToStr(new Date()),
          "@p_enddt": "",
          "@p_dayofweek": "",
          "@p_birdt": "",
          "@p_bircd": "",
          "@p_useyn": "Y",
          "@p_color": "",
          "@p_remark": "",
          "@p_userid": userId,
          "@p_pc": pc,
          "@p_form_id": "CR_A0020W",
        },
      };

      let data: any;
      try {
        data = await processApi<any>("procedure", paraSaved);
      } catch (error) {
        data = null;
      }

      if (data.isSuccess == true) {
        returnString = data.returnString;
      } else {
        console.log("[오류 발생]");
        console.log(data);

        isSuccess = false;
        errorMessage = data.resultMessage;
      }
    });

    if (isSuccess) {
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: returnString,
        isSearch: true,
      })); // 한번만 조회되도록
    } else {
      alert(errorMessage);
    }

    setLoading(false);
  };

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>반려견 정보</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="CR_A0020W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>그룹</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    type="query"
                    name="species"
                    value={filters.species}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>담당자</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    type="query"
                    name="manager"
                    value={filters.manager}
                    customOptionData={customOptionData}
                    valueField="code"
                    textField="name"
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>반려견명</th>
              <td colSpan={3}>
                <Input
                  name="custnm"
                  type="text"
                  value={filters.custnm}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainer style={{ width: "100%" }}>
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
          fileName="반려견 정보"
        >
          <GridTitleContainer className="ButtonContainer">
            <GridTitle>반려견 리스트</GridTitle>
            {permissions && (
              <ButtonContainer>
                <ExcelUploadButton
                  saveExcel={saveExcel}
                  permissions={permissions}
                  style={{ marginLeft: "15px" }}
                />
                <Button
                  title="Export Excel"
                  onClick={onAttachmentsWndClick}
                  icon="file"
                  fillMode="outline"
                  themeColor={"primary"}
                >
                  엑셀양식
                </Button>
                <Button
                  onClick={onClickNew}
                  icon="file-add"
                  themeColor={"primary"}
                >
                  신규
                </Button>
                <Button
                  onClick={onClickDelete}
                  icon="delete"
                  themeColor={"primary"}
                  fillMode={"outline"}
                >
                  삭제
                </Button>
              </ButtonContainer>
            )}
          </GridTitleContainer>
          <Grid
            style={{ height: isMobile ? mobileheight : webheight }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
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
            onSelectionChange={onMainSelectionChange}
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
            // //incell 수정 기능
            // onItemChange={onMainItemChange}
            cellRender={customCellRender} // Input 외 셀 표시하려면 필요함
            // rowRender={customRowRender}
            // editField={EDIT_FIELD}
          >
            <GridColumn cell={ColumnCommandCell} width="50px" />
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList"]
                ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                ?.map((item: any, idx: number) => {
                  return (
                    item.sortOrder !== -1 && (
                      <GridColumn
                        key={idx}
                        id={item.id}
                        field={item.fieldName}
                        title={item.caption}
                        width={item.width}
                        cell={
                          CustomField.includes(item.fieldName)
                            ? CustomComboBoxCell
                            : checkField.includes(item.fieldName)
                            ? CheckBoxCell
                            : DateField.includes(item.fieldName)
                            ? DateCell
                            : undefined
                        }
                        headerCell={undefined}
                        className={undefined}
                        footerCell={
                          item.sortOrder == 0 ? mainTotalFooterCell : undefined
                        }
                        editable={false}
                      />
                    )
                  );
                })}
          </Grid>
        </ExcelExport>
      </GridContainer>
      {/* 컨트롤 네임 불러오기 용 */}
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
      {DetailWindowVisible && (
        <CR_A0020W_Window
          setVisible={setDetailWindowVisible}
          setFilters={setFilters}
          workType={workType}
          orgdiv={orgdiv}
          custcd={
            mainDataResult.data.find(
              (x) => idGetter(x) == Object.getOwnPropertyNames(selectedState)[0]
            )?.custcd ?? ""
          }
          modal={true}
          pathname="CR_A0020W"
        />
      )}
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          para={"CR_A0020W"}
          modal={true}
          permission={{
            upload: permissions.save,
            download: permissions.view,
            delete: permissions.save,
          }}
        />
      )}
    </>
  );
};

export default CR_A0020W;
