import { useParams } from "react-router-dom";
import BidDetails from "../../components/BidData/BidDetails";
import { useEffect } from "react";

const BidDataDetailsPage = () => {
  const { id } = useParams();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div>
      <BidDetails gameType={id} />
    </div>
  );
};

export default BidDataDetailsPage;
