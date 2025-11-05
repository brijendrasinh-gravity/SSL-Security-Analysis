import React from "react";
import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:7000",
    headers:{
        "Content-Type":"application/json",
    }
});

API.interceptors.request.use((config)=>{
    console.log("sending req from api", config.url);
    return config;
},
(error) => {
    console.error("api request error", error);
    return Promise.reject(error);
}
)

API.interceptors.response.use((response)=>{
    console.log("response received", response.status, response.config.url);
    return response;
},
(error) => {
    if(error.response){
        console.error("api error", error.response.status, error.response.data);
        alert(`error: ${error.response.data.error} `);
    } else{
        console.error("network error", error.message);
        alert("network error pls try later")
    }
    return Promise.reject(error);
}
)

export default API;