const API = {
    IP: process.env.REACT_APP_API_URL,
    PORT: process.env.REACT_APP_API_PORT,
}

//no backtick at the end
export const API_URL='http://'+API.IP+':'+API.PORT;
