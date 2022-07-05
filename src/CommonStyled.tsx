import styled from "styled-components";

export const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 0;
  margin-top: 5px;
`;

export const Title = styled.h3`
  font-size: 24px;
  font-weight: 600;
`;
export const ButtonContainer = styled.div`
  button {
    margin-left: 5px;
  }
`;

export const BottomContainer = styled(TitleContainer)`
  flex-direction: row-reverse;
  button {
    width: 100px;
    height: 40px;
  }
`;

export const FilterBoxWrap = styled.div`
  padding: 5px 0;
`;

export const FilterBox = styled.table`
  /* line-height: 1.5; */
  border: solid 1px #d7d7d7;
  background-color: #fff;
  width: 100%;
  tr th + td {
    height: 40px;
  }
  tr th {
    background-color: #f5f5f8;
    border: solid 1px #d7d7d7;
    width: 120px;
    color: #333333;
    font-weight: 400;
    font-size: 14px;
    text-align: center;
    vertical-align: middle;
  }
  tr td {
    background-color: #ffffff;
    border: solid 1px #d7d7d7;
    width: 270px;
    text-align: center;
    padding: 5px;
    position: relative;
    vertical-align: middle;
  }
  tr td.item-box {
    min-width: 300px;
  }
  tr td.item-box > input,
  tr td.item-box > .k-input {
    width: 48%;
  }
  .k-radio-list.k-list-horizontal {
    justify-content: center;
  }
`;

type TGridContainerWrap = {
  flexDirection?: string;
  maxWidth?: string;
};

export const GridContainerWrap = styled.div<TGridContainerWrap>`
  display: flex;
  gap: ${(props) => (props.flexDirection === "column" ? "0" : "15px")};
  flex-direction: ${(props) => props.flexDirection};
  max-width: ${(props) => props.maxWidth};
`;

type TGridContainer = {
  maxWidth?: string;
};

export const GridContainer = styled.div<TGridContainer>`
  flex-direction: column;
  max-width: ${(props) => props.maxWidth};

  .k-grid,
  .k-scheduler {
    margin: 5px 0;
  }
  .k-grid td {
    white-space: nowrap; //그리드 셀 말줄임표
  }
  .k-grid .k-grid-header .k-header .k-cell-inner > .k-link {
    justify-content: center; //공통설정 : 그리드 헤더 텍스트 중앙정렬
  }
  /* .required {
    background-color: #fff0ef;
  } */
`;

export const GridTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
`;

export const GridTitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 5px;
  height: 30px;
`;

export const ButtonInInput = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
`;
export const ButtonInFieldWrap = styled.div`
  position: relative;
`;

export const ButtonInField = styled(ButtonInInput)`
  top: -7px;
  right: 0;
`;

export const FieldWrap = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  :last-child {
    margin-bottom: 30px;
  }
  > span {
    margin: 0 5px;
  }
  > span:first-child {
    margin-left: 0;
  }
  > span:last-child {
    margin-right: 0;
  }
  > .k-form-field {
    width: 25%;
  }
  .k-picker,
  .k-picker:hover,
  .k-picker.k-hover {
    background-color: #ffffff;
  }
  .required,
  .required:hover,
  .required.k-hover {
    background-color: #fff0ef;
  }
  .readonly {
    background-color: #efefef;
  }
`;

export const LoginBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding-bottom: 50px;

  form {
    background-color: #f7f7f7;
    width: 400px;
    padding: 50px;
    border-radius: 5px;
  }
  button {
    width: 100%;
    margin-top: 15px;
  }
`;

export const RadioButtonBox = styled.div`
  display: flex;
`;

export const ApprovalBox = styled.div`
  display: flex;
  justify-content: space-evenly;
  width: 500px;
  height: 80px;
  /* border: solid 1px; */
  /* margin-top: 30px; */
  margin-bottom: 15px;
`;

export const ApprovalInner = styled.div`
  display: flex;
  justify-content: space-evenly;
  width: 33%;
  height: 100%;
  align-items: center;
  border: solid 1px #ff6358;

  :nth-child(2) {
    border-right: 0;
    border-left: 0;
  }
`;
