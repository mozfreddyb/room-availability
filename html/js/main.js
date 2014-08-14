(function() {

function poll(cb) {
    var x = new XMLHttpRequest();
    x.open("GET", "/status?overview");
    x.responseType = "json";
    x.send();
    x.onload = cb;
}
poll(function (e) {
    var j = e.target.response;
	  if (typeof j == "string") { j = JSON.parse(j); }
    for (var room in j) {
        var div = document.createElement("div");
        div.id = room;
        div.classList.remove("free","busy"); // reset busy/free status.
        div.classList.add("room");
        var bf = j[room][0] == true ? "busy" : "free";
        div.classList.add(bf);
        var header = document.createElement("header");
        header.textContent = room +' ('+bf+')';
        div.appendChild(header);
        var p = document.createElement("p");
        if (j[room][1]) {
            p.textContent = "Next meeting: " + moment(j[room][1][0]).fromNow();
        }
        //console.log(JSON.stringify(j[room]));
        div.appendChild(p);
        document.body.appendChild(div);
    }   
})



setInterval(function() {
    poll(function(e) {
        var j = e.target.response;
        if (typeof j == "string") { j = JSON.parse(j); }
        for (var room in j) {
            var div = document.querySelector("div#"+room);
            var bf = j[room][0] == true ? "busy" : "free";
            div.classList.add(bf);
            var header = div.querySelector("header");
            header.textContent = room +' ('+bf+')';
            var p = div.querySelector("p");
            if (j[room][1]) {
                p.textContent = "Next meeting: " + moment(j[room][1][0]).fromNow();
            }
        }
    })
    },30000);    
})();
