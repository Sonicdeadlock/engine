angular.module('controllers').controller('appenderController', function ($scope, $http, $state, $rootScope, $timeout, $alert) {
    $scope.appenders = [];
    $http.get("/api/notes/appender").success(function (data) {
        $scope.appenders = data;
    });
    var alertQueue = [];

    function showNextAlert() {
        alertQueue.pop();
        if (alertQueue.length !== 0) {
            alertQueue[0].show();
            alertQueue[0].onHide = function () {
                showNextAlert();
            }
        }
    }

    $scope.btnClick = function (appenderId) {
        $http.get('api/notes/appender/' + appenderId).success(function () {
            alertQueue.push($alert({
                title: "Successfully submitted",
                type: "success",
                show: true,
                container: "#alerts-container",
                duration: 3
            }));

        });
    }
});
