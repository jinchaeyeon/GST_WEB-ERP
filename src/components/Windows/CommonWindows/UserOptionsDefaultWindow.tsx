import { createContext, useEffect, useState } from "react";
import * as React from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridEvent,
  GridToolbar,
  GridSelectionChangeEvent,
  getSelectedState,
  GridHeaderSelectionChangeEvent,
  GridHeaderCellProps,
  GridCellProps,
} from "@progress/kendo-react-grid";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import { useApi } from "../../../hooks/api";
import {
  BottomContainer,
  ButtonContainer,
  FieldWrap,
  GridContainer,
} from "../../../CommonStyled";
import {
  Form,
  Field,
  FormElement,
  FieldArray,
  FieldArrayRenderProps,
  FormRenderProps,
} from "@progress/kendo-react-form";
import { Error } from "@progress/kendo-react-labels";
import {
  FormNumberCell,
  FormNameCell,
  FormComboBox,
  FormComboBoxCell,
  FormCheckBoxCell,
} from "../../Editors";
import { Iparameters } from "../../../store/types";
import {
  arrayLengthValidator,
  chkScrollHandler,
  getBrowser,
  getCodeFromValue,
  getYn,
  UseGetIp,
  validator,
} from "../../CommonFunction";
import { Button } from "@progress/kendo-react-buttons";
import { IWindowPosition } from "../../../hooks/interfaces";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  FORM_DATA_INDEX,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../../CommonString";
import { CellRender, RowRender } from "../../Renderers";
import { useRecoilState } from "recoil";
import { tokenState } from "../../../store/atoms";
import CheckBoxCell from "../../Cells/CheckBoxCell";

// Create React.Context to pass props to the Form Field components from the main component
export const USER_OPTIONS_DEFAULT_WINDOW_FORM_GRID_EDIT_CONTEXT =
  createContext<{
    editIndex: number | undefined;
    parentField: string;
  }>({} as any);

let deletedRows: object[] = [];

const DATA_ITEM_KEY = "default_id ";
const idGetter = getter(FORM_DATA_INDEX);

type TPara = {
  option_id: string;
  option_name: string;
};
type TKendoWindow = {
  setVisible(t: boolean): void;
  workType: "N" | "U";
  para: TPara;
  reloadData: () => void;
};

type TDetailData = {
  row_status: string[];
  default_id: string[];
  caption: string[];
  word_id: string[];
  sort_order: string[];
  value_type: string[];
  value_code: string[];
  value: string[];
  bc_id: string[];
  where_query: string[];
  add_year: string[];
  add_month: string[];
  add_day: string[];
  session_item: string[];
  use_session: string[];
  user_editable: string[];
};

const valueTypeData = [
  { sub_code: "Text", code_name: "Text" },
  { sub_code: "Radio", code_name: "Radio" },
  { sub_code: "Datetime", code_name: "Datetime" },
  { sub_code: "Lookup", code_name: "Lookup" },
];

const valueTypeColumn = [
  {
    sortOrder: 1,
    fieldName: "sub_code",
    caption: "코드",
    columnWidth: 0,
    dataAlignment: "LEFT",
  },
  {
    sortOrder: 1,
    fieldName: "code_name",
    caption: "코드",
    columnWidth: 100,
    dataAlignment: "LEFT",
  },
];

const sessionItemData = [
  { sub_code: "UserId", code_name: "사용자ID" },
  { sub_code: "UserName", code_name: "사용자이름" },
  { sub_code: "orgdiv", code_name: "회사구분" },
  { sub_code: "location", code_name: "사업장" },
  { sub_code: "position", code_name: "사업부" },
  { sub_code: "dptcd", code_name: "부서코드" },
  { sub_code: "postcd", code_name: "직급코드" },
];

const sessionItemTypeColumn = [
  {
    sortOrder: 1,
    fieldName: "sub_code",
    caption: "코드",
    columnWidth: 100,
    dataAlignment: "LEFT",
  },
  {
    sortOrder: 2,
    fieldName: "code_name",
    caption: "코드명",
    columnWidth: 100,
    dataAlignment: "LEFT",
  },
];

const typeData = [
  { sub_code: "QUERY", code_name: "조회조건" },
  { sub_code: "NEW", code_name: "신규" },
];

const typeColumn = [
  {
    sortOrder: 1,
    fieldName: "sub_code",
    caption: "타입ID",
    columnWidth: 100,
    dataAlignment: "LEFT",
  },
  {
    sortOrder: 2,
    fieldName: "code_name",
    caption: "설명",
    columnWidth: 100,
    dataAlignment: "LEFT",
  },
];

const valueTypeComboBoxCell = (props: GridCellProps) => {
  return (
    <FormComboBoxCell
      data={valueTypeData}
      columns={valueTypeColumn}
      {...props}
    />
  );
};
const sessionItemComboBoxCell = (props: GridCellProps) => {
  return (
    <FormComboBoxCell
      data={sessionItemData}
      columns={sessionItemTypeColumn}
      {...props}
    />
  );
};

// Create the Grid that will be used inside the Form
const FormGrid = (fieldArrayRenderProps: FieldArrayRenderProps) => {
  const { validationMessage, visited, name, dataItemKey } =
    fieldArrayRenderProps;
  const [editIndex, setEditIndex] = React.useState<number | undefined>();
  const [detailPgNum, setDetailPgNum] = useState(1);

  // Add a new item to the Form FieldArray that will be shown in the Grid
  const onAdd = React.useCallback(
    (e: any) => {
      e.preventDefault();
      fieldArrayRenderProps.onPush({
        value: {
          srcPgName: "USER_OPTIONS_DEFAULT_WINDOW",
          rowstatus: "N",
          value_type: COM_CODE_DEFAULT_VALUE,
          use_session: "N",
          user_editable: "Y",
          add_year: 0,
          add_month: 0,
          add_day: 0,
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

  const dataWithIndexes = fieldArrayRenderProps.value.map(
    (item: any, index: any) => {
      return { ...item, [FORM_DATA_INDEX]: index };
    }
  );

  //스크롤 핸들러
  const scrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, detailPgNum, PAGE_SIZE))
      setDetailPgNum((prev) => prev + 1);
  };

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

  const [selectedState, setSelectedState] = React.useState<{
    [id: string]: boolean | number[];
  }>({});

  const onSelectionChange = React.useCallback(
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

  const onHeaderSelectionChange = React.useCallback(
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

  interface ProductNameHeaderProps extends GridHeaderCellProps {
    children: any;
  }

  const RequiredHeader = (props: ProductNameHeaderProps) => {
    return (
      <span className="k-cell-inner">
        <a className="k-link" onClick={props.onClick}>
          <span style={{ color: "#ff6358" }}>{props.title}</span>
          {props.children}
        </a>
      </span>
    );
  };

  return (
    <GridContainer margin={{ top: "30px" }}>
      <USER_OPTIONS_DEFAULT_WINDOW_FORM_GRID_EDIT_CONTEXT.Provider
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
          dataItemKey={dataItemKey}
          style={{ height: "550px" }}
          cellRender={customCellRender}
          rowRender={customRowRender}
          onScroll={scrollHandler}
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

          {/* <GridColumn
            field={SELECTED_FIELD}
            width="45px"
            headerSelectionValue={
              dataWithIndexes.findIndex(
                (item: any) => !selectedState[idGetter(item)]
              ) === -1
            }
          /> */}
          <GridColumn field="rowstatus" title=" " width="40px" />
          <GridColumn
            field="default_id"
            title="필드명"
            width="130px"
            cell={FormNameCell}
            headerCell={RequiredHeader}
            className="required editable-new-only"
          />
          <GridColumn
            field="caption"
            title="캡션"
            width="130px"
            cell={FormNameCell}
          />
          <GridColumn
            field="value_type"
            title="VALUE타입"
            width="120px"
            cell={valueTypeComboBoxCell}
            headerCell={RequiredHeader}
            className="required"
          />
          <GridColumn
            field="value_code"
            title="VALUE 코드"
            width="100px"
            cell={FormNameCell}
          />
          <GridColumn
            field="value"
            title="VALUE 이름"
            width="100px"
            cell={FormNameCell}
          />
          <GridColumn
            field="bc_id"
            title="비즈니스 컴포넌트 ID"
            width="170px"
            cell={FormNameCell}
          />
          <GridColumn
            field="session_item"
            title="세션 아이템"
            width="170px"
            cell={sessionItemComboBoxCell}
          />
          <GridColumn
            field="use_session"
            title="세션 사용유무"
            width="120px"
            cell={FormCheckBoxCell}
          />
          <GridColumn
            field="add_year"
            title="연 추가"
            width="90px"
            cell={FormNumberCell}
          />
          <GridColumn
            field="add_month"
            title="월 추가"
            width="90px"
            cell={FormNumberCell}
          />
          <GridColumn
            field="add_day"
            title="일 추가"
            width="90px"
            cell={FormNumberCell}
          />
          <GridColumn
            field="user_editable"
            title="사용자 수정 가능 여부"
            width="180px"
            cell={FormCheckBoxCell}
          />
        </Grid>
      </USER_OPTIONS_DEFAULT_WINDOW_FORM_GRID_EDIT_CONTEXT.Provider>
    </GridContainer>
  );
};
const KendoWindow = ({
  setVisible,
  workType,
  para,
  reloadData,
}: TKendoWindow) => {
  const { option_id, option_name } = para;
  const pathname: string = window.location.pathname.replace("/", "");
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 1200,
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
    setVisible(false);
  };

  //수정 없이 submit 가능하도록 임의 value를 change 시켜줌
  const [formKey, setFormKey] = React.useState(1);
  const resetForm = () => {
    setFormKey(formKey + 1);
  };
  useEffect(() => {
    const valueChanged = document.getElementById("valueChanged");
    valueChanged!.click();
  }, [formKey]);

  const processApi = useApi();

  const [dataState, setDataState] = useState<State>({
    skip: 0,
    take: 20,
    //sort: [{ field: "customerID", dir: "asc" }],
    group: [{ field: "itemacnt" }],
  });

  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], dataState)
  );

  const [initialVal, setInitialVal] = useState({
    option_id: "",
    option_name: "",
  });

  //요약정보 조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "sel_custom_option",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": "detail",
      "@p_form_id": pathname,
      "@p_type": "Default",
      "@p_option_id": workType === "U" ? option_id : "",
      "@p_option_name": "",
      "@p_remarks": "",
      "@p_company_code": "",
    },
  };

  const [token] = useRecoilState(tokenState);
  const { userId } = token;

  const [ip, setIp] = useState("");
  const browser = getBrowser();
  UseGetIp(setIp);
  const pc = `${ip}|${browser}`;

  //프로시저 파라미터 초기값
  const [paraData, setParaData] = useState({
    work_type: "",
    form_id: pathname,
    type: "Default",
    company_code: "",
    option_id: "",
    option_name: "",
    subject_word_id: "",
    remarks: "",
    row_status: "",
    default_id: "",
    caption: "",
    word_id: "",
    sort_order: "",
    value_type: "",
    value_code: "",
    value: "",
    bc_id: "",
    where_query: "",
    add_year: "",
    add_month: "",
    add_day: "",
    session_item: "",
    use_session: "",
    user_editable: "",
    column_id: "",
    width: "",
    fixed: "",
    id: userId,
    pc: pc,
  });

  //프로시저 파라미터
  const paraSaved: Iparameters = {
    procedureName: "sav_custom_option",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.work_type,
      "@p_form_id": paraData.form_id,
      "@p_type": paraData.type,
      "@p_company_code": paraData.company_code,
      "@p_option_id": paraData.option_id,
      "@p_option_name": paraData.option_name,
      "@p_subject_word_id": paraData.subject_word_id,
      "@p_remarks": paraData.remarks,
      "@p_row_status": paraData.row_status,

      /* sysCustomOptionDefault */
      "@p_default_id": paraData.default_id,
      "@p_caption": paraData.caption,
      "@p_word_id": paraData.word_id,
      "@p_sort_order": paraData.sort_order,
      "@p_value_type": paraData.value_type,
      "@p_value_code": paraData.value_code,
      "@p_value": paraData.value,
      "@p_bc_id": paraData.bc_id,
      "@p_where_query": paraData.where_query,
      "@p_add_year": paraData.add_year,
      "@p_add_month": paraData.add_month,
      "@p_add_day": paraData.add_day,
      "@p_session_item": paraData.session_item,
      "@p_use_session": paraData.use_session,
      "@p_user_editable": paraData.user_editable,
      /* sysCustomOptionColumn */
      "@p_column_id": "", // paraData.column_id,
      "@p_width": 0, // paraData.width,
      "@p_fixed": "", // paraData.fixed,

      "@p_id": paraData.id,
      "@p_pc": paraData.pc,
    },
  };

  //조회
  useEffect(() => {
    if (workType === "U") {
      fetchMain();
    }
  }, []);

  //저장
  useEffect(() => {
    if (paraData.work_type !== "") fetchGridSaved();
  }, [paraData]);

  //fetch된 데이터가 폼에 세팅되도록 하기 위해 적용
  useEffect(() => {
    resetForm();
  }, [initialVal]);

  //fetch된 그리드 데이터가 그리드 폼에 세팅되도록 하기 위해 적용
  useEffect(() => {
    resetForm();
  }, [detailDataResult]);

  //요약정보 & 상세정보 조회
  const fetchMain = async () => {
    let data: any;

    try {
      data = await processApi<any>("platform-procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowsCnt = data.tables[0].Rows.length;
      let rows = data.tables[0].Rows;

      rows = rows.map((row: any) => {
        return {
          ...row,
          srcPgName: "USER_OPTIONS_DEFAULT_WINDOW",
        };
      });

      setDetailDataResult(() => {
        return {
          data: [...rows],
          total: totalRowsCnt,
        };
      });

      const row = data.tables[0].Rows[0];
      const { option_id, option_name } = row;

      setInitialVal((prev) => {
        return {
          ...prev,
          option_id,
          option_name,
        };
      });
    }
  };

  const fetchGridSaved = async () => {
    let data: any;

    try {
      data = await processApi<any>("platform-procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      alert("저장이 완료되었습니다.");
      if (workType === "U") {
        fetchMain();
        reloadData();
      } else {
        setVisible(false);
        reloadData();
      }

      deletedRows = []; //초기화
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }
  };

  const handleSubmit = (dataItem: { [name: string]: any }) => {
    let valid = true;

    //검증
    try {
      dataItem.orderDetails.forEach((item: any) => {
        if (!item.default_id) {
          throw "필드명을 입력하세요.";
        }
        if (!item.value_type) {
          throw "VALUE타입을 선택하세요.";
        }
        if (
          (item.value_type === "Radio" || item.value_type === "Lookup") &&
          (item.bc_id === "" || item.bc_id === null || item.bc_id === undefined)
        ) {
          throw "비즈니스 컴포넌트 ID를 입력해주세요";
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    const { option_id, orderDetails } = dataItem;

    let detailArr: TDetailData = {
      row_status: [],
      default_id: [],
      caption: [],
      word_id: [],
      sort_order: [],
      value_type: [],
      value_code: [],
      value: [],
      bc_id: [],
      where_query: [],
      add_year: [],
      add_month: [],
      add_day: [],
      session_item: [],
      use_session: [],
      user_editable: [],
    };

    orderDetails.forEach((item: any, idx: number) => {
      if (!item.rowstatus) return;
      const {
        rowstatus,
        default_id,
        caption,
        word_id,
        value_type,
        value_code,
        value,
        bc_id,
        where_query,
        add_year,
        add_month,
        add_day,
        session_item,
        use_session,
        user_editable,
      } = item;

      detailArr.row_status.push(rowstatus);
      detailArr.default_id.push(default_id);
      detailArr.caption.push(caption);
      detailArr.word_id.push(word_id);
      detailArr.sort_order.push(String(idx));
      detailArr.value_type.push(getCodeFromValue(value_type));
      detailArr.value_code.push(value_code);
      detailArr.value.push(value);
      detailArr.bc_id.push(bc_id);
      detailArr.where_query.push(where_query);
      detailArr.add_year.push(add_year);
      detailArr.add_month.push(add_month);
      detailArr.add_day.push(add_day);
      detailArr.session_item.push(getCodeFromValue(session_item));
      detailArr.use_session.push(getYn(use_session));
      detailArr.user_editable.push(getYn(user_editable));
    });

    deletedRows.forEach((item: any, idx: number) => {
      const {
        default_id,
        caption,
        word_id,
        value_type,
        value_code,
        value,
        bc_id,
        where_query,
        add_year,
        add_month,
        add_day,
        session_item,
        use_session,
        user_editable,
      } = item;

      detailArr.row_status.push("D");
      detailArr.default_id.push(default_id);
      detailArr.caption.push(caption);
      detailArr.word_id.push(word_id);
      detailArr.sort_order.push(String(idx));
      detailArr.value_type.push(getCodeFromValue(value_type));
      detailArr.value_code.push(value_code);
      detailArr.value.push(value);
      detailArr.bc_id.push(bc_id);
      detailArr.where_query.push(where_query);
      detailArr.add_year.push(add_year);
      detailArr.add_month.push(add_month);
      detailArr.add_day.push(add_day);
      detailArr.session_item.push(getCodeFromValue(session_item));
      detailArr.use_session.push(getYn(use_session));
      detailArr.user_editable.push(getYn(user_editable));
    });
    setParaData((prev) => ({
      ...prev,
      work_type: workType,
      option_id: getCodeFromValue(option_id),
      option_name: getCodeFromValue(option_id, "code_name"),
      row_status: detailArr.row_status.join("|"),
      default_id: detailArr.default_id.join("|"),
      caption: detailArr.caption.join("|"),
      word_id: detailArr.word_id.join("|"),
      sort_order: detailArr.sort_order.join("|"),
      value_type: detailArr.value_type.join("|"),
      value_code: detailArr.value_code.join("|"),
      value: detailArr.value.join("|"),
      bc_id: detailArr.bc_id.join("|"),
      where_query: detailArr.where_query.join("|"),
      add_year: detailArr.add_year.join("|"),
      add_month: detailArr.add_month.join("|"),
      add_day: detailArr.add_day.join("|"),
      session_item: detailArr.session_item.join("|"),
      use_session: detailArr.use_session.join("|"),
      user_editable: detailArr.user_editable.join("|"),
    }));
  };

  return (
    <Window
      title={
        workType === "N"
          ? "사용자 옵션 기본값 생성 (관리자)"
          : "사용자 옵션 기본값 수정 (관리자)"
      }
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
          rowstatus: "",
          option_id: workType === "N" ? "" : option_id,
          option_name: workType === "N" ? "" : option_name,
          orderDetails: detailDataResult.data,
        }}
        render={(formRenderProps: FormRenderProps) => (
          <FormElement horizontal={true}>
            <fieldset className={"k-form-fieldset"}>
              <button
                id="valueChanged"
                style={{ display: "none" }}
                onClick={(e) => {
                  e.preventDefault();
                  formRenderProps.onChange("valueChanged", {
                    value: "1",
                  });
                }}
              ></button>
              <FieldWrap fieldWidth="25%">
                <Field
                  label={"타입"}
                  name={"option_id"}
                  component={FormComboBox}
                  validator={validator}
                  className={workType === "U" ? "readonly" : "required"}
                  data={typeData}
                  columns={typeColumn}
                />
                {/* <Field
                  label={"설명"}
                  name={"option_name"}
                  component={FormInput}
                  validator={validator}
                  className="required"
                /> */}
              </FieldWrap>
            </fieldset>
            <FieldArray
              name="orderDetails"
              dataItemKey={DATA_ITEM_KEY}
              component={FormGrid}
              validator={arrayLengthValidator}
            />

            <BottomContainer>
              <ButtonContainer>
                <Button type={"submit"} themeColor={"primary"} icon="save">
                  저장
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
