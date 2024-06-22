import { Dialog, Transition } from "@headlessui/react";
import { Fragment, RefObject, useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { ref, set } from "firebase/database";
import { database } from "../../firebase";
import { toast } from "react-toastify";

interface UploadResultModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  cancelButtonRef: RefObject<HTMLButtonElement>;
  gameKey: string;
}

interface DataRow {
  date: string;
  openResult: string;
  closeResult: string;
}

const UploadResultModal: React.FC<UploadResultModalProps> = ({
  open,
  setOpen,
  cancelButtonRef,
  gameKey,
}) => {
  const [data, setData] = useState<DataRow[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (arrayBuffer) {
          const workbook = XLSX.read(new Uint8Array(arrayBuffer), {
            type: "array",
          });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

          const formattedData: DataRow[] = jsonData.map((row) => ({
            date: format(
              new Date((row.date - (25567 + 2)) * 86400 * 1000),
              "dd-MM-yyyy"
            ),
            openResult: String(row.openResult),
            closeResult: row.closeResult ? String(row.closeResult) : "✦✦✦",
          }));

          setData(formattedData);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  console.log(data);

  const handleUpload = async () => {
    try {
      if (data) {
        data.forEach(async (dateObj) => {
          const [date, month, year] = dateObj.date.split("-");

          const singleOpen = `${
            (parseInt(dateObj.openResult[0]) +
              parseInt(dateObj.openResult[1]) +
              parseInt(dateObj.openResult[2])) %
            10
          }`;

          const singleClose =
            dateObj.closeResult === "✦✦✦"
              ? "✦"
              : `${
                  (parseInt(dateObj.closeResult[0]) +
                    parseInt(dateObj.closeResult[1]) +
                    parseInt(dateObj.closeResult[2])) %
                  10
                }`;

          const mid = `${singleOpen}${singleClose}`;

          const resultRef = ref(
            database,
            `WEBSITE GAMES/${gameKey}/RESULT/${year}/${month}/${date}`
          );

          await set(resultRef, {
            OPEN: dateObj.openResult,
            MID: mid,
            CLOSE: dateObj.closeResult,
          });
        });

        setOpen(false);
        toast.success("Result uploaded!!!");
      }
    } catch (err) {
      console.log(err);
      toast.error("Error in uploading result");
    }
  };

  return (
    <div>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          initialFocus={cancelButtonRef}
          onClose={setOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <ExclamationTriangleIcon
                          className="h-6 w-6 text-red-600"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-base font-semibold leading-6 text-gray-900"
                        >
                          Upload Bulk Result
                        </Dialog.Title>
                        <div className="mt-2">
                          <div className="container mx-auto">
                            <input
                              type="file"
                              accept=".xlsx, .xls"
                              onChange={handleFileUpload}
                              className="my-4 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      onClick={handleUpload}
                      className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                    >
                      Upload
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => setOpen(false)}
                      ref={cancelButtonRef}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};

export default UploadResultModal;
