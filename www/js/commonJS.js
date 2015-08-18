/**
 * Created by jin on 7/2/15.
 */
function getImage(iid, cid, l, $rootScope, myHttp, tries,cb) {
    //console.log(iid);
    if ($rootScope.tempImages[iid] == undefined) {
        if (tries > 0) {
            myHttp.do('p', 'GetImage',
                {
                    ID: iid
                },
                function (data) {
                    $rootScope.tempImages[iid] = data.data;
                    if(cb!=undefined)
                        cb(iid,cid);
                },
                function () {
                    getImage(iid, cid, l, $rootScope, myHttp, tries - 1);
                })
        }
    }
}

function showImage(iid, cid, l, $rootScope) {
    if ($rootScope.tempImages [iid]) {
        if(l>0)
        {
            var w = $rootScope.tempImages [iid].w;
            var h = $rootScope.tempImages [iid].h;
            if (w == undefined || h == undefined) {
                var img = new Image();
                img.src = $rootScope.tempImages[iid].Data;
                img.onload = function () {
                    $rootScope.tempImages [iid].w = img.width;
                    $rootScope.tempImages [iid].h = img.height;
                    showImage(iid, cid, l, $rootScope);
                }
            }
            else {
                if (w >= h) {
                    var nh = Math.floor(l / w * h);
                    if (nh < 10)
                        nh = 10;
                    $(cid).css('height', nh + 'px');
                }
                else {
                    var nw = Math.floor(l / h * w);
                    if (nw < 10)
                        nw = 10;
                    $(cid).css('width', nw + 'px');
                }
                $(cid).attr('src', $rootScope.tempImages [iid].Data);
            }
        }
        else
        {
            $(cid).attr('src', $rootScope.tempImages [iid].Data);
        }
    }
}

function myAlert(msg) {
    if (msg.length > 0) {
        $(".alert1P").text(msg);
        $(".alert1").fadeIn(0, function () {
            setTimeout(function () {
                $(".alert1").fadeOut(2000);
            }, 1000)
        });
    }
}

