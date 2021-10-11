import { ENV } from "../../../../adapters/primary/environmentVariables";
import { ImmersionApplicationDto } from "../../../../shared/ImmersionApplicationDto";
import { frontRoutes } from "../../../../shared/routes";
import {
  createMagicLinkPayload,
  MagicLinkPayload,
} from "../../../../shared/tokens/MagicLinkPayload";
import { createLogger } from "../../../../utils/logger";
import { generateJwt } from "../../../auth/jwt";
import { UseCase } from "../../../core/UseCase";
import { EmailGateway } from "../../ports/EmailGateway";

const logger = createLogger(__filename);
export class NotifyToTeamApplicationSubmittedByBeneficiary
  implements UseCase<ImmersionApplicationDto>
{
  constructor(
    private readonly emailGateway: EmailGateway,
    private readonly immersionFacileContactEmail: string | undefined,
  ) {}

  public async execute({
    id,
    email,
    firstName,
    lastName,
    dateStart,
    dateEnd,
    businessName,
  }: ImmersionApplicationDto): Promise<void> {
    if (!this.immersionFacileContactEmail) {
      logger.info({ demandeId: id, email }, "No immersionFacileContactEmail");
      return;
    }

    const immersionFacileBaseURL = ENV.baseURL;
    const magicLinkString: string =
      immersionFacileBaseURL +
      `/${frontRoutes.immersionApplicationsToValidate}?jwt=` +
      generateJwt(createMagicLinkPayload(id, "establishment"));
    console.log(`magicLinkString IS ${magicLinkString}`);

    await this.emailGateway.sendNewApplicationAdminNotification(
      [this.immersionFacileContactEmail],
      {
        demandeId: id,
        firstName,
        lastName,
        dateStart,
        dateEnd,
        businessName,
        magicLink: magicLinkString,
      },
    );
  }
}
