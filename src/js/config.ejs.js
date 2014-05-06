(function (angular) {
'use strict';

angular.module('podrodze.config', [])
    .constant('CONFIG', {
        version: '<%= data.pkg.version %>'
    });

})(window.angular);