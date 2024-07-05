import React, { useEffect, useRef, useState } from "react";
import { ClickPosition } from "./WebsiteMarket";
import { GameForm } from "./AddWebsiteMarket";
import { ChromePicker, ColorResult } from "react-color";
import { FormControlLabel, Switch, useMediaQuery } from "@mui/material";
import { ClearIcon } from "@mui/x-date-pickers/icons";
import { toast } from "react-toastify";
import { ref, update } from "firebase/database";
import { database } from "../../firebase";

const dateFetched = (date: string) => {
  const dateObj = new Date(Number(date));
  const hours = dateObj.getHours().toString().padStart(2, "0");
  const minutes = dateObj.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
};

// const getDefaultDateTime = () => {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = (now.getMonth() + 1).toString().padStart(2, "0");
//   const day = now.getDate().toString().padStart(2, "0");
//   return `${year}-${month}-${day}T00:00`;
// };

type Props = {
  gamekey: string;
  color: string;
  open: string;
  close: string;
  name: string;
  disable: string;
  hidden: string;
  days: Record<string, string> | undefined;
  disclaimer: boolean;
  setEditGame: React.Dispatch<React.SetStateAction<boolean>>;
  clickPosition: ClickPosition | null;
};

const EditWebsiteMarket = ({
  gamekey,
  color,
  open,
  close,
  name,
  disable,
  hidden,
  days,
  disclaimer,
  setEditGame,
  clickPosition,
}: Props) => {
  const [gameData, setGameData] = useState<GameForm>({
    NAME: name,
    OPEN: dateFetched(open),
    CLOSE: dateFetched(close),
    COLOR: color || "#fff",
    DISABLE: disable === "false" ? false : true,
    HIDDEN: hidden === "false" ? false : true,
    LIVE_DISCLAIMER: disclaimer,
    DAYS: {
      MON: days?.MON === "false" ? false : true,
      TUE: days?.TUE === "false" ? false : true,
      WED: days?.WED === "false" ? false : true,
      THU: days?.THU === "false" ? false : true,
      FRI: days?.FRI === "false" ? false : true,
      SAT: days?.SAT === "false" ? false : true,
      SUN: days?.SUN === "false" ? false : true,
    },
  });

  const [modalOpen, setIsModalOpen] = useState(true);

  const modalRef = useRef<HTMLDivElement>(null);

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
    setGameData((prevGameData) => ({
      ...prevGameData,
      COLOR: color.hex,
    }));
  };

  // Update the position of the modal when clickPosition changes
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.style.left = `${clickPosition?.x}px`;
      modalRef.current.style.top = `${clickPosition?.y}px`;
    }
  }, [clickPosition]);

  const toggleModal = () => {
    setIsModalOpen(!modalOpen);
    setEditGame(false);
  };

  const handleInputChange = (
    field: keyof GameForm,
    value: string | boolean | Record<string, boolean>
  ) => {
    setGameData((prevGameData) => ({
      ...prevGameData,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (gameData.NAME && gameData.OPEN && gameData.CLOSE && gameData.COLOR) {
      const gamesRef = ref(database, `WEBSITE GAMES/${gamekey}`);

      const daysAsString: Record<string, string> = {};
      for (const [day, isChecked] of Object.entries(gameData.DAYS)) {
        daysAsString[day] = isChecked.toString();
      }

      try {
        const currentDate = new Date();
        const openDateTime = new Date(
          `${currentDate.toISOString().split("T")[0]} ${gameData.OPEN}`
        );
        const closeDateTime = new Date(
          `${currentDate.toISOString().split("T")[0]} ${gameData.CLOSE}`
        );

        await update(gamesRef, {
          NAME: gameData.NAME,
          OPEN: openDateTime.getTime(),
          CLOSE: closeDateTime.getTime(),
          COLOR: gameData.COLOR,
          DISABLED: gameData.DISABLE.toString(),
          HIDDEN: gameData.HIDDEN.toString(),
          LIVE_DISCLAIMER: gameData.LIVE_DISCLAIMER,
          DAYS: daysAsString,
        });

        toast.success("Game updated successfully!");
        setEditGame(false);
      } catch (err) {
        console.error("Error adding game:", err);
        toast.error("Error adding game");
      }
    } else {
      toast.error("Required Fields can't be empty");
    }
  };

  return (
    <div
      className={`add1 ${modalOpen ? "" : "closed"}`}
      style={{ top: `${clickPosition?.y}px` }}
    >
      <div className="modal1">
        <span className="close" onClick={toggleModal}>
          <ClearIcon />
        </span>
        <h1 className="add_new_title text-2xl font-bold">
          Edit Market
          <span className="addNew">
            {/* <img src={AddNew} alt="Add New" className="add-new_img" /> */}
          </span>
        </h1>
        <form onSubmit={handleSubmit} className="addGame_form">
          <div className="item1">
            <label className="">
              Market <span>Name</span>*
            </label>
            <input
              type="text"
              placeholder="Market Name"
              value={gameData.NAME}
              onChange={(e) => handleInputChange("NAME", e.target.value)}
            />
          </div>

          <div className="item1">
            <label>Open On*</label>
            <input
              type="time"
              placeholder="Open On:"
              value={gameData.OPEN}
              onChange={(e) => handleInputChange("OPEN", e.target.value)}
            />
          </div>
          <div className="item1">
            <label>Close On*</label>
            <input
              type="time"
              placeholder="Close On:"
              value={gameData.CLOSE}
              onChange={(e) => handleInputChange("CLOSE", e.target.value)}
            />
          </div>

          <div className="toggle_switch">
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={gameData.DISABLE}
                  onChange={() =>
                    handleInputChange("DISABLE", !gameData.DISABLE)
                  }
                />
              }
              label="Disable"
            />
            <FormControlLabel
              className="formControl_switch"
              control={
                <Switch
                  size="small"
                  checked={gameData.HIDDEN}
                  onChange={() => handleInputChange("HIDDEN", !gameData.HIDDEN)}
                />
              }
              label="Hidden"
            />
            <FormControlLabel
              className="formControl_switch"
              control={
                <Switch
                  size="small"
                  checked={gameData.LIVE_DISCLAIMER}
                  onChange={() =>
                    handleInputChange(
                      "LIVE_DISCLAIMER",
                      !gameData.LIVE_DISCLAIMER
                    )
                  }
                />
              }
              label="Disclaimer"
            />
          </div>

          {/* <div className="days_opening_title">Market Opening Days</div> */}

          <div className="days_opening">
            {Object.entries(gameData.DAYS).map(([day, isChecked]) => (
              <span key={day}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() =>
                    handleInputChange("DAYS", {
                      ...gameData.DAYS,
                      [day]: !isChecked,
                    })
                  }
                />
                {day}
              </span>
            ))}
          </div>

          <div className="item1">
            <ChromePicker
              color={gameData.COLOR}
              onChange={handleColorChange}
              styles={pickerStyles}
            />
          </div>

          <button className="add_btn" type="submit">
            Update Market
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditWebsiteMarket;
