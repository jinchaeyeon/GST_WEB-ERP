import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import React, { useEffect, useRef, useState } from "react";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import ReactToPrint from "react-to-print";
import { Buffer } from 'buffer';
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { Iparameters, TPermissions } from "../store/types";
import FileViewers from "../components/Viewer/FileViewers";

const AC_B8100W: React.FC = () => {
  const processApi = useApi();
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const setLoading = useSetRecoilState(isLoading);
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        frdt: new Date(
          parseInt(convertDateToStr(new Date()).substring(0, 4)),
          0,
          1
        ),
        todt: setDefaultDate(customOptionData, "todt"),
        taxdt: setDefaultDate(customOptionData, "taxdt"),
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [isInitSearch, setIsInitSearch] = useState(false);

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
    orgdiv: "01",
    location: "01",
    frdt: new Date(),
    todt: new Date(),
    taxdt: new Date(),
  });

  // //조회조건 파라미터
  // const parameters: Iparameters = {
  //   procedureName: "P_AC_B8100W_Q",
  //   pageNumber: 0,
  //   pageSize: 0,
  //   parameters: {
  //     "@p_work_type": "Q",
  //     "@p_orgdiv": filters.orgdiv,
  //     "@p_frdt": convertDateToStr(filters.frdt),
  //     "@p_todt": convertDateToStr(filters.todt),
  //     "@p_taxdt": convertDateToStr(filters.taxdt),
  //     "@p_location": filters.location,
  //   },
  // };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    if (!permissions?.view) return;
    let data: any;

    setLoading(true);
    const parameters = {
      para: "document?id=S202327C173",
    };

    try {
      data = await processApi<any>("excel-view", parameters);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      //const blob = new Blob([data]);
      // 특정 타입을 정의해야 경우에는 옵션을 사용해 MIME 유형을 정의 할 수 있습니다.

      let json = JSON.stringify(data);
      let buffer = Buffer.from(json);
      let read = buffer.toString("utf8");
      let blob = new Blob([read], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // blob을 사용해 객체 URL을 생성합니다.
      const fileObjectUrl = window.URL.createObjectURL(blob);

      setMainDataResult((prev) => {
        return {
          data: [fileObjectUrl],
          total: 1,
        };
      });
    } else {
      setMainDataResult((prev) => {
        return {
          data: [],
          total: 0,
        };
      });
    }


    setLoading(false);
  };

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  // 최초 한번만 실행
  useEffect(() => {
    if (isInitSearch === false && permissions !== null) {
      fetchMainGrid();
      setIsInitSearch(true);
    }
  }, [filters, permissions]);

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_B8100W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_B8100W_001");
      } else if (
        convertDateToStr(filters.taxdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.taxdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.taxdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.taxdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_B8100W_001");
      } else if (
        filters.location == null ||
        filters.location == undefined ||
        filters.location == ""
      ) {
        throw findMessage(messagesData, "AC_B8100W_001");
      } else {
        fetchMainGrid();
      }
    } catch (e) {
      alert(e);
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>전자세금계산서 발급세액공제신고서</Title>

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
              <th>기준일자</th>
              <td>
                <CommonDateRangePicker
                  value={{
                    start: filters.frdt,
                    end: filters.todt,
                  }}
                  onChange={(e: { value: { start: any; end: any } }) =>
                    setFilters((prev) => ({
                      ...prev,
                      frdt: e.value.start,
                      todt: e.value.end,
                    }))
                  }
                  className="required"
                />
              </td>
              <th>사업장</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="location"
                    value={filters.location}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    className="required"
                  />
                )}
              </td>
              <th>신고일자</th>
              <td>
                <DatePicker
                  name="taxdt"
                  format="yyyy-MM-dd"
                  value={filters.taxdt}
                  onChange={filterInputChange}
                  className="required"
                  placeholder=""
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainer height="82vh">
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
        >
          {mainDataResult.total > 0 ? (
            <FileViewers file={`https://dev.gst-pw6.com/files/excel/sample_data.xlsx`} type="xlsx" />
          ) : (
            ""
          )}
        </ExcelExport>
      </GridContainer>
    </>
  );
};

export default AC_B8100W;
