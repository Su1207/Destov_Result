import { createSlice } from "@reduxjs/toolkit";

// Define the initial state using that type

interface ResultProps {
  result: any;
}

const initialState: ResultProps = {
  result: null,
};

const resultSlice = createSlice({
  name: "result",
  initialState,
  reducers: {
    setResultData: (state, action) => {
      state.result = action.payload;
    },
    clearResult: (state) => {
      state.result = null;
    },
  },
});

export const { setResultData, clearResult } = resultSlice.actions;

export default resultSlice.reducer;

// Define the initial state using that type
