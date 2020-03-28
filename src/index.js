import axios from 'axios';

import awsParamStore from 'aws-param-store';

const goodCondition = (feelsLike, gust, precip_hrly) => {
  if(feelsLike> 15 && gust < 25 && precip_hrly < 0.5){
    return true;
  }
  else{
    return false;
  }
};

const isDay = (dayInd) => {
  if (dayInd = 'D'){
    return true;
  }
  else{
    return false;
  }
};

export async function handler(event, context){
  const {Value: weatherApiApiKey} = await awsParamStore.getParameter('/weatherApi/apiKey');
  console.log(JSON.stringify(event));
  const coordinates = {
    lat: event.queryStringParameters.lat,
    lon: event.queryStringParameters.lon
  };
  console.log({
    lat: coordinates.lat,
    lon: coordinates.lon
  })
  console.log({weatherApiApiKey});
  const query = {language: 'en-US',
                  apiKey: weatherApiApiKey,
                units: 'm'};
  const result = await axios({
    method: 'GET',
    url: `https://api.weather.com/v1/geocode/${coordinates.lat}/${coordinates.lon}/observations.json`,
    params: query
  });
  console.log(JSON.stringify(result.data));
  const goodWeather = goodCondition(result.data.observation.feels_like, result.data.observation.gust, result.data.observation.precip_hrly);
  const day = isDay(result.data.observation.day_ind);

  return Promise.resolve({
    statusCode: 200,
    body: JSON.stringify({
    msg: {...result.data,
          goodWeather,
          day}}),
  });
}
