import { get, onValue, ref, remove } from "firebase/database";
import { GameData } from "../../components/GamesDetails/GamesDetails";
import { useEffect, useState, Fragment, useRef } from "react";
import { database } from "../../firebase";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AddWebsiteMarket from "./AddWebsiteMarket";
import EditWebsiteMarket from "./EditWebsiteMarket";
import { Dialog, Transition } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";

const formatResult = (open: string, mid: string, close: string): string => {
  return `${open}-${mid}-${close}`;
};

export type ClickPosition = {
  x: number;
  y: number;
};

const WebsiteMarket = () => {
  const [result, setResult] = useState<GameData[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [addGame, setAddGame] = useState(false);
  const [gamekey, setgameKey] = useState("");
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [open, setOpen] = useState("");
  const [close, setClose] = useState("");
  const [clickPosition, setClickPosition] = useState<ClickPosition | null>(
    null
  );
  const [editGame, setEditGame] = useState(false);
  const cancelButtonRef = useRef(null);
  const [openModal, setOpenModal] = useState(false);

  const currentDate = new Date();
  const year = currentDate.getFullYear().toString();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const day = currentDate.getDate().toString().padStart(2, "0");

  useEffect(() => {
    const resultRef2 = ref(database, "WEBSITE GAMES");

    const fetchGameData = async () => {
      try {
        const snapshot2 = await get(resultRef2);

        const combinedData: GameData[] = [];

        if (snapshot2.exists()) {
          snapshot2.forEach((gameSnapshot) => {
            const gameKey = gameSnapshot.key;
            const resultData = gameSnapshot
              .child(gameKey)
              .child(year)
              .child(month)
              .child(day)
              .val();
            const name = gameSnapshot.child("NAME").val();
            const app = gameSnapshot.child("APP").val();
            const color = gameSnapshot.child("COLOR").val();
            const open = gameSnapshot.child("OPEN").val();
            const close = gameSnapshot.child("CLOSE").val();

            const resultString = resultData
              ? formatResult(resultData.OPEN, resultData.MID, resultData.CLOSE)
              : "✦✦✦-✦✦-✦✦✦";

            combinedData.push({
              key: gameKey,
              NAME: name,
              RESULT: resultString,
              OPEN: open,
              CLOSE: close,
              APP: app,
              COLOR: color,
            });
          });
          setResult(combinedData);
        }
      } catch (error) {
        console.error("Error fetching game data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribeResults = onValue(resultRef2, () => {
      fetchGameData(); // Fetch game data whenever result data changes
    });

    return () => {
      unsubscribeResults();
    };
  }, [day, addGame, editGame, openModal]);

  const convertToTime = (timestamp: number) => {
    const date = new Date(timestamp).toLocaleString();
    const time = date.split(",")[1];
    return time;
  };

  const handleDelete = (gameKey: string) => {
    setOpenModal(true);
    setgameKey(gameKey);
  };

  const handleConfirmDelete = async () => {
    try {
      const deleteRef = ref(database, `WEBSITE GAMES/${gamekey}`);
      await remove(deleteRef);
      setOpenModal(false);
      toast.success("Market Deleted successfully!!!");
    } catch (err) {
      console.log(err);
      toast.error("Error in deleting market, try again later");
    }
  };

  const handleEdit = (
    name: string,
    key: string,
    color: string,
    open: string,
    close: string,
    event: React.MouseEvent
  ) => {
    setgameKey(key);
    setName(name);
    setColor(color);
    setOpen(open);
    setClose(close);
    setEditGame(!editGame);
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left + window.scrollX; // Adjust for horizontal scroll
    const y = event.clientY - rect.top + window.scrollY;
    setClickPosition({ x, y });
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-8 justify-end mb-4">
        <div
          onClick={() => setAddGame(!addGame)}
          className="cursor-pointer flex items-center gap-2 text-sm font-semibold bg-orange-500 text-white px-3 py-2 rounded"
        >
          <AddCircleIcon className="" />
          Add
        </div>
      </div>

      {addGame && (
        <div>
          <AddWebsiteMarket setAddGame={setAddGame} />
        </div>
      )}

      {editGame && (
        <EditWebsiteMarket
          gamekey={gamekey}
          color={color}
          name={name}
          open={open}
          close={close}
          setEditGame={setEditGame}
          clickPosition={clickPosition}
        />
      )}

      {isLoading ? (
        <div className="w-full h-[100vh] flex items-center justify-center">
          <CircularProgress color="secondary" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border rtl:text-right text-gray-500 outline-none border-none">
            <thead className="text-sm text-white uppercase bg-blue-500">
              <tr>
                <th scope="col" className="px-6 py-3">
                  MARKET NAME
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  OPEN
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  CLOSE
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  RESULT
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {result &&
                result.map((data, index) => (
                  <tr
                    key={index}
                    className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      {data.NAME}
                    </th>
                    <td className="px-6 py-4 text-center">
                      {convertToTime(data.OPEN)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {convertToTime(data.CLOSE)}
                    </td>
                    <td className="px-6 py-4 text-center">{data.RESULT}</td>
                    <td className="px-3 py-4 flex items-center gap-8 justify-center">
                      <PencilIcon
                        className="h-6 w-6 cursor-pointer"
                        onClick={(event) =>
                          handleEdit(
                            data.NAME,
                            data.key,
                            data.COLOR,
                            String(data.OPEN),
                            String(data.CLOSE),
                            event
                          )
                        }
                      />
                      <TrashIcon
                        className="h-6 w-6 cursor-pointer"
                        onClick={() => handleDelete(data.key)}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <Transition.Root show={openModal} as={Fragment}>
            <Dialog
              as="div"
              className="relative z-10"
              initialFocus={cancelButtonRef}
              onClose={setOpenModal}
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
                              Market Delete
                            </Dialog.Title>
                            <div className="mt-2">
                              <p className="text-sm text-gray-500">
                                Are you sure want to delete the market?
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                          type="button"
                          className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                          onClick={handleConfirmDelete}
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                          onClick={() => setOpenModal(false)}
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
      )}
    </div>
  );
};

export default WebsiteMarket;
