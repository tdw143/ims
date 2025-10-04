export const storage = {
  getToken: () => localStorage.getItem('access_token'),
  setToken: (token: string) => localStorage.setItem('access_token', token),
  removeToken: () => localStorage.removeItem('access_token'),
  
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  setUser: (user: any) => localStorage.setItem('user', JSON.stringify(user)),
  removeUser: () => localStorage.removeItem('user'),
  
  clear: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },
};