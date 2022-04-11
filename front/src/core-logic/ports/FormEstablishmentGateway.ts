import { FormEstablishmentDto } from "shared/src/formEstablishment/FormEstablishment.dto";
import { SiretDto } from "shared/src/siret";

export interface FormEstablishmentGateway {
  addFormEstablishment: (
    establishment: FormEstablishmentDto,
  ) => Promise<SiretDto>;
  getSiretAlreadyExists(siret: SiretDto): Promise<boolean>;
  requestEmailToEditForm(siret: SiretDto): Promise<void>;
  getFormEstablishmentFromJwt: (jwt: string) => Promise<FormEstablishmentDto>;
  updateFormEstablishment: (
    establishment: FormEstablishmentDto,
    jwt: string,
  ) => Promise<void>;
}
