(function (angular) {
'use strict';

angular.module('podrodze.routes', ['ngRoute'])

.config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
   $locationProvider.hashPrefix('!');
   $routeProvider.when('/', {
       templateUrl: 'views/find-route.html',
       controller: 'findRouteController'
   });
}]);

})(window.angular);