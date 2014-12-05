module.exports = exports = testbinary;

exports.usage = 'Tests that the binary.node can be required';

var fs = require('fs'),
    path = require('path'),
    log = require('npmlog'),
    cp = require('child_process'),
    versioning = require('./util/versioning.js'),
    path = require('path'),
    TargetUtils = require('./util/targets.js');
    find = require('./pre-binding').find;

function testbinary(gyp, argv, callback) {
    var args = [],
        options = {},
        shell_cmd = process.execPath,
        package_json = JSON.parse(fs.readFileSync('./package.json')),
        opts = versioning.evaluate(package_json, gyp.opts),
    // ensure on windows that / are used for require path
        binary_module = opts.module.replace(/\\/g, '/'),
        module_path = opts.module_path,
        nw = (opts.runtime && opts.runtime === 'node-webkit'),
        targets = package_json.binary.targets;


    if (nw) {
        options.timeout = 5000;
        if (process.platform === 'darwin') {
            shell_cmd = 'node-webkit';
        } else if (process.platform === 'win32') {
            shell_cmd = 'nw.exe';
        } else {
            shell_cmd = 'nw';
        }

        var modulePath = path.resolve(binary_module);
        var appDir = path.join(__dirname, 'util', 'nw-pre-gyp');

        if (!!targets) {
          modulePath = path.resolve(binary_module);
          appDir = path.join(__dirname, 'util', 'nw-pre-gyp');
        }

        args.push(appDir);
        args.push(modulePath);

        log.info("validate","Running test command: '" + shell_cmd + ' ' + args.join(' ') + "'");

        cp.execFile(shell_cmd, args, options, function(err, stdout, stderr) {
            // check for normal timeout for node-webkit
            if (err) {
                if (err.killed === true && err.signal && err.signal.indexOf('SIG') > -1) {
                    return callback();
                }
                var stderrLog = stderr.toString();
                log.info('stderr', stderrLog);
                if( /^\s*Xlib:\s*extension\s*"RANDR"\s*missing\s*on\s*display\s*":\d+\.\d+"\.\s*$/.test(stderrLog) ){
                    log.info('RANDR', 'stderr contains only RANDR error, ignored');
                    return callback();
                }
                return callback(err);
            }
            return callback();
        });

        return;
    }

    if ((process.arch != opts.target_arch) ||
        (process.platform != opts.target_platform)) {
        var msg = "skipping validation since host platform/arch (";
        msg += process.platform+'/'+process.arch+")";
        msg += " does not match target (";
        msg += opts.target_platform+'/'+opts.target_arch+")";
        log.info('validate', msg);
        return callback();
    }

    //args.push('--eval');
    //args.push("require('" + binary_module.replace(/\'/g, '\\\'') +"')");
    //console.log("validate", "Running test command: '" + shell_cmd + ' ' + args.join(' ') + "'");

    try {
      var module = null;
      var platform = (process.platform === 'darwin') ? 'mac' : 'linux';
      var req_path = path.join(module_path, '../../../../../');

      console.log('module_path:', module_path);
      console.log('binary_module:', binary_module);

      if (!(targets || Array.isArray(targets))) {
        console.log('JUST ONE TARGET!');
        targets = [binary_module];
        req_path = binary_module;
      } else {
        req_path = path.join(req_path, 'lib', platform, 'bindings');
      }

      console.log('Trying to require binary:', req_path);
      module = require(req_path);

      return callback();
    } catch (err) {
      console.log('An error occured:', err);
      return callback(err);
    }

    /*
    args.push('--eval');
    args.push("require('" + binary_module.replace(/\'/g, '\\\'') +"')");
    log.info("validate","Running test command: '" + shell_cmd + ' ' + args.join(' ') + "'");
    cp.execFile(shell_cmd, args, options, function(err, stdout, stderr) {
        if (err) {
            return callback(err);
        }
        return callback();
    });
  */

}
