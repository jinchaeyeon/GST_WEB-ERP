import { getter } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import { bytesToBase64 } from "byte-base64";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { BottomContainer, ButtonContainer } from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { isLoading } from "../../store/atoms";
import { UseBizComponent, UseMessages, convertDateToStr, toDate } from "../CommonFunction";
import { PAGE_SIZE } from "../CommonString";
import { Iparameters } from "../../store/types";

type IWindow = {
  workType: "N" | "U" | "C";
  data?: any;
  setVisible(t: boolean): void;
  setData(str: string): void;
  modal?: boolean;
  pathname: string;
};

const CopyWindow = ({
  workType,
  data,
  setVisible,
  setData,
  modal = false,
  pathname,
}: IWindow) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1600,
    height: 900,
  });
  const processApi = useApi();
  const [worktype, setWorkType] = useState<string>(workType);

  const DATA_ITEM_KEY = "num";
  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "",
    //공정, 관리항목리스트
    setBizComponentData
  );

  useEffect(() => {
    if (bizComponentData !== null) {
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

  useEffect(() => {
    if ((worktype === "U" || worktype === "C") && data != undefined) {
      setFilters((prev) => ({
        ...prev,
        acseq1: data.acseq1,
        actdt: data.actdt == "" ? new Date() : toDate(data.actdt),
        annexation: data.annexation,
        coddt: data.coddt == "" ? new Date() : toDate(data.coddt),
        codnum: data.codnum,
        costamt1: data.costamt1,
        costamt2: data.costamt2,
        costamt3: data.costamt3,
        costamt4: data.costamt4,
        costamt5: data.costamt5,
        costamt6: data.costamt6,
        costamt7: data.costamt7,
        costamt8: data.costamt8,
        costamt9: data.costamt9,
        costamt10: data.costamt10,
        costamt11: data.costamt11,
        costamt12: data.costamt12,
        costamt13: data.costamt13,
        costamt14: data.costamt14,
        costamt15: data.costamt15,
        customs: data.customs,
        customscustcd: data.customscustcd,
        customscustnm: data.customscustnm,
        ftayn: data.ftayn,
        importnum: data.importnum,
        itemnm: data.itemnm,
        location: data.location,
        orgdiv: data.orgdiv,
        position: data.position,
        rate: data.rate,
        recdt: data.recdt == "" ? new Date() : toDate(data.recdt),
        refundamt: data.refundamt,
        refunddt: data.refunddt == "" ? new Date() : toDate(data.refunddt),
        remark3: data.remark3,
        seq1: data.seq1,
        taxamt: data.taxamt,
        tottaxamt: data.tottaxamt,
        totwgt: data.totwgt,
        wonamt: data.wonamt,
        isSearch: true,
        find_row_value: "",
        pgNum: 1,
      }));
    }
  }, []);

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    acseq1: 0,
    actdt: new Date(),
    annexation: 0,
    coddt: new Date(),
    codnum: "",
    costamt1: 0,
    costamt2: 0,
    costamt3: 0,
    costamt4: 0,
    costamt5: 0,
    costamt6: 0,
    costamt7: 0,
    costamt8: 0,
    costamt9: 0,
    costamt10: 0,
    costamt11: 0,
    costamt12: 0,
    costamt13: 0,
    costamt14: 0,
    costamt15: 0,
    customs: 0,
    customscustcd: "",
    customscustnm: "",
    ftayn: "",
    importnum: "",
    itemnm: "",
    location: "",
    orgdiv: "",
    position: "",
    rate: 0,
    recdt: new Date(),
    refundamt: 0,
    refunddt: new Date(),
    remark3: "",
    seq1: 0,
    taxamt: 0,
    tottaxamt: 0,
    totwgt: 0,
    wonamt: 0,
    isSearch: true,
    find_row_value: "",
  });
    
  return (
    <>
      <Window
        title={
          worktype === "N"
            ? "수입신고생성"
            : worktype === "C"
            ? "수입신고복사"
            : "수입신고정보"
        }
        width={position.width}
        height={position.height}
        onMove={handleMove}
        onResize={handleResize}
        onClose={onClose}
        modal={modal}
      >
        <BottomContainer>
          <ButtonContainer>
            <Button
              themeColor={"primary"}
              //onClick={selectData}
            >
              저장
            </Button>
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
