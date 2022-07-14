import styled from "styled-components";

export const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 0;
  margin-top: 5px;
`;

export const MainTopContainer = styled(TitleContainer)`
  justify-content: flex-end;
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
  clientWidth?: number;
  inTab?: boolean;
};

export const GridContainer = styled.div<TGridContainer>`
  flex-direction: column;
  max-width: ${(props) => props.maxWidth};
  width: ${(props) =>
    props.clientWidth
      ? "calc(" +
        props.clientWidth +
        "px - " +
        (props.inTab ? 65 : 0) +
        "px - 150px)"
      : ""};

  .k-grid,
  .k-scheduler {
    margin: 5px 0;
  }
  .k-grid td {
    white-space: nowrap; //그리드 셀 말줄임표
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
  width: 350px;
  height: 60px;
  margin-left: 15px;
  border: solid 1px #dfdfdf;
  background-color: #fafafa;

  > div:nth-child(1) > div:last-child {
    background-color: #ffb849;
  }
  > div:nth-child(2) > div:last-child {
    background-color: #49c9ff;
  }
  > div:nth-child(3) > div:last-child {
    background-color: #ff8549;
  }
`;

export const ApprovalInner = styled.div`
  display: flex;
  justify-content: space-evenly;
  width: 33%;
  height: 100%;
  align-items: center;

  :nth-child(2) {
    border-right: 0;
    border-left: 0;
  }
  > div:last-child {
    width: 40px;
    line-height: 35px;
    border-radius: 5px;
    vertical-align: middle;
    text-align: center;
    font-weight: 600;
    color: #fff;
  }
`;

export const InfoList = styled.ul``;
export const InfoTitle = styled.p``;
export const InfoItem = styled.li``;
export const InfoLabel = styled.span``;
export const InfoValue = styled.span``;
