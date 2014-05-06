(function (angular) {
'use strict';

angular.module('podrodze.places', [
    'podrodze.places.directions',
    'podrodze.places.autocomplete'
])
.run(['$window', 'getIn', function ($window, getIn) {
    if (getIn($window, ['google', 'maps', 'places']) === undefined) {
        throw new Error("`podrodze.places` requires Google Maps v3 JavaScript Places Library.");
    }
}]);

angular.module('$googleMapsLibrary', [])
.service('$maps', ['$window', 'getIn', function ($window, getIn) {
    return getIn($window, ['google', 'maps']);
}]);

angular.module('$googlePlacesLibrary', ['$googleMapsLibrary'])
.service('$places', ['$maps', function ($maps) {
    return $maps.places;
}]);


})(window.angular);