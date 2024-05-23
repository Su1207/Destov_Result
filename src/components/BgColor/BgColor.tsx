import { useState } from "react";
import { ChromePicker, ColorResult } from "react-color";
import { ref, set } from "firebase/database";
import { toast } from "react-toastify";
import { database } from "../../firebase";
import { useMediaQuery } from "@mui/material";

const BgColor = () => {
  const [backgroundColor, setBackgroundColor] = useState<string>("#070683");
  const [menuColor, setMenuColor] = useState<string>("#070683");

  const isSmallScreen = useMediaQuery("(max-width:550px)");

  const handleColorChange = (color: ColorResult) => {
    setBackgroundColor(color.hex);
  };

  const handleMenuColorChange = (color: ColorResult) => {
    setMenuColor(color.hex);
  };

  const handleColorSubmit = async () => {
    try {
      const colorRef = ref(database, "ADMIN/BACKGROUND_COLOR");
      await set(colorRef, { backgroundColor });
      console.log("Background Color updated successfully");
      toast.success("Background Color updated successfully");
    } catch (error) {
      console.error("Error updating color:", error);
    }
  };

  const handleMenuColorSubmit = async () => {
    try {
      const colorRef = ref(database, "ADMIN/MENU_COLOR");
      await set(colorRef, { menuColor });
      console.log("Menu Color updated successfully");
      toast.success("Menu Color updated successfully");
    } catch (error) {
      console.error("Error updating color:", error);
    }
  };

  const pickerStyles = {
    default: {
      picker: {
        width: isSmallScreen ? "300px" : "500px",
        height: isSmallScreen ? "320px" : "440px",
      },
    },
  };

  return (
    <div>
      <div className="colorPickerContainer  flex flex-col xl:flex-row items-center gap-8">
        <div className="chrome_picker relative flex flex-col items-center">
          <div className="text-xl text-center mb-1 font-bold text-gray-500">
            Menu Color
          </div>
          <ChromePicker
            color={menuColor}
            onChange={handleMenuColorChange}
            styles={pickerStyles}
          />
          <button
            className="color_button absolute bottom-3 rounded-sm font-semibold hover:bg-orange-700 transition-all duration-300 ease-in-out bg-orange-400 text-sm py-1 w-[90%]"
            onClick={handleMenuColorSubmit}
          >
            Submit Color
          </button>
        </div>
        <div className="chrome_picker relative flex flex-col items-center">
          <div className="text-xl text-center mb-1 font-bold text-gray-500">
            Background Color
          </div>
          <ChromePicker
            color={backgroundColor}
            onChange={handleColorChange}
            styles={pickerStyles}
          />
          <button
            className="color_button absolute bottom-3 rounded-sm font-semibold hover:bg-orange-700 transition-all duration-300 ease-in-out bg-orange-400 text-sm py-1 w-[90%]"
            onClick={handleColorSubmit}
          >
            Submit Color
          </button>
        </div>
      </div>
    </div>
  );
};

export default BgColor;
