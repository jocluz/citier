import { get, patch } from "./client";
import { RequestConfig } from "./model";
import { PreferredCitiesPatch } from "@/store/modules/cities/types";

async function getCities(params: any, cancel?: any) {
  const url = `/cities`;
  const req: RequestConfig = {
    url,
    params
  };

  if (cancel) req.cancel = cancel;
  return get(req);
}

async function getCity(geonameId) {
  const url = `/cities/${geonameId}`;
  const req: RequestConfig = {
    url
  };

  return get(req);
}

async function getPreferredCities() {
  const url = `/preferences/cities`;
  const req: RequestConfig = {
    url
  };

  return get(req);
}

async function savePreferredCities(cities: PreferredCitiesPatch) {
  const url = `/preferences/cities`;
  const req: RequestConfig = {
    url,
    data: {
      ...cities
    }
  };
  return patch(req);
}

export { getCities, getCity, getPreferredCities, savePreferredCities };
