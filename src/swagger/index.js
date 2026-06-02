const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerOptions = require('./swaggerOptions');

function resolvePublicBaseUrl(req) {
    if (process.env.API_PUBLIC_URL) {
        return process.env.API_PUBLIC_URL.replace(/\/$/, '');
    }

    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    if (req) {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
        const host = req.headers['x-forwarded-host'] || req.get('host');
        if (host) {
            return `${protocol}://${host}`;
        }
    }

    return 'http://localhost:3000';
}

function buildSwaggerSpec(req) {
    const baseUrl = resolvePublicBaseUrl(req);
    const options = swaggerOptions(baseUrl);
    return swaggerJsdoc(options);
}

function setupSwagger(app) {
    app.get('/api/docs/swagger.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(buildSwaggerSpec(req));
    });

    app.use(
        '/api/docs',
        swaggerUi.serve,
        (req, res, next) => {
            const spec = buildSwaggerSpec(req);
            swaggerUi.setup(spec, {
                explorer: true,
                customSiteTitle: 'Fandomia API',
                customCss: '.swagger-ui .topbar { display: none }',
                swaggerOptions: {
                    persistAuthorization: true,
                },
            })(req, res, next);
        }
    );
}

module.exports = {
    setupSwagger,
    buildSwaggerSpec,
    resolvePublicBaseUrl,
};
