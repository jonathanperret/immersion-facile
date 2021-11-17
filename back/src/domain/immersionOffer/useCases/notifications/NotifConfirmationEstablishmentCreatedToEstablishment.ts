import { UseCase } from "../../../core/UseCase";
import { EmailGateway } from "../../../immersionApplication/ports/EmailGateway";
import { EmailFilter } from "../../../core/ports/EmailFilter";
import {
  FormEstablishmentDto,
  formEstablishmentSchema,
} from "../../../../shared/FormEstablishmentDto";

export class NotifConfirmationEstablishmentCreatedToEstablishment extends UseCase<FormEstablishmentDto> {
  constructor(
    private readonly emailFilter: EmailFilter,
    private readonly emailGateway: EmailGateway,
  ) {
    super();
  }

  inputSchema = formEstablishmentSchema;

  public async _execute(
    formEstablishment: FormEstablishmentDto,
  ): Promise<void> {
    this.emailGateway.sendNewEstablismentContactConfirmation(
      formEstablishment.businessContacts[0].email,
      { establishmentDto: formEstablishment },
    );
  }
}
