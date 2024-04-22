import * as React from "react";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
// import Divider from "@mui/material/Divider";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import StorefrontIcon from "@mui/icons-material/Storefront";
import SettingsIcon from "@mui/icons-material/Settings";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "./components/Auth-context";
import Login from "./pages/login/Login";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import GavelIcon from "@mui/icons-material/Gavel";
import { useBidDetailsContext } from "./components/BidData/BidDetailsContext";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import HomeIcon from "@mui/icons-material/Home";

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
  background: "#343a40",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  background: "#343a40",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar1 = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer1 = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  background: "#343a40",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window?: () => Window;
}

const Layout = (props: Props) => {
  const theme = useTheme();
  const { open, setOpen } = useBidDetailsContext();
  const { isAuthenticated } = useAuth();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleDrawerClose1 = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const [adminClick, setAdminClick] = React.useState(false);
  const { logout } = useAuth();

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const drawer = (
    <div className=" lg:hidden bg-[#343a40] h-full">
      {/* <Toolbar /> */}
      <Link
        to={"/"}
        className="cursor-pointer"
        onClick={() => setMobileOpen(false)}
      >
        <Typography
          variant="h5"
          noWrap
          className="px-4 py-8 flex justify-center w-full text-[#FAA912] font-bold"
        >
          Master Admin
        </Typography>
      </Link>
      <List>
        {["Dashboard", "Market", "Bid Data", "Win Data", "Setting"].map(
          (text, index) => (
            <ListItem
              key={text}
              disablePadding
              sx={{
                display: "block",
                "&:hover": { bgcolor: "#FAA912" },
                transition: "all 0.3s ease-in-out",
              }}
              component={Link} // Use Link component from react-router-dom
              to={
                index === 0
                  ? "/"
                  : index === 1
                  ? "/market"
                  : index === 2
                  ? "/bidData"
                  : index === 3
                  ? "winData"
                  : "/setting"
              } // Define the route to navigate to
            >
              <ListItemButton onClick={() => setMobileOpen(false)}>
                <ListItemIcon sx={{ color: "white" }}>
                  {index === 0 ? (
                    <HomeIcon />
                  ) : index === 1 ? (
                    <StorefrontIcon />
                  ) : index === 2 ? (
                    <GavelIcon />
                  ) : index === 3 ? (
                    <EmojiEventsIcon />
                  ) : (
                    <SettingsIcon />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={text}
                  sx={{ color: "white", fontSize: "0.5rem" }}
                />
              </ListItemButton>
            </ListItem>
          )
        )}
      </List>
    </div>
  );

  // Remove this const when copying and pasting into your project.
  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <div className="overflow-x-hidden w-full">
      {isAuthenticated ? (
        <div className="flex flex-col w-full appearance-none">
          <Box sx={{ display: "flex", width: "100%" }}>
            <CssBaseline />
            <div className=" hidden lg:block">
              <AppBar1
                position="fixed"
                open={open}
                sx={{ background: "#343a40", border: "none" }}
              >
                <Toolbar>
                  <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={handleDrawerOpen}
                    edge="start"
                    sx={{
                      marginRight: 5,
                      ...(open && { display: "none" }),
                    }}
                  >
                    <MenuIcon sx={{ color: "#FAA912" }} />
                  </IconButton>

                  <div className="w-full">
                    <div
                      className="flex justify-end w-full items-center gap-2 text-[14px] cursor-pointer "
                      onClick={() => setAdminClick(!adminClick)}
                    >
                      <div
                        className={`admin-column relative flex items-center gap-2 ${
                          adminClick ? "admin" : ""
                        }`}
                      >
                        <AccountCircleIcon />
                        Admin
                        <ExpandMoreIcon className="arrow-icon" />
                        {adminClick && (
                          <div className=" rounded-b-sm shadow-lg absolute bg-[#343a40] text-white p-2 z-50 top-11 w-[130%] right-0">
                            <Link to={"/profile"}>
                              <div className="mb-2 flex items-center gap-2 hover:text-[#FAA912] text-sm">
                                <PersonIcon
                                  sx={{ fontSize: "20px", marginLeft: "20px" }}
                                />
                                Profile
                              </div>
                            </Link>
                            <div
                              className="mb-2 flex items-center gap-2 hover:text-[#FAA912] text-sm"
                              onClick={() => logout()}
                            >
                              <LogoutIcon
                                sx={{ fontSize: "20px", marginLeft: "20px" }}
                              />
                              Logout
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Toolbar>
              </AppBar1>
              <Drawer1
                variant="permanent"
                open={open}
                sx={{ background: "#343a40" }}
              >
                <DrawerHeader>
                  <Typography
                    variant="h5"
                    noWrap
                    component="div"
                    className=" flex justify-center w-full text-[#FAA912] font-bold"
                  >
                    Master Admin
                  </Typography>
                  <IconButton
                    onClick={handleDrawerClose}
                    sx={{ color: "#FAA912" }}
                  >
                    {theme.direction === "rtl" ? (
                      <ChevronRightIcon />
                    ) : (
                      <ChevronLeftIcon />
                    )}
                  </IconButton>
                </DrawerHeader>
                {/* <Divider sx={{ bgcolor: "white" }} /> */}
                <List>
                  {[
                    "Dashboard",
                    "Market",
                    "Bid Data",
                    "Win Data",
                    "Setting",
                  ].map((text, index) => (
                    <ListItem
                      key={text}
                      disablePadding
                      sx={{
                        display: "block",
                        "&:hover": { bgcolor: "#FAA912" },
                        transition: "all 0.3s ease-in-out",
                      }}
                      component={Link} // Use Link component from react-router-dom
                      to={
                        index === 0
                          ? "/"
                          : index === 1
                          ? "/market"
                          : index === 2
                          ? "/bidData"
                          : index === 3
                          ? "winData"
                          : "/setting"
                      } // Define the route to navigate to
                    >
                      <ListItemButton
                        sx={{
                          minHeight: 48,
                          justifyContent: open ? "initial" : "center",
                          px: 2.5,
                          color: "white",
                          fontSize: "0.5rem",
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: open ? 3 : "auto",
                            justifyContent: "center",
                            color: "white",
                          }}
                        >
                          {index === 0 ? (
                            <HomeIcon />
                          ) : index === 1 ? (
                            <StorefrontIcon />
                          ) : index === 2 ? (
                            <GavelIcon />
                          ) : index === 3 ? (
                            <EmojiEventsIcon />
                          ) : (
                            <SettingsIcon />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={text}
                          sx={{ opacity: open ? 1 : 0, fontSize: "0.5rem" }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Drawer1>
            </div>
            <div className="lg:hidden bg-[#343a40]">
              <AppBar
                position="fixed"
                sx={{
                  width: { lg: `calc(100% - ${drawerWidth}px)` },
                  ml: { lg: `${drawerWidth}px` },
                  background: "#343a40",
                }}
              >
                <Toolbar>
                  <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ mr: 2, display: { lg: "none" } }}
                  >
                    <MenuIcon />
                  </IconButton>
                  <div className="w-full">
                    <div
                      className="flex justify-end w-full items-center gap-2 text-[14px] cursor-pointer "
                      onClick={() => setAdminClick(!adminClick)}
                    >
                      <div
                        className={`admin-column relative flex items-center gap-2 ${
                          adminClick ? "admin" : ""
                        }`}
                      >
                        <AccountCircleIcon />
                        Admin
                        <ExpandMoreIcon className="arrow-icon" />
                        {adminClick && (
                          <div className=" rounded-b-sm shadow-lg absolute bg-[#343a40] text-white p-2 z-50 top-10 w-[130%] right-0">
                            <Link to={"/profile"}>
                              <div className="mb-2 flex items-center gap-2 hover:text-[#FAA912] text-sm">
                                <PersonIcon
                                  sx={{ fontSize: "20px", marginLeft: "20px" }}
                                />
                                Profile
                              </div>
                            </Link>
                            <div
                              className="mb-2 flex items-center gap-2 hover:text-[#FAA912] text-sm"
                              onClick={() => logout()}
                            >
                              <LogoutIcon
                                sx={{ fontSize: "20px", marginLeft: "20px" }}
                              />
                              Logout
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Toolbar>
              </AppBar>
              <Box
                component="nav"
                sx={{
                  width: { lg: drawerWidth },
                  flexShrink: { lg: 0 },
                  background: "#343a40",
                }}
                aria-label="mailbox folders"
              >
                {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
                <Drawer
                  container={container}
                  variant="temporary"
                  open={mobileOpen}
                  onTransitionEnd={handleDrawerTransitionEnd}
                  onClose={handleDrawerClose1}
                  ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                  }}
                  sx={{
                    display: { xs: "block", lg: "none" },
                    "& .MuiDrawer-paper": {
                      boxSizing: "border-box",
                      width: drawerWidth,
                    },
                  }}
                >
                  {drawer}
                </Drawer>
                <Drawer
                  variant="permanent"
                  sx={{
                    display: { xs: "none", lg: "block" },
                    "& .MuiDrawer-paper": {
                      boxSizing: "border-box",
                      width: drawerWidth,
                    },
                  }}
                  open
                >
                  {drawer}
                </Drawer>
              </Box>
            </div>
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                maxWidth: "100vw",
              }}
            >
              <DrawerHeader sx={{ display: "block" }} />

              <div className="w-full flex-1 ">
                <Outlet />
              </div>

              <div className=" mt-[4rem] flex items-center justify-center text-xs text-[#98a6ad]">
                Copyright © 2023-2024 Made By
                <span className=" text-[#FAA912] ml-1">Master Admin</span>
              </div>
            </Box>
          </Box>
        </div>
      ) : (
        <Login />
      )}
    </div>
  );
};

export default Layout;
