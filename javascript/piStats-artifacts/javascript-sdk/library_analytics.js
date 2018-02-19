function PiStatsGlobal() {
    this.sdkVersion = "2.0";
    this.screenAlias = screen,
    this.documentAlias = document,
    this.navigatorAlias = navigator,
    this.windowAlias = window;
    this.channel = "web";
    this.distribution="Javascript";
    this.referrerUrl;
    this.prevUrl;
    this.propertyId;
    this.deviceId;
    this.pistatslang;
    this.pistatsstory;

    this.baseUrl = "https://events.pi-stats.com/";
    this.recommendationUrl="https://events.pi-stats.com/recommendation";

    this.ip;
    var parent = this;

    this.piStats = {
        init: function (propertyId,autoTrack) {
            if(propertyId=="" || propertyId==null || typeof(propertyId) == "undefined"){
                throw "Property Id Missing. Initialize piStats javascript using PropertyId.";
            }
            parent.referrerUrl = parent.documentAlias.referrer;
            parent.prevUrl = parent.windowAlias.location.href;
            parent.propertyId = propertyId;
            parent.deviceId = piStats.getCookie("piStatsDEVICEID");
            if(site_lang!=null){
                parent.pistatslang=site_lang;
            }
            else{
                parent.pistatslang="Not Defined"
            }
            if(site_story_id!=null){
                parent.pistatsstory=site_story_id;
            }
            else{
                parent.pistatsstory="Not Defined"
            }
            window.addEventListener("hashchange", function (event) {
                window.onscroll = function () {
                    autoTrack = false;
                };

                if (autoTrack) {
                    parent.referrerUrl = parent.prevUrl;
                    parent.prevUrl = parent.windowAlias.location.href;
                    piStats.load();
                }

            });
        },

        userEventJsonConstruct : function(eventName,registrationId,topicToSubscribe,topicToUnsubscribe){
            if(parent.propertyId=="" || parent.propertyId==null || typeof(parent.propertyId) == "undefined"){
                throw "Property Id Missing. Initialize piStats javascript using PropertyId.";
            }
            var deviceJson = {
                "e":eventName,
                "pid":parent.propertyId,
                "eventTime":new Date().getTime(),
                "_dev":{
                    "lang":parent.pistatslang,
                    "regId":registrationId,
                    "id":parent.deviceId,
                    "ua":parent.navigatorAlias.userAgent,
                    "ctype":parent.channel,
                    "blang":navigator.language || navigator.userLanguage,
                    "v":parent.sdkVersion,
                    "dist":parent.distribution,
                    "tpc":topicToSubscribe,
                    "untpc": topicToUnsubscribe,
                    "loc":{
                    },
                    "d":{
                        "t":piStats.deviceTracker(parent.navigatorAlias.userAgent)
                    }
                }
            };
            return deviceJson;
        },

        subscribeNotification : function(registrationId,topicToSubscribe,topicToUnsubscribe){
            if(parent.propertyId=="" || parent.propertyId==null || typeof(parent.propertyId) == "undefined"){
                throw "Property Id Missing. Initialize piStats javascript using PropertyId.";
            }
            if(!parent.deviceId){
                var deviceJson = piStats.userEventJsonConstruct("Registration");
                piStats.dataPostRequestDevice(parent.baseUrl+"registration/", JSON.stringify(deviceJson));
            }
            else{
                var deviceJson = piStats.userEventJsonConstruct("Subscription",registrationId,topicToSubscribe,topicToUnsubscribe);
                piStats.dataPostRequestDevice(parent.baseUrl+"subscription/", JSON.stringify(deviceJson));
            }
        },

        clickEvent : function(eventName){
            var eventJson = {
                "e":eventName,
                "pid":parent.propertyId,
                "c":{
                    "cnt":parent.pistatsstory,
                    "lan":parent.pistatslang,
                    "url":parent.windowAlias.location.href,
                    "ref":{
                        "u":parent.referrerUrl,
                    },
                },
                "_dev":{
                    "id":parent.deviceId,
                    "ua":parent.navigatorAlias.userAgent,
                    "ctype":parent.channel,
                    "blang":navigator.language || navigator.userLanguage,
                    "v":parent.sdkVersion,
                    "dist":parent.distribution,
                    "loc":{
                    },
                    "d":{
                        "t":piStats.deviceTracker(parent.navigatorAlias.userAgent)
                    }
                }
            };
            piStats.dataPostRequestClick(parent.baseUrl+"events/", JSON.stringify(eventJson));
        },

        onClickEvent : function(url,eventName){
            var eventJson = {
                "e":eventName,
                "pid":parent.propertyId,
                "c":{
                    "cnt":parent.pistatsstory,
                    "lan":parent.pistatslang,
                    "url":url,
                    "ref":{
                        "u":parent.referrerUrl,
                    },
                },
                "_dev":{
                    "id":parent.deviceId,
                    "ua":parent.navigatorAlias.userAgent,
                    "ctype":parent.channel,
                    "blang":navigator.language || navigator.userLanguage,
                    "v":parent.sdkVersion,
                    "dist":parent.distribution,
                    "loc":{
                    },
                    "d":{
                        "t":piStats.deviceTracker(parent.navigatorAlias.userAgent)
                    }
                }
            };
            piStats.dataPostRequestClick(parent.baseUrl+"events/", JSON.stringify(eventJson));
        },

        onClickLoad: function(url,eventName){

            if(parent.propertyId=="" || parent.propertyId==null || typeof(parent.propertyId) == "undefined"){
                throw "Property Id Missing. Initialize piStats javascript using PropertyId.";
            }
            if(!parent.deviceId){
                var deviceJson = piStats.userEventJsonConstruct("Registration");
                piStats.dataPostRequestDevice(parent.baseUrl+"registration/", JSON.stringify(deviceJson));
            }
            else{
                piStats.onClickEvent(url,eventName)
            }

        },

        load: function(eventName){

            if(parent.propertyId=="" || parent.propertyId==null || typeof(parent.propertyId) == "undefined"){
                throw "Property Id Missing. Initialize piStats javascript using PropertyId.";
            }
            if(!parent.deviceId){
                var deviceJson = piStats.userEventJsonConstruct("Registration");
                piStats.dataPostRequestDevice(parent.baseUrl+"registration/", JSON.stringify(deviceJson));
            }
            else{
                piStats.clickEvent(eventName)
            }
        },

        dataPostRequestDevice: function(url,data){
            try{
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function () {
                    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                        var response = JSON.parse(xmlhttp.responseText);
                        if (!parent.deviceId && response) {
                            piStats.setCookie("piStatsDEVICEID",response.id,400000,piStats.getDomain());
                            parent.deviceId=response.id;
                            piStats.clickEvent("Page Load");
                        }
                    }
                    else if (xmlhttp.readyState == 4 && xmlhttp.status !== 200) {
                        piStats.errorLogPost(data,xmlhttp.status,xmlhttp.responseText);
                    }

                };
                xmlhttp.open("POST", url, true);
                xmlhttp.setRequestHeader("Content-type", "application/json");
                xmlhttp.send(data);
            }
            catch(err){
                piStats.errorLogPost(data,xmlhttp.err.err);
            }
        },

        dataPostRequestClick: function(url,data){
            var guid = localStorage.getItem("GUID");
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status !== 200) {
                    piStats.errorLogPost(data,xmlhttp.status,xmlhttp.responseText);
                }
            };
            xmlhttp.open("POST", url, true);
            xmlhttp.setRequestHeader("Content-type", "application/json");
            xmlhttp.send(data);
        },

        errorLogPost : function(data,status,responseText){
            var xmlHttpErr = new XMLHttpRequest();
            var errorJson = {"responseText": responseText,"status":status,"data":data};
            xmlHttpErr.open("POST", parent.baseUrl+"errorPost/", true);
            xmlHttpErr.setRequestHeader("Content-type", "application/json");
            xmlHttpErr.send(JSON.stringify(errorJson));
        },

        deviceTracker:function(userAgent){
            var checkmobile = false;
          if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(userAgent)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(userAgent.substr(0,4))) checkmobile = true;
            (navigator.userAgent||navigator.vendor||window.opera);
            var checkTablet = false;
            if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(userAgent)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(userAgent.substr(0,4)))
                checkTablet = true;(navigator.userAgent||navigator.vendor||window.opera);
            if(checkmobile && checkTablet)
                return "Mobile"
            else if(checkTablet&&!checkmobile)
                return "Tablet"
            else
                return "Desktop"

        },

        setCookie: function (cname, cvalue, exdays,domain) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays*24*60*60*1000));
            var expires = "expires="+ d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/" + ";domain=" + domain;
        },

        getCookie: function (cname) {
            var name = cname + "=";
            var decodedCookie = decodeURIComponent(document.cookie);
            var ca = decodedCookie.split(';');
            for(var i = 0; i <ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        },

        getDomain : function(){
                var i=0,domain=document.domain,p=domain.split('.'),s='_gd'+(new Date()).getTime();
                while(i<(p.length-1) && document.cookie.indexOf(s+'='+s)==-1){
                domain = p.slice(-1-(++i)).join('.');
                document.cookie = s+"="+s+";domain="+domain+";";
            }
            document.cookie = s+"=;expires=Thu, 01 Jan 1970 00:00:01 GMT;domain="+domain+";";
            return domain;
        },

        recommendation:function(num,contentId,callback){
            var eventUrl = parent.windowAlias.location.href;
            var deviceIden;
            if(parent.propertyId=="" || parent.propertyId==null || typeof(parent.propertyId) == "undefined"){
                throw "Property Id Missing. Initialize piStats javascript using PropertyId.";
            }
            if(parent.deviceId==null){
                deviceIden = localStorage.getItem("GUID");
            }
            else{
                deviceIden = parent.deviceId;
            }
            var eventProperties = {
                "url": eventUrl,
                "deviceId": deviceIden,
                "contentId":contentId,
                "language":parent.pistatslang,
                "propertyId":parent.propertyId
            }
            if(deviceIden === "" || typeof(deviceIden) == "undefined" || deviceIden == null) {
                setTimeout(function() { piStats.recommendation(num,contentId,callback) }, 50);
                return;
            }
            piStats.apiRequestRecommendation(parent.baseUrl+"recommendation"+"/"+num, JSON.stringify(eventProperties),function(result){
                return callback(result);
            });
        },

        apiRequestRecommendation: function (apiUrl, data,callback) {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {

                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    if(xmlhttp.responseText && xmlhttp.responseText !="")  {
                        var response = JSON.parse(xmlhttp.responseText);
                        callback(response);
                    }

                }
                else if (xmlhttp.readyState == 4 && xmlhttp.status !== 200) {
                    piStats.errorLogPost(data,xmlhttp.status,xmlhttp.responseText);
                }

            };
            xmlhttp.open("POST", apiUrl, true);
            xmlhttp.setRequestHeader("Content-type", "application/json");
            xmlhttp.send(data);
        }
    }
}

window.piStats = new PiStatsGlobal().piStats;