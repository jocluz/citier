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

async function getCity(geonameId: string) {
  const url = `/cities/${geonameId}`;
  const req: RequestConfig = {
    url
  };

  return get(req);
}
//http://www.geonames.org/getJSON?id=2988507
async function getCityLocation(geonameId: string) {
  const url = `/getJSON?id=${geonameId}`;
  const req: RequestConfig = {
    url,
    baseURL: "http://www.geonames.org"
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

export {
  getCities,
  getCity,
  getCityLocation,
  getPreferredCities,
  savePreferredCities
};
