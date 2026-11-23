import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type DAPFormState = { values: Record<string, string> };
export type DAPState = { dap: DAPFormState };

const initialState: DAPFormState = { values: {} };

export const dapSlice = createSlice({
  name: "dap",
  initialState,
  reducers: {
    setValues(state, action: PayloadAction<Record<string, string>>) {
      state.values = action.payload;
    },
    resetValues(state) {
      state.values = {};
    },
  },
});

export const { setValues, resetValues } = dapSlice.actions;
export const getValues = (state: DAPState) => state.dap.values;
export default dapSlice.reducer;