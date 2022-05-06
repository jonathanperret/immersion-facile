import { SuccessFeedbackKind } from "src/app/components/SubmitFeedback";
import { RootState } from "src/core-logic/storeConfig/store";

export type SubmitFeedbackStatus = SuccessFeedbackKind | Error | null;

const submitFeedbackStatus =
    (root: RootState): SuccessFeedbackKind | Error | null => root.immersionApplication.submitFeedbackStatus;


export const immersionApplicationSelectors = {
    submitFeedbackStatus
}