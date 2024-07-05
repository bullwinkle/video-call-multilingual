import * as process from "node:process";

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
console.log(IS_PRODUCTION, process.env.NODE_ENV);

(IS_PRODUCTION
    ? import('./run-production.js')
    : import('./run-development.js')
).then(({run}) => run());
