import { useEffect, useState, useCallback, useRef } from "react";
import * as React from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridSelectionChangeEvent,
  getSelectedState,
  GridEvent,
  GridHeaderSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import { Icon, getter } from "@progress/kendo-react-common";
import { bytesToBase64 } from "byte-base64";
import { DataResult, process, State } from "@progress/kendo-data-query";
import { useApi } from "../../hooks/api";
import {
  BottomContainer,
  ButtonContainer,
  GridContainer,
  FilterBox,
  ButtonInInput,
  GridTitleContainer,
  GridTitle,
  GridContainerWrap,
} from "../../CommonStyled";
import { COM_CODE_DEFAULT_VALUE, GAP, SELECTED_FIELD } from "../CommonString";
import { Input } from "@progress/kendo-react-inputs";
import { Form, FormElement, FormRenderProps } from "@progress/kendo-react-form";
import { Iparameters } from "../../store/types";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  UseBizComponent,
  UseMessages,
  handleKeyPressSearch,
  UseParaPc,
  getQueryFromBizComponent,
  UseCustomOption,
  chkScrollHandler,
} from "../CommonFunction";
import { Button } from "@progress/kendo-react-buttons";
import { IWindowPosition } from "../../hooks/interfaces";
import { FORM_DATA_INDEX, PAGE_SIZE } from "../CommonString";
import { FormCheckBoxCell } from "../Editors";
import NumberCell from "../Cells/NumberCell";
import FilterContainer from "../Containers/FilterContainer";
import { loginResultState } from "../../store/atoms";
import { useRecoilState } from "recoil";
const SUB_DATA_ITEM_KEY = "pattern_id";
const DATA_ITEM_KEY = "itemcd";

const topHeight = 55.56;
const bottomHeight = 55;
const leftOverHeight = (topHeight + bottomHeight) / 2;

// Create React.Context to pass props to the Form Field components from the main component
export const FormGridEditContext = React.createContext<{
  onEdit: (dataItem: any, isNew: boolean) => void;
  onSave: () => void;
  editIndex: number | undefined;
  parentField: string;
}>({} as any);

type TPara = {
  user_id: string;
  user_name: string;
};
type TKendoWindow = {
  getVisible(isVisible: boolean): void;
  setData(data: object, itemcd: string): void;
  para: TPara;
};

const KendoWindow = ({
  getVisible,
  para = { user_id: "", user_name: "" },
  setData,
}: TKendoWindow) => {
  const { user_id, user_name } = para;
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const pathname: string = window.location.pathname.replace("/", "");

  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";

  const [mainPgNum, setMainPgNum] = useState(1);
  const [subPgNum, setSub2PgNum] = useState(1);
  const [sub2PgNum, setSubPgNum] = useState(1);
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;
      setFilters((prev) => ({
        ...prev,
        raduseyn: defaultOption.find((item: any) => item.id === "raduseyn")
          .valueCode,
        itemacnt: defaultOption.find((item: any) => item.id === "itemacnt")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  // 비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA061,L_PR010,L_BA011,L_sysUserMaster_001,L_BA015",
    setBizComponentData,
  );

  const [itemacntListData, setItemacntListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [proccdListData, setProccdListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [outprocynListData, setOutprocynListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [prodempListData, setProdempListData] = React.useState([
    { user_id: "", user_name: "" },
  ]);
  const [qtyunitListData, setQtyunitListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [procunitListData, setProcunitListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 1600,
    height: 800,
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

  const onClose = () => {
    getVisible(false);
  };

  const processApi = useApi();
  const [dataState, setDataState] = useState<State>({
    skip: 0,
    take: 20,
  });

  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], dataState),
  );

  const [detailDataResult2, setDetailDataResult2] = useState<DataResult>(
    process([], dataState),
  );

  const [detailDataResult3, setDetailDataResult3] = useState<DataResult>(
    process([], dataState),
  );
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(FORM_DATA_INDEX);
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedsubDataState, setSelectedsubDataState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedsubDataState2, setSelectedsubDataState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [filters, setFilters] = useState({
    pgSize: 20,
    workType: "COPY",
    orgdiv: "01",
    itemcd: "",
    itemnm: "",
    insiz: "",
    itemacnt: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  const [filters3, setFilters3] = useState({
    pgSize: 20,
    workType: "PASTE",
    orgdiv: "01",
    itemcd: "",
    itemnm: "",
    insiz: "",
    itemacnt: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_BA_A0050W_Sub1_Q ",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": filters.workType,
      "@p_orgdiv": filters.orgdiv,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_insiz": filters.insiz,
      "@p_itemacnt": filters.itemacnt,
      "@p_company_code": companyCode,
    },
  };

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "BOM",
    orgdiv: "01",
    itemcd: " 공백테스트",
    itemnm: "",
    insiz: "",
    itemacnt: "",
    row_values: null,
  });
  let gridRef: any = useRef(null);
  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters.find_row_value !== "" && detailDataResult.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = detailDataResult.data.findIndex(
          (item) => idGetter(item) === filters.find_row_value,
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.vs.container.scroll(0, scrollHeight);

        //초기화
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters.scrollDirrection === "up") {
        gridRef.vs.container.scroll(0, 20);
      }
    }
  }, [detailDataResult]);

  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters3.find_row_value !== "" && detailDataResult3.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = detailDataResult3.data.findIndex(
          (item) => idGetter(item) === filters3.find_row_value,
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.vs.container.scroll(0, scrollHeight);

        //초기화
        setFilters3((prev) => ({
          ...prev,
          find_row_value: "",
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters3.scrollDirrection === "up") {
        gridRef.vs.container.scroll(0, 20);
      }
    }
  }, [detailDataResult3]);

  //조회조건 파라미터
  const parameters2: Iparameters = {
    procedureName: "P_BA_A0050W_Sub1_Q",
    pageNumber: subPgNum,
    pageSize: filters2.pgSize,
    parameters: {
      "@p_work_type": filters2.workType,
      "@p_orgdiv": filters2.orgdiv,
      "@p_itemcd": filters2.itemcd,
      "@p_itemnm": filters2.itemnm,
      "@p_insiz": filters2.insiz,
      "@p_itemacnt": filters2.itemacnt,
      "@p_company_code": companyCode,
    },
  };

  const parameters3: Iparameters = {
    procedureName: "P_BA_A0050W_Sub1_Q",
    pageNumber: filters3.pgNum,
    pageSize: filters3.pgSize,
    parameters: {
      "@p_work_type": "PASTE",
      "@p_orgdiv": filters.orgdiv,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_insiz": filters.insiz,
      "@p_itemacnt": filters.itemacnt,
      "@p_company_code": companyCode,
    },
  };

  //상세그리드 조회
  const fetchGrid = async () => {
    let data: any;
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        setDetailDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
        if (filters.find_row_value === "" && filters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedsubDataState({ [firstRowData[DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            itemcd: firstRowData.itemcd,
          }));
        }
      }
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
  };

  const fetchGrid3 = async () => {
    let data: any;
    try {
      data = await processApi<any>("procedure", parameters3);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      if (totalRowCnt > 0) {
        setDetailDataResult3((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
        if (filters3.find_row_value === "" && filters3.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedsubDataState2({ [firstRowData[DATA_ITEM_KEY]]: true });
        }
      }
    }
    setFilters3((prev) => ({
      ...prev,
      isSearch: false,
    }));
  };

  //상세그리드 조회
  const fetchGrid2 = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });

      setDetailDataResult2(() => {
        return {
          data: [...rows],
          total: totalRowCnt,
        };
      });
    }
  };

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //그리드 리셋
  const resetAllGrid = () => {
    setDetailDataResult(process([], dataState));
    setDetailDataResult2(process([], dataState));
    setDetailDataResult3(process([], dataState));
  };

  useEffect(() => {
    if (bizComponentData !== null) {
      const itemacntQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA061"),
      );
      const proccdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_PR010"),
      );
      const outprocynQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA011"),
      );
      const prodempQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001",
        ),
      );
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA015"),
      );
      const procunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA015"),
      );

      fetchQuery(proccdQueryStr, setProccdListData);
      fetchQuery(itemacntQueryStr, setItemacntListData);
      fetchQuery(outprocynQueryStr, setOutprocynListData);
      fetchQuery(prodempQueryStr, setProdempListData);
      fetchQuery(qtyunitQueryStr, setQtyunitListData);
      fetchQuery(procunitQueryStr, setProcunitListData);
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

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

  const onSubDataSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedsubDataState2,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedsubDataState2(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
  };

  const onHeaderSelectionChange = React.useCallback(
    (event: GridHeaderSelectionChangeEvent) => {
      const checkboxElement: any = event.syntheticEvent.target;
      const checked = checkboxElement.checked;
      const newSelectedState: any = {};

      event.dataItems.forEach((item: any) => {
        newSelectedState[idGetter(item)] = checked;
      });
      setSelectedsubDataState2(newSelectedState);
    },
    [],
  );

  interface IItemData {
    itemcd: string;
    itemno: string;
    itemnm: string;
    insiz: string;
    model: string;
    itemacnt: string;
    itemacntnm: string;
    bnatur: string;
    spec: string;
    invunit: string;
    invunitnm: string;
    unitwgt: string;
    wgtunit: string;
    wgtunitnm: string;
    maker: string;
    dwgno: string;
    remark: string;
    itemlvl1: string;
    itemlvl2: string;
    itemlvl3: string;
    extra_field1: string;
    extra_field2: string;
    extra_field7: string;
    extra_field6: string;
    extra_field8: string;
    packingsiz: string;
    unitqty: string;
    color: string;
    gubun: string;
    qcyn: string;
    outside: string;
    itemthick: string;
    itemlvl4: string;
    itemlvl5: string;
    custitemnm: string;
  }

  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };
  useEffect(() => {
    fetchGrid2();
  }, [subPgNum]);

  const onSubScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, subPgNum, PAGE_SIZE))
      setSubPgNum((prev) => prev + 1);
  };
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

  const search = () => {
    resetAllGrid();
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    setFilters3((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };

  useEffect(() => {
    fetchGrid2();
  }, [filters2]);

  const onSubDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedsubDataState(newSelectedState);
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    setFilters2((prev) => ({
      ...prev,
      itemcd: selectedRowData.itemcd,
    }));
  };

  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  useEffect(() => {
    if (filters.isSearch) {
      setFilters((prev) => ({ ...prev, isSearch: false }));
      fetchGrid();
    }
  }, [filters]);

  useEffect(() => {
    if (filters3.isSearch) {
      setFilters3((prev) => ({ ...prev, isSearch: false }));
      fetchGrid3();
    }
  }, [filters3]);

  const onMainScrollHandler2 = (event: GridEvent) => {
    if (filters.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      filters.pgNum + (filters.scrollDirrection === "up" ? filters.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
      return false;
    }

    pgNumWithGap =
      filters.pgNum - (filters.scrollDirrection === "down" ? filters.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
    }
  };
  const onMainScrollHandler = (event: GridEvent) => {
    if (filters3.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      filters3.pgNum +
      (filters3.scrollDirrection === "up" ? filters3.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setFilters3((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
      return false;
    }

    pgNumWithGap =
      filters3.pgNum -
      (filters3.scrollDirrection === "down" ? filters3.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setFilters3((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
    }
  };

  const selectData = (selectedData: any) => {
    let arr: any = [];
    for (const [key, value] of Object.entries(selectedsubDataState2)) {
      if (value == true) {
        arr.push(key);
      }
    }

    const selectRows = detailDataResult3.data.filter(
      (item: any) => arr.includes(item.itemcd) == true,
    );

    setData(selectRows, Object.getOwnPropertyNames(selectedsubDataState)[0]);
    onClose();
  };

  return (
    <Window
      title={"BOM복사"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
    >
      <Form
        initialValues={{
          user_id,
          user_name,
          groupDetails: detailDataResult.data, //detailDataResult.data,
          groupDetails2: detailDataResult2.data,
        }}
        render={(formRenderProps: FormRenderProps) => (
          <FormElement horizontal={true} style={{ height: "100%" }}>
            <fieldset className={"k-form-fieldset"}>
              <button
                id="valueChanged"
                style={{ display: "none" }}
                onClick={(e) => {
                  e.preventDefault(); // Changing desired field value
                  formRenderProps.onChange("valueChanged", {
                    value: "1",
                  });
                }}
              ></button>
              <FilterContainer>
                <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
                  <tbody>
                    <tr>
                      <th>품목코드</th>
                      <td>
                        <Input
                          name="itemcd"
                          type="text"
                          value={filters.itemcd}
                          onChange={filterInputChange}
                        />
                        <ButtonInInput>
                          <Button
                            onClick={onItemWndClick}
                            icon="more-horizontal"
                            fillMode="flat"
                          />
                        </ButtonInInput>
                      </td>
                      <th>품목명</th>
                      <td>
                        <Input
                          name="itemnm"
                          type="text"
                          value={filters.itemnm}
                          onChange={filterInputChange}
                        />
                      </td>
                      <th>품목계정</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="itemacnt"
                            value={filters.itemacnt}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                          />
                        )}
                      </td>
                      <th>규격</th>
                      <td>
                        <Input
                          name="insiz"
                          type="text"
                          value={filters.insiz}
                          onChange={filterInputChange}
                        />
                      </td>
                    </tr>
                  </tbody>
                </FilterBox>
              </FilterContainer>
            </fieldset>

            <GridContainerWrap height={`calc(50% - ${leftOverHeight}px)`}>
              <GridContainer width={`45%`}>
                <GridTitleContainer>
                  <GridTitle>품목리스트</GridTitle>
                </GridTitleContainer>
                <Grid
                  data={detailDataResult.data.map((item: any) => ({
                    ...item,
                    itemacnt: itemacntListData.find(
                      (items: any) => items.sub_code === item.itemacnt,
                    )?.code_name,
                    [SELECTED_FIELD]: selectedsubDataState[idGetter(item)],
                  }))}
                  total={detailDataResult.total}
                  dataItemKey={DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "multiple",
                  }}
                  onScroll={onMainScrollHandler2}
                  onSelectionChange={onSubDataSelectionChange}
                  style={{ height: "calc(100% - 5px)" }}
                >
                  <GridColumn field="itemcd" title="품목코드" width="200px" />
                  <GridColumn field="itemnm" title="품목명" width="200PX" />
                  <GridColumn field="insiz" title="규격" width="150px" />
                  <GridColumn field="itemacnt" title="품목계정" width="150px" />
                </Grid>
              </GridContainer>
              <GridContainer width={`calc(55% - ${GAP}px)`}>
                <GridTitleContainer>
                  <GridTitle>복사대상</GridTitle>
                </GridTitleContainer>
                <Grid
                  data={detailDataResult3.data.map((item: any) => ({
                    ...item,
                    itemacnt: itemacntListData.find(
                      (items: any) => items.sub_code === item.itemacnt,
                    )?.code_name,
                    [SELECTED_FIELD]: selectedsubDataState2[idGetter(item)],
                  }))}
                  total={detailDataResult3.total}
                  dataItemKey={DATA_ITEM_KEY}
                  onScroll={onMainScrollHandler}
                  style={{ height: "calc(100% - 5px)" }}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "multiple",
                  }}
                  onSelectionChange={onSubDataSelectionChange2}
                  onHeaderSelectionChange={onHeaderSelectionChange}
                >
                  <GridColumn
                    field={SELECTED_FIELD}
                    width="45px"
                    headerSelectionValue={
                      detailDataResult3.data.findIndex(
                        (item: any) => !selectedsubDataState2[idGetter(item)],
                      ) === -1
                    }
                  />
                  <GridColumn field="itemcd" title="품목코드" width="200px" />
                  <GridColumn field="itemnm" title="품목명" width="200PX" />
                  <GridColumn field="insiz" title="규격" width="200px" />
                  <GridColumn field="itemacnt" title="품목계정" width="150px" />
                </Grid>
              </GridContainer>
            </GridContainerWrap>
            <GridContainer
              height={`calc(50% - ${leftOverHeight}px)`}
              width={`99.9%`}
            >
              <GridTitleContainer>
                <GridTitle>BOM상세</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "calc(100% - 40px)" }}
                data={detailDataResult2.data.map((item: any) => ({
                  ...item,
                  proccd: proccdListData.find(
                    (items: any) => items.sub_code === item.proccd,
                  )?.code_name,
                  outprocyn: outprocynListData.find(
                    (items: any) => items.sub_code === item.outprocyn,
                  )?.code_name,
                  prodemp: prodempListData.find(
                    (items: any) => items.user_id === item.prodemp,
                  )?.user_name,
                  qtyunit: qtyunitListData.find(
                    (items: any) => items.sub_code === item.qtyunit,
                  )?.code_name,
                  procunit: procunitListData.find(
                    (items: any) => items.sub_code === item.procunit,
                  )?.code_name,
                }))}
                total={detailDataResult2.total}
                dataItemKey={FORM_DATA_INDEX}
                onScroll={onSubScrollHandler}
              >
                <GridColumn field="proccd" title="공정" width="150px" />
                <GridColumn
                  field="procseq"
                  title="공정순서"
                  width="100px"
                  cell={NumberCell}
                />
                <GridColumn field="outprocyn" title="외주구분" width="100px" />
                <GridColumn field="prodemp" title="작업자" width="150px" />
                <GridColumn field="prodmac" title="설비" width="150px" />
                <GridColumn
                  field="chlditemcd"
                  title="소요자재코드"
                  width="150px"
                />
                <GridColumn
                  field="chlditemnm"
                  title="소요자재명"
                  width="150px"
                />
                <GridColumn
                  field="unitqty"
                  title="단위수량"
                  width="120px"
                  cell={NumberCell}
                />
                <GridColumn field="qtyunit" title="수량단위" width="120px" />
                <GridColumn field="outgb" title="불출구분" width="120px" />
                <GridColumn
                  field="procqty"
                  title="재공생산량"
                  width="120px"
                  cell={NumberCell}
                />
                <GridColumn field="procunit" title="생산량단위" width="120px" />
                <GridColumn field="remark" title="비고" width="200px" />
              </Grid>
            </GridContainer>
            <BottomContainer>
              <ButtonContainer>
                <Button themeColor={"primary"} onClick={selectData}>
                  저장
                </Button>
                <Button
                  themeColor={"primary"}
                  fillMode={"outline"}
                  onClick={onClose}
                >
                  닫기
                </Button>
              </ButtonContainer>
            </BottomContainer>
          </FormElement>
        )}
      />
    </Window>
  );
};

export default KendoWindow;
