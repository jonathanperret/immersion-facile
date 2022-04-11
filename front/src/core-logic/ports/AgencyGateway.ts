import {
  AgencyId,
  AgencyInListDto,
  CreateAgencyConfig,
} from "shared/src/agency/agency.dto";
import { LatLonDto } from "shared/src/latLon";

export interface AgencyGateway {
  addAgency: (params: CreateAgencyConfig) => Promise<void>;
  listAgencies(position: LatLonDto): Promise<AgencyInListDto[]>;
  getImmersionFacileAgencyId(): Promise<AgencyId>;
}
