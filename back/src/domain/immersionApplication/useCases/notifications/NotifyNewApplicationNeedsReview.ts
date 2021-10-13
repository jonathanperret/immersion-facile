import { AgencyCode } from "../../../../shared/agencies";
import { ImmersionApplicationDto } from "../../../../shared/ImmersionApplicationDto";
import { Role } from "../../../../shared/tokens/MagicLinkPayload";
import { createLogger } from "../../../../utils/logger";
import { UseCase } from "../../../core/UseCase";
import { AgencyRepository } from "../../ports/AgencyRepository";
import { EmailGateway } from "../../ports/EmailGateway";
import { generateMagicLinkString } from "../notifications/NotificationsHelper";

const logger = createLogger(__filename);

// To delete just after merge, this code must not exist after 13th October 2021!
type AgencyConfig = {
  counsellorEmails: string[];
  adminEmails: string[];
  allowUnrestrictedEmailSending: boolean;
  questionnaireUrl: string;
  signature: string;
};

export class NotifyImmersionApplicationNeedsReview
  implements UseCase<ImmersionApplicationDto>
{
  constructor(
    private readonly emailGateway: EmailGateway,
    private readonly agencyRepository: AgencyRepository,
    private readonly agencyCode: AgencyCode,
  ) {}

  public async execute(
    immersionApplicationDto: ImmersionApplicationDto,
  ): Promise<void> {
    let targetMailRecicipients: string[];
    let immersionApplicationReviewerRole: Role;
    const agencyConfig = await this.agencyRepository.getConfig(this.agencyCode);

    if (!agencyConfig) {
      logger.error(
        { agencyCode: this.agencyCode },
        "No Agency Config found for this agency code",
      );
      return;
    }

    if (agencyConfig.counsellorEmails.length > 0) {
      targetMailRecicipients = agencyConfig.counsellorEmails;
      immersionApplicationReviewerRole = "counsellor";
    } else {
      targetMailRecicipients = agencyConfig.validatorEmails;
      immersionApplicationReviewerRole = "validator";
    }

    logger.info(
      {
        recipients: targetMailRecicipients,
        immersionId: immersionApplicationDto.id,
      },
      "Sending Mail to review an immersion",
    );

    await this.emailGateway.sendNewApplicationForReviewNotification(
      targetMailRecicipients,
      {
        businessName: immersionApplicationDto.businessName,
        magicLink: generateMagicLinkString(
          immersionApplicationDto.id,
          immersionApplicationReviewerRole,
        ),
        beneficiaryFirstName: immersionApplicationDto.firstName,
        beneficiaryLastName: immersionApplicationDto.lastName,
        agencySignature: agencyConfig.signature,
      },
    );

    logger.info(
      {
        recipients: targetMailRecicipients,
        immersionId: immersionApplicationDto.id,
      },
      " Mail to review an immersion sent",
    );
  }
}
