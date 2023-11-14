import axios from "axios";

export const getAxiosCall = async ({ route, params }) => {
  const response = { data: undefined, hasErrorOccurred: false };
  const BASE_PATH = `http://localhost:8000`;
  const url = `${BASE_PATH}${route}`;

  try {
    const { data } = await axios({ method: "GET", url, params });
    response.data = data;
  } catch (error) {
    console.log(error);
    response.hasErrorOccurred = true;
  }
  return response;
};

export const postAxiosCall = async ({ route, postData }) => {
  const response = { data: undefined, hasErrorOccurred: false };
  const BASE_PATH = `http://localhost:8000`;
  const url = `${BASE_PATH}${route}`;

  try {
    const { data } = await axios({ method: "POST", url, data: postData });
    response.data = data;
  } catch (error) {
    console.log(error);
    response.hasErrorOccurred = true;
  }
  return response;
};

export const putAxiosCall = async ({ route, data }) => {
  const BASE_PATH = `http://localhost:8000`;
  const url = `${BASE_PATH}${route}`;

  console.log(url, data);

  try {
    await axios({ method: "PUT", url, data });
  } catch (error) {
    console.log(error);
  }
};
