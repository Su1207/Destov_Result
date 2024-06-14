import { GridColDef, DataGrid, GridToolbar } from "@mui/x-data-grid";
import { GameData } from "./GamesDetails";
import "./gamesDetails.scss";
// import { ref, remove } from "firebase/database";
// import { database } from "../../firebase";
// import { toast } from "react-toastify";
import { useRef, Fragment, useState } from "react";
import OpenCloseOption from "../OpenCloseOption/OpenCloseOption";
// import EditGame from "../EditGames/EditGame";
// import OpenCloseOption from "../OpenCloseOption/OpenCloseOption";
// import Rewards from "../Rewards/Rewards";
import { Dialog, Transition } from "@headlessui/react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { ChromePicker, ColorResult } from "react-color";
import { useMediaQuery } from "@mui/material";
import { toast } from "react-toastify";
import { ref, set } from "firebase/database";
import { database } from "../../firebase";

type ColumnRow = GameData;

interface gameDataGridProps {
  gameData: ColumnRow[];
}

export type ClickPosition = {
  x: number;
  y: number;
};

const GamesDataGrid: React.FC<gameDataGridProps> = ({ gameData }) => {
  // const [editGame, setEditGame] = useState(false);
  const [gameId, setGameId] = useState("");
  const [gameName, setGameName] = useState("");
  const cancelButtonRef = useRef(null);
  const [backgroundColor, setBackgroundColor] = useState<string>("#070683");

  const isSmallScreen = useMediaQuery("(max-width:550px)");
  const pickerStyles = {
    default: {
      picker: {
        width: isSmallScreen ? "300px" : "300px",
        height: isSmallScreen ? "300px" : "300px",
      },
    },
  };

  const handleColorChange = (color: ColorResult) => {
    setBackgroundColor(color.hex);
  };
  const [openClose, setOpenClose] = useState(false);
  // const [rewards, setRewards] = useState(false);
  const [clickPosition, setClickPosition] = useState<ClickPosition | null>(
    null
  );

  const [gameKey, setGameKey] = useState("");
  const [open, setOpen] = useState(false);

  // const handleEdit = (gameid: string, event: React.MouseEvent) => {
  //   setEditGame(!editGame);
  //   setGameId(gameid);
  //   const rect = event.currentTarget.getBoundingClientRect();
  //   const x = event.clientX - rect.left + window.scrollX; // Adjust for horizontal scroll
  //   const y = event.clientY - rect.top + window.scrollY;
  //   setClickPosition({ x, y });
  // };

  const handleUpdate = (
    event: React.MouseEvent,
    gameid: string,
    gamename: string
  ) => {
    setGameId(gameid);
    setOpenClose(!openClose);
    setGameName(gamename);
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left + window.scrollX; // Adjust for horizontal scroll
    const y = event.clientY - rect.top + window.scrollY;
    setClickPosition({ x, y });
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Market",
      width: 200,
      // cellClassName: "market_name",
    },
    {
      field: "result",
      headerName: "Result",
      width: 160,
    },
    {
      field: "updateResult",
      headerName: "Update Result",
      width: 140,
      renderCell: (params) => (
        <div>
          <img
            src="./update.png"
            alt="update"
            className="update_img"
            onClick={(event) =>
              handleUpdate(event, params.row.id, params.row.name)
            }
          />
        </div>
      ),
    },
    {
      field: "app",
      headerName: "App",
      width: 400,
    },
    {
      field: "color",
      headerName: "Color",
      width: 120,
      renderCell: (params) => (
        <button
          onClick={() => handleClick(params.row.id)}
          className=" bg-blue-500 px-2.5 py-1.5 text-white rounded-sm hover:bg-blue-800 transition-all duration-300 ease-in-out shadow-lg text-sm "
        >
          Add Color
        </button>
      ),
    },
  ];

  const rows = gameData.map((game) => {
    return {
      id: game.key,
      name: game.NAME,
      result: game.RESULT,
      app: game.APP,
    };
  });

  const handleClick = (gameKey: string) => {
    setGameKey(gameKey);
    setOpen(!open);
  };

  const handleSubmit = async () => {
    try {
      if (gameKey) {
        const colorRef = ref(database, `RESULTS/${gameKey}/COLOR`);
        await set(colorRef, backgroundColor);
        toast.success("Color submitted successfully");
      }
    } catch (err) {
      console.log(err);
      toast.error("Error in sabmiting the color, try again later");
    }
    setOpen(false);
  };

  return (
    <div className="dataTable w-full">
      {openClose && (
        <OpenCloseOption
          gameId={gameId}
          gameName={gameName}
          setOpenClose={setOpenClose}
          clickPosition={clickPosition}
        />
      )}
      {/* {editGame && (
        <EditGame
          gameId={gameId}
          setEditGame={setEditGame}
          clickPosition={clickPosition}
        />
      )} */}
      {rows.length > 0 ? (
        <DataGrid
          className="dataGrid w-full overflow-x-auto"
          rows={rows}
          columns={columns}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          // checkboxSelection
          disableRowSelectionOnClick
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
        />
      ) : (
        <div className="no-data">
          <img src="/noData.gif" alt="" className="no-data-img" />
        </div>
      )}

      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
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
                        <PencilSquareIcon
                          className="h-6 w-6 text-red-600"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-base font-semibold leading-6 text-gray-900"
                        >
                          Market Background Color
                        </Dialog.Title>
                        <div className="mt-2 ml-8">
                          <ChromePicker
                            color={backgroundColor}
                            onChange={handleColorChange}
                            styles={pickerStyles}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                    >
                      Submit
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
};

export default GamesDataGrid;
