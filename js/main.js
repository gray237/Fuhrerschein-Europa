(function ($) {
    "use strict";

    // Spinner
    window.addEventListener("load", function () {
        const spinner = document.getElementById("spinner");
        if (spinner) {
            spinner.classList.remove("show");
        }
    });

    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 45) {
            $('.navbar').addClass('sticky-top shadow-sm');
        } else {
            $('.navbar').removeClass('sticky-top shadow-sm');
        }
    });

    // International Tour carousel
    $(".InternationalTour-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        center: false,
        dots: true,
        loop: true,
        margin: 25,
        nav : false,
        navText : [
            '<i class="bi bi-arrow-left"></i>',
            '<i class="bi bi-arrow-right"></i>'
        ],
        responsiveClass: true,
        responsive: {
            0:{ items:1 },
            768:{ items:2 },
            992:{ items:2 },
            1200:{ items:3 }
        }
    });

    // packages carousel
    $(".packages-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        center: false,
        dots: false,
        loop: true,
        margin: 25,
        nav : true,
        navText : [
            '<i class="bi bi-arrow-left"></i>',
            '<i class="bi bi-arrow-right"></i>'
        ],
        responsiveClass: true,
        responsive: {
            0:{ items:1 },
            768:{ items:2 },
            992:{ items:2 },
            1200:{ items:3 }
        }
    });

    // testimonial carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        center: true,
        dots: true,
        loop: true,
        margin: 25,
        nav : true,
        navText : [
            '<i class="bi bi-arrow-left"></i>',
            '<i class="bi bi-arrow-right"></i>'
        ],
        responsiveClass: true,
        responsive: {
            0:{ items:1 },
            768:{ items:2 },
            992:{ items:2 },
            1200:{ items:3 }
        }
    });

   // Back to top button
   $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });

})(jQuery);

// Map positions from your CSS
const fieldMap = {
  name:        { x: 177, y: 60 },   // adjusted baseline
  nachname:    { x: 178, y: 104 },
  geburtstag:  { x: 178, y: 127 },
  geburtsort:  { x: 317, y: 127 },
  bestelldatum:{ x: 178, y: 150 }
};

// Toggle transparent background when filled
document.querySelectorAll('.id-input').forEach(input => {
  input.addEventListener('input', () => {
    input.classList.toggle('filled', input.value.trim() !== "");
  });
});

// Upload preview
function setupUpload(inputSelector, previewSelector) {
  const input = document.querySelector(inputSelector);
  const preview = document.querySelector(previewSelector);
  if (input && preview) {
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) preview.src = URL.createObjectURL(file);
    });
  }
}
setupUpload('.photo-upload', '#photo-preview');
setupUpload('.signature-upload', '#signature-preview');

// Submit → generate popup
const submitBtn = document.getElementById('submit-id');
if (submitBtn) {
  submitBtn.addEventListener('click', () => {
    const popup = document.getElementById('popup');
    const canvas = document.getElementById('idCanvas');
    const ctx = canvas.getContext('2d');

    const cardImg = new Image();
    cardImg.src = "img/eu_fe_vorne_jpg_en.jpg";

    cardImg.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(cardImg, 0, 0, canvas.width, canvas.height);

      // Match CSS font
      ctx.font = "23px 'Courier New', monospace";
      ctx.fillStyle = "#000";

      // Draw each field only in popup
      Object.keys(fieldMap).forEach(field => {
        const el = document.querySelector(`.id-input.${field}`);
        if (el && el.value) {
          ctx.fillText(el.value, fieldMap[field].x, fieldMap[field].y);
        }
      });

      // Add photo
      const photo = document.getElementById('photo-preview');
      if (photo && photo.src) ctx.drawImage(photo, 7, 100, 144, 181);

      // Add signature
      const sig = document.getElementById('signature-preview');
      if (sig && sig.src) ctx.drawImage(sig, 180, 283, 200, 54);

      // Download link
      document.getElementById('downloadLink').href = canvas.toDataURL();
      popup.style.display = "flex";
    };
  });
}


// Subscription Form Submission (Netlify + Popup)
const subscribeForm = document.querySelector('form[name="subscribe"]');
if (subscribeForm) {
  subscribeForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const formData = new FormData(subscribeForm);

    fetch("/", {
      method: "POST",
      body: formData
    })
    .then(() => {
      let successMsg = document.getElementById("success-message");
      if (successMsg) {
        successMsg.style.display = "block";
      } else {
        alert("✅ Vielen Dank für Ihre Anmeldung!");
      }
      subscribeForm.reset();
    })
    .catch(() => {
      alert("❌ Es gab ein Problem bei der Anmeldung. Bitte versuchen Sie es erneut.");
    });
  });
}

// Contact Form Submission (Netlify + Popup)
document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");
  const thankYouPopup = document.getElementById("thankYouPopup");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = new FormData(contactForm);

      fetch("/", {
        method: "POST",
        body: formData,
      })
        .then(() => {
          contactForm.reset();
          thankYouPopup.style.display = "flex";

          // Auto-close popup after 5 seconds
          setTimeout(() => {
            thankYouPopup.style.display = "none";
          }, 5000);
        })
        .catch((error) => {
          alert("❌ Error sending form: " + error);
        });
    });
  }

  // Allow manual close
  window.closeThankYouPopup = function () {
    thankYouPopup.style.display = "none";
  };
});

// Language Translation Dropdown
document.addEventListener("DOMContentLoaded", () => {
  const langSelect = document.getElementById("select1");

  if (langSelect) {
    langSelect.addEventListener("change", function() {
      const lang = this.value;
      if (!lang) return;

      // Map select values to language codes for Google Translate
      const langMap = {
        "1": "en", // English
        "2": "es", // Spanish
        "3": "ar", // Arabic
        "4": "fr", // French
        "5": "de"  // Deutsch
      };

      const targetLang = langMap[lang];
      if (targetLang) {
        const translateUrl = "https://translate.google.com/translate?sl=auto&tl=" 
                              + targetLang + "&u=" + encodeURIComponent(window.location.href);
        window.location.href = translateUrl;
      }
    });
  }
});

// Car Rental Form Submission (Netlify + Modal Popup)
document.addEventListener("DOMContentLoaded", () => {
  const carRentalForm = document.getElementById("carRentalForm");
  const confirmationModal = document.getElementById("confirmationModal");
  const modalClose = confirmationModal?.querySelector(".close");

  if (carRentalForm && confirmationModal) {
    carRentalForm.addEventListener("submit", function(e) {
      e.preventDefault();

      const formData = new FormData(carRentalForm);

      fetch("/", {
        method: "POST",
        body: formData
      })
      .then(() => {
        carRentalForm.reset();
        confirmationModal.style.display = "block";
      })
      .catch(() => {
        alert("❌ Es gab ein Problem beim Absenden des Formulars. Bitte versuchen Sie es erneut.");
      });
    });
  }

  // Close modal when clicking X
  if (modalClose) {
    modalClose.addEventListener("click", () => {
      confirmationModal.style.display = "none";
    });
  }

  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target === confirmationModal) {
      confirmationModal.style.display = "none";
    }
  });
});



