import { useParams } from "react-router-dom";
import BidDetails from "../../components/BidData/BidDetails";

const BidDataDetailsPage = () => {
  const { id } = useParams();

  return (
    <div>
      <BidDetails gameType={id} />
    </div>
  );
};

export default BidDataDetailsPage;
