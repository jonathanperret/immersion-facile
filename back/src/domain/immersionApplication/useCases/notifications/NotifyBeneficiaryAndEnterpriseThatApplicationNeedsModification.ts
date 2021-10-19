import { ImmersionApplicationDto } from "../../../../shared/ImmersionApplicationDto";
import { createLogger } from "../../../../utils/logger";
import { UseCase } from "../../../core/UseCase";
import { AgencyRepository } from "../../ports/AgencyRepository";
import {
  EmailGateway,
  ModificationRequestApplicationNotificationParams,
} from "../../ports/EmailGateway";
import { AgencyConfig } from "../../ports/AgencyRepository";
import { ImmersionApplicationRequiresModificationPayload } from "../../../core/eventBus/events";

const logger = createLogger(__filename);
export class NotifyBeneficiaryAndEnterpriseThatApplicationNeedsModification
  implements UseCase<ImmersionApplicationRequiresModificationPayload>
{
  constructor(
    private readonly emailGateway: EmailGateway,
    private readonly emailAllowList: Readonly<Set<string>>,
    private readonly agencyRepository: AgencyRepository,
  ) {}

  public async execute({
    application,
    reason,
  }: ImmersionApplicationRequiresModificationPayload): Promise<void> {
    const agencyConfig = await this.agencyRepository.getConfig(
      application.agencyCode,
    );
    if (!agencyConfig) {
      throw new Error(
        `Unable to send mail. No agency config found for ${application.agencyCode}`,
      );
    }

    let recipients = [
      application.email,
      application.mentorEmail,
      ...agencyConfig.counsellorEmails,
    ];
    if (!agencyConfig.allowUnrestrictedEmailSending) {
      recipients = recipients.filter((email) => {
        if (!this.emailAllowList.has(email)) {
          logger.info(`Skipped sending email to: ${email}`);
          return false;
        }
        return true;
      });
    }

    if (recipients.length > 0) {
      await this.emailGateway.sendModificationRequestApplicationNotification(
        recipients,
        getModificationRequestApplicationNotificationParams(
          application,
          agencyConfig,
          reason,
        ),
      );
    } else {
      logger.info(
        {
          id: application.id,
          recipients,
          source: application.source,
          reason,
        },
        "Sending modification request confirmation email skipped.",
      );
    }
  }
}

const getModificationRequestApplicationNotificationParams = (
  dto: ImmersionApplicationDto,
  agencyConfig: AgencyConfig,
  reason: string,
): ModificationRequestApplicationNotificationParams => {
  return {
    beneficiaryFirstName: dto.firstName,
    beneficiaryLastName: dto.lastName,
    businessName: dto.businessName,
    reason,
    signature: agencyConfig.signature,
    agency: agencyConfig.name,
    immersionProfession: dto.immersionProfession,
  };
};
