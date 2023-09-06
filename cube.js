// Cube configuration options: https://cube.dev/docs/config
/** @type{ import('@cubejs-backend/server-core').CreateOptions } */
// require('appmetrics-dash').attach()
const helmet = require("helmet");
const promBundle = require("express-prom-bundle");


const metricsMiddleware = promBundle({
  includeMethod: true, 
  includePath: true, 
  includeStatusCode: true, 
  includeUp: true,
  customLabels: {project_name: 'cubejs-pipeline', project_type: 'data-semantics'},
  promClient: {
      collectDefaultMetrics: {
      }
    }
}); 

var compression = require('compression')

function shouldCompress (req, res) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false
  }
 
  // fallback to standard filter function
  return compression.filter(req, res)
}

module.exports = {  
      initApp: (app) => {
        /*app.use((req, res, next) => {
          res.locals.cspNonce = crypto.randomBytes(16).toString("hex");
          next();
        });
        });*/
        app.use(require('express-status-monitor')())
        app.use(helmet({
          contentSecurityPolicy: false
        }));
        app.use(metricsMiddleware);
        app.use(compression({ filter: shouldCompress, level: 9 }))
      },
};