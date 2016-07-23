/**
 * Created by alexthomas on 12/12/15.
 */

angular.module('controllers').controller('userPageController',function($scope,$http,$state,$rootScope,$stateParams){
    var forumPostPage =0;
    var pageSize = 15;
    $scope.activities = [];
    $http.post('/api/users/getUser',{_id:$stateParams.userId}).success(function(data){
        $scope.userData = data;
        if(data.group){
            $http.get('/api/permissionGroups/'+data.group._id).success(function(data){
                $scope.userData.group = data[0];
            })
        }
    });
    $scope.getNextForumPostPage = function(){
        $scope.forumPostPageLoading = true;

        $http.get("/api/forum/posts/user/"+$stateParams.userId+"?limit="+pageSize+"&skip="+(forumPostPage*pageSize)).success(function(data){
            $scope.forumPostPageLoading = false;
            if(_.isEmpty(data)){
                $scope.bottomOfForumPostData = true;
            }else{
                data.forEach(function(post){
                    post.activityType = 'post';
                    $scope.activities.push(post);
                })
            }
        })
        .error(function(err){
            $scope.forumPostPageLoading =false;
            $scope.bottomOfForumPostData = true;
        });
        forumPostPage++;
    };

    $scope.getHTMLMarkdown=function(post){
        if(post.body)
            return markdown.toHTML(post.body);
        else
            return post.htmlBody;
    };
    $scope.userId = $stateParams.userId;
});
