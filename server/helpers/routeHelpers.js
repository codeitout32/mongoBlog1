function isActiveRoute(route, currentRoute)  {
  // console.log('isactiveroute',route, currentRoute);
  return currentRoute === route ? 'active' : '';
};

module.exports = { isActiveRoute };