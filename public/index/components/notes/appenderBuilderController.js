angular.module('controllers').controller('appenderBuilderController',function($scope,$http,$state,$rootScope) {
    $scope.name="";
    $scope.description="";
    $scope.appendString = "";
    $scope.note="";
    $scope.notes = [];
    $scope.buttonStyle="";
    $scope.buttonStyles=[
        {style:"btn btn-primary col-xs-12 col-sm-12 col-md-4 col-lg-3",name:'Primary'},
        {style:"btn btn-danger col-xs-12 col-sm-12 col-md-4 col-lg-3",name:'Danger'},
        {style:"btn btn-info col-xs-12 col-sm-12 col-md-4 col-lg-3",name:'Info'},
        {style:"btn btn-default col-xs-12 col-sm-12 col-md-4 col-lg-3",name:'Default'},
        {style:"btn btn-success col-xs-12 col-sm-12 col-md-4 col-lg-3",name:'Success'}
    ];

    $http.get('/api/notes/note').success(function(data){
        $scope.notes = data;
    });

    $scope.create = function(){
        var newAppender  = {
            name:$scope.name,
            description:$scope.description,
            note:$scope.note,
            appendString:$scope.appendString,
            buttonStyle:$scope.buttonStyle
        };
        if($scope.appendNewLine){
            newAppender.appendString+='\n';
        }
        $http.post('/api/notes/appender',newAppender).success(function(){
            $scope.name="";
            $scope.description="";
            $scope.note=undefined;
            $scope.appendString="";
            $scope.buttonStyle="";
            $scope.appendNewLine= false;
        })
    }

});
