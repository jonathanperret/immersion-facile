import { ENV } from "../../adapters/primary/environmentVariables";
import { SendinblueEmailGateway } from "../../adapters/secondary/SendinblueEmailGateway";
import { NotifyToTeamApplicationSubmittedByBeneficiary } from "../../domain/immersionApplication/useCases/notifications/NotifyToTeamApplicationSubmittedByBeneficiary";
import { ImmersionApplicationDto } from "../../shared/ImmersionApplicationDto";
import { AgencyCode } from "../../shared/agencies";
import { ImmersionApplicationEntityBuilder } from "../../_testBuilders/ImmersionApplicationEntityBuilder";
import { InMemoryAgencyRepository } from "../../adapters/secondary/InMemoryAgencyRepository";

const validDemandeImmersion: ImmersionApplicationDto =
  new ImmersionApplicationEntityBuilder().build().toDto();
const counsellorEmail = "jean-francois.macresy@beta.gouv.fr";

describe("NotifyToTeamApplicationSubmittedByBeneficiary", () => {
  let emailGw: SendinblueEmailGateway;
  let allowList: Set<string>;
  let unrestrictedEmailSendingAgencies: Set<AgencyCode>;
  let counsellorEmails: Record<AgencyCode, string[]>;
  let notifyToTeamApplicationSubmittedByBeneficiary: NotifyToTeamApplicationSubmittedByBeneficiary;
  let agencyRepo: InMemoryAgencyRepository;

  beforeEach(() => {
    emailGw = SendinblueEmailGateway.create(ENV.sendInBlueAPIKey);
    allowList = new Set();
    unrestrictedEmailSendingAgencies = new Set();
    counsellorEmails = {} as Record<AgencyCode, string[]>;

    notifyToTeamApplicationSubmittedByBeneficiary =
      new NotifyToTeamApplicationSubmittedByBeneficiary(emailGw, agencyRepo);
  });

  test.skip("Sends no emails when allowList and unrestrictedEmailSendingAgencies is empty", async () => {
    counsellorEmails[validDemandeImmersion.agencyCode] = [counsellorEmail];
    unrestrictedEmailSendingAgencies.add(validDemandeImmersion.agencyCode);

    validDemandeImmersion.mentorEmail = "jeanfrancois.macresy@gmail.com";
    validDemandeImmersion.email = "jeanfrancois.macresy+beneficiary@gmail.com";

    allowList.add(validDemandeImmersion.mentorEmail);
    allowList.add(validDemandeImmersion.email);
    allowList.add(counsellorEmail);

    await notifyToTeamApplicationSubmittedByBeneficiary.execute(
      validDemandeImmersion,
    );
  });
});
