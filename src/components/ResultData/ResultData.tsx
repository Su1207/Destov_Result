// import { get, getDatabase, ref } from "firebase/database";
// import { useEffect, useState } from "react";
// import { database } from "../../firebase";
// import { initializeApp } from "firebase/app";

// export interface WinDetailsType {
//   date: string;
//   phoneNumber: string;
//   userName: string;
//   gameName: string;
//   openClose: string;
//   number: string;
//   previousPoints: number;
//   newPoints: number;
//   bidAmount: string;
//   winPoints: number;
// }

// interface WinDataType {
//   [appName: string]: WinDetailsType[];
// }

// const ResultData = () => {
//   const [winDetails, setWinDetails] = useState<WinDetailsType[] | null>(null);

//   const currentDate = new Date();
//   const year = currentDate.getFullYear().toString();
//   const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
//   const day = currentDate.getDate().toString().padStart(2, "0");

//   useEffect(() => {
//     const fetchWinData = async () => {
//       try {
//         const dbRef = ref(database, "FIREBASE CONFIGURATIONS");
//         const dbSnapshot = await get(dbRef);

//         if (dbSnapshot.exists()) {
//           dbSnapshot.forEach((dbs) => {
//             if (!dbs.val().disable) {
//               const firebaseConfig1 = dbs.val();

//               const appName = dbs.val().name;

//               const app1 = initializeApp(firebaseConfig1, `${appName}`);
//               const database1 = getDatabase(app1);

//               const winDataRef = ref(database1, `TOTAL TRANSACTION/WINS/`);
//             }
//           });
//         }
//       } catch (err) {
//         console.log(err);
//       }
//     };
//     fetchWinData();
//   }, []);

//   return (
//     <div>
//       <div>Result Data</div>
//     </div>
//   );
// };

// export default ResultData;
