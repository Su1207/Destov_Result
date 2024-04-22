import { useBidDetailsContext } from "../../components/BidData/BidDetailsContext";
import AppWiseData from "../../components/HomeComponent/AppWiseData/AppWiseData";
import Deposit from "../../components/HomeComponent/Deposit/Deposit";
import ProfitLoss from "../../components/HomeComponent/ProfitLoss/ProfitLoss";
import TotalTransaction from "../../components/HomeComponent/TotalTransaction";
import Win from "../../components/HomeComponent/Win/Win";
import Withdraw from "../../components/HomeComponent/Withdraw/Withdraw";

const HomePage = () => {
  const { profit } = useBidDetailsContext();
  return (
    <div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-flow-dense min-h-24 gap-3">
        <div
          className={`p-4 border min-h-24 flex items-center justify-center col-span-1 row-span-1 rounded-md ${
            profit ? "bg-green-600" : "bg-red-600"
          }`}
        >
          <ProfitLoss />
        </div>

        <div className="p-4 border h-full bg-green-600 shadow-md rounded-md">
          <TotalTransaction />
        </div>
        <div className=" p-4 border h-full bg-red-600 shadow-md rounded-md">
          <Win />
        </div>
        <div className="p-4 border h-full bg-green-600 shadow-md rounded-md">
          <Deposit />
        </div>
        <div className="p-4 min-h-24 col-span-1 row-span-1 shadow-md border bg-red-600 rounded-md">
          <Withdraw />
        </div>
      </div>

      <AppWiseData />
    </div>
  );
};

export default HomePage;
