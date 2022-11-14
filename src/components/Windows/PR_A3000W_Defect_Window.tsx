import { useEffect, useState, useCallback } from "react";
import * as React from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  getSelectedState,
  Grid,
  GridCellProps,
  GridColumn,
  GridHeaderSelectionChangeEvent,
  GridSelectionChangeEvent,
  GridToolbar,
} from "@progress/kendo-react-grid";
import { DataResult, getter, process, State } from "@progress/kendo-data-query";
import { useApi } from "../../hooks/api";
import {
  BottomContainer,
  ButtonContainer,
  FieldWrap,
  GridContainer,
} from "../../CommonStyled";
import {
  Form,
  Field,
  FormElement,
  FieldArray,
  FieldArrayRenderProps,
  FormRenderProps,
} from "@progress/kendo-react-form";
import { Error } from "@progress/kendo-react-labels";
import { clone } from "@progress/kendo-react-common";
import {
  FormReadOnly,
  CellComboBox,
  CellCheckBox,
  NumberCell,
} from "../Editors";
import { Iparameters } from "../../store/types";
import {
  validator,
  arrayLengthValidator,
  UseBizComponent,
  UseMessages,
  findMessage,
  getYn,
  getCodeFromValue,
} from "../CommonFunction";
import { Button } from "@progress/kendo-react-buttons";
import { IWindowPosition } from "../../hooks/interfaces";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  FORM_DATA_INDEX,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../CommonString";
import { CellRender, RowRender } from "../Renderers";
import { sessionItemState, tokenState } from "../../store/atoms";
import { useRecoilState } from "recoil";

// Create React.Context to pass props to the Form Field components from the main component
export const FormGridEditContext = React.createContext<{
  onSave: () => void;
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
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_QC002", setBizComponentData); // 불량유형

  //const field = props.field ?? "";
  // const bizComponentIdVal =
  //   field === "itemacnt" ? "L_BA061" : field === "qtyunit" ? "L_BA015" : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === "L_QC002"
  );

  return bizComponent ? (
    <CellComboBox bizComponent={bizComponent} {...props} />
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
  const { validationMessage, visited, name, dataItemKey } =
    fieldArrayRenderProps;
  const [editIndex, setEditIndex] = React.useState<number | undefined>();
  const editItemCloneRef = React.useRef();

  // Save the changes
  const onSave = React.useCallback(() => {
    setEditIndex(undefined);
  }, [fieldArrayRenderProps]);

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
        rowstatus: dataItem.rowstatus === "N" ? dataItem.rowstatus : "U",
        [EDIT_FIELD]: field,
      },
    });

    setEditIndex(dataItem[FORM_DATA_INDEX]);
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

  // Add a new item to the Form FieldArray that will be shown in the Grid
  const onAdd = React.useCallback(
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

  const onRemove = React.useCallback(() => {
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

  return (
    <GridContainer margin={{ top: "30px" }}>
      <FormGridEditContext.Provider
        value={{
          onSave,
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
          dataItemKey={dataItemKey}
          style={{ height: "400px" }}
          cellRender={customCellRender}
          rowRender={customRowRender}
          selectedField={SELECTED_FIELD}
          selectable={{
            enabled: true,
            drag: false,
            cell: false,
            mode: "multiple",
          }}
          onSelectionChange={onSelectionChange}
          onHeaderSelectionChange={onHeaderSelectionChange}
        >
          <GridToolbar>
            <Button
              type={"button"}
              themeColor={"primary"}
              fillMode="outline"
              onClick={onAdd}
              icon="add"
            >
              추가
            </Button>
            <Button
              type={"button"}
              themeColor={"primary"}
              fillMode="outline"
              onClick={onRemove}
              icon="minus"
            >
              삭제
            </Button>
          </GridToolbar>

          <GridColumn
            field={SELECTED_FIELD}
            width="45px"
            headerSelectionValue={
              dataWithIndexes.findIndex(
                (item: any) => !selectedState[idGetter(item)]
              ) === -1
            }
          />
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
            cell={NumberCell}
            width="240px"
          />
        </Grid>
      </FormGridEditContext.Provider>
    </GridContainer>
  );
};
const KendoWindow = ({ setVisible, rekey, setData }: TKendoWindow) => {
  const [token] = useRecoilState(tokenState);
  const { userId } = token;

  // 비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>([]);
  UseBizComponent("L_BA000", setBizComponentData);

  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 800,
    height: 600,
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
    setVisible(false);
  };

  const [formKey, setFormKey] = React.useState(1);
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
    fetchGrid();
  }, []);

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
        (sessionItem) => sessionItem.code === "orgdiv"
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
    let data: any;

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

      setDetailDataResult(() => {
        return {
          data: [...rows],
          total: totalRowCnt,
        };
      });
    }
  };

  const pathname: string = window.location.pathname.replace("/", "");

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //프로시저 파라미터 초기값
  const [paraData, setParaData] = useState({
    work_type: "",
    rekey: rekey,
    badcd_s: "",
    badqty_s: "",
    remark_s: "",
    userid: userId,
    pc: "",
    form_id: pathname,
  });

  //프로시저 파라미터
  const paraSaved: Iparameters = {
    procedureName: "P_PR_P0070W_S ",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.work_type,
      "@p_orgdiv": sessionItem.find(
        (sessionItem) => sessionItem.code === "orgdiv"
      )?.value,
      "@p_location": sessionItem.find(
        (sessionItem) => sessionItem.code === "location"
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
    let data: any;

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
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

      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    setParaData((prev) => ({ ...prev, work_type: "" })); //초기화
  };

  const handleSubmit = (dataItem: { [name: string]: any }) => {
    const { dataDetails } = dataItem;

    let detailArr: TDetailData = {
      badcd_s: [],
      badqty_s: [],
      remark_s: [],
    };

    dataDetails.forEach((item: any, i: number) => {
      const { rowstatus, badcd, badqty } = item;
      //if (rowstatus !== "U") return;

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
    if (paraData.work_type !== "") fetchSaved();
  }, [paraData]);

  useEffect(() => {
    if (bizComponentData.length) {
      resetAllGrid();
      fetchGrid();
    }
  }, [bizComponentData]);

  return (
    <Window
      title={"불량유형 입력"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
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
            />

            <BottomContainer>
              <ButtonContainer>
                <Button type={"submit"} themeColor={"primary"}>
                  확인
                </Button>
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
