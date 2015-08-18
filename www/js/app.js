// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in main.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'HXControllers', 'HXServices'])

    .run(function ($ionicPlatform, $state, $rootScope, $interval) {

        moment.locale('zh-cn');
        $rootScope.jumpTo = function (state) {
            $state.go(state);
        }
        $rootScope.time = new Date().getTime();
        $interval(function () {
            $rootScope.time = new Date().getTime();
        }, 5000);
        $rootScope.userInfo = {};
        $rootScope.tempImages = {};
        $rootScope.meetsInfo = {};
        $rootScope.HXUI = {};
        $rootScope.tempImages['0'] = {
            'Data': "data:image/jpeg;base64,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",
            'Type': 'png'
        };

        $ionicPlatform.ready(function () {

            setTimeout(function () {
                //window.plugins.jPushPlugin.init();
            }, 500);
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleLightContent();
            }

            $rootScope.$on('$ionicView.beforeEnter', function () {
                if ($state.$current.name == 'tab.chat') {
                    cordova.plugins.Keyboard.disableScroll(true);
                } else {
                    cordova.plugins.Keyboard.disableScroll(false);
                }
            });
        });
    })

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('accountLogin', {
                url: '/accountLogin',
                views: {
                    'main-view': {
                        templateUrl: 'templates/accountLogin.html'
                    }
                }
            })
            .state('accountRegist', {
                url: '/accountLogin',
                views: {
                    'main-view': {
                        templateUrl: 'templates/accountRegist.html'
                    }
                }
            })
            .state('tab', {
                url: "/tab",
                abstract: true,
                views: {
                    'main-view': {
                        templateUrl: 'templates/tabs.html',
                        controller: 'TabsCtrl'
                    }
                }
            })
            .state('tab.meet', {
                url: '/meet',
                views: {
                    'tab-meet': {
                        templateUrl: 'templates/tab-meet.html',
                        controller: 'MeetCtrl'
                    }
                }
            })
            .state('tab.setting', {
                url: '/setting',
                views: {
                    'tab-setting': {
                        templateUrl: 'templates/tab-setting.html',
                        controller: 'SettingCtrl'
                    }
                }
            })
            .state('tab.SISetting', {
                url: '/SISetting',
                views: {
                    'tab-meet': {
                        templateUrl: 'templates/SISetting.html',
                        controller: 'SISettingCtrl'
                    }
                }
            })
            .state('tab.psFaxingF', {
                url: '/psFaxingF',
                views: {
                    'tab-meet': {
                        templateUrl: 'templates/personStyle/faxingF.html',
                        controller: 'styleSettingCtrl2'
                    }
                }
            })
            .state('tab.psYanjingF', {
                url: '/psYanjingF',
                views: {
                    'tab-meet': {
                        templateUrl: 'templates/personStyle/yanjingF.html',
                        controller: 'styleSettingCtrl2'
                    }
                }
            })
            .state('tab.psYifuhuawenF', {
                url: '/psYifuhuawenF',
                views: {
                    'tab-meet': {
                        templateUrl: 'templates/personStyle/yifuhuawenF.html',
                        controller: 'styleSettingCtrl2'
                    }
                }
            })
            .state('tab.psYifuleixingF', {
                url: '/psYifuleixingF',
                views: {
                    'tab-meet': {
                        templateUrl: 'templates/personStyle/yifuleixingF.html',
                        controller: 'styleSettingCtrl2'
                    }
                }
            })
            .state('tab.psYifuyanseF', {
                url: '/psYifuyanseF',
                views: {
                    'tab-meet': {
                        templateUrl: 'templates/personStyle/yifuyanseF.html',
                        controller: 'styleSettingCtrl2'
                    }
                }
            })
            .state('tab.psFaxingM', {
                url: '/psFaxingM',
                views: {
                    'tab-meet': {
                        templateUrl: 'templates/personStyle/faxingM.html',
                        controller: 'styleSettingCtrl2'
                    }
                }
            })
            .state('tab.psYanjingM', {
                url: '/psYanjingM',
                views: {
                    'tab-meet': {
                        templateUrl: 'templates/personStyle/yanjingM.html',
                        controller: 'styleSettingCtrl2'
                    }
                }
            })
            .state('tab.psYifuhuawenM', {
                url: '/psYifuhuawenM',
                views: {
                    'tab-meet': {
                        templateUrl: 'templates/personStyle/yifuhuawenM.html',
                        controller: 'styleSettingCtrl2'
                    }
                }
            })
            .state('tab.psYifuleixingM', {
                url: '/psYifuleixingM',
                views: {
                    'tab-meet': {
                        templateUrl: 'templates/personStyle/yifuleixingM.html',
                        controller: 'styleSettingCtrl2'
                    }
                }
            })
            .state('tab.psYifuyanseM', {
                url: '/psYifuyanseM',
                views: {
                    'tab-meet': {
                        templateUrl: 'templates/personStyle/yifuyanseM.html',
                        controller: 'styleSettingCtrl2'
                    }
                }
            })
            .state('tab.psXingbie', {
                url: '/psXingbie',
                views: {
                    'tab-meet': {
                        templateUrl: 'templates/personStyle/xingbie.html',
                        controller: 'styleSettingCtrl2'
                    }
                }
            })
            .state('tab.meetCreate', {
                url: '/meetCreate',
                views: {
                    'tab-meet': {
                        templateUrl: 'templates/meetCreate.html',
                        controller: 'meetCreateCtrl'
                    }
                }
            })
            .state('tab.imageReview', {
                url: '/imageReview',
                views: {
                    'tab-meet': {
                        templateUrl: 'templates/imageReview.html',
                        controller: 'imageReviewCtrl'
                    }
                }
            })
            .state('tab.imageReview2', {
                url: '/imageReview2',
                views: {
                    'tab-meet': {
                        templateUrl: 'templates/imageReview.html',
                        controller: 'imageReview2Ctrl'
                    }
                }
            })
            .state('tab.selectOne', {
                url: '/selectOne',
                views: {
                    'tab-meet': {
                        templateUrl: 'templates/selectOne.html',
                        controller: 'selectOneCtrl'
                    }
                }
            })
            .state('tab.selectOne2', {
                url: '/selectOne2',
                views: {
                    'tab-meet': {
                        templateUrl: 'templates/selectOne.html',
                        controller: 'selectOne2Ctrl'
                    }
                }
            })
            .state('tab.meetInfo',
            {
                url: '/meetInfo',
                views: {
                    'tab-meet': {
                        templateUrl: 'templates/meetInfo.html',
                        controller: 'meetInfoCtrl'
                    }
                }
            })
            .state('tab.meetResponse',
            {
                url: '/meetResponse',
                views: {
                    'tab-meet': {
                        templateUrl: 'templates/meetResponse.html',
                        controller: 'meetResponseCtrl'
                    }
                }
            })
            .state('tab.friend',
            {
                url: '/friend',
                views: {
                    'tab-friend': {
                        templateUrl: 'templates/tab-friend.html',
                        controller: 'friendCtrl'
                    }
                }
            })
            .state('tab.chat',
            {
                url: '/chat',
                views: {
                    'tab-friend': {
                        templateUrl: 'templates/chat.html',
                        controller: 'chatCtrl'
                    }
                }
            })
        $urlRouterProvider.otherwise('/accountLogin');
    });
