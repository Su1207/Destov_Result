import { useEffect, useRef, useState } from "react";
import { useBidDetailsContext } from "./BidDetailsContext";
import { database } from "../../firebase";
import { get, getDatabase, ref } from "firebase/database";
import { initializeApp } from "firebase/app";
import RelatedUserDetails from "./RelatedUserDetails";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Link } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { CombineBidDataType } from "./BidData";

export type UserDetailsType = {
  [appName: string]: SingleUserDetail[];
};

export type SingleUserDetail = {
  userName: string;
  phoneNumber: string;
  points: number;
};

export type ClickPosition = {
  x: number;
  y: number;
};

const currentFormattedDate = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const date = currentDate.getDate().toString().padStart(2, "0");
  const hours = (currentDate.getHours() % 12 || 12).toString().padStart(2, "0");
  const min = currentDate.getMinutes().toString().padStart(2, "0");
  const sec = currentDate.getSeconds().toString().padStart(2, "0");
  const meridiem = currentDate.getHours() >= 12 ? "PM" : "AM";

  return `${date}-${month}-${year} | ${hours}:${min}:${sec} ${meridiem}`;
};

const BidDetails: React.FC<{ gameType: string | undefined }> = ({
  gameType,
}) => {
  const { combinebidData, open, value } = useBidDetailsContext();
  const [totalPoints, setTotalPoints] = useState(0);
  const [clickedNumber, setClickedNumber] = useState(false);
  const [clickPosition, setClickPosition] = useState<ClickPosition | null>(
    null
  );
  const [bidNumber, setBidNnumber] = useState("");
  const [isEditorVisible, setIsEditorVisible] = useState(false);

  const [formattedText, setFormattedText] = useState<any>(""); // Declare formattedText as state

  const [loading, setLoading] = useState(false);
  const [userBidData, setUserBidData] = useState<UserDetailsType>({});
  const [date, month, year] = [value?.date(), value?.month(), value?.year()];

  const newDate = date?.toString().padStart(2, "0");
  const newMonth =
    month !== undefined && month >= 0
      ? (month + 1)?.toString().padStart(2, "0")
      : "";

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [Open, setOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState("");
  const [sortedCombineData, setSortedCombineData] = useState<
    CombineBidDataType[]
  >([]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setAnchorEl(null);
  };

  const handleMenuItemClick = (value: string) => {
    setSelectedMenuItem(value);
    setOpen(false);
    setAnchorEl(null);
  };

  console.log(selectedMenuItem);
  useEffect(() => {
    let totalPoints = 0;
    combinebidData.map((data) => {
      totalPoints += data.marketTotalPoints;
    });
    setTotalPoints(totalPoints);

    // Sort the numbers object within each market based on points
    const sortedData = combinebidData.map((market) => {
      const sortedNumbers = Object.fromEntries(
        Object.entries(market.numbers).sort(([, a], [, b]) => {
          // Change the logic here to sort based on points
          return selectedMenuItem === "High" ? b - a : a - b;
        })
      );
      console.log(sortedNumbers);

      return { ...market, numbers: sortedNumbers };
    });
    console.log(sortedData);

    // Update combinebidData state with sorted data
    setSortedCombineData(sortedData);
  }, [selectedMenuItem]);

  // Organize data into rows
  const rows: any = Array.from(
    {
      length: Math.max(
        ...sortedCombineData.map((market) => Object.keys(market.numbers).length)
      ),
    },
    (_, index) => ({
      id: index + 1,
      ...sortedCombineData.reduce(
        (acc, market) => ({
          ...acc,
          [market.marketName]: Object.entries(market.numbers)[index]
            ? `${Object.entries(market.numbers)[index][0]} = ${
                Object.entries(market.numbers)[index][1]
              } ₹`
            : "", // Display "number = points ₹" only if both number and points exist
        }),
        {}
      ),
    })
  );

  const handleColumnClick = async (
    event: React.MouseEvent,
    marketName: string,
    appName: string[],
    row: any
  ) => {
    try {
      setLoading(true);
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left + window.scrollX; // Adjust for horizontal scroll
      const y = event.clientY - rect.top + window.scrollY;
      setBidNnumber(row.split(" = ")[0]);
      const dbRef = ref(database, "FIREBASE CONFIGURATIONS");
      const dbSnapshot = await get(dbRef);

      const promises: Promise<void>[] = [];
      const userData: UserDetailsType = {};

      appName.forEach((app) => {
        const appname = app.split(":")[0];
        const gameKey = app.split(":")[1];
        dbSnapshot.forEach((dbs) => {
          if (dbs.val().name === appname && !dbs.val().disable) {
            const firebaseConfig1 = dbs.val();

            const app1 = initializeApp(firebaseConfig1, `${appname}`);
            const database1 = getDatabase(app1);

            const userDetails = ref(
              database1,
              `TOTAL TRANSACTION/BIDS/${year}/${newMonth}/${newDate}/${gameKey}/${
                gameType?.split(":")[0]
              }/${marketName}/${row.split(" = ")[0]}/USERS`
            );

            const promise1 = get(userDetails).then((userSnapshot) => {
              if (userSnapshot.exists()) {
                const singleUser: SingleUserDetail[] = [];

                userSnapshot.forEach((phoneKey) => {
                  let userName = "";
                  const phoneNumber = phoneKey.key;
                  const points = phoneKey.val();

                  const userRef = ref(database1, `USERS/${phoneNumber}`);

                  const promise2 = get(userRef).then((snapshot) => {
                    if (snapshot.exists()) {
                      userName = snapshot.val().NAME;
                      //   console.log(snapshot.val().NAME);
                    }
                    singleUser.push({
                      userName,
                      phoneNumber,
                      points,
                    });
                  });
                  promises.push(promise2);
                });

                userData[appname] = singleUser;
              }
            });
            promises.push(promise1);
          }
        });
      });
      await Promise.all(promises);
      setClickedNumber(!clickedNumber);

      setTimeout(() => {
        setUserBidData(userData);
        setLoading(false);
      }, 300);
      setClickPosition({ x, y });
    } catch (er) {
      console.log(er);
    }
  };

  const handleCopyToClipboard = async () => {
    // Construct the formatted text
    let newFormattedText = `✦ ${gameType?.split(":")[1]} (${
      gameType?.split(":")[0]
    }) : ${totalPoints} ₹ ✦\n\nDate : ${currentFormattedDate()}\n\n`;

    const gameTypes = [
      "Single Digit",
      "Jodi Digit",
      "Single Panel",
      "Double Panel",
      "Triple Panel",
      "Half Sangam",
      "Full Sangam",
    ];

    gameTypes.forEach((type) => {
      const gameDetails = combinebidData.find(
        (detail) => detail.marketName === type
      );

      if (gameDetails) {
        newFormattedText += `${type} : ${gameDetails.marketTotalPoints} ₹\n`;
      }
    });

    gameTypes.forEach((type) => {
      const gameDetails = combinebidData.find(
        (detail) => detail.marketName === type
      );

      if (gameDetails) {
        newFormattedText += `\n✦ ${type} ✦\n\n`;
        Object.entries(gameDetails.numbers).forEach(([number, points]) => {
          newFormattedText += `${number}=${points} ₹\n`;
        });
        newFormattedText += `--------------------\nTotal = ${gameDetails.marketTotalPoints}\n--------------------\n\n`;
      }
    });

    // Update the state
    setFormattedText(newFormattedText);

    try {
      // Use the updated state value directly inside the writeText callback
      await navigator.clipboard.writeText(newFormattedText);
      // Provide feedback to the user, e.g., toast message
      alert("Copied to clipboard!");
      //   console.log(formattedText);
      toggleEditor();
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  console.log(formattedText);

  const toggleEditor = () => {
    setIsEditorVisible(!isEditorVisible);
  };

  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleDownloadCSV = () => {
    // Select the table element by its ID or any other suitable selector
    const table = document.getElementById("table-id");

    if (!table) {
      console.error("Table not found");
      return;
    }

    // Extract table rows and cells
    const rows = table.querySelectorAll("tr");

    // Extract data from each cell and build CSV content
    const csvContent = Array.from(rows, (row) => {
      const cells = row.querySelectorAll("td, th");
      return Array.from(cells, (cell) => cell.textContent?.trim()).join(",");
    }).join("\n");

    // Create a blob with CSV content
    const blob = new Blob([csvContent], { type: "text/csv" });

    // Create a link element to trigger download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "table.csv";

    // Trigger the download
    link.click();
  };

  return (
    <div className="">
      {clickedNumber && (
        <RelatedUserDetails
          loading={loading}
          userBidData={userBidData}
          setClickedNumber={setClickedNumber}
          bidNumber={bidNumber}
          clickPosition={clickPosition}
        />
      )}
      <div className={`${open ? "lg:w-[76%] xl:min-w-[82%]" : "lg:w-[100%]"} `}>
        {sortedCombineData && sortedCombineData.length > 0 ? (
          <>
            <div className="flex items-center text-2xl font-bold mb-4">
              <Link to={"/bidData"} className="hover:text-[#F05387]">
                <ChevronLeftIcon sx={{ fontSize: "25px" }} />
              </Link>
              <div>
                {gameType?.split(":")[1]}{" "}
                <span className="text-sm font-semibold">
                  ({gameType?.split(":")[0]})
                </span>
              </div>
            </div>
            <div className="border p-4 rounded-md shadow-lg bg-gradient-to-r from-[#8e2de2] to-[#4a00e0] text-white w-auto mb-4 sm:w-96">
              {sortedCombineData.map((data, index) => (
                <div
                  key={index}
                  className="flex mb-1 justify-between items-center"
                >
                  <div className=" text-sm sm:text-base">{data.marketName}</div>
                  <div className="text-sm sm:text-base">
                    {data.marketTotalPoints} &#8377;
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center font-semibold">
                <div className="text-sm sm:text-base">Total</div>
                <div className="text-sm sm:text-base">
                  {totalPoints} &#8377;
                </div>
              </div>
              <div className="flex justify-center items-center">
                <button
                  onClick={handleCopyToClipboard}
                  className="px-4 py-2 text-white text-xs rounded-sm bg-blue-900 hover:font-semibold hover:bg-black transition-all duration-300 ease-in-out"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className=" flex justify-center xs:justify-end gap-2 mb-4">
              <div className="border rounded-sm text-white p-2 hover:bg-[#FAA912] shadow-md bg-[#f09819] text-xs xs:text-sm font-medium transition-all duration-300 ease-in-out">
                <button
                  onClick={handleDownloadCSV}
                  className=" outline-none border-none "
                >
                  Download as CSV
                </button>
              </div>
              <div className="border rounded-sm py-2 px-4 text-white hover:bg-[#FAA912] shadow-md bg-[#f09819] text-xs xs:text-sm transition-all duration-300 ease-in-out font-medium">
                <button
                  onClick={handlePrint}
                  className=" outline-none border-none"
                >
                  Print
                </button>
              </div>
              <div className="border rounded-sm p-2 shadow-md bg-green-700 text-white text-xs xs:text-sm font-semibold hover:bg-green-500 transition-all duration-300 ease-in-out">
                Total = {totalPoints} ₹
              </div>
              <div className="flex justify-end">
                <Button
                  id="basic-button"
                  aria-controls={Open ? "basic-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={Open ? "true" : undefined}
                  onClick={handleClick}
                >
                  <FilterAltIcon sx={{ fontSize: "30px", color: "#343a40" }} />
                </Button>
                <Menu
                  id="basic-menu"
                  anchorEl={anchorEl}
                  open={Open}
                  onClose={handleClose}
                  MenuListProps={{
                    "aria-labelledby": "basic-button",
                  }}
                >
                  <MenuItem onClick={() => handleMenuItemClick("High")}>
                    High to Low
                  </MenuItem>
                  <MenuItem onClick={() => handleMenuItemClick("Low")}>
                    Low to High
                  </MenuItem>
                </Menu>
              </div>
            </div>
            <div
              ref={componentRef}
              className="relative overflow-x-auto shadow-md sm:rounded-lg mb-8"
            >
              <table
                id="table-id"
                className="w-full text-sm text-left border rtl:text-right text-gray-500 dark:text-gray-400 px-4"
              >
                <thead className="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-2 py-3 text-center">
                      S.No
                    </th>
                    {combinebidData.map((market) => (
                      <th
                        key={market.marketName}
                        scope="col"
                        className="px-4 py-3 text-center min-w-32"
                      >
                        {market.marketName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row: any, rowIndex: number) => (
                    <tr
                      key={rowIndex}
                      className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                    >
                      <td className="px-4 py-4 text-center ">{row.id}</td>
                      {/* Iterate over the arrangedMarketData to generate table cells */}
                      {combinebidData.map((market) => (
                        <td
                          key={`${rowIndex}-${market.marketName}`}
                          className="px-4 py-4 text-center cursor-pointer min-w-[165px]"
                          onClick={(event) =>
                            handleColumnClick(
                              event,
                              market.marketName,
                              market.appName,
                              row[market.marketName]
                            )
                          }
                        >
                          {/* Display the value corresponding to the current market name and number */}
                          {row[market.marketName]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="no-data">
            <img src="/noData.gif" alt="" className="no-data-img" />
          </div>
        )}
      </div>
    </div>
  );
};

export default BidDetails;
