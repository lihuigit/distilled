var _ = require('../../lib/underscore')._,
    logger = require('../../lib/log').logger,
    step = require('../../lib/step'),
    connect = require('../connect/lib/connect'),
    Builder = require("./route_builder");

exports.start = function (root) {
    var env = { path: root };

    step(
      function () {
          require('./config').load(env, this);
      },
      function () {
          require('./template').load(env, this);
      },
      function (err) {
          if (err) {
              throw err;
          }

          var loadHandler = function (name) {
              logger.info("loading controller " + name);
              var path = ["../../", 'app', 'controllers', name].join('/');
              return require(path)(env);
          };

          var builder = new Builder(),
              routes = function (app) {
                  eval(builder.build(env.routes));
              },
              server = connect.createServer(
                  connect.logger({format:env.log.format}),
                  connect.staticProvider(env.path + 'public'),
                  connect.bodyDecoder(),
                  connect.methodOverride(),
                  connect.conditionalGet(),
                  connect.router(routes)
              );

          logger.info("starting on http://" + env.server.host + ":" + env.server.port);
          server.listen(env.server.port, env.server.host);
      }
    );
}
