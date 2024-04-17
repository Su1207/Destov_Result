import { useEffect, useRef, useState } from "react";
import "./OpenCloseOption.scss";
import { get, getDatabase, ref, set, update } from "firebase/database";
import { database } from "../../firebase";
import { toast } from "react-toastify";
import ClearIcon from "@mui/icons-material/Clear";
import { ClickPosition } from "../GamesDetails/GamesDataGrid";
import { initializeApp } from "firebase/app";
import { sendNotificationToTopic } from "../NotificationService";

type OpenCloseProps = {
  gameId: string;
  gameName: string;
  setOpenClose: React.Dispatch<React.SetStateAction<boolean>>;
  clickPosition: ClickPosition | null;
};

const currentDate = new Date();
const year = currentDate.getFullYear();
const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
const date = currentDate.getDate().toString().padStart(2, "0");
const hour = (currentDate.getHours() % 12 || 12).toString().padStart(2, "0");
const min = currentDate.getMinutes().toString().padStart(2, "0");
const sec = currentDate.getSeconds().toString().padStart(2, "0");

const meridiem = currentDate.getHours() >= 12 ? "PM" : "AM";

const dateString = `${date}-${month}-${year} | ${hour}:${min}:${sec} ${meridiem}`;

const OpenCloseOption: React.FC<OpenCloseProps> = ({
  gameId,
  gameName,
  setOpenClose,
  clickPosition,
}) => {
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
      `RESULTS/${gameId}/${year}/${month}/${date}`
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

  const sendRewardsQueue: { [phoneNumber: string]: Promise<void> | undefined } =
    {};

  const sendRewards = async (
    database1: any,
    phoneNumber: string,
    points: number,
    element: string,
    rate: number,
    result: string,
    openClose: string,
    gameId: string
  ) => {
    if (!sendRewardsQueue[phoneNumber]) {
      sendRewardsQueue[phoneNumber] = Promise.resolve();
    }

    const previousSendRewardsPromise = sendRewardsQueue[phoneNumber];

    const newSendRewardsPromise = previousSendRewardsPromise?.then(async () => {
      const userRef = ref(database1, `USERS/${phoneNumber}`);
      const userSnapshot = await get(userRef);

      if (userSnapshot.exists()) {
        const userName = userSnapshot.val().NAME;
        const previousPoints = userSnapshot.val().AMOUNT;
        const winPoints = points * (rate / 10);
        const newPoints = previousPoints + winPoints;

        await update(userRef, { AMOUNT: newPoints });

        const transactionData = {
          DATE: dateString,
          MARKET_ID: gameId,
          MARKET_NAME: gameName,
          NAME: userName,
          NEW_POINTS: newPoints,
          NUMBER: result,
          OPEN_CLOSE: openClose,
          PHONE: phoneNumber,
          POINTS: String(points),
          PREVIOUS_POINTS: previousPoints,
          TYPE:
            element === "Half SangamO" || element === "Half SangamC"
              ? "Half Sangam"
              : element,
          WIN_POINTS: winPoints,
        };

        const totalTransactionTotalRef = ref(
          database1,
          `TOTAL TRANSACTION/WIN/TOTAL/${gameId}/${Date.now()}`
        );
        const totalTransactionDateWiseRef = ref(
          database1,
          `TOTAL TRANSACTION/WIN/DATE WISE/${year}/${month}/${date}/${gameId}/${Date.now()}`
        );
        const userTransactionDateWiseRef = ref(
          database1,
          `USERS TRANSACTION/${phoneNumber}/WIN/DATE WISE/${year}/${month}/${date}/${gameId}/${Date.now()}`
        );
        const userTransactionTotalRef = ref(
          database1,
          `USERS TRANSACTION/${phoneNumber}/WIN/TOTAL/${gameId}/${Date.now()}`
        );

        await Promise.all([
          set(totalTransactionTotalRef, transactionData),
          set(userTransactionTotalRef, transactionData),
          set(userTransactionDateWiseRef, transactionData),
          set(totalTransactionDateWiseRef, transactionData),
        ]);
      }
    });

    // Update the queue with the new promise
    sendRewardsQueue[phoneNumber] = newSendRewardsPromise;

    // Return the new promise
    return newSendRewardsPromise;
  };

  const getGameName = (marketResult: string): string => {
    // Your logic to determine the game name based on the market result
    // Example logic:
    const a = parseInt(marketResult[0]);
    const b = parseInt(marketResult[1]);
    const c = parseInt(marketResult[2]);
    if (a === b && b === c) {
      return "Triple Panel";
    } else if (a === b || b === c || a === c) {
      return "Double Panel";
    } else {
      return "Single Panel";
    }
  };

  const getGameAbbreviation = (gameName: string): string => {
    if (gameName === "Triple Panel") {
      return "TP";
    } else if (gameName === "Double Panel") {
      return "DP";
    } else {
      return "SP";
    }
  };

  const handleOpenSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (openFormResult) {
      try {
        const resultRef = ref(
          database,
          `RESULTS/${gameId}/${year}/${month}/${date}`
        );

        const gameNameRef = ref(database, `RESULTS/${gameId}/NAME`);
        const gamenameSnapshot = await get(gameNameRef);

        const gameName = gamenameSnapshot.val();

        const marketName = getGameName(openFormResult);

        const marketShortName = getGameAbbreviation(marketName);

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

        const promises: Promise<void>[] = [];

        const dbRef = ref(database, "FIREBASE CONFIGURATIONS");
        const appRef = ref(database, `RESULTS/${gameId}/APP`);
        const appSnapshot = await get(appRef);
        const dbSnapshot = await get(dbRef);

        if (appSnapshot.exists()) {
          appSnapshot.forEach((appName) => {
            if (dbSnapshot.exists()) {
              dbSnapshot.forEach((firebaseConfig) => {
                if (
                  appName.val() === firebaseConfig.val().name &&
                  !firebaseConfig.val().disable
                ) {
                  const firebaseConfig1 = firebaseConfig.val();

                  const app1 = initializeApp(
                    firebaseConfig1,
                    `${appName.val()}`
                  );
                  const database1 = getDatabase(app1);

                  const gameNameRef = ref(database1, "GAMES");

                  const bidRate = ref(database1, "ADMIN/GAME RATE");

                  const timestamp = Date.now();

                  const promise5 = get(bidRate).then((snapshot) => {
                    if (snapshot.exists()) {
                      const SDrate = snapshot.child("SD").val();
                      const PanelRate = snapshot
                        .child(`${marketShortName}`)
                        .val();

                      const promise1 = get(gameNameRef).then((gameSnapshot) => {
                        if (gameSnapshot.exists()) {
                          gameSnapshot.forEach((gameKey) => {
                            if (gameName === gameKey.val().NAME) {
                              const gameId = gameKey.key;

                              const newResultRef = ref(
                                database1,
                                `RESULTS/${gameId}/${year}/${month}/${date}`
                              );

                              const bidArray = [
                                "Single Digit",
                                `${marketName}`,
                              ];

                              for (
                                let index = 0;
                                index < bidArray.length;
                                index++
                              ) {
                                const element = bidArray[index];

                                const userDetailsRef = ref(
                                  database1,
                                  `TOTAL TRANSACTION/BIDS/${year}/${month}/${date}/${gameId}/OPEN/${element}/${
                                    element === "Single Digit"
                                      ? singleDigit
                                      : openFormResult
                                  }/USERS`
                                );

                                const promise4 = get(userDetailsRef).then(
                                  (snapshot) => {
                                    if (snapshot.exists()) {
                                      console.log(snapshot.val());
                                      snapshot.forEach((phone) => {
                                        const phoneNumber = phone.key;
                                        const points = phone.val();
                                        const open = "OPEN";

                                        const promise6 = sendRewards(
                                          database1,
                                          phoneNumber,
                                          points,
                                          element,
                                          element === "Single Digit"
                                            ? SDrate
                                            : PanelRate,
                                          element === "Single Digit"
                                            ? singleDigit
                                            : openFormResult,
                                          open,
                                          gameId
                                        );

                                        promises.push(promise6);
                                      });
                                    }
                                  }
                                );
                                promises.push(promise4);
                              }

                              const totalRef = ref(
                                database1,
                                `GAME CHART/${gameId}`
                              );

                              const totalNewRef = ref(
                                database1,
                                `GAME CHART/${gameId}/${timestamp}`
                              );

                              const promise2 = set(newResultRef, {
                                OPEN: openFormResult,
                                MID: midResult,
                                CLOSE: "✦✦✦",
                              });
                              promises.push(promise2);

                              const promise = get(totalRef).then(
                                (chartSnapshot: any) => {
                                  if (chartSnapshot.exists()) {
                                    const timekeys = Object.keys(
                                      chartSnapshot.val()
                                    );
                                    const length = timekeys.length;
                                    const timestamp = timekeys[length - 1];

                                    const dateObj = new Date(Number(timestamp));

                                    const chartdate = dateObj
                                      .getDate()
                                      .toString()
                                      .padStart(2, "0");
                                    const chartmonth = (dateObj.getMonth() + 1)
                                      .toString()
                                      .padStart(2, "0");

                                    const chartyear = dateObj.getFullYear();

                                    if (
                                      chartdate === date &&
                                      chartmonth === month &&
                                      chartyear === year
                                    ) {
                                      const totalNew = ref(
                                        database1,
                                        `GAME CHART/${gameId}/${timestamp}`
                                      );

                                      const promis3 = update(totalNew, {
                                        OPEN: openFormResult,
                                        MID: midResult,
                                        CLOSE: "✦✦✦",
                                      });
                                      promises.push(promis3);
                                    } else {
                                      const promise3 = set(totalNewRef, {
                                        OPEN: openFormResult,
                                        MID: midResult,
                                        CLOSE: "✦✦✦",
                                      });
                                      promises.push(promise3);
                                    }
                                  } else {
                                    set(totalNewRef, {
                                      OPEN: openFormResult,
                                      MID: midResult,
                                      CLOSE: "✦✦✦",
                                    });
                                  }
                                }
                              );
                              promises.push(promise);
                              sendNotificationToTopic(
                                gameName,
                                `${openFormResult}-${midResult}-✦✦✦`,
                                firebaseConfig.val().authorizationKey
                              );
                            }
                          });
                        }
                      });
                      promises.push(promise1);
                    }
                  });

                  promises.push(promise5);
                }
              });
            }
          });
        }

        await Promise.all(promises);

        setOpenClose(false);
        toast.success("Open Result updated successfully");
        toast.success("Rewards distributed");
      } catch (error) {
        console.log("Error in submitting", error);
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
          `RESULTS/${gameId}/${year}/${month}/${date}`
        );

        const gameNameRef = ref(database, `RESULTS/${gameId}/NAME`);
        const gamenameSnapshot = await get(gameNameRef);

        const gameName = gamenameSnapshot.val();

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

            const panel = getGameName(closeFormResult);
            const shortPanel = getGameAbbreviation(panel);

            const halfSangam1 = `${open}-${singleClose}`;

            const halfSangam2 = `${singleOpen}-${closeFormResult}`;

            const fullSangam = `${open}-${midResult}-${closeFormResult}`;

            await update(resultRef, {
              MID: midResult,
              CLOSE: closeFormResult,
            });

            const promises: Promise<void>[] = [];

            const dbRef = ref(database, "FIREBASE CONFIGURATIONS");
            const appRef = ref(database, `RESULTS/${gameId}/APP`);
            const appSnapshot = await get(appRef);
            const dbSnapshot = await get(dbRef);

            if (appSnapshot.exists()) {
              appSnapshot.forEach((app) => {
                if (dbSnapshot.exists()) {
                  dbSnapshot.forEach((firebaseConfig) => {
                    if (
                      app.val() === firebaseConfig.val().name &&
                      !firebaseConfig.val().disable
                    ) {
                      const firebaseConfig1 = firebaseConfig.val();

                      const app1 = initializeApp(
                        firebaseConfig1,
                        `${app.val()}`
                      );
                      const database1 = getDatabase(app1);

                      const gameNameRef = ref(database1, "GAMES");

                      const promise1 = get(gameNameRef).then((gameSnapshot) => {
                        if (gameSnapshot.exists()) {
                          gameSnapshot.forEach((gameKey) => {
                            if (gameName === gameKey.val().NAME) {
                              const gameId = gameKey.key;

                              const bidRate = ref(database1, "ADMIN/GAME RATE");

                              const promise4 = get(bidRate).then(
                                (bidSnapshot) => {
                                  if (bidSnapshot.exists()) {
                                    const SDRate = bidSnapshot
                                      .child("SD")
                                      .val();
                                    const panelRate = bidSnapshot
                                      .child(`${shortPanel}`)
                                      .val();

                                    const HSRate = bidSnapshot
                                      .child("HS")
                                      .val();
                                    const FSRate = bidSnapshot
                                      .child("FS")
                                      .val();
                                    const JDRate = bidSnapshot
                                      .child("JD")
                                      .val();

                                    const bidArray = [
                                      "Single Digit",
                                      "Jodi Digit",
                                      `${panel}`,
                                      "Half SangamO",
                                      "Half SangamC",
                                      "Full Sangam",
                                    ];

                                    for (
                                      let index = 0;
                                      index < bidArray.length;
                                      index++
                                    ) {
                                      const element = bidArray[index];

                                      const userDetailsRef = ref(
                                        database1,
                                        `TOTAL TRANSACTION/BIDS/${year}/${month}/${date}/${gameId}/${
                                          element === "Single Digit" ||
                                          element === panel
                                            ? "CLOSE"
                                            : "OPEN"
                                        }/${
                                          element === "Half SangamO" ||
                                          element === "Half SangamC"
                                            ? "Half Sangam"
                                            : element
                                        }/${
                                          element === "Single Digit"
                                            ? singleClose
                                            : element === "Jodi Digit"
                                            ? midResult
                                            : element === panel
                                            ? closeFormResult
                                            : element === "Half SangamO"
                                            ? halfSangam1
                                            : element === "Half SangamC"
                                            ? halfSangam2
                                            : fullSangam
                                        }/USERS`
                                      );

                                      const promise5 = get(userDetailsRef).then(
                                        (userSnapshot) => {
                                          if (userSnapshot.exists()) {
                                            console.log(userSnapshot.val());
                                            userSnapshot.forEach((phone) => {
                                              const phoneNumber = phone.key;
                                              const points = phone.val();
                                              const close = "CLOSE";
                                              const open = "OPEN";

                                              const promise6 = sendRewards(
                                                database1,
                                                phoneNumber,
                                                points,
                                                element,
                                                element === "Single Digit"
                                                  ? SDRate
                                                  : element === "Jodi Digit"
                                                  ? JDRate
                                                  : element === panel
                                                  ? panelRate
                                                  : element ===
                                                      "Half SangamO" ||
                                                    element === "Half SangamC"
                                                  ? HSRate
                                                  : FSRate,
                                                element === "Single Digit"
                                                  ? singleClose
                                                  : element === "Jodi Digit"
                                                  ? midResult
                                                  : element === panel
                                                  ? closeFormResult
                                                  : element === "Half SangamO"
                                                  ? halfSangam1
                                                  : element === "Half SangamC"
                                                  ? halfSangam2
                                                  : fullSangam,
                                                element === "Single Digit" ||
                                                  element === panel
                                                  ? close
                                                  : open,
                                                gameId
                                              );

                                              promises.push(promise6);
                                            });
                                          }
                                        }
                                      );
                                      promises.push(promise5);
                                    }
                                  }
                                }
                              );
                              promises.push(promise4);

                              const newResultRef = ref(
                                database1,
                                `RESULTS/${gameId}/${year}/${month}/${date}`
                              );

                              const timestamp = Date.now();

                              const totalRef = ref(
                                database1,
                                `GAME CHART/${gameId}`
                              );
                              const totalNewRef = ref(
                                database1,
                                `GAME CHART/${gameId}/${timestamp}`
                              );

                              const promise2 = update(newResultRef, {
                                MID: midResult,
                                CLOSE: closeFormResult,
                              });
                              promises.push(promise2);

                              const promise = get(totalRef).then(
                                (chartSnapshot: any) => {
                                  if (chartSnapshot.exists()) {
                                    const timekeys = Object.keys(
                                      chartSnapshot.val()
                                    );
                                    const length = timekeys.length;
                                    const timestamp = timekeys[length - 1];

                                    const dateObj = new Date(Number(timestamp));

                                    const chartdate = dateObj
                                      .getDate()
                                      .toString()
                                      .padStart(2, "0");
                                    const chartmonth = (dateObj.getMonth() + 1)
                                      .toString()
                                      .padStart(2, "0");

                                    const chartyear = dateObj.getFullYear();

                                    if (
                                      chartdate === date &&
                                      chartmonth === month &&
                                      chartyear === year
                                    ) {
                                      const totalNew = ref(
                                        database1,
                                        `GAME CHART/${gameId}/${timestamp}`
                                      );

                                      const promis2 = update(totalNew, {
                                        OPEN: open,
                                        MID: midResult,
                                        CLOSE: closeFormResult,
                                      });
                                      promises.push(promis2);
                                    } else {
                                      const promise3 = set(totalNewRef, {
                                        OPEN: open,
                                        MID: midResult,
                                        CLOSE: closeFormResult,
                                      });
                                      promises.push(promise3);
                                    }
                                  } else {
                                    set(totalNewRef, {
                                      OPEN: open,
                                      MID: midResult,
                                      CLOSE: closeFormResult,
                                    });
                                  }
                                }
                              );
                              promises.push(promise);
                              sendNotificationToTopic(
                                gameName,
                                `${open}-${midResult}-${closeFormResult}`,
                                firebaseConfig.val().authorizationKey
                              );
                            }
                          });
                        }
                      });
                      promises.push(promise1);
                    }
                  });
                }
              });
            }

            await Promise.all(promises);

            toast.success("Close Result updated successfully");
            toast.success("Rewards distributed");
            setOpenClose(false);
          }
        });
      } catch (error) {
        console.log("Error in submitting", error);
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

export default OpenCloseOption;
