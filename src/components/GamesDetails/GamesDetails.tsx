import { useEffect, useState } from "react";
import { get, ref, onValue } from "firebase/database";
import { database } from "../../firebase";
import GamesDataGrid from "./GamesDataGrid";
import CircularProgress from "@mui/material/CircularProgress";

export interface GameData {
  key: string;
  NAME: string;
  RESULT: string;
}

const formatResult = (open: string, mid: string, close: string): string => {
  return `${open}-${mid}-${close}`;
};

const GamesDetails = () => {
  const [gameData, setGameData] = useState<GameData[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const currentDate = new Date();
  const year = currentDate.getFullYear().toString();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const day = currentDate.getDate().toString().padStart(2, "0");

  useEffect(() => {
    const resultsRef = ref(database, "RESULTS");

    const fetchGameData = async () => {
      try {
        // const gamesSnapshot = await get(gamesRef);

        const snapshot = await get(resultsRef);

        if (snapshot.exists()) {
          const gamesData: GameData[] = Object.keys(snapshot.val()).map(
            (gameKey) => {
              const resultData = snapshot
                .child(gameKey)
                .child(year)
                .child(month)
                .child(day)
                .val();

              const name = snapshot.child(gameKey).child("NAME").val();

              const resultString = resultData
                ? formatResult(
                    resultData.OPEN,
                    resultData.MID,
                    resultData.CLOSE
                  )
                : "✦✦✦-✦✦-✦✦✦";

              return {
                key: gameKey,
                NAME: name,
                RESULT: resultString,
              };
            }
          );

          setGameData(gamesData);
        }
      } catch (error) {
        console.error("Error fetching game data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribeResults = onValue(resultsRef, () => {
      fetchGameData(); // Fetch game data whenever result data changes
    });

    return () => {
      unsubscribeResults();
    };
  }, [day]);

  return (
    <div>
      {isLoading ? (
        <div className="w-full h-[100vh] flex items-center justify-center">
          <CircularProgress color="secondary" />
        </div>
      ) : (
        gameData && <GamesDataGrid gameData={gameData} />
      )}
    </div>
  );
};

export default GamesDetails;
