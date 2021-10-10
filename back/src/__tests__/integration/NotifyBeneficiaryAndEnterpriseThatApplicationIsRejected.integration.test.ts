import { ENV } from "../../adapters/primary/environmentVariables";
import { SendinblueEmailGateway } from "../../adapters/secondary/SendinblueEmailGateway";
import { NotifyBeneficiaryAndEnterpriseThatApplicationIsRejected } from "../../domain/immersionApplication/useCases/notifications/NotifyBeneficiaryAndEnterpriseThatApplicationIsRejected";
import {
  applicationStatusFromString,
  ImmersionApplicationDto,
} from "../../shared/ImmersionApplicationDto";
import { AgencyCode } from "../../shared/agencies";
import { ImmersionApplicationEntityBuilder } from "../../_testBuilders/ImmersionApplicationEntityBuilder";

const validDemandeImmersion: ImmersionApplicationDto =
  new ImmersionApplicationEntityBuilder().build().toDto();
const counsellorEmail = "jean-francois.macresy@beta.gouv.fr";

describe("NotifyApplicationRejectedToBeneficiaryAndEnterprise", () => {
  let emailGw: SendinblueEmailGateway;
  let allowList: Set<string>;
  let unrestrictedEmailSendingAgencies: Set<AgencyCode>;
  let counsellorEmails: Record<AgencyCode, string[]>;
  let notifyBeneficiaryAndEnterpriseThatApplicationIsRejected: NotifyBeneficiaryAndEnterpriseThatApplicationIsRejected;
  const rejectionReason = "Risque d'emploi de main d'oeuvre gratuite";

  beforeEach(() => {
    emailGw = SendinblueEmailGateway.create(ENV.sendInBlueAPIKey);
    allowList = new Set();
    unrestrictedEmailSendingAgencies = new Set();
    counsellorEmails = {} as Record<AgencyCode, string[]>;
    notifyBeneficiaryAndEnterpriseThatApplicationIsRejected =
      new NotifyBeneficiaryAndEnterpriseThatApplicationIsRejected(
        emailGw,
        allowList,
        unrestrictedEmailSendingAgencies,
        counsellorEmails,
      );
    validDemandeImmersion.status = applicationStatusFromString("REJECTED");
    validDemandeImmersion.rejectionReason = rejectionReason;
  });

  test("Sends no emails when allowList and unrestrictedEmailSendingAgencies is empty", async () => {
    counsellorEmails[validDemandeImmersion.agencyCode] = [counsellorEmail];
    unrestrictedEmailSendingAgencies.add(validDemandeImmersion.agencyCode);

    validDemandeImmersion.mentorEmail = "jeanfrancois.macresy@gmail.com";
    validDemandeImmersion.email = "jeanfrancois.macresy+beneficiary@gmail.com";

    allowList.add(validDemandeImmersion.mentorEmail);
    allowList.add(validDemandeImmersion.email);
    allowList.add(counsellorEmail);

    await notifyBeneficiaryAndEnterpriseThatApplicationIsRejected.execute(
      validDemandeImmersion,
    );
  });
});
