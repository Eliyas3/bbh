/* ==========================================================================
   BLOOM BOUQUET HUB - CLEAN, HIGH-PERFORMANCE JS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // 1. PRELOADER HANDLING
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 550);
        }, 600);
    });

    // Fallback in case load event takes too long
    setTimeout(() => {
        if (preloader.style.display !== 'none') {
            preloader.classList.add('fade-out');
            setTimeout(() => { preloader.style.display = 'none'; }, 550);
        }
    }, 2500);


    // 2. STICKY NAVBAR
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });


    // 3. DARK MODE TOGGLE (LocalStorage Persistent)
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn.querySelector('i');
    
    const savedTheme = localStorage.getItem('theme');
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let currentTheme = 'light';
    if (savedTheme === 'dark' || (!savedTheme && userPrefersDark)) {
        currentTheme = 'dark';
    }
    
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        if (theme === 'dark') {
            themeIcon.className = 'fa-solid fa-sun';
            themeIcon.style.color = '#FFD3DC';
        } else {
            themeIcon.className = 'fa-solid fa-moon';
            themeIcon.style.color = '';
        }
    };
    
    applyTheme(currentTheme);
    
    themeToggleBtn.addEventListener('click', () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(currentTheme);
    });


    // 4. QUICK VIEW MODAL
    const modal = document.getElementById('quickViewModal');
    const closeModalBtn = document.getElementById('closeModal');
    const modalImg = document.getElementById('modalImg');
    const modalCategory = document.getElementById('modalCategory');
    const modalPrice = document.getElementById('modalPrice');
    const modalDesc = document.getElementById('modalDesc');
    const modalBookBtn = document.getElementById('modalBookBtn');
    
    const openModal = (card) => {
        const category = card.getAttribute('data-category');
        const price = card.getAttribute('data-price');
        const desc = card.getAttribute('data-desc');
        const image = card.getAttribute('data-image');
        
        modalImg.src = image;
        modalImg.alt = category;
        modalCategory.textContent = category;
        modalPrice.textContent = price;
        modalDesc.textContent = desc;
        
        modalBookBtn.setAttribute('data-target-category', category);
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
    
    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    document.querySelectorAll('.quick-view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.collection-card');
            openModal(card);
        });
    });

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });


    // 5. SELECT BOUQUET & FORM FILL
    const bouquetTypeSelect = document.getElementById('bouquetType');
    
    const handleSelectBouquet = (category) => {
        for (let option of bouquetTypeSelect.options) {
            if (option.value === category) {
                option.selected = true;
                bouquetTypeSelect.dispatchEvent(new Event('change'));
                
                const selectLabel = bouquetTypeSelect.nextElementSibling;
                selectLabel.classList.add('select-label');
                break;
            }
        }
        
        const bookingSection = document.getElementById('booking');
        bookingSection.scrollIntoView({ behavior: 'smooth' });
    };

    document.querySelectorAll('.select-bouquet-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.getAttribute('data-type');
            handleSelectBouquet(category);
        });
    });

    modalBookBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const category = modalBookBtn.getAttribute('data-target-category');
        closeModal();
        setTimeout(() => {
            handleSelectBouquet(category);
        }, 250);
    });


    // 6. FILE UPLOAD & PREVIEW / BASE64 CONVERSION
    const inspirationInput = document.getElementById('inspirationImage');
    const fileUploadWrapper = document.getElementById('fileUploadWrapper');
    const filePreviewContainer = document.getElementById('filePreviewContainer');
    const filePreview = document.getElementById('filePreview');
    const removePreviewBtn = document.getElementById('removePreviewBtn');
    
    const base64Input = document.getElementById('inspirationImageBase64');
    const fileNameInput = document.getElementById('inspirationImageName');

    inspirationInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) {
                alert('For optimal sheets submission, upload an image smaller than 4MB.');
                inspirationInput.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                filePreview.src = event.target.result;
                filePreviewContainer.style.display = 'block';
                fileUploadWrapper.querySelector('.file-upload-label').style.opacity = '0.1';
                
                base64Input.value = event.target.result;
                fileNameInput.value = file.name;
            };
            reader.readAsDataURL(file);
        }
    });

    const resetImageUpload = () => {
        inspirationInput.value = '';
        filePreview.src = '';
        filePreviewContainer.style.display = 'none';
        fileUploadWrapper.querySelector('.file-upload-label').style.opacity = '1';
        base64Input.value = '';
        fileNameInput.value = '';
    };

    removePreviewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        resetImageUpload();
    });


    // 7. FORM VALIDATION & GOOGLE SHEET SUBMISSION
    const form = document.getElementById('bouquetBookingForm');
    const submitBtn = document.getElementById('submitBookingBtn');
    const formStatus = document.getElementById('formStatusMsg');
    const successModal = document.getElementById('successModal');
    const closeSuccessBtn = document.getElementById('closeSuccessBtn');

    // Paste your Google Web App deployment URL here:
    const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx6QL5VHyEnZ2t0Fkj0lffztB6x9iGXgdENrzFAIE5V-hjao3AmngHYEEEmGjhGyOla/exec'; 

    // Block past dates in picker
    const dateInput = document.getElementById('deliveryDate');
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;

    bouquetTypeSelect.addEventListener('change', () => {
        if(bouquetTypeSelect.value) {
            bouquetTypeSelect.parentElement.classList.remove('invalid');
        }
    });

    const validateField = (inputEl) => {
        const parent = inputEl.parentElement;
        let isValid = true;

        if (inputEl.hasAttribute('required')) {
            if (!inputEl.value || inputEl.value.trim() === '') {
                isValid = false;
            }
        }

        if (inputEl.id === 'phoneNumber' && inputEl.value) {
            const cleanPhone = inputEl.value.replace(/\D/g, '');
            if (cleanPhone.length < 8) {
                isValid = false;
            }
        }

        if (!isValid) {
            parent.classList.add('invalid');
        } else {
            parent.classList.remove('invalid');
        }

        return isValid;
    };

    form.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            if (input.parentElement.classList.contains('invalid')) {
                validateField(input);
            }
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        formStatus.className = 'form-status-msg';
        formStatus.style.display = 'none';

        let isFormValid = true;
        let firstInvalidElement = null;

        form.querySelectorAll('input, select, textarea').forEach(input => {
            if (input.type === 'hidden' || input.type === 'file') return;
            
            const isFieldValid = validateField(input);
            if (!isFieldValid) {
                isFormValid = false;
                if (!firstInvalidElement) firstInvalidElement = input;
            }
        });

        if (!isFormValid) {
            if (firstInvalidElement) firstInvalidElement.focus();
            return;
        }

        form.classList.add('submitting');
        submitBtn.disabled = true;

        const formData = new FormData(form);
        const data = {};
        
        formData.forEach((value, key) => {
            if (key === 'inspirationImage') return;
            data[key] = value;
        });

        data['timestamp'] = new Date().toLocaleString();

        try {
            console.log('Sending payload:', data);
            
            if (GOOGLE_APPS_SCRIPT_URL.includes('AKfycby5t9mZf8Tz_n-Q3jW474X2yJ1v3N-N_x6o6f7h1e9b2_d-0s-4S8Z5X3mZ9Q4K5J8L')) {
                // Simulation Mode
                console.log('Simulation Mode Active. Simulating successful sheet logging.');
                await new Promise(resolve => setTimeout(resolve, 1200)); 
                
                form.classList.remove('submitting');
                submitBtn.disabled = false;
                
                successModal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                form.reset();
                resetImageUpload();
                
            } else {
                // Live Fetch Mode
                await fetch(GOOGLE_APPS_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                form.classList.remove('submitting');
                submitBtn.disabled = false;
                
                successModal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                form.reset();
                resetImageUpload();
            }

        } catch (error) {
            console.error('Error submitting booking:', error);
            
            form.classList.remove('submitting');
            submitBtn.disabled = false;
            
            formStatus.textContent = 'Network error. Please try again or click the floating WhatsApp button to book directly.';
            formStatus.className = 'form-status-msg error';
        }
    });

    closeSuccessBtn.addEventListener('click', () => {
        successModal.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

});
