(function (angular) {
'use strict';

angular.module('podrodze.utils', [])

.constant('getIn', function (obj, path) {
    var currentObj = obj;
    path.forEach(function (k) {
        currentObj = currentObj === undefined || currentObj === null ?
                     undefined : currentObj[k];
    });
    return currentObj;
});

})(window.angular);