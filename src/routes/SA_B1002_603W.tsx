import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import React, { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
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
  getHeight,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import ProjectsWindow from "../components/Windows/CM_A7000W_Project_Window";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import PrsnnumWindow from "../components/Windows/CommonWindows/PrsnnumWindow";

import { useLocation } from "react-router-dom";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { useApi } from "../hooks/api";
import { ICustData } from "../hooks/interfaces";
import { heightstate, isLoading } from "../store/atoms";
import { gridList } from "../store/columns/SA_B1002_603W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const dateField = ["cotracdt", "strdt", "enddt", "paydt"];
const numberField = [
  "totamt",
  "finalquowonamt",
  "quorev",
  "quounp",
  "margin",
  "discount",
  "itemcnt",
  "designcnt",
  "marginamt",
  "discountamt",
];

const SA_B1002_603W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  let isMobile = deviceWidth <= 1200;
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  var height = getHeight(".ButtonContainer");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("SA_B1002_603W", setCustomOptionData);
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("SA_B1002_603W", setMessagesData);
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
  const processApi = useApi();
  const DATA_ITEM_KEY = "num";
  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);

  const location = useLocation();

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
        materialtype: defaultOption.find(
          (item: any) => item.id == "materialtype"
        )?.valueCode,
        quocalyn: defaultOption.find((item: any) => item.id == "quocalyn")
          ?.valueCode,
        contractyn: defaultOption.find((item: any) => item.id == "contractyn")
          ?.valueCode,
        designyn: defaultOption.find((item: any) => item.id == "designyn")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "요약정보";
      _export.save(optionsGridOne);
    }
  };
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  //   물질분류, 영업담당자
  UseBizComponent("L_SA001_603, L_sysUserMaster_001", setBizComponentData);
  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [materialtypeListData, setMaterialtypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setUserListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
      setMaterialtypeListData(getBizCom(bizComponentData, "L_SA001_603"));
    }
  }, [bizComponentData]);

  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  // 조회조건
  const [filters, setFilters] = useState({
    orgdiv: sessionOrgdiv,
    frdt: new Date(),
    todt: new Date(),
    quokey: "",
    custcd: "",
    custnm: "",
    custprsnnm: "",
    contractyn: "",
    materialtype: "",
    extra_field2: "",
    chkperson: "",
    chkpersonnm: "",
    designyn: "",
    quocalyn: "",
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == "custnm") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        custcd: value == "" ? "" : prev.custcd,
      }));
    } else if (name == "chkpersonnm") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        chkperson: value == "" ? "" : prev.chkperson,
      }));
    } else if (name == "custprsnnm") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        custprsnnm: value == "" ? "" : prev.custprsnnm,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const [PrsnnumWindowVisible2, setPrsnnumWindowVisible2] =
    useState<boolean>(false);

  const onPrsnnumWndClick2 = () => {
    setPrsnnumWindowVisible2(true);
  };
  interface IPrsnnum {
    user_id: string;
    user_name: string;
  }

  const [projectWindowVisible, setProjectWindowVisible] =
    useState<boolean>(false);
  const onProejctWndClick = () => {
    setProjectWindowVisible(true);
  };

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const setProjectData = (data: any) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        quokey: data.quokey,
      };
    });
  };
  const setCustData = (data: ICustData) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        custcd: data.custcd,
        custnm: data.custnm,
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

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_B1002_603W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "LIST",
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_quokey": filters.quokey,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_custprsnnm": filters.custprsnnm,
        "@p_materialtype": filters.materialtype,
        "@p_extra_field2": filters.extra_field2,
        "@p_chkperson": filters.chkpersonnm == "" ? "" : filters.chkperson,
        "@p_chkpersonnm": filters.chkpersonnm,
        "@p_designyn": filters.designyn,
        "@p_quocalyn": filters.quocalyn,
        "@p_contractyn": filters.contractyn,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => {
        return {
          ...item,
          discount: Math.ceil(item.discount),
          discountamt: Math.ceil(item.discountamt),
          finalquowonamt: Math.ceil(item.finalquowonamt),
          margin: Math.ceil(item.margin),
          marginamt: Math.ceil(item.marginamt),
          quounp: Math.ceil(item.quounp),
        };
      });
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
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        pgNum: 1,
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  //그리드 리셋
  const resetAllGrid = () => {
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

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const setPrsnnumData2 = (data: IPrsnnum) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        chkpersonnm: data.user_name,
        chkperson: data.user_id,
      };
    });
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "SA_B1002_603W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "SA_B1002_603W_001");
      } else {
        resetAllGrid();
        setPage(initialPageState); // 페이지 초기화
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          isSearch: true,
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
      props.field !== undefined
        ? (sum = Math.ceil(item["total_" + props.field]))
        : ""
    );

    var parts = sum.toString().split(".");
    return parts[0] != "NaN" ? (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
      </td>
    ) : (
      <td></td>
    );
  };

  return (
    <>
      <TitleContainer>
        <Title>견적현황조회</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="SA_B1002_603W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>견적발행일</th>
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
              <th>PJT NO.</th>
              <td>
                <Input
                  name="quokey"
                  type="text"
                  value={filters.quokey}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    icon="more-horizontal"
                    fillMode="flat"
                    onClick={onProejctWndClick}
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
              <th>의뢰자</th>
              <td>
                <Input
                  name="custprsnnm"
                  type="text"
                  value={filters.custprsnnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>계약확정여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="contractyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
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
              <th>물질상세분야</th>
              <td>
                <Input
                  name="extra_field2"
                  type="text"
                  value={filters.extra_field2}
                  onChange={filterInputChange}
                />
              </td>
              <th>영업담당자</th>
              <td>
                <Input
                  name="chkpersonnm"
                  type="text"
                  value={filters.chkpersonnm}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    type="button"
                    icon="more-horizontal"
                    fillMode="flat"
                    onClick={onPrsnnumWndClick2}
                  />
                </ButtonInInput>
              </td>
              <th>디자인입력여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="designyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>견적산출여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="quocalyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainer>
        <GridTitleContainer className="ButtonContainer">
          <GridTitle>요약정보</GridTitle>
        </GridTitleContainer>
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
          fileName="견적현황조회"
        >
          <Grid
            style={{ height: isMobile ? deviceHeight - height : "70vh" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                materialtype: materialtypeListData.find(
                  (items: any) => items.sub_code == row.materialtype
                )?.code_name,
                chkperson: userListData.find(
                  (items: any) => items.user_id == row.chkperson
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
            //정렬기능
            sortable={true}
            onSortChange={onMainSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
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
                          dateField.includes(item.fieldName)
                            ? DateCell
                            : numberField.includes(item.fieldName)
                            ? NumberCell
                            : undefined
                        }
                        footerCell={
                          item.sortOrder == 0
                            ? mainTotalFooterCell
                            : numberField.includes(item.fieldName)
                            ? gridSumQtyFooterCell
                            : undefined
                        }
                      />
                    )
                )}
          </Grid>
        </ExcelExport>
      </GridContainer>
      {projectWindowVisible && (
        <ProjectsWindow
          setVisible={setProjectWindowVisible}
          setData={setProjectData}
          modal={true}
          pathname="SA_B1002_603W"
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
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
          modal={true}
        />
      )}
      {PrsnnumWindowVisible2 && (
        <PrsnnumWindow
          setVisible={setPrsnnumWindowVisible2}
          workType="N"
          setData={setPrsnnumData2}
          modal={true}
        />
      )}
    </>
  );
};

export default SA_B1002_603W;
