// ==================== STATE MANAGEMENT ====================
let currentStep = 1;
let formData = {};
let hasSignature = false;

// ==================== CANVAS SETUP ====================
const canvas = document.getElementById('signatureCanvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;

ctx.strokeStyle = '#1a1a2e';
ctx.lineWidth = 2.5;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

// ==================== SIGNATURE EVENTS ====================
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', stopDrawing);

function startDrawing(e) {
    isDrawing = true;
    hasSignature = true;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    e.preventDefault();
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    e.preventDefault();
}

function stopDrawing() {
    isDrawing = false;
}

function clearSignature() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasSignature = false;
}

// ==================== FORM VALIDATION ====================
function isStepValid() {
    if (currentStep === 1) {
        return document.getElementById('fullName').value &&
               document.getElementById('register').value &&
               document.getElementById('phone').value &&
               document.getElementById('email').value &&
               document.getElementById('address').value;
    } else if (currentStep === 2) {
        return document.getElementById('courseType').value &&
               document.getElementById('startDate').value &&
               document.getElementById('totalFee').value;
    } else if (currentStep === 3) {
        return hasSignature && document.getElementById('termsAccepted').checked;
    }
    return false;
}

function updateNextButton() {
    const nextBtn = document.getElementById('nextBtn');
    if (isStepValid()) {
        nextBtn.disabled = false;
    } else {
        nextBtn.disabled = true;
    }
}

// Add input listeners
document.querySelectorAll('input, select').forEach(element => {
    element.addEventListener('input', updateNextButton);
    element.addEventListener('change', updateNextButton);
});

// ==================== NAVIGATION ====================
function nextStep() {
    if (!isStepValid()) return;
    
    if (currentStep < 3) {
        // Save data
        saveFormData();
        
        // Update UI
        currentStep++;
        updateStepDisplay();
        updateNextButton();
    } else {
        // Submit
        submitForm();
    }
}

function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStepDisplay();
        updateNextButton();
    }
}

function updateStepDisplay() {
    // Hide all steps
    document.getElementById('step1').classList.add('hidden');
    document.getElementById('step2').classList.add('hidden');
    document.getElementById('step3').classList.add('hidden');
    
    // Show current step
    document.getElementById('step' + currentStep).classList.remove('hidden');
    
    // Update progress circles
    for (let i = 1; i <= 3; i++) {
        const circle = document.getElementById('step' + i + 'Circle');
        const label = document.getElementById('step' + i + 'Label');
        const line = document.getElementById('line' + i);
        
        if (i < currentStep) {
            circle.className = 'step-circle completed';
            circle.innerHTML = '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
            label.classList.remove('active');
            if (line) line.classList.add('completed');
        } else if (i === currentStep) {
            circle.className = 'step-circle active';
            circle.innerHTML = getStepIcon(i);
            label.classList.add('active');
        } else {
            circle.className = 'step-circle inactive';
            circle.innerHTML = getStepIcon(i);
            label.classList.remove('active');
            if (line) line.classList.remove('completed');
        }
    }
    
    // Update navigation buttons
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (currentStep === 1) {
        backBtn.classList.add('hidden');
    } else {
        backBtn.classList.remove('hidden');
    }
    
    if (currentStep === 3) {
        nextBtn.className = 'btn btn-success';
        nextBtn.innerHTML = 'Гэрээ баталгаажуулах <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
    } else {
        nextBtn.className = 'btn btn-primary';
        nextBtn.innerHTML = 'Үргэлжлүүлэх <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>';
    }
    
    // Update contract preview
    if (currentStep === 3) {
        updateContractPreview();
    }
}

function getStepIcon(step) {
    const icons = {
        1: '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>',
        2: '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>',
        3: '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>'
    };
    return icons[step];
}

// ==================== DATA MANAGEMENT ====================
function saveFormData() {
    formData = {
        fullName: document.getElementById('fullName').value,
        register: document.getElementById('register').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        facebook: document.getElementById('facebook').value,
        gender: document.getElementById('gender').value,
        age: document.getElementById('age').value,
        courseType: document.getElementById('courseType').value,
        startDate: document.getElementById('startDate').value,
        duration: document.getElementById('duration').value,
        format: document.getElementById('format').value,
        totalFee: document.getElementById('totalFee').value,
        monthlyFee: document.getElementById('monthlyFee').value,
        discount: document.getElementById('discount').value
    };
}

function updateContractPreview() {
    document.getElementById('contractName').textContent = formData.fullName || '[Нэр]';
    document.getElementById('contractRegister').textContent = formData.register || '[Регистр]';
    document.getElementById('contractDate').textContent = formData.startDate || '[огноо]';
    document.getElementById('contractDuration').textContent = formData.duration || '[хугацаа]';
    
    const courseSelect = document.getElementById('courseType');
    const courseText = courseSelect.options[courseSelect.selectedIndex]?.text || '[сургалт]';
    document.getElementById('contractCourse').textContent = courseText;
    
    document.getElementById('contractFee').textContent = formData.totalFee || '[төлбөр]';
    document.getElementById('contractFee2').textContent = formData.totalFee || '[нийт төлбөр]';
    
    const formatMap = { 'offline': 'танхим', 'online': 'онлайн', 'hybrid': 'холимог' };
    document.getElementById('contractFormat').textContent = formatMap[formData.format] || '[хэлбэр]';
}

// ==================== FORM SUBMISSION ====================
function submitForm() {
    saveFormData();
    
    const signatureData = canvas.toDataURL();
    const contractData = {
        ...formData,
        signature: signatureData,
        submittedDate: new Date().toISOString()
    };
    
    console.log('Гэрээ баталгаажлаа:', contractData);
    
    // Update success screen
    const courseSelect = document.getElementById('courseType');
    const courseText = courseSelect.options[courseSelect.selectedIndex]?.text;
    
    document.getElementById('successName').textContent = formData.fullName;
    document.getElementById('successCourse').textContent = courseText;
    document.getElementById('successEmail').textContent = formData.email;
    
    // Show success screen
    document.querySelector('.container').classList.add('hidden');
    document.getElementById('successScreen').classList.remove('hidden');
    
    // BACKEND ХОЛБОЛТ ЭНЭ ХЭСЭГТ НЭМНЭ:
    // fetch('/api/submit-contract', { 
    //     method: 'POST', 
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(contractData) 
    // })
}

// ==================== INITIALIZATION ====================
// Set min date for startDate
const today = new Date().toISOString().split('T')[0];
document.getElementById('startDate').setAttribute('min', today);

// Initialize
updateNextButton();
