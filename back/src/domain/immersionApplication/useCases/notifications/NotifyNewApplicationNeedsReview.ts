import type { GenerateVerificationMagicLink } from "../../../../adapters/primary/config";
import {
  ApplicationStatus,
  ImmersionApplicationDto,
} from "shared/src/ImmersionApplication/ImmersionApplication.dto";
import { frontRoutes } from "shared/src/routes";
import { Role } from "shared/src/tokens/MagicLinkPayload";
import { createLogger } from "../../../../utils/logger";
import { UseCase } from "../../../core/UseCase";
import { AgencyConfig, AgencyRepository } from "../../ports/AgencyRepository";
import { EmailGateway } from "../../ports/EmailGateway";
import { immersionApplicationSchema } from "shared/src/ImmersionApplication/immersionApplication.schema";

const logger = createLogger(__filename);

export class NotifyNewApplicationNeedsReview extends UseCase<ImmersionApplicationDto> {
  constructor(
    private readonly emailGateway: EmailGateway,
    private readonly agencyRepository: AgencyRepository,
    private readonly generateMagicLinkFn: GenerateVerificationMagicLink,
  ) {
    super();
  }

  inputSchema = immersionApplicationSchema;

  public async _execute(
    immersionApplicationDto: ImmersionApplicationDto,
  ): Promise<void> {
    const agencyConfig = await this.agencyRepository.getById(
      immersionApplicationDto.agencyId,
    );

    if (!agencyConfig) {
      logger.error(
        { agencyId: immersionApplicationDto.agencyId },
        "No Agency Config found for this agency code",
      );
      return;
    }

    const recipients = determineRecipients(
      immersionApplicationDto.status,
      agencyConfig,
    );
    logger.debug(
      "immersionApplicationDto.status : " + immersionApplicationDto.status,
    );

    if (!recipients) {
      logger.error(
        {
          applicationId: immersionApplicationDto.id,
          status: immersionApplicationDto.status,
          agencyId: immersionApplicationDto.agencyId,
        },
        "Unable to find appropriate recipient for validation notification.",
      );
      return;
    }

    logger.info(
      {
        recipients,
        applicationId: immersionApplicationDto.id,
      },
      "Sending Mail to review an immersion",
    );

    await Promise.all(
      recipients.emails.map((email) =>
        this.emailGateway.sendNewApplicationForReviewNotification([email], {
          businessName: immersionApplicationDto.businessName,
          magicLink: this.generateMagicLinkFn(
            immersionApplicationDto.id,
            recipients.role,
            frontRoutes.immersionApplicationsToValidate,
            email,
          ),
          beneficiaryFirstName: immersionApplicationDto.firstName,
          beneficiaryLastName: immersionApplicationDto.lastName,
          possibleRoleAction:
            recipients.role === "counsellor"
              ? "en vérifier l'éligibilité"
              : "en considérer la validation",
        }),
      ),
    );

    logger.info(
      {
        recipients,
        immersionId: immersionApplicationDto.id,
      },
      "Mail to review an immersion sent",
    );
  }
}

type Recipients = {
  role: Role;
  emails: string[];
};

const determineRecipients = (
  status: ApplicationStatus,
  agencyConfig: AgencyConfig,
): Recipients | undefined => {
  const hasCounsellorEmails = agencyConfig.counsellorEmails.length > 0;
  const hasValidatorEmails = agencyConfig.validatorEmails.length > 0;
  const hasAdminEmails = agencyConfig.adminEmails.length > 0;

  switch (status) {
    case "IN_REVIEW": {
      if (hasCounsellorEmails)
        return { role: "counsellor", emails: agencyConfig.counsellorEmails };
      if (hasValidatorEmails)
        return { role: "validator", emails: agencyConfig.validatorEmails };
      return;
    }
    case "ACCEPTED_BY_COUNSELLOR":
      return hasValidatorEmails
        ? { role: "validator", emails: agencyConfig.validatorEmails }
        : undefined;
    case "ACCEPTED_BY_VALIDATOR":
      return hasAdminEmails
        ? { role: "admin", emails: agencyConfig.adminEmails }
        : undefined;
    default:
      // This notification may fire when using the /debug/populate route, with
      // statuses not included in the above list. Ignore this case.
      return;
  }
};
