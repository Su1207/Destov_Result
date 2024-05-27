import { createSlice } from "@reduxjs/toolkit";

interface PermissionsState {
  user: any;
}

// Define the initial state using that type
const initialState: PermissionsState = {
  user: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUserData, clearUser } = userSlice.actions;

export default userSlice.reducer;
