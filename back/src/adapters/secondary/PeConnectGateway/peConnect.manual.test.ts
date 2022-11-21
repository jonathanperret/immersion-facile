/* eslint-disable @typescript-eslint/require-await */
import { AxiosResponse } from "axios";
import secondsToMilliseconds from "date-fns/secondsToMilliseconds";
import {
  expectToEqual,
  HttpResponse,
  ManagedAxios,
  onFullfilledDefaultResponseInterceptorMaker,
  queryParamsAsString,
} from "shared";
import supertest, { SuperTest, Test } from "supertest";
import { AccessTokenDto } from "../../../domain/peConnect/dto/AccessToken.dto";
import { ExternalPeConnectOAuthGetTokenWithCodeGrantPayload } from "../../../domain/peConnect/dto/PeConnect.dto";
import {
  createAxiosInstance,
  PrettyAxiosResponseError,
} from "../../../utils/axiosUtils";
import { AppConfigBuilder } from "../../../_testBuilders/AppConfigBuilder";
import { ManagedRedirectError } from "../../primary/helpers/redirectErrors";
import { createApp } from "../../primary/server";
import { InMemoryFeatureFlagRepository } from "../InMemoryFeatureFlagRepository";
import {
  HttpPeConnectGateway,
  PeConnectUrlTargets,
  peConnectheadersWithBearerAuthToken,
  toAccessToken,
  ExternalAccessToken,
  externalAccessTokenSchema,
} from "./HttpPeConnectGateway";
import {
  httpPeConnectGatewayTargetMapperMaker,
  peConnectApiErrorsToDomainErrors,
  onRejectPeSpecificResponseInterceptorMaker,
} from "./HttpPeConnectGateway.config";
// Those are mocked test because real calls to pole emploi api can only be made thought production domain registered with pole emploi

const mockedBehavioursWithInvalidSchemaError =
  () => async (): Promise<AccessTokenDto> => {
    const invalidTokenData: ExternalAccessToken = {
      access_token: "A token value",
      expires_in: -1,
    };
    const mockedResponseFromApi: Partial<AxiosResponse<any, any>> = {
      data: invalidTokenData,
      status: 200,
      statusText: "",
    };
    const externalAccessToken: ExternalAccessToken =
      externalAccessTokenSchema.parse(mockedResponseFromApi.data);
    return toAccessToken(externalAccessToken);
  };

const mockedBehavioursWithHttpError =
  () => async (authorization_code: string) => {
    const getAccessTokenPayload: ExternalPeConnectOAuthGetTokenWithCodeGrantPayload =
      {
        grant_type: "authorization_code",
        code: authorization_code,
        client_id: "BLIP",
        client_secret: "BLOP",
        redirect_uri: "https://immersion-facile.beta.gouv.fr/api/pe-connect",
      };

    const response = await createAxiosInstance()
      .post(
        "https://authentification-candidat.pole-emploi.fr/connexion/oauth2/access_token?realm=%2Findividu",
        queryParamsAsString<ExternalPeConnectOAuthGetTokenWithCodeGrantPayload>(
          getAccessTokenPayload,
        ),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: secondsToMilliseconds(10),
        },
      )
      .catch((error) => {
        throw PrettyAxiosResponseError("PeConnect Failure", error);
      });

    return toAccessToken(externalAccessTokenSchema.parse(response.data));
  };

const prepareAppWithMockedPeConnect = async (
  mockedOAuthAccessToken: (
    authorization_code: string,
  ) => Promise<AccessTokenDto>,
) => {
  const { app, gateways, inMemoryUow } = await createAppWithMockedGateway();

  // eslint-disable-next-line @typescript-eslint/require-await
  inMemoryUow!.featureFlagRepository = new InMemoryFeatureFlagRepository({
    enablePeConnectApi: true,
  });

  gateways.peConnectGateway = {
    ...gateways.peConnectGateway,
    oAuthGetAccessTokenThroughAuthorizationCode: mockedOAuthAccessToken,
  } as unknown as HttpPeConnectGateway;

  return app;
};
const createAppWithMockedGateway = async () => {
  const { app, gateways, inMemoryUow } = await createApp(
    new AppConfigBuilder().withTestPresetPreviousKeys().build(),
  );
  gateways.peConnectGateway = {
    ...gateways.peConnectGateway,
    oAuthGetAccessTokenThroughAuthorizationCode:
      mockedBehavioursWithHttpError(),
  } as unknown as HttpPeConnectGateway;
  return { app, gateways, inMemoryUow };
};

describe("/pe-connect", () => {
  it("verify that an error in the axios response is handled", async () => {
    const app = await prepareAppWithMockedPeConnect(
      mockedBehavioursWithHttpError(),
    );

    const request: SuperTest<Test> = supertest(app);
    const response = await request.get("/pe-connect?code=12345678");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      errors: {
        _message: "PeConnect Failure",
        body: {
          error: "invalid_client",
          error_description: "Client authentication failed",
        },
        status: "400",
      },
    });
  });

  it("verify that an error in the axios response data (external api contract) is handled", async () => {
    const app = prepareAppWithMockedPeConnect(
      mockedBehavioursWithInvalidSchemaError(),
    );

    const request: SuperTest<Test> = supertest(app);
    const response = await request.get("/pe-connect?code=12345678");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      errors: [
        {
          code: "too_small",
          inclusive: true,
          message: "Ce token est déja expiré",
          minimum: 1,
          path: ["expires_in"],
          type: "number",
        },
      ],
    });
  });

  it("should call PECONNECT_USER_INFO with invalid token and return mapped with relevant request config", async () => {
    const httpClient: ManagedAxios<PeConnectUrlTargets> =
      new ManagedAxios<PeConnectUrlTargets>(
        httpPeConnectGatewayTargetMapperMaker({
          peAuthCandidatUrl: "https://",
          immersionFacileBaseUrl: "https://",
          peApiUrl: "https://api.pole-emploi.io",
        }),
        peConnectApiErrorsToDomainErrors,
        {
          timeout: 5000,
        },
        onFullfilledDefaultResponseInterceptorMaker,
        onRejectPeSpecificResponseInterceptorMaker,
      );

    const responsePromise: Promise<HttpResponse> = httpClient.get({
      target: httpClient.targetsUrls.PECONNECT_USER_INFO,
      adapterConfig: {
        headers: peConnectheadersWithBearerAuthToken({
          value: "cvjkdflklpdfigkjklujkl",
          expiresIn: 59,
        } as AccessTokenDto),
      },
    });

    await expect(responsePromise).rejects.toThrow(ManagedRedirectError);
  });
});

describe("HttpPeConnectGateway", () => {
  const httpClient: ManagedAxios<PeConnectUrlTargets> =
    new ManagedAxios<PeConnectUrlTargets>(
      httpPeConnectGatewayTargetMapperMaker({
        peAuthCandidatUrl: "https://",
        immersionFacileBaseUrl: "https://",
        peApiUrl: "https://api.pole-emploi.io",
      }),
      peConnectApiErrorsToDomainErrors,
      {
        timeout: 5000,
      },
      onFullfilledDefaultResponseInterceptorMaker,
      onRejectPeSpecificResponseInterceptorMaker,
    );
  const httpPeConnectGateway = new HttpPeConnectGateway(
    {
      clientId: "",
      clientSecret: "",
    },
    httpClient,
  );

  it("oAuthGetAuthorizationCodeRedirectUrl", async () => {
    expectToEqual(
      await httpPeConnectGateway.oAuthGetAuthorizationCodeRedirectUrl(),
      "https:///connexion/oauth2/authorize?response_type=code&client_id=&realm=/individu&redirect_uri=https:///api/pe-connect&scope=application_%20api_peconnect-individuv1%20api_peconnect-conseillersv1%20individu%20openid%20profile%20email",
    );
  });

  describe("getUserAndAdvisors", () => {
    it("OK", async () => {
      const authorizationCode = "000000";
      expectToEqual(
        await httpPeConnectGateway.getUserAndAdvisors(authorizationCode),
        {
          advisors: [],
          user: {
            email: "",
            firstName: "",
            lastName: "",
            peExternalId: "",
          },
        },
      );
    });
    it("Bad Code", async () => {
      const authorizationCode = "000000";
      expectToEqual(
        await httpPeConnectGateway.getUserAndAdvisors(authorizationCode),
        {
          advisors: [],
          user: {
            email: "",
            firstName: "",
            lastName: "",
            peExternalId: "",
          },
        },
      );
    });
  });
});
