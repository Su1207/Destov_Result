import { get, onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { database } from "../../firebase";
import { GameData } from "../../components/GamesDetails/GamesDetails";
import CircularProgress from "@mui/material/CircularProgress";

const formatResult = (open: string, mid: string, close: string): string => {
  return `${open}-${mid}-${close}`;
};

const Website = () => {
  const [result, setResult] = useState<GameData[] | null>(null);
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
              const app = snapshot.child(gameKey).child("APP").val();
              const color = snapshot.child(gameKey).child("COLOR").val();

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
                APP: app,
                COLOR: color,
              };
            }
          );

          setResult(gamesData);
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
    <div className=" w-full">
      {isLoading ? (
        <div className="w-full h-[100vh] flex items-center justify-center">
          <CircularProgress color="secondary" />
        </div>
      ) : (
        <div className=" bg-blue-100 m-4 rounded-md">
          {result &&
            result.map((data: any, index: number) => (
              <div key={index}>
                <div
                  className="flex xs:flex-row flex-col gap-2 xs:gap-0 justify-center items-center xs:justify-between p-5 xs:px-8 py-8"
                  style={{ backgroundColor: data?.COLOR || "inherit" }}
                >
                  <h3 className="text-xl sm:text-2xl font-semibold">
                    {data.NAME}
                  </h3>
                  <p className="text-lg sm:text-xl ">{data.RESULT}</p>
                </div>
                <div className=" border w-full h-0 border-red-600 "></div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Website;
