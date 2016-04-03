
if ('Notification' in window && Notification.permission !== "granted")
    Notification.requestPermission();
angular.module('controllers').controller('chatController',function($scope,$http,$state,$rootScope,$cookies,socket){

    $scope.chats = [];
    $scope.distplayHistory = [];
    $scope.mods = [];
    $scope.modTypes = [
        {
            name:'removeCharacter',
            template:{remove:''}
        },
        {
            name:'l337',
            template:{chance:10}
        }
    ];

    var historyId = 0;
    var history = [];
    $scope.newRoom = {deleteable:true};
    $scope.chatRoom = undefined;
    $scope.rooms =[];
    socket.emit('getRooms',{});
    socket.on('chatServerToClient',function(message){
       $scope.chats.push(message);
        if(document.body.className=='blurred'){
            if(Notification && $scope.showAlert){
                var notification = new Notification(message.username, {
                    body: strip(message.text)
                });
                notification.onShow=setTimeout(function(){notification.close();},settings.notifcationDuration || 2000);
                notification.onClick=function(x) { window.focus(); this.cancel(); };
            }
        }
    });

    socket.on('chatRooms',function(rooms){
        $scope.rooms = rooms;
    });
    socket.on('connect',function(){
       if($scope.chatRoom){
           socket.emit('chatEnterRoom',$scope.chatRoom);
       }
    });
    $scope.sendChat = function(){
        socket.emit('chatClientToServer',{text:$scope.chatBox,mods:$scope.mods});
        history.push($scope.chatBox);
        historyId = history.length -1;
        $scope.distplayHistory = _.chain(history)
            .uniq()
            .takeRight(5)
            .reverse()
            .value();
        $scope.chatBox = '';
    };

    $scope.keyHandle = function($event){
        var keyCode = $event.keyCode;
        switch (keyCode){
        case 38: //up
            if(historyId==-1){
                historyId=history.length-1;
            }else if(historyId!=0){
                historyId--;
            }
           $scope.chatBox = history[historyId];
            break;
        case 40: //down
            if(historyId==-1){
                historyId=historyId.length-1;
            }else if(historyId+1!=history.length){
                historyId++;
            }
            $scope.chatBox = history[historyId];
            break;
        default:
            return;
        }
    };

    $scope.menuAside = {
        title:"Settings"
    };

    $scope.addMod = function(modType){
        $scope.mods.push({
            name:modType.name,
            attributes: _.cloneDeep(modType.template)
        })
    };

    $scope.removeMod = function(mod){
        _.pull($scope.mods,mod);
    };

    $scope.addRoom = function(){
        socket.emit('addRoom',$scope.newRoom);
    };

    $scope.deleteRoom = function(room){
        var roomId = room._id;
      socket.emit('deleteRoom',roomId);
    };

    $scope.enterRoom = function(room){
        socket.emit('chatEnterRoom',room);
        $scope.chatRoom = room;
    };


    //settings
    $scope.showRank=$cookies.getObject('showRank');
    $scope.$watch('showRank',function(val){
        $cookies.put('showRank',val);
    });
    $scope.showTime=$cookies.getObject('showTime');
    $scope.$watch('showTime',function(val){
        $cookies.put('showTime',val);
    });
    $scope.showAlert=$cookies.getObject('showAlert');
    $scope.$watch('showAlert',function(val){
        $cookies.put('showAlert',val);
    });

    if($scope.showTime == undefined)
        $scope.showTime=true;

})
    .filter('startCase',function(){
        return function(input){
            return _.startCase(input);
        }
    }).directive('room',function(){
    return{
        templateUrl:'components/chat/roomIconTemplate.html'
    }
});

function strip(html)
{
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}
function onBlur() {
    document.body.className = 'blurred';
}
function onFocus(){
    document.body.className = 'focused';
}

if (/*@cc_on!@*/false) { // check for Internet Explorer
    document.onfocusin = onFocus;
    document.onfocusout = onBlur;
} else {
    window.onfocus = onFocus;
    window.onblur = onBlur;
}