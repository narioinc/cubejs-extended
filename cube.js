// Cube configuration options: https://cube.dev/docs/config
/** @type{ import('@cubejs-backend/server-core').CreateOptions } */
// require('appmetrics-dash').attach()
//const helmet = require("helmet");

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
    
    /* multi-tenancy via query filters */
    queryRewrite: (query, { securityContext }) => {
        // Ensure `securityContext` has an `id` property
        /*if (!securityContext.org_id) {
          throw new Error('No id found in Security Context!');
        }
    
        query.filters.push({
          member: 'dh_order_header.organization_id',
          operator: 'equals',
          values: [securityContext.org_id],
        });*/
    
        return query;
      },

      /*checkSqlAuth: async (req, username) => {
        //if (username === "username") {
          return {
            password: "password",
            securityContext: {  
            "iat": 1687747054,
            "exp": 1687833454,
            "user_id": 2,
            "org_id": 991
            },
          };
        //}
    
        //throw new Error("Incorrect user name or password");
      },*/
      
      initApp: (app) => {
        /*app.use((req, res, next) => {
          res.locals.cspNonce = crypto.randomBytes(16).toString("hex");
          next();
        });
        });
        app.use(require('express-status-monitor')())
        /*app.use(helmet({
          contentSecurityPolicy: false
        }));*/
        app.use(metricsMiddleware);
        app.use(compression({ filter: shouldCompress, level: 9 }))
      },
};