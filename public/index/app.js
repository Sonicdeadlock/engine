/**
 * Created by Sonicdeadlock on 3/1/2016.
 */
'use strict';

var app = angular.module('userApp', [
    'ngResource',
    'ui.router',
    'controllers',
    'services',
    'directives',
    'ngSanitize',
    'btford.socket-io',
    'luegg.directives',
    'uiSwitch',
    'yaru22.angular-timeago',
    'infinite-scroll'

]);

app.run(['$rootScope', '$state', '$stateParams','$http','$window','$location', function ($rootScope, $state, $stateParams,$http,$window,$location) {
    $rootScope.$on("$stateChangeError", console.log.bind(console));

    //Save a copy of the parameters so we can access them from all the controllers
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.updateInboxCount = function(){
      $http.get('/api/messages/mine').success(function(data){
          $rootScope.inboxCount = _.filter(data.received,{read:false}).length;
          setTimeout($rootScope.updateInboxCount,
          1000*60*10);//update every 10 minutes
      })
    };
    $http.get('/auth/self').success(function(data){
        $rootScope.logged_in_user = data;
        $rootScope.updateInboxCount();
    });
    $rootScope
        .$on('$stateChangeSuccess',
            function(event){

                if (!$window.ga)
                    return;

                $window.ga('send', 'pageview', { page: $location.path() });
            });
    $rootScope.hasPermission = function(perm){
        var user = $rootScope.logged_in_user;
        if(!user || !user.group || !user.group.permissions) return false;
        var permissions = user.group.permissions;
        if(permissions.indexOf('god')!=-1 || permissions.indexOf('sudo')!=-1) return true;
        if(permissions.indexOf(perm)!=-1) return true;
        return false;
    }

}]);
app.config(['$stateProvider','$urlRouterProvider',function($stateProvider,$urlRouterProvider){
    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('home',{
            url:'/',
            views:{
                navbar:{
                    templateUrl:"components/navbar/navbarView.html",
                    controller:"navbarController"
                },
                content:{
                    templateUrl:"components/home/homeView.html",
                    controller:"homeController"
                }
            }
        }).state('chat',{
            url:'/chat',
            views:{
                navbar:{
                    templateUrl:"components/navbar/navbarView.html",
                    controller:"navbarController"
                },
                content:{
                    templateUrl:"components/chat/chatView.html",
                    controller:"chatController"
                }
            }
        })
        .state('userPage',{
            url:'/user/:userId',
            views:{
                navbar:{
                    templateUrl:"components/navbar/navbarView.html",
                    controller:"navbarController"
                },
                content:{
                    templateUrl:"components/user/userPageView.html",
                    controller:"userPageController"
                }
            }
        }).state('inbox',{
            url:'/messages/inbox?id',
            views:{
                navbar:{
                    templateUrl:"components/navbar/navbarView.html",
                    controller:"navbarController"
                },
                content:{
                    templateUrl:"components/messages/inboxView.html",
                    controller:"inboxController"
                }
            }
        })
        .state('compose',{
            url:'/messages/compose?userId&messageId&from',
            views:{
                navbar:{
                    templateUrl:"components/navbar/navbarView.html",
                    controller:"navbarController"
                },
                content:{
                    templateUrl:"components/messages/composeView.html",
                    controller:"composeController"
                }
            }
        }).
    state('hangmanSetWord',{
        url:'/hangmanSetWord?token',
        views:{
            navbar:{
                templateUrl:"components/navbar/navbarView.html",
                controller:"navbarController"
            },
            content:{
                templateUrl:"components/hangman/hangmanSetWordView.html",
                controller:"hangmanSetWordController"
            }
        }
    })
        .state('forum',{
            url:'/forum',
            views:{
                navbar:{
                    templateUrl:"components/navbar/navbarView.html",
                    controller:"navbarController"
                },
                content:{
                    templateUrl:"components/forum/forumView.html",
                    controller:"forumController"
                }
            }
        })
        .state('topic',{
            url:'/forum/topic/:topicId?skip&limit',
            views:{
                navbar:{
                    templateUrl:"components/navbar/navbarView.html",
                    controller:"navbarController"
                },
                content:{
                    templateUrl:"components/forum/forumView.html",
                    controller:"forumController"
                }
            }
        })
        .state('createTopic',{
            url:'/forum/topic?parent',
            views:{
                navbar:{
                    templateUrl:"components/navbar/navbarView.html",
                    controller:"navbarController"
                },
                content:{
                    templateUrl:"components/forum/createTopicView.html",
                    controller:"forumController"
                }
            }
        })
        .state('createThread',{
            url:'/forum/thread?topicId',
            views:{
                navbar:{
                    templateUrl:"components/navbar/navbarView.html",
                    controller:"navbarController"
                },
                content:{
                    templateUrl:"components/forum/createThreadView.html",
                    controller:"threadController"
                }
            }
        })
        .state('thread',{
            url:'/forum/thread/:threadId?limit&skip',
            views:{
                navbar:{
                    templateUrl:"components/navbar/navbarView.html",
                    controller:"navbarController"
                },
                content:{
                    templateUrl:"components/forum/threadView.html",
                    controller:"threadController"
                }
            }
        })
        .state('forumPost',{
            url:'/forum/post/:postId',
            views:{
                navbar:{
                    templateUrl:"components/navbar/navbarView.html",
                    controller:"navbarController"
                },
                content:{
                    templateUrl:"components/forum/postView.html",
                    controller:"postController"
                }
            }
        })
        .state('forumTagSearch',{
            url:'/forum/search/tag/:tag?tags',
            views:{
                navbar:{
                    templateUrl:"components/navbar/navbarView.html",
                    controller:"navbarController"
                },
                content:{
                    templateUrl:"components/forum/forumView.html",
                    controller:"forumSearchController"
                }
            }
        });
}]);
app.factory('socket', function (socketFactory) {
    return socketFactory({ioSocket: io.connect()});
});
angular.module('controllers',['ngAnimate','mgcrea.ngStrap','ngCookies']);
angular.module('directives',['ngAnimate','mgcrea.ngStrap']);
angular.module('services',[]);