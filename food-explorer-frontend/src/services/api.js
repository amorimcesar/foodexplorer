import axios from "axios";

export const api = axios.create({
    baseURL: "https://food-explorer-pp16.onrender.com"
});