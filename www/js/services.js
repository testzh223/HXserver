angular.module('HXServices', [])
    .factory('myHttp', function ($http) {
        var handleSuccess = function (data, status) {
            console.log(data);
        };

        var handleErr = function (data, status, headers, config) {
            console.log(data);
            console.log(status);
        };

        return {
            do: function (method, path, paramObj, success, err) {
                var s = success || handleSuccess;
                var e = err || handleErr;
                var p = paramObj || {};
                switch (method) {
                    case 'g':
                        return $http.get(serverURL + path, p)
                            .success(s)
                            .error(e);
                        break;
                    case 'p':
                        return $http.post(serverURL + path, p)
                            .success(s)
                            .error(e);
                        break;
                    default:
                        return $http.post(serverURL + path, p)
                            .success(s)
                            .error(e);
                }
            }
        };
    })
    .factory('GPS',function($rootScope,$http)
    {

        var watch = null;

        var convert = function(x,y,callback)
        {
            $http.jsonp('http://api.map.baidu.com/ag/coord/convert?from=0&to=4&x='+x+'&y='+y+'&callback=JSON_CALLBACK')
                .success(function(data)
                {
                    callback(data);
                })
                .error(function(data)
                {
                    callback(null);
                })
        }

        var showMap = function()
        {
            if($rootScope.userInfo.GPSPoint==undefined)
                return;
            var map = new BMap.Map("my-map");
            convert($rootScope.userInfo.GPSPoint[0],$rootScope.userInfo.GPSPoint[1],function(data)
            {
                if(data!=null)
                {
                    var gp= new BMap.Point(data.x,data.y);
                    map.centerAndZoom(gp, 17);
                    var marker = new BMap.Marker(gp);
                    map.addOverlay(marker);
                    marker.setAnimation(BMAP_ANIMATION_BOUNCE);
                }
            })
        }


        var updateAddress = function(GPSonSuccess, GPSonError){
            navigator.geolocation.getCurrentPosition(GPSonSuccess, GPSonError, {timeout: 5000, enableHighAccuracy: true});}

        var clearWatch = function()
        {
            if(watch!=null)
                navigator.geolocation.clearWatch(watch);
        }

        var createWatch = function(GPSonSuccess, GPSonError)
        {
            clearWatch();
            watch = navigator.geolocation.watchPosition(GPSonSuccess, GPSonError, {enableHighAccuracy: true});
        }

        return {'update' : updateAddress,'showMap' : showMap,'watch' : createWatch,'clear' : clearWatch};
    })
