import { useEffect, useState } from "react";
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
  GridPageChangeEvent,
} from "@progress/kendo-react-grid";
import { DataResult, getter, process, State } from "@progress/kendo-data-query";
import { useApi } from "../../../hooks/api";
import {
  BottomContainer,
  ButtonContainer,
  FilterBox,
  FilterBoxWrap,
  GridContainer,
  Title,
  TitleContainer,
} from "../../../CommonStyled";
import { Input } from "@progress/kendo-react-inputs";
import { Iparameters } from "../../../store/types";
import { Button } from "@progress/kendo-react-buttons";
import { chkScrollHandler, UseBizComponent } from "../../CommonFunction";
import { IWindowPosition } from "../../../hooks/interfaces";
import { PAGE_SIZE, SELECTED_FIELD } from "../../CommonString";
import BizComponentRadioGroup from "../../RadioGroups/BizComponentRadioGroup";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { Loader } from "@progress/kendo-react-indicators";
type IWindow = {
  setVisible(t: boolean): void;
};

const ExcelWindow = ({ setVisible }: IWindow) => {
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 700,
    height: 650,
  });

  const [loading, setLoading] = React.useState(false);
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

  const columns = (() => {
    const cols: Array<any> = [];
    cols.push(<GridColumn field={"품목코드"} width={130} />);
    cols.push(<GridColumn field={"품목명"} width={170} />);
    cols.push(<GridColumn field={"단가"} width={100} />);
    cols.push(<GridColumn field={"비고"} width={245} />);
    return cols;
  })();

  const generateData = () => {
    const page: Array<any> = [];

    for (let r = 1; r <= 13; r++) {
        const row = {
            "품목코드": "",
            "품목명": "",
            "단가": "",
            "비고": ""
        };
        page.push(row);
    }
    return page;
}

  return (
    <Window
      title={"엑셀 양식"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
    >
        <div style={{ position: "relative" }}>
          <ExcelExport>
            <Grid
              style={{ height: "500px" }}
              className={loading ? "k-disabled" : ""}
              columnVirtualization={true}
              scrollable="virtual"
              data={generateData()}
            >
              {columns}
            </Grid>
          </ExcelExport>
          {loading && (
            <Loader
              size={"large"}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
              }}
              type={"infinite-spinner"}
            />
          )}
        </div>
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
  );
};

export default ExcelWindow;
