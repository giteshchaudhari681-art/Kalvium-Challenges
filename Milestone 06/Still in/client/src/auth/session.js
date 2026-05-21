export const AUTH_LOGOUT_EVENT = 'auth:logout';

export const clearAuthStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const dispatchAuthLogout = (reason = 'unauthorized') => {
  window.dispatchEvent(
    new CustomEvent(AUTH_LOGOUT_EVENT, {
      detail: { reason },
    }),
  );
};
