// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();

// light/dark
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return; // Button might not exist on some pages

  const body = document.body;
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme) {
    if (savedTheme === "dark") {
      body.classList.add("dark-theme");
      toggleBtn.textContent = "☀️ Light Mode";
    }
  } else {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      body.classList.add("dark-theme");
      toggleBtn.textContent = "☀️ Light Mode";
    }
  }

  toggleBtn.addEventListener("click", () => {
    body.classList.toggle("dark-theme");
    if (body.classList.contains("dark-theme")) {
      toggleBtn.textContent = "☀️ Light Mode";
      localStorage.setItem("theme", "dark");
    } else {
      toggleBtn.textContent = "🌙 Dark Mode";
      localStorage.setItem("theme", "light");
    }
  });
});

//map
// --- MAP ---
document.addEventListener("DOMContentLoaded", () => {
  const mapEl = document.getElementById("map");
  const addressEl = document.getElementById("listing-address");

  if (!mapEl || !addressEl) return;

  let map;
  let listingLat, listingLng;

  // Function to init map
  function initMap(lat, lng) {
    if (map) {
      map.remove(); // Clear previous map instance
    }

    map = L.map("map").setView([lat, lng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.marker([lat, lng]).addTo(map).bindPopup("Listing Location").openPopup();
  }

  // Geocode address from hidden span
  const address = addressEl.dataset.address;

  fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
  )
    .then((res) => res.json())
    .then((data) => {
      if (data && data.length > 0) {
        listingLat = parseFloat(data[0].lat);
        listingLng = parseFloat(data[0].lon);

        initMap(listingLat, listingLng);
      } else {
        alert("Could not find location for: " + address);
      }
    })
    .catch((err) => console.error("Geocoding error:", err));

  // ✅ Handle Get Directions button
  const dirBtn = document.getElementById("directionBtn");
  if (dirBtn) {
    dirBtn.addEventListener("click", () => {
      if (!listingLat || !listingLng) {
        alert("Listing location not loaded yet.");
        return;
      }

      // Open Google Maps directions in new tab
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${listingLat},${listingLng}`,
        "_blank"
      );
    });
  }
});

