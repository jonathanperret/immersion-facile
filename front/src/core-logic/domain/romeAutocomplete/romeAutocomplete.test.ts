import { Store } from "@reduxjs/toolkit";
import { romeAutocompleteSelector } from "src/core-logic/domain/romeAutocomplete/romeAutocomplete.selectors";
import { romeAutocompleteSlice } from "src/core-logic/domain/romeAutocomplete/romeAutocomplete.slice";
import {
  createTestStore,
  TestDependencies,
} from "src/core-logic/storeConfig/createTestStore";
import { expectToEqual } from "src/core-logic/storeConfig/redux.helpers";
import { RootState } from "src/core-logic/storeConfig/store";
import { RomeDto } from "src/shared/romeAndAppellationDtos/romeAndAppellation.dto";

describe("Rome Autocomplete", () => {
  let store: Store<RootState>;
  let dependencies: TestDependencies;

  beforeEach(() => {
    ({ store, dependencies } = createTestStore());
  });

  it("when a searched text is provided it updates immediately", () => {
    const searchedText = "bou";
    triggerActionToSetSearchedText(searchedText);
    expectSearchTextToBe(searchedText);
  });

  it("selects one of the romeOptions", () => {
    ({ store } = createTestStore({
      romeAutocomplete: {
        selectedRome: null,
        romeOptions: [
          { romeCode: "A1000", romeLabel: "Job A" },
          { romeCode: "B1000", romeLabel: "Job B" },
        ],
        romeSearchText: "job",
        isSearching: false,
      },
    }));

    triggerActionToSelectRomeOption("B1000");
    expectSelectedRomeToEqual({ romeCode: "B1000", romeLabel: "Job B" });
  });

  it("triggers rome search when search text changes", () => {
    const searchedText = "bou";
    triggerActionToSetSearchedText(searchedText);
    expectIsSearchingToBe(false);
    fastForwardObservables();
    expectIsSearchingToBe(true);

    feedRomeAutocompleteGatewayWithRomeDtos([
      { romeCode: "A10000", romeLabel: "Mon métier" },
    ]);
    expectRomeOptionsToEqual([{ romeCode: "A10000", romeLabel: "Mon métier" }]);
    expectIsSearchingToBe(false);
  });

  it("does not trigger search if text is less than 3 characters", () => {
    triggerActionToSetSearchedText("bo");
    fastForwardObservables();
    expectIsSearchingToBe(false);
  });

  const triggerActionToSetSearchedText = (searchedText: string) => {
    store.dispatch(
      romeAutocompleteSlice.actions.setRomeSearchText(searchedText),
    );
  };

  const triggerActionToSelectRomeOption = (codeRome: string) => {
    store.dispatch(romeAutocompleteSlice.actions.setSelectedRome(codeRome));
  };

  const expectSearchTextToBe = (expected: string) => {
    expectToEqual(
      romeAutocompleteSelector(store.getState()).romeSearchText,
      expected,
    );
  };

  const expectIsSearchingToBe = (expected: boolean) => {
    expectToEqual(
      romeAutocompleteSelector(store.getState()).isSearching,
      expected,
    );
  };

  const expectSelectedRomeToEqual = (expected: RomeDto | null) => {
    expectToEqual(
      romeAutocompleteSelector(store.getState()).selectedRomeDto,
      expected,
    );
  };

  const feedRomeAutocompleteGatewayWithRomeDtos = (romeDtos: RomeDto[]) => {
    dependencies.romeAutocompleteGateway.romeDtos$.next(romeDtos);
  };

  const expectRomeOptionsToEqual = (expected: RomeDto[]) => {
    expectToEqual(
      romeAutocompleteSelector(store.getState()).romeOptions,
      expected,
    );
  };

  const fastForwardObservables = () => dependencies.scheduler.flush();
});
