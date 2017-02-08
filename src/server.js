'use strict';

require('./init');

const appBuilder = require('./express-app-builder');

appBuilder.build().then(app => app.listen(process.env.PORT || 8080));
