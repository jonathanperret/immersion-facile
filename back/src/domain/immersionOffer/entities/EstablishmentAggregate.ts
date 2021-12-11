import { Position } from "../ports/GetPosition";
import { ContactV2, ImmersionOfferEntityV2 } from "./ImmersionOfferEntity";

type DataSource =
  | "api_labonneboite"
  | "api_laplateformedelinclusion"
  | "form"
  | "api_sirene";

// prettier-ignore
export type TefenCode = -1 | 0 | 1 | 2 | 3 | 11 | 12 | 21 | 22 | 31 | 32 | 41 | 42 | 51 | 52 | 53

export type EstablishmentAggregate = {
  siret: string;
  name: string;
  address: string;
  score: number; // This could represent the propensity of the establishment to welcome immersions
  voluntaryToImmersion: boolean;
  dataSource: DataSource;
  immersionOffers: ImmersionOfferEntityV2[];
  contacts: ContactV2[];
  position: Position;
  naf: string;
  numberEmployeesRange: TefenCode;
};
