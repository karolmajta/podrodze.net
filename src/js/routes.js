(function (angular) {
'use strict';

angular.module('podrodze.routes', ['ngRoute'])

.config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
   $locationProvider.hashPrefix('!');
   $routeProvider.when('/', {
       templateUrl: 'views/find-route.html',
       controller: 'findRouteController'
   }).when('/route', {
       templateUrl: 'views/search-params.html',
       controller: 'selectSearchParamsController'
   });
}]);

})(window.angular);