fsocket.js
==========
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/fatihky/fsocket.js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[fsocket](https://github.com/fatihky/fsocket) javascript implementation

Just run: `npm install git://github.com/fatihky/fsocket.js` for install latest development reelase.

### Example server:

```javascript

var fsocket = require("fsocket.js");
var FSocketSrv = fsocket.FSocketSrv;
var srv = new FSocketSrv("127.0.0.1", 9123);

srv.on('connect', function(conn)
{
    var self = this;
    console.log("new connection");
    conn.on("frame", function (frame)
    {
        console.log("[server] new frame:", frame);
        //this.send("pong");
        self.broadast("data received: " + frame.data);
    });

    conn.on('disconnect', function()
    {
        console.log("connection(id: %d) closed.", this.id);
    });
})

srv.listen(function()
{
    console.log("server listening on: %s:%d", this.addr, this.port);
});

```

### Example client:

```javascript

var fsocket = require("fsocket.js");
var FSocketCli = fsocket.FSocketCli;
var cli = new FSocketCli("127.0.0.1", 9123);
// var cli = new FSocketCli(9123);
// var cli = new FSocketCli({host: "127.0.0.1", port: 9123});

cli.on('connect', function ()
{
    console.log("client connected to the server");
    this.send("ping");
    this.on("frame", function (frame)
    {
        console.log("[client] new frame:", frame);
    });
})

```