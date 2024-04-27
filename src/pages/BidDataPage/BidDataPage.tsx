import BidData from "../../components/BidData/BidData";
import dayjs from "dayjs";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import "./BidDataPage.scss";
import { useBidDetailsContext } from "../../components/BidData/BidDetailsContext";

const BidDataPage = () => {
  const { value, setValue } = useBidDetailsContext();

  const [date, month, year] = [value?.date(), value?.month(), value?.year()];

  //   const handleDateChange = (date: Dayjs) => {
  //     if (date && date.isAfter(dayjs(), "day")) {
  //       // If selected date is beyond today, do not update the state
  //       return;
  //     }
  //     setSelectedDate(date);
  //     // Extracting date, month, and year separately
  //     if (date) {
  //       const selectedDate = date.date();
  //       const selectedMonth = date.month() + 1; // Month is 0-indexed, so adding 1
  //       const selectedYear = date.year();
  //       console.log("Selected Date:", selectedDate);
  //       console.log("Selected Month:", selectedMonth);
  //       console.log("Selected Year:", selectedYear);
  //     }
  //   };

  return (
    <div className="bidDataPage">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DemoContainer components={["MobileDatePicker"]}>
          <DemoItem>
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold ">Select Date</div>
              <MobileDatePicker
                value={value}
                onChange={(newValue) => setValue(newValue)}
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

      <BidData date={date} month={month} year={year} />
    </div>
  );
};

export default BidDataPage;
