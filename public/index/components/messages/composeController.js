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
		 $http.get('/api/messages/'+$stateParams.messageId).success(function(data){
			 var user = data[$stateParams.from=='true'?'toUser':'fromUser'];
			 $scope.user = {username:user.username,id:user._id};
			 $scope.body= '\r'+_.repeat('-',10)+'\r'+data.body;
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
 		if($scope.user && $scope.user.id){
 			$http.post('/api/messages',{toUser:$scope.user.id,body:$scope.body,title:$scope.title}).success(function(){
				$rootScope.updateInboxCount();
 				$state.go('inbox');
 			});
 		}else{
 			$http.post('/api/users/getUser',{username:$scope.user}).success(function(data){
 				$http.post('/api/messages',{toUser:data._id,body:$scope.body,title:$scope.title}).success(function(){
 					$state.go('inbox');
 				});
 			});
 		}

 	}
 });
