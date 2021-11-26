import { AppConfig } from "../../adapters/primary/appConfig";
import { SendinblueEmailGateway } from "../../adapters/secondary/SendinblueEmailGateway";
import { applicationStatusFromString } from "../../shared/ImmersionApplicationDto";
import { AllowListEmailFilter } from "./../../adapters/secondary/core/EmailFilterImplementations";
import { NotifyConfirmationEstablishmentCreated as NotifyConfirmationEstablishmentCreated } from "../../domain/immersionOffer/useCases/notifications/NotifyConfirmationEstablishmentCreated";
import { FormEstablishmentDtoBuilder } from "../../_testBuilders/FormEstablishmentDtoBuilder";
import { EmailFilter } from "../../domain/core/ports/EmailFilter";

// These tests are not hermetic and not meant for automated testing. They will send emails using
// sendinblue, use up production quota, and fail for uncontrollable reasons such as quota
// errors.
//
// Requires the following environment variables to be set for the tests to pass:
// - SENDINBLUE_API_KEY

describe("NotifyConfirmationEstablismentCreated", () => {
  let emailGw: SendinblueEmailGateway;
  let emailFilter: EmailFilter;

  const createUseCase = () => {
    return new NotifyConfirmationEstablishmentCreated(emailFilter, emailGw);
  };

  describe("When establishment is valid", () => {
    test("Nominal case: Sends notification email to Establisment contact", async () => {
      const config = AppConfig.createFromEnv();
      const validEstablishment = FormEstablishmentDtoBuilder.valid().build();

      validEstablishment.businessContacts[0].email =
        "recette@immersion-facile.beta.gouv.fr";
      emailGw = SendinblueEmailGateway.create(config.sendinblueApiKey);

      emailFilter = new AllowListEmailFilter([
        validEstablishment.businessContacts[0].email,
      ]);

      await createUseCase().execute(validEstablishment);
    });
  });
});
