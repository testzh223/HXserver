/**
 * Created by Administrator on 2015-06-04.
 */
(function(){        //�հ�
    function load_script(xyUrl, callback){
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = xyUrl;
        script.onload = script.onreadystatechange = function(){
            if((!this.readyState || this.readyState === "loaded" || this.readyState === "complete")){
                callback && callback();
                // Handle memory leak in IE
                script.onload = script.onreadystatechange = null;
                if ( head && script.parentNode ) {
                    head.removeChild( script );
                }
            }
        };
        head.insertBefore( script, head.firstChild );
    }

    function translate(point,type,callback){
        var callbackName = 'cbk_hxb' + Math.round(Math.random() * 100000000)+'hxb';    //���������
        var xyUrl = "http://api.map.baidu.com/ag/coord/convert?from="+ type + "&to=4&x=" + point.lng + "&y=" + point.lat + "&callback=BMap.Convertor." + callbackName;
        console.log(xyUrl);
        load_script(xyUrl);
        BMap.Convertor[callbackName] = function(xyResult){
            delete BMap.Convertor[callbackName];    //��������Ҫɾ���ĺ���
            var point = new BMap.Point(xyResult.x, xyResult.y);
            callback && callback(point);
        }
    }

    window.BMap = window.BMap || {};
    BMap.Convertor = {};
    BMap.Convertor.translate = translate;
})();