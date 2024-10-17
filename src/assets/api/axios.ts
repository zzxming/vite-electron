import originAxios from 'axios';

const baseURL = import.meta.env.MODE === 'development' ? '/api' : 'http://localhost';
export const axios = originAxios.create({
  baseURL,
});

axios.interceptors.response.use(
  (response) => {
    if (response.data.code !== 1 && response.data.error) {
      ElNotification.error(response.data.error);
    }
    return Promise.resolve(response);
  },
  (error) => {
    console.log(error);

    let message;
    if (error.response?.data && error.response?.data?.error) {
      message = error.response.data.error.split('!')[0];
    }

    error.tipMessageShow = true;
    if (message) {
      error.tipMessage = message;
      ElNotification.error(message);
    }
    return Promise.reject(error);
  },
);

export default axios;
