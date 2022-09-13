import { RomeCodeV0 } from "../rome";

export type SearchImmersionQueryParamsDto = {
  longitude: number;
  latitude: number;
  rome?: RomeCodeV0;
  distance_km: number;
  sortedBy: "distance" | "date";
  voluntaryToImmersion?: boolean;
};
