import { GridColDef, DataGrid, GridToolbar } from "@mui/x-data-grid";
import { GameData } from "./GamesDetails";
import "./gamesDetails.scss";
// import { ref, remove } from "firebase/database";
// import { database } from "../../firebase";
// import { toast } from "react-toastify";
import { useState } from "react";
import OpenCloseOption from "../OpenCloseOption/OpenCloseOption";
// import EditGame from "../EditGames/EditGame";
// import OpenCloseOption from "../OpenCloseOption/OpenCloseOption";
// import Rewards from "../Rewards/Rewards";

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
  const [openClose, setOpenClose] = useState(false);
  // const [rewards, setRewards] = useState(false);
  const [clickPosition, setClickPosition] = useState<ClickPosition | null>(
    null
  );

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
      width: 220,
      // cellClassName: "market_name",
    },
    {
      field: "result",
      headerName: "Result",
      width: 180,
    },
    {
      field: "updateResult",
      headerName: "Update Result",
      width: 150,
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
  ];

  const rows = gameData.map((game) => {
    return {
      id: game.key,
      name: game.NAME,
      result: game.RESULT,
    };
  });
  return (
    <div className="dataTable">
      {openClose && (
        <OpenCloseOption
          gameId={gameId}
          gameName={gameName}
          setOpenClose={setOpenClose}
          clickPosition={clickPosition}
        />
      )}
      {rows.length > 0 ? (
        <DataGrid
          className="dataGrid"
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
          {/* <img src="/noData.gif" alt="" className="no-data-img" /> */}
        </div>
      )}
    </div>
  );
};

export default GamesDataGrid;
