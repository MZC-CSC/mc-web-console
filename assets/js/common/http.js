import axios from "axios";

export function get(url) {
    return axios.get(url)
        .then(response => response.data.data)
        .catch(error => {
            console.error(error.message);
            return error.message;
        });
}

export function post(url, data) {
    return axios.post(url, data)
        .then(response => response.data.data)
        .catch(error => {
            console.error(error.message);
            return error.message;
        });
}