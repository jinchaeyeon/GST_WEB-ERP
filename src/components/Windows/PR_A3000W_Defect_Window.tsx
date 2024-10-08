import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  FieldArray,
  FieldArrayRenderProps,
  Form,
  FormElement,
  FormRenderProps,
} from "@progress/kendo-react-form";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridHeaderSelectionChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Error } from "@progress/kendo-react-labels";
import * as React from "react";
import {
  createContext,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useThemeSwitcher } from "react-css-theme-switcher";
import { useRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  GridContainer,
  NumberKeypad,
  NumberKeypadCell,
  NumberKeypadRow,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { sessionItemState } from "../../store/atoms";
import { Iparameters, TPermissions } from "../../store/types";
import {
  UseBizComponent,
  UseGetValueFromSessionItem,
  UsePermissions,
  arrayLengthValidator,
  getCodeFromValue,
  getFormId,
  getHeight,
  getWindowDeviceHeight
} from "../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  FORM_DATA_INDEX,
  SELECTED_FIELD,
} from "../CommonString";
import { FormComboBoxCell, FormNumberCell } from "../Editors";
import { CellRender, RowRender } from "../Renderers/Renderers";
import Window from "./WindowComponent/Window";

// Create React.Context to pass props to the Form Field components from the main component
export const FormGridEditContext = createContext<{
  editIndex: number | undefined;
  parentField: string;
}>({} as any);

type TKendoWindow = {
  setVisible(isVisible: boolean): void;
  rekey: string;
  setData(badqty: number): void;
};

let deletedRows: object[] = [];
const idGetter = getter(FORM_DATA_INDEX);

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_QC002", setBizComponentData); // 불량유형

  //const field = props.field ?? "";
  // const bizComponentIdVal =
  //   field == "itemacnt" ? "L_BA061" : field == "qtyunit" ? "L_BA015" : "";

  const bizComponent = bizComponentData?.find(
    (item: any) => item.bizComponentId == "L_QC002"
  );

  return bizComponent ? (
    <FormComboBoxCell
      bizComponent={bizComponent}
      {...props}
      id="comboboxcells"
    />
  ) : (
    <td />
  );
};

type TDetailData = {
  badcd_s: string[];
  badqty_s: number[];
  remark_s: string[];
};

// Create the Grid that will be used inside the Form
const FormGrid = (fieldArrayRenderProps: FieldArrayRenderProps) => {
  const { validationMessage, visited, name, height } = fieldArrayRenderProps;
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const editItemCloneRef = useRef();
  const { switcher, themes, currentTheme = "" } = useThemeSwitcher();

  const dataWithIndexes = fieldArrayRenderProps.value.map(
    (item: any, index: any) => {
      return { ...item, [FORM_DATA_INDEX]: index };
    }
  );

  const enterEdit = (dataItem: any, field: string | undefined) => {
    fieldArrayRenderProps.onReplace({
      index: dataItem[FORM_DATA_INDEX],
      value: {
        ...dataItem,
        rowstatus: dataItem.rowstatus == "N" ? dataItem.rowstatus : "U",
        [EDIT_FIELD]: field,
      },
    });

    setEditIndex(dataItem[FORM_DATA_INDEX]);

    // input 클릭하여 edit 시 onSelectionChange 동작 안하여서 강제로 setSelectedState 처리
    setSelectedState({ [dataItem[FORM_DATA_INDEX]]: true });
  };

  const exitEdit = (item: any) => {
    fieldArrayRenderProps.value.forEach((item: any, index: any) => {
      fieldArrayRenderProps.onReplace({
        index: index,
        value: {
          ...item,
          [EDIT_FIELD]: undefined,
        },
      });
    });
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

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  useEffect(() => {
    setSelectedState({ [0]: true });
  }, []);

  const onSelectionChange = useCallback(
    (event: GridSelectionChangeEvent) => {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState,
        dataItemKey: FORM_DATA_INDEX,
      });

      setSelectedState(newSelectedState);
    },
    [selectedState]
  );

  const onHeaderSelectionChange = useCallback(
    (event: GridHeaderSelectionChangeEvent) => {
      const checkboxElement: any = event.syntheticEvent.target;
      const checked = checkboxElement.checked;
      const newSelectedState: {
        [id: string]: boolean | number[];
      } = {};

      event.dataItems.forEach((item) => {
        newSelectedState[idGetter(item)] = checked;
      });

      setSelectedState(newSelectedState);

      //선택된 상태로 리랜더링
      event.dataItems.forEach((item: any, index: number) => {
        fieldArrayRenderProps.onReplace({
          index: index,
          value: {
            ...item,
          },
        });
      });
    },
    []
  );

  const onAdd = useCallback(
    (e: any) => {
      e.preventDefault();
      fieldArrayRenderProps.onPush({
        value: {
          rowstatus: "N",
          badcd: COM_CODE_DEFAULT_VALUE,
          badqty: 0,
        },
      });

      setEditIndex(0);
    },
    [fieldArrayRenderProps]
  );

  const onRemove = useCallback(() => {
    let newData: any[] = [];

    //삭제 안 할 데이터 newData에 push, 삭제 데이터 deletedRows에 push
    fieldArrayRenderProps.value.forEach((item: any, index: number) => {
      if (!selectedState[index]) {
        newData.push(item);
      } else {
        deletedRows.push(item);
      }
    });

    //전체 데이터 삭제
    fieldArrayRenderProps.value.forEach(() => {
      fieldArrayRenderProps.onRemove({
        index: 0,
      });
    });

    //newData 생성
    newData.forEach((item: any) => {
      fieldArrayRenderProps.onPush({
        value: item,
      });
    });

    //선택 상태 초기화
    setSelectedState({});

    //수정 상태 초기화
    setEditIndex(undefined);
  }, [fieldArrayRenderProps]);

  // 키패드 숫자 입력
  const enterNumber = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const selectedDataKey = Object.getOwnPropertyNames(selectedState)[0];
    if (!selectedDataKey) {
      // 그리드 선택 행 없을 시 리턴
      return false;
    }
    const selectedData = dataWithIndexes[selectedDataKey];
    const selectedIdx = dataWithIndexes[selectedDataKey][FORM_DATA_INDEX];
    const value = e.currentTarget.innerText;

    // 소수점 한개 초과 입력 시 리턴
    if (value == "." && String(selectedData["badqty"]).includes(".")) {
      return false;
    }

    if (value !== "") {
      //숫자, 소수점 입력
      fieldArrayRenderProps.onReplace({
        index: selectedIdx,
        value: {
          ...selectedData,
          rowstatus: "U",
          badqty:
            value == "."
              ? selectedData["badqty"] + value // 소수점 입력시 스트링으로 처리
              : Number(String(selectedData["badqty"]) + value),
        },
      });
    } else {
      //삭제
      fieldArrayRenderProps.onReplace({
        index: selectedIdx,
        value: {
          ...selectedData,
          rowstatus: "U",
          badqty: Number(String(selectedData["badqty"]).slice(0, -1)),
        },
      });
    }
  };

  return (
    <GridContainer>
      <FormGridEditContext.Provider
        value={{
          editIndex,
          parentField: name,
        }}
      >
        {visited && validationMessage && <Error>{validationMessage}</Error>}
        <Grid
          data={dataWithIndexes.map((item: any) => ({
            ...item,
            parentField: name,
            [SELECTED_FIELD]: selectedState[idGetter(item)],
          }))}
          total={dataWithIndexes.total}
          style={{ height: height }}
          cellRender={customCellRender}
          //선택기능
          dataItemKey={FORM_DATA_INDEX}
          rowRender={customRowRender}
          selectedField={SELECTED_FIELD}
          selectable={{
            enabled: true,
            drag: false,
            cell: false,
            mode: "single",
          }}
          onSelectionChange={onSelectionChange}
        >
          <GridColumn field="rowstatus" title=" " width="40px" />

          <GridColumn
            field="badcd"
            title="불량유형"
            cell={CustomComboBoxCell}
            width="240px"
          />
          <GridColumn
            field="badqty"
            title="불량수량"
            cell={FormNumberCell}
            width="240px"
          />
        </Grid>

        <NumberKeypad className="Keypads">
          <NumberKeypadRow>
            <NumberKeypadCell theme={currentTheme} onClick={enterNumber}>
              1
            </NumberKeypadCell>
            <NumberKeypadCell theme={currentTheme} onClick={enterNumber}>
              2
            </NumberKeypadCell>
            <NumberKeypadCell theme={currentTheme} onClick={enterNumber}>
              3
            </NumberKeypadCell>
          </NumberKeypadRow>
          <NumberKeypadRow>
            <NumberKeypadCell theme={currentTheme} onClick={enterNumber}>
              4
            </NumberKeypadCell>
            <NumberKeypadCell theme={currentTheme} onClick={enterNumber}>
              5
            </NumberKeypadCell>
            <NumberKeypadCell theme={currentTheme} onClick={enterNumber}>
              6
            </NumberKeypadCell>
          </NumberKeypadRow>
          <NumberKeypadRow>
            <NumberKeypadCell theme={currentTheme} onClick={enterNumber}>
              7
            </NumberKeypadCell>
            <NumberKeypadCell theme={currentTheme} onClick={enterNumber}>
              8
            </NumberKeypadCell>
            <NumberKeypadCell theme={currentTheme} onClick={enterNumber}>
              9
            </NumberKeypadCell>
          </NumberKeypadRow>
          <NumberKeypadRow>
            <NumberKeypadCell theme={currentTheme} onClick={enterNumber}>
              .
            </NumberKeypadCell>
            <NumberKeypadCell theme={currentTheme} onClick={enterNumber}>
              0
            </NumberKeypadCell>
            <NumberKeypadCell theme={currentTheme} onClick={enterNumber}>
              <span className={"k-icon k-i-x"}></span>
            </NumberKeypadCell>
          </NumberKeypadRow>
        </NumberKeypad>
      </FormGridEditContext.Provider>
    </GridContainer>
  );
};

var height = 0;
var height2 = 0;
var height3 = 0;

const KendoWindow = ({ setVisible, rekey, setData }: TKendoWindow) => {
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
  const userId = UseGetValueFromSessionItem("user_id");
  const pc = UseGetValueFromSessionItem("pc");
  // 비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_BA000", setBizComponentData);

  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 800) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 600) / 2,
    width: isMobile == true ? deviceWidth : 800,
    height: isMobile == true ? deviceHeight : 600,
  });

  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  useLayoutEffect(() => {
    height = getHeight(".k-window-titlebar"); //공통 해더
    height2 = getHeight(".BottomContainer"); //탭 부분
    height3 = getHeight(".Keypads"); //탭 부분

    setMobileHeight(
      getWindowDeviceHeight(false, deviceHeight) - height - height2 - height3
    );
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height2 - height3
    );
  }, []);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height2 - height3
    );
  };
  const onClose = () => {
    setVisible(false);
  };

  const [formKey, setFormKey] = useState(1);
  const resetForm = () => {
    setFormKey(formKey + 1);
  };
  //수정 없이 submit 가능하도록 임의 value를 change 시켜줌
  useEffect(() => {
    const valueChanged = document.getElementById("valueChanged");
    valueChanged!.click();
  }, [formKey]);

  const processApi = useApi();
  const [dataState, setDataState] = useState<State>({
    skip: 0,
    take: 20,
  });

  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], dataState)
  );
  useEffect(() => {
    if (permissions.view && bizComponentData !== null) {
      fetchGrid();
    }
  }, [permissions, bizComponentData]);

  // 세션 아이템
  const [sessionItem] = useRecoilState(sessionItemState);

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_PR_P0070W_Q",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": "Q",
      "@p_orgdiv": sessionItem.find(
        (sessionItem) => sessionItem.code == "orgdiv"
      )?.value,
      "@p_rekey": rekey,
    },
  };

  //fetch된 그리드 데이터가 그리드 폼에 세팅되도록 하기 위해 적용
  useEffect(() => {
    resetForm();
  }, [detailDataResult]);

  //상세그리드 조회
  const fetchGrid = async () => {
    if (!permissions.view) return;
    let data: any;

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });

      setDetailDataResult(() => {
        return {
          data: [...rows],
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
    }
  };

  //프로시저 파라미터 초기값
  const [paraData, setParaData] = useState({
    work_type: "",
    rekey: rekey,
    badcd_s: "",
    badqty_s: "",
    remark_s: "",
    userid: userId,
    pc: pc,
    form_id: getFormId(),
  });

  //프로시저 파라미터
  const paraSaved: Iparameters = {
    procedureName: "P_PR_P0070W_S ",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.work_type,
      "@p_orgdiv": sessionItem.find(
        (sessionItem) => sessionItem.code == "orgdiv"
      )?.value,
      "@p_location": sessionItem.find(
        (sessionItem) => sessionItem.code == "location"
      )?.value,
      "@p_rekey": paraData.rekey,
      "@p_badcd_s": paraData.badcd_s,
      "@p_badqty_s": paraData.badqty_s,
      "@p_remark_s": paraData.remark_s,
      "@p_userid": paraData.userid,
      "@p_pc": paraData.pc,
      "@p_form_id": paraData.form_id,
    },
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setDetailDataResult(process([], dataState));
  };

  const fetchSaved = async () => {
    if (!permissions.save) return;
    let data: any;

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const badqtyArr = paraData.badqty_s
        .split("|")
        .map((item) => Number(item));
      let badqtySum = 0;

      badqtyArr.forEach((item) => {
        badqtySum += item;
      });

      setData(badqtySum);
      onClose();
      // resetAllGrid();
      // fetchGrid();
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }

    setParaData((prev) => ({ ...prev, work_type: "" })); //초기화
  };

  const handleSubmit = (dataItem: { [name: string]: any }) => {
    if (!permissions.save) return;
    const { dataDetails } = dataItem;

    let detailArr: TDetailData = {
      badcd_s: [],
      badqty_s: [],
      remark_s: [],
    };

    dataDetails.forEach((item: any, i: number) => {
      const { rowstatus, badcd, badqty } = item;
      //if (rowstatus !== "U") return;
      if (badqty <= 0) return;

      detailArr.badcd_s.push(getCodeFromValue(badcd));
      detailArr.badqty_s.push(badqty);
      detailArr.remark_s.push("");
    });

    setParaData((prev) => ({
      ...prev,
      work_type: "N",
      badcd_s: detailArr.badcd_s.join("|"),
      badqty_s: detailArr.badqty_s.join("|"),
      remark_s: detailArr.remark_s.join("|"),
    }));
  };

  useEffect(() => {
    if (paraData.work_type !== "" && permissions.save) fetchSaved();
  }, [paraData]);

  useEffect(() => {
    if (bizComponentData !== null) {
      resetAllGrid();
      fetchGrid();
    }
  }, [bizComponentData]);

  return (
    <Window
      titles={"불량유형 입력"}
      positions={position}
      Close={onClose}
      modals={true}
      onChangePostion={onChangePostion}
    >
      <Form
        onSubmit={handleSubmit}
        key={formKey}
        initialValues={{
          dataDetails: detailDataResult.data, //detailDataResult.data,
        }}
        render={(formRenderProps: FormRenderProps) => (
          <FormElement horizontal={true}>
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
            </fieldset>
            <FieldArray
              name="dataDetails"
              dataItemKey={FORM_DATA_INDEX}
              component={FormGrid}
              validator={arrayLengthValidator}
              height={isMobile ? mobileheight : webheight}
            />

            <BottomContainer className="BottomContainer">
              <ButtonContainer>
                {permissions.save && (
                  <Button type={"submit"} themeColor={"primary"}>
                    확인
                  </Button>
                )}
                <Button
                  type={"button"}
                  onClick={onClose}
                  themeColor={"primary"}
                  fillMode={"outline"}
                  //icon="cancel"
                >
                  취소
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
