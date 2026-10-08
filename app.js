let map;

let marker = null;

let latitude = null;

let longitude = null;


// Mauritius starting position

const defaultLocation = [
    -20.1609,
    57.5012
];


// Create map

map = L.map("map").setView(
    defaultLocation,
    11
);


// OpenStreetMap tiles

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,

        attribution:
            '&copy; OpenStreetMap contributors'
    }
).addTo(map);


// Put marker on map

function setLocation(lat, lng) {

    latitude = lat;

    longitude = lng;


    document.getElementById(
        "latitude"
    ).textContent =
        lat.toFixed(6);


    document.getElementById(
        "longitude"
    ).textContent =
        lng.toFixed(6);


    if (marker === null) {

        marker = L.marker(
            [lat, lng],
            {
                draggable: true
            }
        ).addTo(map);


        // Marker moved

        marker.on(
            "dragend",
            function(event) {

                const position =
                    event.target.getLatLng();

                setLocation(
                    position.lat,
                    position.lng
                );
            }
        );

    } else {

        marker.setLatLng(
            [lat, lng]
        );
    }


    map.setView(
        [lat, lng],
        17
    );
}


// Click map to place pin

map.on(
    "click",
    function(event) {

        setLocation(
            event.latlng.lat,
            event.latlng.lng
        );

    }
);


// GPS button

document
    .getElementById("locationButton")
    .addEventListener(
        "click",
        function() {

            if (!navigator.geolocation) {

                alert(
                    "Your browser does not support GPS."
                );

                return;
            }


            this.textContent =
                "📍 Finding your location...";


            navigator.geolocation.getCurrentPosition(

                function(position) {

                    setLocation(

                        position.coords.latitude,

                        position.coords.longitude

                    );


                    document.getElementById(
                        "locationButton"
                    ).textContent =
                        "✅ Location Found";
                },


                function(error) {

                    document.getElementById(
                        "locationButton"
                    ).textContent =
                        "📍 Use My Current Location";


                    alert(
                        "Could not get your location. " +
                        "Please allow location access " +
                        "or select the position manually on the map."
                    );

                },


                {
                    enableHighAccuracy: true,

                    timeout: 15000,

                    maximumAge: 0
                }
            );

        }
    );


// Form submission

document
    .getElementById("clientForm")
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            if (
                latitude === null ||
                longitude === null
            ) {

                alert(
                    "Please select the client's location."
                );

                return;
            }


            const name =
                document.getElementById(
                    "name"
                ).value;


            const phone =
                document.getElementById(
                    "phone"
                ).value;


            const email =
                document.getElementById(
                    "email"
                ).value;


            const address =
                document.getElementById(
                    "address"
                ).value;


            const notes =
                document.getElementById(
                    "notes"
                ).value;


            console.log({

                name,

                phone,

                email,

                address,

                latitude,

                longitude,

                notes

            });


            document.getElementById(
                "message"
            ).textContent =
                "✅ Form captured successfully. Database connection comes next.";

        }
    );
