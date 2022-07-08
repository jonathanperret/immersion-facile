import { Router } from "express";
import { AgencyDto, AgencyId } from "shared/src/agency/agency.dto";
import {
  generateMagicLinkRoute,
  agenciesRoute,
  adminLogin,
  validateConventionRoute,
  emailRoute,
  conventionsAdminRoute,
} from "shared/src/routes";
import type { AppDependencies } from "../../config/createAppDependencies";
import { sendHttpResponse } from "../../helpers/sendHttpResponse";
import { createExcelExportRouter } from "./createExcelExportRouter";

export const createAdminRouter = (deps: AppDependencies) => {
  const adminRouter = Router({ mergeParams: true });

  adminRouter
    .route(`/${adminLogin}`)
    .post(async (req, res) =>
      sendHttpResponse(req, res, () =>
        deps.useCases.adminLogin.execute(req.body),
      ),
    );

  const excelRouter = createExcelExportRouter(deps);

  adminRouter.use(deps.adminAuthMiddleware);
  adminRouter.use("/excel", excelRouter);

  adminRouter.route(`/${generateMagicLinkRoute}`).get(async (req, res) =>
    sendHttpResponse(req, res, () =>
      deps.useCases.generateMagicLink.execute({
        applicationId: req.query.id,
        role: req.query.role,
        expired: req.query.expired === "true",
      } as any),
    ),
  );

  adminRouter
    .route(`/${conventionsAdminRoute}/:id`)
    .get(async (req, res) =>
      sendHttpResponse(req, res, () =>
        deps.useCases.getConventionAdminReadDto.execute(req.params),
      ),
    );

  adminRouter
    .route(`/${validateConventionRoute}/:id`)
    .get(async (req, res) =>
      sendHttpResponse(req, res, () =>
        deps.useCases.validateConvention.execute(req.params.id),
      ),
    );

  // PATCH admin/agencies/:id
  adminRouter.route(`/${agenciesRoute}/:agencyId`).patch(async (req, res) =>
    sendHttpResponse(req, res, () => {
      const useCaseParams: Partial<Pick<AgencyDto, "status">> & {
        id: AgencyId;
      } = { id: req.params.agencyId, ...req.body };
      return deps.useCases.updateAgency.execute(useCaseParams);
    }),
  );

  // GET admin/agencies?status=needsReview
  adminRouter
    .route(`/${conventionsAdminRoute}`)
    .get(async (req, res) =>
      sendHttpResponse(req, res, () =>
        deps.useCases.privateListAgencies.execute(req.query),
      ),
    );

  adminRouter
    .route(`/${conventionsAdminRoute}`)
    .get(async (req, res) =>
      sendHttpResponse(req, res, () =>
        deps.useCases.listAdminConventions.execute(req.query),
      ),
    );

  // GET admin/emails
  adminRouter
    .route(`/${emailRoute}`)
    .get(async (req, res) =>
      sendHttpResponse(req, res, () => deps.useCases.getSentEmails.execute()),
    );
  return adminRouter;
};
