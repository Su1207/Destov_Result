import { useParams } from "react-router-dom";
import WinDetail from "../../components/ResultData/WinDetail";
import { useEffect } from "react";

const WinDetailPage = () => {
  const { id } = useParams();
  const gameData = id || "";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  return (
    <div>
      <WinDetail gameData={gameData} />
    </div>
  );
};

export default WinDetailPage;
