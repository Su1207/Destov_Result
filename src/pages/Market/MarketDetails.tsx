import { useEffect } from "react";
import GamesDetails from "../../components/GamesDetails/GamesDetails";

const MarketDetails = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  return (
    <div>
      <GamesDetails />
    </div>
  );
};

export default MarketDetails;
