import { useEffect, useState } from "react";
import * as React from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridFooterCellProps,
  GridCellProps,
  GridFilterChangeEvent,
} from "@progress/kendo-react-grid";
import {
  CompositeFilterDescriptor,
  DataResult,
  process,
  State,
  filterBy,
} from "@progress/kendo-data-query";
import { useApi } from "../../hooks/api";

import { FilterBox, FilterBoxWrap } from "../../CommonStyled";

import {
  Input,
  RadioButton,
  RadioButtonChangeEvent,
} from "@progress/kendo-react-inputs";
import LocationDDL from "../DropDownLists/LocationDDL";

import { Iparameters } from "../../store/types";
import { Button } from "@progress/kendo-react-buttons";
import { IWindowPosition } from "../../hooks/interfaces";
import { pageSize } from "../CommonString";
import { Upload } from "@progress/kendo-react-upload";

type IKendoWindow = {
  getVisible(arg: boolean): void;
  getData(data: object): void;
  para: string; //{};
};

const KendoWindow = ({ getVisible, getData, para }: IKendoWindow) => {
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 1200,
    height: 800,
  });

  const [mainPgNum, setMainPgNum] = useState(1);

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
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], {})
  );

  useEffect(() => {
    fetchGrid();
  }, []);

  //요약정보 조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_TEST_WEB_sys_sel_attachments",
    pageNumber: mainPgNum,
    pageSize: pageSize,
    parameters: {
      "@p_work_type": "Q",
      "@p_attdatnum": para,
    },
  };

  const uploadFile = async (file: File) => {
    console.log("file");
    console.log(file);
    let data: any;

    const filePara = { Name: "TEST", File: file };

    const formData = new FormData();
    formData.append("image", file);

    console.log(formData);
    try {
      data = await processApi<any>("file-upload", filePara);
    } catch (error) {
      data = null;
    }

    console.log("data");
    console.log(data);
  };
  //요약정보 조회
  const fetchGrid = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      const totalRowsCnt = data.result.totalRowCount;
      const rows = data.result.data.Rows;

      setMainDataResult((prev) => {
        return {
          data: [...prev.data, ...rows],
          total: totalRowsCnt,
        };
      });
    }
  };

  const excelInput: any = React.useRef();
  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], {}));
  };

  const initialFilter: CompositeFilterDescriptor = {
    logic: "and",
    filters: [],
  };
  const [filter, setFilter] = React.useState(initialFilter);

  const CommandCell = (props: GridCellProps) => {
    const onSelectClick = () => {
      // 부모로 데이터 전달, 창 닫기
      const rowData = props.dataItem;
      getData(rowData);
      onClose();
    };

    return (
      <td className="k-command-cell">
        <Button
          className="k-grid-edit-command"
          themeColor={"primary"}
          fillMode="outline"
          onClick={onSelectClick}
          icon="check"
        ></Button>
      </td>
    );
  };

  const uploadInput = document.getElementById("upload");

  return (
    <Window
      title={"파일첨부관리"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
    >
      <Button onClick={() => uploadInput!.click()}>
        업로드
        <input
          id="upload"
          style={{ display: "none" }}
          type="file"
          ref={excelInput}
          onChange={(event: any) => {
            // setResultMessage(null)
            // setErrorList(null)
            // setSuccessList(null)
            const file = event.target.files[0];
            uploadFile(file);
          }}
        />
      </Button>
      <Grid
        style={{ height: "500px" }}
        data={mainDataResult.data}
        sortable={true}
        groupable={false}
        reorderable={true}
        //onDataStateChange={dataStateChange}
        fixedScroll={true}
        total={mainDataResult.total}
        //onScroll={scrollHandler}
      >
        {/* <GridColumn cell={CommandCell} width="55px" filterable={false} /> */}
        <GridColumn field="realnm" title="파일명" width="600" />
        <GridColumn field="filesize" title="파일SIZE" />
        <GridColumn field="user_name" title="등록자" />
        <GridColumn field="insert_time" title="등록일자" width="200" />
      </Grid>
    </Window>
  );
};

export default KendoWindow;
