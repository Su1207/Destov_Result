import { useBidDetailsContext } from "../../BidData/BidDetailsContext";
import { useEffect, useState } from "react";

const Deposit = () => {
  const { depositTotal } = useBidDetailsContext();
  const [totalDeposit, setTotalDeposit] = useState(0);

  useEffect(() => {
    const totalDeposit = Object.values(depositTotal).reduce(
      (acc, cur) => acc + cur,
      0
    );

    setTotalDeposit(totalDeposit);
  }, [depositTotal]);

  return (
    <div className="h-full w-full flex gap-4">
      <div className="h-full w-16 rounded-sm border bg-white flex items-center justify-center">
        <img src={"deposit.png"} alt="" className="h-10 w-10" />
      </div>
      <div className="flex flex-col ">
        <div className="font-bold text-white text-xl">Deposit</div>
        <div className="font-semibold text-white">&#8377; {totalDeposit}</div>
      </div>
    </div>
  );
};

export default Deposit;
