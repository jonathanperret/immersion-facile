import { AxiosResponse } from "axios";
import {
  AbsoluteUrl,
  HttpResponse,
  makezTrimmedString,
  ManagedAxios,
  queryParamsAsString,
  stringToMd5,
} from "shared";
import { z } from "zod";
import { AccessTokenDto } from "../../../domain/peConnect/dto/AccessToken.dto";
import {
  ExternalPeConnectAdvisor,
  ExternalPeConnectOAuthGetTokenWithCodeGrantPayload,
  ExternalPeConnectOAuthGrantPayload,
  PeConnectAdvisorDto,
  PeConnectUserDto,
  PeUserAndAdvisors,
  toPeConnectAdvisorDto,
  toPeConnectUserDto,
} from "../../../domain/peConnect/dto/PeConnect.dto";
import {
  externalPeConnectAdvisorsSchema,
  externalPeConnectUserSchema,
} from "../../../domain/peConnect/port/PeConnect.schema";
import { PeConnectGateway } from "../../../domain/peConnect/port/PeConnectGateway";
import { createLogger } from "../../../utils/logger";
import { validateAndParseZodSchema } from "../../primary/helpers/httpErrors";

const logger = createLogger(__filename);

export const toAccessToken = (
  externalAccessToken: ExternalAccessToken,
): AccessTokenDto => ({
  value: externalAccessToken.access_token,
  expiresIn: externalAccessToken.expires_in,
});

export type ExternalAccessToken = {
  access_token: string;
  expires_in: number;
};

export const externalAccessTokenSchema: z.Schema<ExternalAccessToken> =
  z.object({
    access_token: makezTrimmedString(
      "Le format du token peConnect est invalide",
    ),
    expires_in: z.number().min(1, "Ce token est déja expiré"),
  });

export type PeConnectUrlTargets =
  | "OAUTH2_AUTH_CODE_STEP_1"
  | "OAUTH2_ACCESS_TOKEN_STEP_2"
  | "REGISTERED_REDIRECT_URL"
  | "PECONNECT_USER_INFO"
  | "PECONNECT_ADVISORS_INFO"
  | "PECONNECT_STATUT";

type PeConnectStatusResponse = {
  codeStatutIndividu: "0" | "1";
  libelleStatutIndividu: "Non demandeur d'emploi" | "Demandeur d'emploi";
};

const PeConnectStatusResponseSchema: z.Schema<PeConnectStatusResponse> =
  z.object({
    codeStatutIndividu: z.enum(["0", "1"]),
    libelleStatutIndividu: z.enum([
      "Non demandeur d'emploi",
      "Demandeur d'emploi",
    ]),
  });

export class HttpPeConnectGateway implements PeConnectGateway {
  public constructor(
    private readonly authConfig: {
      clientId: string;
      clientSecret: string;
    },
    private readonly httpClient: ManagedAxios<PeConnectUrlTargets>,
  ) {}

  public oAuthGetAuthorizationCodeRedirectUrl(): AbsoluteUrl {
    const authorizationCodePayload: ExternalPeConnectOAuthGrantPayload = {
      response_type: "code",
      client_id: this.authConfig.clientId,
      realm: "/individu",
      redirect_uri: this.httpClient.targetsUrls.REGISTERED_REDIRECT_URL(),
      scope: peConnectNeededScopes(this.authConfig.clientId),
    };

    return `${this.httpClient.targetsUrls.OAUTH2_AUTH_CODE_STEP_1()}?${queryParamsAsString<ExternalPeConnectOAuthGrantPayload>(
      authorizationCodePayload,
    )}`;
  }

  public async getUserAndAdvisors(
    authorizationCode: string,
  ): Promise<PeUserAndAdvisors> {
    const accessToken: AccessTokenDto = await this.peAccessTokenStep2ApiCall(
      authorizationCode,
    );

    const [user, advisors] = await Promise.all([
      this.peConnectUserInfoApiCall(accessToken),
      this.retreivePeConnectAdvisors(accessToken),
    ]);

    return {
      user,
      advisors,
    };
  }

  private async retreivePeConnectAdvisors(
    accessToken: AccessTokenDto,
  ): Promise<PeConnectAdvisorDto[]> {
    return (await this.peconnectStatusApiCall(accessToken))
      .codeStatutIndividu === "1"
      ? this.peConnectAdvisorsInfoApiCall(accessToken)
      : [];
  }

  private async peConnectUserInfoApiCall(
    accessToken: AccessTokenDto,
  ): Promise<PeConnectUserDto> {
    const response: HttpResponse = await this.httpClient.get({
      target: this.httpClient.targetsUrls.PECONNECT_USER_INFO,
      adapterConfig: {
        headers: peConnectheadersWithBearerAuthToken(accessToken),
      },
    });

    return toPeConnectUserDto(
      validateAndParseZodSchema(
        externalPeConnectUserSchema,
        extractUserInfoBodyFromResponse(response),
      ),
    );
  }

  private async peconnectStatusApiCall(
    accessToken: AccessTokenDto,
  ): Promise<PeConnectStatusResponse> {
    const response: HttpResponse = await this.httpClient.get({
      target: this.httpClient.targetsUrls.PECONNECT_STATUT,
      adapterConfig: {
        headers: peConnectheadersWithBearerAuthToken(accessToken),
      },
    });
    if (response.status === 200)
      return validateAndParseZodSchema(
        PeConnectStatusResponseSchema,
        response.data,
      );
    throw new Error(
      `Unexpected PECONNECT_STATUT response: ${JSON.stringify(response)}`,
    );
  }

  private async peAccessTokenStep2ApiCall(
    authorizationCode: string,
  ): Promise<AccessTokenDto> {
    const response: HttpResponse = await this.httpClient.post({
      target: this.httpClient.targetsUrls.OAUTH2_ACCESS_TOKEN_STEP_2,
      data: queryParamsAsString<ExternalPeConnectOAuthGetTokenWithCodeGrantPayload>(
        {
          grant_type: "authorization_code",
          code: authorizationCode,
          client_id: this.authConfig.clientId,
          client_secret: this.authConfig.clientSecret,
          redirect_uri: this.httpClient.targetsUrls.REGISTERED_REDIRECT_URL(),
        },
      ),
      adapterConfig: {
        headers: headersUrlEncoded(),
      },
    });

    const accessToken = toAccessToken(
      validateAndParseZodSchema(externalAccessTokenSchema, response.data),
    );
    logger.info(
      { trackId: stringToMd5(accessToken.value) },
      "PeConnect Get Access Token Success",
    );

    return accessToken;
  }

  private async peConnectAdvisorsInfoApiCall(
    accessToken: AccessTokenDto,
  ): Promise<PeConnectAdvisorDto[]> {
    const response: AxiosResponse = await this.httpClient.get({
      target: this.httpClient.targetsUrls.PECONNECT_ADVISORS_INFO,
      adapterConfig: {
        headers: peConnectheadersWithBearerAuthToken(accessToken),
      },
    });

    const advisors: ExternalPeConnectAdvisor[] = validateAndParseZodSchema(
      externalPeConnectAdvisorsSchema,
      extractAdvisorsBodyFromResponse(response),
    );

    return advisors.map(toPeConnectAdvisorDto);
  }
}

const peConnectNeededScopes = (clientId: string): string =>
  [
    `application_${clientId}`,
    "api_peconnect-individuv1",
    "api_peconnect-conseillersv1",
    "individu",
    "openid",
    "profile",
    "email",
  ].join(" ");

export const peConnectheadersWithBearerAuthToken = (
  accessToken: AccessTokenDto,
): { [key: string]: string } => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Bearer ${accessToken.value}`,
});

const headersUrlEncoded = (): { [key: string]: string } => ({
  "Content-Type": "application/x-www-form-urlencoded",
});

const extractUserInfoBodyFromResponse = (
  response: AxiosResponse,
): {
  [key: string]: any;
} => {
  const body = response.data;

  return body === "" ? {} : body;
};

const extractAdvisorsBodyFromResponse = (
  response: AxiosResponse,
): {
  [key: string]: any;
} => {
  const body = response.data;

  return body === "" ? [] : body;
};
