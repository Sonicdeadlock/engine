/**
 * Created by alexthomas on 5/5/16.
 */
angular.module('controllers').controller('forumController',function($scope,$http,$rootScope,$stateParams,$state){
    $scope.topics = [];

    if($stateParams.topicId){
        $scope.pageLoading = true;
        var pageSize = $stateParams.limit||15;
        var page=0;
        $http.get('/api/forum/topics/'+$stateParams.topicId)
            .success(function(data){
                var topic = data;
                    $http.get('/api/forum/topics/'+topic._id+'/children')
                        .success(function(data){
                            $scope.pageLoading = false;
                            topic.children = data;
                            $scope.topic = topic;
                            $scope.topics.push(topic);
                        })
            });
        $scope.getNextPage= function(){
            $scope.pageLoading = true;
            page++;
            $http.get('/api/forum/topics/'+$stateParams.topicId+'/children'+'?limit='+pageSize+'&skip='+(page*pageSize))
                .success(function(data){
                    $scope.pageLoading = false;
                    if(_.isEmpty(data.threads))
                        $scope.atBottomOfTopic=true;
                    data.threads.forEach(function(thread){

                        $scope.topic.children.threads.push(thread);
                    });

                });
        };
    }else if($stateParams.parent){
        $scope.iconStyles = ['primary','danger','info','success','warning','default','muted'];
        $scope.newTopic = {parent:$stateParams.parent};
        $http.get('/api/forum/topics/'+$stateParams.parent)
            .success(function(data){$scope.parent=data});

        $scope.save = function(){
            $http.post('/api/forum/topics',$scope.newTopic)
                .success(function(){
                    $state.go('forum');
                })
        }
    }
    else{
        $http.get('/api/forum/topics')
            .success(function(data){
                _.forEach(data,function(topic){
                    $http.get('/api/forum/topics/'+topic._id+'/children')
                        .success(function(data){
                            topic.children = data;
                            $scope.topics.push(topic);
                        })
                });
            })
    }




});