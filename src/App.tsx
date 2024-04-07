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

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
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
    ],
  },
]);

function App() {
  return (
    <>
      <AuthProvider>
        <ToastContainer />

        <RouterProvider router={router} />
      </AuthProvider>
    </>
  );
}

export default App;
