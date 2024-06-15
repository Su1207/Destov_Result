import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.css";
import ConfigInput from "./pages/ConfigInput/ConfigInput";
import MarketDetails from "./pages/Market/MarketDetails";
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./Layout";
import { AuthProvider } from "./components/Auth-context";
import Login from "./pages/login/Login";
import "./styles/global.scss";
import Profile from "./pages/Profile/Profile";
import BidDataPage from "./pages/BidDataPage/BidDataPage";
import BidDataDetailsPage from "./pages/BidDataPage/BidDataDetailsPage";
import { BidDetailsProvider } from "./components/BidData/BidDetailsContext";
import ResultDataPage from "./pages/ResultDataPage/ResultDataPage";
import WinDetailPage from "./pages/ResultDataPage/WinDetailPage";
import HomePage from "./pages/HomePage/HomePage";
// import Website from "./pages/Websites/Website";
import WebsiteMarket from "./pages/Websites/WebsiteMarket";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/market",
        element: <MarketDetails />,
      },
      {
        path: "/setting",
        element: <ConfigInput />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/bidData",
        element: <BidDataPage />,
      },
      {
        path: "/bidData/:id",
        element: <BidDataDetailsPage />,
      },
      {
        path: "/website",
        element: <WebsiteMarket />,
      },
      // {
      //   path: "/website",
      //   element: <Website />,
      // },
      {
        path: "/winData",
        element: <ResultDataPage />,
      },
      {
        path: "/winData/:id",
        element: <WinDetailPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

function App() {
  return (
    <>
      <AuthProvider>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          transition={Slide}
        />
        <BidDetailsProvider>
          <RouterProvider router={router} />
        </BidDetailsProvider>
      </AuthProvider>
    </>
  );
}

export default App;
