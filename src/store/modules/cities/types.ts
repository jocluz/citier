export interface State {
  citiesList: CitiesList;
  preferredCities: PreferredCitiesList;
  cancelRequest: any;
}

export type CitiesList = {
  data: CityInfo[] | null;
  total: number;
  links: {
    first: string;
    next?: string;
    prev?: string;
    last: string;
  };
  filter?: string;
};

export type CityInfo = {
  geonameid: number;
  name: string;
  country: string;
  subcountry?: string;
};

export type CityParams = {
  offset?: string;
  limit?: string;
  filter?: string;
};

export type PreferredCitiesList = {
  data: PreferredCities | null;
  withError: Array<string> | null;
  loading: PreferredCitiesMap;
};

export type PreferredCities = {
  [geonameid: string]: CityInfo | null;
};

export type PreferredCitiesMap = {
  [geonameid: string]: boolean;
};

export type PreferredCitiesPatch = PreferredCitiesMap;
