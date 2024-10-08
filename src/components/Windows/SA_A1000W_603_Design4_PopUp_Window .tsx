import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { useEffect, useLayoutEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  GridContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { isLoading } from "../../store/atoms";
import { Iparameters, TPermissions } from "../../store/types";
import {
  UseBizComponent,
  UseGetValueFromSessionItem,
  UsePermissions,
  getBizCom,
  getHeight,
  getWindowDeviceHeight,
} from "../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../CommonString";
import Window from "./WindowComponent/Window";

type IWindow = {
  setVisible(t: boolean): void;
  filters: any;
  item: any;
  setData(data: any): void; // 선택한 품목 데이터를 전달하는 함수
  modal?: boolean;
};

var height = 0;
var height2 = 0;

const CopyWindow = ({
  setVisible,
  filters,
  item,
  setData,
  modal = false,
}: IWindow) => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);

  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1200) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 600) / 2,
    width: isMobile == true ? deviceWidth : 1200,
    height: isMobile == true ? deviceHeight : 600,
  });

  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  useLayoutEffect(() => {
    height = getHeight(".k-window-titlebar"); //공통 해더
    height2 = getHeight(".BottomContainer"); //조회버튼있는 title부분

    setMobileHeight(
      getWindowDeviceHeight(false, deviceHeight) - height - height2
    );
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height2
    );
  }, []);
  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height2
    );
  };
  const DATA_ITEM_KEY = "num";

  const idGetter = getter(DATA_ITEM_KEY);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_BA171", setBizComponentData);

  const [itemlvl1ListData, setItemlvl1ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setItemlvl1ListData(getBizCom(bizComponentData, "L_BA171"));
    }
  }, [bizComponentData]);

  const onClose = () => {
    setVisible(false);
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
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });

    fetchMainGrid();
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A1000W_603_Q",
      pageNumber: 1,
      pageSize: Math.floor(page.skip / initialPageState.take) + 1,
      parameters: {
        "@p_work_type": "TESTLIST",
        "@p_orgdiv": filters.orgdiv,
        "@p_location":
          filters.location == undefined ? sessionOrgdiv : filters.location,
        "@p_custcd":
          filters.custnm == "" || filters.custnm == undefined
            ? ""
            : filters.custcd,
        "@p_custnm": filters.custnm == undefined ? "" : filters.custnm,
        "@p_finyn": filters.finyn == undefined ? "" : filters.finyn,
        "@p_quotype": filters.quotype == undefined ? "" : filters.quotype,
        "@p_materialtype":
          filters.materialtype == undefined ? "" : filters.materialtype,
        "@p_quonum": item.quonum,
        "@p_quorev": item.quorev,
        "@p_quoseq": item.quoseq,
        "@p_status": "",
        "@p_extra_field2": "",
        "@p_smperson": "",
        "@p_smpersonnm": "",
        "@p_frdt": "",
        "@p_todt": "",
        "@p_in_frdt": "",
        "@p_in_todt": "",
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
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
    setLoading(false);
  };

  useEffect(() => {
    if (bizComponentData !== null && permissions.view) {
      fetchMainGrid();
    }
  }, [bizComponentData, permissions.delete]);

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
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

  const onRowDoubleClick = (props: any) => {
    const selectedData = props.dataItem;
    setData(selectedData.ref_key == undefined ? "" : selectedData.ref_key);
    onClose();
  };

  return (
    <>
      <Window
        titles={"시험품목"}
        positions={position}
        Close={onClose}
        modals={modal}
        onChangePostion={onChangePostion}
      >
        <GridContainer>
          <Grid
            style={{ height: isMobile ? mobileheight : webheight }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                testpart: itemlvl1ListData.find(
                  (item: any) => item.sub_code == row.testpart
                )?.code_name,
                [SELECTED_FIELD]: selectedState[idGetter(row)],
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
            onRowDoubleClick={onRowDoubleClick}
          >
            <GridColumn
              field="num"
              title="NO"
              width="80px"
              footerCell={mainTotalFooterCell}
            />
            <GridColumn field="quotestnum" title="예약번호" width="150px" />
            <GridColumn field="testnum" title="시험번호" width="150px" />
            <GridColumn field="testpart" title="시험파트" width="120px" />
            <GridColumn field="itemcd" title="품목코드" width="150px" />
            <GridColumn field="itemnm" title="품목명" width="150px" />
          </Grid>
        </GridContainer>
        <BottomContainer className="BottomContainer">
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
    </>
  );
};

export default CopyWindow;
