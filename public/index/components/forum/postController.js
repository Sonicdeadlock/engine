/**
 * Created by alexthomas on 5/6/16.
 */
angular.module('controllers').controller('postController',function($scope,$http,$rootScope,$stateParams,$state){

    function update(){
        $http.get('/api/forum/posts/'+$stateParams.postId).success(function(data){
            populatePostHTML(data);
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
    function populatePostHTML(post){
        post.htmlMarkdown = getHTMLMarkdown(post);
        if(post.replies){
            post.replies.forEach(function(reply){
                populatePostHTML(reply);
            });
        }
    }
    $scope.edit = function(post){
        $scope.postEditing = _.cloneDeep(post);
    };
    function getHTMLMarkdown(post){
        return markdown.toHTML(post.body);
    };

    $scope.mark = function(type,post){
        $http.patch('/api/forum/posts/'+post._id+'/mark/'+type,{}).success(function(result){
            _.assign(post,result);
        })
    };

    $scope.hasMarkedType = function(type,post){
        if(type==="agree" && post.agreedBy.indexOf($rootScope.logged_in_user._id)!=-1){
            return true;
        }
        else if(type==="informative" && post.markedInformativeBy.indexOf($rootScope.logged_in_user._id)!=-1){
           return true;
        }
        else if(type==="funny" && post.markedFunnyBy.indexOf($rootScope.logged_in_user._id)!=-1){
             return true;
        }
        else if(type==="thumbsUp" && post.thumbedUpBy.indexOf($rootScope.logged_in_user._id)!=-1){
            return true;
        }
        return false;
    }
}) .directive('forumPost',function(){
    return{
        templateUrl:'components/forum/postDirective.html'
    }

});
