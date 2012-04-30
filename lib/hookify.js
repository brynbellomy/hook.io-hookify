var Hook = require('hook.io').Hook,
    util = require('util'),
    async = require('async');

var Hookify = exports.Hookify = function Hookify(namespace, baseModule, options) {
  var self = this;

  options = options || {};
  options.events = options.events || {};
  options.hookify = options.hookify || {};
  console.log('opts', options);

  this.baseModule = baseModule;

  Object.keys(baseModule).forEach(function (key) {
    if (typeof baseModule[key] == 'function') {
      options.events['**::' + namespace + '::' + key] = function (args, callback) {
        args = args || [];

        var fns = [];
        var capitalizedKey = key.charAt(0).toUpperCase() + key.substring(1);

        // add null to args to dummy-plug 'err' param for the first function of the waterfall
        args.unshift(null);

        function reinjectArgs(cb) { cb.apply(self, args); }
        var didReinjectArgs = false;

        if (typeof self.pre == 'function')
          fns.push(self.pre.bind(self));

        if (typeof self['pre' + capitalizedKey] == 'function') {
          fns.push(reinjectArgs);
          didReinjectArgs = true;
          fns.push(self['pre' + capitalizedKey]);
        }

        if (false === didReinjectArgs)
          fns.push(reinjectArgs);

        fns.push(self.baseModule[key].bind(self.baseModule));
        
        if (typeof self['post' + capitalizedKey] == 'function') {
          fns.push(self['post' + capitalizedKey]);
        }

        if (typeof self.post == 'function') {
          fns.push(self.post);
        }

        require('async').waterfall(fns, callback);
      }.bind(self);
    }
  }.bind(self));

  this.events = options.events;
  
  Hook.call(this, options);

  self.on('hook::ready', function () {
  });
};

//
// Inherit from `hookio.Hook`
//
util.inherits(Hookify, Hook);


