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

.controller('uiController', ['$scope', function ($scope) {

        $scope.selected = {
            start: null,
            stop: null
        };

        $scope.searchParams = {};

}])

.controller('startStopFormController', ['$scope', 'ThrottledAutocompleteSuggestions', 'getIn',
    function ($scope, Autocomplete, getIn) {

        var autocomplete = new Autocomplete(400);

        $scope.showSuggestion = {
            start: false,
            stop: false
        };

        $scope.suggested = {
            start: [],
            stop: []
        };

        var triggerAutocomplete = function (fieldname) {
            var dirtyTerm = $scope.searchParams[fieldname];
            var term = (dirtyTerm  === null) || (dirtyTerm === undefined) ? "" : dirtyTerm;
            autocomplete.query(term).then(function (r) {
                $scope.suggested[fieldname] = r;
                if (r.length > 0) {
                    $scope.showSuggestion[fieldname] = true;
                } else {
                    $scope.hideSuggested(fieldname);
                }
            });
        };

        $scope.onFieldChange = function (fieldname) {
            $scope.selected[fieldname] = null;
            triggerAutocomplete(fieldname);
        };

        $scope.hideSuggested = function (fieldname) {
            $scope.showSuggestion[fieldname] = false;
        };

        $scope.select = function (suggestion, fieldname) {
            $scope.selected[fieldname] = suggestion;
            $scope.searchParams[fieldname] = suggestion.description;
            $scope.hideSuggested(fieldname);
        };
    }])

.controller('mapController', ['$scope', function ($scope) {

}]);

})(window.angular);