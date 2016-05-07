/**
 * Created by alexthomas on 5/6/16.
 */
angular.module('controllers').controller('postController',function($scope,$http,$rootScope,$stateParams,$state){

    function update(){
        $http.get('/api/forum/posts/'+$stateParams.postId).success(function(data){
            data.htmlBody = markdown.toHTML(data.body);
            $scope.post = data;
        }).error(function(err){
            $scope.err =err;
        });
    }
    update();
    $scope.save =function(){
        $http.patch('/api/forum/posts/'+$scope.postEditing._id,{body:$scope.postEditing.body})
            .success(function(){
                update();
                $scope.postEditing=undefined;
            }).error(function(err){
            $scope.err =err;
        });
    };
    $scope.delete = function(){
        $http.delete('/api/forum/posts/'+$stateParams.postId)
            .success(function(){
                $state.go('forum');
            }).error(function(err){
            $scope.err =err;
        });
    };
    $scope.edit = function(post){
        $scope.postEditing = _.cloneDeep(post);
    };
});
