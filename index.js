(function () {
     var http = require('http');
     var url = require("url");
    //Speed definitions derived from ...
    //@http://kenstechtips.com/index.php/download-speeds-2g-3g-and-4g-actual-meaning
    var detectSpeed = {}
    var speedClasses = [{
        name: 'OFFLINE',
        latency: Number.POSITIVE_INFINITY,
        throughput: 0
    },{
        name: 'DAIL_UP',
        latency: 2000,
        throughput: 2.4 
    },{
        name: 'GPRS',
        latency: 500,
        throughput: 50
    }, {
        name: '2G',
        latency: 300,
        throughput: 250
    }, {
        name: '2G_EDGE',
        latency: 300,
        throughput: 450
    }, {
        name: '3G',
        latency: 200,
        throughput: 750
    }, {
        name: '3G_HSPA',
        latency: 200,
        throughput: 1000
    }, {
        name: '4G',
        latency: 100,
        throughput: 4000
    }, {
        name: 'WIFI',
        latency: 100,
        throughput: 10000
    }
    ];

    for (var s = 0; s < speedClasses.length; s++) {
        detectSpeed["SPEED_" + speedClasses[s].name] = speedClasses[s];
    }

    var app = this;
    if (app != null) {
        previous_detectSpeed = app.detectSpeed;
    }

    detectSpeed.noConflict = function () {
        app.detectSpeed = previous_detectSpeed;
        return detectSpeed;
    };
    detectSpeed.startSpeedCheck = function (earl, callback) {
        var earl = earl || "http://ashanbh.github.io/images/coffee-apple-iphone-laptop.jpg";
        earl = earl + (/\?/.test(earl) ? "&" : "?") + "cacheBuster=" + Date.now();
        var _timings = {};
        
        var options = {
            hostname: url.parse(earl).hostname,
            path: url.parse(earl).pathname,
            port: url.parse(earl).port,
            method: 'GET'
            };
            
        var req = http.request(options, function(res) {
            var size = 0;
            res.setEncoding('utf8');
            
            res.on('data', function (chunk) {
                if(size==0){
                    _timings.firstByte = _timings.firstByte || Date.now();
                }
                size += chunk.length;
            });
            
            res.on('end',function() {
                _timings.end = Date.now();
                _timings.data={};
                _timings.data.url = earl;
                _timings.data.dataSizeKB = size / 1024 ;
                _timings.data.latency = (_timings.firstByte - _timings.start);
                _timings.data.throughput = Math.round(size / (_timings.end - _timings.firstByte) * 100) / 100; //in KBPS
                for (var s = 0; s < speedClasses.length; s++) {
                    if(_timings.data.throughput > speedClasses[s].throughput){
                        _timings.data.throughPutSpeedClass = speedClasses[s];
                    }
                    if(_timings.data.latency <speedClasses[s].latency){
                        _timings.data.latencySpeedClass = speedClasses[s];
                    }
                }
                callback && callback(_timings);
            })
        });

        req.on('error', function(e) {
           console.log('problem with request: ' + e.message);
        });
        
        _timings.start = Date.now();
        req.end();
    };

    // Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = detectSpeed;
    }
})();