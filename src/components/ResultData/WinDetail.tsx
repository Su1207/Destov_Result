import React, { useEffect, useState } from "react";
import { database } from "../../firebase";
import { get, getDatabase, ref } from "firebase/database";
import { initializeApp } from "firebase/app";
import { CircularProgress } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Link } from "react-router-dom";

export interface WinDetailsType {
  date: string;
  phoneNumber: string;
  userName: string;
  gameName: string;
  openClose: string;
  number: string;
  previousPoints: number;
  newPoints: number;
  bidAmount: string;
  winPoints: number;
}

const WinDetail: React.FC<{ gameData: string }> = ({ gameData }) => {
  const [winDetails, setWinDetails] = useState<WinDetailsType[]>([]);

  const [appName, gameName, gameKey] = gameData.split(":");

  const [loading, setLoading] = useState(false);

  const selectedWinDate = new Date();
  const currentYear = selectedWinDate.getFullYear();
  const currentMonth = (selectedWinDate.getMonth() + 1)
    .toString()
    .padStart(2, "0");
  const currentDay = selectedWinDate.getDate().toString().padStart(2, "0");

  useEffect(() => {
    const fetchWinDetails = async () => {
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
                `TOTAL TRANSACTION/WIN/DATE WISE/${currentYear}/${currentMonth}/${currentDay}/${gameKey}`
              );

              const winDetails: WinDetailsType[] = [];

              const promise1 = get(winDetailRef).then((winDetailSnapshot) => {
                if (winDetailSnapshot.exists()) {
                  winDetailSnapshot.forEach((timestamp) => {
                    winDetails.push({
                      date: timestamp.val().DATE,
                      phoneNumber: timestamp.val().PHONE,
                      userName: timestamp.val().NAME,
                      gameName: timestamp.val().TYPE,
                      openClose: timestamp.val().OPEN_CLOSE,
                      number: timestamp.val().NUMBER,
                      previousPoints: timestamp.val().PREVIOUS_POINTS,
                      newPoints: timestamp.val().NEW_POINTS,
                      bidAmount: timestamp.val().POINTS,
                      winPoints: timestamp.val().WIN_POINTS,
                    });
                  });

                  winDetails.sort((a, b) => {
                    const dateA = new Date(a.date.replace("|", "")).getTime();
                    const dateB = new Date(b.date.replace("|", "")).getTime();
                    if (dateA === dateB) {
                      return b.previousPoints - a.previousPoints;
                    }

                    return dateB - dateA;
                  });

                  setWinDetails(winDetails);
                }
              });
              promises.push(promise1);
            }
          });
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWinDetails();
  }, [gameKey, appName]);

  console.log(winDetails);

  return (
    <div className="w-full">
      {loading ? (
        <div className="w-full h-[100vh] flex items-center justify-center">
          <CircularProgress color="secondary" />
        </div>
      ) : (
        <div className="overflow-x-auto sm:rounded-lg mb-8">
          <div className="flex items-center mb-4">
            <Link to={"/winData"} className="hover:text-orange-500">
              <ChevronLeftIcon sx={{ fontSize: "25px" }} />
            </Link>{" "}
            <div className=" text-2xl font-bold">{gameName}</div>
          </div>
          <table className="w-full text-sm text-center border rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-sm text-gray-100 uppercase bg-orange-500 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-3 sm:px-4 py-3 text-center">
                  USERNAME
                </th>
                <th scope="col" className="px-3 sm:px-4 py-3 text-center">
                  GAME NAME
                </th>
                <th scope="col" className="px-3 sm:px-4 py-3 text-center">
                  NUMBER
                </th>
                <th scope="col" className="px-3 sm:px-4 py-3 text-center">
                  BID AMOUNT
                </th>
                <th scope="col" className="px-3 sm:px-4 py-3 text-center">
                  PREVIOUS POINTS
                </th>
                <th scope="col" className="px-3 sm:px-4 py-3 text-center">
                  WIN POINTS
                </th>
                <th scope="col" className="px-3 sm:px-4 py-3 text-center">
                  NEW POINTS
                </th>
                <th scope="col" className="px-3 sm:px-4 py-3 text-center">
                  DATE
                </th>
              </tr>
            </thead>
            <tbody>
              {winDetails.length > 0 &&
                winDetails.map((data, index) => (
                  <tr
                    key={index}
                    className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b text-center dark:border-gray-700"
                  >
                    <th
                      scope="row"
                      className="px-3 cursor-pointer sm:px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      <div className="flex flex-col items-start">
                        <div className="capitalize">{data.userName}</div>
                        <div>{data.phoneNumber}</div>
                      </div>
                    </th>
                    <td className="px-3 sm:px-6 cursor-pointer py-4">
                      {data.gameName} ({data.openClose})
                    </td>
                    <td className="px-3 sm:px-6 cursor-pointer py-4">
                      {data.number}
                    </td>
                    <td className="px-3 sm:px-6 cursor-pointer py-4">
                      {data.bidAmount}
                    </td>
                    <td className="px-3 sm:px-6 cursor-pointer py-4">
                      {data.previousPoints}
                    </td>
                    <td className="px-3 sm:px-6 cursor-pointer py-4">
                      {data.winPoints}
                    </td>
                    <td className="px-3 sm:px-6 cursor-pointer py-4">
                      {data.newPoints}
                    </td>
                    <td className="px-3 sm:px-6 cursor-pointer py-4 ">
                      <div className="flex flex-col min-w-[85px]">
                        <div>{data.date.split(" | ")[0]}</div>
                        <div>{data.date.split(" | ")[1]}</div>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WinDetail;
