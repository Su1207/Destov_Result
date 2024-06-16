import { useEffect, useRef, useState } from "react";
import { ClickPosition } from "./WebsiteMarket";
import { database } from "../../firebase";
import { get, ref, set, update } from "firebase/database";
import { toast } from "react-toastify";
import { ClearIcon } from "@mui/x-date-pickers/icons";

type OpenCloseProps = {
  gameId: string;
  gameName: string;
  setOpenClose: React.Dispatch<React.SetStateAction<boolean>>;
  clickPosition: ClickPosition | null;
};

const WebsiteOpenClose: React.FC<OpenCloseProps> = ({
  gameId,
  gameName,
  setOpenClose,
  clickPosition,
}) => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const date = currentDate.getDate().toString().padStart(2, "0");

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.style.left = `${clickPosition?.x}px`;
      modalRef.current.style.top = `${clickPosition?.y}px`;
    }
  }, [clickPosition]);

  const [openResult, setOpenResult] = useState(false);
  const [closeResult, setCloseResult] = useState(false);

  // const [resultUpdated, setResultUpdated] = useState(false);

  const [openFormResult, setOpenFormResult] = useState("");
  const [closeFormResult, setCloseFormResult] = useState("");

  const handleOpen = () => {
    setOpenResult(!openResult);
    // setOpenClose(false);
  };

  const handleClose = () => {
    const resultRef = ref(
      database,
      `WEBSITE GAMES/${gameId}/${year}/${month}/${date}`
    );

    get(resultRef).then((snapshot) => {
      if (snapshot.exists()) {
        setCloseResult(!closeResult);
      } else {
        setOpenClose(false);
        toast.error("You can't declare Close result before Open");
      }
    });

    // setOpenClose(false);
  };

  const handleOpenInputChnage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOpenFormResult(e.target.value);
  };

  const handleCloseInputChnage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCloseFormResult(e.target.value);
  };

  const handleOpenSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (openFormResult) {
      try {
        const resultRef = ref(
          database,
          `WEBSITE GAMES/${gameId}/${year}/${month}/${date}`
        );

        const singleDigit = String(
          (parseInt(openFormResult[0]) +
            parseInt(openFormResult[1]) +
            parseInt(openFormResult[2])) %
            10
        );

        const midResult = `${singleDigit}✦`;

        await set(resultRef, {
          OPEN: openFormResult,
          MID: midResult,
          CLOSE: "✦✦✦",
        });

        setOpenClose(false);
        toast.success("Open Result updated successfully");
      } catch (err) {
        console.log(err);
        toast.error("Error in submitting result, try again later!");
      }
    } else {
      toast.error("Open Result can't be empty");
    }
  };

  const handleCloseSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (closeFormResult) {
      try {
        const resultRef = ref(
          database,
          `WEBSITE GAMES/${gameId}/${year}/${month}/${date}`
        );

        get(resultRef).then(async (snapshot) => {
          if (snapshot.exists()) {
            const open = snapshot.val().OPEN;

            const singleOpen = `${
              (parseInt(open[0]) + parseInt(open[1]) + parseInt(open[2])) % 10
            }`;

            const singleClose = `${
              (parseInt(closeFormResult[0]) +
                parseInt(closeFormResult[1]) +
                parseInt(closeFormResult[2])) %
              10
            }`;

            const midResult = `${singleOpen}${singleClose}`;

            await update(resultRef, {
              MID: midResult,
              CLOSE: closeFormResult,
            });

            toast.success("Close Result updated successfully");
            setOpenClose(false);
          }
        });
      } catch (err) {
        console.log(err);
        toast.error("Error in submitting result,try again later!");
      }
    } else {
      toast.error("Close Result can't be empty");
    }
  };

  return (
    <div
      className="openCloseOption_container"
      style={{ top: `${clickPosition?.y}px` }}
    >
      {!openResult && !closeResult && (
        <div className="openCloseOption_main_container">
          <span className="close" onClick={() => setOpenClose(false)}>
            <ClearIcon />
          </span>
          <h2 className="text-xl font-bold text-gray-600 mb-2">{gameName}</h2>
          <p className="mb-2 text-xs">
            Please choose which market do you want to explore ?
          </p>
          <button onClick={handleOpen} className="text-xs sm:text-sm">
            OPEN
          </button>
          <button onClick={handleClose} className="text-xs sm:text-sm">
            CLOSE
          </button>
        </div>
      )}

      {openResult && (
        <div className="openCloseOption_main_container open_container">
          <span className="close" onClick={() => setOpenClose(false)}>
            <ClearIcon />
          </span>
          <form onSubmit={handleOpenSubmit}>
            <label>Enter Open Result</label>
            <input
              type="text"
              placeholder="Enter 3 digits"
              pattern="[0-9]{3}" // Restrict to only numeric entries with exactly 3 digits
              title="Please enter exactly 3 numeric digits"
              maxLength={3}
              inputMode="numeric"
              onChange={handleOpenInputChnage}
            />
            <button type="submit">Submit</button>
          </form>
        </div>
      )}

      {closeResult && (
        <div className="openCloseOption_main_container close_container">
          <span className="close" onClick={() => setOpenClose(false)}>
            <ClearIcon />
          </span>
          <form onSubmit={handleCloseSubmit}>
            <label>Enter Close Result</label>
            <input
              type="text"
              placeholder="Enter 3 digits"
              pattern="[0-9]{3}" // Restrict to only numeric entries with exactly 3 digits
              title="Please enter exactly 3 numeric digits"
              maxLength={3}
              inputMode="numeric"
              onChange={handleCloseInputChnage}
            />
            <button type="submit">Submit</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default WebsiteOpenClose;
