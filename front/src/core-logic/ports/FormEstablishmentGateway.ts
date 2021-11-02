import {
  FormEstablishmentDto,
  FormEstablishmentId,
} from "src/shared/FormEstablishmentDto";
import { RomeSearchResponseDto } from "src/shared/rome";

export interface FormEstablishmentGateway {
  addFormEstablishment: (
    establishment: FormEstablishmentDto,
  ) => Promise<FormEstablishmentId>;
  // includeAppelation defaults to true.
  searchProfession: (
    searchText: string,
    includeAppelation?: boolean,
  ) => Promise<RomeSearchResponseDto>;
}
