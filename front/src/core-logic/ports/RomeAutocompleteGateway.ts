import {
  AppellationMatchDto,
  RomeDto,
} from "shared/src/romeAndAppellationDtos/romeAndAppellation.dto";

export interface RomeAutocompleteGateway {
  getRomeDtoMatching: (searchText: string) => Promise<RomeDto[]>;
  getAppellationDtoMatching: (
    searchText: string,
  ) => Promise<AppellationMatchDto[]>;
}
