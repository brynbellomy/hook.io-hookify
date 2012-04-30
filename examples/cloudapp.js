var Hookify = require('../lib/hookify').Hookify,
    cloudapp = require('cloudapp'),
    util = require('util');

// subclass Hookify to create our hook and pass the constructor an instance of
// the 'source' module being hookified
var CloudHook = exports.CloudHook = function CloudHook() {
  Hookify.call(this, 'cloudapp', require('cloudapp'), { hookify: { emitResult: true } });
}

util.inherits(CloudHook, Hookify);

// because our particular source module, node-cloudapp, requires us to authenticate
// before any of the calls it can make against the cloudapp API, we'll define a
// global "pre" hook (which is automatically called before any of the functions
// defined on this Hook.io hook).
CloudHook.prototype.pre = function (cb) {
  this.baseModule.setCredentials("soapbox@signals.io", "UM8L,piPUCojAGEzLF]2G+WD");
  cb();
}

var cloudHook = new CloudHook();
cloudHook.start();

cloudHook.on('hook::ready', function () {
  // just for testing purposes, we'll set up a vanilla hook to send some requests
  // to our cloudapp hook and receive its responses
  var Hook = require('hook.io').Hook;
  var vanillaHook = new Hook({ name: 'my-hook' });
  vanillaHook.on('hook::ready', function () {

    // set up our vanilla hook's listeners for the responses we'll get from the
    // hookified cloud hook
    vanillaHook.on('cloudapp::getItems::result', function () {
      console.log('>> cloudapp::getItems::result', arguments);
    });
    vanillaHook.on('cloudapp::addBookmark::result', function () {
      console.log('>> cloudapp::addBookmark::result', arguments);
    });

    // add a bookmark to your cloudapp account
    vanillaHook.emit('cloudapp::addBookmark', [ 'http://music.illumntr.com' ]);

    // wait a bit to ensure the previous request has finished, then grab the
    // first page of the list of uploaded files in your account.
    setTimeout(function () {
      var params = {
        'page': 1,
        'per_page': 10,
        'deleted': 'false'
      };
      vanillaHook.emit('cloudapp::getItems', [ { page: 1 } ]);
    }, 5000);

  });
  vanillaHook.start();
});
