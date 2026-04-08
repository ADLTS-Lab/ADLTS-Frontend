import axios from 'axios';

export const api = axios.create({
    baseURL: "https://api.adlt.et/api/v1",
    });