import React, { useEffect, useState } from "react";
import { gridList } from "../store/columns/SA_B3101W_C";
import { ButtonContainer, Title, TitleContainer } from "../CommonStyled";
import { TPermissions } from "../store/types";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import TopButtons from "../components/Buttons/TopButtons";
import { DataResult, State, process } from "@progress/kendo-data-query";
import { PAGE_SIZE } from "../components/CommonString";
import { setDefaultDate } from "../components/CommonFunction";

const SA_B3101W: React.FC = () => {
    const [permissions] = useState<TPermissions | null>(null);
    const [gridDataState, setGridDataState] = useState<State>({
        sort: [],
    });    
    const [gridDataResult, setGridDataResult] = useState<DataResult>(
        process([], gridDataState)
    );    
    const [allChartDataResult, setAllChartDataResult] = useState({
        companies: [""],
        series: [0],
    });

    //커스텀 옵션 조회
    const [customOptionData, setCustomOptionData] = React.useState<any>(null);

    //customOptionData 조회 후 디폴트 값 세팅
    useEffect(() => {
        if (customOptionData !== null) {
        const defaultOption = customOptionData.menuCustomDefaultOptions.query;

        setFilters((prev) => ({
            ...prev,
            yyyy: setDefaultDate(customOptionData, "yyyy"),
            itemacnt: defaultOption.find((item: any) => item.id === "itemacnt")
            .valueCode,
            rdoAmtdiv: defaultOption.find((item: any) => item.id === "rdoAmtdiv")
            .valueCode,
        }));
        }
    }, [customOptionData]);

    //그리드 리셋
    const resetGrid = () => {
        setGridDataResult(process([], gridDataState));
        setAllChartDataResult({
        companies: [""],
        series: [0],
        });
        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    };

    //엑셀 내보내기
    let _export: ExcelExport | null | undefined;
    const exportExcel = () => {
        if (_export !== null && _export !== undefined) {
        _export.save();
        }
    };

    const search = () => {
        resetGrid();
    };

    //조회조건 초기값
    const [filters, setFilters] = useState({
        pgSize: PAGE_SIZE,
        orgdiv: "01",
        cboLocation: "01",
        yyyy: new Date(),
        custcd: "",
        custnm: "",
        mm: "",
        rdoAmtdiv: "A",
        itemcd: "",
        itemnm: "",
        itemacnt: "",
        itemlvl1: "",
        project: "",
        bnatur: "",
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
    });
    
    return(
        <>
        <TitleContainer>
            <Title>매입매출현황</Title>

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
        </>
    );
}

export default SA_B3101W;