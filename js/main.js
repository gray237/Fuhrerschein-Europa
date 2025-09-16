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
            0:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:2
            },
            1200:{
                items:3
            }
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
            0:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:2
            },
            1200:{
                items:3
            }
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
            0:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:2
            },
            1200:{
                items:3
            }
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

// Live preview for photo
const photoInput = document.querySelector('.photo-upload');
const photoPreview = document.getElementById('photo-preview');

if (photoInput && photoPreview) {
  photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      photoPreview.src = URL.createObjectURL(file);
    }
  });
}

// Live preview for signature
const sigInput = document.querySelector('.signature-upload');
const sigPreview = document.getElementById('signature-preview');

if (sigInput && sigPreview) {
  sigInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      sigPreview.src = URL.createObjectURL(file);
    }
  });
}

// Transparent input once filled
document.querySelectorAll('.id-input').forEach(input => {
  input.addEventListener('input', () => {
    if (input.value.trim() !== "") {
      input.classList.add('filled');
    } else {
      input.classList.remove('filled');
    }
  });
});

// Upload Fields
function setupUpload(inputSelector, previewSelector) {
  const input = document.querySelector(inputSelector);
  const preview = document.querySelector(previewSelector);

  if (input && preview) {
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        preview.src = URL.createObjectURL(file);
        input.style.display = "none"; // hide button after upload
      }
    });
  }
}

setupUpload('.photo-upload', '#photo-preview');
setupUpload('.signature-upload', '#signature-preview');

// Submit button
const submitBtn = document.getElementById('submit-id');
if (submitBtn) {
  submitBtn.addEventListener('click', () => {
    const data = {
      name: document.querySelector('.name')?.value || "",
      nachname: document.querySelector('.nachname')?.value || "",
      geburtsdatum: document.querySelector('.geburtstag')?.value || "",
      geburtsort: document.querySelector('.geburtsort')?.value || "",
      bestelldatum: document.querySelector('.bestelldatum')?.value || ""
    };
    console.log('Form Data:', data);
    alert('ID card data submitted! Check console.');
  });
}



