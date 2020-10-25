import { AxiosRequestConfig, AxiosResponse, AxiosError, Canceler } from "axios";

/**
 *  This interface extends the AxiosRequestConfig one with custom properties.
 */
export interface RequestConfig<T = any> extends AxiosRequestConfig {
  data?: T;
  cancel?: (cancel: Canceler) => void;
}

/**
 *  This interface just extends the AxiosResponse.
 */
export type Response<T = any> = AxiosResponse<T>;

/**
 *  This interface just extends the AxiosError.
 */
export type Error = AxiosError;

/**
 * Http verbs
 * @readonly
 * @enum {string}
 * GET | POST | PUT | PATCH | DELETE
 */
export enum HTTPVerb {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE"
}
