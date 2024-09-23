import fetch from 'node-fetch';
import { log } from 'console';

const fetchWithTimeout = (url, options, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Request Timed Out'));
    }, timeout);

    fetch(url, options)
      .then(response => {
        clearTimeout(timer);
        resolve(response);
      })
      .catch(error => {
        clearTimeout(timer);
        reject(error);
      });
  });
};

export const fetchRequest = async (requestParams) => {
    console.log("Request to " + requestParams.url);
    return fetchWithTimeout(requestParams.url,{
        method: requestParams.method,
        headers: requestParams.headers,
        body: requestParams.method == "GET" ? null : requestParams.body
    });
}