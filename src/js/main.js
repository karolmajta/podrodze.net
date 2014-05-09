(function (angular) {
'use strict';

angular.module('podrodze', [
    'google-maps',
    'karolmajta.anydialog', 'karolmajta.anydialog.adapters.bootstrap',
    'podrodze.routes',
    'podrodze.config',
    'podrodze.views',
    'podrodze.utils',
    'podrodze.places'])

.controller('appController', ['$rootScope', function ($rootScope) {

    $rootScope.map = {
        center: {
            latitude: 45,
            longitude: -73
        },
        zoom: 8
    };

    $rootScope.mainRoutePolyline = {
        path: []
    };

}])

.controller('findRouteController',
    ['$scope', '$location', 'cachedRoute',
    function ($scope, $location, cachedRoute) {

    $scope.selected = {
        start: null,
        stop: null
    };

    $scope.searchParams = {};

    $scope.findRoute = function () {
        var directionParams = {
            start: {
                isReference: Boolean($scope.selected.start),
                value: $scope.selected.start ?
                    $scope.selected.start.reference : $scope.searchParams.start,
                name: $scope.searchParams.start
            },
            stop: {
                isReference: Boolean($scope.selected.stop),
                value: $scope.selected.stop ?
                    $scope.selected.stop.reference : $scope.searchParams.stop,
                name: $scope.searchParams.stop
            }
        };
        $scope.$directionSearchModal.show(directionParams).result.then(function (res) {
            var next = res.directions.routes.next > 1 ? '/routes' : 'route';
            cachedRoute.set(res);
            $location.path(next);
        });
    };
}])

.controller('startStopFormController', ['$scope', '$timeout', 'ThrottledAutocompleteSuggestions', 'getIn',
function ($scope, $timeout, Autocomplete, getIn) {

    var autocomplete = new Autocomplete(300);

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
        $timeout(function () { $scope.showSuggestion[fieldname] = false; }, 300);
    };

    $scope.select = function (suggestion, fieldname) {
        $scope.selected[fieldname] = suggestion;
        $scope.searchParams[fieldname] = suggestion.description;
        $scope.hideSuggested(fieldname);
    };
}])

.controller('directionSearchModalController',
    ['$q', '$scope', 'Places', 'Directions',
    function ($q, $scope, Places, Directions) {

    var start = $scope.start;
    var stop = $scope.stop;
    $scope.didFail = false;

    var handleFailure = function () { $scope.didFail = true; };

    var fetchedPlaces = { start: null, stop: null };
    if (start.isReference) {
        fetchedPlaces.start = Places.getByReference(start.value);
    } else {
        fetchedPlaces.start = Places.queryByName(start.value).then(function (r) {
            return r.length > 0 ? r[0] : $q.reject(r);
        });
    }
    if (stop.isReference) {
        fetchedPlaces.stop = Places.getByReference(stop.value);
    } else {
        fetchedPlaces.stop = Places.queryByName(stop.value).then(function (r) {
            return r.length > 0 ? r[0] : $q.reject(r);
        });
    }

    $q.all([fetchedPlaces.start, fetchedPlaces.stop]).then(function (ends) {
        var start = ends[0];
        var stop = ends[1];
        var startLoc = ends[0].geometry.location;
        var stopLoc = ends[1].geometry.location;
        Directions.query(startLoc, stopLoc).then(function (res) {
            if ($scope.$modal) {
                $scope.$modal.hide({
                    start: {location: startLoc, place: start},
                    stop: {location: stopLoc, place: stop},
                    directions: res
                });
            } else {
                $scope.$watch('$modal', function () {
                    if ($scope.$modal) {
                        $scope.$modal.hide({
                            start: {location: startLoc, place: start},
                            stop: {location: stopLoc, place: stop},
                            directions: res
                        });
                    }
                });
            }
        }, handleFailure);
    }, handleFailure);


    $scope.close = function () { $scope.$modal.hide({cancelled: true}); };
}])

.controller('selectSearchParamsController',
    ['$scope', '$rootScope', 'cachedRoute', '$location',
    function ($scope, $rootScope, cachedRoute, $location) {

    console.log(cachedRoute.get());
    var route = cachedRoute.get();
    if(route === null) {
        $location.path('/');
    } else if (route.directions.routes.length > 1) {
        $location.path('/routes');
    } else {
        $scope.route = route;
        $rootScope.mainRoutePolyline.path = _.map(route.directions.routes[0].overview_path, function (ll) {
            return { latitude: ll.lat(), longitude: ll.lng() };
        });
        console.log($rootScope.mainRoutePolyline.path);
    }
}]);

})(window.angular);