import { FormEstablishmentDto } from "src/shared/FormEstablishmentDto";
import { AppellationMatch } from "src/../../../../back/src/shared/romeAndAppelationDtos/rome";
import { SiretDto } from "src/shared/siret";

export interface FormEstablishmentGateway {
  addFormEstablishment: (
    establishment: FormEstablishmentDto,
  ) => Promise<SiretDto>;
  searchAppellation: (searchText: string) => Promise<AppellationMatch[]>;
  getSiretAlreadyExists(siret: SiretDto): Promise<boolean>;
  requestEmailToEditForm(siret: SiretDto): Promise<void>;
}
