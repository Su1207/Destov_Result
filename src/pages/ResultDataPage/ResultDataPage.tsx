// import ResultData from "../../components/ResultData/ResultData";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import ResultData from "../../components/ResultData/ResultData";
import dayjs from "dayjs";
import { useBidDetailsContext } from "../../components/BidData/BidDetailsContext";
import { useEffect } from "react";

const ResultDataPage = () => {
  const { winDate, setWinDate } = useBidDetailsContext();

  const [date, month, year] = [
    winDate?.date(),
    winDate?.month(),
    winDate?.year(),
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  return (
    <div className="bidDataPage">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DemoContainer components={["MobileDatePicker"]}>
          <DemoItem>
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold ">Select Date</div>
              <MobileDatePicker
                value={winDate}
                onChange={(newValue) => setWinDate(newValue)}
                maxDate={dayjs()}
              />
            </div>
          </DemoItem>
          {/* <DemoItem>
            <DateCalendar
              value={selectedDate}
              onChange={(newValue: Dayjs) => handleDateChange(newValue)}
              maxDate={dayjs()} // Prevent selecting dates beyond today
            />
          </DemoItem> */}
        </DemoContainer>
      </LocalizationProvider>
      <ResultData year={year} month={month} date={date} />
    </div>
  );
};

export default ResultDataPage;
