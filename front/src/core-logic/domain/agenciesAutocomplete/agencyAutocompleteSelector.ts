import { RootState } from "src/core-logic/storeConfig/store";

export const agencyAutocompleteSelector = ({ agencyAutocomplete }: RootState) =>
  agencyAutocomplete;
