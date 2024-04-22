import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.css";
import ConfigInput from "./pages/ConfigInput/ConfigInput";
import MarketDetails from "./pages/Market/MarketDetails";
import { ToastContainer } from "react-toastify";
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
        path: "/login",
        element: <Login />,
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
        path: "/winData",
        element: <ResultDataPage />,
      },
      {
        path: "/winData/:id",
        element: <WinDetailPage />,
      },
    ],
  },
]);

function App() {
  return (
    <>
      <AuthProvider>
        <ToastContainer />
        <BidDetailsProvider>
          <RouterProvider router={router} />
        </BidDetailsProvider>
      </AuthProvider>
    </>
  );
}

export default App;
