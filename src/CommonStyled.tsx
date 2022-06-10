import styled from "styled-components";

export const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px;
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

export const FilterBoxWrap = styled.div`
  padding: 5px;
`;

export const FilterBox = styled.table`
  line-height: 1.5;
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
  }
  tr td {
    background-color: #ffffff;
    border: solid 1px #d7d7d7;
    width: 270px;
    text-align: center;
    padding: 5px;
  }
  tr td.item-box {
    min-width: 300px;
  }
  tr td.item-box input {
    width: 48%;
  }
`;

export const GridContainerWrap = styled.div`
  display: flex;
`;

type GridContainerType = {
  maxWidth?: string;
};

export const GridContainer = styled.div<GridContainerType>`
  flex-direction: column;
  max-width: ${(props) => props.maxWidth};

  .k-grid {
    margin: 5px;
  }
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
`;
