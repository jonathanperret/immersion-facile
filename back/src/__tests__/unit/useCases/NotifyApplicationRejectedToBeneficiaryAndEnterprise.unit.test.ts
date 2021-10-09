import { InMemoryEmailGateway } from "../../../adapters/secondary/InMemoryEmailGateway";
import { RejectedApplicationNotificationParams } from "../../../domain/immersionApplication/ports/EmailGateway";
import { NotifyBeneficiaryAndEnterpriseThatApplicationIsRejected } from "../../../domain/immersionApplication/useCases/notifications/NotifyBeneficiaryAndEnterpriseThatApplicationIsRejected";
import {
  ApplicationSource,
  ImmersionApplicationDto,
} from "../../../shared/ImmersionApplicationDto";
import { ImmersionApplicationEntityBuilder } from "../../../_testBuilders/ImmersionApplicationEntityBuilder";
import { expectEmailApplicationRejectedNotificationMatchingImmersionApplication } from "../../../_testBuilders/emailAssertions";
import { ImmersionApplicationDtoBuilder } from "../../../_testBuilders/ImmersionApplicationDtoBuilder";
import { NotifyAllActorsOfFinalApplicationValidation } from "../../../domain/immersionApplication/useCases/notifications/NotifyAllActorsOfFinalApplicationValidation";

const validDemandeImmersion: ImmersionApplicationDto =
  new ImmersionApplicationEntityBuilder().build().toDto();

const counsellorEmail = "counsellor@email.fr";

describe("NotifyApplicationRejectedToBeneficiaryAndEnterprise", () => {
  let emailGw: InMemoryEmailGateway;
  let allowList: Set<string>;
  let unrestrictedEmailSendingSources: Set<ApplicationSource>;
  let counsellorEmails: Record<ApplicationSource, string[]>;
  let notifyBeneficiaryAndEnterpriseThatApplicationIsRejected: NotifyBeneficiaryAndEnterpriseThatApplicationIsRejected;

  beforeEach(() => {
    emailGw = new InMemoryEmailGateway();
    allowList = new Set();
    unrestrictedEmailSendingSources = new Set();
    counsellorEmails = {} as Record<ApplicationSource, string[]>;
    // notifyBeneficiaryAndEnterpriseThatApplicationIsRejected =
    //   new NotifyAllActorsOfFinalApplicationValidation(
    //     emailGw,
    //     allowList,

    //     unrestrictedEmailSendingSources,
    //     counsellorEmails,
    //   );
  });

  test("Sends no emails when allowList and unrestrictedEmailSendingSources is empty", async () => {
    await notifyBeneficiaryAndEnterpriseThatApplicationIsRejected.execute(
      validDemandeImmersion,
    );
    expect(emailGw.getSentEmails()).toHaveLength(0);
  });

  test("Sends notification of rejection email to beneficiary when on allowList", async () => {
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
      "Suspicion of free working",
      "Mission Locale",
    );
  });
});
