/**
 * Created by alexthomas on 1/19/16.
 */
angular.module('controllers').controller('remove_characterController', function ($scope, $http, $state) {
    $scope.evaluate = function () {
        $http.post('/api/textEngine/remove', {text: $scope.text, remove: $scope.remove}).success(function (data) {
            $scope.output = data;
        })
    }
});