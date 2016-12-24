/**
 * Created by alexthomas on 7/21/15.
 */
angular.module('controllers').controller('registerController', function ($scope, $http, $state, $stateParams, $alert) {
    $scope.register = {};
    $scope.submit = function () {
        $http.post('/auth/register', $scope.register).success(function () {//redirect
            if ($stateParams.next)
                window.location = $stateParams.next;
            else
                window.location = "/";
        }).error(function (data, status) {
            if (_.isArray(data))
                data = data.join(',');
            if (status == 500)
                $scope.error = "Internal Server Error. Get Help";
            else
                $scope.error = data;
            console.log(data);
        });
    };
    $scope.checkUsername = function () {
        $scope.checkingUsername = true;
        $http.post('/api/users/getUser', {username: $scope.register.username})
            .success(function (data) {
                $scope.checkingUsername = false;
                $scope.usernameTaken = data != null;
            })
    }
});