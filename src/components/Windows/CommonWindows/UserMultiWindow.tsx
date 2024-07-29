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
import { Input } from "@progress/kendo-react-inputs";
import * as React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../../../CommonStyled";
import { useApi } from "../../../hooks/api";
import { IWindowPosition } from "../../../hooks/interfaces";
import {
  isFilterHideState2,
  isLoading,
  loginResultState,
} from "../../../store/atoms";
import { Iparameters } from "../../../store/types";
import {
  UseBizComponent,
  UseGetValueFromSessionItem,
  getBizCom,
  getHeight,
  getWindowDeviceHeight,
} from "../../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../../CommonString";
import WindowFilterContainer from "../../Containers/WindowFilterContainer";
import BizComponentRadioGroup from "../../RadioGroups/BizComponentRadioGroup";
import Window from "../WindowComponent/Window";
import UserWindow from "./UserWindow";

interface IPrsnnumMulti {
  prsnnum: string;
  prsnnm: string;
  dptcd: string;
  abilcd: string;
  postcd: string;
}

interface IPrsnnum {
  prsnnum: string;
  prsnnm: string;
  dptcd: string;
  abilcd: string;
  postcd: string;
}

type IWindow = {
  setVisible(t: boolean): void;
  setData(data: IPrsnnumMulti[]): void; //data : 선택한 품목 데이터를 전달하는 함수
  modal?: boolean;
};

const DATA_ITEM_KEY = "prsnnum";
const KEEPING_DATA_ITEM_KEY = "idx";
let targetRowIndex: null | number = null;
let temp = 0;
var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
const UserMultiWindow = ({ setVisible, setData, modal = false }: IWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;

  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 830) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 900) / 2,
    width: isMobile == true ? deviceWidth : 830,
    height: isMobile == true ? deviceHeight : 900,
  });

  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [isFilterHideStates2, setisFilterHideStates2] =
    useRecoilState(isFilterHideState2);
  useLayoutEffect(() => {
    height = getHeight(".k-window-titlebar"); //공통 해더
    height2 = getHeight(".WindowTitleContainer"); //조회버튼있는 title부분
    height3 = getHeight(".BottomContainer"); //하단 버튼부분
    height4 = getHeight(".WindowButtonContainer");
    height5 = getHeight(".WindowButtonContainer2");

    setMobileHeight(
      getWindowDeviceHeight(true, deviceHeight) - height - height2 - height3
    );
    setWebHeight(
      (getWindowDeviceHeight(true, position.height) -
        height -
        height2 -
        height3) /
        2 -
        height4
    );
    setMobileHeight2(
      getWindowDeviceHeight(true, deviceHeight) - height - height2 - height3
    );
    setWebHeight2(
      (getWindowDeviceHeight(true, position.height) -
        height -
        height2 -
        height3) /
        2 -
        height5
    );
  }, []);
  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      (getWindowDeviceHeight(true, position.height) -
        height -
        height2 -
        height3) /
        2 -
        height4
    );
    setWebHeight2(
      (getWindowDeviceHeight(true, position.height) -
        height -
        height2 -
        height3) /
        2 -
        height5
    );
  };

  const setLoading = useSetRecoilState(isLoading);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const idGetter = getter(DATA_ITEM_KEY);
  const keepingIdGetter = getter(KEEPING_DATA_ITEM_KEY);
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [keepingSelectedState, setKeepingSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const initialPageState = { skip: 0, take: PAGE_SIZE };
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
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "R_RTR, L_dptcd_001, L_HU006, L_HU005",
    //사용여부,
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [dptcdListData, setDptcdListData] = React.useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [abilcdListData, setAbilcdListDate] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [postcdListData, setPostcdListDate] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setDptcdListData(getBizCom(bizComponentData, "L_dptcd_001"));
      setAbilcdListDate(getBizCom(bizComponentData, "L_HU006"));
      setPostcdListDate(getBizCom(bizComponentData, "L_HU005"));
    }
  }, [bizComponentData]);

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

  const onClose = () => {
    setisFilterHideStates2(true);
    setVisible(false);
  };

  const processApi = useApi();

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [keepingDataState, setKeepingDataState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [keepingDataResult, setKeepingDataResult] = useState<DataResult>(
    process([], keepingDataState)
  );

  const [filters, setFilters] = useState({
    dptcd: "",
    orgdiv: "",
    rtryn: "N",
    prsnnum: "",
    prsnnm: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });

  let gridRef: any = useRef(null);

  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  //그리드 조회
  const fetchMainGrid = async (filters: any) => {
    let data: any;
    setLoading(true);
    const parameters: Iparameters = {
      procedureName: "P_HU_A5020W_Sub1_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "LIST",
        "@p_orgdiv": sessionOrgdiv,
        "@p_prsnnum": filters.prsnnum,
        "@p_prsnnm": filters.prsnnm,
        "@p_rtryn": filters.rtryn,
        "@p_company_code": companyCode,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        idx: temp++,
      }));

      if (gridRef.current) {
        targetRowIndex = 0;
      }
      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow = rows[0];
        setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
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

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState); // 페이지 초기화
    setMainDataResult(process([], {}));
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onKeepingDataStateChange = (event: GridDataStateChangeEvent) => {
    setKeepingDataState(event.dataState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onKeepingSortChange = (e: any) => {
    setKeepingDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onRowDoubleClick = (props: any) => {
    const selectedData = props.dataItem;
    setKeepingSelectedState({ [keepingDataResult.data.length + 1]: true });

    setKeepingDataResult((prev) => {
      return {
        data: [
          ...prev.data,
          ...[{ ...selectedData, idx: keepingDataResult.data.length + 1 }],
        ],
        total: prev.total + 1,
      };
    });
  };

  const onRemoveKeepingRow = () => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;

    keepingDataResult.data.forEach((item: any, index: number) => {
      if (!keepingSelectedState[item[KEEPING_DATA_ITEM_KEY]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        Object.push(index);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = keepingDataResult.data[Math.min(...Object2)];
    } else {
      data = keepingDataResult.data[Math.min(...Object) - 1];
    }
    setKeepingDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));

    setKeepingSelectedState({
      [data != undefined ? data[KEEPING_DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  const onConfirmBtnClick = (props: any) => {
    const newData = keepingDataResult.data.map((items) => {
      const dptcds = dptcdListData.find(
        (item: any) => item.dptnm == items.dptcd
      )?.dptcd;
      const abilcds = abilcdListData.find(
        (item: any) => item.code_name == items.abilcd
      )?.sub_code;
      const postcds = postcdListData.find(
        (item: any) => item.code_name == items.postcd
      )?.sub_code;
      return {
        prsnnum: items.prsnnum,
        prsnnm: items.prsnnm,
        dptcd: dptcds == undefined ? "" : dptcds,
        abilcd: abilcds == undefined ? "" : abilcds,
        postcd: postcds == undefined ? "" : postcds,
      };
    });
    setData(newData);
    onClose();
  };

  //메인 그리드 선택 이벤트
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };
  const onKeepingSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: keepingSelectedState,
      dataItemKey: KEEPING_DATA_ITEM_KEY,
    });

    setKeepingSelectedState(newSelectedState);
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

  const keepingTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = keepingDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {keepingDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const search = () => {
    resetAllGrid();
    setFilters((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
  };

  const [userWindowVisible, setuserWindowVisible] = useState<boolean>(false);

  const onUserWndClick = () => {
    setuserWindowVisible(true);
  };

  const setUserData = (data: IPrsnnum) => {
    setFilters((prev) => ({
      ...prev,
      prsnnum: data.prsnnum,
      prsnnm: data.prsnnm,
    }));
  };

  return (
    <Window
      titles={"사용자리스트(멀티)"}
      positions={position}
      Close={onClose}
      modals={modal}
      onChangePostion={onChangePostion}
    >
      <TitleContainer className="WindowTitleContainer">
        <Title></Title>
        <ButtonContainer>
          <Button onClick={() => search()} icon="search" themeColor={"primary"}>
            조회
          </Button>
        </ButtonContainer>
      </TitleContainer>
      <WindowFilterContainer>
        <FilterBox>
          <tbody>
            <tr>
              <th>사용자 ID</th>
              <td>
                <Input
                  name="prsnnum"
                  type="text"
                  value={filters.prsnnum}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onUserWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>사용자 이름</th>
              <td>
                <Input
                  name="prsnnm"
                  type="text"
                  value={filters.prsnnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>사용여부</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentRadioGroup
                    name="rtryn"
                    value={filters.rtryn}
                    bizComponentId="R_RTR"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </WindowFilterContainer>
      <GridContainer
        style={{
          overflow: "auto",
        }}
      >
        <GridTitleContainer className="WindowButtonContainer">
          <GridTitle>사용자 리스트</GridTitle>
        </GridTitleContainer>
        <Grid
          style={{ height: isMobile ? mobileheight : webheight }}
          data={process(
            mainDataResult.data.map((row) => ({
              ...row,
              dptcd: dptcdListData.find((item: any) => item.dptcd == row.dptcd)
                ?.dptnm,
              abilcd: abilcdListData.find(
                (item: any) => item.sub_code == row.abilcd
              )?.code_name,
              postcd: postcdListData.find(
                (item: any) => item.sub_code == row.postcd
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
          onSelectionChange={onMainSelectionChange}
          //스크롤 조회기능
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
          //더블클릭
          onRowDoubleClick={onRowDoubleClick}
        >
          <GridColumn
            field="prsnnum"
            title="사번"
            width="150px"
            footerCell={mainTotalFooterCell}
          />
          <GridColumn field="prsnnm" title="성명" width="150px" />
          <GridColumn field="dptcd" title="부서코드" width="120px" />
          <GridColumn field="abilcd" title="직책" width="120px" />
          <GridColumn field="postcd" title="직위" width="120px" />
        </Grid>
      </GridContainer>
      <GridContainer
        style={{
          overflow: "auto",
        }}
      >
        <GridTitleContainer className="WindowButtonContainer2">
          <GridTitle>Keeping</GridTitle>
        </GridTitleContainer>
        <Grid
          style={{ height: isMobile ? mobileheight2 : webheight2 }}
          data={process(
            keepingDataResult.data.map((row) => ({
              ...row,
              [SELECTED_FIELD]: keepingSelectedState[keepingIdGetter(row)], //선택된 데이터
            })),
            keepingDataState
          )}
          onDataStateChange={onKeepingDataStateChange}
          {...keepingDataState}
          //선택 기능
          dataItemKey={KEEPING_DATA_ITEM_KEY}
          selectedField={SELECTED_FIELD}
          selectable={{
            enabled: true,
            mode: "single",
          }}
          onSelectionChange={onKeepingSelectionChange}
          //스크롤 조회기능
          fixedScroll={true}
          total={keepingDataResult.total}
          //onScroll={onScrollHandler}
          //정렬기능
          sortable={true}
          onSortChange={onKeepingSortChange}
          //컬럼순서조정
          reorderable={true}
          //컬럼너비조정
          resizable={true}
          //더블클릭
          onRowDoubleClick={onRemoveKeepingRow}
        >
          <GridColumn
            field="prsnnum"
            title="사번"
            width="150px"
            footerCell={keepingTotalFooterCell}
          />
          <GridColumn field="prsnnm" title="성명" width="150px" />
          <GridColumn field="dptcd" title="부서코드" width="120px" />
          <GridColumn field="abilcd" title="직책" width="120px" />
          <GridColumn field="postcd" title="직위" width="120px" />
        </Grid>
      </GridContainer>
      <BottomContainer className="BottomContainer">
        <ButtonContainer>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            취소
          </Button>
          <Button themeColor={"primary"} onClick={onConfirmBtnClick}>
            확인
          </Button>
        </ButtonContainer>
      </BottomContainer>
      {userWindowVisible && (
        <UserWindow setVisible={setuserWindowVisible} setData={setUserData} />
      )}
    </Window>
  );
};

export default UserMultiWindow;
