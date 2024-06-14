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
import { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import BgColor from "../../components/BgColor/BgColor";

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
    disable: false,
  });

  const [firebases, setFirebases] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [itemIndex, setItemIndex] = useState("");
  const cancelButtonRef = useRef(null);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const [open, setOpen] = useState(false);

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
        disable: false,
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

      const app1 = initializeApp(configData, `${configData.name}`);
      const database1 = getDatabase(app1);

      const gameRef = ref(database1, "GAMES");

      const gameSnapshot = await get(gameRef);

      const promises: Promise<void>[] = [];

      gameSnapshot.forEach((gameKey) => {
        const gameName = gameKey.val().NAME;
        let gameExist = false;

        resultSnapshot.forEach((marketKey) => {
          console.log(marketKey.val().NAME.trim(), gameName.trim());

          if (
            marketKey.val().NAME.trim().toLowerCase() ===
            gameName.trim().toLowerCase()
          ) {
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const { logout } = useAuth();

  const handleUpdate = async (index: string) => {
    const dbref = ref(database, `FIREBASE CONFIGURATIONS/${index}`);

    const dataSnapshot = await get(dbref);

    if (!dataSnapshot.val().disable) {
      await updateData(dataSnapshot.val());
      toast.success("Data updated");
    } else {
      toast.error("Database disabled");
    }
  };

  const handleDisable = async (
    index: string,
    disable: boolean,
    name: string
  ) => {
    const dbref = ref(database, `FIREBASE CONFIGURATIONS/${index}/disable`);
    await set(dbref, !disable);

    const marketRef = ref(database, `RESULTS`);

    const snapshot = await get(marketRef);

    if (!disable) {
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
      toast.success("Database disabled successfully!!");
    } else {
      await handleUpdate(index);
      toast.success("Database enabled successfully!!");
    }
  };

  const handleDisableClick = (index: string) => {
    setTitle("Disable Account");
    setMessage("Are you sure want to disable the database?");
    setConfirmText("Disable");
    setItemIndex(index);
    setOpen(true);
  };

  const handleDeleteClick = (index: string) => {
    setTitle("Delete Account");
    setMessage("Are you sure want to delete the database?");
    setConfirmText("Delete");
    setItemIndex(index);
    setOpen(true);
  };

  const handleDelete = async (index: string, name: string) => {
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

  const downloadConfig = (database: any) => {
    if (!database) return;

    const configString = `
      Name: ${database.name}
      API Key: ${database.apiKey}
      Auth Domain: ${database.authDomain}
      Database URL: ${database.databaseURL}
      Project ID: ${database.projectId}
      Storage Bucket: ${database.storageBucket}
      Messaging Sender ID: ${database.messagingSenderId}
      App ID: ${database.appId}
      Measurement ID: ${database.measurementId}
      Server Key: ${database.authorizationKey}
    `;

    const blob = new Blob([configString], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${database.name}.txt`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full">
      {loading ? (
        <div className="w-full h-[100vh] flex items-center justify-center">
          <CircularProgress color="secondary" />
        </div>
      ) : (
        <div className="w-[89vw] xs:w-[100%] overflow-auto lg:w-[95%]">
          <div className="bg-white border p-4 sm:p-8 shadow-lg rounded-sm mb-8">
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
                className="w-full mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-xs font-medium rounded-sm text-white bg-purple-500 hover:bg-indigo-800 focus:outline-none transition-all duration-300 ease-in-out"
              >
                Submit
              </button>
            </form>
          </div>

          <div className="flex bg-white justify-center items-center border p-4 sm:p-8 shadow-lg rounded-sm mb-8">
            <BgColor />
          </div>

          {firebases ? (
            <div className="bg-white border p-4 sm:p-8 shadow-lg rounded-sm">
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
                          <li className="text-sm  font-medium text-gray-700">
                            Server Key -{" "}
                            <span className="text-xs text-gray-500">
                              {data.authorizationKey}
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
                      <div className="flex mt-6 justify-between items-center">
                        <button
                          onClick={() => downloadConfig(data)}
                          type="button"
                          className="border text-xs sm:text-sm px-3 py-1 rounded-sm shadow-md bg-blue-600 text-white transition-all duration-300 ease-in-out hover:animate-bounce"
                        >
                          Download
                        </button>
                        <div className=" flex items-center gap-5 sm:gap-3 justify-center sm:justify-end">
                          <div onClick={() => handleUpdate(index)}>
                            <RefreshIcon className="text-green-500 hover:scale-110 cursor-pointer transition-all duration-300 ease-in-out " />
                          </div>
                          {data.disable ? (
                            <button
                              onClick={() =>
                                handleDisable(index, data.disable, data.name)
                              }
                              className="border text-xs sm:text-sm px-2 py-1 rounded-sm bg-green-600 text-white hover:scale-110 transition-all duration-300 ease-in-out"
                            >
                              Enable
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDisableClick(index)}
                              className="border text-xs sm:text-sm px-2 py-1 rounded-sm bg-red-500 text-white hover:scale-110 transition-all duration-300 ease-in-out"
                            >
                              Disable
                            </button>
                          )}

                          <div onClick={() => handleDeleteClick(index)}>
                            <DeleteForeverIcon className="text-red-500 hover:scale-110 cursor-pointer transition-all duration-300 ease-in-out " />
                          </div>
                        </div>
                      </div>
                      <Transition.Root show={open} as={Fragment}>
                        <Dialog
                          as="div"
                          className="relative z-10"
                          initialFocus={cancelButtonRef}
                          onClose={setOpen}
                        >
                          <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                          </Transition.Child>

                          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                              <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                              >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <ExclamationTriangleIcon
                                          className="h-6 w-6 text-red-600"
                                          aria-hidden="true"
                                        />
                                      </div>
                                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                        <Dialog.Title
                                          as="h3"
                                          className="text-base font-semibold leading-6 text-gray-900"
                                        >
                                          {title}
                                        </Dialog.Title>
                                        <div className="mt-2">
                                          <p className="text-sm text-gray-500">
                                            {message}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                    <button
                                      type="button"
                                      className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                      onClick={() =>
                                        confirmText === "Disable"
                                          ? handleDisable(
                                              itemIndex,
                                              firebases[itemIndex].disable,
                                              firebases[itemIndex].name
                                            )
                                          : handleDelete(
                                              itemIndex,
                                              firebases[itemIndex].name
                                            )
                                      }
                                    >
                                      {confirmText}
                                    </button>
                                    <button
                                      type="button"
                                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                      onClick={() => setOpen(false)}
                                      ref={cancelButtonRef}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </Dialog.Panel>
                              </Transition.Child>
                            </div>
                          </div>
                        </Dialog>
                      </Transition.Root>
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
