import { useBidDetailsContext } from "./BidDetailsContext";

const BidDetails = () => {
  const { combinebidData, open } = useBidDetailsContext();

  //   const allNumbers = combinebidData.reduce<Record<string, boolean>>(
  //     (acc, market) => {
  //       Object.keys(market.numbers).forEach((number) => {
  //         acc[number] = true;
  //       });
  //       return acc;
  //     },
  //     {}
  //   );

  // Organize data into rows
  const rows: any = Array.from(
    {
      length: Math.max(
        ...combinebidData.map((market) => Object.keys(market.numbers).length)
      ),
    },
    (_, index) => ({
      id: index + 1,
      ...combinebidData.reduce(
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

  console.log(rows);

  return (
    <div className={`${open ? "lg:w-[78%]" : "lg:w-[95%]"} `}>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg mb-8">
        {/* <div>{data.gameName}</div> */}
        <table className="w-full text-sm text-left border rtl:text-right text-gray-500 dark:text-gray-400">
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
                <td className="px-4 py-4 text-center">{row.id}</td>
                {/* Iterate over the arrangedMarketData to generate table cells */}
                {combinebidData.map((market) => (
                  <td
                    key={`${rowIndex}-${market.marketName}`}
                    className="px-4 py-4 text-center min-w-[165px]"
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
    </div>
  );
};

export default BidDetails;
