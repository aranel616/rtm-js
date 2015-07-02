rtm-js
======

rtm-js is a javascript library for the Remember the Milk API.

rtm.js works out of the box in the browser, Node.js, Firefox OS, WinJS, and Pebble.js.

#### Installing:

On Node.js, you can grab it with npm:

```sh
npm install --save-dev rtm-js
```

#### Usage: 

rtm.js can be included either AMD style or CommonJS style. If neither of those are an option, rtm.js will expose window.RememberTheMilk.

AMD:
```javascript
require(['rtm-js'], function(RememberTheMilk){
    rtm = new RememberTheMilk(api_key, api_secret, 'delete');
});
```

CommonJS:
```javascript
var RememberTheMilk = require('rtm-js');
rtm = new RememberTheMilk(api_key, api_secret, 'delete');
```

Web:
```html
<script type="text/javascript" src="rtm.js"></script>

<script type="text/javascript">
    rtm = new RememberTheMilk(api_key, api_secret, 'delete');
</script>
```

After that, use `rtm.get` to call RememberTheMilk API endpoints.

```javascript
rtm.get('rtm.tasks.getList', {list_id: listId, filter: 'status:incomplete'}, function(resp){
  // ...
});
```

Check out the examples to get started. There's one for node, and one for the browser. You can find them in the examples directory.

#### Contributing:

Contributions are welcome. Without contributions, this package would be buggy in Node.js, and wouldn't work at all in platforms like Firefox OS or Pebble.js. So feel free to fork this repository and send a pull request!
