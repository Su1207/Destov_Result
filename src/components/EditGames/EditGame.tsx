import React, { useState, useEffect, useRef } from "react";
import { ref, get, set } from "firebase/database";
import { database } from "../../firebase";
import ClearIcon from "@mui/icons-material/Clear";
import "./EditGame.scss"; // You can create a separate stylesheet for styling
import { toast } from "react-toastify";
import { ClickPosition } from "../GamesDetails/GamesDataGrid";

type Props = {
  gameId: string;
  setEditGame: React.Dispatch<React.SetStateAction<boolean>>;
  clickPosition: ClickPosition | null;
};

const EditGame = ({ gameId, setEditGame, clickPosition }: Props) => {
  const [gameName, setGameName] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.style.left = `${clickPosition?.x}px`;
      modalRef.current.style.top = `${clickPosition?.y}px`;
    }
  }, [clickPosition]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const gameRef = ref(database, `RESULTS/${gameId}/NAME`);
        const gameSnapshot = await get(gameRef);
        setGameName(gameSnapshot.val());
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [gameId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGameName(e.target.value);
  };

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (gameName) {
        const gameRef = ref(database, `RESULTS/${gameId}/NAME`);
        await set(gameRef, gameName);
        toast.success("Game Updated succesfully!");
        setEditGame(false);
      } else {
        toast.error("Please input game name!!!");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      className="openCloseOption_container"
      style={{ top: `${clickPosition?.y}px` }}
    >
      <div className="openCloseOption_main_container open_container">
        <span className="close" onClick={() => setEditGame(false)}>
          <ClearIcon />
        </span>
        <form onSubmit={handleSubmit}>
          <label>Enter New Market Name</label>
          <input
            type="text"
            value={gameName}
            required
            onChange={handleChange}
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default EditGame;
