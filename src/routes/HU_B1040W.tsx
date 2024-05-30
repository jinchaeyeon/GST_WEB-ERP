import { DataResult, State, getter, process } from "@progress/kendo-data-query";
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
import { Input } from "@progress/kendo-react-inputs";
import React, { useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
  Title,
  TitleContainer
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CheckBoxReadOnlyCell from "../components/Cells/CheckBoxReadOnlyCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import RadioGroupCell from "../components/Cells/RadioGroupCell";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
  getBizCom,
  getGridItemChangedData,
  handleKeyPressSearch,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { useApi } from "../hooks/api";
import { heightstate, isLoading, isMobileState } from "../store/atoms";
import { gridList } from "../store/columns/HU_B1040W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
let targetRowIndex: null | number = null;

const dateField = [
  "regorgdt",
  "birdt",
  "imdate",
  "firredt",
  "rtrdt",
  "meddate",
  "anudate",
  "marrydt",
  "exstartdt",
  "exenddt",
  "hirdate",
];
const numberField = [
  "anlslry",
  "agenum",
  "sptnum",
  "dfmnum",
  "brngchlnum",
  "fam1",
  "fam2",
  "monpay",
  "bnsstd",
  "rate",
  "daypay",
  "dailypay",
  "timepay",
  "overtimepay",
  "toutpay",
  "childnum",
  "height",
  "weight",
  "leye",
];
const checkReadField = [
  "wmn",
  "spf",
  "directyn",
  "laboryn",
  "dfmyn",
  "milyn",
  "hirinsuyn",
  "caltaxyn",
  "yrdclyn",
  "sps",
  "notaxe",
  "bnskind",
  "dfmyn2",
  "marriage",
];
const CustomRadioField = ["bircd", "sexcd", "houseyn"];

const CustomRadioCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("R_HOUSEYN, R_BIRCD, R_SEXCD", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "bircd"
      ? "R_BIRCD"
      : field == "sexcd"
      ? "R_SEXCD"
      : field == "houseyn"
      ? "R_HOUSEYN"
      : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <RadioGroupCell bizComponentData={bizComponent} {...props} />
  ) : (
    <td />
  );
};

const HU_B1040W: React.FC = () => {
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  const [isMobile, setIsMobile] = useRecoilState(isMobileState);

  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("HU_B1040W", setCustomOptionData);
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        rtrchk: defaultOption.find((item: any) => item.id == "rtrchk")
          ?.valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent(
    "L_HU029, L_HU028, L_HU024, L_HU023, L_HU012, L_HU006, L_HU007, L_HU076, L_HU075, L_HU037, L_dptcd_001, L_BA057, L_BA028, L_BA002, L_BA001, L_HU005",
    setBizComponentData
  );

  const [postcdListData, setpostcdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [orgdivListData, setOrgdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [locationListData, setLocationListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [positionListData, setPositionListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [nationcdListData, setNationcdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [dptcdListData, setdptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [ocptcdListData, setOcptcdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [workgbListData, setWorkgbListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [workclsListData, setWorkclsListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [jobcdListData, setJobcdListData] = useState([COM_CODE_DEFAULT_VALUE]);
  const [abilcdListData, setAbilcdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [regcdListData, setRegcdListData] = useState([COM_CODE_DEFAULT_VALUE]);
  const [rtrrsnListData, setRtrrsnListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [emptypeListData, setEmptypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [paycdListData, setPaycdListData] = useState([COM_CODE_DEFAULT_VALUE]);
  const [taxcdListData, setTaxcdListData] = useState([COM_CODE_DEFAULT_VALUE]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setdptcdListData(getBizCom(bizComponentData, "L_dptcd_001"));
      setpostcdListData(getBizCom(bizComponentData, "L_HU005"));
      setOrgdivListData(getBizCom(bizComponentData, "L_BA001"));
      setLocationListData(getBizCom(bizComponentData, "L_BA002"));
      setPositionListData(getBizCom(bizComponentData, "L_BA028"));
      setNationcdListData(getBizCom(bizComponentData, "L_BA057"));
      setOcptcdListData(getBizCom(bizComponentData, "L_HU037"));
      setWorkgbListData(getBizCom(bizComponentData, "L_HU075"));
      setWorkclsListData(getBizCom(bizComponentData, "L_HU076"));
      setJobcdListData(getBizCom(bizComponentData, "L_HU007"));
      setAbilcdListData(getBizCom(bizComponentData, "L_HU006"));
      setRegcdListData(getBizCom(bizComponentData, "L_HU012"));
      setRtrrsnListData(getBizCom(bizComponentData, "L_HU023"));
      setEmptypeListData(getBizCom(bizComponentData, "L_HU024"));
      setPaycdListData(getBizCom(bizComponentData, "L_HU028"));
      setTaxcdListData(getBizCom(bizComponentData, "L_HU029"));
    }
  }, [bizComponentData]);

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

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    prsnnum: "",
    prsnnm: "",
    rtrchk: "%",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_B1040W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "Q",
        "@p_orgdiv": filters.orgdiv,
        "@p_prsnnum": filters.prsnnum,
        "@p_prsnnm": filters.prsnnm,
        "@p_rtrchk": filters.rtrchk,
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

  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "기본정보";
      _export.save(optionsGridOne);
    }
  };

  const search = () => {
    resetAllGrid();
    setPage(initialPageState); // 페이지 초기화
    setFilters((prev: any) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setMainDataResult(process([], mainDataState));
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

  return (
    <>
      <TitleContainer>
        <Title>인사상세조회</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="HU_B1040W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>사번</th>
              <td>
                <Input
                  name="prsnnum"
                  type="text"
                  value={filters.prsnnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>성명</th>
              <td>
                <Input
                  name="prsnnm"
                  type="text"
                  value={filters.prsnnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>재직여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="rtrchk"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainer
        style={{
          width: isMobile ? "100%" : "100%",
          overflow: "auto",
        }}
      >
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
          fileName="인사상세조회"
        >
          <Grid
            style={{
              height: isMobile ? deviceHeight : "83vh",
            }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                postcd: postcdListData.find(
                  (item: any) => item.sub_code == row.postcd
                )?.code_name,
                orgdiv: orgdivListData.find(
                  (item: any) => item.sub_code == row.orgdiv
                )?.code_name,
                location: locationListData.find(
                  (item: any) => item.sub_code == row.location
                )?.code_name,
                position: positionListData.find(
                  (item: any) => item.sub_code == row.position
                )?.code_name,
                nationcd: nationcdListData.find(
                  (item: any) => item.sub_code == row.nationcd
                )?.code_name,
                dptcd: dptcdListData.find(
                  (item: any) => item.dptcd == row.dptcd
                )?.dptnm,
                ocptcd: ocptcdListData.find(
                  (item: any) => item.sub_code == row.ocptcd
                )?.code_name,
                workgb: workgbListData.find(
                  (item: any) => item.sub_code == row.workgb
                )?.code_name,
                workcls: workclsListData.find(
                  (item: any) => item.sub_code == row.workcls
                )?.code_name,
                jobcd: jobcdListData.find(
                  (item: any) => item.sub_code == row.jobcd
                )?.code_name,
                abilcd: abilcdListData.find(
                  (item: any) => item.sub_code == row.abilcd
                )?.code_name,
                regcd: regcdListData.find(
                  (item: any) => item.sub_code == row.regcd
                )?.code_name,
                rtrrsn: rtrrsnListData.find(
                  (item: any) => item.sub_code == row.rtrrsn
                )?.code_name,
                emptype: emptypeListData.find(
                  (item: any) => item.sub_code == row.emptype
                )?.code_name,
                paycd: paycdListData.find(
                  (item: any) => item.sub_code == row.paycd
                )?.code_name,
                taxcd: taxcdListData.find(
                  (item: any) => item.sub_code == row.taxcd
                )?.code_name,
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
            onItemChange={onMainItemChange}
            cellRender={customCellRender}
            rowRender={customRowRender}
            editField={EDIT_FIELD}
          >
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList"]?.map(
                (item: any, idx: number) =>
                  item.sortOrder !== -1 && (
                    <GridColumn
                      key={idx}
                      field={item.fieldName}
                      title={item.caption}
                      width={item.width}
                      cell={
                        numberField.includes(item.fieldName)
                          ? NumberCell
                          : dateField.includes(item.fieldName)
                          ? DateCell
                          : checkReadField.includes(item.fieldName)
                          ? CheckBoxReadOnlyCell
                          : CustomRadioField.includes(item.fieldName)
                          ? CustomRadioCell
                          : undefined
                      }
                      footerCell={
                        item.sortOrder == 0 ? mainTotalFooterCell : undefined
                      }
                    ></GridColumn>
                  )
              )}
          </Grid>
        </ExcelExport>
      </GridContainer>
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

export default HU_B1040W;
