/**
 * Created by alexthomas on 1/3/16.
 */
 angular.module('controllers').controller('composeController',function($scope,$http,$state,$rootScope,$stateParams){
 	if($stateParams.userId){
 		$http.post('/api/users/getUser',{_id:$stateParams.userId}).success(function(data){
 			$scope.user = {username:data.username,id:$stateParams.userId}
 		});
 	}
 	$scope.usernames = [];
 	$http.get('/api/messages/mine').success(function(data){
 		var sent = data.sent;
 		var recived = data.recived;
 		var usernames = [];
 		for (var i = 0; i < sent.length; i++) {
 			usernames.push({username:sent[i].toUser.username,id:sent[i].toUser._id});
 		};
 		for (var i = 0; i < recived.length; i++) {
 			usernames.push({username:recived[i].fromUser.username,id:recived[i].fromUser._id});
 		};
 		$scope.usernames = _.uniq(usernames,'id');
 	});
 	$scope.send = function(){
 		if($scope.user && $scope.user.id){
 			$http.post('/api/messages',{toUser:$scope.user.id,body:$scope.body,title:$scope.title}).success(function(){
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
