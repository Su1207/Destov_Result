import { get, getDatabase, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { database } from "../../firebase";
import { initializeApp } from "firebase/app";
import { useBidDetailsContext } from "../BidData/BidDetailsContext";

export interface BidTotalType {
  [appName: string]: number;
}

const TotalTransaction = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const currentDay = currentDate.getDate().toString().padStart(2, "0");

  const [loading, setLoading] = useState(false);

  const {
    bidTotal,
    setBidTotal,
    winTotal,
    setWinTotal,
    depositTotal,
    setdepositTotal,
    withdrawTotal,
    setWithdrawTotal,
  } = useBidDetailsContext();
  const { totalBid, setTotalBid } = useBidDetailsContext();

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        setLoading(true);
        const dbRef = ref(database, "FIREBASE CONFIGURATIONS");

        const dbSnapshot = await get(dbRef);

        if (dbSnapshot.exists()) {
          const promises: Promise<void>[] = [];
          const bidTotal: BidTotalType = {};
          const winTotal: BidTotalType = {};
          const depositTotal: BidTotalType = {};
          const withdrawTotal: BidTotalType = {};

          dbSnapshot.forEach((dbs) => {
            if (!dbs.val().disable) {
              const firebaseConfig1 = dbs.val();
              const app1 = initializeApp(firebaseConfig1, `${dbs.val().name}`);
              const database1 = getDatabase(app1);

              let totalBidAmount = 0;

              const appName = dbs.val().name;

              const userRef = ref(database1, "USERS");

              const promise1 = get(userRef).then((userSnapshot) => {
                if (userSnapshot.exists()) {
                  const userPromises: Promise<void>[] = [];

                  userSnapshot.forEach((userKey) => {
                    const userPhone = userKey.key;

                    const bidRef = ref(
                      database1,
                      `USERS TRANSACTION/${userPhone}/BID/DATE WISE/${currentYear}/${currentMonth}/${currentDay}`
                    );

                    const promise2 = get(bidRef).then((bidSnapshot) => {
                      if (bidSnapshot.exists()) {
                        bidSnapshot.forEach((gameKey) => {
                          gameKey.forEach((timeSnap) => {
                            const amount = timeSnap.val().POINTS;

                            totalBidAmount += amount;
                          });
                        });
                      }
                    });

                    userPromises.push(promise2);
                  });

                  return Promise.all(userPromises).then(() => {
                    bidTotal[appName] = totalBidAmount;

                    // Now that promise1 has completed, create and resolve promise3
                    let totalWin = 0;

                    const winRef = ref(
                      database1,
                      `TOTAL TRANSACTION/WIN/DATE WISE/${currentYear}/${currentMonth}/${currentDay}`
                    );
                    const promise3 = get(winRef).then((winSnapshot) => {
                      if (winSnapshot.exists()) {
                        winSnapshot.forEach((market) => {
                          market.forEach((timeSnap) => {
                            const amount = timeSnap
                              .child("WIN_POINTS")
                              .val() as number;
                            totalWin += amount;
                          });
                        });
                      }
                    });
                    return Promise.all([promise3]).then(() => {
                      winTotal[appName] = totalWin;

                      let totalDepositAmount = 0;

                      const depositRef = ref(
                        database1,
                        `TOTAL TRANSACTION/DEPOSIT/DATE WISE/${currentYear}/${currentMonth}/${currentDay}`
                      );

                      const depositPromise = get(depositRef).then(
                        (depositSnapshot) => {
                          if (depositSnapshot.exists()) {
                            depositSnapshot.forEach((timeSnap) => {
                              const amount = timeSnap
                                .child("AMOUNT")
                                .val() as number;
                              //   console.log(amount, userPhone);
                              totalDepositAmount += amount;
                              //   console.log(totalDepositAmount);
                            });
                          }
                        }
                      );
                      return Promise.all([depositPromise]).then(() => {
                        depositTotal[appName] = totalDepositAmount;

                        let totalWithdrawAmount = 0;

                        const withdrawRef = ref(
                          database1,
                          `TOTAL TRANSACTION/WITHDRAW/DATE WISE/${currentYear}/${currentMonth}/${currentDay}`
                        );

                        const withdrawPromise = get(withdrawRef).then(
                          (withdrawSnapshot) => {
                            if (withdrawSnapshot.exists()) {
                              withdrawSnapshot.forEach((timeSnap) => {
                                const amount = timeSnap
                                  .child("AMOUNT")
                                  .val() as number;
                                //   console.log(amount, userPhone);
                                totalWithdrawAmount += amount;
                                //   console.log(totalDepositAmount);
                              });
                            }
                          }
                        );
                        return Promise.all([withdrawPromise]).then(() => {
                          withdrawTotal[appName] = totalWithdrawAmount;
                        });
                      });
                    });
                  });
                }
              });

              promises.push(promise1);
            }
          });

          await Promise.all(promises);

          const totalBid = Object.values(bidTotal).reduce(
            (acc, cur) => acc + cur,
            0
          );
          setTotalBid(totalBid);
          setBidTotal(bidTotal);
          setWinTotal(winTotal);
          setdepositTotal(depositTotal);
          setWithdrawTotal(withdrawTotal);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactionData();
  }, [currentMonth, currentYear]);

  console.log(bidTotal);
  console.log(winTotal);
  console.log(withdrawTotal);
  console.log(depositTotal);

  return (
    <div className="h-full w-full">
      {loading ? (
        <div className="text-white">Loading...</div>
      ) : (
        <div className="h-full w-full flex gap-4">
          <div className="h-full w-16 rounded-sm border bg-white flex items-center justify-center">
            <img src={"bid.png"} alt="" className="h-10 w-10" />
          </div>
          <div className="flex flex-col">
            <div className="font-bold text-white text-xl">Bid</div>
            <div className="font-semibold text-white">&#8377; {totalBid}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TotalTransaction;
