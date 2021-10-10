import { AgencyCode } from "../../../../shared/agencies";
import { ImmersionApplicationDto } from "../../../../shared/ImmersionApplicationDto";
import { createLogger } from "../../../../utils/logger";
import { UseCase } from "../../../core/UseCase";
import {
  EmailGateway,
  RejectedApplicationNotificationParams,
} from "../../ports/EmailGateway";

const logger = createLogger(__filename);
export class NotifyBeneficiaryAndEnterpriseThatApplicationIsRejected
  implements UseCase<ImmersionApplicationDto>
{
  constructor(
    private readonly emailGateway: EmailGateway,
    private readonly emailAllowList: Readonly<Set<string>>,
    private readonly unrestrictedEmailSendingAgencies: Readonly<
      Set<AgencyCode>
    >,
    private readonly counsellorEmails: Readonly<Record<AgencyCode, string[]>>,
  ) {}

  public async execute(dto: ImmersionApplicationDto): Promise<void> {
    let recipients = [
      dto.email,
      dto.mentorEmail,
      ...(this.counsellorEmails[dto.agencyCode] || []),
    ];
    if (!this.unrestrictedEmailSendingAgencies.has(dto.agencyCode)) {
      recipients = recipients.filter((email) => {
        if (!this.emailAllowList.has(email)) {
          logger.info(`Skipped sending email to: ${email}`);
          return false;
        }
        return true;
      });
    }

    if (recipients.length > 0) {
      await this.emailGateway.sendRejectedApplicationNotification(
        recipients,
        getRejecteddApplicationNotificationParams(dto, dto.agencyCode),
      );
    } else {
      logger.info(
        {
          id: dto.id,
          recipients,
          source: dto.source,
          reason: dto.rejectionReason,
        },
        "Sending validation confirmation email skipped.",
      );
    }
  }
}

// Visible for testing.
export const getSignature = (agencyCode: AgencyCode): string => {
  switch (agencyCode) {
    case "AMIE_BOULONAIS":
      return "L'équipe de l'AMIE du Boulonnais";
    case "MLJ_GRAND_NARBONNE":
      return "L'équipe de la Mission Locale de Narbonne";
    default:
      return "L'immersion facile";
  }
};
// Visible for testing.
export const getRejecteddApplicationNotificationParams = (
  dto: ImmersionApplicationDto,
  agency: string,
): RejectedApplicationNotificationParams => {
  return {
    beneficiaryFirstName: dto.firstName,
    beneficiaryLastName: dto.lastName,
    businessName: dto.businessName,
    reason: "" && dto.rejectionReason,
    signature: getSignature(dto.agencyCode),
    agency: agency,
    immersionProfession: dto.immersionProfession,
  };
};
