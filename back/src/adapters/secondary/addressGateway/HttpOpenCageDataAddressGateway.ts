import axios from "axios";
import { Point } from "geojson";
import {
  configureHttpClient,
  createAxiosHandlerCreator,
  createTargets,
  CreateTargets,
  HttpClient,
  Target,
} from "http-client";
import {
  AddressAndPosition,
  AddressDto,
  DepartmentCode,
  departmentNameToDepartmentCode,
  featureToAddressDto,
  GeoPositionDto,
  LookupSearchResult,
  ManagedAxios,
  OpenCageGeoSearchKey,
  toFeatureCollection,
} from "shared";
import { AddressGateway } from "../../../domain/immersionOffer/ports/AddressGateway";

// https://github.com/OpenCageData/opencagedata-misc-docs/blob/master/countrycode.md
// On prends la france et toutes ses territoires dépendants.
const baseUrl = "https://api.opencagedata.com";
const geoCodingUrl = `${baseUrl}/geocode/v1/geojson`;
const geoSearchUrl = `${baseUrl}/geosearch`;
type BaseUrl = typeof baseUrl;

const franceAndAttachedTerritoryCountryCodes =
  "fr,bl,gf,gp,mf,mq,nc,pf,pm,re,tf,wf,yt";
const language = "fr";
type GeoCodingQueryParams = {
  q: string;
  key: string;
  language?: string;
  countrycode?: string;
  limit?: string;
};

type GeoSearchQueryParams = {
  q: string;
  language?: string;
  countrycode?: string;
  limit?: string;
};

type GeoSearchHeaders = {
  "OpenCage-Geosearch-Key": OpenCageGeoSearchKey;
  Origin: string;
};

export type OpenCageDataTargets = CreateTargets<{
  geocoding: Target<void, GeoCodingQueryParams, void, BaseUrl>;
  geosearch: Target<void, GeoSearchQueryParams, GeoSearchHeaders, BaseUrl>;
}>;

type APIAddressTargetUrls = "apiAddressReverse" | "apiAddressSearchPlainText";

export const openCageDataTargets = createTargets<OpenCageDataTargets>({
  geocoding: {
    method: "GET",
    url: geoCodingUrl as BaseUrl,
  },
  geosearch: {
    method: "GET",
    url: geoSearchUrl as BaseUrl,
  },
});

const AXIOS_TIMEOUT_MS = 10_000;
export const createHttpOpenCageDataClient = configureHttpClient(
  createAxiosHandlerCreator(axios.create({ timeout: AXIOS_TIMEOUT_MS })),
);
export const queryMinLength = 2;
export const minimumCharErrorMessage = (minLength: number) =>
  `Lookup street address require a minimum of ${minLength} char.`;

export class HttpOpenCageDataAddressGateway implements AddressGateway {
  constructor(
    private readonly httpClient: HttpClient<OpenCageDataTargets>,
    private readonly APIAddressClient: ManagedAxios<APIAddressTargetUrls>,
    private geocodingApiKey: string,
    private geosearchApiKey: OpenCageGeoSearchKey,
  ) {}
  public async getDepartmentCodeFromAddressAPI(
    postCode: string,
  ): Promise<DepartmentCode | null> {
    const { data } = await this.APIAddressClient.get({
      target: this.APIAddressClient.targetsUrls.apiAddressSearchPlainText,
      targetParams: {
        text: postCode,
      },
    });
    const feature = toFeatureCollection(data).features.at(0);
    if (!feature) {
      throw new Error(`No feature on Address API for postCode ${postCode}`);
    }
    return featureToAddressDto(feature).departmentCode;
  }
  public async findDepartmentCodeFromPostCode(
    postCode: string,
  ): Promise<DepartmentCode | null> {
    const reponse = await this.httpClient.geocoding({
      queryParams: {
        countrycode: franceAndAttachedTerritoryCountryCodes,
        key: this.geocodingApiKey,
        language,
        limit: "1",
        q: postCode,
      },
    });

    const feature = (
      reponse.responseBody as OpenCageDataFeatureCollection
    ).features.at(0);
    if (!feature) throw new Error(missingFeatureForPostcode(postCode));
    const department = getDepartmentFromAliases(feature.properties.components);
    if (!department) return this.getDepartmentCodeFromAddressAPI(postCode);

    const departmentCode = departmentNameToDepartmentCode[department];
    if (!departmentCode)
      throw new Error(
        `Department '${department}' not found on departmentNameToDepartmentCode mapping.`,
      );
    return departmentCode;
  }

  public async getAddressFromPosition(
    position: GeoPositionDto,
  ): Promise<AddressDto | undefined> {
    const { responseBody } = await this.httpClient.geocoding({
      queryParams: {
        countrycode: franceAndAttachedTerritoryCountryCodes,
        key: this.geocodingApiKey,
        language,
        limit: "1",
        q: `${position.lat}+${position.lon}`,
      },
    });

    const feature = (responseBody as OpenCageDataFeatureCollection).features.at(
      0,
    );
    return feature && this.featureToAddress(feature);
  }
  public async lookupStreetAddress(
    query: string,
  ): Promise<AddressAndPosition[]> {
    // eslint-disable-next-line no-console
    console.time(`lookupStreetAddress Duration - ${query}`);
    try {
      if (query.length < queryMinLength)
        throw new Error(minimumCharErrorMessage(queryMinLength));
      const { responseBody } = await this.httpClient.geocoding({
        queryParams: {
          countrycode: franceAndAttachedTerritoryCountryCodes,
          key: this.geocodingApiKey,
          language,
          q: query,
        },
      });

      return (responseBody as OpenCageDataFeatureCollection).features
        .map((feature) => this.toAddressAndPosition(feature))
        .filter((feature): feature is AddressAndPosition => !!feature);
    } finally {
      // eslint-disable-next-line no-console
      console.timeEnd(`lookupStreetAddress Duration - ${query}`);
    }
  }

  public async lookupLocationName(
    query: string,
  ): Promise<LookupSearchResult[]> {
    // eslint-disable-next-line no-console
    console.time(`lookupLocationName Duration - ${query}`);
    try {
      if (query.length < queryMinLength)
        throw new Error(minimumCharErrorMessage(queryMinLength));

      const { responseBody } = await this.httpClient.geosearch({
        headers: {
          "OpenCage-Geosearch-Key": this.geosearchApiKey,
          Origin: "https://beta.pole-emploi.fr",
        },
        mode: "cors",
        queryParams: {
          countrycode: "fr",
          language,
          limit: "5",
          q: query,
        },
      });

      return (responseBody as OpenCageDataSearchResultCollection).results;
    } finally {
      // eslint-disable-next-line no-console
      console.timeEnd(`lookupStreetAddress Duration - ${query}`);
    }
  }

  private toAddressAndPosition(
    feature: GeoJSON.Feature<Point, OpenCageDataProperties>,
  ): AddressAndPosition | undefined {
    const address = this.featureToAddress(feature);
    return (
      address && {
        position: {
          lat: feature.geometry.coordinates[1],
          lon: feature.geometry.coordinates[0],
        },
        address,
      }
    );
  }

  private featureToAddress(
    feature: GeoJSON.Feature<Point, OpenCageDataProperties>,
  ): AddressDto | undefined {
    const components = feature.properties.components;
    const department: string | undefined = getDepartmentFromAliases(components);
    const city: string | undefined = getCityFromAliases(components);
    const streetName: string | undefined = getStreetNameFromAliases(components);
    const streetNumber: string | undefined =
      getStreetNumberFromAliases(components);

    if (!(city && department)) return undefined;

    // OpenCageData gives the department name but not the code.
    const departmentCode = departmentNameToDepartmentCode[department];
    if (!departmentCode) return undefined;

    const streetNumberAndAddress = `${streetNumber ?? ""} ${
      streetName ?? ""
    }`.trim();

    return {
      streetNumberAndAddress,
      postcode: components.postcode ?? "",
      departmentCode,
      city,
    };
  }
}

// Using the GeoJson standard: https://geojson.org/
type OpenCageDataFeatureCollection = GeoJSON.FeatureCollection<
  Point,
  OpenCageDataProperties
>;

type OpenCageDataSearchResultCollection = {
  documentation: string;
  licenses: object[];
  results: LookupSearchResult[];
  status: object;
  stay_informed: object;
  thanks: string;
  timestamp: object;
  total_results: number;
};

type OpenCageDataProperties = {
  components: OpenCageDataAddressComponents; // The address component
  confidence: number; // 10 is the best match inferior is less good
};

//Aliases Reference : https://github.com/OpenCageData/address-formatting/blob/master/conf/components.yaml
type OpenCageDataAddressComponents = {
  city?: string;
  county?: string;
  county_code?: string;
  department?: string;
  footway?: string;
  house_number?: string;
  housenumber?: string;
  path?: string;
  pedestrian?: string;
  place?: string;
  postcode: string;
  region: string;
  residential?: string;
  road?: string;
  road_reference?: string;
  road_reference_intl?: string;
  square?: string;
  state?: string;
  state_district?: string;
  street?: string;
  street_name?: string;
  street_number?: string;
  town?: string;
  township?: string;
  village?: string;
};

const getStreetNumberFromAliases = (
  components: OpenCageDataAddressComponents,
): string | undefined =>
  components.house_number ?? components.housenumber ?? components.street_number;

const getStreetNameFromAliases = (
  components: OpenCageDataAddressComponents,
): string | undefined =>
  components.road ??
  components.footway ??
  components.street ??
  components.street_name ??
  components.residential ??
  components.path ??
  components.pedestrian ??
  components.road_reference ??
  components.road_reference_intl ??
  components.square ??
  components.place;

const getCityFromAliases = (
  components: OpenCageDataAddressComponents,
): string | undefined =>
  components.city ??
  components.town ??
  components.township ??
  components.village;

// We have the best results for department when merging 'county' and 'state' related keys
const getDepartmentFromAliases = (components: OpenCageDataAddressComponents) =>
  components.county ??
  components.county_code ??
  components.department ??
  components.state_district ??
  components.state;

export const missingFeatureForPostcode = (postCode: string) =>
  `No OCD feature found for postCode ${postCode}.`;
export const missingDepartmentOnFeatureForPostcode = (
  postCode: string,
  components: any,
) =>
  `No department provided for postcode ${postCode}. OCD Components: ${JSON.stringify(
    components,
  )}`;
