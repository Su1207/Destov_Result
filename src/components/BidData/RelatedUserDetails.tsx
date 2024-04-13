import { useEffect, useRef } from "react";
import { ClickPosition, UserDetailsType } from "./BidDetails";
import ClearIcon from "@mui/icons-material/Clear";
import { CircularProgress } from "@mui/material";

interface UserDetailsProps {
  loading: boolean;
  userBidData: UserDetailsType;
  setClickedNumber: React.Dispatch<React.SetStateAction<boolean>>;
  bidNumber: string;
  clickPosition: ClickPosition | null;
}
const RelatedUserDetails: React.FC<UserDetailsProps> = ({
  loading,
  userBidData,
  setClickedNumber,
  bidNumber,
  clickPosition,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Update the position of the modal when clickPosition changes
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.style.left = `${clickPosition?.x}px`;
      modalRef.current.style.top = `${clickPosition?.y}px`;
    }
  }, [clickPosition]);

  console.log(userBidData);

  return (
    <div
      className="w-full min-h-[100vh] absolute top-0 left-0 bg-[#000000b9] flex justify-center items-center z-10 overflow-x-hidden"
      style={{ top: `${clickPosition?.y}px` }}
    >
      {!loading ? (
        <div className="w-[90%] sm:w-[80%] lg:w-[45%] opacity-100 p-5 sm:p-8 bg-gray-50 relative transition-all duration-300 ease-in-out rounded-md">
          <div
            onClick={() => setClickedNumber(false)}
            className="absolute top-2 right-2 cursor-pointer"
          >
            <ClearIcon />
          </div>
          <div className="mb-4 text-xl font-bold">
            User Details
            <span className="ml-2 text-sm font-medium">
              (BID - {bidNumber})
            </span>
          </div>
          <div>
            {Object.entries(userBidData).map(([key, userData]) => (
              <div key={key} className=" mb-4">
                <div className=" font-bold mb-2 capitalize">{key}</div>
                {userData.map((userDetail, index) => (
                  <div key={index} className=" flex items-cen justify-between">
                    <div className=" font-semibold capitalize">
                      {userDetail.userName}{" "}
                      <span className=" font-medium">
                        ({userDetail.phoneNumber})
                      </span>
                    </div>
                    <div>{userDetail.points} &#8377;</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full h-[100vh] flex items-center justify-center">
          <CircularProgress color="secondary" />
        </div>
      )}
    </div>
  );
};

export default RelatedUserDetails;
