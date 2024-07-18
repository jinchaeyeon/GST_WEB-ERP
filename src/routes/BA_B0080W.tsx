import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  GridContainer,
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
  UsePermissions,
  chkScrollHandler,
  getBizCom,
  getDeviceHeight,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState } from "../store/atoms";
import { Iparameters, TPermissions } from "../store/types";

let list: any[] = [];
const DATA_ITEM_KEY = "num";

var height = 0;

const BA_B0080W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height);
        setWebHeight(getDeviceHeight(true) - height);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight]);

  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();

  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        itemacnt: defaultOption.find((item: any) => item.id == "itemacnt")
          ?.valueCode,
        amtunit: defaultOption.find((item: any) => item.id == "amtunit")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA171,L_BA004,L_BA061,L_BA015,L_BA005,L_BA172,L_BA173",
    //대분류, 출고유형, 품목계정, 수량단위, 내수구분, 중분류, 소분류
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [itemacntListData, setItemacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl1ListData, setItemlvl1ListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [outkindListData, setOutkindstData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [doexdivListData, setDoexdivListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [qtyunitListData, setQtyunitListData] = React.useState([
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
      setItemacntListData(getBizCom(bizComponentData, "L_BA061"));
      setOutkindstData(getBizCom(bizComponentData, "L_BA004"));
      setQtyunitListData(getBizCom(bizComponentData, "L_BA015"));
      setItemlvl1ListData(getBizCom(bizComponentData, "L_BA171"));
      setItemlvl2ListData(getBizCom(bizComponentData, "L_BA172"));
      setItemlvl3ListData(getBizCom(bizComponentData, "L_BA173"));
      setDoexdivListData(getBizCom(bizComponentData, "L_BA005"));
    }
  }, [bizComponentData]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [listDataState, setListDataState] = useState<State>({
    sort: [],
  });

  const [listDataResult, setListDataResult] = useState<DataResult>(
    process([], listDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

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
    pgSize: PAGE_SIZE * 10,
    orgdiv: sessionOrgdiv,
    itemcd: "",
    itemnm: "",
    itemacnt: "",
    insiz: "",
    amtunit: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: false,
    pgGap: 0,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_BA_B0080W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "Q",
      "@p_orgdiv": filters.orgdiv,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_itemacnt": filters.itemacnt,
      "@p_insiz": filters.insiz,
      "@p_amtunit": filters.amtunit,
      "@p_serviceID": companyCode,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        const listname = rows.filter((item: { unpitem: any }, i: any) => {
          return (
            rows.findIndex((item2: { unpitem: any }, j: any) => {
              return item.unpitem == item2.unpitem;
            }) == i
          );
        });
        const result = rows.filter(
          (v: { 품목코드: any }, i: any) =>
            rows.findIndex(
              (x: { 품목코드: any }) => x.품목코드 == v.품목코드
            ) == i
        );
        rows.map((item: any) => {
          var unps = item.unp;
          rows.map((item2: any) => {
            if (
              item.품목코드 == item2.품목코드 &&
              item.unpitem == item2.unpitem &&
              item.num != item2.num
            ) {
              unps = unps + item2.unp;
            }
          });
          let object = {
            품목코드: item.품목코드,
            unpitem: item.unpitem,
            unp: unps,
          };
          list.push(object);
        });
        const arrUnique = list.filter((character, idx, arr) => {
          return (
            arr.findIndex(
              (item) =>
                item.품목코드 == character.품목코드 &&
                item.unpitem == character.unpitem
            ) == idx
          );
        });

        const arr = result.map((item: any) => {
          let Object: any = {};
          Object.amtunit = item.amtunit;
          Object.invunit = item.invunit;
          Object.num = item.num;
          Object.orgdiv = item.orgdiv;
          Object.remark = item.remark;
          Object.규격 = item.규격;
          Object.대분류 = item.대분류;
          Object.소분류 = item.소분류;
          Object.중분류 = item.중분류;
          Object.품목계정 = item.품목계정;
          Object.품목명 = item.품목명;
          Object.품목코드 = item.품목코드;
          Object.품번 = item.품번;
          var arrs: string[] = [];
          arrUnique.map((item2: any) => {
            listname.map((item3: any) => {
              if (
                item2.품목코드 == item3.품목코드 &&
                item.품목코드 == item3.품목코드
              ) {
                if (item2.unpitem == item3.unpitem) {
                  Object[`${item3.unpitem}_unp`] = item2.unp;
                  Object[`${item3.unpitem}_unpitem`] = item3.unpitem;
                  arrs.push(`${item3.unpitem}_unpitem`);
                } else if (!arrs.includes(`${item3.unpitem}_unpitem`)) {
                  Object[`${item3.unpitem}_unp`] = "";
                  Object[`${item3.unpitem}_unpitem`] = item3.unpitem;
                  arrs.push(`${item3.unpitem}_unpitem`);
                }
              }
            });
          });
          return Object;
        });

        setMainDataResult((prev) => {
          return {
            data: arr,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
        let listnames = listname.sort(function (
          a: { unpitem: string },
          b: { unpitem: string }
        ) {
          let x = a.unpitem.toLowerCase();
          let y = b.unpitem.toLowerCase();

          if (x < y) {
            return -1;
          }
          if (x > y) {
            return 1;
          }
          return 0;
        });
        setListDataResult((prev) => {
          return {
            data: listnames,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
        if (filters.find_row_value == "" && filters.pgNum == 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });
        }
      }
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  const createColumn = () => {
    const array: JSX.Element[] = [];

    if (listDataResult.data.length > 0) {
      listDataResult.data.map((item: any) => {
        if (item.unpitem == "") {
          array.push(
            <GridColumn field={""} title={`${item.unpitem}`} width="120px" />
          );
        } else {
          array.push(
            <GridColumn
              field={`${item.unpitem}_unp`}
              title={`${item.unpitem}`}
              width="120px"
            />
          );
        }
      });
    }
    return array;
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      setFilters((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid();
    }
  }, [filters, permissions, bizComponentData, customOptionData]);

  let gridRef: any = useRef(null);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters.find_row_value !== "" && mainDataResult.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = mainDataResult.data.findIndex(
          (item) => idGetter(item) == filters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.container.scroll(0, scrollHeight);

        //초기화
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters.scrollDirrection == "up") {
        gridRef.container.scroll(0, 20);
      }
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "요약정보";
      _export.save(optionsGridOne);
    }
  };

  //스크롤 핸들러
  const onMainScrollHandler = (event: GridEvent) => {
    if (filters.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      filters.pgNum + (filters.scrollDirrection == "up" ? filters.pgGap : 0);

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
      filters.pgNum - (filters.scrollDirrection == "down" ? filters.pgGap : 0);
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

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

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

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    resetAllGrid();
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
            />
          )}
        </ButtonContainer>
      </TitleContainer>
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
              <th>화폐단위</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="amtunit"
                    value={filters.amtunit}
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
      <GridContainer
        style={{
          width: isMobile ? "100%" : "100%",
        }}
      >
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
          fileName="단가조회"
        >
          {isMobile ? (
            <Grid
              style={{
                height: isMobile ? mobileheight : webheight,
              }}
              data={process(
                mainDataResult.data.map((row) => ({
                  ...row,
                  outkind: outkindListData.find(
                    (item: any) => item.sub_code == row.outkind
                  )?.code_name,
                  doexdiv: doexdivListData.find(
                    (item: any) => item.sub_code == row.doexdiv
                  )?.code_name,
                  대분류: itemlvl1ListData.find(
                    (item: any) => item.sub_code == row.대분류
                  )?.code_name,
                  중분류: itemlvl2ListData.find(
                    (item: any) => item.sub_code == row.중분류
                  )?.code_name,
                  소분류: itemlvl3ListData.find(
                    (item: any) => item.sub_code == row.소분류
                  )?.code_name,
                  qtyunit: qtyunitListData.find(
                    (item: any) => item.sub_code == row.qtyunit
                  )?.code_name,
                  품목계정: itemacntListData.find(
                    (item: any) => item.sub_code == row.품목계정
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
              onScroll={onMainScrollHandler}
              //정렬기능
              sortable={true}
              onSortChange={onMainSortChange}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
            >
              <GridColumn field="품목코드" title="품목코드" width="120px" />
              <GridColumn field="품목명" title="품목명" width="150px" />
              <GridColumn field="품목계정" title="품목계정" width="120px" />
              <GridColumn field="규격" title="규격" width="140px" />
              <GridColumn field="대분류" title="대분류" width="120px" />
              <GridColumn field="중분류" title="중분류" width="120px" />
              <GridColumn field="소분류" title="소분류" width="120px" />
              {createColumn()}
            </Grid>
          ) : (
            <Grid
              style={{
                height: isMobile ? mobileheight : webheight,
              }}
              data={process(
                mainDataResult.data.map((row) => ({
                  ...row,
                  outkind: outkindListData.find(
                    (item: any) => item.sub_code == row.outkind
                  )?.code_name,
                  doexdiv: doexdivListData.find(
                    (item: any) => item.sub_code == row.doexdiv
                  )?.code_name,
                  대분류: itemlvl1ListData.find(
                    (item: any) => item.sub_code == row.대분류
                  )?.code_name,
                  중분류: itemlvl2ListData.find(
                    (item: any) => item.sub_code == row.중분류
                  )?.code_name,
                  소분류: itemlvl3ListData.find(
                    (item: any) => item.sub_code == row.소분류
                  )?.code_name,
                  qtyunit: qtyunitListData.find(
                    (item: any) => item.sub_code == row.qtyunit
                  )?.code_name,
                  품목계정: itemacntListData.find(
                    (item: any) => item.sub_code == row.품목계정
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
              onScroll={onMainScrollHandler}
              //정렬기능
              sortable={true}
              onSortChange={onMainSortChange}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
            >
              <GridColumn
                field="품목코드"
                title="품목코드"
                width="120px"
                locked={isMobile ? false : true}
              />
              <GridColumn
                field="품목명"
                title="품목명"
                width="150px"
                locked={isMobile ? false : true}
              />
              <GridColumn
                field="품목계정"
                title="품목계정"
                width="120px"
                locked={isMobile ? false : true}
              />
              <GridColumn
                field="규격"
                title="규격"
                width="140px"
                locked={isMobile ? false : true}
              />
              <GridColumn
                field="대분류"
                title="대분류"
                width="120px"
                locked={isMobile ? false : true}
              />
              <GridColumn
                field="중분류"
                title="중분류"
                width="120px"
                locked={isMobile ? false : true}
              />
              <GridColumn
                field="소분류"
                title="소분류"
                width="120px"
                locked={isMobile ? false : true}
              />
              {createColumn()}
            </Grid>
          )}
        </ExcelExport>
      </GridContainer>
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
          modal={true}
        />
      )}
    </>
  );
};

export default BA_B0080W;
