/**
 * Created by alexthomas on 12/12/15.
 */

angular.module('controllers').controller('userPageController',function($scope,$http,$state,$rootScope,$stateParams){
    $http.post('/api/users/getUser',{_id:$stateParams.userId}).success(function(data){
        $scope.userData = data;
        if(data.group){
            $http.get('/api/permissionGroups/'+data.group).success(function(data){
                $scope.userData.group = data[0];
            })
        }
    });
    $scope.userId = $stateParams.userId;
});
