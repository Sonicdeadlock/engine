/**
 * Created by Alex on 7/10/2016.
 */
angular.module('controllers').controller('image_controller', ['$scope', 'Upload', function ($scope, Upload) {
    $scope.presetTolerances = [.1, .2, .3, .4, .5, .6, .7, .8, .9];
    $scope.tolerance = .43;
    // upload later on form submit or something similar
    $scope.submit = function () {
        if ($scope.form.file.$valid && $scope.file) {
            $scope.upload($scope.file);
        }
    };

    // upload on file select or drop
    $scope.upload = function (file) {
        Upload.upload({
            url: '/api/imageEngine/ITAI',
            data: {file: file, tolerance: $scope.tolerance, charset: $scope.charset}
        }).then(function (res) {
            $scope.renderedImageUrl = res.data + '?' + new Date().getTime();
        }, function (error) {
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        });
    };
    // for multiple files:
    // $scope.uploadFiles = function (files) {
    //     if (files && files.length) {
    //         for (var i = 0; i < files.length; i++) {
    //             Upload.upload({..., data: {file: files[i]}, ...})...;
    //         }
    //         // or send them all together for HTML5 browsers:
    //         Upload.upload({..., data: {file: files}, ...})...;
    //     }
    // }
}]);