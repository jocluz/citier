import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { RequestConfig, HTTPVerb } from "./model";

axios.defaults.baseURL = "http://localhost:3030";

export const get = <T = any>(config: RequestConfig<T>) =>
  makeRequest<T>(requestFactory<T>(HTTPVerb.GET, config));

export const post = <T = any, K = any>(config: RequestConfig<T>) =>
  makeRequest<K>(requestFactory<T>(HTTPVerb.POST, config));

export const put = <T = any, K = any>(config: RequestConfig<T>) =>
  makeRequest<K>(requestFactory<T>(HTTPVerb.PUT, config));

export const patch = <T = any, K = any>(config: RequestConfig<T>) =>
  makeRequest<K>(requestFactory<T>(HTTPVerb.PATCH, config));

export const remove = (config: RequestConfig<void>) =>
  makeRequest<void>(requestFactory<void>(HTTPVerb.DELETE, config));

/**
 * Responsible of making the request to the server.
 * @param config AxiosRequestConfig
 */
export const makeRequest = <T = any>(config: AxiosRequestConfig): Promise<T> =>
  axios
    .request<T>(config)
    .then((response: AxiosResponse) => Promise.resolve(response.data))
    .catch((error: AxiosError) => Promise.reject(error as Error));

/**
 * It creates and returns a AxiosRequestConfig with the provided method and config
 * @param method HTTPVerb
 * @param config RequestConfig
 */
function requestFactory<T = any>(method: HTTPVerb, config: RequestConfig<T>) {
  const { cancel, ...axiosRequest } = config;

  const request: AxiosRequestConfig = {
    ...axiosRequest,
    method
  };

  if (cancel) {
    request.cancelToken = new axios.CancelToken(cancel);
  }

  return request;
}
