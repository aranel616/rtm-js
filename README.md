rtm-js
======

rtm-js is a javascript library for the Remember the Milk API.

Usage: 

```javascript
rtm = new RememberTheMilk(api_key, api_secret, 'delete');

rtm.get('rtm.tasks.getList', {list_id: listId, filter: 'status:incomplete'}, function(resp){
  // ...
});
```

See example.html for a more detailed example, or see rtm.js for actual methods.
