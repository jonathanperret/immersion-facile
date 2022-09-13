import { Router } from "express";
import {
  adminLogin,
  agenciesRoute,
  AgencyDto,
  AgencyId,
  conventionsRoute,
  emailRoute,
  ExportDataDto,
  exportRoute,
  generateMagicLinkRoute,
} from "shared";
import type { AppDependencies } from "../../config/createAppDependencies";
import { sendHttpResponse } from "../../helpers/sendHttpResponse";
import { sendZipResponse } from "../../helpers/sendZipResponse";

export const createAdminRouter = (deps: AppDependencies): Router => {
  const adminRouter = Router({ mergeParams: true });

  adminRouter
    .route(`/${adminLogin}`)
    .post(async (req, res) =>
      sendHttpResponse(req, res, () =>
        deps.useCases.adminLogin.execute(req.body),
      ),
    );

  adminRouter.use(deps.adminAuthMiddleware);

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
    .route(`/${conventionsRoute}/:id`)
    .get(async (req, res) =>
      sendHttpResponse(req, res, () =>
        deps.useCases.getConvention.execute(req.params),
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
    .route(`/${agenciesRoute}`)
    .get(async (req, res) =>
      sendHttpResponse(req, res, () =>
        deps.useCases.privateListAgencies.execute(req.query),
      ),
    );

  adminRouter
    .route(`/${conventionsRoute}`)
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

  adminRouter.route(`/${exportRoute}`).post(async (req, res) =>
    sendZipResponse(req, res, async () => {
      const exportDataParams: ExportDataDto = req.body;
      const archivePath = await deps.useCases.exportData.execute(
        exportDataParams,
      );
      return archivePath;
    }),
  );

  return adminRouter;
};
