import { useEffect } from "react";
import { useBidDetailsContext } from "../../BidData/BidDetailsContext";

const Win = () => {
  const { winTotal, setTotalWin, totalWin } = useBidDetailsContext();

  useEffect(() => {
    const totalWin = Object.values(winTotal).reduce((acc, cur) => acc + cur, 0);

    setTotalWin(totalWin);
  }, [winTotal]);
  return (
    <div className="h-full w-full flex gap-4">
      <div className="h-full w-16 rounded-sm border bg-white flex items-center justify-center">
        <img src={"win.png"} alt="" className="h-10 w-10" />
      </div>
      <div className="flex flex-col ">
        <div className="font-bold text-white text-xl">Win</div>
        <div className="font-semibold text-white">&#8377; {totalWin}</div>
      </div>
    </div>
  );
};

export default Win;
