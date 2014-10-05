var fsocket = require("./fsocket");
var FSocketSrv = fsocket.FSocketSrv;
var FSocketCli = fsocket.FSocketCli;
var srv = new FSocketSrv("127.0.0.1", 9123);
var cli = new FSocketCli("127.0.0.1", 9123);

srv.on('connect', function(conn)
{
    console.log("new connection");
    conn.on("frame", function (frame)
    {
        console.log("[server] new frame:", frame);
        this.send("pong");
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

cli.on('connect', function ()
{
    console.log("client connected to the server");
    this.send("ping");
    this.on("frame", function (frame)
    {
        console.log("[client] new frame:", frame);
    });
})