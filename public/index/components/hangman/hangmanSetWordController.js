/**
 * Created by alexthomas on 4/14/16.
 */
angular.module('controllers').controller('hangmanSetWordController',function($scope,$http,$state,$stateParams){
    $scope.set=function(){
        $http.post('/api/hangman/set',{
            word:$scope.word,
            token:$stateParams.token
        }).success(function(){
            $scope.success = true;
            $scope.error = false;
        })
            .error(function(data){
                $scope.error = data;
                $scope.success = false;
            })
    }
});