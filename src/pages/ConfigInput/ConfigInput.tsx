import { useEffect, useState } from "react";
import { database } from "../../firebase";
import { get, getDatabase, push, ref, set } from "firebase/database";
import { initializeApp } from "firebase/app";

const ConfigInput = () => {
  const [config, setConfig] = useState({
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: "",
    authorizationKey: "",
  });

  const [winData, setWinData] = useState<any>();
  const [firebases, setFirebases] = useState<any>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const data = { ...config };
      const dbRef = ref(database, "FIREBASE CONFIGURATIONS");

      const snapshot = await get(dbRef);

      const nextNodeName = `FIREBASE${snapshot.size + 1}`;

      const newDataRef = ref(
        database,
        `FIREBASE CONFIGURATIONS/${nextNodeName}`
      );

      await set(newDataRef, data);

      console.log("Data added successfully!");
    } catch (error) {
      console.error("Error adding data:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const dbRef = ref(database, "FIREBASE CONFIGURATIONS");
      const dataRef = ref(database, "RESULTS");

      const [dbSnapshot, dataSnapshot] = await Promise.all([
        get(dbRef),
        get(dataRef),
      ]);

      if (dbSnapshot.exists() && dataSnapshot.exists()) {
        setWinData(dataSnapshot.val());
        setFirebases(dbSnapshot.val());
      } else if (!dataSnapshot.exists() && dbSnapshot.exists()) {
        const newDataRef = ref(
          database,
          `FIREBASE CONFIGURATIONS/FIREBASE${dbSnapshot.size}`
        );
        const winSnapshot = await get(newDataRef);
        if (winSnapshot.exists()) {
          const firebaseConfig1 = winSnapshot.val();

          // Initialize Firebase
          const app1 = initializeApp(firebaseConfig1, `${winSnapshot.size}`);
          const database1 = getDatabase(app1);

          const game1Ref = ref(database1, "GAMES");

          const gameSnapshot = await get(game1Ref);

          if (gameSnapshot.exists()) {
            const promises: Promise<void>[] = [];
            // let gamesName: any = {};

            gameSnapshot.forEach((gameKey) => {
              const gameName = gameKey.val().NAME;

              push(dataRef, { NAME: gameName });
              // promises.push(promise);
            });

            await Promise.all(promises);
          }
        }
      }
    };
    fetchData();
  }, []);

  // useEffect(() => {
  //   const fetchWinData = async () => {
  //     try {
  //       if (addedNewConfig) {
  //         const dbRef = ref(database, "FIREBASE CONFIGURATIONS");
  //         const snapshot = await get(dbRef);
  //         const newDataRef = ref(
  //           database,
  //           `FIREBASE CONFIGURATIONS/FIREBASE${snapshot.size}`
  //         );
  //         const winSnapshot = await get(newDataRef);

  //         if (winSnapshot.exists()) {
  //           const firebaseConfig1 = {
  //             apiKey: winSnapshot.val().apiKey,
  //             authDomain: winSnapshot.val().authDomain,
  //             databaseURL: winSnapshot.val().databaseURL,
  //             projectId: winSnapshot.val().projectId,
  //             storageBucket: winSnapshot.val().storageBucket,
  //             messagingSenderId: winSnapshot.val().messagingSenderId,
  //             appId: winSnapshot.val().appId,
  //             measurementId: winSnapshot.val().measurementId,
  //           };

  //           // Initialize Firebase
  //           const app1 = initializeApp(firebaseConfig1, `${snapshot.size}`);
  //           const database1 = getDatabase(app1);

  //           const resultRef1 = ref(database1, "GAME CHART");
  //           const game1Ref = ref(database1, "GAMES");

  //           const [winDataSnapshot, marketSnapshot] = await Promise.all([
  //             get(resultRef1),
  //             get(game1Ref),
  //           ]);

  //           if (winDataSnapshot.exists()) {
  //             const promises: Promise<void>[] = [];

  //             marketSnapshot.forEach((marketsnapshot) => {
  //               const marketKey = marketsnapshot.key;
  //               const marketName = marketsnapshot.val().NAME;
  //               let gameResultData: any = {};

  //               winDataSnapshot.forEach((gamesnaphsot) => {
  //                 if (marketKey === gamesnaphsot.key) {
  //                   const dateStringResult: any = {};
  //                   gamesnaphsot.forEach((timeSnap) => {
  //                     const timestamp = timeSnap.key;
  //                     const dateString = convertTime(timestamp);
  //                     const open = timeSnap.val().OPEN;
  //                     const close = timeSnap.val().CLOSE;
  //                     const mid = timeSnap.val().MID;
  //                     const result = `${open}-${mid}-${close}`;

  //                     const gameName = winSnapshot.val().firebaseName;

  //                     dateStringResult[dateString] = { [gameName]: result };
  //                   });
  //                   gameResultData = dateStringResult;
  //                 }
  //               });

  //               const newdbRef = ref(database, `COMBINE RESULTS/${marketName}`);

  //               const promise1 = get(newdbRef).then(async (newSnapshot) => {
  //                 if (!newSnapshot.exists()) {
  //                   const promise2 = set(newdbRef, gameResultData);
  //                   promises.push(promise2);
  //                 } else {
  //                   const existingData = newSnapshot.val(); // Get existing data

  //                   const newData: any = {};

  //                   // Merge existing data with new data based on date keys
  //                   Object.keys(existingData).forEach(async (dateKey) => {
  //                     if (gameResultData[dateKey]) {
  //                       // If date key exists in both existing data and new data, combine results
  //                       newData[dateKey] = {
  //                         ...existingData[dateKey],
  //                         ...gameResultData[dateKey],
  //                       };
  //                     } else {
  //                       // If date key exists only in existing data, keep it as is
  //                       newData[dateKey] = existingData[dateKey];
  //                     }
  //                   });

  //                   // Add new dates from gameResultData that don't exist in existing data
  //                   Object.keys(gameResultData).forEach(async (dateKey) => {
  //                     if (!existingData[dateKey]) {
  //                       newData[dateKey] = gameResultData[dateKey];
  //                     }
  //                   });

  //                   const promise2 = set(newdbRef, newData); // Set the merged data to the database
  //                   promises.push(promise2);
  //                 }

  //                 promises.push(promise1);
  //               });
  //             });

  //             await Promise.all(promises);
  //           }
  //         }
  //         console.log("Data uploaded successfully");
  //         setAddedNewConfig(false);
  //       }
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };
  //   fetchWinData();
  // }, [addedNewConfig]);

  console.log(winData);
  console.log(firebases);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>API KEY</label>
        <input
          type="text"
          name="apiKey"
          value={config.apiKey}
          onChange={handleChange}
        />
        <label>AUTH DOMAIN</label>
        <input
          type="text"
          name="authDomain"
          value={config.authDomain}
          onChange={handleChange}
        />
        <label>DATABASE URL</label>
        <input
          type="text"
          name="databaseURL"
          value={config.databaseURL}
          onChange={handleChange}
        />
        <label>PROJECT ID</label>
        <input
          type="text"
          name="projectId"
          value={config.projectId}
          onChange={handleChange}
        />
        <label>STORAGE BUCKET</label>
        <input
          type="text"
          name="storageBucket"
          value={config.storageBucket}
          onChange={handleChange}
        />
        <label>MESSAGING SENDER ID</label>
        <input
          type="text"
          name="messagingSenderId"
          value={config.messagingSenderId}
          onChange={handleChange}
        />
        <label>APP ID</label>
        <input
          type="text"
          name="appId"
          value={config.appId}
          onChange={handleChange}
        />
        <label>MEASUREMENT ID</label>
        <input
          type="text"
          name="measurementId"
          value={config.measurementId}
          onChange={handleChange}
        />
        <label>SERVER KEY</label>
        <input
          type="text"
          name="authorizationKey"
          value={config.authorizationKey}
          onChange={handleChange}
        />
        <button type="submit">Submit</button>
      </form>

      {/* <div className="radio-options">
        {firebases &&
          Object.entries(firebases).map(([index, firebase]: [string, any]) => (
            <div key={index}>
              <div>
                <input type="radio" value={firebase.firebaseName} />
                {firebase.firebaseName}
              </div>
            </div>
          ))}

        {winData &&
          Object.keys(winData).map((index) => (
            <div key={index}>
              <div>
                <input type="radio" value={index} />
                {index}
              </div>
            </div>
          ))}
      </div> */}
    </div>
  );
};

export default ConfigInput;
