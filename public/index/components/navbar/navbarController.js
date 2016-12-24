/**
 * Created by alexthomas on 1/19/16.
 */
angular.module('controllers').controller('navbarController', function ($scope, $http, $rootScope, socket) {
    $scope.logout = function () {
        $http.get('/auth/logout').success(function () {
            $rootScope.logged_in_user = undefined;
            if (socket)
                socket.disconnect();
        })
    }
});
