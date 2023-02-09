import { useEffect, useState, useCallback } from "react";
import * as React from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridFooterCellProps,
  GridCellProps,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridDataStateChangeEvent,
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
  FilterBoxWrap,
  GridContainer,
  Title,
  TitleContainer,
  ButtonInInput,
} from "../../CommonStyled";
import { Input } from "@progress/kendo-react-inputs";
import { Iparameters } from "../../store/types";
import { Button } from "@progress/kendo-react-buttons";
import {
  chkScrollHandler,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  getQueryFromBizComponent,
  handleKeyPressSearch,
} from "../CommonFunction";
import { IWindowPosition } from "../../hooks/interfaces";
import { PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import { COM_CODE_DEFAULT_VALUE } from "../CommonString";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../../store/atoms";
import CustomOptionRadioGroup from "../RadioGroups/CustomOptionRadioGroup";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
type IWindow = {
  workType: "FILTER" | "ROW_ADD" | "ROWS_ADD";
  setVisible(t: boolean): void;
  setData(data: object): void; //data : 선택한 품목 데이터를 전달하는 함수
};

const CopyWindow = ({ workType, setVisible, setData }: IWindow) => {
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 1600,
    height: 800,
  });
  const DATA_ITEM_KEY = "itemcd";
  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
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
        raduseyn: defaultOption.find((item: any) => item.id === "raduseyn")
          .valueCode,
        itemacnt: defaultOption.find((item: any) => item.id === "itemacnt")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA061,L_BA015, R_USEYN,L_BA171,L_BA172,L_BA173,R_QCYN",
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

  useEffect(() => {
    if (bizComponentData !== null) {
      const itemacntQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA061")
      );
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA015")
      );

      fetchQuery(itemacntQueryStr, setItemacntListData);
      fetchQuery(qtyunitQueryStr, setQtyunitListData);
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

  const [isInitSearch, setIsInitSearch] = useState(false);
  const [mainPgNum, setMainPgNum] = useState(1);
  const [ifSelectFirstRow, setIfSelectFirstRow] = useState(true);
  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;
    if (value !== null)
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

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onItemWndClick = () => {
    setItemWindowVisible(true);
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
    itemcd: "",
    itemnm: "",
    bnatur: "",
    insiz: "",
    spec: "",
    itemacnt: "",
    raduseyn: "Y",
    itemlvl1: "",
    itemlvl2: "",
    itemlvl3: "",
    dwgno: "",
    custcd: "",
    custnm: "",
    pgmdiv: "",
    itemno: "",
    service_id: "PW6BizBase",
    row_values: null,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_BA_P0041W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": filters.workType,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_bnatur": filters.bnatur,
      "@p_insiz": filters.insiz,
      "@p_spec": filters.spec,
      "@p_itemacnt": filters.itemacnt,
      "@p_useyn": filters.raduseyn,
      "@p_itemlvl1": filters.itemlvl1,
      "@p_itemlvl2": filters.itemlvl2,
      "@p_itemlvl3": filters.itemlvl3,
      "@p_dwgno": filters.dwgno,
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_pgmdiv": filters.pgmdiv,
      "@p_itemno": filters.itemno,
      "@p_service_id": filters.service_id,
      "@p_find_row_value": filters.row_values,
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
    console.log(parameters);
    console.log(data);
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

    //   rows.map((item: any) => {
    //     if (item.itemnm == infomation.itemnm) {
    //       setSelectedState({ [item.itemcd]: true });
    //     }
    //   });
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
        setSelectedState({ [firstRowData.itemcd]: true });

        // setsubFilters((prev) => ({
        //   ...prev,
        //   workType: "UNP",
        //   itemcd: firstRowData.itemcd,
        //   itemnm: firstRowData.itemnm,
        //   insiz: firstRowData.insiz,
        //   itemacnt: firstRowData.itemacnt,
        //   useyn: firstRowData.useyn,
        //   custcd: firstRowData.custcd,
        //   custnm: firstRowData.custnm,
        //   itemcd_s: "",
        //   spec: firstRowData.spec,
        //   location: firstRowData.location,
        //   remark: firstRowData.remark,
        //   bnatur: firstRowData.bnatur,
        //   itemlvl1: firstRowData.itemlvl1,
        //   itemlvl2: firstRowData.itemlvl2,
        //   itemlvl3: firstRowData.itemlvl3,
        // }));
        // setInfomation({
        //   pgSize: PAGE_SIZE,
        //   workType: "U",
        //   itemcd: firstRowData.itemcd,
        //   itemnm: firstRowData.itemnm,
        //   insiz: firstRowData.insiz,
        //   itemacnt:
        //     itemacntListData.find(
        //       (item: any) => item.sub_code === firstRowData.itemacnt
        //     )?.code_name == undefined
        //       ? firstRowData.itemacnt
        //       : itemacntListData.find(
        //           (item: any) => item.sub_code === firstRowData.itemacnt
        //         )?.code_name,
        //   useyn: firstRowData.useyn == "Y" ? "Y" : "N",
        //   custcd: firstRowData.custcd,
        //   custnm: firstRowData.custnm,
        //   itemcd_s: firstRowData.itemcd_s,
        //   spec: firstRowData.spec,
        //   location: "01",
        //   remark: firstRowData.remark,
        //   bnatur: firstRowData.bnatur,
        //   itemlvl1: firstRowData.itemlvl1,
        //   itemlvl2: firstRowData.itemlvl2,
        //   itemlvl3: firstRowData.itemlvl3,
        //   itemlvl4: firstRowData.itemlvl4,
        //   bomyn: firstRowData.bomyn,
        //   attdatnum: firstRowData.attdatnum,
        //   row_values: firstRowData.row_values,
        //   safeqty: firstRowData.safeqty,
        //   unitwgt: firstRowData.unitwgt,
        //   invunit:
        //     qtyunitListData.find(
        //       (item: any) => item.sub_code === firstRowData.invunit
        //     )?.code_name == undefined
        //       ? firstRowData.invunit
        //       : qtyunitListData.find(
        //           (item: any) => item.sub_code === firstRowData.invunit
        //         )?.code_name,
        //   dwgno: firstRowData.dwgno,
        //   maker: firstRowData.maker,
        //   qcyn: firstRowData.qcyn == "Y" ? "Y" : "N",
        //   attdatnum_img: firstRowData.attdatnum_img,
        //   attdatnum_img2: firstRowData.attdatnum_img2,
        //   snp: firstRowData.snp,
        //   person: firstRowData.person,
        //   extra_field2: firstRowData.extra_field2,
        //   purleadtime: firstRowData.purleadtime,
        //   len: firstRowData.len,
        //   purqty: firstRowData.purqty,
        //   boxqty: firstRowData.boxqty,
        //   pac: firstRowData.pac,
        //   bnatur_insiz: firstRowData.bnatur_insiz,
        //   itemno: firstRowData.itemno,
        //   itemgroup: firstRowData.itemgroup,
        //   lenunit: firstRowData.lenunit,
        //   hscode: firstRowData.hscode,
        //   wgtunit: firstRowData.wgtunit,
        //   custitemnm: firstRowData.custitemnm,
        //   unitqty: firstRowData.unitqty,
        //   procday: firstRowData.procday,
        //   files: firstRowData.files,
        //   auto: firstRowData.auto
        // });
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
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    // setInfomation({
    //   pgSize: PAGE_SIZE,
    //   workType: "U",
    //   itemcd: selectedRowData.itemcd,
    //   itemnm: selectedRowData.itemnm,
    //   insiz: selectedRowData.insiz,
    //   itemacnt: selectedRowData.itemacnt,
    //   useyn: selectedRowData.useyn == "Y" ? "Y" : "N",
    //   custcd: selectedRowData.custcd,
    //   custnm: selectedRowData.custnm,
    //   itemcd_s: selectedRowData.itemcd_s,
    //   spec: selectedRowData.spec,
    //   location: "01",
    //   remark: selectedRowData.remark,
    //   bnatur: selectedRowData.bnatur,
    //   itemlvl1: selectedRowData.itemlvl1,
    //   itemlvl2: selectedRowData.itemlvl2,
    //   itemlvl3: selectedRowData.itemlvl3,
    //   itemlvl4: selectedRowData.itemlvl4,
    //   bomyn: selectedRowData.bomyn,
    //   attdatnum: selectedRowData.attdatnum,
    //   row_values: selectedRowData.row_values,
    //   safeqty: selectedRowData.safeqty,
    //   unitwgt: selectedRowData.unitwgt,
    //   invunit: selectedRowData.invunit,
    //   dwgno: selectedRowData.dwgno,
    //   maker: selectedRowData.maker,
    //   qcyn: selectedRowData.qcyn == "Y" ? "Y" : "N",
    //   attdatnum_img: selectedRowData.attdatnum_img,
    //   attdatnum_img2: selectedRowData.attdatnum_img2,
    //   snp: selectedRowData.snp,
    //   person: selectedRowData.person,
    //   extra_field2: selectedRowData.extra_field2,
    //   purleadtime: selectedRowData.purleadtime,
    //   len: selectedRowData.len,
    //   purqty: selectedRowData.purqty,
    //   boxqty: selectedRowData.boxqty,
    //   pac: selectedRowData.pac,
    //   bnatur_insiz: selectedRowData.bnatur_insiz,
    //   itemno: selectedRowData.itemno,
    //   itemgroup: selectedRowData.itemgroup,
    //   lenunit: selectedRowData.lenunit,
    //   hscode: selectedRowData.hscode,
    //   wgtunit: selectedRowData.wgtunit,
    //   custitemnm: selectedRowData.custitemnm,
    //   unitqty: selectedRowData.unitqty,
    //   procday: selectedRowData.procday,
    //   files: selectedRowData.files,
    //   auto: selectedRowData.auto,
    // });
    // if (tabSelected === 1) {
    //   setsubFilters((prev) => ({
    //     ...prev,
    //     itemcd: selectedRowData.itemcd,
    //     itemnm: selectedRowData.itemnm,
    //     insiz: selectedRowData.insiz,
    //     itemacnt: selectedRowData.itemacnt,
    //     useyn: selectedRowData.useyn,
    //     custcd: selectedRowData.custcd,
    //     custnm: selectedRowData.custnm,
    //     itemcd_s: "",
    //     spec: selectedRowData.spec,
    //     location: selectedRowData.location,
    //     remark: selectedRowData.remark,
    //     bnatur: selectedRowData.bnatur,
    //     itemlvl1: selectedRowData.itemlvl1,
    //     itemlvl2: selectedRowData.itemlvl2,
    //     itemlvl3: selectedRowData.itemlvl3,
    //   }));
    // }
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

  // 부모로 데이터 전달, 창 닫기 (그리드 인라인 오픈 제외)
  const selectData = (selectedData: any) => {
    setData(selectedData);
    if (workType === "ROW_ADD") onClose();
  };

  return (
    <>
    <Window
      title={"품목관리(멀티)"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
    >
      <TitleContainer>
        <Title>품목관리(멀티)</Title>
        <ButtonContainer>
          <Button
            onClick={() => {
              resetAllGrid();
              fetchMainGrid();
            }}
            icon="search"
            themeColor={"primary"}
          >
            조회
          </Button>
        </ButtonContainer>
      </TitleContainer>
      <FilterBoxWrap>
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
              <th>도면번호</th>
              <td>
                <Input
                  name="dwgno"
                  type="text"
                  value={filters.dwgno}
                  onChange={filterInputChange}
                />
              </td>
              <th>재질</th>
              <td>
                <Input
                  name="bnatur"
                  type="text"
                  value={filters.bnatur}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
            <th>업체코드</th>
              <td>
                <Input
                  name="custcd"
                  type="text"
                  value={filters.custcd}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onCustWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
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
              <th>사용여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="raduseyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
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
  
            </tr>
          </tbody>
        </FilterBox>
      </FilterBoxWrap>
      {/* <GridContainer>
        <Grid
          style={{ height: "500px" }}
          data={process(
            mainDataResult.data.map((row) => ({
              ...row,
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
          onSelectionChange={onMainSelectionChange}
          //스크롤 조회기능
          fixedScroll={true}
          total={mainDataResult.total}
          onScroll={onScrollHandler}
          //정렬기능
          sortable={true}
          onSortChange={onMainSortChange}
          //컬럼순서조정
          reorderable={true}
          //컬럼너비조정
          resizable={true}
          //더블클릭
          onRowDoubleClick={onRowDoubleClick}
        >
          <GridColumn
            field="dptcd"
            title="부서코드"
            width="350px"
            footerCell={mainTotalFooterCell}
          />

          <GridColumn field="dptnm" title="부서명" width="450px" />
          <GridColumn field="useyn" title="사용여부" width="140px" />
        </Grid>
      </GridContainer> */}
      <BottomContainer>
        <ButtonContainer>
          {/* <Button themeColor={"primary"} onClick={onConfirmBtnClick}>
            확인
          </Button> */}
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>
    </Window>
    {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={workType}
          setData={setCustData}
        />
      )}
            {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
        />
      )}
    </>
  );
};

export default CopyWindow;
