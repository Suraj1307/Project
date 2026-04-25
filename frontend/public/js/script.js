(() => {
  "use strict";

  const forms = document.querySelectorAll(".needs-validation");

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

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  const body = document.body;
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    body.classList.add("dark-theme");
    toggleBtn.textContent = "Light Mode";
  } else if (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    body.classList.add("dark-theme");
    toggleBtn.textContent = "Light Mode";
  } else {
    toggleBtn.textContent = "Dark Mode";
  }

  toggleBtn.addEventListener("click", () => {
    body.classList.toggle("dark-theme");

    if (body.classList.contains("dark-theme")) {
      toggleBtn.textContent = "Light Mode";
      localStorage.setItem("theme", "dark");
    } else {
      toggleBtn.textContent = "Dark Mode";
      localStorage.setItem("theme", "light");
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll(".js-fade-image");

  images.forEach((image) => {
    const container = image.closest(".listing-media, .show-gallery");

    function markLoaded() {
      image.classList.add("loaded");
      if (container) {
        container.classList.add("image-loaded");
      }
    }

    if (image.complete) {
      markLoaded();
    } else {
      image.addEventListener("load", markLoaded, { once: true });
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const mapEl = document.getElementById("map");
  const addressEl = document.getElementById("listing-address");

  if (!mapEl || !addressEl) return;

  let map;
  let listingLat;
  let listingLng;

  function initMap(lat, lng) {
    if (map) {
      map.remove();
    }

    map = L.map("map").setView([lat, lng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.marker([lat, lng]).addTo(map).bindPopup("Listing Location").openPopup();
  }

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
      }
    })
    .catch((err) => console.error("Geocoding error:", err));

  const dirBtn = document.getElementById("directionBtn");
  if (dirBtn) {
    dirBtn.addEventListener("click", () => {
      if (!listingLat || !listingLng) {
        alert("Listing location not loaded yet.");
        return;
      }

      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${listingLat},${listingLng}`,
        "_blank"
      );
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const taxSwitch = document.getElementById("flexSwitchCheckDefault");
  if (!taxSwitch) return;

  const priceDisplays = document.querySelectorAll(".js-price-display");
  const totalDisplays = document.querySelectorAll(".tax-info");

  taxSwitch.addEventListener("change", () => {
    const showTotal = taxSwitch.checked;

    priceDisplays.forEach((display) => {
      const basePrice = Number.parseFloat(display.dataset.basePrice || "0");
      const totalPrice = Math.round(basePrice * 1.18);
      display.textContent = showTotal
        ? `₹${totalPrice.toLocaleString("en-IN")} total`
        : `₹${basePrice.toLocaleString("en-IN")}/night`;
    });

    totalDisplays.forEach((display) => {
      display.style.display = showTotal ? "inline" : "none";
    });
  });
});
