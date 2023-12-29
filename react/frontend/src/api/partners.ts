import axios from "./axios";
import { Partner } from "../models";

export async function getPartners(): Promise<Partner[]> {
    return axios
        .get(`/api/partners`, {params: {}})
        .then(res => res.data)
}
