import { Observable } from "rxjs";
import { AdminToken } from "shared/src/admin/admin.dto";
import { AgencyId } from "shared/src/agency/agency.dto";
import {
  ConventionStatus,
  ConventionDto,
  ConventionId,
  UpdateConventionStatusRequestDto,
  WithConventionId,
  ConventionAdminReadDto,
} from "shared/src/convention/convention.dto";
import { ShareLinkByEmailDto } from "shared/src/ShareLinkByEmailDto";
import { Role } from "shared/src/tokens/MagicLinkPayload";

export interface ConventionGateway {
  retrieveFromToken(
    payload: string,
  ): Observable<ConventionAdminReadDto | undefined>;
  add(conventionDto: ConventionDto): Promise<string>;

  // Get an immersion application through backoffice, password-protected route.
  getConventionAdminDtoById(id: ConventionId): Promise<ConventionAdminReadDto>;
  getMagicLink(jwt: string): Promise<ConventionDto>;

  update(conventionDto: ConventionDto): Promise<string>;
  updateMagicLink(conventionDto: ConventionDto, jwt: string): Promise<string>;
  // Calls validate-demande on backend.
  validate(id: ConventionId): Promise<string>;

  updateStatus(
    params: UpdateConventionStatusRequestDto,
    jwt: string,
  ): Promise<WithConventionId>;

  signApplication(jwt: string): Promise<WithConventionId>;

  getAllConventionAdminDtos(
    adminToken: AdminToken,
    agency?: AgencyId,
    status?: ConventionStatus,
  ): Promise<Array<ConventionAdminReadDto>>;

  generateMagicLink(
    adminToken: AdminToken,
    applicationId: ConventionId,
    role: Role,
    expired: boolean,
  ): Promise<string>;

  renewMagicLink(expiredJwt: string, linkFormat: string): Promise<void>;

  // shareLinkByEmailDTO
  shareLinkByEmail(shareLinkByEmailDTO: ShareLinkByEmailDto): Promise<boolean>;
}
