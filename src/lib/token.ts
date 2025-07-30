let accessToken: string | null = null;
export const getAccessToken = () => accessToken || localStorage.getItem('accessToken');
export const setAccessToken = (t: string | null) => {
  accessToken = t;
  if (t) localStorage.setItem('accessToken', t);
  else localStorage.removeItem('accessToken');
};
