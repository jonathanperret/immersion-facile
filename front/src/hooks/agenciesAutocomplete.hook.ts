import { useDispatch } from "react-redux";
import { AgencyIdAndName } from "shared";
import { agencyAutocompleteSlice } from "src/core-logic/domain/agenciesAutocomplete/agencyAutocomplete.slice";

export const useAgencyAutocompleteAdminUseCase = () => {
  const dispatch = useDispatch();

  return {
    updateSearchTerm: (searchTerm: string) =>
      dispatch(agencyAutocompleteSlice.actions.setAgencySearchText(searchTerm)),
    selectOption: (agencyIdAndName: AgencyIdAndName) =>
      dispatch(
        agencyAutocompleteSlice.actions.setSelectedAgency(agencyIdAndName),
      ),
  };
};
