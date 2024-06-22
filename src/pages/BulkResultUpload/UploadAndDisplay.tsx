import React, { useEffect, useState } from "react";
import { format, parse, startOfWeek, addDays, isValid } from "date-fns";
import { onValue, ref } from "firebase/database";
import { database } from "../../firebase";

// Utility Functions
const parseDate = (dateString: string) =>
  parse(dateString, "dd-MM-yyyy", new Date());

const formatDate = (date: Date) =>
  isValid(date) ? format(date, "dd-MM-yyyy") : "Invalid Date";

const organizeDataIntoWeeks = (data: { date: string; result: string }[]) => {
  const weeks: { [weekStart: string]: { [day: string]: string } } = {};

  data.forEach((entry) => {
    const date = parseDate(entry.date);
    if (isValid(date)) {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const formattedWeekStart = formatDate(weekStart);

      if (!weeks[formattedWeekStart]) {
        weeks[formattedWeekStart] = {
          Mon: "",
          Tue: "",
          Wed: "",
          Thu: "",
          Fri: "",
          Sat: "",
          Sun: "",
        };
      }

      const dayOfWeek = format(date, "EEE");
      weeks[formattedWeekStart][dayOfWeek] = entry.result;
    }
  });

  return weeks;
};

// Main Component
const CalendarTable: React.FC<{ data: { date: string; result: string }[] }> = ({
  data,
}) => {
  const weeks = organizeDataIntoWeeks(data);

  console.log(weeks);
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <table>
      <thead>
        <tr>
          <th>Week</th>
          {weekDays.map((day) => (
            <th key={day}>{day}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Object.keys(weeks).map((weekStart) => (
          <tr key={weekStart}>
            <td className=" p-4">
              {weekStart} - {formatDate(addDays(parseDate(weekStart), 6))}
            </td>
            {weekDays.map((day) => (
              <td className="p-4" key={day}>
                {weeks[weekStart][day]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Example usage with sample data
// const sampleData = [
//   { date: "01-06-2024", result: "123-69-234" },
//   { date: "02-06-2024", result: "456-79-789" },
//   { date: "03-06-2024", result: "321-47-543" },
//   { date: "04-06-2024", result: "654-20-098" },
//   { date: "05-06-2024", result: "987-16-765" },
//   { date: "06-06-2024", result: "111-15-333" },
//   { date: "07-06-2024", result: "222-23-444" },
//   { date: "08-06-2024", result: "333-34-555" },
//   { date: "09-06-2024", result: "444-39-666" },
//   { date: "10-06-2024", result: "555-28-777" },
//   // Add more sample data as needed
// ];

interface resultProps {
  date: string;
  result: string;
}

const combineResult = (open: string, mid: string, close: string) => {
  return `${open}-${mid}-${close}`;
};

const UploadAndDisplay: React.FC<{ gameKey: string }> = ({ gameKey }) => {
  const [resultData, setResultData] = useState<resultProps[]>([]);

  useEffect(() => {
    try {
      const resultRef = ref(database, `WEBSITE GAMES/${gameKey}/RESULT`);

      const unsub = onValue(resultRef, (snapshot) => {
        if (snapshot.exists()) {
          const resultData: resultProps[] = [];
          snapshot.forEach((yearSnapshot) => {
            const year = yearSnapshot.key;
            yearSnapshot.forEach((monthSnapshot) => {
              const month = monthSnapshot.key;
              monthSnapshot.forEach((dateSnapshot) => {
                const dateString = dateSnapshot.key;
                const result = combineResult(
                  dateSnapshot.val().OPEN,
                  dateSnapshot.val().MID,
                  dateSnapshot.val().CLOSE
                );

                resultData.push({
                  date: `${dateString}-${month}-${year}`,
                  result,
                });
              });
            });
          });
          setResultData(resultData);
        }
      });

      return () => unsub();
    } catch (err) {
      console.log(err);
    }
  }, []);

  console.log(resultData);

  return (
    <div>
      <CalendarTable data={resultData} />
    </div>
  );
};

export default UploadAndDisplay;
