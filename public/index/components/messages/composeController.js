/**
 * Created by alexthomas on 1/3/16.
 */
 angular.module('controllers').controller('composeController',function($scope,$http,$state,$rootScope,$stateParams){
 	if($stateParams.userId){
 		$http.post('/api/users/getUser',{_id:$stateParams.userId}).success(function(data){
 			$scope.user = {username:data.username,id:$stateParams.userId}
 		});
 	}
	 if($stateParams.messageId){
         $scope.loadingPrecursor =true;
		 $http.get('/api/messages/'+$stateParams.messageId).success(function(data){
             $scope.loadingPrecursor =false;
			 var user = data[$stateParams.from=='true'?'toUser':'fromUser'];
			 $scope.user = {username:user.username,id:user._id};
			 $scope.replyBody = '\r'+data.body;
             if(data.replyBody)
                $scope.replyBody+='\r***\r'+data.replyBody;
			 $scope.title ='RE:'+data.title;
		 });
	 }
 	$scope.usernames = [];
 	$http.get('/api/messages/mine').success(function(data){
 		var sent = data.sent;
 		var received = data.recived;
		$scope.usernames= _.chain(sent).map(function(sentMsg){
			return {username:sentMsg.toUser.username,id:sentMsg.toUser._id};
		}).concat(
			_.map(received,function(receivedMsg){
				return {username:receivedMsg.fromUser.username,id:receivedMsg.fromUser._id};
			})
		)
			.uniqBy('id').value();


 	});
 	$scope.send = function(){
        if(!$scope.loadingPrecursor){
            if($scope.user && $scope.user.id){
                $http.post('/api/messages',{toUser:$scope.user.id,body:$scope.body,title:$scope.title,replyBody:$scope.replyBody}).success(function(){
                    $rootScope.updateInboxCount();
                    $state.go('inbox');
                });
            }else{
                $http.post('/api/users/getUser',{username:$scope.user}).success(function(data){
                    $http.post('/api/messages',{toUser:data._id,body:$scope.body,title:$scope.title,replyBody:$scope.replyBody}).success(function(){
                        $state.go('inbox');
                    });
                });
            }
        }


 	};
    $scope.body ='';
     $scope.addTextToBody = function (text) {
         $scope.body+=text;
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
