//require("moment");
var moment = require('moment-timezone');
var https = require('https');

ROOMS = {
  'Kaffeeklatsch': 'ber201@mozilla.com',
  'Gretchenfrage': 'ber205@mozilla.com',
  'Zeitgeist': 'ber210@mozilla.com',
}
// display in local time, which is:
var TARGET_TZ = "Europe/Berlin";

function makeURL(addr) {
    return 'https://mail.mozilla.com/home/'+addr+'?view=day&fmt=ifb&start=0d&end=24h';
}

exports.ROOMSTATUS = {};
exports.whatsFree = give_me_a_room;

function get_busy_times(vcal_s) {
    /* accepts vcalfreebusystring, returns start/end tuple */
    var events = [];
    for (var j=0; j < vcal_s.split("\r\n").length; j++) {
        var line = vcal_s.split("\r\n")[j];
        if (line == "") continue
        var kv = line.split(":");
        var key = kv[0];
        var value = kv[1];
        if (key == "FREEBUSY;FBTYPE=BUSY") {
          var start,end;
          var mt = value.split("/");
          start = mt[0];
          end = mt[1];
          // parse as given (UTC)
          start = moment.tz(start, "YYYYMMDDTHHmmssZ", "UTC")
          end = moment.tz(end, "YYYYMMDDTHHmmssZ", "UTC")
          // convert to local (e.g. europe/berlin)
          events.push([start.tz(TARGET_TZ), end.tz(TARGET_TZ)])
        }
    }
    return events;
}


function get_room_status(addr, name) {
    var now = moment.tz(TARGET_TZ);
    https.get(makeURL(addr), function(res) {
        var data = '';
    res.on('data', function(bits) {
        data += bits;
    }).on('end', function() {
        var events = get_busy_times(data);
        var next_meeting = undefined;
        var currently_busy = false;        
        for (var i=0; i< events.length; i++) {
            var start = events[i][0];
            var end = events[i][1];
            if (now.diff(end) < 0) {
                // meeting hasn't ended yet
                if (now.diff(start) > 0) {
                    // this meeting is running
                    currently_busy = true;
                }
                else {
                    // this meeting is in the future,
                    // but does it start earlier than the one we already know?
                    if (next_meeting) {
                        if (now.diff(start) < now.diff(next_meeting[0])) {
                            next_meeting = [start, end];
                        }
                    }
                    else {
                        next_meeting = [start, end];
                    }
                }
            }
            else {
                // this meeting has already ended
            }            
        }
        exports.ROOMSTATUS[name] = [currently_busy, next_meeting];
    });
    }).on('error', function(e) {
    });
}

function get_all_rooms() {
    for (var k in ROOMS) {
        get_room_status(ROOMS[k], k)
        // gets async, will land in exports.ROOMSTATUS eventually
    }
}

function give_me_a_room() {
    for (var r in exports.ROOMSTATUS) {
        if (exports.ROOMSTATUS[r][0] == false) {
            return r;
        }
    }
    return "There's no free room :(";
}

var iv;
exports.startPolling =  function(i) {
    var FIFTEEN_SECONDS = 15000;
    get_all_rooms();
    iv = setInterval(get_all_rooms, i || FIFTEEN_SECONDS)
}
exports.stopPolling = function() {
    clearInterval(iv);
}
/*setInterval(function() {
    for (var k in exports.ROOMSTATUS) {
        var busyTxt = (exports.ROOMSTATUS[k][0] == true) ? 'busy' : 'free';
        var wordy= 'Room '+k+ ' is currently '+busyTxt;
        if (typeof exports.ROOMSTATUS[k][1] !== 'undefined') {
            wordy += '. Next meeting starts at '+exports.ROOMSTATUS[k][1][0].format("HH:mm");
        }
        console.log(wordy);
    }
    console.log("\n");
}, 10000);*/
