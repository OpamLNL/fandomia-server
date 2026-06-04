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

function isServerlessDeploy() {
    return Boolean(process.env.VERCEL || process.env.VERCEL_URL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

function buildSwaggerUiSetupOptions() {
    const options = {
        explorer: true,
        customSiteTitle: 'Fandomia API',
        customCss: '.swagger-ui .topbar { display: none }',
        swaggerOptions: {
            persistAuthorization: true,
        },
    };

    // На Vercel локальні swagger-ui-dist дають 404 → HTML замість JS (Unexpected token '<').
    if (isServerlessDeploy()) {
        const swaggerUiVersion = '5.20.1';
        const swaggerCdn = `https://cdn.jsdelivr.net/npm/swagger-ui-dist@${swaggerUiVersion}`;
        options.customCssUrl = `${swaggerCdn}/swagger-ui.css`;
        options.customJs = [
            `${swaggerCdn}/swagger-ui-bundle.js`,
            `${swaggerCdn}/swagger-ui-standalone-preset.js`,
        ];
        options.customfavIcon = `${swaggerCdn}/favicon-32x32.png`;
    }

    return options;
}

function setupSwagger(app) {
    app.get('/api/docs/swagger.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(buildSwaggerSpec(req));
    });

    /** Запасний варіант, якщо UI на serverless не відкривається — Swagger Editor зі spec URL. */
    app.get('/api/docs/open', (req, res) => {
        const baseUrl = resolvePublicBaseUrl(req);
        const specUrl = `${baseUrl}/api/docs/swagger.json`;
        const editorUrl = `https://editor.swagger.io/?url=${encodeURIComponent(specUrl)}`;
        res.redirect(302, editorUrl);
    });

    const setupHandler = (req, res, next) => {
        const spec = buildSwaggerSpec(req);
        swaggerUi.setup(spec, buildSwaggerUiSetupOptions())(req, res, next);
    };

    if (isServerlessDeploy()) {
        app.use('/api/docs', setupHandler);
    } else {
        app.use('/api/docs', swaggerUi.serve, setupHandler);
    }
}

module.exports = {
    setupSwagger,
    buildSwaggerSpec,
    resolvePublicBaseUrl,
};
