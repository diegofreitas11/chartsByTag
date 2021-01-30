import Axios from 'axios';

const api = Axios.create({
    baseURL: 'http://ws.audioscrobbler.com/2.0/' 
})

export const source = Axios.CancelToken.source();
export const lastfmKey = '87388aa0974f3cc9ddf2e4adac39a39e';

export default api;