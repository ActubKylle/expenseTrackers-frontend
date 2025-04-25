import axios from './axios';

export const login = async (credentials) => {
  const response = await axios.post('/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await axios.post('/register', userData);
  return response.data;
};

export const logout = async () => {
  const response = await axios.post('/logout');
  return response.data;
};

export const getUser = async () => {
  const response = await axios.get('/user');
  return response.data;
};