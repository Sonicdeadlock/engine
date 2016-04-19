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
 		var usernames = _.chain(sent).map(function(sentMsg){
			return {username:sentMsg.toUser.username,id:sentMsg.toUser._id};
		}).concat(
			_.map(recived,function(recivedMsg){
				return {username:recivedMsg.fromUser.username,id:recivedMsg.fromUser._id};
			})
		)
			.uniqBy('id').value();

		$scope.usernames = usernames;
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
