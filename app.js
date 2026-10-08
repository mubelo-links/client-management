let map;

let marker = null;

let latitude = null;

let longitude = null;


const defaultLocation = [
    -20.1609,
    57.5012
];


// ==============================
// CREATE MAP
// ==============================

map = L.map("map").setView(
    defaultLocation,
    11
);


L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,

        attribution:
            '&copy; OpenStreetMap contributors'
    }
).addTo(map);


// ==============================
// SET LOCATION
// ==============================

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


// ==============================
// CLICK MAP
// ==============================

map.on(
    "click",
    function(event) {

        setLocation(
            event.latlng.lat,
            event.latlng.lng
        );

    }
);


// ==============================
// GPS
// ==============================

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


                function() {

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


// ==============================
// FORM SUBMISSION
// ==============================

document
    .getElementById("clientForm")
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            // Check location

            if (
                latitude === null ||
                longitude === null
            ) {

                alert(
                    "Please select the installation location on the map."
                );

                return;

            }


            // Electricity bill

            const bill =
                document.getElementById(
                    "electricityBill"
                ).files[0];


            if (!bill) {

                alert(
                    "Please upload your latest electricity bill."
                );

                return;

            }


            // Collect equipment

            const equipment = [];


            document
                .querySelectorAll(
                    'input[name="equipment"]:checked'
                )
                .forEach(
                    function(item) {

                        equipment.push(
                            item.value
                        );

                    }
                );


            // Collect form data

            const inquiry = {

                name:
                    document.getElementById(
                        "name"
                    ).value,

                phone:
                    document.getElementById(
                        "phone"
                    ).value,

                email:
                    document.getElementById(
                        "email"
                    ).value,

                address:
                    document.getElementById(
                        "address"
                    ).value,

                latitude:
                    latitude,

                longitude:
                    longitude,

                electricityBill:
                    bill.name,

                propertyType:
                    document.getElementById(
                        "propertyType"
                    ).value,

                propertyOwnership:
                    document.getElementById(
                        "propertyOwnership"
                    ).value,

                existingPV:
                    document.getElementById(
                        "existingPV"
                    ).value,

                existingPVDetails:
                    document.getElementById(
                        "existingPVDetails"
                    ).value,

                futureConsumption:
                    document.getElementById(
                        "futureConsumption"
                    ).value,

                electricVehicle:
                    document.getElementById(
                        "electricVehicle"
                    ).value,

                futureEquipment:
                    equipment,

                extension:
                    document.getElementById(
                        "extension"
                    ).value,

                solarReason:
                    document.getElementById(
                        "solarReason"
                    ).value,

                notes:
                    document.getElementById(
                        "notes"
                    ).value

            };


            console.log(
                "PV Installation Inquiry:",
                inquiry
            );


            document.getElementById(
                "message"
            ).textContent =
                "✅ PV inquiry captured successfully. SharePoint connection comes next.";

        }
    );
