angular.module('HXControllers', ['HXServices', 'firebase', 'ionic'])

    .controller('accountLoginCtrl', function ($scope, myHttp, $firebaseObject, $rootScope, $firebaseAuth, $rootScope, $ionicLoading, $http) {
        var logValidation = function () {
            var msg = "";
            if ($scope.loginPassword == undefined || $scope.loginPassword.length == 0)
                msg = "请填写密码";
            if ($scope.loginAccount == undefined || $scope.loginAccount.length == 0)
                msg = "请填写用户名";
            return msg;
        }

        $scope.login = function () {
            var account = $scope.loginAccount;
            var password = $scope.loginPassword;
            var msg = logValidation();
            if (msg.length == 0) {
                $ionicLoading.show({
                    template: '登入中,请稍候......'
                });
                myHttp.do(
                    'p',
                    'login',
                    {
                        Account: account,
                        Password: password
                    }, function (data) {
                        $ionicLoading.show({
                            template: '数据加载中,请稍候......'
                        });
                        console.log(data);
                        FBRef = new Firebase(FBURL + "users/" + account);
                        var t1 = $firebaseAuth(FBRef);
                        $rootScope.ValidToken = data.data.valid;
                        $rootScope.meetsInfo = {};
                        $rootScope.HXUI = {};
                        $rootScope.HXUI.meetsInfo = {};
                        $rootScope.HXUI.chats = {};
                        t1.$authWithCustomToken(data.data.token).then(function (authData) {
                            $rootScope.userInfo = $firebaseObject(FBRef);
                            FBRef.update({Online: 'on'});
                            FBRef.onDisconnect().update({Online: 'off'});
                            $rootScope.userInfo.$loaded()
                                .then(function (data) {
                                    $ionicLoading.hide();
                                    $rootScope.jumpTo('tab.meet');
                                })
                                .catch(function (error) {
                                    $ionicLoading.hide();
                                    myAlert('Firebase链接错误');
                                });
                        });
                    }, function (data) {
                        $ionicLoading.hide();
                        if (data == null || data.status == null)
                            myAlert('服务器链接失败.');
                        else
                            myAlert(data.status);
                    });
            }
            else {
                $ionicLoading.hide();
                myAlert(msg);
            }
        }
    })

    .controller('accountRegistCtrl', function ($scope, myHttp, $rootScope, $ionicLoading) {
        var regValidation = function ($scope) {
            var msg = "";
            if ($("input[name='radioSex']:checked").val() == undefined)
                msg = "请选择性别";
            if ($scope.userPassword == undefined || $scope.userPassword != $scope.userPasswordR)
                msg = "密码不一致";
            if ($scope.userPassword == undefined || $scope.userPassword.length == 0)
                msg = "密码不能为空";
            if ($scope.userName == undefined || $scope.userName.length == 0)
                msg = "昵称不能为空";
            if ($scope.userAccount == undefined || $scope.userAccount.length == 0)
                msg = "用户名不能为空";
            return msg;
        }

        $scope.regist = function () {
            var msg = regValidation($scope);
            if (msg.length == 0) {
                $ionicLoading.show(
                    {
                        template: '注册中,请稍候......'
                    }
                )
                myHttp.do(
                    'p',
                    'regist',
                    {
                        Account: $scope.userAccount,
                        Password: $scope.userPassword,
                        Nickname: $scope.userName,
                        Sex: $("input[name='radioSex']:checked").val()
                    }, function (data) {
                        $ionicLoading.hide();
                        $rootScope.jumpTo('accountLogin');
                        myAlert('注册成功!');
                    }, function (data) {
                        $ionicLoading.hide();
                        myAlert(data.status);
                    });
            }
            else {
                myAlert(msg);
            }
        }
    })
    .controller('TabsCtrl', function ($scope, $rootScope, $ionicPopup, GPS, myHttp, $firebaseObject, $ionicHistory, $state) {

        FBRef.child('ValidToken').on('value', function (data) {
            //console.log(data.val() + " // " + $rootScope.ValidToken);
            if (data.val() != $rootScope.ValidToken) {
                quitHX($rootScope, GPS, $ionicHistory);
                var alertPopup = $ionicPopup.alert({
                    title: '您的账号在其他地方登入!',
                    template: '如不是本人操作,请立刻修改密码.'
                });
            }
        });

        FBRef.child("MeetReminder").on('value', function (data) {
            var d = data.val();
            var temp = {};
            for (d1 in d) {
                if (d[d1] == '1') {
                    temp[d1] = '0';
                    if ($rootScope.HXUI.meetsInfo[d1])
                        $rootScope.HXUI.meetsInfo[d1].alert = 'new';
                    else {
                        $rootScope.HXUI.meetsInfo[d1] = {};
                        $rootScope.HXUI.meetsInfo[d1].alert = 'new';
                    }
                }
            }
            FBRef.child("MeetReminder").update(temp);
        });

        FBRef.child('FriendEvent').on('value',function(data)
        {
            var d = data.val();
            if(d!=undefined && d!=null)
            {
                if(d.event =='add')
                {
                    $rootScope.HXUI.friendReminder='new';
                    var confirmPopup = $ionicPopup.confirm({
                        title: '新的好友',
                        template: '您已经与' + d.name + '成功成为好友，是否前去聊天?'
                    });
                    confirmPopup.then(function (res) {
                    });
                }
            }
        })

        FBRef.child('Meetings').on('value', function (data) {
            var ms = data.val();
            if (ms != null && ms != undefined) {
                for (i = 0; i < ms.length; i++) {
                    if ($rootScope.meetsInfo[ms[i]] == undefined) {
                        $rootScope.meetsInfo[ms[i]] = $firebaseObject(new Firebase(FBURL + "meets/" + ms[i]));
                        var ref2 = new Firebase(FBURL + "meets/" + ms[i]);
                        ref2.on('value',function(data)
                        {
                            var d= data.val();
                            $rootScope.$apply(function()
                            {
                                $rootScope.meetsInfo[d._id] = d;
                                if(d.Status==2 && $rootScope.HXUI.meetsInfo[d._id])
                                    $rootScope.HXUI.meetsInfo[d._id].alert="";
                            });
                        });
                        $rootScope.meetsInfo[ms[i]].$loaded().then(function (data) {
                            if (data.Status == 1 && data.Receiver == $rootScope.userInfo.Account) {
                                $rootScope.HXUI.meetsInfo[data._id] = {};
                                $rootScope.HXUI.meetsInfo[data._id].alert = "剩余" + data.Tries + "次";
                            }
                            var i1 = data.SenderImage;
                            var i2 = data.ReceiverImage;
                            if (i1 != undefined && $rootScope.tempImages [i1] == undefined) {
                                getImage(i1, '', 0, $rootScope, myHttp, 3);
                            }
                            if (i2 != undefined && $rootScope.tempImages [i2] == undefined) {
                                getImage(i2, '', 0, $rootScope, myHttp, 3);
                            }
                            console.log($rootScope.HXUI.meetsInfo);
                        });
                    }
                }
            }
        });

        FBRef.child('Chats').on('value',function(data)
        {
            var d = data.val();
            for(d1 in d)
            {
                $rootScope.HXUI.chats[d1]=d[d1];
                console.log(d1);
            }
        })

        FBRef.child('Friends').on('value', function (data) {
            var fs = data.val();
            if (fs != null && fs != undefined) {
                var ti = 0;
                for (ti = 0; ti < fs.length; ti++) {
                    var i1 = fs[ti].Image;
                    if (i1 != undefined && $rootScope.tempImages [i1] == undefined) {
                        getImage(i1, '', 0, $rootScope, myHttp, 3);
                    }
                }
            }
            $rootScope.userInfo.Friends = fs;
        })

        FBRef.child('SIReminder').on('value', function (data) {
            var v = data.val();
            if (v != null) {
                if ($rootScope.HXUI.SIlast == undefined || new Date().getTime() - $rootScope.HXUI.SIlast >= 600000) {
                    //console.log($state.$current);
                    if ($state.$current != 'tab.SISetting') {
                        $rootScope.HXUI.SIlast = new Date().getTime();
                        var confirmPopup = $ionicPopup.confirm({
                            title: '您周围的人发起了嗨羞',
                            template: '是否前往更新您的个人信息?'
                        });
                        confirmPopup.then(function (res) {
                            if (res) {
                                $rootScope.jumpTo('tab.SISetting');
                            }
                        });
                    }
                }
            }
        })
        startWatch(myHttp, GPS, $rootScope);
    })
    .controller('MeetCtrl', function ($scope, $rootScope, $ionicPopup, myHttp, $ionicLoading) {
        $rootScope.HXUI.hideTab = false;
        $scope.moment = moment;
        $scope.getStatus = function (data) {
            if (data.Status == 0)
                return '不在其中';
            if (data.Status == 1 && data.Sender == $rootScope.userInfo.Account)
                return '待对方回复';
            if (data.Status == 1 && data.Receiver == $rootScope.userInfo.Account)
                return '待回复';
            if (data.Status == 2)
                return '成功';
            return '未知';
        }

        $scope.getSrc = function (x) {
            var img;
            if (x.Sender == $rootScope.userInfo.Account) {
                img = x.ReceiverImage;
            }
            else {
                if (x.Status == 2)
                    img = x.SenderImage;
                else
                    img = '0';
            }
            if (img == undefined || img.length < 1)
                img = '0';
            showImage(img, '#img' + x._id, 80, $rootScope);
        }

        $scope.editSpecialInfo = function () {
            $rootScope.HXUI.SIReminder = false;
            $rootScope.HXUI.hideTab = true;
            $rootScope.jumpTo('tab.SISetting');
        }

        $scope.doMeet = function (id) {
            if ($rootScope.meetsInfo[id].Sender == $rootScope.userInfo.Account) {
                if ($rootScope.HXUI.meetsInfo[id])
                    $rootScope.HXUI.meetsInfo[id].alert = '';
                if ($rootScope.meetsInfo[id].Status == 0) {
                    $ionicLoading.show({
                        template: '嗨羞搜寻中,请稍候...'
                    })
                    myHttp.do('p', 'checkValids', {
                            Account: $rootScope.userInfo.Account,
                            Password: $rootScope.userInfo.Password,
                            mid: id
                        },
                        function (data, status) {
                            $rootScope.HXUI.validAccounts = data.data;
                            $rootScope.HXUI.currentMeet = id;
                            $rootScope.HXUI.hideTab=true;
                            $ionicLoading.hide();
                            $rootScope.jumpTo('tab.imageReview');
                        },
                        function (data, status) {
                            if (data == null || data.status == null)
                                myAlert('服务器链接失败.');
                            else
                                myAlert(data.status);
                            $ionicLoading.hide();
                        });
                }
                if ($rootScope.meetsInfo[id].Status == 1) {
                    $rootScope.HXUI.currentMeetInfo = $rootScope.meetsInfo[id].SenderRequest;
                    $rootScope.HXUI.currentMeetInfo.Address = $rootScope.meetsInfo[id].Address;
                    $rootScope.HXUI.currentMeetInfo.Status = $scope.getStatus($rootScope.meetsInfo[id]);
                    $rootScope.HXUI.currentMeetInfo.Update = $rootScope.meetsInfo[id].Update;
                    $rootScope.HXUI.currentMeetInfo.Image = $rootScope.meetsInfo[id].ReceiverImage;
                    $rootScope.HXUI.hideTab = true;
                    $rootScope.jumpTo('tab.meetInfo');
                }
            }
            else {
                if ($rootScope.meetsInfo[id].Status == 1) {
                    if ($rootScope.meetsInfo[id].Tries > 0) {
                        $rootScope.HXUI.filter = {};
                        $rootScope.HXUI.currentMeetInfo = $rootScope.meetsInfo[id];
                        console.log($rootScope.meetsInfo[id]);
                        $rootScope.HXUI.filter = {'Address': $rootScope.meetsInfo[id].Address};
                        $rootScope.HXUI.filter.Sex = $rootScope.meetsInfo[id].ReceiverRequest.Sex;
                        $rootScope.jumpTo('tab.meetResponse');
                    }
                    else {
                        var alertPopup = $ionicPopup.alert({
                            title: '次数不足',
                            template: '剩余次数不足，不能继续.'
                        });
                    }
                }
                else {

                }
            }
        }

        $scope.filterUI = function () {
            var style = $rootScope.userInfo.SpecialInfo;
            if (style.FaXing.length == 0 || style.YanJing.length == 0 || style.YiFuHuaWen.length == 0 || style.YiFuYanSe.length == 0 || style.YiFuLeiXing.length == 0 || $rootScope.userInfo.Image == '0') {
                var confirmPopup = $ionicPopup.confirm({
                    title: '个人信息不完整',
                    template: '不完整的个人信息不能参与匹配,是否去完善?'
                });
                confirmPopup.then(function (res) {
                    if (res) {
                        $rootScope.HXUI.SIReminder = false;
                        $rootScope.HXUI.hideTab = true;
                        $rootScope.jumpTo('tab.SISetting');
                    }
                });
            }
            else {
                if ($rootScope.userInfo.GPSPoint == undefined || $rootScope.userInfo.GPSPoint.length < 2
                    || ($rootScope.userInfo.GPSPoint[0] == 0 && $rootScope.userInfo.GPSPoint[1] == 0)) {
                    var confirmPopup = $ionicPopup.confirm({
                        title: '地理位置未获取',
                        template: '未获取地理位置不能参与匹配,是否去设置?'
                    });
                    confirmPopup.then(function (res) {
                        if (res) {
                            $rootScope.jumpTo('tab.setting');
                        }
                    });
                }
                else {
                    if (new Date().getTime() - $rootScope.userInfo.MeetingSent.Update <= meetInterval) {
                        var alertPopup = $ionicPopup.alert({
                            title: '不能进行匹配',
                            template: (meetInterval / 1000) + 'S之内只能匹配一次!'
                        });
                    }
                    else {
                        $rootScope.HXUI.filter = {};
                        $rootScope.HXUI.filter = {'location': ''};
                        if ($rootScope.userInfo.Sex == '男')
                            $rootScope.HXUI.filter.Sex = '女';
                        else
                            $rootScope.HXUI.filter.Sex = '男';
                        $rootScope.HXUI.hideTab = true;
                        $rootScope.jumpTo('tab.meetCreate');
                    }
                }
            }
        }
    })
    .controller('SettingCtrl', function ($scope, $rootScope, $ionicPopup, GPS, myHttp, $ionicHistory) {
        $rootScope.HXUI.showTab=false;
        if ($rootScope.userInfo.GPSPoint.length == 2 && $rootScope.userInfo.GPSPoint[0] != 0 && $rootScope.userInfo.GPSPoint[1] != 0) {
            setTimeout(function () {
                GPS.showMap();
            }, 500);
        }

        $scope.logOut = function () {
            FBRef.update({Online: 'off'});
            quitHX($rootScope, GPS, $ionicHistory);
        }

        var GPSonSuccess = function (position) {
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
                    myAlert("GPS更新成功");
                },
                function () {
                    myAlert("GPS更新失败");
                });
            GPS.showMap();
            startWatch(myHttp, GPS, $rootScope);
        }

        var GPSonError = function (error) {
            myAlert("GPS定位失败" + " " + error);
            startWatch(myHttp, GPS, $rootScope);
        }

        $scope.updateAddress = function () {
            GPS.clear();
            setTimeout(function () {
                GPS.update(GPSonSuccess, GPSonError)
            }, 500);
        };
    })

    .controller('SISettingCtrl', function ($scope, $rootScope, $ionicPopup, myHttp) {
        $rootScope.HXUI.jumpStatePS = 'tab.SISetting';

        if ($rootScope.tempImages[$rootScope.userInfo.Image] == undefined) {
            getImage($rootScope.userInfo.Image, '#myPhoto', 150, $rootScope, myHttp, 3);
        }

        $scope.myImage = function () {
            showImage($rootScope.userInfo.Image, '#myPhoto', 150, $rootScope, myHttp, 3);
        }

        var CameraOnSuccess = function (data) {
            data = 'data:image/jpeg;base64,' + data;
            var pid = $rootScope.userInfo.Image;
            var nid = $rootScope.userInfo.Account + "!" + new Date().getTime() + "!" + Math.floor(Math.random() * 1000000);
            var time = new Date().getTime();
            $rootScope.tempImages[nid] = {Data: data, Type: 'JPEG', ID: nid, Update: time};
            showImage(nid, '#myPhoto', 150, $rootScope, myHttp, 3);
            myHttp.do('p', 'ImageUpdate',
                {
                    Account: $rootScope.userInfo.Account,
                    Password: $rootScope.userInfo.Password,
                    ID: nid,
                    Data: data,
                    Type: 'JPEG',
                    Update: time
                },
                function () {

                },
                function () {
                    showImage(pid, '#myPhoto', 150, $rootScope, myHttp, 3);
                    myAlert('照片更新失败');
                })
        }


        var CameraOnFail = function (err) {
            myAlert("拍摄失败.");
        }

        $scope.getPhoto = function () {
            navigator.camera.getPicture(CameraOnSuccess, CameraOnFail, {
                quality: 50,
                destinationType: Camera.DestinationType.DATA_URL,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 240,
                targetHeight: 240,
                correctOrientation: true,
                saveToPhotoAlbum: false,
                cameraDirection: 1
            });
        }

        $scope.goTo = function (style) {
            $rootScope.HXUI.jumpStatePS = 'tab.SISetting';
            if ($rootScope.userInfo.Sex == '男') {
                $rootScope.jumpTo('tab.' + style + 'M');
            }
            else {
                $rootScope.jumpTo('tab.' + style + 'F');
            }
        }

        $scope.goBack = function () {
            var style = $rootScope.userInfo.SpecialInfo;
            if (style.FaXing.length == 0 || style.YanJing.length == 0 || style.YiFuHuaWen.length == 0 || style.YiFuYanSe.length == 0 || style.YiFuLeiXing.length == 0 || $rootScope.userInfo.Image == '0') {
                var confirmPopup = $ionicPopup.confirm({
                    title: '个人信息不完整',
                    template: '不完整的信息会导致不能参与匹配,确定继续退出?'
                });
                confirmPopup.then(function (res) {
                    if (res) {
                        $rootScope.HXUI.hideTab = false;
                        $rootScope.jumpTo('tab.meet');
                    } else {
                    }
                });
            }
            else {
                if ($rootScope.userInfo.MeetingWait != undefined && $rootScope.userInfo.MeetingWait.length > 0) {
                    $rootScope.userInfo.MeetingWait = [];
                    myHttp.do('p', 'doneStyle',
                        {
                            Account: $rootScope.userInfo.Account,
                            Password: $rootScope.userInfo.Password
                        },
                        function () {
                        },
                        function () {
                        });
                }
                $rootScope.HXUI.hideTab = false;
                $rootScope.jumpTo('tab.meet');
            }
        }
    })

    .controller('styleSettingCtrl2', function ($scope, $rootScope, myHttp) {
        $scope.back = function () {
            $rootScope.jumpTo($rootScope.HXUI.jumpStatePS);
        }

        $scope.setStyle = function (a, v) {
            if ($rootScope.HXUI.jumpStatePS == 'tab.SISetting') {
                var pv = $rootScope.userInfo.SpecialInfo[a];
                myHttp.do('p', 'SIUpdate',
                    {
                        Account: $rootScope.userInfo.Account,
                        Password: $rootScope.userInfo.Password,
                        a: a,
                        v: v
                    },
                    function () {

                    },
                    function () {
                        $rootScope.userInfo.SpecialInfo[a] = pv;
                    })
                $rootScope.userInfo.SpecialInfo[a] = v;
                var complete = 1;
                var style = $rootScope.userInfo.SpecialInfo;
                if ($rootScope.userInfo.WaitMeetings == undefined || $rootScope.userInfo.WaitMeetings.length == 0)
                    complete = 0;
                if (style.FaXing.length == 0 || style.YanJing.length == 0 || style.YiFuHuaWen.length == 0 || style.YiFuYanSe.length == 0 || style.YiFuLeiXing.length == 0 || $rootScope.userInfo.Image == '0') {
                    complete = 0;
                }
                //alert('!!' + complete);
                $rootScope.jumpTo('tab.SISetting');
            }

            if ($rootScope.HXUI.jumpStatePS == 'tab.meetCreate') {
                if (a == 'Sex' && $rootScope.HXUI.filter[a] != v) {
                    $rootScope.HXUI.filter = {};
                }
                $rootScope.HXUI.filter[a] = v;
                $rootScope.jumpTo('tab.meetCreate');
            }

            if ($rootScope.HXUI.jumpStatePS == 'tab.meetResponse') {
                $rootScope.HXUI.filter[a] = v;
                $rootScope.jumpTo('tab.meetResponse');
            }
        }
    })

    .controller('meetCreateCtrl', function ($scope, $rootScope, $ionicPopup, myHttp, $ionicLoading) {
        $rootScope.HXUI.jumpStatePS = 'tab.meetCreate';
        $scope.back = function () {
            $rootScope.HXUI.hideTab = false;
            $rootScope.jumpTo('tab.meet');
        }

        $scope.goTo = function (style) {
            $rootScope.HXUI.jumpStatePS = 'tab.meetCreate';
            if (style != 'psXingbie') {
                if ($rootScope.HXUI.filter.Sex == '男')
                    $rootScope.jumpTo('tab.' + style + 'M');
                else
                    $rootScope.jumpTo('tab.' + style + 'F');
            }
            else {
                $rootScope.jumpTo('tab.' + style);
            }
        }

        $scope.submit = function () {
            if (new Date().getTime() - $rootScope.userInfo.MeetingSent.Update <= meetInterval) {
                var alertPopup = $ionicPopup.alert({
                    title: '不能进行匹配',
                    template: '30S之内只能匹配一次!'
                });
            }
            else {

                var fl = $rootScope.HXUI.filter;
                if (fl.Sex.length == 0 || fl.location.length == 0 || fl.FaXing == undefined || fl.YanJing == undefined || fl.YiFuYanSe == undefined
                    || fl.YiFuLeiXing == undefined || fl.YiFuHuaWen == undefined) {
                    var alertPopup = $ionicPopup.alert({
                        title: '不能进行匹配',
                        template: '您的邂逅信息不完整!'
                    });
                }
                else {
                    $ionicLoading.show({
                        template: '嗨羞搜寻中,请稍候...'
                    })
                    myHttp.do('p', 'createMeet', {
                            Account: $rootScope.userInfo.Account,
                            Password: $rootScope.userInfo.Password,
                            Sex: fl.Sex,
                            Location: fl.location,
                            FaXing: fl.FaXing,
                            YanJing: fl.YanJing,
                            YiFuYanSe: fl.YiFuYanSe,
                            YiFuHuaWen: fl.YiFuHuaWen,
                            YiFuLeiXing: fl.YiFuLeiXing
                        },
                        function (data, status) {
                            $rootScope.HXUI.validAccounts = data.data;
                            $rootScope.HXUI.currentMeet = data.mid;
                            $ionicLoading.hide();
                            $rootScope.jumpTo('tab.imageReview');
                        },
                        function (data, status) {
                            if (data == null || data.status == null)
                                myAlert('服务器链接失败.');
                            else
                                myAlert(data.status);
                            $ionicLoading.hide();
                        });
                }
            }
        }
    })
    .controller('imageReviewCtrl', function ($scope, $rootScope, myHttp) {

        if ($rootScope.HXUI.validAccounts != null && $rootScope.HXUI.validAccounts != undefined) {
            var ti1;
            for (ti1 = 0; ti1 < $rootScope.HXUI.validAccounts.length; ti1++) {
                var iid = $rootScope.HXUI.validAccounts[ti1].Image;
                if ($rootScope.tempImages[iid] == undefined) {
                    getImage(iid, $rootScope.HXUI.validAccounts[ti1].Account, 0, $rootScope, myHttp, 3, function (id, ac) {
                        var cid = "IR" + ac;
                        $('#' + cid).attr('src', $rootScope.tempImages[id].Data);
                    });
                }
            }
        }

        $scope.myImage = function (id) {
            if ($rootScope.tempImages[id] != undefined && $rootScope.tempImages[id] != null)
                return $rootScope.tempImages[id].Data;
        }

        $scope.pick = function (x) {
            $rootScope.HXUI.select = x;
            $rootScope.jumpTo('tab.selectOne');
        }

        $scope.noMatch = function () {
            myHttp.do('p', 'noMatchMeet', {
                    Account: $rootScope.userInfo.Account,
                    Password: $rootScope.userInfo.Password,
                    mid: $rootScope.HXUI.currentMeet
                },
                function () {

                },
                function () {

                });
            $rootScope.HXUI.hideTab = false;
            $rootScope.jumpTo('tab.meet');
        }
        //console.log($rootScope.HXUI.validAccounts);
    })

    .controller('imageReview2Ctrl', function ($scope, $rootScope, myHttp, $ionicPopup) {

        if ($rootScope.HXUI.validAccounts != null && $rootScope.HXUI.validAccounts != undefined) {
            var ti1;
            for (ti1 = 0; ti1 < $rootScope.HXUI.validAccounts.length; ti1++) {
                var iid = $rootScope.HXUI.validAccounts[ti1].Image;
                if ($rootScope.tempImages[iid] == undefined) {
                    getImage(iid, $rootScope.HXUI.validAccounts[ti1].Account, 0, $rootScope, myHttp, 3, function (id, ac) {
                        var cid = "IR" + ac;
                        $('#' + cid).attr('src', $rootScope.tempImages[id].Data);
                    });
                }
            }
        }

        $scope.myImage = function (id) {
            if ($rootScope.tempImages[id] != undefined && $rootScope.tempImages[id] != null)
                return $rootScope.tempImages[id].Data;
        }

        $scope.pick = function (x) {
            $rootScope.HXUI.select = x;
            $rootScope.jumpTo('tab.selectOne2');
        }

        $scope.noMatch = function () {
            var mid = $rootScope.HXUI.currentMeet;
            if ($rootScope.meetsInfo[mid].Tries > 0) {
                var alertPopup = $ionicPopup.alert({
                    title: '抱歉，您并没有选中！',
                    template: '您还有' + $rootScope.meetsInfo[mid].Tries + '次机会.'
                });
                alertPopup.then(function () {
                    $rootScope.jumpTo('tab.meetResponse');
                })
            }
            else {
                var alertPopup = $ionicPopup.alert({
                    title: '抱歉，您并没有选中！',
                    template: '缘分还是顺其自然吧.'
                });
                alertPopup.then(function () {
                    $rootScope.HXUI.hideTab = false;
                    $rootScope.jumpTo('tab.meet');
                })
            }
        }
    })

    .controller('selectOneCtrl', function ($scope, $rootScope, myHttp) {

        $scope.myImage = function () {
            return $rootScope.tempImages[$rootScope.HXUI.select.Image].Data;
        }

        $scope.back = function () {
            $rootScope.jumpTo('tab.imageReview');
        }

        $scope.pick = function () {
            $rootScope.meetsInfo[$rootScope.HXUI.currentMeet].Status = 1;
            myHttp.do('p', 'matchMeet1', {
                    Account: $rootScope.userInfo.Account,
                    Password: $rootScope.userInfo.Password,
                    mid: $rootScope.HXUI.currentMeet,
                    rAccount: $rootScope.HXUI.select.Account,
                    rImage: $rootScope.HXUI.select.Image,
                    rNickname: $rootScope.HXUI.select.Nickname
                },
                function () {

                },
                function () {
                    $rootScope.meetsInfo[$rootScope.HXUI.currentMeet].Status = 0;
                });
            $rootScope.HXUI.hideTab = false;
            $rootScope.jumpTo('tab.meet');
        }
    })
    .controller('selectOne2Ctrl', function ($scope, $rootScope, myHttp, $ionicPopup, $ionicLoading) {

        $scope.myImage = function () {
            return $rootScope.tempImages[$rootScope.HXUI.select.Image].Data;
        }

        $scope.back = function () {
            $rootScope.jumpTo('tab.imageReview2');
        }

        $scope.pick = function () {
            if ($rootScope.meetsInfo[$rootScope.HXUI.currentMeet].Sender == $rootScope.HXUI.select.Account) {
                $ionicLoading.show({
                    template: '嗨羞结果提交中,请稍候...'
                })
                myHttp.do('p', 'meetSuccess', {
                        Account: $rootScope.userInfo.Account,
                        Password: $rootScope.userInfo.Password,
                        mid: $rootScope.HXUI.currentMeet
                    },
                    function (data, status) {
                        $ionicLoading.hide();
                        $rootScope.HXUI.hideTab = false;
                        $rootScope.jumpTo('tab.meet');
                    }, function (data, status) {
                        $ionicLoading.hide();
                        myAlert('提交失败，服务器错误');
                    })
                console.log('12345');
            }
            else {
                var mid = $rootScope.HXUI.currentMeet;
                if ($rootScope.meetsInfo[mid].Tries > 0) {
                    var alertPopup = $ionicPopup.alert({
                        title: '抱歉，您并没有选中！',
                        template: '您还有' + $rootScope.meetsInfo[mid].Tries + '次机会.'
                    });
                    alertPopup.then(function () {
                        $rootScope.jumpTo('tab.meetResponse');
                    })
                }
                else {
                    var alertPopup = $ionicPopup.alert({
                        title: '抱歉，您并没有选中！',
                        template: '缘分还是顺其自然吧.'
                    });
                    alertPopup.then(function () {
                        $rootScope.HXUI.hideTab = false;
                        $rootScope.jumpTo('tab.meet');
                    })
                }
            }
        }
    })

    .controller('meetInfoCtrl', function ($scope, $rootScope) {
        $scope.moment = moment;
        $scope.back = function () {
            $rootScope.HXUI.hideTab = false;
            $rootScope.jumpTo('tab.meet');
        }
    })

    .controller('meetResponseCtrl', function ($scope, $rootScope, $ionicPopup, myHttp, $ionicLoading) {
        $rootScope.HXUI.jumpStatePS = 'tab.meetResponse';

        $scope.back = function () {
            $rootScope.HXUI.hideTab = false;
            $rootScope.jumpTo('tab.meet');
        }

        $scope.goTo = function (style) {
            $rootScope.HXUI.jumpStatePS = 'tab.meetResponse';
            if ($rootScope.HXUI.filter.Sex == '男')
                $rootScope.jumpTo('tab.' + style + 'M');
            else
                $rootScope.jumpTo('tab.' + style + 'F');
        }

        $scope.submit = function () {
            var fl = $rootScope.HXUI.filter;
            var fl2 = $rootScope.HXUI.currentMeetInfo.ReceiverRequest;
            var mid = $rootScope.HXUI.currentMeetInfo._id;

            if ($rootScope.meetsInfo[mid].Tries <= 0) {
                var alertPopup = $ionicPopup.alert({
                    title: '不能继续！',
                    template: '你已经没有剩余机会'
                });
                alertPopup.then(function () {
                    $rootScope.HXUI.hideTab = false;
                    $rootScope.jumpTo('tab.meet');
                });
                return;
            }


            if (fl.FaXing == undefined || fl.YanJing == undefined || fl.YiFuYanSe == undefined
                || fl.YiFuLeiXing == undefined || fl.YiFuHuaWen == undefined) {
                var alertPopup = $ionicPopup.alert({
                    title: '不能进行匹配',
                    template: '您的邂逅信息不完整!'
                });
            }
            else {
                var match = 0;
                if (fl.YanJing == fl2.YanJing)
                    match++;
                if (fl.FaXing == fl2.FaXing)
                    match++;
                if (fl.YiFuHuaWen == fl2.YiFuHuaWen)
                    match++;
                if (fl.YiFuYanSe == fl2.YiFuYanSe)
                    match++;
                if (fl.YiFuLeiXing == fl2.YiFuLeiXing)
                    match++;
                if (match >= 4) {
                    $ionicLoading.show({
                        template: '嗨羞搜寻中,请稍候...'
                    });
                    $rootScope.meetsInfo[mid].Tries = $rootScope.meetsInfo[mid].Tries - 1;
                    $rootScope.HXUI.meetsInfo[mid].alert = '剩余' + $rootScope.meetsInfo[mid].Tries + '次';
                    myHttp.do('p', 'checkValids2', {
                            Account: $rootScope.userInfo.Account,
                            Password: $rootScope.userInfo.Password,
                            mid: mid,
                            FaXing: fl.FaXing,
                            YanJing: fl.YanJing,
                            YiFuYanSe: fl.YiFuYanSe,
                            YiFuHuaWen: fl.YiFuHuaWen,
                            YiFuLeiXing: fl.YiFuLeiXing
                        },
                        function (data, status) {
                            $rootScope.HXUI.validAccounts = data.data;
                            $ionicLoading.hide();
                            $rootScope.HXUI.currentMeet = mid;
                            $rootScope.jumpTo('tab.imageReview2');
                        },
                        function (data, status) {
                            if (data == null || data.status == null)
                                myAlert('服务器链接失败.');
                            else
                                myAlert(data.status);
                            $ionicLoading.hide();
                        });
                }
                else {
                    myHttp.do('p', 'decreaseChance', {
                        Account: $rootScope.userInfo.Account,
                        Password: $rootScope.userInfo.Password,
                        mid: mid
                    }, function () {

                    }, function () {

                    });
                    $rootScope.meetsInfo[mid].Tries = $rootScope.meetsInfo[mid].Tries - 1;
                    $rootScope.HXUI.meetsInfo[mid].alert = '剩余' + $rootScope.meetsInfo[mid].Tries + '次';
                    if ($rootScope.meetsInfo[mid].Tries > 0) {
                        var alertPopup = $ionicPopup.alert({
                            title: '抱歉，您并没有选中！',
                            template: '您还有' + $rootScope.meetsInfo[mid].Tries + '次机会.'
                        });
                        alertPopup.then(function () {
                            $rootScope.jumpTo('tab.meetResponse');
                        })
                    }
                    else {
                        var alertPopup = $ionicPopup.alert({
                            title: '抱歉，您并没有选中！',
                            template: '缘分还是顺其自然吧.'
                        });
                        alertPopup.then(function () {
                            $rootScope.HXUI.hideTab = false;
                            $rootScope.jumpTo('tab.meet');
                        })
                    }
                }
            }
        }
    })
    .controller('friendCtrl', function ($scope, $rootScope,myHttp) {

        $rootScope.HXUI.friendReminder='';
        $rootScope.HXUI.showTab=false;
        $scope.getSrc = function (x) {
            if($rootScope.tempImages[x.Image])
                return $rootScope.tempImages[x.Image].Data;
        }

        $scope.deleteFriend = function (x) {
            var idx = 0;
            for (idx = 0; idx < $rootScope.userInfo.Friends.length; idx++) {
                var fx = $rootScope.userInfo.Friends[idx];
                if (fx.Account == x.Account) {
                    $rootScope.userInfo.Friends.splice(idx, 1);
                    break;
                }
            }
            myHttp.do('p','deleteFriend',
                {
                    Account:$rootScope.userInfo.Account,
                    Password:$rootScope.userInfo.Password,
                    fAccount: x.Account
                },
            function()
            {

            },
            function()
            {

            })
        }

        $scope.openChat = function (x) {
            $rootScope.HXUI.chatTarget = x;
            if($rootScope.HXUI.chats[x.Account])
            {
            }
            else
            {
                $rootScope.HXUI.chats[x.Account]=[];
            }
            $rootScope.HXUI.hideTab=true;
            $rootScope.jumpTo('tab.chat');
        }

        $scope.moment = moment;
    })

    .controller('chatCtrl', function($scope,$rootScope, $ionicScrollDelegate, myHttp,$timeout) {
        $scope.moment = moment;
        $scope.showTime = 0;
        $scope.message="";

        $scope.back = function()
        {
            $rootScope.hideTab=false;
            $rootScope.jumpTo('tab.friend');
        }

        $scope.onSwipeLeft = function () {
            if ($scope.showTime == 0) {
                $scope.showTime = 1;
            }
        }

        $scope.onSwipeRight = function () {
            if ($scope.showTime == 1) {
                $scope.showTime = 0;
            }
        }

        $scope.getStyle = function (x) {
            if (x.From == $rootScope.userInfo.Account) {
                if ($scope.showTime == 0)
                    return {
                        'word-wrap': 'break-word',
                        'word-break': 'break-all',
                        'width': '65%',
                        'color': 'blue',
                        'position': 'relative',
                        'left': '35%',
                        'text-align': 'right',
                        'font-size': '25px'
                    };
                else
                    return {
                        'word-wrap': 'break-word',
                        'word-break': 'break-all',
                        'width': '65%',
                        'color': 'blue',
                        'position': 'relative',
                        'left': '20%',
                        'text-align': 'right',
                        'font-size': '25px'
                    };
            }
            else {
                //alert(x.Time);
                return {
                    'word-wrap': 'break-word',
                    'word-break': 'break-all',
                    'width': '65%',
                    'color': 'red',
                    'position': 'relative',
                    'left': '0%',
                    'text-align': 'left',
                    'font-size': '25px'
                };
            }
        }

        $scope.getStyle2 = function () {
            if ($scope.showTime == 0)
                return {'display': 'none'};
            else
                return {
                    'width:': '15%',
                    'float': 'right',
                    'font-size': '12px',
                    'color': 'black',
                    'position': 'relative'
                };
        }

        $scope.sendMessage=function()
        {
            if($scope.message.length>0)
            {
                $rootScope.HXUI.chats[$rootScope.HXUI.chatTarget.Account].push({From:$rootScope.userInfo.Account,To:$rootScope.HXUI.chatTarget.Account,Text:$scope.message,Update:new Date().getTime(),Read:1})
                myHttp.do('p','sendMessage',
                    {
                        Account:$rootScope.userInfo.Account,
                        Password:$rootScope.userInfo.Password,
                        Text:$scope.message,
                        To:$rootScope.HXUI.chatTarget.Account
                    },function()
                    {

                    },function()
                    {

                    });
                $timeout(function() {
                    $ionicScrollDelegate.scrollBottom(true);
                }, 300);
                $scope.message="";
            }
        }
    })