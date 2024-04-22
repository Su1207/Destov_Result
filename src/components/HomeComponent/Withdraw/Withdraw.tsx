import { useEffect, useState } from "react";
import { useBidDetailsContext } from "../../BidData/BidDetailsContext";

const Withdraw = () => {
  const { withdrawTotal } = useBidDetailsContext();
  const [totalWithdraww, setTotalWithdraw] = useState(0);

  useEffect(() => {
    const totalWithdraww = Object.values(withdrawTotal).reduce(
      (acc, cur) => acc + cur,
      0
    );

    setTotalWithdraw(totalWithdraww);
  }, [withdrawTotal]);

  return (
    <div className="h-full w-full flex gap-4">
      <div className="h-full w-16 rounded-sm border bg-white flex items-center justify-center">
        <img src={"withdraw.png"} alt="" className="h-10 w-10" />
      </div>
      <div className="flex flex-col ">
        <div className="font-bold text-white text-xl">Withdraw</div>
        <div className="font-semibold text-white">&#8377; {totalWithdraww}</div>
      </div>
    </div>
  );
};

export default Withdraw;
