module.exports = {
  endpoints: {
    authorize: '/oauth2/auth',
    decision: '/oauth2/decision',
    token: '/oauth2/token',
    tokenInfo: '/oauth2/tokeninfo'
  },
  authorizationCodeExpireDuration: '1h',
  accessTokenExpireDurationByCode: '30d',
  accessTokenExpireDurationByImplict: '1h'
};
