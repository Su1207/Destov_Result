import { useParams } from "react-router-dom";
import WinDetail from "../../components/ResultData/WinDetail";

const WinDetailPage = () => {
  const { id } = useParams();
  const gameData = id || "";
  return (
    <div>
      <WinDetail gameData={gameData} />
    </div>
  );
};

export default WinDetailPage;
