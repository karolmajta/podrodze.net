(function (angular) {
'use strict';

angular.module('podrodze', [
    'google-maps',
    'podrodze.config',
    'podrodze.views',
    'podrodze.utils',
    'podrodze.places'])

.controller('appController', ['$scope', function ($scope) {

    $scope.map = {
        center: {
            latitude: 45,
            longitude: -73
        },
        zoom: 8
    };

}])

.controller('uiController',
    ['$scope', 'ThrottledAutocompleteSuggestions', 'getIn',
    function ($scope, Autocomplete, getIn) {

    var autocomplete = new Autocomplete(400);

    $scope.searchParams = {};

    $scope.suggested = {
        start: [],
        stop: []
    };

    $scope.triggerAutocomplete = function (fieldname) {
        if (!$scope.searchParams.start) { return; }
        autocomplete.query($scope.searchParams.start).then(function (r) {
            $scope.suggested[fieldname] = r;
        });
    };

    $scope.toggleActive = function (suggestion, fieldname) {
        $scope.searchParams[fieldname] = suggestion.description;
    };
}])

.controller('mapController', ['$scope', function ($scope) {

}]);

})(window.angular);