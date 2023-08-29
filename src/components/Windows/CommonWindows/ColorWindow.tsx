import { Box, DialogContent, DialogTitle, Grid } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import Paper, { PaperProps } from "@mui/material/Paper";
import Button from "@mui/material/Button";
import { useState } from "react";
import Draggable from "react-draggable";
import { BottomContainer, ButtonContainer } from "../../../CommonStyled";
import { IWindowPosition } from "../../../hooks/interfaces";

type IKendoWindow = {
  setVisible(arg: boolean): void;
};

function PaperComponent(props: PaperProps) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

const KendoWindow = ({ setVisible }: IKendoWindow) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : 350,
    top: isMobile == true ? 0 : 50,
    width: isMobile == true ? deviceWidth : 1200,
    height: isMobile == true ? window.innerHeight : 800,
  });

  const onClose = () => {
    setVisible(false);
  };

  const [colorName, setColorName] = useState<string>("");
  const [colorCode, setColorCode] = useState<string>("");

  return (
    <Dialog
      onClose={onClose}
      open={true}
      PaperComponent={PaperComponent}
      maxWidth="lg"
      style={{
        zIndex: 1000000000,
        width: position.width,
        height: position.height,
        top: position.top,
        left: position.left,
      }}
    >
      <DialogTitle>컬러 설정 색상 {colorName}</DialogTitle>
      <DialogContent>
        <Box>
          <Grid container spacing={2}>
            {/* A700 500(현재) A200 A100 */}
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
              <Button
                variant="contained"
                onClick={() => setColorName("- Red")}
                style={{ backgroundColor: "#f44336", width: "100%" }}
              >
                Red
              </Button>
            </Grid>
            {/* A700 500(현재) A200 A100 */}
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
              <Button
                variant="contained"
                onClick={() => setColorName("- Orange")}
                style={{ backgroundColor: "#ff9800", width: "100%" }}
              >
                Orange
              </Button>
            </Grid>
            {/* 700 500(현재) A200 A100 */}
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
              <Button
                variant="contained"
                onClick={() => setColorName("- Yellow")}
                style={{ backgroundColor: "#ffeb3b", width: "100%" }}
              >
                Yellow
              </Button>
            </Grid>
            {/* A700 A400(현재) A200 A100*/}
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
              <Button
                variant="contained"
                onClick={() => setColorName("- Lime")}
                style={{ backgroundColor: "#c6ff00", width: "100%" }}
              >
                Lime
              </Button>
            </Grid>
            {/* 700 500(현재) 300 100 */}
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
              <Button
                variant="contained"
                onClick={() => setColorName("- LightGreen")}
                style={{ backgroundColor: "#8bc34a", width: "100%" }}
              >
                LightGreen
              </Button>
            </Grid>
            {/* 700 500(현재) 300 100 */}
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
              <Button
                variant="contained"
                onClick={() => setColorName("- Green")}
                style={{ backgroundColor: "#4caf50", width: "100%" }}
              >
                Green
              </Button>
            </Grid>
            {/* A700 A400(현재) 200 100 */}
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
              <Button
                variant="contained"
                onClick={() => setColorName("- Cyan")}
                style={{ backgroundColor: "#00e5ff", width: "100%" }}
              >
                Cyan
              </Button>
            </Grid>
            {/* 700 500(현재) 300 100 */}
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
              <Button
                variant="contained"
                onClick={() => setColorName("- Blue")}
                style={{ backgroundColor: "#2196f3", width: "100%" }}
              >
                Blue
              </Button>
            </Grid>
            {/* 700 500(현재) 300 100 */}
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
              <Button
                variant="contained"
                onClick={() => setColorName("- Navy")}
                style={{ backgroundColor: "#3f51b5", width: "100%" }}
              >
                Navy
              </Button>
            </Grid>
            {/* 800 500(현재) 300 100 */}
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
              <Button
                variant="contained"
                onClick={() => setColorName("- Purple")}
                style={{ backgroundColor: "#9c27b0", width: "100%" }}
              >
                Purple
              </Button>
            </Grid>
            {/* 500 300(현재) 200 100*/}
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
              <Button
                variant="contained"
                onClick={() => setColorName("- Pink")}
                style={{ backgroundColor: "#f06292", width: "100%" }}
              >
                Pink
              </Button>
            </Grid>
            {/* 800 600(현재) 400 300 */}
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
              <Button
                variant="contained"
                onClick={() => setColorName("- Grey")}
                style={{ backgroundColor: "#757575", width: "100%" }}
              >
                Grey
              </Button>
            </Grid>
          </Grid>
        </Box>
        <BottomContainer>
          <ButtonContainer>
            <Button onClick={onClose}>확인</Button>
          </ButtonContainer>
        </BottomContainer>
      </DialogContent>
    </Dialog>
  );
};

export default KendoWindow;
