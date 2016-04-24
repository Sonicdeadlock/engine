/**
 * Created by Sonicdeadlock on 4/24/2016.
 */
angular.module('controllers').controller('updateNotesController',function($scope,$http,$rootScope){
    $scope.update_note = {release_time: _.now()};


    $scope.submit = function(){
        $http.post('/api/update_notes',$scope.update_note).success(function(data){
            $scope.update_note = {};
        })
    }
});