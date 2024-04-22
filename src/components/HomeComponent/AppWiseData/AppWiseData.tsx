import { onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { database } from "../../../firebase";
import { useBidDetailsContext } from "../../BidData/BidDetailsContext";

const AppWiseData = () => {
  const [dbNames, setDbNames] = useState<string[]>([]);

  const { depositTotal, withdrawTotal, winTotal, bidTotal } =
    useBidDetailsContext();

  useEffect(() => {
    try {
      const dbRef = ref(database, "FIREBASE CONFIGURATIONS");

      const unsub = onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
          const dbNames: string[] = [];
          snapshot.forEach((dbs) => {
            if (dbs.exists() && !dbs.val().disable) {
              dbNames.push(dbs.val().name);
            }
          });
          setDbNames(dbNames);
        }
      });

      return () => unsub();
    } catch (err) {
      console.log(err);
    }
  }, []);

  return (
    <div>
      {dbNames.length > 0 &&
        dbNames.map((db) => (
          <div key={db} className="mb-4 mt-8">
            <div className="text-2xl font-extrabold text-gray-600 mb-2 uppercase">
              {db}
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div
                className={`p-4 border min-h-24 shadow-md rounded-md ${
                  bidTotal[db] - winTotal[db] >= 0
                    ? "bg-green-600"
                    : "bg-red-600"
                }`}
              >
                <div className="h-full w-full flex gap-4">
                  <div className="h-full w-16 rounded-sm border bg-white flex items-center justify-center">
                    <img
                      src={
                        bidTotal[db] - winTotal[db] >= 0
                          ? "profit.png"
                          : "lost.png"
                      }
                      alt=""
                      className="h-10 w-10"
                    />
                  </div>
                  <div className="flex flex-col ">
                    <div className="font-bold text-white text-xl">
                      Profit/Loss
                    </div>
                    <div className="font-semibold text-white">
                      &#8377; {Math.abs(bidTotal[db] - winTotal[db])}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 border min-h-24 bg-green-600 shadow-md rounded-md">
                <div className="h-full w-full flex gap-4">
                  <div className="h-full w-16 rounded-sm border bg-white flex items-center justify-center">
                    <img src={"bid.png"} alt="" className="h-10 w-10" />
                  </div>
                  <div className="flex flex-col ">
                    <div className="font-bold text-white text-xl">Bid</div>
                    <div className="font-semibold text-white">
                      &#8377; {bidTotal[db]}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 border min-h-24 bg-red-600 shadow-md  rounded-md">
                <div className="h-full w-full flex gap-4">
                  <div className="h-full w-16 rounded-sm border bg-white flex items-center justify-center">
                    <img src={"win.png"} alt="" className="h-10 w-10" />
                  </div>
                  <div className="flex flex-col ">
                    <div className="font-bold text-white text-xl">Win</div>
                    <div className="font-semibold text-white">
                      &#8377; {winTotal[db]}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 border min-h-24 bg-green-600 shadow-md  rounded-md">
                <div className="h-full w-full flex gap-4">
                  <div className="h-full w-16 rounded-sm border bg-white flex items-center justify-center">
                    <img src={"deposit.png"} alt="" className="h-10 w-10" />
                  </div>
                  <div className="flex flex-col ">
                    <div className="font-bold text-white text-xl">Deposit</div>
                    <div className="font-semibold text-white">
                      &#8377; {depositTotal[db]}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 border min-h-24 bg-red-600 shadow-md  rounded-md">
                <div className="h-full w-full flex gap-4">
                  <div className="h-full w-16 rounded-sm border bg-white flex items-center justify-center">
                    <img src={"withdraw.png"} alt="" className="h-10 w-10" />
                  </div>
                  <div className="flex flex-col ">
                    <div className="font-bold text-white text-xl">Withdraw</div>
                    <div className="font-semibold text-white">
                      &#8377; {withdrawTotal[db]}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      <div></div>
    </div>
  );
};

export default AppWiseData;
