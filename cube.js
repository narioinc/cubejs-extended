// Cube configuration options: https://cube.dev/docs/config
/** @type{ import('@cubejs-backend/server-core').CreateOptions } */
//require('appmetrics-dash').attach()
const helmet = require("helmet");
const promBundle = require("express-prom-bundle");
const { rateLimit } = require('express-rate-limit');

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
        if(process.env.CUBEJS_STATUS_MON) app.use(require('express-status-monitor')())
        if(process.env.CUBEJS_ENABLE_HELMET) app.use(helmet({
          contentSecurityPolicy: false
        }));
        if(process.env.CUBEJS_PROM_METRICS) app.use(metricsMiddleware);
        if(process.env.CUBEJS_ENABLE_COMPRESSION) app.use(compression({ filter: shouldCompress, level: 9 }))
        if(process.env.CUBEJS_ENABLE_RATE_LIMIT){
          const limiter = rateLimit({
            windowMs: process.env.CUBEJS_RATE_LIMIT_WINDOWMS ? process.env.CUBEJS_RATE_LIMIT_WINDOWMS : 15 * 60 * 1000, // 15 minutes
            max: process.env.CUBEJS_RATE_LIMIT_MAX? process.env.CUBEJS_RATE_LIMIT_MAX : 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
            standardHeaders: 'draft-7', // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
            legacyHeaders: false, // X-RateLimit-* headers
            // store: ... , // Use an external store for more precise rate limiting
          })
          app.use(limiter)
        }
      },
};