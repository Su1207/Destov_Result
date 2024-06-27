import { get, ref, set } from "firebase/database";
import { database } from "../../firebase";

// Function to clear luckyNo values at midnight
const clearLuckyNoDaily = () => {
  // Get the current date and time
  const now = new Date();

  // Calculate the time remaining until the next midnight
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );
  const timeUntilMidnight = nextMidnight.getTime() - now.getTime();

  // Function to clear luckyNo values
  const clearLuckyNo = async () => {
    try {
      // Reference to the WEBSITE GAMES path
      const gamesRef = ref(database, "WEBSITE GAMES");

      // Iterate through each game and clear the LUCKY_NO value
      const snapshot = await get(gamesRef);
      snapshot.forEach((gameSnapshot) => {
        const gameKey = gameSnapshot.key;
        const luckyNoRef = ref(database, `WEBSITE GAMES/${gameKey}/LUCKY_NO`);
        set(luckyNoRef, null);
      });

      console.log("LuckyNo values cleared successfully");
    } catch (error) {
      console.error("Error clearing LuckyNo values:", error);
    }
  };

  // Set a timeout to clear the luckyNo values at the next midnight
  setTimeout(() => {
    clearLuckyNo();

    // Set an interval to clear the luckyNo values every 24 hours thereafter
    setInterval(clearLuckyNo, 24 * 60 * 60 * 1000);
  }, timeUntilMidnight);
};

export default clearLuckyNoDaily;
