/**
 * Created by alexthomas on 7/21/15.
 */
angular.module('controllers').controller('navbarController', function ($scope, $http, $rootScope) {
    $scope.logout = function () {
        $http.get('/api/users/logout').success(function () {
            $rootScope.logged_in_user = undefined;
        })
    }
});