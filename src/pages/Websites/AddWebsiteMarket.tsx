import React, { useState } from "react";
import { ref, push, set } from "firebase/database";
import { FormControlLabel, Switch, useMediaQuery } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import "./AddWebsiteMarket.scss";
import { toast } from "react-toastify";
import { database } from "../../firebase";
import { ChromePicker, ColorResult } from "react-color";

export interface GameForm {
  NAME: string;
  OPEN: string;
  CLOSE: string;
  COLOR: string;
  DISABLE: boolean;
  HIDDEN: boolean;
  DAYS: {
    MON: boolean;
    TUE: boolean;
    WED: boolean;
    THU: boolean;
    FRI: boolean;
    SAT: boolean;
    SUN: boolean;
  };
}

const getDefaultDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}T00:00`;
};

type Props = {
  setAddGame: React.Dispatch<React.SetStateAction<boolean>>;
};

const AddWebsiteMarket = (props: Props) => {
  const [gameData, setGameData] = useState<GameForm>({
    NAME: "",
    OPEN: getDefaultDateTime(),
    CLOSE: getDefaultDateTime(),
    COLOR: "#fff",
    DISABLE: false,
    HIDDEN: false,
    DAYS: {
      MON: true,
      TUE: true,
      WED: true,
      THU: true,
      FRI: true,
      SAT: true,
      SUN: true,
    },
  });

  //   const { databaseConfig } = useAuth();

  const [modalOpen, setIsModalOpen] = useState(true);

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

  const handleInputChange = (
    field: keyof GameForm,
    value: string | boolean | Record<string, boolean>
  ) => {
    setGameData((prevGameData) => ({
      ...prevGameData,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (gameData.CLOSE && gameData.NAME && gameData.OPEN) {
      const gamesRef = ref(database, "WEBSITE GAMES");

      try {
        const newGameRef = push(gamesRef);

        const daysAsString: Record<string, string> = {};
        for (const [day, value] of Object.entries(gameData.DAYS)) {
          daysAsString[day] = value.toString();
        }

        const currentDate = new Date();
        const openDateTime = new Date(
          `${currentDate.toISOString().split("T")[0]} ${gameData.OPEN}`
        );
        const closeDateTime = new Date(
          `${currentDate.toISOString().split("T")[0]} ${gameData.CLOSE}`
        );

        await set(newGameRef, {
          NAME: gameData.NAME,
          OPEN: openDateTime.getTime(),
          CLOSE: closeDateTime.getTime(),
          COLOR: gameData.COLOR,
          DISABLE: gameData.DISABLE.toString(),
          HIDDEN: gameData.HIDDEN.toString(),
          DAYS: daysAsString,
        });

        // // Reset form fields after successful submission
        // setGameData({
        //   NAME: "",
        //   OPEN: getDefaultDateTime(),
        //   CLOSE: getDefaultDateTime(),
        //   DISABLED: false,
        //   HIDDEN: false,
        //   DAYS: {
        //     MON: true,
        //     TUE: true,
        //     WED: true,
        //     THU: true,
        //     FRI: true,
        //     SAT: true,
        //     SUN: true,
        //   },
        // });

        toast.success("Game added successfully!");
        props.setAddGame(false);
      } catch (error) {
        console.error("Error adding game:", error);
      }
    } else {
      toast.error("Required Fields can't be empty");
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!modalOpen);
    props.setAddGame(false);
  };

  // console.log(gameData.HIDDEN, gameData.DISABLE);

  return (
    <div className={`add1 ${modalOpen ? "" : "closed"}`}>
      <div className="modal1">
        <span className="close" onClick={toggleModal}>
          <ClearIcon />
        </span>
        <h1 className="add_new_title text-2xl font-bold">
          Add New Market
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
          </div>

          <div className="days_opening_title">Market Opening Days</div>

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
            Add New Market
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddWebsiteMarket;
