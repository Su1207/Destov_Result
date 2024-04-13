import { ReactNode, createContext, useContext, useState } from "react";
import { CombineBidDataType, MarketDetailsType } from "./BidData";
import dayjs, { Dayjs } from "dayjs";

interface BidDetailsContextProps {
  combinebidData: CombineBidDataType[];
  setCombineBidData: (data: CombineBidDataType[]) => void;
  bidDetails: MarketDetailsType[];
  setbidDetails: (data: MarketDetailsType[]) => void;
  open: boolean;
  setOpen: (data: boolean) => void;
  value: Dayjs | null;
  setValue: (data: Dayjs | null) => void;
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
