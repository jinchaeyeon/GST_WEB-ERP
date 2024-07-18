import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridRowProps,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import React, { useEffect, useLayoutEffect, useState } from "react";
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
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  getBizCom,
  getDeviceHeight,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
} from "../components/CommonFunction";
import { COM_CODE_DEFAULT_VALUE, PAGE_SIZE } from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/PR_B1500W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

var height = 0;
var height2 = 0;

const rowRender = (
  trElement: React.ReactElement<HTMLTableRowElement>,
  props: GridRowProps
) => {
  const available = props.dataItem.div == "가동";
  const green = { backgroundColor: "rgb(55, 180, 0,0.32)" };
  const red = { backgroundColor: "rgb(243, 23, 0, 0.32)" };
  const trProps: any = { style: available ? green : red };

  return React.cloneElement(
    trElement,
    { ...trProps },
    trElement.props.children as any
  );
};

const PR_B1500W: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const processApi = useApi();
  const [state, setState] = useState(true);
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("PR_B1500W", setMessagesData);
  const setLoading = useSetRecoilState(isLoading);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("PR_B1500W", setCustomOptionData);
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

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

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        div: defaultOption.find((item: any) => item.id == "div")?.valueCode,
        dptcd: defaultOption.find((item: any) => item.id == "dptcd")?.valueCode,
        itemlvl1: defaultOption.find((item: any) => item.id == "itemlvl1")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "설비가동현황모니터링";
      _export.save(optionsGridOne);
    }
  };

  const search = () => {
    setMainDataResult(process([], mainDataState));
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA171,L_BA172,L_BA173, L_sysUserMaster_001",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );
  const [prodempListData, setProdempListData] = React.useState([
    { user_id: "", user_name: "" },
  ]);
  const [itemlvl1ListData, setItemlvl1ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl2ListData, setItemlvl2ListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl3ListData, setItemlvl3ListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setItemlvl1ListData(getBizCom(bizComponentData, "L_BA171"));
      setItemlvl2ListData(getBizCom(bizComponentData, "L_BA172"));
      setItemlvl3ListData(getBizCom(bizComponentData, "L_BA173"));
      setProdempListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
    }
  }, [bizComponentData]);

  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "Q",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    time: 5,
    fxnum: "",
    fxnm: "",
    fxno: "",
    classnm1: "",
    classnm2: "",
    classnm3: "",
    spec: "",
    div: "",
    dptcd: "",
    itemlvl1: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_PR_B1500W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_fxnum": filters.fxnum,
        "@p_fxnm": filters.fxnm,
        "@p_fxno": filters.fxno,
        "@p_classnm1": filters.classnm1,
        "@p_classnm2": filters.classnm2,
        "@p_classnm3": filters.classnm3,
        "@p_spec": filters.spec,
        "@p_div": filters.div,
        "@p_dptcd": filters.dptcd,
        "@p_itemlvl1": filters.itemlvl1,
      },
    };

    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
      }));

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
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
    if (filters.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (state === false) return;
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
      }));
    }, filters.time * 1000);
    return () => clearInterval(timer);
  }, [filters.time, state]);

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

  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onPlay = () => {
    setState(true);
  };
  const onStop = () => {
    setState(false);
  };

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
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
              pathname="PR_B3000W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>주기(초)</th>
              <td>
                <Input
                  name="time"
                  type="number"
                  value={filters.time}
                  onChange={filterInputChange}
                />
              </td>
              <th>설비번호</th>
              <td>
                <Input
                  name="fxnum"
                  type="text"
                  value={filters.fxnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>설비호기</th>
              <td>
                <Input
                  name="fxno"
                  type="text"
                  value={filters.fxno}
                  onChange={filterInputChange}
                />
              </td>
              <th>분류1</th>
              <td>
                <Input
                  name="classnm1"
                  type="text"
                  value={filters.classnm1}
                  onChange={filterInputChange}
                />
              </td>
              <th>분류3</th>
              <td>
                <Input
                  name="classnm3"
                  type="text"
                  value={filters.classnm3}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
              <th></th>
              <td></td>
              <th>설비명</th>
              <td>
                <Input
                  name="fxnm"
                  type="text"
                  value={filters.fxnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>사양</th>
              <td>
                <Input
                  name="spec"
                  type="text"
                  value={filters.spec}
                  onChange={filterInputChange}
                />
              </td>
              <th>분류2</th>
              <td>
                <Input
                  name="classnm2"
                  type="text"
                  value={filters.classnm2}
                  onChange={filterInputChange}
                />
              </td>
              <th>구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="div"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
            <tr>
              <th></th>
              <td></td>
              <th>부서</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="dptcd"
                    value={filters.dptcd}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="dptnm"
                    valueField="dptcd"
                  />
                )}
              </td>
              <th></th>
              <td></td>
              <th></th>
              <td></td>
              <th>대분류</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="itemlvl1"
                    value={filters.itemlvl1}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainer>
        <GridTitleContainer className="ButtonContainer">
          <GridTitle>
            <ButtonContainer>
              <Button
                onClick={onPlay}
                themeColor={"primary"}
                icon="play"
                disabled={
                  permissions.view ? (state == true ? true : false) : true
                }
                title="재생"
              ></Button>
              <Button
                onClick={onStop}
                themeColor={"primary"}
                icon="pause"
                disabled={
                  permissions.view ? (state == false ? true : false) : true
                }
                title="정지"
              ></Button>
            </ButtonContainer>
          </GridTitle>
        </GridTitleContainer>
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
          fileName="설비가동현황모니터링"
        >
          <Grid
            style={{ height: isMobile ? mobileheight : webheight }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                prodemp: prodempListData.find(
                  (items: any) => items.user_id == row.prodemp
                )?.user_name,
                itemlvl1: itemlvl1ListData.find(
                  (item: any) => item.sub_code == row.itemlvl1
                )?.code_name,
                itemlvl2: itemlvl2ListData.find(
                  (item: any) => item.sub_code == row.itemlvl2
                )?.code_name,
                itemlvl3: itemlvl3ListData.find(
                  (item: any) => item.sub_code == row.itemlvl3
                )?.code_name,
              })),
              mainDataState
            )}
            {...mainDataState}
            onDataStateChange={onMainDataStateChange}
            //스크롤 조회 기능
            fixedScroll={true}
            total={mainDataResult.total}
            //정렬기능
            sortable={true}
            onSortChange={onMainSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            rowRender={rowRender}
          >
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList"]
                ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                ?.map(
                  (item: any, idx: number) =>
                    item.sortOrder !== -1 && (
                      <GridColumn
                        key={idx}
                        field={item.fieldName}
                        title={item.caption}
                        width={item.width}
                      />
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

export default PR_B1500W;
