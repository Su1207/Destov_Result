import { useEffect, useState } from "react";
import { useBidDetailsContext } from "../../BidData/BidDetailsContext";

const ProfitLoss = () => {
  const { totalBid, totalWin } = useBidDetailsContext();

  const { profit, setProfit } = useBidDetailsContext();
  const [calculatedValue, setCalculatedValue] = useState(0);

  useEffect(() => {
    const calculateProfit = () => {
      const value = totalBid - totalWin;

      if (value >= 0) {
        setProfit(true);
      } else if (value < 0) {
        setProfit(false);
      }

      setCalculatedValue(Math.abs(value));
    };

    // Call the function when the component mounts or when totalDeposit or totalWithdraw changes
    calculateProfit();
  }, [totalBid, totalWin]);
  return (
    <div className="h-full w-full flex gap-4">
      <div className="h-full w-16 rounded-sm border bg-white flex items-center justify-center">
        <img
          src={profit ? "profit.png" : "lost.png"}
          alt=""
          className="h-10 w-10"
        />
      </div>
      <div className="flex flex-col">
        <div className="font-bold text-white text-xl">Profit/Loss</div>
        <div className="font-semibold text-white">
          &#8377; {calculatedValue}
        </div>
      </div>
    </div>
  );
};

export default ProfitLoss;
