export interface State {
  citiesList: CitiesList;
  preferredCities: PreferredCities;
  cancelRequest: any;
}

export type CitiesList = {
  data: CityInfo[];
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

export type PreferredCities = {
  [geonameid: string]: CityInfo | null;
};

export type PreferredCitiesPatch = {
  [geonameid: string]: boolean;
};
