import { useSelector } from "react-redux";

const Website = () => {
  const result = useSelector((state: any) => state.result.result);

  return (
    <div className=" w-full">
      <div className=" bg-blue-100 m-4 rounded-md">
        {result &&
          result.map((data: any, index: number) => (
            <div key={index}>
              <div
                className="flex items-center justify-between px-8 py-8"
                style={{ backgroundColor: data?.COLOR || "inherit" }}
              >
                <h3 className=" text-2xl font-semibold">{data.NAME}</h3>
                <p className=" text-xl ">{data.RESULT}</p>
              </div>
              <div className=" border w-full h-0 border-red-600 "></div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Website;
