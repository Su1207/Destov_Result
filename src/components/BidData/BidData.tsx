import { get, getDatabase, ref, remove, set } from "firebase/database";
import { useEffect, useState } from "react";
import { database } from "../../firebase";
import { initializeApp } from "firebase/app";
import { CircularProgress } from "@mui/material";
import { useBidDetailsContext } from "./BidDetailsContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

type BidDataType = {
  appName: string;
  gameKey: string;
  gameName: string;
  openTotal: number;
  closeTotal: number;
};

export type CombineBidDataType = {
  appName: string[];
  marketName: string;
  numbers: { [number: string]: number };
  marketTotalPoints: number;
};

export interface MarketDetailsType {
  appName: string;
  marketName: string;
  numbers: { [number: string]: number };
  marketTotalPoints: number;
}

type CombineBidType = {
  gameName: string;
  gameData: BidDataType[];
};

interface BidDataProps {
  date: number | undefined;
  month: number | undefined;
  year: number | undefined;
}

const BidData: React.FC<BidDataProps> = ({ date, month, year }) => {
  const { setbidDetails } = useBidDetailsContext();

  const [bidData, setBidData] = useState<BidDataType[] | null>(null);
  const { setCombineBidData } = useBidDetailsContext();
  const [returned, setReturned] = useState(false);

  const [loading, setLoading] = useState(false);
  const [combineBid, setCombineBid] = useState<CombineBidType[]>();

  const newDate = date?.toString().padStart(2, "0");
  const newMonth =
    month !== undefined && month >= 0
      ? (month + 1)?.toString().padStart(2, "0")
      : "";

  // console.log(newDate, newMonth, year);
  console.log(bidData);

  useEffect(() => {
    const fetchBidData = async () => {
      try {
        setLoading(true);
        const dbRef = ref(database, "FIREBASE CONFIGURATIONS");
        const dbSnapshot = await get(dbRef);
        if (dbSnapshot.exists()) {
          const promises: Promise<void>[] = [];
          const bidDataArray: BidDataType[] = [];

          dbSnapshot.forEach((firebaseDb) => {
            if (firebaseDb.exists() && !firebaseDb.val().disable) {
              const firebaseConfig1 = firebaseDb.val();

              const app1 = initializeApp(
                firebaseConfig1,
                `${firebaseDb.val().name}`
              );
              const database1 = getDatabase(app1);
              const gameRef = ref(database1, "GAMES");

              const appName = firebaseDb.val().name;

              const promise1 = get(gameRef).then((gameSnapshot) => {
                if (gameSnapshot.exists()) {
                  gameSnapshot.forEach((gameKey) => {
                    const marketKey = gameKey.key;
                    const gameName = gameKey.val().NAME;

                    const bidRef = ref(
                      database1,
                      `TOTAL TRANSACTION/BIDS/${year}/${newMonth}/${newDate}/${marketKey}`
                    );

                    const calculateTotalPoints = (snapshot: any) => {
                      let totalPoints: number = 0;

                      if (snapshot.exists()) {
                        snapshot.forEach((gameTypeSnapshot: any) => {
                          gameTypeSnapshot.forEach((numberSnapshot: any) => {
                            numberSnapshot
                              .child("USERS")
                              .forEach((userSnapshot: any) => {
                                totalPoints += userSnapshot.val() || 0;
                              });
                          });
                        });
                      }

                      return totalPoints;
                    };

                    const promise2 = get(bidRef).then((bidSnapshot) => {
                      if (bidSnapshot.exists()) {
                        const openTotalPoints = calculateTotalPoints(
                          bidSnapshot.child("OPEN")
                        );
                        const closeTotalPoints = calculateTotalPoints(
                          bidSnapshot.child("CLOSE")
                        );

                        bidDataArray.push({
                          appName: appName,
                          gameKey: marketKey,
                          gameName: gameName,
                          openTotal: openTotalPoints,
                          closeTotal: closeTotalPoints,
                        });
                      }
                    });

                    promises.push(promise2);
                  });
                }
              });

              promises.push(promise1);
            }
          });

          // Wait for all promises to resolve before setting the bid data
          await Promise.all(promises);

          setTimeout(() => {
            setBidData(bidDataArray);
            combineBidData(bidDataArray);

            setLoading(false);
          }, 700); // A
          // Set the bid data after all promises have resolved
          setBidData(bidDataArray);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchBidData();
  }, [date, month, year, newDate, newMonth, returned]);

  const navigate = useNavigate();

  const combineBidData = async (bidDataArray: BidDataType[]) => {
    try {
      setLoading(true);
      const resultRef = ref(database, "RESULTS");
      const resultSnapshot = await get(resultRef);

      if (resultSnapshot.exists()) {
        const combineBid: CombineBidType[] = [];

        if (bidDataArray) {
          resultSnapshot.forEach((gameId) => {
            if (gameId.exists()) {
              const gameName = gameId.val().NAME;
              const updatedBidData = bidDataArray.filter(
                (bid) => bid.gameName === gameName
              );
              //   console.log(updatedBidData);
              if (updatedBidData.length > 0) {
                combineBid.push({
                  gameName: gameName,
                  gameData: updatedBidData,
                });
              }
            }
          });
          setCombineBid(combineBid);
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenClick = async (gameData: BidDataType[], gameName: string) => {
    try {
      setLoading(true);
      const dbREf = ref(database, "FIREBASE CONFIGURATIONS");

      const dbSnapshot = await get(dbREf);

      const bidDetailsArray: MarketDetailsType[] = [];
      const promises: Promise<void>[] = [];

      gameData.forEach((game) => {
        if (game.openTotal !== 0) {
          dbSnapshot.forEach((snapshot) => {
            if (
              snapshot.val().name === game.appName &&
              !snapshot.val().disable
            ) {
              const firebaseConfig1 = snapshot.val();

              const app1 = initializeApp(firebaseConfig1, `${game.appName}`);

              const database1 = getDatabase(app1);
              const dataRef = ref(
                database1,
                `TOTAL TRANSACTION/BIDS/${year}/${newMonth}/${newDate}/${game.gameKey}/OPEN`
              );

              const promise2 = get(dataRef).then((marketType) => {
                if (marketType.exists()) {
                  marketType.forEach((gameName) => {
                    const marketName = gameName.key || "";
                    const numbers: { [number: string]: number } = {};
                    let marketTotalPoints = 0;

                    gameName.forEach((numberSnapshot) => {
                      if (numberSnapshot.exists()) {
                        const number = numberSnapshot.key;
                        const points = numberSnapshot.val().POINTS || 0;

                        marketTotalPoints += points;

                        numbers[number] = points;
                      }
                    });

                    const sortedNumbers = Object.fromEntries(
                      Object.entries(numbers).sort(([, a], [, b]) => {
                        // Change the logic here to sort based on points
                        return a - b;
                      })
                    );

                    bidDetailsArray.push({
                      appName: `${game.appName}:${game.gameKey}:${game.gameName}`,
                      marketName: marketName,
                      numbers: sortedNumbers,
                      marketTotalPoints: marketTotalPoints,
                    });
                  });
                }
              });
              promises.push(promise2);
            }
          });
        }
      });

      const sortOrder = [
        "Single Digit",
        "Jodi Digit",
        "Single Panel",
        "Double Panel",
        "Triple Panel",
        "Half Sangam",
        "Full Sangam",
      ];

      bidDetailsArray.sort(
        (a, b) =>
          sortOrder.indexOf(a.marketName) - sortOrder.indexOf(b.marketName)
      );

      // Wait for all promises to resolve
      await Promise.all(promises);

      // Once all promises are resolved and bidDetails is populated, set the state
      setbidDetails(bidDetailsArray);
      const combineBidData = await combineBidDetails(bidDetailsArray);
      setCombineBidData(combineBidData);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      navigate(`/bidData/OPEN:${gameName}`);
    }
  };

  const handleCloseClick = async (
    gameData: BidDataType[],
    gameName: string
  ) => {
    try {
      setLoading(true);
      const dbREf = ref(database, "FIREBASE CONFIGURATIONS");

      const dbSnapshot = await get(dbREf);

      const bidDetailsArray: MarketDetailsType[] = [];
      const promises: Promise<void>[] = [];

      gameData.forEach((game) => {
        if (game.closeTotal !== 0) {
          dbSnapshot.forEach((snapshot) => {
            if (
              snapshot.val().name === game.appName &&
              !snapshot.val().disable
            ) {
              const firebaseConfig1 = snapshot.val();

              const app1 = initializeApp(firebaseConfig1, `${game.appName}`);

              const database1 = getDatabase(app1);
              console.log(game.gameKey);
              const dataRef = ref(
                database1,
                `TOTAL TRANSACTION/BIDS/${year}/${newMonth}/${newDate}/${game.gameKey}/CLOSE`
              );

              const promise2 = get(dataRef).then((marketType) => {
                if (marketType.exists()) {
                  marketType.forEach((gameName) => {
                    const marketName = gameName.key || "";
                    const numbers: { [number: string]: number } = {};
                    let marketTotalPoints = 0;

                    gameName.forEach((numberSnapshot) => {
                      if (numberSnapshot.exists()) {
                        const number = numberSnapshot.key;
                        const points = numberSnapshot.val().POINTS || 0;

                        marketTotalPoints += points;

                        numbers[number] = points;
                      }
                    });

                    bidDetailsArray.push({
                      appName: `${game.appName}:${game.gameKey}`,
                      marketName: marketName,
                      numbers: numbers,
                      marketTotalPoints: marketTotalPoints,
                    });
                  });
                }
              });
              promises.push(promise2);
            }
          });
        }
      });

      const sortOrder = [
        "Single Digit",
        "Jodi Digit",
        "Single Panel",
        "Double Panel",
        "Triple Panel",
        "Half Sangam",
        "Full Sangam",
      ];

      bidDetailsArray.sort(
        (a, b) =>
          sortOrder.indexOf(a.marketName) - sortOrder.indexOf(b.marketName)
      );

      // Wait for all promises to resolve
      await Promise.all(promises);

      // Once all promises are resolved and bidDetails is populated, set the state
      setbidDetails(bidDetailsArray);
      const combineBidData = await combineBidDetails(bidDetailsArray);
      setCombineBidData(combineBidData);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      navigate(`/bidData/CLOSE:${gameName}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const combineBidDetails = async (bidDetailsArray: MarketDetailsType[]) => {
    const marketMap = new Map<string, CombineBidDataType>();

    bidDetailsArray.forEach(
      ({ appName, marketName, numbers, marketTotalPoints }) => {
        if (marketMap.has(marketName)) {
          const existingMarket = marketMap.get(marketName)!;
          Object.keys(numbers).forEach((number) => {
            existingMarket.numbers[number] =
              (existingMarket.numbers[number] || 0) + numbers[number];
          });
          // Add appName to the existing market's appName array
          existingMarket.appName.push(appName); // <- Change here
          // Update marketTotalPoints
          existingMarket.marketTotalPoints += marketTotalPoints;
        } else {
          // Add a new market to the map
          marketMap.set(marketName, {
            appName: [appName], // Array of appNames
            marketName: marketName,
            numbers: { ...numbers }, // Clone numbers object
            marketTotalPoints: marketTotalPoints,
          });
        }
      }
    );

    // Convert the map values back to an array
    const arrangedMarketData = Array.from(marketMap.values());

    const sortOrder = [
      "Single Digit",
      "Jodi Digit",
      "Single Panel",
      "Double Panel",
      "Triple Panel",
      "Half Sangam",
      "Full Sangam",
    ];

    arrangedMarketData.sort(
      (a, b) =>
        sortOrder.indexOf(a.marketName) - sortOrder.indexOf(b.marketName)
    );
    return arrangedMarketData;
  };

  const handleReturn = async (gameData: BidDataType) => {
    try {
      setLoading(true);
      const appName = gameData.appName;

      const dbRef = ref(database, "FIREBASE CONFIGURATIONS");
      const dbSnapshot = await get(dbRef);

      if (dbSnapshot.exists()) {
        await processDBSnapshot(dbSnapshot, appName, gameData);
      }

      toast.success("Successfully returned Bid!!!");
    } catch (err) {
      console.log(err);
      toast.error("Error occured..");
    } finally {
      setLoading(false);
      setReturned(!returned);
    }
  };

  const processDBSnapshot = async (
    dbSnapshot: any,
    appName: string,
    gameData: BidDataType
  ) => {
    const promises: Promise<void>[] = [];

    dbSnapshot.forEach((db: any) => {
      if (db.exists() && db.val().name === appName && !db.val().disable) {
        const firebaseConfig1 = db.val();
        const app1 = initializeApp(firebaseConfig1, `${appName}`);
        const database1 = getDatabase(app1);

        const bidRef = ref(
          database1,
          `TOTAL TRANSACTION/BIDS/${year}/${newMonth}/${newDate}/${gameData.gameKey}`
        );

        promises.push(
          new Promise<void>((resolve, reject) => {
            get(bidRef)
              .then(async (bidSnapshot) => {
                if (bidSnapshot.exists()) {
                  await processBidSnapshot(
                    bidSnapshot,
                    database1,
                    gameData,
                    resolve
                  );
                } else {
                  resolve();
                }
              })
              .catch(reject);
          })
        );
      }
    });

    await Promise.all(promises);
  };

  const processBidSnapshot = async (
    bidSnapshot: any,
    database1: any,
    gameData: BidDataType,
    resolve: () => void
  ) => {
    // const promises: Promise<void>[] = [];
    const queue: (() => Promise<void>)[] = [];

    const bidRef = ref(
      database1,
      `TOTAL TRANSACTION/BIDS/${year}/${newMonth}/${newDate}/${gameData.gameKey}`
    );

    bidSnapshot.forEach((gameType: any) => {
      gameType.forEach((game: any) => {
        game.forEach((number: any) => {
          number.child("USERS").forEach((user: any) => {
            const phone = user.key;

            const userRef = ref(database1, `USERS/${phone}/AMOUNT`);
            const transactionRef = ref(
              database1,
              `USERS TRANSACTION/${phone}/BID/DATE WISE/${year}/${newMonth}/${newDate}/${gameData.gameKey}`
            );
            queue.push(async () => {
              const snapshot = await get(userRef);
              if (snapshot.exists()) {
                const newAmount = snapshot.val() + user.val();
                console.log(snapshot.val());

                // Perform the set operation
                await set(userRef, newAmount);
                console.log("Set operation completed");

                const transactionSnapshot = await get(transactionRef);
                if (transactionSnapshot.exists()) {
                  const promises: Promise<void>[] = [];
                  transactionSnapshot.forEach((timeSnap) => {
                    const timestamp = timeSnap.key;

                    const totalRef = ref(
                      database1,
                      `USERS TRANSACTION/${phone}/BID/TOTAL/${gameData.gameKey}/${timestamp}`
                    );

                    const promise1 = remove(totalRef);
                    promises.push(promise1);
                  });
                  await Promise.all(promises);
                  await remove(transactionRef);
                }
              }
            });
          });
        });
      });
    });

    // Execute the queue sequentially
    for (const task of queue) {
      await task();
    }

    console.log("All set operations completed");
    await remove(bidRef);
    resolve();
  };

  return (
    <div>
      {loading ? (
        <div className="w-full h-[100vh] flex items-center justify-center">
          <CircularProgress color="secondary" />
        </div>
      ) : (
        <>
          {combineBid && combineBid.length > 0 ? (
            <>
              {combineBid.map((data, index) => (
                <div
                  key={index}
                  className="relative overflow-x-auto shadow-md sm:rounded-lg mb-8"
                >
                  <div>{data.gameName}</div>
                  <table className="w-full text-sm text-left border rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          APP
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 cursor-pointer"
                          onClick={() =>
                            handleOpenClick(data.gameData, data.gameName)
                          }
                        >
                          OPEN
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 cursor-pointer"
                          onClick={() =>
                            handleCloseClick(data.gameData, data.gameName)
                          }
                        >
                          CLOSE
                        </th>
                        <th scope="col" className="px-6 py-3">
                          TOTAL
                        </th>
                        <th scope="col" className=""></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.gameData.map((bidData, index) => (
                        <tr
                          key={index}
                          className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                        >
                          <th
                            scope="row"
                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                          >
                            {bidData.appName}
                          </th>
                          <td className="px-6 py-4">{bidData.openTotal}</td>
                          <td className="px-6 py-4">{bidData.closeTotal}</td>
                          <td className="px-6 py-4">
                            {bidData.openTotal + bidData.closeTotal}
                          </td>
                          <td className="px-3">
                            <button
                              onClick={() => handleReturn(bidData)}
                              className="text-xs px-3 py-1 bg-blue-900 hover:bg-orange-500 transition-all duration-300 ease-in-out shadow-md rounded-sm text-white border"
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
            </>
          ) : (
            <div className="no-data">
              <img src="/noData.gif" alt="" className="no-data-img" />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BidData;
