/**
 * Created by Sonicdeadlock on 5/9/2016.
 */
angular.module('controllers').controller('forumSearchController',function($scope,$http,$rootScope,$stateParams,$state){
    var pageSize = $stateParams.limit||15;
    var page=0;
    $scope.topic={children:{threads:[]}};
    $scope.getNextPage= function(){
        $scope.pageLoading = true;
        if($stateParams.tag){
            $scope.header = '#'+$stateParams.tag;
            $http.get('/api/forum/search/tag/'+$stateParams.tag+''+'?limit='+pageSize+'&skip='+(page*pageSize))
                .success(function(data){
                    $scope.pageLoading = false;
                    if(_.isEmpty(data))
                        $scope.atBottomOfTopic=true;
                    data.forEach(function(thread){
                        $scope.topic.children.threads.push(thread);
                    });

                });
        }
        if($stateParams.tags){
            if(_.isString($stateParams.tags))
            $stateParams.tags = _.map($stateParams.tags.split(' '),function(tag){
                if(tag.startsWith('#'))
                return tag.substr(1);
                else
                return tag;
            });
            $scope.header = '#'+$stateParams.tags.join(' #');
            $http.post('/api/forum/search/tags/'+'?limit='+pageSize+'&skip='+(page*pageSize),{tags:$stateParams.tags})
                .success(function(data){
                    $scope.pageLoading = false;
                    if(_.isEmpty(data))
                        $scope.atBottomOfTopic=true;
                    data.forEach(function(thread){
                        $scope.topic.children.threads.push(thread);
                    });

                });
        }
        page++;
    };
});