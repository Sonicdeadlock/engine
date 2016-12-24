/**
 * Created by alexthomas on 1/19/16.
 */
angular.module('controllers').controller('replace_characterController', function ($scope, $http, $state) {
    $scope.evaluate = function () {
        $http.post('/api/textEngine/leet', {text: $scope.text, chance: 100}).success(function (data) {
            $scope.output = data;
        })
    }
});