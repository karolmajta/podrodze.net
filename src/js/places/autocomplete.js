(function (angular) {
'use strict';

angular.module('podrodze.places.autocomplete', ['$googlePlacesLibrary'])

.service('AutocompleteSuggestions', ['$q', '$places', function ($q, $places) {

    var autocomplete = new $places.AutocompleteService();

    this.query = function (str) {
        var d = $q.defer();
        autocomplete.getQueryPredictions({input: str}, function (res) {
            d.resolve(res);
        });
        return d.promise;
    }
}])

.factory('ThrottledAutocompleteSuggestions',
    ['$q', '$timeout', 'AutocompleteSuggestions',
    function ($q, $timeout, AutocompleteSuggestions) {

    var pendingRequest = null;
    var pendingResponse = null;

    return function (millis) {
        this.query = function (str) {
            if (pendingRequest !== null && pendingResponse === null) {
                return $q.reject(null);
            }
            $timeout.cancel(pendingRequest);
            var d = $q.defer();
            pendingRequest = $timeout(function () {
                var p = AutocompleteSuggestions.query(str);
                pendingResponse = p;
                p.then(function (res) {
                    if (pendingResponse === p) {
                        d.resolve(res);
                    } else {
                        d.reject(res);
                    }
                });
            }, millis);
            return d.promise;
        }
    }
}]);

})(window.angular);