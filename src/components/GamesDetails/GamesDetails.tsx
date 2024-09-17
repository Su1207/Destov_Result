import { useEffect, useState } from "react";
import { get, ref, onValue } from "firebase/database";
import { database } from "../../firebase";
import GamesDataGrid from "./GamesDataGrid";
import CircularProgress from "@mui/material/CircularProgress";

export interface GameData {
  key: string;
  NAME: string;
  RESULT: string;
  COLOR: string;
  OPEN: number;
  CLOSE: number;
  APP: string[];
}

const formatResult = (open: string, mid: string, close: string): string => {
  return `${open}-${mid}-${close}`;
};

const GamesDetails = () => {
  const [gameData, setGameData] = useState<GameData[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getAdjustedDate = () => {
    const currentDate = new Date();

    // Get current hour to check if it's before or after 1 AM
    const currentHour = currentDate.getHours();

    // If the time is before 1 AM, use the previous day's date
    if (currentHour < 1) {
      currentDate.setDate(currentDate.getDate() - 1);
      currentDate.setHours(0, 0, 0, 0);
    }

    const year = currentDate.getFullYear().toString();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const day = currentDate.getDate().toString().padStart(2, "0");

    // const hour = (currentDate.getHours() % 12 || 12)
    //   .toString()
    //   .padStart(2, "0");
    // const min = currentDate.getMinutes().toString().padStart(2, "0");
    // const sec = currentDate.getSeconds().toString().padStart(2, "0");

    // // Determine AM/PM
    // const meridiem = currentDate.getHours() >= 12 ? "PM" : "AM";

    // // Create date string in desired format
    // const dateString = `${date}-${month}-${year} | ${hour}:${min}:${sec} ${meridiem}`;

    // const timestamp = currentDate.getTime();

    return { year, month, day };
  };

  const { year, month, day } = getAdjustedDate();

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
              const app = snapshot.child(gameKey).child("APP").val();
              const color = snapshot.child(gameKey).child("COLOR").val();
              const open = snapshot.child(gameKey).child("OPEN").val();

              const close = snapshot.child(gameKey).child("CLOSE").val();

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
                OPEN: open,
                CLOSE: close,
                APP: app,
                COLOR: color,
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
