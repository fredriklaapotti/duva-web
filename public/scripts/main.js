'use strict';

var allZones = [];
var allUsers = [];
var allAlarms = [];

function checkSetup() {
	console.log('duva: checkSetup() enter');
	if(!(firebase.app instanceof Function) || !firebase.app().options) {
		window.alert('Firebase SDK not configured.');
	}
	console.log('duva: checkSetup() exit');
}

function initMap() {
	console.log('duva: initMap() enter');

	var defaultMapLocation = {lat: 57.670903, lng: 15.860419};
	var map = new google.maps.Map(document.getElementById('map'), {zoom: 16, center: defaultMapLocation});
	//var marker = new google.maps.Marker({position: defaultMapLocation, map: map});
	
	initMapFirestore(map);

	console.log('duva: initMap() exit');
}

function initMapFirestore(map) {
	console.log('duva: initMapFirestore(map) enter');

	var marker;
	var markers = [];
	var zoneCircle;
	var zoneCircles = [];
	var userMarker;
	var userMarkers = [];
	var alarmMarker;
	var alarmMarkers = [];

	db.collection('zones')
		.onSnapshot(function(querySnapshot) {
			console.log('duva: initMapFirestore() onShapshot() zones enter');
			for(var i = 0; i < zoneCircles.length; i++) {
				zoneCircles[i].setMap(null);
			}
			zoneCircles.length = 0;
			allZones.length = 0;

			querySnapshot.forEach(function(doc) {
				//console.log(doc.data().id + '): ' + doc.data().location['_lat'] + ', ' + doc.data().location['_long'] + ' (' + doc.data().name + ')');
				var zoneLatLng = new google.maps.LatLng(doc.data().location['_lat'], doc.data().location['_long']);
				//marker = new google.maps.Marker({position: zoneLatLng, map: map});
				zoneCircle = new google.maps.Circle({
					center: zoneLatLng,
					radius: doc.data().radius,
					strokeColor: '#0000FF',
					strokeOpacity: 1.0,
					fillColor: '#0000FF',
					fillOpacity: 0.3,
					strokeWeight: 1,
					clickable: true
				});
				//markers.push(marker);
				zoneCircles.push(zoneCircle);
				allZones.push(doc.data());
			});

			for(var i = 0; i < zoneCircles.length; i++) {
				zoneCircles[i].setMap(map);
			}
			debug(allZones[0].id);
			
			console.log('duva: initMapFirestore() onSnapshot() zones exit');
		});

	db.collection('users')
		.onSnapshot(function(querySnapshot) {
			console.log('duva: initMapFirestore() onSnapshot() users enter');
			for(var i = 0; i < userMarkers.length; i++) {
				userMarkers[i].setMap(null);
			}
			userMarkers.length = 0;
			allUsers.length = 0;

			querySnapshot.forEach(function(doc) {
				console.log(doc.data().uid);
				var userLatLng = new google.maps.LatLng(doc.data().lastLocation['_lat'], doc.data().lastLocation['_long']);
				userMarker = new google.maps.Marker({position: userLatLng, map: map});
				userMarkers.push(userMarker);
				allUsers.push(doc.data());
			});

			for(var i = 0; i < userMarkers.length; i++) {
				userMarkers[i].setMap(map);
			}

			console.log('duva: initMapFirestore() onSnapshot() users exit');
		});

	db.collection('alarms').limit(3).orderBy('activated', 'desc')
		.onSnapshot(function(querySnapshot) {
			console.log('duva: initMapFirestore onSnapshot() alarms enter');
			for(var i = 0; i < alarmMarkers.length; i++) {
				alarmMarkers[i].setMap(null);
			}

			querySnapshot.forEach(function(doc) {
				//console.log(doc.data().activated.toDate());
				var elapsedMs = Date.now() - doc.data().activated.toDate();
				var expiryMs = Math.max(1000 * 60 * 2 - elapsedMs, 0);
				//console.log(expiryMs/1000 + ' seconds until expiration');

				if(expiryMs > 0) {
					var zone = getZoneObjectFromId(doc.data().zone);
					console.log('duva: alarm triggered for zone: ' + zone.name + ', setting timeout: ' + expiryMs/1000 + 's');
					window.setTimeout(function() { console.log('duva: alarm expired for zone: ' + doc.data().zone); }, expiryMs);
				} 
			});

			for(var i = 0; i < alarmMarkers.length; i++) {
				alarmMarkers[i].setMap(map);
			}

			console.log('duva: initMapFirestore onSnapshot() alarms exit');
		});

	console.log('duva: initMapFirestore(map) exit');
}

function getZoneObjectFromId(zoneid) {
	var zoneObject;

	allZones.forEach(function (arrayItem) {
		if(arrayItem.id == zoneid) {
			zoneObject = arrayItem;
		}
	});

	return zoneObject;

}

function loadZones() {
	console.log('duva: loadZones() enter');
	db.collection('zones')
		.onSnapshot(function(querySnapshot) {
			querySnapshot.forEach(function(doc) {
				console.log(doc.data().location);
			});
		});
	console.log('duva: loadZones() exit');
}

function debug(debugString) {
	console.log('duva: debug() enter');
	var div = document.getElementById("debug");
	div.innerHTML = 'tjena';
	div.innerHTML = debugString;
	console.log('duva: debug() exit');
}

console.log('duva: main.js enter');
checkSetup();
var db = firebase.firestore();
debug();
//loadZones();
console.log('duva: main.js exit');
