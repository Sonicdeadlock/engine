/**
 * Created by Sonicdeadlock on 3/1/2016.
 */
'use strict';

var app = angular.module('userApp', [
    'ngResource',
    'ngSanitize',
    'btford.socket-io',
    "luegg.directives"
]);

app.run(['$rootScope', '$http', function ($rootScope, $http) {
    $http.get('/auth/self').success(function (data) {
        $rootScope.logged_in_user = data;
    });
    $rootScope.hasPermission = function (perm) {
        var user = $rootScope.logged_in_user;
        if (!user || !user.group || !user.group.permissions) return false;
        var permissions = user.group.permissions;
        if (permissions.indexOf('god') != -1 || permissions.indexOf('sudo') != -1) return true;
        if (permissions.indexOf(perm) != -1) return true;
        return false;
    }
}]);

app.factory('socket', function (socketFactory) {
    return socketFactory({ioSocket: io.connect()});
});
