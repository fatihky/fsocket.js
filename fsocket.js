var net = require('net')
  , util = require("util")
  , emitter = require("events").EventEmitter
  , Dissolve = require("dissolve")
  , Concentrate = require("concentrate");

/*
 * Client
 */

function FSocketCli(host, port)
{
    var self = this;
    var options;
    if(typeof host == "object")
        options = host
    else {
        if(typeof host == "string" && typeof port == "number")
            options = { host: host, port: port}
        else if(typeof host == "number")
            options = {port: host}
    }

    this.connection = net.connect(options, function()
    { //'connect' listener
        self.emit("connect");
    });

    this.parser = Dissolve().loop(function(end)
    {
        this.int32le("len").tap(function()
        {
            this.string("data", this.vars.len);
        }).tap(function() {
            this.push(this.vars);
            this.vars = {};
        });
    });

    this.parser.on("readable", function()
    {
        var e;
        while ((e = self.parser.read()))
        {
            self.emit('frame', e);
        }
    });

    function on_data(data)
    {
        self.parser.write(data);
    }

    this.connection.on('data', on_data);

    this.connection.on('end', function()
    {
        self.emit('disconnect');
    });

    emitter.call(this);
}

util.inherits(FSocketCli, emitter);

FSocketCli.prototype.send = function(data)
{
    var encoded = Concentrate().int32le(data.length).string(data, "utf8").result();
    this.connection.write(encoded);
};

FSocketCli.prototype.disconnect = function(ms)
{
    setTimeout(this.connection.end.bind(this.connection), ms || 0);
};

/*
 * Connection
 */

function FSocketConn(c, id)
{
    var self = this;
    this.id = id;
    this.connection = c;
    this.parser = Dissolve().loop(function(end)
    {
        this.int32le("len").tap(function()
        {
            this.string("data", this.vars.len);
        }).tap(function() {
            this.push(this.vars);
            this.vars = {};
        });
    });

    this.parser.on("readable", function()
    {
        var e;
        while ((e = self.parser.read()))
        {
            self.emit('frame', e);
        }
    });

    function on_data(data)
    {
        self.parser.write(data);
    }

    c.on('data', on_data);
    c.on('end', function()
    {
        self.emit('disconnect');
    });

    emitter.call(this);
}

util.inherits(FSocketConn, emitter);

FSocketConn.prototype.send = function(data)
{
    var encoded = Concentrate().int32le(data.length).string(data, "utf8").result();
    this.connection.write(encoded);
};

/*
 * Server
 */
var FSocketSrv = (function(argument)
{
    var last_id = 1;
    function Server(addr, port)
    {
        var self = this;
        this.addr = addr;
        this.port = port;
        this.conns = [];

        function conn_on_disconnect()
        {
            self.conns.splice(self.conns.indexOf(this), 1);
        }
  
        function on_conn(c)
        {
            var conn = new FSocketConn(c, last_id);
            conn.on('disconnect', conn_on_disconnect);
            self.emit('connect', conn);
            self.conns.push(conn);
            last_id++;
        }
    
        this.server = net.createServer(on_conn);
    
        emitter.call(this);
    }
    
    util.inherits(Server, emitter);

    Server.prototype.listen = function(fn)
    {
        var self = this;
        this.server.listen(this.port, function()
        {
            if(typeof fn == "function")
                fn.apply(self);
        });
    };
    
    Server.prototype.broadcast = function(data)
    {
        this.conns.forEach(function (conn)
        {
            conn.send(data);
        });
    };

    return Server;
})();

function FSocket()
{
    emitter.call(this);
}

util.inherits(FSocket, emitter);

module.exports.FSocketSrv = FSocketSrv;
module.exports.FSocketConn = FSocketConn;
module.exports.FSocketCli = FSocketCli;