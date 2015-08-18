/**
 * Created by Administrator on 2015-08-16.
 */

var quitHX = function ($rootScope, GPS,$ionicHistory) {
    GPS.clear();
    FBRef.onDisconnect().cancel();
    FBRef.child('ValidToken').off();
    FBRef.child('Meetings').off();
    FBRef.child('SIReminder').off();
    FBRef.child('MeetReminder').off();
    FBRef.child('Friends').off();
    FBRef.unauth();
    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
    $rootScope.userInfo = {};
    $rootScope.meetsInfo = {};
    $rootScope.HXUI = {};
    $rootScope.jumpTo('accountLogin');
}

var startWatch = function (myHttp, GPS, $rootScope) {
    GPS.watch(function (position) {
            console.log('GPS Detect');
            if (new Date().getTime() - $rootScope.userInfo.GPSUpdate > 60000) {
                $rootScope.userInfo.GPSPoint[0] = position.coords.longitude;
                $rootScope.userInfo.GPSPoint[1] = position.coords.latitude;
                $rootScope.userInfo.GPSUpdate = new Date().getTime();
                myHttp.do('p', 'GPSUpdate',
                    {
                        Account: $rootScope.userInfo.Account,
                        Password: $rootScope.userInfo.Password,
                        x: $rootScope.userInfo.GPSPoint[0],
                        y: $rootScope.userInfo.GPSPoint[1],
                        time: $rootScope.userInfo.GPSUpdate
                    },
                    function (data, status) {
                        //myAlert('GPS1');
                    },
                    function () {
                    });
            }
        },
        function (err) {
        });
}