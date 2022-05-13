import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ImmersionApplicationDto } from "shared/src/ImmersionApplication/ImmersionApplication.dto";
import { SuccessFeedbackKind } from "src/app/components/SubmitFeedback";
import { ActionOfSlice } from "src/core-logic/storeConfig/redux.helpers";

interface ImmersionApplicationState {
  submitFeedbackStatus: SuccessFeedbackKind | Error | null;
  isSaving: boolean;
}

const initialState: ImmersionApplicationState = {
  submitFeedbackStatus: null,
  isSaving: false,
};

export const immersionApplicationSlice = createSlice({
  name: "immersionApplication",
  initialState,
  reducers: {
    addImmersionApplicationRequested: (
      state,
      _action: PayloadAction<ImmersionApplicationDto>,
    ) => {
      state.isSaving = true;
    },
    addImmersionApplicationSucceeded: (
      state,
    ) => {
      state.submitFeedbackStatus = "justSubmitted"
      state.isSaving = false;
    },
  },
});

export type ImmersionApplicationAction = ActionOfSlice<
  typeof immersionApplicationSlice
>;
