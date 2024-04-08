import { useEffect, useState } from "react";
import { database } from "../../firebase";
import {
  get,
  getDatabase,
  onValue,
  push,
  ref,
  remove,
} from "firebase/database";
import { initializeApp } from "firebase/app";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { useAuth } from "../../components/Auth-context";
import RefreshIcon from "@mui/icons-material/Refresh";

const ConfigInput = () => {
  const [config, setConfig] = useState({
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: "",
    authorizationKey: "",
  });

  const [firebases, setFirebases] = useState<any>();
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      const data = { ...config };
      console.log(data);
      const dbRef = ref(database, "FIREBASE CONFIGURATIONS");

      await push(dbRef, data);

      const snapshot = await get(dbRef);

      if (snapshot.size === 1) {
        fetchData();
      } else {
        updateData(data);
      }

      console.log("Data added successfully!");
      toast.success("Configuration added successfully!");
      setConfig({
        apiKey: "",
        authDomain: "",
        databaseURL: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: "",
        measurementId: "",
        authorizationKey: "",
      });
    } catch (error) {
      console.error("Error adding data:", error);
      toast.error("Error adding configuration");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    const dbRef = ref(database, "FIREBASE CONFIGURATIONS");
    const dataRef = ref(database, "RESULTS");

    const [dbSnapshot, dataSnapshot] = await Promise.all([
      get(dbRef),
      get(dataRef),
    ]);

    if (!dataSnapshot.exists() && dbSnapshot.exists()) {
      const dbIds = Object.keys(dbSnapshot.val());
      const db = dbIds[0];
      const newDataRef = ref(database, `FIREBASE CONFIGURATIONS/${db}`);

      const dbsnapshot = await get(newDataRef);

      if (dbsnapshot.exists()) {
        const firebaseConfig1 = dbsnapshot.val();

        // Initialize Firebase
        const app1 = initializeApp(firebaseConfig1, `${dbSnapshot.size}`);
        const database1 = getDatabase(app1);

        const game1Ref = ref(database1, "GAMES");

        const gameSnapshot = await get(game1Ref);

        if (gameSnapshot.exists()) {
          // const promises: Promise<void>[] = [];
          // let gamesName: any = {};

          gameSnapshot.forEach((gameKey) => {
            const gameName = gameKey.val().NAME;

            push(dataRef, { NAME: gameName });
            // promises.push(promise);
          });

          // await Promise.all(promises);
        }
      }
    }
  };

  const updateData = async (configData: any) => {
    try {
      setLoading(true);
      const resultRef = ref(database, "RESULTS");

      const resultSnapshot = await get(resultRef);

      const app1 = initializeApp(configData, `${configData.apiKey}`);
      const database1 = getDatabase(app1);

      const gameRef = ref(database1, "GAMES");

      const gameSnapshot = await get(gameRef);

      gameSnapshot.forEach((gameKey) => {
        const gameName = gameKey.val().NAME;
        let gameExist = false;

        resultSnapshot.forEach((marketKey) => {
          if (marketKey.val().NAME === gameName) {
            gameExist = true;
          }
        });
        if (!gameExist) {
          push(resultRef, { NAME: gameName });
        }
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const dbRef = ref(database, "FIREBASE CONFIGURATIONS");

      const subscribe = onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
          setFirebases(snapshot.val());
        }
      });

      return () => subscribe();
    } catch (err) {
      console.log(err);
    }
  }, []);

  const { logout } = useAuth();

  const handleUpdate = async (index: string) => {
    const dbref = ref(database, `FIREBASE CONFIGURATIONS/${index}`);

    const dataSnapshot = await get(dbref);

    await updateData(dataSnapshot.val());
    toast.success("Data updated");
  };

  const handleDelete = async (index: string) => {
    const permit = window.confirm("Are you sure want to delete the database");

    if (!permit) return;

    const dbRemoveref = ref(database, `FIREBASE CONFIGURATIONS/${index}`);

    await remove(dbRemoveref);

    toast.success("Database removed successfully");
    logout();
  };

  // useEffect(() => {
  //   const fetchWinData = async () => {
  //     try {
  //       if (addedNewConfig) {
  //         const dbRef = ref(database, "FIREBASE CONFIGURATIONS");
  //         const snapshot = await get(dbRef);
  //         const newDataRef = ref(
  //           database,
  //           `FIREBASE CONFIGURATIONS/FIREBASE${snapshot.size}`
  //         );
  //         const winSnapshot = await get(newDataRef);

  //         if (winSnapshot.exists()) {
  //           const firebaseConfig1 = {
  //             apiKey: winSnapshot.val().apiKey,
  //             authDomain: winSnapshot.val().authDomain,
  //             databaseURL: winSnapshot.val().databaseURL,
  //             projectId: winSnapshot.val().projectId,
  //             storageBucket: winSnapshot.val().storageBucket,
  //             messagingSenderId: winSnapshot.val().messagingSenderId,
  //             appId: winSnapshot.val().appId,
  //             measurementId: winSnapshot.val().measurementId,
  //           };

  //           // Initialize Firebase
  //           const app1 = initializeApp(firebaseConfig1, `${snapshot.size}`);
  //           const database1 = getDatabase(app1);

  //           const resultRef1 = ref(database1, "GAME CHART");
  //           const game1Ref = ref(database1, "GAMES");

  //           const [winDataSnapshot, marketSnapshot] = await Promise.all([
  //             get(resultRef1),
  //             get(game1Ref),
  //           ]);

  //           if (winDataSnapshot.exists()) {
  //             const promises: Promise<void>[] = [];

  //             marketSnapshot.forEach((marketsnapshot) => {
  //               const marketKey = marketsnapshot.key;
  //               const marketName = marketsnapshot.val().NAME;
  //               let gameResultData: any = {};

  //               winDataSnapshot.forEach((gamesnaphsot) => {
  //                 if (marketKey === gamesnaphsot.key) {
  //                   const dateStringResult: any = {};
  //                   gamesnaphsot.forEach((timeSnap) => {
  //                     const timestamp = timeSnap.key;
  //                     const dateString = convertTime(timestamp);
  //                     const open = timeSnap.val().OPEN;
  //                     const close = timeSnap.val().CLOSE;
  //                     const mid = timeSnap.val().MID;
  //                     const result = `${open}-${mid}-${close}`;

  //                     const gameName = winSnapshot.val().firebaseName;

  //                     dateStringResult[dateString] = { [gameName]: result };
  //                   });
  //                   gameResultData = dateStringResult;
  //                 }
  //               });

  //               const newdbRef = ref(database, `COMBINE RESULTS/${marketName}`);

  //               const promise1 = get(newdbRef).then(async (newSnapshot) => {
  //                 if (!newSnapshot.exists()) {
  //                   const promise2 = set(newdbRef, gameResultData);
  //                   promises.push(promise2);
  //                 } else {
  //                   const existingData = newSnapshot.val(); // Get existing data

  //                   const newData: any = {};

  //                   // Merge existing data with new data based on date keys
  //                   Object.keys(existingData).forEach(async (dateKey) => {
  //                     if (gameResultData[dateKey]) {
  //                       // If date key exists in both existing data and new data, combine results
  //                       newData[dateKey] = {
  //                         ...existingData[dateKey],
  //                         ...gameResultData[dateKey],
  //                       };
  //                     } else {
  //                       // If date key exists only in existing data, keep it as is
  //                       newData[dateKey] = existingData[dateKey];
  //                     }
  //                   });

  //                   // Add new dates from gameResultData that don't exist in existing data
  //                   Object.keys(gameResultData).forEach(async (dateKey) => {
  //                     if (!existingData[dateKey]) {
  //                       newData[dateKey] = gameResultData[dateKey];
  //                     }
  //                   });

  //                   const promise2 = set(newdbRef, newData); // Set the merged data to the database
  //                   promises.push(promise2);
  //                 }

  //                 promises.push(promise1);
  //               });
  //             });

  //             await Promise.all(promises);
  //           }
  //         }
  //         console.log("Data uploaded successfully");
  //         setAddedNewConfig(false);
  //       }
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };
  //   fetchWinData();
  // }, [addedNewConfig]);

  console.log(firebases);

  return (
    <div className="w-full flex items-center justify-center">
      {loading ? (
        <div className="w-full h-[100vh] flex items-center justify-center">
          <CircularProgress color="secondary" />
        </div>
      ) : (
        <div className="w-[89vw] xs:w-[100%]">
          <div className=" border p-4 sm:p-8 shadow-lg rounded-sm mb-8">
            <div className=" font-bold text-[1.5rem] text-[#6c757d] mb-4">
              Firebase Configuration
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="">
                  <label className="block text-xs  font-medium text-gray-500">
                    API KEY<span className=" text-[#F05387]">*</span>
                  </label>
                  <input
                    type="text"
                    name="apiKey"
                    value={config.apiKey}
                    onChange={handleChange}
                    required
                    className="mt-1 p-2 w-full rounded-sm border border-gray-300 shadow-sm focus:outline-none outline-none focus:ring-offset-0 sm:text-sm"
                  />
                </div>
                <div className="">
                  <label className="block text-xs  font-medium text-gray-500">
                    AUTH DOMAIN<span className=" text-[#F05387]">*</span>
                  </label>
                  <input
                    type="text"
                    name="authDomain"
                    value={config.authDomain}
                    onChange={handleChange}
                    required
                    className="mt-1 p-2 w-full rounded-sm border border-gray-300 shadow-sm focus:outline-none sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs  font-medium text-gray-500">
                    DATABASE URL<span className=" text-[#F05387]">*</span>
                  </label>
                  <input
                    type="text"
                    name="databaseURL"
                    value={config.databaseURL}
                    onChange={handleChange}
                    required
                    className="mt-1 p-2 w-full rounded-sm border border-gray-300 shadow-sm focus:outline-none sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs  font-medium text-gray-500">
                    PROJECT ID<span className=" text-[#F05387]">*</span>
                  </label>
                  <input
                    type="text"
                    name="projectId"
                    value={config.projectId}
                    onChange={handleChange}
                    required
                    className="mt-1 p-2 w-full rounded-sm border border-gray-300 shadow-sm focus:outline-none sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs  font-medium text-gray-500">
                    STORAGE BUCKET<span className=" text-[#F05387]">*</span>
                  </label>
                  <input
                    type="text"
                    name="storageBucket"
                    value={config.storageBucket}
                    onChange={handleChange}
                    required
                    className="mt-1 p-2 w-full rounded-sm border border-gray-300 shadow-sm focus:outline-none sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs  font-medium text-gray-500">
                    MESSAGING SENDER ID
                    <span className=" text-[#F05387]">*</span>
                  </label>
                  <input
                    type="text"
                    name="messagingSenderId"
                    value={config.messagingSenderId}
                    onChange={handleChange}
                    required
                    className="mt-1 p-2 w-full rounded-sm border border-gray-300 shadow-sm focus:outline-none sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs  font-medium text-gray-500">
                    APP ID<span className=" text-[#F05387]">*</span>
                  </label>
                  <input
                    type="text"
                    name="appId"
                    value={config.appId}
                    onChange={handleChange}
                    required
                    className="mt-1 p-2 w-full rounded-sm border border-gray-300 shadow-sm focus:outline-none sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs  font-medium text-gray-500">
                    MEASUREMENT ID
                  </label>
                  <input
                    type="text"
                    name="measurementId"
                    value={config.measurementId}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full rounded-sm border border-gray-300 shadow-sm focus:outline-none sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs  font-medium text-gray-500">
                    SERVER KEY<span className=" text-[#F05387]">*</span>
                  </label>
                  <input
                    type="text"
                    name="authorizationKey"
                    value={config.authorizationKey}
                    onChange={handleChange}
                    required
                    className="mt-1 p-2 w-full rounded-sm border border-gray-300 shadow-sm focus:outline-none sm:text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-xs font-medium rounded-sm text-white bg-[#F05387] hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Submit
              </button>
            </form>
          </div>

          <div className=" border p-4 sm:p-8 shadow-lg rounded-sm">
            <div className=" font-bold text-[1.5rem] text-[#6c757d] mb-4">
              Firebase Databases
            </div>
            {firebases &&
              Object.entries(firebases).map(([index, data]: [any, any]) => {
                return (
                  <div
                    key={index}
                    className="border p-4 sm:p-8 rounded-md mb-4"
                  >
                    <div>
                      <ul className=" flex flex-col overflow-auto gap-1">
                        <li className="text-xs xs:text-sm font-medium text-gray-700">
                          API Key -{" "}
                          <span className="text-[10px] xs:text-xs text-gray-500">
                            {data.apiKey}
                          </span>
                        </li>
                        <li className="text-sm  font-medium text-gray-700">
                          Auth Domain -{" "}
                          <span className="text-xs text-gray-500">
                            {data.authDomain}
                          </span>
                        </li>
                        <li className="text-sm  font-medium text-gray-700">
                          Database URL -{" "}
                          <span className="text-xs text-gray-500">
                            {data.databaseURL}
                          </span>
                        </li>
                        <li className="text-sm  font-medium text-gray-700">
                          Project ID -{" "}
                          <span className="text-xs text-gray-500">
                            {data.projectId}
                          </span>
                        </li>
                        <li className="text-sm  font-medium text-gray-700">
                          Storage Bucket -{" "}
                          <span className="text-xs text-gray-500">
                            {data.storageBucket}
                          </span>
                        </li>
                        <li className="text-sm  font-medium text-gray-700">
                          Messaging Sender ID -{" "}
                          <span className="text-xs text-gray-500">
                            {data.messagingSenderId}
                          </span>
                        </li>
                        <li className="text-sm  font-medium text-gray-700">
                          APP ID -{" "}
                          <span className="text-xs text-gray-500">
                            {data.appId}
                          </span>
                        </li>
                        <li className="text-sm  font-medium text-gray-700">
                          Measurement ID -{" "}
                          <span className="text-xs text-gray-500">
                            {data.measurementId}
                          </span>
                        </li>
                        {/* <li className="text-sm  font-medium text-gray-700">
                          Server Key -{" "}
                          <span className=" text-gray-500">
                            {data.authorizationKey}
                          </span>
                        </li> */}
                      </ul>{" "}
                    </div>
                    <div className=" flex items-center gap-3 justify-end">
                      <div onClick={() => handleUpdate(index)}>
                        <RefreshIcon className="text-green-500 hover:scale-110 cursor-pointer transition-all duration-300 ease-in-out " />
                      </div>
                      <div onClick={() => handleDelete(index)}>
                        <DeleteForeverIcon className="text-red-500 hover:scale-110 cursor-pointer transition-all duration-300 ease-in-out " />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigInput;
