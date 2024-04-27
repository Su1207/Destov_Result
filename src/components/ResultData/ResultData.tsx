import { get, getDatabase, ref, remove, set } from "firebase/database";
import { useEffect, useState } from "react";
import { database } from "../../firebase";
import { initializeApp } from "firebase/app";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export interface WinDetailsType {
  marketkey: string;
  marketName: string;
  openTotal: number;
  closeTotal: number;
}

interface WinDataType {
  [appName: string]: WinDetailsType[];
}

interface WinDataProps {
  date: number | undefined;
  month: number | undefined;
  year: number | undefined;
}

const ResultData: React.FC<WinDataProps> = ({ date, month, year }) => {
  const [winData, setWinData] = useState<WinDataType>({});
  const [loading, setLoading] = useState(false);
  const [returned, setReturned] = useState(false);

  const newDate = date?.toString().padStart(2, "0");
  const newMonth =
    month !== undefined && month >= 0
      ? (month + 1)?.toString().padStart(2, "0")
      : "";

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
                `TOTAL TRANSACTION/WIN/DATE WISE/${year}/${newMonth}/${newDate}`
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
  }, [date, month, year, returned]);

  const handleReturn = async (appName: string, gameKey: string) => {
    try {
      setLoading(true);
      const dbRef = ref(database, "FIREBASE CONFIGURATIONS");
      const dbSnapshot = await get(dbRef);

      if (dbSnapshot.exists()) {
        const promises: Promise<void>[] = [];

        dbSnapshot.forEach((dbs) => {
          if (dbs.val().name === appName && !dbs.val().disable) {
            const firebaseConfig1 = dbs.val();
            const app1 = initializeApp(
              firebaseConfig1,
              `${appName}-${gameKey}`
            );
            const database1 = getDatabase(app1);

            const winDetailRef = ref(
              database1,
              `TOTAL TRANSACTION/WIN/DATE WISE/${year}/${newMonth}/${newDate}/${gameKey}`
            );

            const promise1 = get(winDetailRef).then((winDetailSnapshot) => {
              if (winDetailSnapshot.exists()) {
                winDetailSnapshot.forEach((timeSnap) => {
                  const timestamp = timeSnap.key;

                  const userPhone = timeSnap.val().PHONE;
                  const winPoints = timeSnap.val().WIN_POINTS;

                  const promise2 = updateUserAmount(
                    database1,
                    userPhone,
                    winPoints,
                    gameKey,
                    timestamp
                  );

                  promises.push(promise2);
                });
              }
            });
            promises.push(promise1);
          }
        });
        await Promise.all(promises);
      }

      toast.success("Win Data successfully returned!!");
    } catch (err) {
      console.log(err);
      toast.error("Error in returning win amount");
    } finally {
      setLoading(false);
      setReturned(!returned);
    }
  };

  const sendRewardsQueue: { [phoneNumber: string]: Promise<void> | undefined } =
    {};

  const updateUserAmount = async (
    database1: any,
    userPhone: string,
    winPoints: number,
    gameKey: string,
    timestamp: string
  ) => {
    if (!sendRewardsQueue[userPhone]) {
      sendRewardsQueue[userPhone] = Promise.resolve();
    }

    const previousSendRewardsPromise = sendRewardsQueue[userPhone];

    const newSendRewardsPromise = previousSendRewardsPromise?.then(async () => {
      const userRef = ref(database1, `USERS/${userPhone}/AMOUNT`);
      const userSnapshot = await get(userRef);
      if (userSnapshot.exists()) {
        const currentAmount = userSnapshot.val();
        console.log(currentAmount);
        const newAmount = Math.abs(currentAmount - winPoints);
        await set(userRef, newAmount);

        const userDateWiseRef = ref(
          database1,
          `USERS TRANSACTION/${userPhone}/WIN/DATE WISE/${year}/${newMonth}/${newDate}/${gameKey}/${timestamp}`
        );
        const userTotalRef = ref(
          database1,
          `USERS TRANSACTION/${userPhone}/WIN/TOTAL/${gameKey}/${timestamp}`
        );
        const transactionDateWiseRef = ref(
          database1,
          `TOTAL TRANSACTION/WIN/DATE WISE/${year}/${newMonth}/${newDate}/${gameKey}/${timestamp}`
        );
        const transactionTotalRef = ref(
          database1,
          `TOTAL TRANSACTION/WIN/TOTAL/${gameKey}/${timestamp}`
        );

        await remove(userDateWiseRef).then(() => {
          remove(userTotalRef);
          remove(transactionDateWiseRef);
          remove(transactionTotalRef);
        });
      }
    });
    sendRewardsQueue[userPhone] = newSendRewardsPromise;

    // Return the new promise
    return newSendRewardsPromise;
  };

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
              <div className="text-xl uppercase font-bold mb-1 text-gray-500">
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
                    <th
                      scope="col"
                      className="px-3 sm:px-6 py-3 text-center"
                    ></th>
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
                      <td className="px-3 sm:px-6 cursor-pointer py-4">
                        <button
                          onClick={() => handleReturn(appName, data.marketkey)}
                          className="border py-1 px-2 cursor-pointer rounded-sm bg-red-600 hover:bg-black transition-all duration-300 ease-out text-white text-xs"
                        >
                          Return
                        </button>
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
