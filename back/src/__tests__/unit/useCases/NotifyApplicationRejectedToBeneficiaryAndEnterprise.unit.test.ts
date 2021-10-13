import { InMemoryEmailGateway } from "../../../adapters/secondary/InMemoryEmailGateway";
import { NotifyBeneficiaryAndEnterpriseThatApplicationIsRejected } from "../../../domain/immersionApplication/useCases/notifications/NotifyBeneficiaryAndEnterpriseThatApplicationIsRejected";
import {
  applicationStatusFromString,
  ImmersionApplicationDto,
} from "../../../shared/ImmersionApplicationDto";
import { AgencyCode, agencyCodes } from "../../../shared/agencies";
import { ImmersionApplicationEntityBuilder } from "../../../_testBuilders/ImmersionApplicationEntityBuilder";
import { expectEmailApplicationRejectedNotificationMatchingImmersionApplication } from "../../../_testBuilders/emailAssertions";

const validDemandeImmersion: ImmersionApplicationDto =
  new ImmersionApplicationEntityBuilder().build().toDto();
const counsellorEmail = "counsellor@email.fr";

describe("NotifyApplicationRejectedToBeneficiaryAndEnterprise", () => {
  let emailGw: InMemoryEmailGateway;
  let allowList: Set<string>;
  let unrestrictedEmailSendingAgencies: Set<AgencyCode>;
  let counsellorEmails: Record<AgencyCode, string[]>;
  let notifyBeneficiaryAndEnterpriseThatApplicationIsRejected: NotifyBeneficiaryAndEnterpriseThatApplicationIsRejected;
  const rejectionReason = "Risque d'emploi de main d'oeuvre gratuite";
  const agencyCode = agencyCodes.AMIE_BOULONAIS;

  beforeEach(() => {
    emailGw = new InMemoryEmailGateway();
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
    await notifyBeneficiaryAndEnterpriseThatApplicationIsRejected.execute(
      validDemandeImmersion,
    );
    expect(emailGw.getSentEmails()).toHaveLength(0);
  });

  test.skip("Sends notification of rejection email to beneficiary when on allowList", async () => {
    allowList.add(validDemandeImmersion.email);

    await notifyBeneficiaryAndEnterpriseThatApplicationIsRejected.execute(
      validDemandeImmersion,
    );

    const sentEmails = emailGw.getSentEmails();

    expect(sentEmails).toHaveLength(1);
    expectEmailApplicationRejectedNotificationMatchingImmersionApplication(
      [validDemandeImmersion.email],
      sentEmails[0],
      validDemandeImmersion,
      agencyCode,
    );
  });

  test.skip("Sends notification of rejection email to mentor when on allowList", async () => {
    allowList.add(validDemandeImmersion.mentorEmail);

    await notifyBeneficiaryAndEnterpriseThatApplicationIsRejected.execute(
      validDemandeImmersion,
    );

    const sentEmails = emailGw.getSentEmails();

    expect(sentEmails).toHaveLength(1);
    expectEmailApplicationRejectedNotificationMatchingImmersionApplication(
      [validDemandeImmersion.mentorEmail],
      sentEmails[0],
      validDemandeImmersion,
      agencyCode,
    );
  });

  test.skip("Sends notification of rejection email to concellor when on allowList", async () => {
    counsellorEmails[validDemandeImmersion.agencyCode] = [counsellorEmail];

    allowList.add(counsellorEmail);

    await notifyBeneficiaryAndEnterpriseThatApplicationIsRejected.execute(
      validDemandeImmersion,
    );

    const sentEmails = emailGw.getSentEmails();

    expect(sentEmails).toHaveLength(1);
    expectEmailApplicationRejectedNotificationMatchingImmersionApplication(
      [counsellorEmail],
      sentEmails[0],
      validDemandeImmersion,
      agencyCode,
    );
  });

  test.skip("Sends notification of rejection email to beneficiary, mentor, and counsellor for unrestrictedEmailSendingAgencies", async () => {
    counsellorEmails[validDemandeImmersion.agencyCode] = [counsellorEmail];
    unrestrictedEmailSendingAgencies.add(validDemandeImmersion.agencyCode);

    await notifyBeneficiaryAndEnterpriseThatApplicationIsRejected.execute(
      validDemandeImmersion,
    );

    const sentEmails = emailGw.getSentEmails();

    expect(sentEmails).toHaveLength(1);
    expectEmailApplicationRejectedNotificationMatchingImmersionApplication(
      [
        validDemandeImmersion.email,
        validDemandeImmersion.mentorEmail,
        counsellorEmail,
      ],
      sentEmails[0],
      validDemandeImmersion,
      agencyCode,
    );
  });
});
