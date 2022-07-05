import { AbsoluteUrl } from "shared/src/AbsoluteUrl";
import { frontRoutes } from "shared/src/routes";
import { queryParamsAsString } from "shared/src/utils/queryParams";
import { z } from "../../../../node_modules/zod";
import { UnitOfWork, UnitOfWorkPerformer } from "../../core/ports/UnitOfWork";
import { TransactionalUseCase } from "../../core/UseCase";
import {
  ConventionPeConnectFields,
  ConventionPoleEmploiUserAdvisorEntity,
  PeConnectAdvisorDto,
  PeConnectUserDto,
  PeUserAndAdvisors,
  toPartialConventionDtoWithPeIdentity,
} from "../dto/PeConnect.dto";
import {
  conventionPoleEmploiUserAdvisorFromDto,
  poleEmploiUserAdvisorDTOFromUserAndAdvisors,
} from "../entities/ConventionPoleEmploiAdvisorEntity";
import { PeConnectGateway } from "../port/PeConnectGateway";

export class LinkPoleEmploiAdvisorAndRedirectToConvention extends TransactionalUseCase<
  string,
  AbsoluteUrl
> {
  inputSchema = z.string();

  constructor(
    uowPerformer: UnitOfWorkPerformer,
    private peConnectGateway: PeConnectGateway,
    private baseUrlForRedirect: AbsoluteUrl,
  ) {
    super(uowPerformer);
  }

  protected async _execute(
    authorizationCode: string,
    uow: UnitOfWork,
  ): Promise<AbsoluteUrl> {
    const userAndAdvisors = await this.peConnectGateway.getUserAndAdvisors(
      authorizationCode,
    );

    if (hasAdvisors(userAndAdvisors))
      await openPoleEmploiUserAdvisorSlotForNextConvention(
        userAndAdvisors,
        uow,
      );

    const peQueryParams = queryParamsAsString<ConventionPeConnectFields>(
      toPartialConventionDtoWithPeIdentity(userAndAdvisors.user),
    );

    return `${this.baseUrlForRedirect}/${frontRoutes.conventionRoute}?${peQueryParams}`;
  }
}

const openPoleEmploiUserAdvisorSlotForNextConvention = async (
  {
    user,
    advisors,
  }: { user: PeConnectUserDto; advisors: PeConnectAdvisorDto[] },
  uow: UnitOfWork,
) => {
  const poleEmploiUserAdvisorEntity: ConventionPoleEmploiUserAdvisorEntity =
    conventionPoleEmploiUserAdvisorFromDto(
      poleEmploiUserAdvisorDTOFromUserAndAdvisors({
        user,
        advisors,
      }),
    );

  await uow.conventionPoleEmploiAdvisorRepo.openSlotForNextConvention(
    poleEmploiUserAdvisorEntity,
  );
};

const hasAdvisors = (userAndAdvisors: PeUserAndAdvisors) =>
  userAndAdvisors.advisors.length > 0;
