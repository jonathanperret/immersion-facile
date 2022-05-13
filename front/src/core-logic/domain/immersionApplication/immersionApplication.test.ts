import { Store } from "@reduxjs/toolkit";
import { ImmersionApplicationDto } from "shared/src/ImmersionApplication/ImmersionApplication.dto";
import {
  immersionApplicationSelectors
} from "src/core-logic/domain/immersionApplication/immersionApplication.selectors";
import { immersionApplicationSlice } from "src/core-logic/domain/immersionApplication/immersionApplication.slice";
import { createTestStore, TestDependencies } from "src/core-logic/storeConfig/createTestStore";
import { expectToEqual } from "src/core-logic/storeConfig/redux.helpers";
import { RootState, } from "src/core-logic/storeConfig/store";

describe("Playing with immersion application", () => {

  let store: Store<RootState>;
  let dependencies: TestDependencies;

  beforeEach(() => {
    ({ store, dependencies } = createTestStore());
  });

  it("When no application has been submitted, there is no feedback", () => {
    expectToEqual(immersionApplicationSelectors.submitFeedbackStatus(store.getState()), null);
  });

  it("When an application has been submitted successfully, show feedback", () => {
    store.dispatch(
        immersionApplicationSlice.actions.addImmersionApplicationSucceeded(),
    );
    expectToEqual(immersionApplicationSelectors.submitFeedbackStatus(store.getState()), "justSubmitted");
  });

  it("When an application has been submitted and it should trigger gateway and show success", () => {
    const immersionApplication = {
      id: 'mon-super-id',
    } as ImmersionApplicationDto;

    store.dispatch(
        immersionApplicationSlice.actions.addImmersionApplicationRequested(immersionApplication),
    );
    dependencies.immersionApplicationGateway.addResponse$.next("truc");
    expectToEqual(immersionApplicationSelectors.submitFeedbackStatus(store.getState()), "justSubmitted");
  });


});
