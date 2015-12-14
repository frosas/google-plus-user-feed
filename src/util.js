'use strict';

const util = module.exports;

util.promisify = function() {
    // TODO Switch to ES6 version when available:
    // let [object, func] = args.length == 1 ? [null, args[0]] : [args[0], args[1]];
    let object, func;
    if (arguments.length == 1) {
        object = null;
        func = arguments[0];
    } else {
        object = arguments[0];
        func = arguments[1];
    }
    return function() {
        return new Promise((resolve, reject) => {
            func.call(object, ...arguments, (error, value) => {
                error ? reject(error) : resolve(value);
            });
        });
    };
};
