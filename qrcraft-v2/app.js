// QRCraft - Advanced QR Code Generator
// Storage keys
const STORAGE_KEY = 'qrcraft_history';
const MAX_HISTORY = 50;

// State
let currentQR = null;
let currentData = null;
let currentConfig = {
    size: 400,
    fgColor: '#000000',
    bgColor: '#ffffff',
    pattern: 'square',
    logo: null
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeColorPickers();
    initializeFileUploads();
    initializeGenerateButton();
    initializeDownloadButtons();
    initializeHistory();
    initializePatternSelector();
    loadHistory();
    
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
});

// Tab Management
function initializeTabs() {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`${targetId}-content`).classList.add('active');
        });
    });
}

// Color Picker Sync
function initializeColorPickers() {
    const fgColor = document.getElementById('fg-color');
    const fgColorText = document.getElementById('fg-color-text');
    const bgColor = document.getElementById('bg-color');
    const bgColorText = document.getElementById('bg-color-text');
    const sizeRange = document.getElementById('qr-size');
    const sizeValue = document.getElementById('size-value');
    
    fgColor.addEventListener('input', (e) => {
        fgColorText.value = e.target.value;
        currentConfig.fgColor = e.target.value;
    });
    
    fgColorText.addEventListener('input', (e) => {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
            fgColor.value = e.target.value;
            currentConfig.fgColor = e.target.value;
        }
    });
    
    bgColor.addEventListener('input', (e) => {
        bgColorText.value = e.target.value;
        currentConfig.bgColor = e.target.value;
    });
    
    bgColorText.addEventListener('input', (e) => {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
            bgColor.value = e.target.value;
            currentConfig.bgColor = e.target.value;
        }
    });
    
    sizeRange.addEventListener('input', (e) => {
        currentConfig.size = parseInt(e.target.value);
        sizeValue.textContent = `${e.target.value}px`;
    });
}

// Pattern Selector
function initializePatternSelector() {
    const patterns = document.querySelectorAll('.pattern-option');
    patterns.forEach(pattern => {
        pattern.addEventListener('click', () => {
            patterns.forEach(p => p.classList.remove('selected'));
            pattern.classList.add('selected');
            currentConfig.pattern = pattern.dataset.pattern;
        });
    });
}

// File Uploads
function initializeFileUploads() {
    // Logo upload
    const logoUpload = document.getElementById('logo-upload');
    logoUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                currentConfig.logo = event.target.result;
                showNotification('Logo loaded successfully', 'success');
            };
            reader.readAsDataURL(file);
        }
    });
    
    // CSV upload
    const csvUpload = document.getElementById('csv-upload');
    const csvFile = document.getElementById('csv-file');
    
    csvUpload.addEventListener('click', () => csvFile.click());
    
    csvUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        csvUpload.classList.add('dragover');
    });
    
    csvUpload.addEventListener('dragleave', () => {
        csvUpload.classList.remove('dragover');
    });
    
    csvUpload.addEventListener('drop', (e) => {
        e.preventDefault();
        csvUpload.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.csv')) {
            handleCSV(file);
        }
    });
    
    csvFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleCSV(file);
    });
}

// CSV Processing
function handleCSV(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        const qrData = lines.map(line => {
            const parts = line.split(',').map(s => s.trim());
            return { 
                url: parts[0], 
                name: parts[1] || parts[0].substring(0, 30) 
            };
        });
        
        if (qrData.length > 0) {
            generateBatchQRCodes(qrData);
        } else {
            showNotification('CSV file is empty', 'error');
        }
    };
    reader.readAsText(file);
}

// Batch Generation
function generateBatchQRCodes(dataArray) {
    const resultsDiv = document.getElementById('batch-results');
    resultsDiv.innerHTML = '<div class="batch-result"></div>';
    const container = resultsDiv.querySelector('.batch-result');
    
    dataArray.forEach((data, index) => {
        const item = document.createElement('div');
        item.className = 'batch-item';
        
        const canvas = document.createElement('canvas');
        canvas.width = 80;
        canvas.height = 80;
        
        try {
            const qr = new QRious({
                element: canvas,
                value: data.url,
                size: 80,
                foreground: currentConfig.fgColor,
                background: currentConfig.bgColor,
                level: 'H'
            });
            
            const info = document.createElement('div');
            info.style.flex = '1';
            info.innerHTML = `
                <div style="font-weight: 600; color: var(--text-primary);">${escapeHtml(data.name)}</div>
                <div style="font-size: 0.85rem; color: var(--text-muted);">${escapeHtml(data.url)}</div>
            `;
            
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'btn btn-secondary';
            downloadBtn.textContent = 'Download';
            downloadBtn.style.width = 'auto';
            downloadBtn.style.padding = '0.5rem 1rem';
            downloadBtn.onclick = () => {
                const link = document.createElement('a');
                link.download = `qr-${data.name.replace(/[^a-z0-9]/gi, '_')}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            };
            
            item.appendChild(canvas);
            item.appendChild(info);
            item.appendChild(downloadBtn);
            container.appendChild(item);
        } catch (error) {
            console.error('Error generating QR code:', error);
        }
    });
    
    showNotification(`Generated ${dataArray.length} QR codes`, 'success');
}

// Generate QR Code
function initializeGenerateButton() {
    const btn = document.getElementById('generate-btn');
    btn.addEventListener('click', generateQRCode);
}

function generateQRCode() {
    const activeTab = document.querySelector('.tab.active').dataset.tab;
    let data = '';
    let type = activeTab;
    
    switch (activeTab) {
        case 'url':
            data = document.getElementById('url-input').value.trim();
            if (!data) {
                showNotification('Please enter a URL', 'error');
                return;
            }
            // Add https:// if no protocol specified
            if (!data.match(/^https?:\/\//)) {
                data = 'https://' + data;
            }
            break;
            
        case 'text':
            data = document.getElementById('text-input').value.trim();
            if (!data) {
                showNotification('Please enter text', 'error');
                return;
            }
            break;
            
        case 'wifi':
            const ssid = document.getElementById('wifi-ssid').value.trim();
            const password = document.getElementById('wifi-password').value.trim();
            const encryption = document.getElementById('wifi-encryption').value;
            
            if (!ssid) {
                showNotification('Please enter WiFi SSID', 'error');
                return;
            }
            
            data = `WIFI:T:${encryption};S:${ssid};P:${password};;`;
            break;
            
        case 'vcard':
            const name = document.getElementById('vcard-name').value.trim();
            const phone = document.getElementById('vcard-phone').value.trim();
            const email = document.getElementById('vcard-email').value.trim();
            const org = document.getElementById('vcard-org').value.trim();
            
            if (!name) {
                showNotification('Please enter a name', 'error');
                return;
            }
            
            data = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nORG:${org}\nEND:VCARD`;
            break;
            
        case 'payment':
            const paymentType = document.getElementById('payment-type').value;
            const address = document.getElementById('payment-address').value.trim();
            const amount = document.getElementById('payment-amount').value.trim();
            
            if (!address) {
                showNotification('Please enter payment address', 'error');
                return;
            }
            
            if (paymentType === 'bitcoin') {
                data = `bitcoin:${address}${amount ? '?amount=' + amount : ''}`;
            } else if (paymentType === 'ethereum') {
                data = `ethereum:${address}${amount ? '?value=' + amount : ''}`;
            } else {
                data = `https://paypal.me/${address}${amount ? '/' + amount : ''}`;
            }
            break;
            
        case 'batch':
            showNotification('Use CSV upload for batch generation', 'error');
            return;
    }
    
    currentData = { type, data };
    renderQRCode(data);
    saveToHistory(type, data);
}

function renderQRCode(text) {
    const preview = document.getElementById('qr-preview');
    preview.innerHTML = '';
    
    const canvas = document.createElement('canvas');
    canvas.id = 'qr-canvas';
    
    try {
        // Generate QR code using QRious
        currentQR = new QRious({
            element: canvas,
            value: text,
            size: currentConfig.size,
            foreground: currentConfig.fgColor,
            background: currentConfig.bgColor,
            level: 'H'
        });
        
        // Apply pattern if not square
        if (currentConfig.pattern !== 'square') {
            applyPattern(canvas, currentConfig.pattern);
        }
        
        // Add logo if present
        if (currentConfig.logo) {
            addLogoToCanvas(canvas, currentConfig.logo);
        } else {
            preview.appendChild(canvas);
            showNotification('QR code generated successfully!', 'success');
        }
        
    } catch (error) {
        console.error('Error generating QR code:', error);
        showNotification('Error generating QR code: ' + error.message, 'error');
    }
}

function applyPattern(canvas, pattern) {
    if (pattern === 'square') return;
    
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const moduleSize = Math.floor(canvas.width / 33); // QR code has ~33 modules
    
    if (pattern === 'dots') {
        // Convert squares to dots
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Copy background
        tempCtx.fillStyle = currentConfig.bgColor;
        tempCtx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw dots
        tempCtx.fillStyle = currentConfig.fgColor;
        for (let y = 0; y < canvas.height; y += moduleSize) {
            for (let x = 0; x < canvas.width; x += moduleSize) {
                const i = (y * canvas.width + x) * 4;
                if (data[i] === 0 || (data[i] < 128 && currentConfig.fgColor !== '#ffffff')) {
                    tempCtx.beginPath();
                    tempCtx.arc(x + moduleSize/2, y + moduleSize/2, moduleSize * 0.4, 0, Math.PI * 2);
                    tempCtx.fill();
                }
            }
        }
        
        // Copy back to original canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
        
    } else if (pattern === 'rounded') {
        // Convert to rounded squares
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.fillStyle = currentConfig.bgColor;
        tempCtx.fillRect(0, 0, canvas.width, canvas.height);
        
        tempCtx.fillStyle = currentConfig.fgColor;
        for (let y = 0; y < canvas.height; y += moduleSize) {
            for (let x = 0; x < canvas.width; x += moduleSize) {
                const i = (y * canvas.width + x) * 4;
                if (data[i] === 0 || (data[i] < 128 && currentConfig.fgColor !== '#ffffff')) {
                    drawRoundedRect(tempCtx, x + 1, y + 1, moduleSize - 2, moduleSize - 2, moduleSize * 0.3);
                }
            }
        }
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
    }
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

function addLogoToCanvas(canvas, logoSrc) {
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
        const logoSize = canvas.width * 0.2;
        const x = (canvas.width - logoSize) / 2;
        const y = (canvas.height - logoSize) / 2;
        
        // Draw white background for logo
        ctx.fillStyle = currentConfig.bgColor;
        ctx.fillRect(x - 10, y - 10, logoSize + 20, logoSize + 20);
        
        // Draw logo
        ctx.drawImage(img, x, y, logoSize, logoSize);
        
        const preview = document.getElementById('qr-preview');
        preview.innerHTML = '';
        preview.appendChild(canvas);
        showNotification('QR code generated with logo!', 'success');
    };
    img.onerror = () => {
        const preview = document.getElementById('qr-preview');
        preview.innerHTML = '';
        preview.appendChild(canvas);
        showNotification('QR code generated (logo failed to load)', 'success');
    };
    img.src = logoSrc;
}

// Download Functions
function initializeDownloadButtons() {
    document.getElementById('download-png').addEventListener('click', () => downloadPNG());
    document.getElementById('download-svg').addEventListener('click', () => downloadSVG());
    document.getElementById('download-pdf').addEventListener('click', () => downloadPDF());
}

function downloadPNG() {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) {
        showNotification('Generate a QR code first', 'error');
        return;
    }
    
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    showNotification('Downloaded as PNG', 'success');
}

function downloadSVG() {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) {
        showNotification('Generate a QR code first', 'error');
        return;
    }
    
    // Convert canvas to SVG
    const size = canvas.width;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
    svg += `<rect width="${size}" height="${size}" fill="${currentConfig.bgColor}"/>`;
    
    // Detect module size
    const moduleSize = Math.floor(size / 33);
    
    for (let y = 0; y < size; y += moduleSize) {
        for (let x = 0; x < size; x += moduleSize) {
            const i = (y * size + x) * 4;
            if (data[i] === 0 || data[i] < 128) {
                svg += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="${currentConfig.fgColor}"/>`;
            }
        }
    }
    
    svg += '</svg>';
    
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = 'qrcode.svg';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    showNotification('Downloaded as SVG', 'success');
}

function downloadPDF() {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) {
        showNotification('Generate a QR code first', 'error');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 100;
    const imgHeight = 100;
    const x = (210 - imgWidth) / 2;
    const y = 50;
    
    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    pdf.save('qrcode.pdf');
    showNotification('Downloaded as PDF', 'success');
}

// History Management
function saveToHistory(type, data) {
    let history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    const entry = {
        id: Date.now(),
        type,
        data,
        config: { ...currentConfig },
        timestamp: new Date().toISOString()
    };
    
    history.unshift(entry);
    history = history.slice(0, MAX_HISTORY);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const historyList = document.getElementById('history-list');
    
    if (history.length === 0) {
        historyList.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No history yet</p>';
        return;
    }
    
    historyList.innerHTML = history.map(entry => {
        const date = new Date(entry.timestamp);
        const timeAgo = getTimeAgo(date);
        return `
        <div class="history-item" data-id="${entry.id}">
            <div class="history-info">
                <div class="history-type">${entry.type}</div>
                <div class="history-content">${escapeHtml(entry.data.substring(0, 50))}${entry.data.length > 50 ? '...' : ''}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">${timeAgo}</div>
            </div>
            <div class="history-actions">
                <button class="icon-btn load-history" data-id="${entry.id}" title="Load">🔄</button>
                <button class="icon-btn delete-history" data-id="${entry.id}" title="Delete">🗑️</button>
            </div>
        </div>
    `;
    }).join('');
    
    // Add event listeners
    document.querySelectorAll('.load-history').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            loadHistoryItem(parseInt(btn.dataset.id));
        });
    });
    
    document.querySelectorAll('.delete-history').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteHistoryItem(parseInt(btn.dataset.id));
        });
    });
    
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            loadHistoryItem(parseInt(item.dataset.id));
        });
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
    return date.toLocaleDateString();
}

function loadHistoryItem(id) {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const entry = history.find(e => e.id === id);
    
    if (!entry) return;
    
    currentData = { type: entry.type, data: entry.data };
    currentConfig = { ...entry.config };
    
    // Update UI
    document.getElementById('fg-color').value = currentConfig.fgColor;
    document.getElementById('fg-color-text').value = currentConfig.fgColor;
    document.getElementById('bg-color').value = currentConfig.bgColor;
    document.getElementById('bg-color-text').value = currentConfig.bgColor;
    document.getElementById('qr-size').value = currentConfig.size;
    document.getElementById('size-value').textContent = `${currentConfig.size}px`;
    
    // Update pattern selection
    document.querySelectorAll('.pattern-option').forEach(p => {
        p.classList.toggle('selected', p.dataset.pattern === currentConfig.pattern);
    });
    
    renderQRCode(entry.data);
    showNotification('Loaded from history', 'success');
}

function deleteHistoryItem(id) {
    let history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    history = history.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    loadHistory();
    showNotification('Deleted from history', 'success');
}

document.getElementById('clear-history').addEventListener('click', () => {
    if (confirm('Clear all history? This cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEY);
        loadHistory();
        showNotification('History cleared', 'success');
    }
});

// Notifications
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
