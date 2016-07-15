(function () {
	function uuid4() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
	}


	function addEvent( obj, type, fn )
	{
		if (obj.addEventListener)
			obj.addEventListener( type, fn, false );
		else if (obj.attachEvent)
		{
			obj["e"+type+fn] = fn;
			obj[type+fn] = function() { obj["e"+type+fn]( window.event ); }
			obj.attachEvent( "on"+type, obj[type+fn] );
		}
	}


	window.iframeRPC = {
		createClient : function(trustedParent, targetWindow) {

			if (!targetWindow && window !== window.parent){
				targetWindow = window.parent;
			} else  {
				throw new Error('No Target Window Found');
			}

			var cbRegistry = {};

			addEvent(window, "message", function receiveMessage(event) {
				console.log('client event', event);
				var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.origi

				if (origin !== trustedParent) {
					return;
				}

				var data = JSON.parse(event.data);

				cbRegistry[data.uuid](data.result[0], data.result[1]);
				delete cbRegistry[data.uuid];

			}, false);

			return function (service, input, cb) {
				var uuid = uuid4();
				console.log('sending to parent... maybe');

				cbRegistry[uuid] = cb;

				targetWindow.postMessage(
					JSON.stringify({
						'type': 'request',
						'service': service,
						'uuid': uuid,
						'input': input,
					}),
					trustedParent
				);
			};
		},

		createService : function (services, trustedOrigin, targetFrame) {
			addEvent(window, "message", function receiveMessage(event) {

				console.log('service recieved event', event);
				var data = JSON.parse(event.data);


				if (!services[data.service]) {
					return; // if its not a call to a valid service exit
				}


				var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.


				if (origin !== trustedOrigin) {
					return;
				}

				services[data.service](data.input, function (err, res) {
					console.log('sending back to child maybe');
					targetFrame.postMessage(JSON.stringify({
						type: 'response',
						serviceHandler: data.service,
						uuid: data.uuid,
						result: [err, res]
					}), '*');

				});

			}, false);
		}
	}
})();
