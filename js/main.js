function getNonZeroRandomNumber() {
    var random = Math.floor(Math.random() * 199) - 99;
    if (random === 0)
        return getNonZeroRandomNumber();
    return random;
}

function d(a) {
    return a.replace(/((https?|s?ftp|ssh)\:\/\/[^"\s\<\>]*[^.,;'">\:\s\<\>\)\]\!])/g, function (a) {
        return'<a href="' + a + '" >' + a + "</a>";
    });
}


function face(data) {
    if (data[1] > 0) {
        return 'images/grinning-face.png';
    } else if (data[2] > 0) {
        return 'images/heart-eyed-happy-face.png';
    } else {
        return 'images/angry-face.png'
    }
}

function toDate(timestamp_ms) {
    var e = new Date(parseInt(timestamp_ms)),
            f = e.toDateString().substr(4),
            g = e.getHours() > 12 ? e.getHours() - 12 + ":" + e.getMinutes() + " PM" : e.getHours() + ":" + e.getMinutes() + " AM;";
    var timestamp = g + " - " + f;
    return timestamp;
}




var channel = 'pubnub-mapbox' + getNonZeroRandomNumber();
var new_point = [];
var le;

var emoji_love = ['❤', '\\ud83c\\udfe9', '\\ud83d\\udc8c', '\\u2665\\u2764', '\\ud83d\\ude0d', '\\ud83d\\ude3b', '\\ud83d\\udc91', '\\ud83d\\udc93', '\\ud83d\\udc94', '\\ud83d\\udc95', '\\ud83d\\udc96', '\\ud83d\\udc97', '\\ud83d\\udc98', '\\ud83d\\udc99', '\\ud83d\\udc9a', '\\ud83d\\udc9b', '\\ud83d\\udc9c', '\\ud83d\\udc9d', '\\ud83d\\udc9e', '\\ud83d\\udc9f'];
var emoji_neg = [':\\\(', ':\\\(\\\(', ':\\\'\\\(', '\\ud83d\\ude22', '\\ud83d\\ude14', '\\ud83d\\ude12', '\\ud83d\\ude16', '\\ud83d\\ude35', '\\ud83d\\ude23', '\\ud83d\\ude1f', '\\ud83d\\ude14', '\\ud83d\\ude1e', '\\ud83d\\ude20', '\\ud83d\\ude29', '\\ud83d\\ude28', '\\ud83d\\ude28', '\\ud83d\\ude2d', '\\ud83d\\ude22', '\\ud83d\\ude2d', '\\ud83d\\ude3f', '\\ud83d\\ude21', '\\ud83d\\ude35'];
var emoji_pos = [':\\\)', ':\\\)\\\)', ':\\\'\\\)', '\\ud83d\\ude01', '\\ud83d\\ude03', '\\ud83d\\ude04', '\\ud83d\\ude05', '\\ud83d\\ude06', '\\ud83d\\ude0a', '\\ud83d\\ude0d', '\\ud83d\\ude38', '\\ud83d\\ude3a', '\\ud83d\\ude3b', '\\ud83d\\ude07', '\\ud83d\\ude08', '\\ud83d\\ude0e', '\\ud83d\\ude19', '\\ud83d\\ude4b', '\\ud83d\\ude02', '\\ud83d\\ude39', '\\ud83d\\ude09', '\\ud83d\\ude1c', '\\ud83d\\ude1b', '\\ud83d\\ude0b'];
// http://apps.timwhitlock.info/emoji/tables/unicode
// http://apps.timwhitlock.info/emoji/tools/finder#

var re_love = emoji_love.join(" | ");
var re_pos = emoji_pos.join(" | ");
var re_neg = emoji_neg.join(" | ");

var degree = 0;

//var re = /(:\)|:'\))/;

eon.map({
    id: 'map',
    mb_token: 'pk.eyJ1IjoiaWFuamVubmluZ3MiLCJhIjoiZExwb0p5WSJ9.XLi48h-NOyJOCJuu1-h-Jg',
    mb_id: 'ianjennings.l896mh2e',
    channel: channel,
    marker: function (latlng, data) {
        var marker = new L.Marker(latlng, {
            icon: L.icon({
                iconUrl: face(data),
                iconSize: [34, 34]
            })
        });

        var popup = '<div class="middle"><font face="Arial" size="4">' + twemoji.parse(d(data[0])) + "</font></div>";
        var p0 = '<blockquote class="h-entry">';
        var pn = '</blockquote>'
        var p3 = '<a class="button" role="button" title="Follow on Twitter" href="" target="_blank"><img src="images/twitter-button.png"></a>';
        var p1 = '<div class="text">' + popup + '</div><div class="timestamp">' + data[6] + '</div>';
        //var p2 = '<div class="header" style="background-image:url(' + data[4] + ')"><div class="name">'+data[5]+'</div><div class="screenname">'+data[3]+'</div></div>'
        var p4 = '<img src=' + data[4] + ' align="left">'
        var p2 = '<div class="header" style="height:60px">' + p4 + '<div class="name" align="right" size="3">' + data[5] + '</div><div class="screenname" align="right" size="3">' + data[3] + '</div></div>'

        //var s = document.querySelector(".header").style.backgroundImage = "url(" + data[4] + ")" ;

        var p = p0 + p2 + p1 + pn;
        marker.bindPopup(p);
        return marker;
    },
    connect: connect,
    options: {
        zoomAnimation: false
    }
});

function connect() {
    var point = {
        latlng: [37.370375, -97.756138]
    };

    var pn = PUBNUB.init({
        publish_key: 'demo'
    });

    var pn_tweet = PUBNUB.init({
        subscribe_key: 'sub-c-78806dd4-42a6-11e4-aed8-02ee2ddab7fe'
    });

    var new_point3 = JSON.parse(JSON.stringify(point));
    var new_p;

    pn_tweet.subscribe({
        channel: 'pubnub-twitter',
        message: function (msg) {

            if (msg.place !== null) {
                new_p = msg.place.bounding_box.coordinates[0][0];
                //console.log("point " + msg.place.bounding_box.coordinates[0][0]);

                var query = d3.select("body").selectAll("li").data();
                var re_query = query.join(" | ");
                le = new_point.length;
                var bp = Boolean(msg.text.match(re_pos));
                var bn = Boolean(msg.text.match(re_neg));
                var bl = Boolean(msg.text.match(re_love));
                if (bp || bn || bl) {
                    if (Boolean(msg.text.match(re_query))) {
                        //if (msg.lang === 'it'){
                        console.log("country " + msg.place.country + " message " + msg.text);
                        new_point = JSON.parse(JSON.stringify(new_point));
                        new_point[le] = {
                            data: [msg.text, bp ? 1 : -1, bl ? 1 : -1, "@" + msg.user.screen_name, msg.user.profile_image_url, msg.user.name, toDate(msg.timestamp_ms)],
                            latlng: [
                                new_p[1],
                                new_p[0]
                            ]
                        };
                        new_point3 = JSON.parse(JSON.stringify(new_point));

                        publish(new_point3);
                    }
                    //}
                }
            }
        }
    });

    function publish(nn) {
        pn.publish({
            channel: channel,
            message: nn
        });
    }
}
;