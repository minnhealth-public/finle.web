import humps from "humps"
import Resource, { ResourceFilter } from "../models/resource"
import { AxiosInstance } from "axios"

export async function getResources(axios: AxiosInstance): Promise<Resource[]> {
  return axios
    .get(`/api/resources`)
    .then((res: any) => (humps.camelizeKeys(res.data) as Resource[]))
}

export async function getResourceFilters(axios: AxiosInstance): Promise<ResourceFilter> {
  return axios
    .get(`/api/resources/filters`)
    .then((res: any) => (humps.camelizeKeys(res.data) as ResourceFilter))
}
