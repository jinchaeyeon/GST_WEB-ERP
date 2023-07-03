import { useEffect, useState, useCallback } from "react";
import * as React from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridFooterCellProps,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridDataStateChangeEvent,
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridCellProps,
} from "@progress/kendo-react-grid";
import { bytesToBase64 } from "byte-base64";
import { DataResult, getter, process, State } from "@progress/kendo-data-query";
import ItemsWindow from "./CommonWindows/ItemsWindow";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import { useApi } from "../../hooks/api";
import {
  BottomContainer,
  ButtonContainer,
  FilterBox,
  GridContainer,
  TitleContainer,
  GridTitleContainer,
} from "../../CommonStyled";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { Iparameters } from "../../store/types";
import { Button } from "@progress/kendo-react-buttons";
import {
  chkScrollHandler,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  convertDateToStr,
  getGridItemChangedData,
  UseGetValueFromSessionItem,
  UseParaPc,
  findMessage,
} from "../CommonFunction";
import { IWindowPosition } from "../../hooks/interfaces";
import { EDIT_FIELD, PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import { COM_CODE_DEFAULT_VALUE } from "../CommonString";
import { useRecoilState, useSetRecoilState } from "recoil";
import { isLoading, loginResultState } from "../../store/atoms";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import NumberCell from "../Cells/NumberCell";
import CheckBoxCell from "../Cells/CheckBoxCell";
import FilterContainer from "../Containers/FilterContainer";
import DateCell from "../Cells/DateCell";
import { DatePicker } from "@progress/kendo-react-dateinputs/dist/npm/datepicker/DatePicker";
import { CellRender, RowRender } from "../Renderers/Renderers";

type IWindow = {
  setVisible(t: boolean): void;
};

type TdataArr = {
  itemcd_s: string[];
  itemacnt_s: string[];
  recdt_s: string[];
  amtunit_s: string[];
  unp_s: string[];
  remark_s: string[];
};

//그리드 내부 글씨 색 정의
const customData = [
  {
    color: "red",
  },
  {
    color: "black",
  },
];

const CustomNumberCell = (props: GridCellProps) => {
  return <NumberCell myProp={customData} {...props} />;
};

const CopyWindow = ({ setVisible }: IWindow) => {
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 1200,
    height: 570,
  });
  const DATA_ITEM_KEY = "num";
  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  const [loginResult] = useRecoilState(loginResultState);
  const [pc, setPc] = useState("");
  const userId = UseGetValueFromSessionItem("user_id");
  UseParaPc(setPc);
  //메시지 조회
  const pathname: string = window.location.pathname.replace("/", "");
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;
      setFilters((prev) => ({
        ...prev,
        unpitem: defaultOption.find((item: any) => item.id === "unpitem")
          .valueCode,
        unpitem2: defaultOption.find((item: any) => item.id === "unpitem2")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA020, L_BA061,L_BA015, R_USEYN,L_BA171,L_BA172,L_BA173,R_YESNOALL",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [itemacntListData, setItemacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
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
  const [amtunitListData, setAmtunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const itemacntQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA061")
      );
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA015")
      );
      const itemlvl1QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA171")
      );
      const itemlvl2QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA172")
      );
      const itemlvl3QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA173")
      );
      const amtunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA020")
      );
      fetchQuery(itemlvl1QueryStr, setItemlvl1ListData);
      fetchQuery(itemlvl2QueryStr, setItemlvl2ListData);
      fetchQuery(itemlvl3QueryStr, setItemlvl3ListData);
      fetchQuery(itemacntQueryStr, setItemacntListData);
      fetchQuery(qtyunitQueryStr, setQtyunitListData);
      fetchQuery(amtunitQueryStr, setAmtunitListData);
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

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

  const [isInitSearch, setIsInitSearch] = useState(true);
  const [mainPgNum, setMainPgNum] = useState(1);
  const [ifSelectFirstRow, setIfSelectFirstRow] = useState(true);
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
    setVisible(false);
  };

  interface ICustData {
    custcd: string;
    custnm: string;
    custabbr: string;
    bizregnum: string;
    custdivnm: string;
    useyn: string;
    remark: string;
    compclass: string;
    ceonm: string;
  }
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

  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const processApi = useApi();
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    unpitem: "",
    unpitem2: "",
    recdt: new Date(),
    row_values: null,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_BA_P0081W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": filters.workType,
      "@p_orgdiv": "01",
      "@p_unpitem": filters.unpitem,
      "@p_unpitem2": filters.unpitem2,
      "@p_recdt": convertDateToStr(filters.recdt),
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters);
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

      if (totalRowCnt > 0) {
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (customOptionData !== null && isInitSearch === false) {
      fetchMainGrid();
      setIsInitSearch(true);
    }
  }, [filters]);

  useEffect(() => {
    if (customOptionData !== null) {
      fetchMainGrid();
    }
  }, [mainPgNum]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (ifSelectFirstRow) {
      if (mainDataResult.total > 0) {
        const firstRowData = mainDataResult.data[0];
        setSelectedState({ [firstRowData.num]: true });

        setIfSelectFirstRow(true);
      }
    }
  }, [mainDataResult]);

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
    // setyn(true);
    setIfSelectFirstRow(false);
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setMainPgNum(1);
    setMainDataResult(process([], mainDataState));
  };

  //스크롤 핸들러
  const onMainScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, mainPgNum, PAGE_SIZE))
      setMainPgNum((prev) => prev + 1);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    resetAllGrid();
    fetchMainGrid();
  };

  const [values2, setValues2] = React.useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus === "N" ? "N" : "U",
        chk: !values2,
        [EDIT_FIELD]: props.field,
      }));
      setValues2(!values2);
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values2} onClick={changeCheck}></Checkbox>
      </div>
    );
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

  const enterEdit = (dataItem: any, field: string) => {
    if (field == "chk" && dataItem.overlap != "Y") {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
              chk: typeof item.chk == "boolean" ? item.chk : item.chk =="Y" ? true : false,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    const newData = mainDataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setMainDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];

    mainDataResult.data.forEach((item: any, index: number) => {
      if (item.chk == false) {
        newData.push(item);
      }
    });
    setMainDataResult((prev) => ({
      data: newData,
      total: newData.length,
    }));

    setMainDataState({});
  };

  const onSaveClick = (e: any) => {
    let newData: any[] = [];

    mainDataResult.data.forEach((item: any, index: number) => {
      if (item.chk == true) {
        newData.push(item);
      }
    });
    try {
      if (newData.length === 0) {
        throw findMessage(messagesData, "BA_A0080W_008");
      } else {
        let dataArr: TdataArr = {
          itemcd_s: [],
          itemacnt_s: [],
          recdt_s: [],
          amtunit_s: [],
          unp_s: [],
          remark_s: [],
        };
        newData.forEach((item: any, idx: number) => {
          const {
            itemcd = "",
            itemacnt = "",
            recdt = "",
            amtunit = "",
            unp = "",
            remark = "",
          } = item;

          dataArr.itemcd_s.push(itemcd);
          dataArr.itemacnt_s.push(itemacnt);
          dataArr.recdt_s.push(recdt);
          dataArr.amtunit_s.push(amtunit);
          dataArr.unp_s.push(unp);
          dataArr.remark_s.push(remark);
        });

        setParaData((prev) => ({
          ...prev,
          itemcd_s: dataArr.itemcd_s.join("|"),
          unp_s: dataArr.unp_s.join("|"),
          itemacnt_s: dataArr.itemacnt_s.join("|"),
          remark_s: dataArr.remark_s.join("|"),
          recdt_s: dataArr.recdt_s.join("|"),
          amtunit_s: dataArr.amtunit_s.join("|"),
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  const [paraData, setParaData] = useState({
    workType: "N",
    orgdiv: "01",
    unpitem: "",
    itemcd_s: "",
    unp_s: "",
    itemacnt_s: "",
    remark_s: "",
    recdt_s: "",
    amtunit_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_BA_P0081W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": "N",
      "@p_orgdiv": paraData.orgdiv,
      "@p_unpitem": filters.unpitem2,
      "@p_itemcd_s": paraData.itemcd_s,
      "@p_itemacnt_s": paraData.itemacnt_s,
      "@p_unp_s": paraData.unp_s,
      "@p_remark_s": paraData.remark_s,
      "@p_recdt_s": paraData.recdt_s,
      "@p_amtunit_s": paraData.amtunit_s,
      "@p_userid": userId,
      "@p_form_id": "BA_P0081W",
      "@p_pc": pc,
    },
  };

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      resetAllGrid();
      setParaData({
        workType: "N",
        orgdiv: "01",
        unpitem: filters.unpitem2,
        itemcd_s: "",
        unp_s: "",
        itemacnt_s: "",
        remark_s: "",
        recdt_s: "",
        amtunit_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paraData.itemcd_s != "") {
      fetchTodoGridSaved();
    }
  }, [paraData]);

  return (
    <>
      <Window
        title={"단가복사"}
        width={position.width}
        height={position.height}
        onMove={handleMove}
        onResize={handleResize}
        onClose={onClose}
        modal={true}
      >
        <TitleContainer style={{ float: "right" }}>
          <ButtonContainer>
            <Button
              onClick={() => {
                if (filters.unpitem2 == "") {
                  alert("대상단가항목을 채워주세요");
                } else {
                  resetAllGrid();
                  fetchMainGrid();
                }
              }}
              icon="search"
              themeColor={"primary"}
            >
              조회
            </Button>
          </ButtonContainer>
        </TitleContainer>
        <FilterContainer>
          <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
            <tbody>
              <tr>
                <th>적용일</th>
                <td>
                  <div className="filter-item-wrap">
                    <DatePicker
                      name="recdt"
                      value={filters.recdt}
                      format="yyyy-MM-dd"
                      onChange={filterInputChange}
                      className="required"
                      placeholder=""
                    />
                  </div>
                </td>
                <th>기준단가항목</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="unpitem"
                      value={filters.unpitem}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                    />
                  )}
                </td>
                <th>대상단가항목</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="unpitem2"
                      value={filters.unpitem2}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                      className="required"
                    />
                  )}
                </td>
              </tr>
            </tbody>
          </FilterBox>
        </FilterContainer>
        <GridContainer>
          <GridTitleContainer>
            <ButtonContainer>
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
                title="저장"
              ></Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: "290px" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                itemacnt: itemacntListData.find(
                  (items: any) => items.sub_code === row.itemacnt
                )?.code_name,
                itemlvl1: itemlvl1ListData.find(
                  (item: any) => item.sub_code === row.itemlvl1
                )?.code_name,
                itemlvl2: itemlvl2ListData.find(
                  (item: any) => item.sub_code === row.itemlvl2
                )?.code_name,
                itemlvl3: itemlvl3ListData.find(
                  (item: any) => item.sub_code === row.itemlvl3
                )?.code_name,
                invunit: qtyunitListData.find(
                  (item: any) => item.sub_code === row.invunit
                )?.code_name,
                amtunit: amtunitListData.find(
                  (item: any) => item.sub_code === row.amtunit
                )?.code_name,
                [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
              })),
              mainDataState
            )}
            onDataStateChange={onMainDataStateChange}
            {...mainDataState}
            //선택 기능
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
            onScroll={onMainScrollHandler}
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
            <GridColumn
              field="chk"
              title=" "
              width="45px"
              headerCell={CustomCheckBoxCell2}
              cell={CheckBoxCell}
            />
            <GridColumn
              field="recdt"
              title="일자"
              width="120px"
              cell={DateCell}
              footerCell={mainTotalFooterCell}
            />
            <GridColumn field="itemcd" title="품목코드" width="150px" />
            <GridColumn field="itemnm" title="품목명" width="150px" />
            <GridColumn field="itemacnt" title="품목계정" width="150px" />
            <GridColumn
              field="unp"
              title="단가"
              width="100px"
              cell={CustomNumberCell}
            />
            <GridColumn field="amtunit" title="화폐단위" width="150px" />
            <GridColumn field="remark" title="비고" width="250px" />
          </Grid>
        </GridContainer>
        <BottomContainer>
          <ButtonContainer>
            <Button
              themeColor={"primary"}
              fillMode={"outline"}
              onClick={onClose}
            >
              닫기
            </Button>
          </ButtonContainer>
        </BottomContainer>
      </Window>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"ROW_ADD"}
          setData={setCustData}
        />
      )}
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"ROW_ADD"}
          setData={setItemData}
        />
      )}
    </>
  );
};

export default CopyWindow;
