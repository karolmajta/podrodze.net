(function (angular) {
'use strict';

angular.module('podrodze.places.directions', ['ngResource', '$googleMapsLibrary'])

    .service('Places', ['$q', '$places', '$maps', function ($q, $places, $maps) {

        var places = new $places.PlacesService(angular.element('<div></div>')[0]);

        this.getByReference = function (reference) {
            var d = $q.defer();
            places.getDetails({reference: reference}, function (res) {
                res ? d.resolve(res) : d.reject(res);
            });
            return d.promise;
        };

        this.queryByName = function (name) {
            var d = $q.defer();
            places.textSearch({query: name}, function (res) {
                res ? d.resolve(res) : d.reject(res);
            });
            return d.promise;
        };

        this.queryNearby = function (area, keyword, venues) {
            var request = {
                location: new $maps.LatLng(area.center.latitude, area.center.longitude),
                radius: area.radius,
                types: venues,
                keyword: keyword
            };
            var d = $q.defer();
            places.nearbySearch(request, function (res) { d.resolve(res); });
            return d.promise;
        };
    }])

    .service('Directions', ['$q', '$maps', function ($q, $maps) {

        var directions = new $maps.DirectionsService();

        this.query = function (start, stop) {
            var d = $q.defer();
            directions.route({
                origin: start,
                destination: stop,
                travelMode: $maps.TravelMode.DRIVING
            },function (res, status) {
                status == 'OK' ? d.resolve(res) : d.reject([]);
            });
            return d.promise;
        };

    }]);

})(window.angular);