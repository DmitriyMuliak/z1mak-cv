export const redirectedFromURLParamKey = 'redirectedFrom';

export const getRedirectFromUrl = (paramKey = redirectedFromURLParamKey) => {
  // Check redirect params
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const redirectUrl = urlParams.get(paramKey);

  return redirectUrl;
};

export const getStateWithRedirectFromUrl = (paramKey = redirectedFromURLParamKey) => {
  const redirectUrl = getRedirectFromUrl(paramKey);
  const state = encodeURIComponent(
    JSON.stringify({
      [redirectedFromURLParamKey]: redirectUrl,
    }),
  );
  return redirectUrl ? state : null;
};
