import { AddressDto } from "../address/address.dto";

export type GeoJsonFeatureCollection = {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
};

export type GeoJsonGeometry = { coordinates: [number, number] };

export type GeoJsonFeature = {
  type: "Feature";
  geometry: GeoJsonGeometry;
  properties: GeoJsonFeatureApiAddressProperties;
};

export type GeoJsonFeatureApiAddressProperties = {
  label: string;
  score: number;
  housenumber?: string;
  id: string;
  type: string;
  name: string;
  postcode?: string;
  citycode: string;
  x: number;
  y: number;
  city: string;
  context: string;
  importance: number;
  street?: string;
};

export const featureToAddressDto = (feature: GeoJsonFeature): AddressDto =>
  feature.properties.postcode
    ? {
        streetNumberAndAddress: feature.properties.name,
        city: feature.properties.city,
        departmentCode: feature.properties.context.split(", ")[0],
        postcode: feature.properties.postcode,
      }
    : unknownAddress;
export const unknownAddress: AddressDto = {
  city: "Inconnu",
  departmentCode: "Inconnu",
  postcode: "Inconnu",
  streetNumberAndAddress: "Inconnu",
};
