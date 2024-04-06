import { Route, Routes } from "react-router-dom";
import "./App.css";
import ConfigInput from "./pages/ConfigInput/ConfigInput";
import MarketDetails from "./pages/Market/MarketDetails";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <ToastContainer />

      <Routes>
        <Route path="/" element={<MarketDetails />} />
        <Route path="/addFirebase" element={<ConfigInput />} />
      </Routes>
    </>
  );
}

export default App;
