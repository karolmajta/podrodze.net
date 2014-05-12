(function (angular) {
'use strict';

angular.module('podrodze', [
    'google-maps',
    'karolmajta.anydialog', 'karolmajta.anydialog.adapters.bootstrap',
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

    $rootScope.cachedMainPathQueryResult = null;
    $rootScope.cachedResults = [];

    $rootScope.mainRoute = {
        path: []
    };

}])

.controller('uiController', ['$scope', function ($scope) {
    $scope.searchboxes = true;
    $scope.queryboxes = $scope.mainRoute.path.length > 0;
    $scope.results = Boolean($scope.cachedResults);
    $scope.$watch('cachedMainPathQueryResult', function (is, was) {
        if (is) { $scope.queryboxes = true; }
    });
    $scope.$watch('cachedResults', function (is, was) {
        if (is) { $scope.results = Boolean($scope.cachedResults.length > 0); }
    });
}])

.controller('findRouteController',
    ['$rootScope', '$scope',
    function ($rootScope, $scope) {

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
            if (res.directions) {
                $rootScope.cachedMainPathQueryResult = res;
                $rootScope.cachedResults = [];
            }
        });
    };
}])

.controller('startStopFormController', ['$scope', '$timeout', 'ThrottledAutocompleteSuggestions',
function ($scope, $timeout, Autocomplete) {

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


    $scope.close = function () { $scope.$modal.hide({canceled: true}); };
}])

.controller('selectSearchParamsController',
    ['$scope', '$rootScope', 'cachedRoute', '$location',
    function ($scope, $rootScope) {

    var drawPath = function () {
        var route = $scope.cachedMainPathQueryResult;
        $scope.route = route;
        if (!route.directions) { return; }
        $rootScope.mainRoute.path = _.map(route.directions.routes[0].overview_path, function (ll) {
            return { latitude: ll.lat(), longitude: ll.lng() };
        });
        $rootScope.mainRoute.start = route.start;
        $rootScope.mainRoute.stop = route.stop;
        $rootScope.mainRoute.distance = _.reduce(route.directions.routes[0].legs, function (memo, l) {
            return memo + l.distance.value;
        }, 0);
        var path = $rootScope.mainRoute.path;
        var vectorPointSum = _.reduce(path, function (memo, p) {
            return {latitude: memo.latitude + p.latitude, longitude: memo.longitude + p.longitude};
        }, {latitude: 0, longitude: 0});
        $rootScope.map.center = {
            latitude: vectorPointSum.latitude / path.length,
            longitude: vectorPointSum.longitude / path.length
        };
        var ne = route.directions.routes[0].bounds.getNorthEast();
        var se = route.directions.routes[0].bounds.getSouthWest();
        $rootScope.map.bounds = {
            northeast: { latitude: ne.lat(), longitude: ne.lng() },
            southwest: { latitude: se.lat(), longitude: se.lng() }
        };
    };

    $scope.$watch('cachedMainPathQueryResult', function () {
        drawPath();
    });

}])

.controller('selectVenuesFormController',
    ['$rootScope', '$scope', function ($rootScope, $scope) {

    $scope.venues = {
        parks: true,
        hotels: true,
        food: true,
        museums: true
    };

    $scope.findPlaces = function () {
        $scope.$placesSearchModal.show({
            points: $scope.mainRoute.path,
            distance: $scope.mainRoute.distance,
            keyword: $scope.keyword
        }).result.then(function (res) {
            $rootScope.cachedResults = _.values(res.places).map(function (p) {
                return _.extend({}, p, {
                    latitude: p.geometry.location.lat(),
                    longitude: p.geometry.location.lng()
                });
            });
        });
    };

}])

.controller('placesSearchModalController',
    ['$scope', '$timeout', '$q', 'Places',
    function ($scope, $timeout, $q, Places) {

    var mindist = $scope.distance / 30;
    var minRadius = mindist;

    var queriedPoints = [{center: $scope.points[0], radius: minRadius}];
    var anchorPoint = $scope.points[0];
    for(var i = 1; i < $scope.points.length; i++) {
        var currPoint = $scope.points[i-1];
        // haversine formula copypasta
        var R = 6371; // km
        var f1 = anchorPoint.latitude/180 * Math.PI;
        var f2 = currPoint.latitude/180 * Math.PI;
        var df = f2 - f1;
        var dl = (currPoint.longitude - anchorPoint.longitude)/180 * Math.PI;

        var a = Math.sin(df/2) * Math.sin(df/2) +
            Math.cos(f1) * Math.cos(f2) *
            Math.sin(dl/2) * Math.sin(dl/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        var dist = R * 1000 * c;
        // end haversine copypasta
        if (dist > mindist) {
            anchorPoint = currPoint;
            queriedPoints.push({center: currPoint, radius: Math.max(dist, minRadius)});
        }
    }

    var responsePromises = [];
    var allQueried = $q.defer();
    $scope.currentIdx = 1;
    $scope.totalLen = queriedPoints.length;
    var queryPoint = function (idx) {
        if (idx >= queriedPoints.length) {
            allQueried.resolve(responsePromises);
        } else {
            $timeout(function () {
                var p = Places.queryNearby(
                    queriedPoints[idx],
                    $scope.keyword,
                    []
                );
                responsePromises.unshift(p);
                p.then(function () { $scope.currentIdx++; queryPoint(idx+1); });
            }, 150);
        }
        return allQueried.promise;
    };

    queryPoint(0).then(function (allQueried) {
        var allFetched = $q.all(allQueried);
        allFetched.then(function (r) {
            var res = {};
            _.each(r, function (arr) {
                _.each(arr, function (item) {
                    res[item.id] = item;
                });
            });
            $scope.$modal.hide({places: res});
        });
    });

    $scope.close = function () {
        $scope.$modal.hide({canceled: true});
    };
}]);

})(window.angular);