/**
 * Created by alexthomas on 1/19/16.
 */
angular.module('controllers').controller('homeController', function ($scope, $http, $state) {
    var page_size = 10;
    $http.get('/api/update_notes?limit=' + page_size).success(function (data) {
        $scope.update_notes = data;
    });
    $http.get('/api/update_notes/count').success(function (data) {
        $scope.note_count = data;
        $scope.pages = _.times(Math.ceil(data / page_size), Number);

    });

    $scope.page = function (page) {
        $http.get('/api/update_notes?limit=' + page_size + '&skip=' + page_size * page).success(function (data) {
            $scope.update_notes = data;
            $scope.currentPage = page;
        });
    };

    $scope.currentPage = 0;

});