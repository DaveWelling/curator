// The idea here is to get nwb to give us the same configuration
// it gives for building the module so we can let nwb worry about
// the versions of the tool chain.
// Ideally, this would go a step further back and not require
// presets etc to be passed in.  I tried, but I couldn't
// parse through all the nwb code to figure it out.
// const path = require('path');
// const createBabelConfig = require('nwb/lib/createBabelConfig');
// const nwbConfigPath = path.join(__dirname, 'nwb.config.js');
// const config = createBabelConfig(
//     {
//         presets: ['react'],
//         stage: 1,
//         removePropTypes: {
//             mode: 'wrap'
//         },
//         commonJSInterop: true,
//         modules: 'commonjs',
//         setRuntimePath: false,
//         webpack: false
//     },
//     {},
//     nwbConfigPath
// );

// // FOR DEBUGGING
// //console.log(JSON.stringify(config, null, 3));

// require('babel-register')(config);

require('@babel/register')({
    presets: ['@babel/env', '@babel/react']
});
