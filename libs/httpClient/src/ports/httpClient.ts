import { AxiosInstance } from "axios";
import { createManagedAxiosInstance } from "./axios.port";

export const isHttpClientError = (status: number): boolean =>
  status >= 400 && status < 500;

export const isHttpServerError = (status: number): boolean =>
  status >= 500 && status < 600;

// TODO Add createClient interface ?
export const createManagedHttpClient = (): AxiosInstance =>
  createManagedAxiosInstance();
