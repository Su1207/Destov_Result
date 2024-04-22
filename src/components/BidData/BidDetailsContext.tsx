import { ReactNode, createContext, useContext, useState } from "react";
import { CombineBidDataType, MarketDetailsType } from "./BidData";
import dayjs, { Dayjs } from "dayjs";
import { BidTotalType } from "../HomeComponent/TotalTransaction";

interface BidDetailsContextProps {
  combinebidData: CombineBidDataType[];
  setCombineBidData: (data: CombineBidDataType[]) => void;
  bidDetails: MarketDetailsType[];
  setbidDetails: (data: MarketDetailsType[]) => void;
  open: boolean;
  setOpen: (data: boolean) => void;
  value: Dayjs | null;
  setValue: (data: Dayjs | null) => void;
  totalBid: number;
  setTotalBid: (Data: number) => void;
  totalWin: number;
  setTotalWin: (Data: number) => void;
  depositTotal: BidTotalType;
  setdepositTotal: (data: BidTotalType) => void;
  winTotal: BidTotalType;
  setWinTotal: (data: BidTotalType) => void;
  bidTotal: BidTotalType;
  setBidTotal: (data: BidTotalType) => void;
  withdrawTotal: BidTotalType;
  setWithdrawTotal: (data: BidTotalType) => void;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  profit: boolean;
  setProfit: React.Dispatch<React.SetStateAction<boolean>>;
  selectedMenuItem: string;
  setSelectedMenuItem: (data: string) => void;
}

const BidDetailsContext = createContext<BidDetailsContextProps | undefined>(
  undefined
);

export const BidDetailsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [combinebidData, setCombineBidData] = useState<CombineBidDataType[]>(
    []
  );

  const [bidDetails, setbidDetails] = useState<MarketDetailsType[]>([]);
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState<Dayjs | null>(dayjs(new Date()));
  const [totalBid, setTotalBid] = useState(0);
  const [totalWin, setTotalWin] = useState(0);
  const [depositTotal, setdepositTotal] = useState<BidTotalType>({});
  const [withdrawTotal, setWithdrawTotal] = useState<BidTotalType>({});
  const [winTotal, setWinTotal] = useState<BidTotalType>({});
  const [loading, setLoading] = useState(false);
  const [profit, setProfit] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState("");

  const [bidTotal, setBidTotal] = useState<BidTotalType>({});

  return (
    <BidDetailsContext.Provider
      value={{
        combinebidData,
        setCombineBidData,
        bidDetails,
        setbidDetails,
        open,
        setOpen,
        value,
        setValue,
        totalBid,
        setTotalBid,
        totalWin,
        setTotalWin,
        depositTotal,
        setdepositTotal,
        withdrawTotal,
        setWithdrawTotal,
        winTotal,
        setWinTotal,
        loading,
        setLoading,
        bidTotal,
        setBidTotal,
        profit,
        setProfit,
        selectedMenuItem,
        setSelectedMenuItem,
      }}
    >
      {children}
    </BidDetailsContext.Provider>
  );
};

export const useBidDetailsContext = () => {
  const context = useContext(BidDetailsContext);
  if (!context) {
    throw new Error("Error");
  }
  return context;
};
