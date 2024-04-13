import { useEffect, useState } from "react";
import { useBidDetailsContext } from "./BidDetailsContext";
import { database } from "../../firebase";
import { get, getDatabase, ref } from "firebase/database";
import { initializeApp } from "firebase/app";
import RelatedUserDetails from "./RelatedUserDetails";

export type UserDetailsType = {
  [appName: string]: SingleUserDetail[];
};

export type SingleUserDetail = {
  userName: string;
  phoneNumber: string;
  points: number;
};

export type ClickPosition = {
  x: number;
  y: number;
};

const BidDetails: React.FC<{ gameType: string | undefined }> = ({
  gameType,
}) => {
  const { combinebidData, open, value } = useBidDetailsContext();
  const [totalPoints, setTotalPoints] = useState(0);
  const [clickedNumber, setClickedNumber] = useState(false);
  const [clickPosition, setClickPosition] = useState<ClickPosition | null>(
    null
  );
  const [bidNumber, setBidNnumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [userBidData, setUserBidData] = useState<UserDetailsType>({});
  const [date, month, year] = [value?.date(), value?.month(), value?.year()];

  const newDate = date?.toString().padStart(2, "0");
  const newMonth =
    month !== undefined && month >= 0
      ? (month + 1)?.toString().padStart(2, "0")
      : "";

  useEffect(() => {
    let totalPoints = 0;
    combinebidData.map((data) => {
      totalPoints += data.marketTotalPoints;
    });
    setTotalPoints(totalPoints);
  }, [combinebidData]);

  // Organize data into rows
  const rows: any = Array.from(
    {
      length: Math.max(
        ...combinebidData.map((market) => Object.keys(market.numbers).length)
      ),
    },
    (_, index) => ({
      id: index + 1,
      ...combinebidData.reduce(
        (acc, market) => ({
          ...acc,
          [market.marketName]: Object.entries(market.numbers)[index]
            ? `${Object.entries(market.numbers)[index][0]} = ${
                Object.entries(market.numbers)[index][1]
              } ₹`
            : "", // Display "number = points ₹" only if both number and points exist
        }),
        {}
      ),
    })
  );

  const handleColumnClick = async (
    event: React.MouseEvent,
    marketName: string,
    appName: string[],
    row: any
  ) => {
    try {
      setLoading(true);
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left + window.scrollX; // Adjust for horizontal scroll
      const y = event.clientY - rect.top + window.scrollY;
      setBidNnumber(row.split(" = ")[0]);
      const dbRef = ref(database, "FIREBASE CONFIGURATIONS");
      const dbSnapshot = await get(dbRef);

      const promises: Promise<void>[] = [];
      const userData: UserDetailsType = {};

      appName.forEach((app) => {
        const appname = app.split(":")[0];
        const gameKey = app.split(":")[1];
        dbSnapshot.forEach((dbs) => {
          if (dbs.val().name === appname) {
            const firebaseConfig1 = dbs.val();

            const app1 = initializeApp(firebaseConfig1, `${appname}`);
            const database1 = getDatabase(app1);

            const userDetails = ref(
              database1,
              `TOTAL TRANSACTION/BIDS/${year}/${newMonth}/${newDate}/${gameKey}/${gameType}/${marketName}/${
                row.split(" = ")[0]
              }/USERS`
            );

            const promise1 = get(userDetails).then((userSnapshot) => {
              if (userSnapshot.exists()) {
                const singleUser: SingleUserDetail[] = [];

                userSnapshot.forEach((phoneKey) => {
                  let userName = "";
                  const phoneNumber = phoneKey.key;
                  const points = phoneKey.val();

                  const userRef = ref(database1, `USERS/${phoneNumber}`);

                  const promise2 = get(userRef).then((snapshot) => {
                    if (snapshot.exists()) {
                      userName = snapshot.val().NAME;
                      //   console.log(snapshot.val().NAME);
                    }
                    singleUser.push({
                      userName,
                      phoneNumber,
                      points,
                    });
                  });
                  promises.push(promise2);
                });

                userData[appname] = singleUser;
              }
            });
            promises.push(promise1);
          }
        });
      });
      await Promise.all(promises);
      setClickedNumber(!clickedNumber);

      setTimeout(() => {
        setUserBidData(userData);
        setLoading(false);
      }, 1000);
      setClickPosition({ x, y });
    } catch (er) {
      console.log(er);
    }
  };

  console.log(userBidData);

  return (
    <div>
      {clickedNumber && (
        <RelatedUserDetails
          loading={loading}
          userBidData={userBidData}
          setClickedNumber={setClickedNumber}
          bidNumber={bidNumber}
          clickPosition={clickPosition}
        />
      )}
      <div className={`${open ? "lg:w-[78%]" : "lg:w-[95%]"} `}>
        {combinebidData && combinebidData.length > 0 ? (
          <>
            <div className=" flex justify-end mb-2">
              <div className="border rounded-sm p-2 bg-gray-200 text-sm font-semibold">
                Total = {totalPoints} ₹
              </div>
            </div>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg mb-8">
              <table className="w-full text-sm text-left border rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-2 py-3 text-center">
                      S.No
                    </th>
                    {combinebidData.map((market) => (
                      <th
                        key={market.marketName}
                        scope="col"
                        className="px-4 py-3 text-center min-w-32"
                      >
                        {market.marketName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row: any, rowIndex: number) => (
                    <tr
                      key={rowIndex}
                      className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                    >
                      <td className="px-4 py-4 text-center ">{row.id}</td>
                      {/* Iterate over the arrangedMarketData to generate table cells */}
                      {combinebidData.map((market) => (
                        <td
                          key={`${rowIndex}-${market.marketName}`}
                          className="px-4 py-4 text-center cursor-pointer min-w-[165px]"
                          onClick={(event) =>
                            handleColumnClick(
                              event,
                              market.marketName,
                              market.appName,
                              row[market.marketName]
                            )
                          }
                        >
                          {/* Display the value corresponding to the current market name and number */}
                          {row[market.marketName]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div>No Data</div>
        )}
      </div>
    </div>
  );
};

export default BidDetails;
