// home.js - الصفحة الرئيسية

function displayAppsGrid(list, containerId) {
    let container = document.getElementById(containerId);
    if(!container) {
        console.log(`⚠️ العنصر ${containerId} غير موجود`);
        return;
    }
    
    if(!list || list.length === 0) {
        container.innerHTML = '<div class="loading-skeleton">📱 لا توجد تطبيقات حالياً</div>';
        return;
    }
    
    console.log(`📱 عرض ${list.length} تطبيق في ${containerId}`);
    container.innerHTML = list.map(app => createAppCard(app)).join('');
}

function displayHomeContent() {
    console.log('🔄 عرض المحتوى الرئيسي...');
    console.log(`📱 عدد التطبيقات الكلي: ${apps.length}`);
    
    if(!apps || apps.length === 0) {
        document.getElementById('latestApps').innerHTML = '<div class="loading-skeleton">📱 لا توجد تطبيقات حالياً</div>';
        document.getElementById('mostDownloadedApps').innerHTML = '<div class="loading-skeleton">📱 لا توجد تطبيقات حالياً</div>';
        document.getElementById('topRatedApps').innerHTML = '<div class="loading-skeleton">📱 لا توجد تطبيقات حالياً</div>';
        return;
    }
    
    let latestApps = [...apps].reverse().slice(0, 6);
    let mostDownloaded = [...apps].sort((a,b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 6);
    let topRated = [...apps].sort((a,b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6);
    
    displayAppsGrid(latestApps, 'latestApps');
    displayAppsGrid(mostDownloaded, 'mostDownloadedApps');
    displayAppsGrid(topRated, 'topRatedApps');
    
    console.log('✅ تم عرض المحتوى الرئيسي بنجاح');
}

let homeCheckInterval = setInterval(function() {
    if (typeof apps !== 'undefined' && apps.length > 0) {
        clearInterval(homeCheckInterval);
        console.log('✅ تم تحميل التطبيقات، بدء عرض الصفحة الرئيسية');
        displayHomeContent();
    } else if (typeof apps !== 'undefined' && apps.length === 0) {
        clearInterval(homeCheckInterval);
        console.log('⚠️ لا توجد تطبيقات، عرض رسالة فارغة');
        displayHomeContent();
    } else {
        console.log('⏳ انتظار تحميل التطبيقات...');
        if(document.getElementById('latestApps') && document.getElementById('latestApps').innerHTML === '') {
            document.getElementById('latestApps').innerHTML = '<div class="loading-skeleton">🔄 جاري تحميل التطبيقات...</div>';
            document.getElementById('mostDownloadedApps').innerHTML = '<div class="loading-skeleton">🔄 جاري تحميل التطبيقات...</div>';
            document.getElementById('topRatedApps').innerHTML = '<div class="loading-skeleton">🔄 جاري تحميل التطبيقات...</div>';
        }
    }
}, 500);