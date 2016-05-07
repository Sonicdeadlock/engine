/**
 * Created by alexthomas on 5/5/16.
 */
angular.module('controllers').controller('threadController',function($scope,$http,$rootScope,$stateParams,$state){
    var pageSize = $stateParams.limit||15;
    var page=0;
    $scope.replyText='';
    if($stateParams.threadId){
        $http.patch('/api/forum/threads/'+$stateParams.threadId+'/view');
        function update(){
            $http.get('/api/forum/threads/'+$stateParams.threadId+'?limit='+pageSize)
                .success(function(data){
                    page=0;
                    $scope.atBottomOfThread=false;
                    data.posts.forEach(function(post){
                        post.htmlBody = markdown.toHTML(post.body);
                    });
                    data.history.forEach(function(event){
                       data.posts.push({htmlBody:event.actor.username+" "+event.action+'ed this post at '+event.date,creationTime:event.date,lastUpdateTime:event.date,_id:'notanID'})
                    });
                    $scope.thread = data;

                });
        }
        update();
        $scope.save =function(){
            $http.patch('/api/forum/posts/'+$scope.postEditing._id,{body:$scope.postEditing.body})
                .success(function(){
                    update();
                    $scope.postEditing=undefined;
                })
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
                            //$state.go('thread({threadId:"'+data._id+'"})');
                            window.location.href='/#/forum/thread/'+data._id;
                        })
                })
        }
    }
    $scope.reply = function(){
        $http.post('/api/forum/posts',{
            body:$scope.replyText,
            thread:$scope.thread._id
        })
            .success(function(){
                $scope.replyText='';
                update();
            })
    };
    $scope.delete = function(post){
        $http.delete('/api/forum/posts/'+post._id)
            .success(update);
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
                   post.htmlBody = markdown.toHTML(post.body);
                   $scope.thread.posts.push(post);
               });

            });
    };


    $scope.edit = function(post){
        $scope.postEditing = _.cloneDeep(post);
    };

    $scope.pin = function(){
        $http.patch('/api/forum/threads/'+$stateParams.threadId+'/pin').success(update);
    };
    $scope.unpin = function(){
        $http.patch('/api/forum/threads/'+$stateParams.threadId+'/unpin').success(update);
    };
    $scope.lock = function(){
        $http.patch('/api/forum/threads/'+$stateParams.threadId+'/lock').success(update);
    };
    $scope.unlock = function(){
        $http.patch('/api/forum/threads/'+$stateParams.threadId+'/unlock').success(update);
    };

    $scope.addTextToReply = function (text) {
        $scope.replyText+=text;
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
            + "\t"
            + $(this).val().substring(end));

        // put caret at right position again
        $(this).get(0).selectionStart =
            $(this).get(0).selectionEnd = start + 1;
    }
});