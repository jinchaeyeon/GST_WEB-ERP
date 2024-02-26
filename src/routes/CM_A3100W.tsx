import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { guid } from "@progress/kendo-react-common";
import { Calendar } from "@progress/kendo-react-dateinputs";
import {
  AgendaView,
  DayView,
  MonthView,
  Scheduler,
  TimelineView,
  WeekView,
} from "@progress/kendo-react-scheduler";
import React, { useState } from "react";
import {
  ButtonContainer,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import { UsePermissions } from "../components/CommonFunction";
import { PAGE_SIZE } from "../components/CommonString";
import { TPermissions } from "../store/types";

const CM_A3100W: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;

  const [data, setData] = React.useState<any[]>([
    {
      id: 1,
      title: "302호 관리자",
      resource: 1,
      person: "admin",
      type: "Room",
      start: new Date("2024-02-26T10:00:00.000Z"),
      end: new Date("2024-02-26T12:00:00.000Z"),
    },
    {
      id: 2,
      title: "303호 관리자",
      resource: 2,
      person: "admin",
      type: "Room",
      start: new Date("2024-02-26T13:00:00.000Z"),
      end: new Date("2024-02-26T14:00:00.000Z"),
    },
  ]);

  const [view, setView] = React.useState("timeline");
  const [date, setDate] = React.useState(new Date());
  const [orientation, setOrientation] = React.useState<
    "horizontal" | "vertical"
  >("vertical");

  const handleViewChange = React.useCallback(
    (event: any) => {
      setView(event.value);
    },
    [setView]
  );
  const handleDateChange = React.useCallback(
    (event: any) => {
      setDate(event.value);
    },
    [setDate]
  );

  const handleDataChange = React.useCallback(
    ({ created, updated, deleted }: any) => {
      setData((old) =>
        old
          .filter(
            (item) =>
              deleted.find((current: any) => current.id === item.id) ===
              undefined
          )
          .map(
            (item) =>
              updated.find((current: any) => current.id === item.id) || item
          )
          .concat(
            created.map((item: any) =>
              Object.assign({}, item, {
                id: guid(),
              })
            )
          )
      );
    },
    [setData]
  );

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  const search = () => {};

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    todt: new Date(),
    type: "%",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == undefined) {
      //resetAllGrid();
      setFilters((prev) => ({
        ...prev,
        todt: value,
        isSearch: true,
        pgNum: 1,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>자원예약</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="CM_A3100W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <GridContainerWrap>
        <GridContainer
          width="355px"
          style={{
            height: isMobile ? "100%" : "88vh",
            marginTop: "5px",
            borderRight: "1px solid #d3d3d3",
            borderBottom: "1px solid #d3d3d3",
            paddingRight: "10px",
          }}
        >
          <GridContainer>
            <GridTitleContainer>
              <GridTitle>달력</GridTitle>
            </GridTitleContainer>
            <Calendar
              id="CM_A3100W_CALENDAR"
              focusedDate={filters.todt}
              value={filters.todt}
              onChange={filterInputChange}
            />
          </GridContainer>
          <GridContainer style={{ marginTop: "5px" }}>
            <GridTitleContainer>
              <GridTitle>자원</GridTitle>
            </GridTitleContainer>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                style={{ backgroundColor: "#edf4fb" }}
              >
                <Typography>전체</Typography>
              </AccordionSummary>
              <AccordionDetails
                style={{ borderTop: "1px solid rgba(0, 0, 0, .125)" }}
              >
                <List>
                  <ListItem disablePadding>
                    <ListItemButton>
                      <ListItemText primary={"전체"} />
                    </ListItemButton>
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                style={{ backgroundColor: "#edf4fb" }}
              >
                <Typography>회의실</Typography>
              </AccordionSummary>
              <AccordionDetails
                style={{ borderTop: "1px solid rgba(0, 0, 0, .125)" }}
              >
                <List>
                  <ListItem disablePadding>
                    <ListItemButton>
                      <ListItemText primary={"전체"} />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton>
                      <ListItemText primary={"301호"} />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton component="a" href="#simple-list">
                      <ListItemText primary={"302호"} />
                    </ListItemButton>
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                style={{ backgroundColor: "#edf4fb" }}
              >
                <Typography>자동차</Typography>
              </AccordionSummary>
              <AccordionDetails
                style={{ borderTop: "1px solid rgba(0, 0, 0, .125)" }}
              >
                <List>
                  <ListItem disablePadding>
                    <ListItemButton>
                      <ListItemText primary={"전체"} />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton>
                      <ListItemText primary={"카니발"} />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton>
                      <ListItemText primary={"니로"} />
                    </ListItemButton>
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
          </GridContainer>
        </GridContainer>
        <GridContainer
          style={{
            height: isMobile ? "100%" : "88vh",
            borderBottom: "1px solid #d3d3d3",
            paddingRight: "10px",
          }}
          width={`calc(100% - 370px)`}
        >
          <GridContainer>
            <Scheduler
              id="CM_A3100W_SCHEDULER"
              data={data}
              onDataChange={handleDataChange}
              view={view}
              onViewChange={handleViewChange}
              date={date}
              onDateChange={handleDateChange}
              editable={true}
              defaultDate={filters.todt}
              footer={(props) => <React.Fragment />}
              group={{
                resources: ["자원"],
                orientation,
              }}
              resources={[
                {
                  name: "자원",
                  data: [
                    { text: "302호", value: 1 },
                    { text: "303호", value: 2 },
                  ],
                  field: "resource",
                  valueField: "value",
                  textField: "text",
                  colorField: "color",
                },
              ]}
            >
              <TimelineView showWorkHours={false} />
              <DayView showWorkHours={false} />
              <WeekView showWorkHours={false} />
              <MonthView />
              <AgendaView />
            </Scheduler>
          </GridContainer>
        </GridContainer>
      </GridContainerWrap>
    </>
  );
};

export default CM_A3100W;
