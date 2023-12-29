import axios from "./axios";
import { Tag } from "../models";

export async function getTags(): Promise<Tag[]> {
    return axios
        .get(`/api/tags`, {params: {}})
        .then(res => res.data)
}
