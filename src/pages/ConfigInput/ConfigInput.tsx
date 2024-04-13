import { useEffect, useState } from "react";
import { database } from "../../firebase";
import {
  get,
  getDatabase,
  onValue,
  push,
  ref,
  remove,
  set,
} from "firebase/database";
import { initializeApp } from "firebase/app";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { useAuth } from "../../components/Auth-context";
import RefreshIcon from "@mui/icons-material/Refresh";

const ConfigInput = () => {
  const [config, setConfig] = useState({
    name: "",
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
        await fetchData(data);
      } else {
        await updateData(data);
      }

      console.log("Data added successfully!");
      toast.success("Configuration added successfully!");
      setConfig({
        name: "",
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

  const fetchData = async (data: any) => {
    // const dbRef = ref(database, "FIREBASE CONFIGURATIONS");
    const dataRef = ref(database, "RESULTS");

    if (data) {
      const firebaseConfig1 = data;

      // Initialize Firebase
      const app1 = initializeApp(firebaseConfig1, `${data.name}`);
      const database1 = getDatabase(app1);

      const game1Ref = ref(database1, "GAMES");

      const gameSnapshot = await get(game1Ref);

      if (gameSnapshot.exists()) {
        // const promises: Promise<void>[] = [];
        // let gamesName: any = {};

        gameSnapshot.forEach((gameKey) => {
          const gameName = gameKey.val().NAME;

          push(dataRef, { NAME: gameName, APP: [data.name] });
          // promises.push(promise);
        });

        // await Promise.all(promises);
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

      const promises: Promise<void>[] = [];

      gameSnapshot.forEach((gameKey) => {
        const gameName = gameKey.val().NAME;
        let gameExist = false;

        resultSnapshot.forEach((marketKey) => {
          if (marketKey.val().NAME === gameName) {
            const appArray = marketKey.val().APP || [];

            if (!appArray.includes(configData.name)) {
              appArray.push(configData.name);

              const gameAppRef = ref(database, `RESULTS/${marketKey.key}/APP`);
              const promise1 = set(gameAppRef, appArray);
              promises.push(promise1);
            }

            gameExist = true;
          }
        });
        if (!gameExist) {
          push(resultRef, { NAME: gameName, APP: [configData.name] });
        }
      });

      await Promise.all(promises);
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

  const handleDelete = async (index: string, name: string) => {
    const permit = window.confirm("Are you sure want to delete the database");

    if (!permit) return;

    const dbRemoveref = ref(database, `FIREBASE CONFIGURATIONS/${index}`);
    const marketRef = ref(database, `RESULTS`);

    await remove(dbRemoveref);

    const snapshot = await get(marketRef);

    const promises: Promise<void>[] = [];

    snapshot.forEach((gameKey) => {
      if (gameKey.exists()) {
        const appArray = gameKey.val().APP || [];
        const updatedAppArray = appArray.filter(
          (dbName: string) => dbName !== name
        );

        if (updatedAppArray.length === 0) {
          const gameAppRef = ref(database, `RESULTS/${gameKey.key}`);
          const promise1 = remove(gameAppRef);
          promises.push(promise1);
        } else {
          // Update the app array in the database
          const gameAppRef = ref(database, `RESULTS/${gameKey.key}/APP`);
          const promise = set(gameAppRef, updatedAppArray);
          promises.push(promise);
        }
      }
    });
    await Promise.all(promises);

    toast.success("Database removed successfully");
    logout();
  };

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
                    NAME<span className=" text-[#F05387]">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={config.name}
                    onChange={handleChange}
                    required
                    className="mt-1 p-2 w-full rounded-sm border border-gray-300 shadow-sm outline-none focus:ring-0 focus:ring-offset-0 sm:text-sm"
                  />
                </div>
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
                    className="mt-1 p-2 w-full rounded-sm border border-gray-300 shadow-sm outline-none focus:ring-0 focus:ring-offset-0 sm:text-sm"
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
                    className="mt-1 p-2 w-full rounded-sm border border-gray-300 shadow-sm outline-none focus:ring-0 focus:ring-offset-0 sm:text-sm"
                    style={{ outline: "none" }}
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
                    className="mt-1 p-2 w-full rounded-sm border border-gray-300 shadow-sm outline-none focus:ring-0 focus:ring-offset-0 sm:text-sm"
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
                    className="mt-1 p-2 w-full rounded-sm border border-gray-300 shadow-sm outline-none focus:ring-0 focus:ring-offset-0 sm:text-sm"
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
                    className="mt-1 p-2 w-full rounded-sm border border-gray-300 shadow-sm outline-none focus:ring-0 focus:ring-offset-0 sm:text-sm"
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
                    className="mt-1 p-2 w-full rounded-sm border border-gray-300 shadow-sm outline-none focus:ring-0 focus:ring-offset-0 sm:text-sm"
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
                    className="mt-1 p-2 w-full rounded-sm border border-gray-300 shadow-sm outline-none focus:ring-0 focus:ring-offset-0 sm:text-sm"
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
                    className="mt-1 p-2 w-full rounded-sm border border-gray-300 shadow-sm outline-none focus:ring-0 focus:ring-offset-0 sm:text-sm"
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
                    className="mt-1 p-2 w-full rounded-sm border border-gray-300 shadow-sm outline-none focus:ring-0 focus:ring-offset-0 sm:text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-xs font-medium rounded-sm text-white bg-[#F05387] hover:bg-indigo-700 focus:outline-none"
              >
                Submit
              </button>
            </form>
          </div>

          {firebases ? (
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
                        <div className="font-semibold uppercase text-[1rem] text-[#6c757d] mb-2">
                          {data.name}
                        </div>
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
                        <div onClick={() => handleDelete(index, data.name)}>
                          <DeleteForeverIcon className="text-red-500 hover:scale-110 cursor-pointer transition-all duration-300 ease-in-out " />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div></div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConfigInput;
