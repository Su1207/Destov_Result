import { get, getDatabase, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { database } from "../../firebase";
import { initializeApp } from "firebase/app";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

export interface WinDetailsType {
  marketkey: string;
  marketName: string;
  openTotal: number;
  closeTotal: number;
}

interface WinDataType {
  [appName: string]: WinDetailsType[];
}

const ResultData = () => {
  const [winData, setWinData] = useState<WinDataType>({});
  const [loading, setLoading] = useState(false);

  const currentDate = new Date();
  const year = currentDate.getFullYear().toString();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const day = currentDate.getDate().toString().padStart(2, "0");

  useEffect(() => {
    const fetchWinData = async () => {
      try {
        setLoading(true);
        const dbRef = ref(database, "FIREBASE CONFIGURATIONS");
        const dbSnapshot = await get(dbRef);

        if (dbSnapshot.exists()) {
          const promises: Promise<void>[] = [];
          const winData: WinDataType = {};
          dbSnapshot.forEach((dbs) => {
            if (!dbs.val().disable) {
              const firebaseConfig1 = dbs.val();

              const appName = dbs.val().name;

              const app1 = initializeApp(firebaseConfig1, `${appName}`);
              const database1 = getDatabase(app1);

              const winDataRef = ref(
                database1,
                `TOTAL TRANSACTION/WIN/DATE WISE/${year}/${month}/${day}`
              );

              const promise1 = get(winDataRef).then((winDataSnapshot) => {
                if (winDataSnapshot.exists()) {
                  const winDataDetail: WinDetailsType[] = [];

                  winDataSnapshot.forEach((marketsnapshot) => {
                    const marketKey = marketsnapshot.key;
                    let marketName: string = "";
                    let totalOpen: number = 0;
                    let totalClose: number = 0;

                    marketsnapshot.forEach((timestamp) => {
                      marketName = timestamp.val().MARKET_NAME;
                      if (timestamp.val().OPEN_CLOSE === "OPEN") {
                        totalOpen += timestamp.val().WIN_POINTS;
                      } else {
                        totalClose += timestamp.val().WIN_POINTS;
                      }
                    });
                    winDataDetail.push({
                      marketkey: marketKey,
                      marketName: marketName,
                      openTotal: totalOpen,
                      closeTotal: totalClose,
                    });
                  });
                  winData[appName] = winDataDetail;
                }
              });
              promises.push(promise1);
            }
          });
          await Promise.all(promises);
          setWinData(winData);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWinData();
  }, []);

  const navigate = useNavigate();
  const handleClick = (appName: string, gameName: string, gameKey: string) => {
    navigate(`/winData/${appName}:${gameName}:${gameKey}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full">
      {loading ? (
        <div className="w-full h-[100vh] flex items-center justify-center">
          <CircularProgress color="secondary" />
        </div>
      ) : (
        <div className="">
          {Object.entries(winData).map(([appName, windata]) => (
            <div key={appName} className="overflow-x-auto sm:rounded-lg mb-8 ">
              <div className="text-xl font-bold mb-1 text-gray-500">
                {appName}
              </div>

              <table className="w-full  text-sm text-left border rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-sm text-gray-100 uppercase bg-orange-500 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-3 sm:px-6 py-3 text-center">
                      MARKETS
                    </th>
                    <th scope="col" className="px-3 sm:px-6 py-3 text-center">
                      OPEN
                    </th>
                    <th scope="col" className="px-3 sm:px-6 py-3 text-center">
                      CLOSE
                    </th>
                    <th scope="col" className="px-3 sm:px-6 py-3 text-center">
                      TOTAL
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {windata.map((data, index) => (
                    <tr
                      key={index}
                      className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b text-center dark:border-gray-700"
                    >
                      <th
                        scope="row"
                        className="px-3 cursor-pointer sm:px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        onClick={() =>
                          handleClick(appName, data.marketName, data.marketkey)
                        }
                      >
                        {data.marketName}
                      </th>
                      <td
                        onClick={() =>
                          handleClick(appName, data.marketName, data.marketkey)
                        }
                        className="px-3 sm:px-6 cursor-pointer py-4"
                      >
                        {data.openTotal}
                      </td>
                      <td
                        onClick={() =>
                          handleClick(appName, data.marketName, data.marketkey)
                        }
                        className="px-3 sm:px-6 cursor-pointer py-4"
                      >
                        {data.closeTotal}
                      </td>
                      <td
                        onClick={() =>
                          handleClick(appName, data.marketName, data.marketkey)
                        }
                        className="px-3 sm:px-6 cursor-pointer py-4"
                      >
                        {data.openTotal + data.closeTotal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          {Object.keys(winData).length === 0 && (
            <div className="no-data">
              <img src="/noData.gif" alt="" className="no-data-img" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultData;
