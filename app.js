"use strict";

// ============================================
// PV INSTALLATION INQUIRY
// Map, file previews and form handling
// ============================================


// ============================================
// 1. ELEMENTS
// ============================================

const clientForm = document.getElementById("clientForm");
const locationButton = document.getElementById("locationButton");
const billInput = document.getElementById("electricityBill");
const filePreview = document.getElementById("filePreview");
const message = document.getElementById("message");
const submitButton = document.getElementById("submitButton");

const latitudeDisplay = document.getElementById("latitude");
const longitudeDisplay = document.getElementById("longitude");

const latitudeValue = document.getElementById("latitudeValue");
const longitudeValue = document.getElementById("longitudeValue");

let map = null;
let marker = null;
let latitude = null;
let longitude = null;

// Store selected files so users can add files in multiple selections.
let selectedBills = [];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file

const ALLOWED_EXTENSIONS = /\.(pdf|jpe?g|png)$/i;

const ALLOWED_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png"
];

const defaultLocation = [-20.1609, 57.5012];


// ============================================
// 2. MAP INITIALIZATION
// ============================================

function initializeMap() {
    if (typeof L === "undefined") {
        showMessage(
            "The map library could not load. Please refresh the page.",
            "error"
        );
        return;
    }

    const mapElement = document.getElementById("map");

    if (!mapElement) {
        return;
    }

    map = L.map("map").setView(defaultLocation, 11);

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);

    map.on("click", function (event) {
        setLocation(event.latlng.lat, event.latlng.lng);
    });

    // Help Leaflet calculate the correct map size.
    setTimeout(function () {
        map.invalidateSize();
    }, 100);
}


// ============================================
// 3. SET INSTALLATION LOCATION
// ============================================

function setLocation(lat, lng) {
    if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
    ) {
        return;
    }

    latitude = lat;
    longitude = lng;

    latitudeDisplay.textContent = lat.toFixed(6);
    longitudeDisplay.textContent = lng.toFixed(6);

    if (latitudeValue) {
        latitudeValue.value = lat;
    }

    if (longitudeValue) {
        longitudeValue.value = lng;
    }

    if (!map) {
        return;
    }

    if (!marker) {
        marker = L.marker([lat, lng], {
            draggable: true
        }).addTo(map);

        marker.on("dragend", function (event) {
            const position = event.target.getLatLng();

            setLocation(position.lat, position.lng);
        });
    } else {
        marker.setLatLng([lat, lng]);
    }

    map.setView([lat, lng], 17);
}


// ============================================
// 4. CURRENT GPS LOCATION
// ============================================

locationButton.addEventListener("click", function () {
    if (!navigator.geolocation) {
        showMessage(
            "Your browser does not support location services. Please select your location on the map.",
            "error"
        );
        return;
    }

    const originalText = "📍 Use My Current Location";

    locationButton.disabled = true;
    locationButton.textContent = "📍 Finding your location...";

    navigator.geolocation.getCurrentPosition(
        function (position) {
            setLocation(
                position.coords.latitude,
                position.coords.longitude
            );

            locationButton.textContent = "✅ Location Found";
            locationButton.disabled = false;

            showMessage(
                "Installation location selected successfully.",
                "success"
            );
        },

        function (error) {
            locationButton.textContent = originalText;
            locationButton.disabled = false;

            let errorText =
                "Could not determine your location. Please select it manually on the map.";

            if (error.code === error.PERMISSION_DENIED) {
                errorText =
                    "Location access was denied. Allow location permission in your browser or select the position manually on the map.";
            } else if (error.code === error.TIMEOUT) {
                errorText =
                    "Location request timed out. Please try again or select the position manually.";
            }

            showMessage(errorText, "error");
        },

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }
    );
});


// ============================================
// 5. FILE VALIDATION
// ============================================

function validateFile(file) {
    const extensionIsValid = ALLOWED_EXTENSIONS.test(file.name);

    const typeIsValid =
        ALLOWED_TYPES.includes(file.type) ||
        (
            file.type === "" &&
            extensionIsValid
        );

    if (!extensionIsValid || !typeIsValid) {
        return "Unsupported file type. Please select a PDF, JPG, JPEG or PNG.";
    }

    if (file.size > MAX_FILE_SIZE) {
        return "This file exceeds the 10 MB limit.";
    }

    if (file.size === 0) {
        return "This file is empty.";
    }

    return null;
}


// ============================================
// 6. FORMAT FILE SIZE
// ============================================

function formatFileSize(bytes) {
    if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + " KB";
    }

    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}


// ============================================
// 7. SELECT MULTIPLE FILES
// ============================================

billInput.addEventListener("change", function () {
    const newlySelectedFiles = Array.from(billInput.files);
    const errors = [];

    newlySelectedFiles.forEach(function (file) {
        const validationError = validateFile(file);

        if (validationError) {
            errors.push(file.name + ": " + validationError);
            return;
        }

        const duplicate = selectedBills.some(function (existingFile) {
            return (
                existingFile.name === file.name &&
                existingFile.size === file.size &&
                existingFile.lastModified === file.lastModified
            );
        });

        if (!duplicate) {
            selectedBills.push(file);
        }
    });

    syncBillInput();
    renderBillPreviews();

    if (errors.length > 0) {
        showMessage(errors.join("\n"), "error");
    } else {
        clearMessage();
    }
});


// ============================================
// 8. SYNC SELECTED FILES WITH INPUT
// ============================================

function syncBillInput() {
    const transfer = new DataTransfer();

    selectedBills.forEach(function (file) {
        transfer.items.add(file);
    });

    billInput.files = transfer.files;
}


// ============================================
// 9. DISPLAY FILE PREVIEWS
// ============================================

function renderBillPreviews() {
    filePreview.replaceChildren();

    selectedBills.forEach(function (file, index) {
        const item = document.createElement("div");
        item.className = "file-item";

        // Thumbnail or PDF icon
        const thumbnail = document.createElement("div");
        thumbnail.className = "file-thumbnail";

        if (file.type.startsWith("image/")) {
            const image = document.createElement("img");

            image.alt = "Preview of " + file.name;
            image.src = URL.createObjectURL(file);

            thumbnail.appendChild(image);
        } else {
            thumbnail.textContent = "📄";
            thumbnail.setAttribute("aria-label", "PDF document");
        }

        // File details
        const details = document.createElement("div");
        details.className = "file-details";

        const name = document.createElement("div");
        name.className = "file-name";
        name.textContent = file.name;

        const size = document.createElement("div");
        size.className = "file-size";
        size.textContent = formatFileSize(file.size);

        const status = document.createElement("div");
        status.className = "file-status";
        status.textContent = "✓ Selected";

        details.append(name, size, status);

        // Remove button
        const removeButton = document.createElement("button");

        removeButton.type = "button";
        removeButton.className = "file-remove";
        removeButton.textContent = "Remove";

        removeButton.setAttribute(
            "aria-label",
            "Remove " + file.name
        );

        removeButton.addEventListener("click", function () {
            selectedBills.splice(index, 1);

            syncBillInput();
            renderBillPreviews();
            clearMessage();
        });

        item.append(thumbnail, details, removeButton);
        filePreview.appendChild(item);
    });

    // Make the bill upload mandatory even after removing files.
    billInput.required = selectedBills.length === 0;
}


// ============================================
// 10. DISPLAY MESSAGES
// ============================================

function showMessage(text, type) {
    message.textContent = text;
    message.className = type;
    message.style.whiteSpace = "pre-line";
}

function clearMessage() {
    message.textContent = "";
    message.className = "";
    message.style.whiteSpace = "";
}


// ============================================
// 11. COLLECT FORM DATA
// ============================================

function collectInquiry() {
    const formData = new FormData(clientForm);

    const equipment = Array.from(
        document.querySelectorAll(
            'input[name="equipment"]:checked'
        )
    ).map(function (item) {
        return item.value;
    });

    const inquiry = {
        name: formData.get("name"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        address: formData.get("address"),

        latitude: latitude,
        longitude: longitude,

        propertyType: formData.get("propertyType"),
        propertyOwnership: formData.get("propertyOwnership"),

        existingPV: formData.get("existingPV"),
        existingPVDetails: formData.get("existingPVDetails"),

        futureConsumption: formData.get("futureConsumption"),
        electricVehicle: formData.get("electricVehicle"),

        futureEquipment: equipment,
        extension: formData.get("extension"),
        solarReason: formData.get("solarReason"),
        notes: formData.get("notes"),

        electricityBills: selectedBills.map(function (file) {
            return {
                name: file.name,
                size: file.size,
                type: file.type,
                file: file
            };
        })
    };

    return inquiry;
}


// ============================================
// 12. FORM SUBMISSION
// ============================================

clientForm.addEventListener("submit", function (event) {
    event.preventDefault();
    clearMessage();

    // Validate location.
    if (latitude === null || longitude === null) {
        showMessage(
            "Please select the installation location on the map.",
            "error"
        );

        document.getElementById("map").scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        return;
    }

    // Validate files.
    if (selectedBills.length === 0) {
        showMessage(
            "Please upload at least one electricity bill or document.",
            "error"
        );

        billInput.focus();
        return;
    }

    // Validate every selected file again before submission.
    for (const file of selectedBills) {
        const error = validateFile(file);

        if (error) {
            showMessage(file.name + ": " + error, "error");
            return;
        }
    }

    const inquiry = collectInquiry();

    /*
     * DEMONSTRATION ONLY:
     * This creates the inquiry object in the browser.
     * It does NOT send files to SharePoint or a server.
     */

    console.log("PV Installation Inquiry:", inquiry);

    console.table({
        name: inquiry.name,
        phone: inquiry.phone,
        email: inquiry.email,
        latitude: inquiry.latitude,
        longitude: inquiry.longitude,
        numberOfDocuments: inquiry.electricityBills.length
    });

    showMessage(
        "✓ Your form has passed the browser checks. " +
        "Your inquiry has NOT been sent yet. " +
        "Connect the submission handler to SharePoint or a backend to save your details and documents.",
        "success"
    );
});


// ============================================
// 13. START APPLICATION
// ============================================

initializeMap();
renderBillPreviews();
