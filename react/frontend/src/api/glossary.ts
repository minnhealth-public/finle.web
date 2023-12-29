import axios from "./axios";
import { GlossaryItem } from "../models";

export async function getGlossary(): Promise<GlossaryItem[]> {
    return axios
        .get(`/api/glossary`, {params: {}})
        .then(res => res.data)
}
