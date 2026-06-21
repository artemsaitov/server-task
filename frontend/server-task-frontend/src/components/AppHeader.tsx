import { AppBar, Toolbar, Typography } from "@mui/material";

export default function AppHeader() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div">
          ServerTask
        </Typography>
      </Toolbar>
    </AppBar>
  );
}