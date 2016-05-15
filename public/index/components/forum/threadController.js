/**
 * Created by alexthomas on 5/5/16.
 */
angular.module('controllers').controller('threadController',function($scope,$http,$rootScope,$stateParams,$state){
    var pageSize = $stateParams.limit||15;
    var page=0;
    $scope.errs = [];
    $scope.replyText='';
    if($stateParams.threadId){
        $scope.pageLoading=true;
        $http.patch('/api/forum/threads/'+$stateParams.threadId+'/view');
        function update(){
            $http.get('/api/forum/threads/'+$stateParams.threadId+'?limit='+pageSize)
                .success(function(data){
                    page=0;
                    $scope.atBottomOfThread=false;
                    $scope.pageLoading=false;
                    data.history.forEach(function(event){
                       data.posts.push({htmlBody:event.actor.username+" "+event.action+'ed this post at '+event.date,creationTime:event.date,lastUpdateTime:event.date})
                    });
                    $scope.thread = data;

                }).error(function(err){$scope.errs.push(err);$scope.pageLoading=false;$scope.atBottomOfThread=true;});
        }
        update();
        $scope.save =function(){
            $http.patch('/api/forum/posts/'+$scope.postEditing._id,{body:$scope.postEditing.body})
                .success(function(){
                    update();
                    $scope.postEditing=undefined;
                }).error(function(err){$scope.errs.push(err)});
        };
        $scope.deleteThread = function(){
            $http.delete('/api/forum/threads/'+$stateParams.threadId)
                .success(function(){
                    $state.go('forum');
                })
        };
    }
    else{
        $scope.newThread = {topic:$stateParams.topicId};
        $scope.newPost = {};
        $scope.save = function(){
            $http.post('/api/forum/threads',$scope.newThread)
                .success(function(data){
                    $scope.newPost.thread = data._id;
                    $http.post('/api/forum/posts',$scope.newPost)
                        .success(function(){
                            window.location.href='/#/forum/thread/'+data._id;
                        }).error(function(err){$scope.errs.push(err)});
                }).error(function(err){$scope.errs.push(err)});
        }
    }
    $scope.reply = function(){
        $http.post('/api/forum/posts'+(($scope.replyPost)?('/'+$scope.replyPost._id+'/reply'):''),{
            body:$scope.replyText,
            thread:$scope.thread._id
        })
            .success(function(){
                $scope.replyText='';
                $scope.replyPost = undefined;
                update();
            }).error(function(err){$scope.errs.push(err)});
    };
    $scope.delete = function(post){
        $http.delete('/api/forum/posts/'+post._id)
            .success(update).error(function(err){$scope.errs.push(err)});
    };
    $scope.getNextPage= function(){
      $scope.pageLoading = true;
        page++;
        $http.get('/api/forum/threads/'+$stateParams.threadId+'?limit='+pageSize+'&skip='+(page*pageSize))
            .success(function(data){
                $scope.pageLoading = false;
                if(_.isEmpty(data.posts))
                $scope.atBottomOfThread=true;
               data.posts.forEach(function(post){
                   if(post.body){
                       $scope.thread.posts.push(post);
                   }

               });

            }).error(function(err){$scope.errs.push(err);$scope.pageLoading=false;$scope.atBottomOfThread=true;});
    };


    $scope.edit = function(post){
        $scope.postEditing = _.cloneDeep(post);
    };

    $scope.pin = function(){
        $http.patch('/api/forum/threads/'+$stateParams.threadId+'/pin').success(update).error(function(err){$scope.errs.push(err)});
    };
    $scope.unpin = function(){
        $http.patch('/api/forum/threads/'+$stateParams.threadId+'/unpin').success(update).error(function(err){$scope.errs.push(err)});
    };
    $scope.lock = function(){
        $http.patch('/api/forum/threads/'+$stateParams.threadId+'/lock').success(update).error(function(err){$scope.errs.push(err)});
    };
    $scope.unlock = function(){
        $http.patch('/api/forum/threads/'+$stateParams.threadId+'/unlock').success(update).error(function(err){$scope.errs.push(err)});
    };

    $scope.addTextToReply = function (text) {
        $scope.replyText+=text;
    };

    $scope.startReply = function(post){
        $('html, body').animate({
            scrollTop: $("#main-reply-panel").offset().top
        }, 2000);
        $("#main-reply-panel textarea").focus();
        $scope.replyPost = post;
    };

    $scope.getHTMLMarkdown=function(post){
        return markdown.toHTML(post.body);
    }
});

$(document).delegate('textarea', 'keydown', function(e) {
    var keyCode = e.keyCode || e.which;

    if (keyCode == 9) {
        e.preventDefault();
        var start = $(this).get(0).selectionStart;
        var end = $(this).get(0).selectionEnd;

        // set textarea value to: text before caret + tab + text after caret
        $(this).val($(this).val().substring(0, start)
            + $(this).val().substring(end));

        // put caret at right position again
        $(this).get(0).selectionStart =
            $(this).get(0).selectionEnd = start + 1;
    }
});