// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initScrollEffects();
    initCodePlayground();
    initServerSimulator();
    initContactForm();
});

// Navigation functionality
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Scroll effects
function initScrollEffects() {
    // Navbar background on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
}

// Code Playground functionality
function initCodePlayground() {
    // Auto-resize textareas
    const textareas = document.querySelectorAll('.code-input');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    });
}

// Run code in playground
function runCode() {
    const htmlCode = document.getElementById('html-code').value;
    const cssCode = document.getElementById('css-code').value;
    const jsCode = document.getElementById('js-code').value;
    const outputFrame = document.getElementById('output-frame');

    // Create a new document for the output
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '300px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '5px';

    // Clear previous output
    outputFrame.innerHTML = '';
    outputFrame.appendChild(iframe);

    // Write the code to the iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <style>${cssCode}</style>
        </head>
        <body>
            ${htmlCode}
            <script>${jsCode}<\/script>
        </body>
        </html>
    `);
    iframeDoc.close();

    // Show success message
    showNotification('Code executed successfully!', 'success');
}

// Show demo examples
function showDemo(type) {
    const htmlCode = document.getElementById('html-code');
    const cssCode = document.getElementById('css-code');
    const jsCode = document.getElementById('js-code');

    if (type === 'html') {
        htmlCode.value = `<div class="demo-container">
    <h1>Welcome to HTML!</h1>
    <p>This is a paragraph with <strong>bold text</strong> and <em>italic text</em>.</p>
    <ul>
        <li>List item 1</li>
        <li>List item 2</li>
        <li>List item 3</li>
    </ul>
    <button onclick="alert('Hello from HTML!')">Click me</button>
</div>`;
        cssCode.value = `.demo-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    border-radius: 10px;
    text-align: center;
    margin: 1rem;
}`;
        jsCode.value = `// HTML demo - no JavaScript needed for this example
console.log('HTML structure loaded!');`;
    }

    // Run the code after setting it
    setTimeout(runCode, 100);
}

// API Testing functionality
async function testAPI() {
    const method = document.getElementById('api-method').value;
    const url = document.getElementById('api-url').value;
    const resultElement = document.getElementById('api-result');

    if (!url) {
        showNotification('Please enter a valid URL', 'error');
        return;
    }

    try {
        resultElement.textContent = 'Loading...';
        
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const response = await fetch(url, options);
        const data = await response.json();

        resultElement.textContent = JSON.stringify(data, null, 2);
        showNotification('API request successful!', 'success');
    } catch (error) {
        resultElement.textContent = `Error: ${error.message}`;
        showNotification('API request failed', 'error');
    }
}

// Server Simulator
let serverRunning = false;
let serverInterval;

function initServerSimulator() {
    updateServerStatus();
}

function startServer() {
    if (!serverRunning) {
        serverRunning = true;
        updateServerStatus();
        addServerLog('Server starting...', 'info');
        
        serverInterval = setInterval(() => {
            const activities = [
                'Processing request from 192.168.1.100',
                'Database query executed successfully',
                'User authentication completed'
            ];
            
            const randomActivity = activities[Math.floor(Math.random() * activities.length)];
            addServerLog(randomActivity, 'success');
        }, 3000);

        addServerLog('Server started successfully on port 3000', 'success');
        showNotification('Server started!', 'success');
    }
}

function stopServer() {
    if (serverRunning) {
        serverRunning = false;
        clearInterval(serverInterval);
        updateServerStatus();
        addServerLog('Server stopped', 'warning');
        showNotification('Server stopped!', 'warning');
    }
}

function updateServerStatus() {
    const statusElement = document.getElementById('server-status');
    if (serverRunning) {
        statusElement.textContent = 'Running';
        statusElement.style.background = '#d4edda';
        statusElement.style.color = '#155724';
    } else {
        statusElement.textContent = 'Stopped';
        statusElement.style.background = '#f8d7da';
        statusElement.style.color = '#721c24';
    }
}

function addServerLog(message, type = 'info') {
    const logsContainer = document.getElementById('server-logs');
    const logEntry = document.createElement('div');
    const timestamp = new Date().toLocaleTimeString();
    
    logEntry.innerHTML = `<span style="color: #888;">[${timestamp}]</span> ${message}`;
    logEntry.style.marginBottom = '5px';
    
    if (type === 'success') {
        logEntry.style.color = '#51cf66';
    } else if (type === 'warning') {
        logEntry.style.color = '#ffd43b';
    } else if (type === 'error') {
        logEntry.style.color = '#ff6b6b';
    }
    
    logsContainer.appendChild(logEntry);
    logsContainer.scrollTop = logsContainer.scrollHeight;
}

// Project loading functionality
function loadProject(projectType) {
    if (projectType === 'calculator') {
        const htmlCode = document.getElementById('html-code');
        const cssCode = document.getElementById('css-code');
        const jsCode = document.getElementById('js-code');
        
        htmlCode.value = `<div class="calculator">
    <div class="display">
        <input type="text" id="calc-display" readonly>
    </div>
    <div class="buttons">
        <button onclick="clearDisplay()">C</button>
        <button onclick="appendToDisplay('7')">7</button>
        <button onclick="appendToDisplay('8')">8</button>
        <button onclick="appendToDisplay('9')">9</button>
        <button onclick="appendToDisplay('+')">+</button>
        <button onclick="appendToDisplay('4')">4</button>
        <button onclick="appendToDisplay('5')">5</button>
        <button onclick="appendToDisplay('6')">6</button>
        <button onclick="appendToDisplay('-')">-</button>
        <button onclick="appendToDisplay('1')">1</button>
        <button onclick="appendToDisplay('2')">2</button>
        <button onclick="appendToDisplay('3')">3</button>
        <button onclick="calculate()" class="equals">=</button>
        <button onclick="appendToDisplay('0')" class="zero">0</button>
        <button onclick="appendToDisplay('.')">.</button>
    </div>
</div>`;
        
        cssCode.value = `.calculator {
    background: #2c3e50;
    border-radius: 15px;
    padding: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    width: 300px;
    margin: 2rem auto;
}

.display input {
    width: 100%;
    height: 60px;
    border: none;
    background: #34495e;
    color: white;
    font-size: 2rem;
    text-align: right;
    padding: 10px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
}

.buttons button {
    height: 50px;
    border: none;
    background: #3498db;
    color: white;
    font-size: 1.2rem;
    border-radius: 8px;
    cursor: pointer;
}

.buttons button.equals {
    grid-row: span 2;
    background: #e74c3c;
}

.buttons button.zero {
    grid-column: span 2;
}`;
        
        jsCode.value = `let displayValue = '';

function appendToDisplay(value) {
    displayValue += value;
    document.getElementById('calc-display').value = displayValue;
}

function clearDisplay() {
    displayValue = '';
    document.getElementById('calc-display').value = displayValue;
}

function calculate() {
    try {
        displayValue = eval(displayValue).toString();
        document.getElementById('calc-display').value = displayValue;
    } catch (error) {
        document.getElementById('calc-display').value = 'Error';
        displayValue = '';
    }
}`;
        
        setTimeout(runCode, 100);
        showNotification('Loaded Calculator App!', 'success');
    }
}

// Contact form functionality
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', submitForm);
    }
}

function submitForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    console.log('Form submitted:', { name, email, message });
    showNotification('Message sent successfully! (This is a demo)', 'success');
    event.target.reset();
}

// Utility functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#51cf66' : type === 'error' ? '#ff6b6b' : '#667eea'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}
