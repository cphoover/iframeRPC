# iframeRPC
RPC style messaging for cross domain iframes in the browser.  Relies on window.postMessage (backwards compat to ie8)

**IMPORTANT** this library uses JSON.stringify for data serialization between frames, this is to support ie8 which doesn't support "structured clone algorithm" serialization through window.postMessage, and only allows for passing strings.


### Services Example:

```
var services = {
	'getPrice': function(input, done) {
		return done(null, 143.29);
	},
	'sum': function (nums, done) {
		return done(null, nums.reduce(function (acc, cur) {
			return acc + cur;
		}));
	}
};

iframeRPC.createService(services, '[CHILD DOMAIN]', window.frames.mtoc);
```



### Client Example:

```
var client = iframeRPC.createClient('[PARENT DOMAIN]');
client('getPrice', 1234, function (err, price) {
	alert('price:' + price);
});
client('sum', [1,2,3,4], function (err, total) {
	alert('total:' + total);
});
```
