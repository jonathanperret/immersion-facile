import { createSlice } from "@reduxjs/toolkit";
import { SuccessFeedbackKind } from "src/app/components/SubmitFeedback";

interface ImmersionApplicationState {
    submitFeedbackStatus: SuccessFeedbackKind | Error | null;
}

const initialState: ImmersionApplicationState = {
    submitFeedbackStatus: null,
}

export const immersionApplicationSlice = createSlice({
    name: "immersionApplication",
    initialState: {} as ImmersionApplicationState,
    reducers: {}
});

