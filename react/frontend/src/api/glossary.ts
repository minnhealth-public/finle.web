import axios from "./axios";
import { GlossaryItem } from "../models";
import humps from "humps";

export async function getGlossary(): Promise<GlossaryItem[]> {
  return axios
    .get(`/api/glossary`, { params: {} })
    .then(res => humps.camelizeKeys(res.data) as GlossaryItem[])
}
