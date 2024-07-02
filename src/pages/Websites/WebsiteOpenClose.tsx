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

const allowedResults = [
  "137",
  "128",
  "146",
  "236",
  "245",
  "290",
  "380",
  "470",
  "489",
  "560",
  "678",
  "579",
  "119",
  "155",
  "227",
  "335",
  "344",
  "399",
  "588",
  "669",
  "777",
  "100",
  "129",
  "138",
  "147",
  "156",
  "237",
  "246",
  "345",
  "390",
  "480",
  "570",
  "589",
  "679",
  "110",
  "228",
  "255",
  "336",
  "499",
  "660",
  "688",
  "778",
  "200",
  "444",
  "120",
  "139",
  "148",
  "157",
  "238",
  "247",
  "256",
  "346",
  "490",
  "580",
  "670",
  "689",
  "166",
  "229",
  "337",
  "355",
  "445",
  "599",
  "779",
  "788",
  "300",
  "111",
  "130",
  "149",
  "158",
  "167",
  "239",
  "248",
  "257",
  "347",
  "356",
  "590",
  "680",
  "789",
  "112",
  "220",
  "266",
  "338",
  "446",
  "455",
  "699",
  "770",
  "400",
  "888",
  "140",
  "159",
  "168",
  "230",
  "249",
  "258",
  "267",
  "348",
  "357",
  "456",
  "690",
  "780",
  "113",
  "122",
  "177",
  "339",
  "366",
  "447",
  "799",
  "889",
  "500",
  "555",
  "123",
  "150",
  "169",
  "178",
  "240",
  "259",
  "268",
  "349",
  "358",
  "367",
  "457",
  "790",
  "114",
  "277",
  "330",
  "448",
  "466",
  "556",
  "880",
  "899",
  "600",
  "222",
  "124",
  "160",
  "179",
  "250",
  "269",
  "278",
  "340",
  "359",
  "368",
  "458",
  "467",
  "890",
  "115",
  "133",
  "188",
  "223",
  "377",
  "449",
  "557",
  "566",
  "700",
  "999",
  "125",
  "134",
  "170",
  "189",
  "260",
  "279",
  "350",
  "369",
  "378",
  "459",
  "468",
  "567",
  "116",
  "224",
  "233",
  "288",
  "440",
  "477",
  "558",
  "990",
  "800",
  "666",
  "126",
  "135",
  "180",
  "234",
  "270",
  "289",
  "360",
  "379",
  "450",
  "469",
  "478",
  "568",
  "117",
  "144",
  "199",
  "225",
  "388",
  "559",
  "577",
  "667",
  "900",
  "333",
  "127",
  "136",
  "145",
  "190",
  "235",
  "280",
  "370",
  "389",
  "460",
  "479",
  "569",
  "578",
  "118",
  "226",
  "244",
  "299",
  "334",
  "488",
  "668",
  "677",
  "000",
  "550",
];

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

  const [openFormResult, setOpenFormResult] = useState("");
  const [closeFormResult, setCloseFormResult] = useState("");

  const handleOpen = () => {
    setOpenResult(!openResult);
  };

  const handleClose = () => {
    const resultRef = ref(
      database,
      `WEBSITE GAMES/${gameId}/RESULT/${year}/${month}/${date}`
    );

    get(resultRef).then((snapshot) => {
      if (snapshot.exists()) {
        setCloseResult(!closeResult);
      } else {
        setOpenClose(false);
        toast.error("You can't declare Close result before Open");
      }
    });
  };

  const handleOpenInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOpenFormResult(e.target.value);
  };

  const handleCloseInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCloseFormResult(e.target.value);
  };

  const handleOpenSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (openFormResult) {
      if (!allowedResults.includes(openFormResult)) {
        toast.error("Invalid Open Result");
        return;
      }

      try {
        const resultRef = ref(
          database,
          `WEBSITE GAMES/${gameId}/RESULT/${year}/${month}/${date}`
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
      if (!allowedResults.includes(closeFormResult)) {
        toast.error("Invalid Close Result");
        return;
      }

      try {
        const resultRef = ref(
          database,
          `WEBSITE GAMES/${gameId}/RESULT/${year}/${month}/${date}`
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
        toast.error("Error in submitting result, try again later!");
      }
    } else {
      toast.error("Close Result can't be empty");
    }
  };

  return (
    <div
      className="openCloseOption_container"
      style={{ top: `${clickPosition?.y}px` }}
      ref={modalRef}
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
              onChange={handleOpenInputChange}
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
              onChange={handleCloseInputChange}
            />
            <button type="submit">Submit</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default WebsiteOpenClose;
