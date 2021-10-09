import {
  ApplicationSource,
  ImmersionApplicationDto,
} from "../../../../shared/ImmersionApplicationDto";
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
    private readonly validationStructure: string,
    private readonly reason: string,
    private readonly emailAllowList: Readonly<Set<string>>,
    private readonly unrestrictedEmailSendingSources: Readonly<
      Set<ApplicationSource>
    >,
    private readonly counsellorEmails: Readonly<
      Record<ApplicationSource, string[]>
    >,
  ) {}

  public async execute(dto: ImmersionApplicationDto): Promise<void> {
    let recipients = [
      dto.email,
      dto.mentorEmail,
      ...(this.counsellorEmails[dto.source] || []),
    ];
    if (!this.unrestrictedEmailSendingSources.has(dto.source)) {
      recipients = recipients.filter((email) => {
        if (!this.emailAllowList.has(email)) {
          logger.info(`Skipped sending email to: ${email}`);
          return false;
        }
        return true;
      });
    }

    if (recipients.length > 0) {
      await this.emailGateway.sendRejecteddApplicationNotification(
        recipients,
        getRejecteddApplicationNotificationParams(
          dto,
          this.reason,
          this.validationStructure,
        ),
      );
    } else {
      logger.info(
        {
          id: dto.id,
          recipients,
          source: dto.source,
          reason: this.reason,
          structure: this.validationStructure,
        },
        "Sending validation confirmation email skipped.",
      );
    }
  }
}

// Visible for testing.
export const getRejecteddApplicationNotificationParams = (
  dto: ImmersionApplicationDto,
  reason: string,
  validationStructure: string,
): RejectedApplicationNotificationParams => {
  return {
    beneficiaryFirstName: dto.firstName,
    beneficiaryLastName: dto.lastName,
    businessName: dto.businessName,
    reason: reason,
    validationStructure: validationStructure,
  };
};
