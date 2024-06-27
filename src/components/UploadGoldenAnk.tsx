import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { ref, set } from "firebase/database";
import { database } from "../firebase";

interface GoldenProps {
  openModal: boolean;
  cancelButtonRef: React.RefObject<HTMLButtonElement>;
  setOpenModal: (open: boolean) => void;
}

const UploadGoldenAnk: React.FC<GoldenProps> = ({
  openModal,
  cancelButtonRef,
  setOpenModal,
}) => {
  const [goldenAnk, setGoldenAnk] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Check if the value contains only numeric characters and has a maximum length of 4
    if (/^\d{0,4}$/.test(value)) {
      setGoldenAnk(value);
    }
  };

  const handleAnkSubmit = async () => {
    try {
      const dbRef = ref(database, "GOLDEN ANK");
      await set(dbRef, goldenAnk);
      toast.success("Golden Ank Uploaded successfully!");
      setOpenModal(false);
    } catch (error) {
      toast.error("Error in uloading data, try again later!");
    }
  };

  return (
    <div className="">
      <Transition.Root show={openModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          initialFocus={cancelButtonRef}
          onClose={setOpenModal}
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
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                        <ArrowUpTrayIcon
                          className="h-6 w-6 text-blue-600"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-base font-semibold leading-6 text-gray-900"
                        >
                          Upload Golden Ank
                        </Dialog.Title>
                        <div className="mt-2">
                          <div className=" flex items-center justify-center my-4 w-full">
                            <input
                              type="text"
                              className="w-full outline-none rounded-sm px-3 py-2 text-sm"
                              placeholder="Enter golden ank"
                              value={goldenAnk}
                              onChange={handleChange}
                              pattern="[0-9]"
                              title="Please enter exactly 4 numeric digits"
                              inputMode="numeric"
                              required
                              maxLength={4}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      className="inline-flex w-full justify-center rounded-md bg-blue-600 outline-none px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                      onClick={handleAnkSubmit}
                    >
                      Upload
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white outline-none px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => setOpenModal(false)}
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

export default UploadGoldenAnk;
