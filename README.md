# // hook.io-hookify

Hookify makes [hook.io hooks](http://hook.io) _(read: fault-tolerant, pluggable,
cloud infrastructure components)_ out of existing node.js modules.  It will probably
work 100% of the time if you're not lazy or stupid and are not trying to
band-aid absolute garbage code into the hook.io system.  Check it:

__Plausible scenario:__ I want to write a hook.io hook to interface with
[CloudApp](http://getcloudapp.com) but I've got mad shit to do.  There's a
CloudApp module already, so it would be pretty stupid to rewrite already-written
code.  I need to make this module "hook aware," but hopefully without forking it
or writing my own module-length glue code.

## Straight to the code

```javascript
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
  this.baseModule.setCredentials("my-email@signals.io", "someStupidPassword");
  cb();
}

var cloudHook = new CloudHook();
cloudHook.start();
```

## How to pass arguments (worth reading; not 100% intuitive)

In case the example code above didn't make it very clear, passing arguments is
like calling `.apply(...)` on a function.

*   If the module you hookified (let's say `wangsta` for now) defines a function:

    `wangsta.funkyStuff(age, size, dilapidation)`

*   ...then you can call this function by emitting an event like this:

    `someOtherHook.emit('wangsta::funkyStuff', [ 24, 'C', { abc: 123 } ]);`


More documentation (and features) soon!

# LICENSE (MIT)

Copyright (C) 2012 by bryn austin bellomy // robot bubblebath (TM)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. 
