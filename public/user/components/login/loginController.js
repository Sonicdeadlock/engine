angular.module('controllers').controller('loginController',function($scope,$http,$state,$alert,$rootScope,socket){
    var errors = [];
    $scope.login = function(){
        $http.post('/auth/login',{username:$scope.username,password:$scope.password}).success(function(data){
            $rootScope.logged_in_user = data;
            $scope.error=undefined;
            if(socket && socket.connect && socket.disconnect){
                socket.disconnect();
                setTimeout(socket.connect,300);
            }


        })
            .error(function(data,status){


                if(data) {
                       $scope.error = data.message;
                }
                else if(status == 500)  $scope.error='Internal Server Error';
                else   $scope.error='Unknown Error';
            })
    }
});

angular.module('directives').directive('login',function(){
    return {
        templateUrl:"components/login/loginDirective.html",
        controller:'loginController',
        restrict:'E'
    }
});
