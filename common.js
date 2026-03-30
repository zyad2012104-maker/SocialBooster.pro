// common.js - الملف الرئيسي للبيانات والدوال المشتركة مع إدارة الإعلانات

// ========== المتغيرات العامة ==========
let apps = [];
let users = [];
let comments = [];
let categories = [];
let adSettings = {
    topBanner: '',
    bottomBanner: '',
    leftSidebar: '',
    rightSidebar: '',
    clickAd: ''
};
let currentUser = null;
let jsonbinReady = false;

// ========== تحميل البيانات من JSONBin ==========
async function loadApps() {
    try {
        console.log("🔄 جاري تحميل البيانات من JSONBin...");
        
        const response = await fetch(`${CONFIG.JSONBIN.BASE_URL}${CONFIG.JSONBIN.BIN_ID}/latest`, {
            headers: {
                "X-Master-Key": CONFIG.JSONBIN.MASTER_KEY
            }
        });
        
        const data = await response.json();
        console.log("📦 البيانات المستلمة من JSONBin:", data);
        
        if (data.record) {
            // تحميل التطبيقات
            if (Array.isArray(data.record.apps)) {
                apps = data.record.apps;
            } else if (Array.isArray(data.record)) {
                apps = data.record;
            } else {
                apps = [];
            }
            
            // تحميل المستخدمين
            if (Array.isArray(data.record.users)) {
                users = data.record.users;
            } else {
                users = [];
            }
            
            // تحميل التعليقات
            if (Array.isArray(data.record.comments)) {
                comments = data.record.comments;
            } else {
                comments = [];
            }
            
            // تحميل التصنيفات
            if (Array.isArray(data.record.categories)) {
                categories = data.record.categories;
            } else if (Array.isArray(data.record.categoriesList)) {
                categories = data.record.categoriesList;
            } else {
                // تصنيفات افتراضية
                categories = [
                    { key: 'games', name: 'ألعاب', icon: '🎮' },
                    { key: 'social', name: 'تواصل اجتماعي', icon: '💬' },
                    { key: 'education', name: 'تعليم', icon: '📚' },
                    { key: 'productivity', name: 'إنتاجية', icon: '💼' },
                    { key: 'entertainment', name: 'ترفيه', icon: '🎬' }
                ];
            }
            
            // تحميل إعدادات الإعلانات
            if (data.record.adSettings) {
                adSettings = { ...adSettings, ...data.record.adSettings };
            }
            
            console.log(`✅ تم التحميل: ${apps.length} تطبيق، ${users.length} مستخدم، ${comments.length} تعليق، ${categories.length} تصنيف`);
        } else {
            console.log("⚠️ لا توجد بيانات في JSONBin، سيتم استخدام البيانات المحلية");
            loadLocalData();
        }
        
        // إنشاء حساب admin إذا لم يكن موجوداً
        if (!users.find(u => u.role === 'admin')) {
            console.log("👑 إنشاء حساب admin...");
            users.push({
                id: Date.now(),
                username: "admin",
                email: "admin",
                password: "admin2012",
                role: "admin",
                date: new Date().toISOString()
            });
            await saveUsers();
        }
        
        // حفظ نسخة محلية احتياطية
        saveLocalData();
        
        jsonbinReady = true;
        
        // إزالة رسالة التحميل
        const loadingEl = document.getElementById("loadingMessage");
        if (loadingEl) loadingEl.style.display = "none";
        
    } catch (error) {
        console.error("❌ خطأ في تحميل البيانات:", error);
        console.log("📦 سيتم استخدام البيانات المحلية كحل بديل");
        loadLocalData();
        jsonbinReady = true;
    }
}

// ========== تحميل البيانات المحلية ==========
function loadLocalData() {
    try {
        let localApps = localStorage.getItem("apps");
        if (localApps) apps = JSON.parse(localApps);
        
        let localUsers = localStorage.getItem("users");
        if (localUsers) users = JSON.parse(localUsers);
        
        let localComments = localStorage.getItem("comments");
        if (localComments) comments = JSON.parse(localComments);
        
        let localCategories = localStorage.getItem("categories");
        if (localCategories) categories = JSON.parse(localCategories);
        
        let localAdSettings = localStorage.getItem("adSettings");
        if (localAdSettings) adSettings = JSON.parse(localAdSettings);
        
        // تصنيفات افتراضية إذا لم توجد
        if (!categories || categories.length === 0) {
            categories = [
                { key: 'games', name: 'ألعاب', icon: '🎮' },
                { key: 'social', name: 'تواصل اجتماعي', icon: '💬' },
                { key: 'education', name: 'تعليم', icon: '📚' },
                { key: 'productivity', name: 'إنتاجية', icon: '💼' },
                { key: 'entertainment', name: 'ترفيه', icon: '🎬' }
            ];
        }
        
        console.log(`📦 تم التحميل من localStorage: ${apps.length} تطبيق`);
    } catch (e) {
        console.error("خطأ في تحميل البيانات المحلية:", e);
    }
}

// ========== حفظ البيانات المحلية ==========
function saveLocalData() {
    localStorage.setItem("apps", JSON.stringify(apps));
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("comments", JSON.stringify(comments));
    localStorage.setItem("categories", JSON.stringify(categories));
    localStorage.setItem("adSettings", JSON.stringify(adSettings));
}

// ========== حفظ التطبيقات ==========
async function saveApps() {
    try {
        console.log("💾 جاري حفظ التطبيقات على JSONBin...");
        
        // حفظ نسخة محلية
        saveLocalData();
        
        // إعداد البيانات الكاملة للحفظ
        const fullData = {
            apps: apps,
            users: users,
            comments: comments,
            categories: categories,
            adSettings: adSettings,
            lastUpdated: new Date().toISOString()
        };
        
        const response = await fetch(`${CONFIG.JSONBIN.BASE_URL}${CONFIG.JSONBIN.BIN_ID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": CONFIG.JSONBIN.MASTER_KEY
            },
            body: JSON.stringify(fullData)
        });
        
        const data = await response.json();
        console.log("✅ تم حفظ البيانات بنجاح:", data);
        
    } catch (error) {
        console.error("❌ خطأ في حفظ البيانات:", error);
        showAlert("تم الحفظ محلياً فقط بسبب مشكلة في الاتصال", "error");
    }
}

// ========== حفظ المستخدمين ==========
async function saveUsers() {
    saveLocalData();
    try {
        const fullData = {
            apps: apps,
            users: users,
            comments: comments,
            categories: categories,
            adSettings: adSettings,
            lastUpdated: new Date().toISOString()
        };
        
        await fetch(`${CONFIG.JSONBIN.BASE_URL}${CONFIG.JSONBIN.BIN_ID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": CONFIG.JSONBIN.MASTER_KEY
            },
            body: JSON.stringify(fullData)
        });
        console.log("✅ تم حفظ المستخدمين");
    } catch (error) {
        console.error("❌ خطأ في حفظ المستخدمين:", error);
    }
}

// ========== حفظ التعليقات ==========
async function saveComments() {
    saveLocalData();
    try {
        const fullData = {
            apps: apps,
            users: users,
            comments: comments,
            categories: categories,
            adSettings: adSettings,
            lastUpdated: new Date().toISOString()
        };
        
        await fetch(`${CONFIG.JSONBIN.BASE_URL}${CONFIG.JSONBIN.BIN_ID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": CONFIG.JSONBIN.MASTER_KEY
            },
            body: JSON.stringify(fullData)
        });
        console.log("✅ تم حفظ التعليقات");
    } catch (error) {
        console.error("❌ خطأ في حفظ التعليقات:", error);
    }
}

// ========== حفظ التصنيفات ==========
async function saveCategories() {
    saveLocalData();
    try {
        const fullData = {
            apps: apps,
            users: users,
            comments: comments,
            categories: categories,
            adSettings: adSettings,
            lastUpdated: new Date().toISOString()
        };
        
        await fetch(`${CONFIG.JSONBIN.BASE_URL}${CONFIG.JSONBIN.BIN_ID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": CONFIG.JSONBIN.MASTER_KEY
            },
            body: JSON.stringify(fullData)
        });
        console.log("✅ تم حفظ التصنيفات");
    } catch (error) {
        console.error("❌ خطأ في حفظ التصنيفات:", error);
    }
}

// ========== حفظ إعدادات الإعلانات ==========
async function saveAdSettings() {
    saveLocalData();
    try {
        const fullData = {
            apps: apps,
            users: users,
            comments: comments,
            categories: categories,
            adSettings: adSettings,
            lastUpdated: new Date().toISOString()
        };
        
        await fetch(`${CONFIG.JSONBIN.BASE_URL}${CONFIG.JSONBIN.BIN_ID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": CONFIG.JSONBIN.MASTER_KEY
            },
            body: JSON.stringify(fullData)
        });
        console.log("✅ تم حفظ إعدادات الإعلانات");
    } catch (error) {
        console.error("❌ خطأ في حفظ إعدادات الإعلانات:", error);
    }
}

// ========== عرض الإعلانات (يتم استدعاؤها في كل صفحة) ==========
function renderAds() {
    console.log("📢 جاري عرض الإعلانات...");
    
    // إعلان أعلى الصفحة
    const topContainer = document.getElementById('topAdContainer');
    if (topContainer) {
        if (adSettings.topBanner && adSettings.topBanner.trim()) {
            topContainer.innerHTML = adSettings.topBanner;
            executeAdScripts(topContainer);
        } else {
            topContainer.innerHTML = '';
        }
    }
    
    // إعلان أسفل الصفحة
    const bottomContainer = document.getElementById('bottomAdContainer');
    if (bottomContainer) {
        if (adSettings.bottomBanner && adSettings.bottomBanner.trim()) {
            bottomContainer.innerHTML = adSettings.bottomBanner;
            executeAdScripts(bottomContainer);
        } else {
            bottomContainer.innerHTML = '';
        }
    }
    
    // إعلان جانبي أيسر
    const leftContainer = document.getElementById('leftAdContainer');
    if (leftContainer) {
        if (adSettings.leftSidebar && adSettings.leftSidebar.trim()) {
            leftContainer.innerHTML = adSettings.leftSidebar;
            executeAdScripts(leftContainer);
        } else {
            leftContainer.innerHTML = '';
        }
    }
    
    // إعلان جانبي أيمن
    const rightContainer = document.getElementById('rightAdContainer');
    if (rightContainer) {
        if (adSettings.rightSidebar && adSettings.rightSidebar.trim()) {
            rightContainer.innerHTML = adSettings.rightSidebar;
            executeAdScripts(rightContainer);
        } else {
            rightContainer.innerHTML = '';
        }
    }
}

// ========== تنفيذ سكربتات الإعلانات ==========
function executeAdScripts(container) {
    if (!container) return;
    const scripts = container.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
        const script = document.createElement('script');
        if (scripts[i].src) {
            script.src = scripts[i].src;
        } else {
            script.textContent = scripts[i].innerHTML;
        }
        document.head.appendChild(script);
    }
}

// ========== عرض نافذة الإعلان عند النقر على تحميل ==========
function showClickAd() {
    if (adSettings.clickAd && adSettings.clickAd.trim()) {
        const modal = document.getElementById('adModal');
        const content = document.getElementById('modalAdContent');
        if (modal && content) {
            content.innerHTML = adSettings.clickAd;
            executeAdScripts(content);
            modal.style.display = 'flex';
        }
    }
}

function closeAdModal() {
    const modal = document.getElementById('adModal');
    if (modal) modal.style.display = 'none';
}

// ========== دوال مساعدة ==========
function showAlert(message, type = "success") {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = message;
    document.body.appendChild(alertDiv);
    setTimeout(() => {
        alertDiv.style.animation = 'slideOut 0.3s';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getCategoryName(key) {
    const cat = categories.find(c => c.key === key);
    return cat ? cat.name : key;
}

function getCategoryIcon(key) {
    const cat = categories.find(c => c.key === key);
    return cat ? cat.icon : '📱';
}

function isAdmin(user) {
    return user && user.role === 'admin';
}

function isModerator(user) {
    return user && user.role === 'moderator';
}

function hasPermission(user, permission) {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'moderator' && user.permissions && user.permissions[permission]) return true;
    return false;
}

// ========== وظائف المستخدم ==========
function loadCurrentUser() {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
        try {
            currentUser = JSON.parse(stored);
            // التحقق من وجود المستخدم في القائمة (للتحديثات)
            const found = users.find(u => u.id === currentUser.id);
            if (found) {
                currentUser = found;
            }
        } catch (e) {
            console.error("خطأ في تحميل المستخدم:", e);
        }
    }
}

function updateNavBar() {
    const loginNav = document.getElementById('loginNav');
    const uploadNav = document.getElementById('uploadNav');
    const adminNav = document.getElementById('adminNav');
    const moderatorNav = document.getElementById('moderatorNav');
    const userInfo = document.getElementById('userInfo');
    
    if (currentUser) {
        if (loginNav) loginNav.style.display = 'none';
        if (uploadNav) uploadNav.style.display = 'block';
        if (userInfo) {
            userInfo.style.display = 'block';
            userInfo.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span>👤 ${escapeHtml(currentUser.username)}</span>
                    <a href="#" onclick="logout()" style="color: #ef4444;">🚪 خروج</a>
                </div>
            `;
        }
        if (adminNav) adminNav.style.display = currentUser.role === 'admin' ? 'block' : 'none';
        if (moderatorNav) moderatorNav.style.display = currentUser.role === 'moderator' ? 'block' : 'none';
    } else {
        if (loginNav) loginNav.style.display = 'block';
        if (uploadNav) uploadNav.style.display = 'block';
        if (userInfo) userInfo.style.display = 'none';
        if (adminNav) adminNav.style.display = 'none';
        if (moderatorNav) moderatorNav.style.display = 'none';
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showAlert('تم تسجيل الخروج بنجاح', 'info');
    updateNavBar();
    window.location.href = 'index.html';
}

// ========== إنشاء بطاقة التطبيق ==========
function createAppCard(app) {
    const stars = '★'.repeat(Math.floor(app.rating || 0)) + '☆'.repeat(5 - Math.floor(app.rating || 0));
    const imageUrl = app.image && app.image.startsWith('http') ? app.image : 'https://placehold.co/300x200/667eea/white?text=' + encodeURIComponent(app.name);
    
    return `
        <div class="app-card" onclick="window.location.href='app-detail.html?id=${app.id}'">
            <img src="${imageUrl}" alt="${escapeHtml(app.name)}" class="app-card-image" onerror="this.src='https://placehold.co/300x200/cccccc/white?text=No+Image'">
            <div class="app-card-content">
                <h3 class="app-card-title">${escapeHtml(app.name)}</h3>
                <p class="app-card-description">${escapeHtml((app.description || '').substring(0, 80))}${(app.description || '').length > 80 ? '...' : ''}</p>
                <div class="app-card-meta">
                    <span>📥 ${app.downloads || 0}</span>
                    <span>💾 ${escapeHtml(app.size || 'غير محدد')}</span>
                    <span>📌 ${escapeHtml(app.version || '1.0')}</span>
                </div>
                <div class="app-card-meta">
                    <span class="app-card-rating">${stars} (${(app.rating || 0).toFixed(1)})</span>
                    <span>${getCategoryIcon(app.category)} ${getCategoryName(app.category)}</span>
                </div>
                <button class="app-card-download" onclick="event.stopPropagation(); downloadApp(${app.id})">📥 تحميل</button>
            </div>
        </div>
    `;
}

// ========== تنزيل التطبيق ==========
async function downloadApp(appId) {
    const app = apps.find(a => a.id === appId);
    if (!app) return;
    
    // عرض إعلان عند النقر
    showClickAd();
    
    // زيادة عدد التحميلات
    app.downloads = (app.downloads || 0) + 1;
    await saveApps();
    
    // فتح رابط التحميل
    if (app.downloadLink && app.downloadLink.startsWith('http')) {
        window.open(app.downloadLink, '_blank');
    } else {
        showAlert('رابط التحميل غير صالح', 'error');
    }
}

// ========== الاشتراك في النشرة البريدية ==========
function subscribeNewsletter() {
    const emailInput = document.getElementById('newsletterEmail');
    if (!emailInput) return;
    
    const email = emailInput.value.trim();
    if (email && email.includes('@')) {
        let subscribers = JSON.parse(localStorage.getItem('newsletter') || '[]');
        if (!subscribers.includes(email)) {
            subscribers.push(email);
            localStorage.setItem('newsletter', JSON.stringify(subscribers));
            showAlert('✅ تم الاشتراك في النشرة البريدية بنجاح', 'success');
            emailInput.value = '';
        } else {
            showAlert('هذا البريد مشترك بالفعل', 'info');
        }
    } else {
        showAlert('يرجى إدخال بريد إلكتروني صحيح', 'error');
    }
}

// ========== تهيئة الصفحة ==========
async function initCommon() {
    await loadApps();
    loadCurrentUser();
    updateNavBar();
    renderAds(); // عرض الإعلانات تلقائياً
    
    // تحديث كل 30 ثانية
    setInterval(async () => {
        await loadApps();
        updateNavBar();
        renderAds(); // تحديث الإعلانات
    }, 30000);
}

// بدء التشغيل
initCommon();

// جعل الدوال متاحة عالمياً
window.showAlert = showAlert;
window.escapeHtml = escapeHtml;
window.getCategoryName = getCategoryName;
window.getCategoryIcon = getCategoryIcon;
window.isAdmin = isAdmin;
window.isModerator = isModerator;
window.hasPermission = hasPermission;
window.logout = logout;
window.downloadApp = downloadApp;
window.subscribeNewsletter = subscribeNewsletter;
window.closeAdModal = closeAdModal;
window.showClickAd = showClickAd;
window.renderAds = renderAds;