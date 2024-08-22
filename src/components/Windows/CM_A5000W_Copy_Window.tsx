import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  MultiSelect,
  MultiSelectChangeEvent,
} from "@progress/kendo-react-dropdowns";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridRowDoubleClickEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  StatusIcon,
  Title,
  TitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { ICustData, IWindowPosition } from "../../hooks/interfaces";
import { isFilterHideState2, isLoading } from "../../store/atoms";
import { gridList } from "../../store/columns/CM_A5000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../../store/types";
import CheckBoxReadOnlyCell from "../Cells/CheckBoxReadOnlyCell";
import DateCell from "../Cells/DateCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
  convertDateToStr,
  getBizCom,
  getGridItemChangedData,
  getHeight,
  getWindowDeviceHeight,
  handleKeyPressSearch,
  setDefaultDate
} from "../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../CommonString";
import WindowFilterContainer from "../Containers/WindowFilterContainer";
import CommonDateRangePicker from "../DateRangePicker/CommonDateRangePicker";
import CustomOptionRadioGroup from "../RadioGroups/CustomOptionRadioGroup";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import PrsnnumWindow from "./CommonWindows/PrsnnumWindow";
import Window from "./WindowComponent/Window";

const DATA_ITEM_KEY = "num";
const DateField = ["request_date", "finexpdt", "completion_date"];
const StatusField = ["status"];
const checkboxField = ["is_emergency"];

const StatusCell = (props: GridCellProps) => {
  const { ariaColumnIndex, columnIndex, dataItem, field = "" } = props;

  return (
    <td
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ textAlign: "left", display: "flex", alignItems: "center" }}
    >
      <StatusIcon status={dataItem[field]} />
      {dataItem[field] == "001"
        ? "컨설팅 요청"
        : dataItem[field] == "002"
        ? "담당자지정"
        : dataItem[field] == "003"
        ? "요청취소"
        : dataItem[field] == "004"
        ? "대응불가"
        : dataItem[field] == "005"
        ? "검토 중"
        : dataItem[field] == "006"
        ? "답변 완료"
        : ""}
    </td>
  );
};
type TKendoWindow = {
  setVisible(isVisible: boolean): void;
  setData(data: object): void; //data : 선택한 품목 데이터를 전달하는 함수
  modal?: boolean;
};

interface IUser {
  user_id: string;
  user_name: string;
}

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;

const KendoWindow = ({
  setVisible,
  setData,
  modal = false
}: TKendoWindow) => {
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const pc = UseGetValueFromSessionItem("pc");

  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const idGetter = getter(DATA_ITEM_KEY);
  let gridRef: any = useRef(null);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;

  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1300) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 880) / 2,
    width: isMobile == true ? deviceWidth : 1300,
    height: isMobile == true ? deviceHeight : 880,
  });

  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [isFilterHideStates2, setisFilterHideStates2] =
    useRecoilState(isFilterHideState2);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".k-window-titlebar"); //공통 해더
      height2 = getHeight(".BottomContainer"); //하단 버튼부분
      height3 = getHeight(".WindowTitleContainer"); //조회버튼있는 title부분
      height4 = getHeight(".WindowButtonContainer");

      setMobileHeight(
        getWindowDeviceHeight(true, deviceHeight) -
          height -
          height2 -
          height3 -
          height4
      );
      setWebHeight(
        getWindowDeviceHeight(true, position.height) -
          height -
          height2 -
          height3 -
          height4
      );
    }
  }, [customOptionData]);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      getWindowDeviceHeight(true, position.height) -
        height -
        height2 -
        height3 -
        height4
    );
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
        dtgb1: defaultOption.find((item: any) => item.id == "dtgb1")?.valueCode,
        is_emergency: defaultOption.find(
          (item: any) => item.id == "is_emergency"
        )?.valueCode,
        materialtype: defaultOption.find(
          (item: any) => item.id == "materialtype"
        )?.valueCode,
        require_type: defaultOption.find(
          (item: any) => item.id == "require_type"
        )?.valueCode,
        extra_field2: defaultOption.find(
          (item: any) => item.id == "extra_field2"
        )?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  //비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_CM501_603, L_CM500_603_Q, L_CM501_603, L_CM502_603, L_SA001_603, L_CM503_603, L_sysUserMaster_001",
    setBizComponentData
  );
  // 의약품상세분류, 문의 분야

  // 물질분야
  const [materialtypeListData, setMaterialtypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [requireListData, setRequireListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [statusListData, setStatusListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [completion_methodListData, setCompletion_methodListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [extra_field2ListData, setExtra_field2ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setMaterialtypeListData(getBizCom(bizComponentData, "L_SA001_603"));
      setUserListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
      setStatusListData(getBizCom(bizComponentData, "L_CM500_603_Q"));
      setRequireListData(getBizCom(bizComponentData, "L_CM502_603"));
      setCompletion_methodListData(getBizCom(bizComponentData, "L_CM503_603"));
      setExtra_field2ListData(getBizCom(bizComponentData, "L_CM501_603"));
    }
  }, [bizComponentData]);

  const onClose = () => {
    setisFilterHideStates2(true);
    setVisible(false);
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
  };

  const filterMultiSelectChange = (event: MultiSelectChangeEvent) => {
    const values = event.value;
    const name = event.target.props.name ?? "";

    setFilters((prev) => ({
      ...prev,
      [name]: values,
    }));
  };

  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [prsnnumWindowVisible, setPrsnnumWindowVisible] =
    useState<boolean>(false);

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onPrsnnumWndClick = () => {
    setPrsnnumWindowVisible(true);
  };

  const setCustData = (data: ICustData) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        customer_code: data.custcd,
        custnm: data.custnm,
      };
    });
  };

  const setUserData = (data: IUser) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        user_id: data.user_id,
        user_name: data.user_name,
      };
    });
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

  // 조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    document_id: "",
    frdt: new Date(),
    todt: new Date(),
    dtgb1: "",
    status: [{ sub_code: "%", code_name: "전체" }],
    custnm: "",
    user_id: "",
    user_name: "",
    project: "",
    customer_code: "",
    materialtype: "",
    is_emergency: "Y",
    extra_field2: "",
    require_type: "",
    pgNum: 1,
    isSearch: false,
  });

  function getName(data: { sub_code: string }[]) {
    let str = "";
    data.map((item: { sub_code: string }) => (str += item.sub_code + "|"));
    return data.length > 0 ? str.slice(0, -1) : str;
  }

  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    const status =
      filters.status.length == 0
        ? getName(statusListData)
        : filters.status.length == 1
        ? filters.status[0].sub_code
        : getName(filters.status);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_CM_A5000W_Sub1_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_document_id": filters.document_id,
        "@p_dtgb": filters.dtgb1,
        "@p_status": status,
        "@p_extra_field2": filters.extra_field2,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_user_id": filters.user_id,
        "@p_user_name": filters.user_name,
        "@p_customer_code": filters.custnm == "" ? "" : filters.customer_code,
        "@p_customernm": filters.custnm,
        "@p_project": filters.project,
        "@p_materialtype": filters.materialtype,
        "@p_is_emergency": filters.is_emergency,
        "@p_require_type": filters.require_type,
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
      setFilters((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, bizComponentData, customOptionData]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState); // 페이지 초기화
    setMainDataResult(process([], mainDataState));
  };

  const search = () => {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        alert("날짜를 입력해주세요.");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        alert("날짜를 입력해주세요.");
      } else {
        resetAllGrid();
        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
      }
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  //그리드 푸터
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

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
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

  // 부모로 데이터 전달, 창 닫기 (여러 행을 추가하는 경우 Close 제외)
  const onConfirmBtnClick = (props: any) => {
    if (mainDataResult.total == 0) {
      alert("데이터가 없습니다.");
    } else {
      const selectedRowData = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      setData(selectedRowData);
      onClose();
    }
  };

  const onRowDoubleClick = (event: GridRowDoubleClickEvent) => {
    const selectedRowData = mainDataResult.data.find(
      (item) => item[DATA_ITEM_KEY] == event.dataItem.num
    );

    setData(selectedRowData);
    onClose();
  };

  return (
    <Window
      titles={"이전 요청 참조"}
      positions={position}
      Close={onClose}
      modals={modal}
      onChangePostion={onChangePostion}
    >
      <TitleContainer className="WindowTitleContainer">
        <Title></Title>
        <ButtonContainer>
          <Button
            onClick={() => search()}
            icon="search"
            themeColor={"primary"}
            disabled={permissions.view ? false : true}
          >
            조회
          </Button>
        </ButtonContainer>
      </TitleContainer>
      <WindowFilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>일자구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="dtgb1"
                    value={filters.dtgb1}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    valueField="code"
                    textField="name"
                    className="required"
                  />
                )}
              </td>
              <th>조회일자</th>
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
              <th>상태</th>
              <td>
                <MultiSelect
                  name="status"
                  data={statusListData}
                  onChange={filterMultiSelectChange}
                  value={filters.status}
                  textField="code_name"
                  dataItemKey="sub_code"
                />
              </td>
              <th>물질상세분야</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="extra_field2"
                    value={filters.extra_field2}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>영업담당자</th>
              <td>
                <Input
                  name="user_name"
                  type="text"
                  value={filters.user_name}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    type="button"
                    icon="more-horizontal"
                    fillMode="flat"
                    onClick={onPrsnnumWndClick}
                  />
                </ButtonInInput>
              </td>
              <th>업체명</th>
              <td>
                <Input
                  name="custnm"
                  type="text"
                  value={filters.custnm}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    type={"button"}
                    onClick={onCustWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>문의분야</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="require_type"
                    value={filters.require_type}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th></th>
              <td></td>
            </tr>
            <tr>
              <th>물질분야</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="materialtype"
                    value={filters.materialtype}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>긴급여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="is_emergency"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>PJT NO.</th>
              <td>
                <Input
                  name="project"
                  type="text"
                  value={filters.project}
                  onChange={filterInputChange}
                />
              </td>
              <th></th>
              <td></td>
            </tr>
          </tbody>
        </FilterBox>
      </WindowFilterContainer>
      <GridContainer>
        <GridTitleContainer className="WindowButtonContainer">
          <GridTitle>이전 요청 리스트</GridTitle>
        </GridTitleContainer>
        <Grid
          style={{ height: isMobile ? mobileheight : webheight }}
          data={process(
            mainDataResult.data.map((row) => ({
              ...row,
              person: userListData.find(
                (items: any) => items.user_id == row.person
              )?.user_name,
              require_type: requireListData.find(
                (items: any) => items.sub_code == row.require_type
              )?.code_name,
              materialtype: materialtypeListData.find(
                (items: any) => items.sub_code == row.materialtype
              )?.code_name,
              completion_method: completion_methodListData.find(
                (items: any) => items.sub_code == row.completion_method
              )?.code_name,
              extra_field2: extra_field2ListData.find(
                (items: any) => items.sub_code == row.extra_field2
              )?.code_name,
              [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
            })),
            mainDataState
          )}
          {...mainDataState}
          onDataStateChange={onMainDataStateChange}
          onRowDoubleClick={onRowDoubleClick}
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
          editField={EDIT_FIELD}
        >
          {customOptionData !== null &&
            customOptionData.menuCustomColumnOptions["grdList"]?.map(
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
                        : StatusField.includes(item.fieldName)
                        ? StatusCell
                        : checkboxField.includes(item.fieldName)
                        ? CheckBoxReadOnlyCell
                        : undefined
                    }
                    footerCell={
                      item.sortOrder == 0 ? mainTotalFooterCell : undefined
                    }
                  />
                )
            )}
        </Grid>
      </GridContainer>
      <BottomContainer className="BottomContainer">
        <ButtonContainer>
          <Button themeColor={"primary"} onClick={onConfirmBtnClick}>
            확인
          </Button>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
        />
      )}
      {prsnnumWindowVisible && (
        <PrsnnumWindow
          setVisible={setPrsnnumWindowVisible}
          workType={"N"}
          setData={setUserData}
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
    </Window>
  );
};

export default KendoWindow;
