import humps from "humps";
import { Filter } from "../models/Filter";
import axios from "./axios";

export async function getFilters(): Promise<Filter[]> {
  return axios
    .get(`/api/filters`, { params: {} })
    .then(res => {
      return humps.camelizeKeys(res.data) as Filter[]
    })
}
