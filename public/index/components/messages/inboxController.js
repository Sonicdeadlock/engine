/**
 * Created by alexthomas on 1/2/16.
 */
angular.module('controllers').controller('inboxController',function($scope,$http,$state,$rootScope,$stateParams){

    function updateMessages(){
        $http.get('/api/messages/mine').success(function(data){
            $scope.sent = data.sent;
            $scope.recived = data.recived;
            //TODO:check if a message id has been passed through the state params then show that message if it's available
            $rootScope.updateInboxCount();
        });
    }
    updateMessages();
    setInterval(updateMessages,10000);
    $scope.showSent = false;
    $scope.showReceived = true;
    $scope.toggleView = function(activeView){
        $scope.activeMessage = undefined;
        if(activeView=='sent'){
            $scope.showSent = true;
            $scope.showReceived = false;
        }
        else if(activeView == 'received'){
            $scope.showSent = false;
            $scope.showReceived = true;
        }
    };
    $scope.setActiveMessage = function(message){
        $http.get('/api/messages/'+message._id).success(function(data){
            data.body =  markdown.toHTML(data.body);
            if(data.replyBody)
            data.replyBody =  markdown.toHTML(data.replyBody);
            $scope.activeMessage = data;
        });
        if($scope.showReceived)
            $http.post('/api/messages/mark',{id:message._id}).success(updateMessages);
    };

    $scope.delete = function(message,$event){
        if($event)
            $event.stopPropagation();
        $http.delete('/api/messages/'+message._id).success(function(){
            $scope.activeMessage = undefined;
                updateMessages();
            });
    }

});
