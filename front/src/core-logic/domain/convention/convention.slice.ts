import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ConventionAdminReadDto } from "shared/src/convention/convention.dto";

export interface ConventionState {
  isLoading: boolean;
  convention: ConventionAdminReadDto | null;
  error: string | null;
}

const initialState: ConventionState = {
  convention: null,
  isLoading: false,
  error: null,
};

export const conventionSlice = createSlice({
  name: "convention",
  initialState,
  reducers: {
    conventionRequested: (state, _action: PayloadAction<string>) => {
      state.isLoading = true;
    },
    conventionSucceeded: (
      state,
      action: PayloadAction<ConventionAdminReadDto | undefined>,
    ) => {
      state.convention = action.payload ?? null;
      state.isLoading = false;
    },
    conventionFailed: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});
