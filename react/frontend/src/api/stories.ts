import axios from "./axios";
import { Story } from "../models";
import humps from "humps";

export async function getStories(): Promise<Story[]> {
    return axios
        .get(`/api/stories`, {params: {}})
        .then(res => res.data.map((data: any) => humps.camelizeKeys(data)))
}
