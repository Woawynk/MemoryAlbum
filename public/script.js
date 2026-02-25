// ============================================
// CONSTANTS & CONFIG
// ============================================
// TODO: Bạn cần lấy Client ID từ Google Cloud Console để tính năng upload hoạt động
const GOOGLE_CLIENT_ID = "831264641769-anqogj5ov2mdmarq5in18naunfkspd6a.apps.googleusercontent.com"; 
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const DRIVE_FOLDER_NAME = "AlbumMemory";

// ============================================
// FIREBASE INITIALIZATION & AUTH
// ============================================

let currentAlbumId = null;
let isAdmin = false;

// Admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'van1508';

// Initialize Firebase (assumes firebase-config.js is loaded)
let db;
try {
    db = firebase.firestore();
} catch (e) {
    console.error("Firebase Init Error:", e);
    if (e.code === 'app-compat/no-app') {
        alert("⚠️ Lỗi: Trang web đang chạy phiên bản cũ hoặc thiếu cấu hình. Vui lòng nhấn Ctrl + F5 để tải lại!");
    }
    throw e; // Dừng chương trình để tránh lỗi tiếp theo
}

// Google Drive state
let tokenClient;
let gapiInited = false;
let gisInited = false;
let driveAccessToken = null;

// Helper: Get direct Drive image URL
function getDriveImageUrl(fileId) {
    if (!fileId) return null;
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
}

// Update UI based on login state
function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const userSection = document.getElementById('userSection');
    const userEmail = document.getElementById('userEmail');
    const fabBtn = document.getElementById('fabBtn');

    // Luôn hiển thị nội dung chính và nút upload
    document.getElementById('mainContent').classList.remove('hidden');
    if (fabBtn) fabBtn.classList.remove('hidden');

    if (isAdmin) {
        // Admin Mode
        if (loginBtn) loginBtn.style.display = 'none';
        if (userSection) userSection.style.display = 'block';
        if (userEmail) userEmail.textContent = 'Admin';
        document.getElementById('authModal').classList.add('hidden');
    } else {
        // Guest Mode
        if (loginBtn) loginBtn.style.display = 'block';
        if (userSection) userSection.style.display = 'none';
    }
}

// ============================================
// APP INITIALIZATION
// ============================================

// Khởi chạy ứng dụng ngay lập tức
window.addEventListener('DOMContentLoaded', () => {
    updateAuthUI(); // Set default UI (Guest)
    loadAlbums();   // Load data
    
    // Init Google Drive API
    gapiLoaded();
    gisLoaded();
});

// ============================================
// GOOGLE DRIVE API INITIALIZATION
// ============================================

function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
    });
    gapiInited = true;
}

function gisLoaded() {
    console.log("Initing GIS...");
    if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
        console.warn("Google GIS library not ready yet. Retrying in 1s...");
        setTimeout(gisLoaded, 1000);
        return;
    }
    if (tokenClient) return; // Already inited

    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: DRIVE_SCOPE,
        callback: (resp) => {
            console.log("Global GSI Callback triggered:", resp);
            if (tokenClient.onTokenCallback) {
                tokenClient.onTokenCallback(resp);
            }
        },
    });
    gisInited = true;
    console.log("GIS Inited successfully.");
}

async function getDriveToken() {
    console.log("Requesting Drive Token...");

    // Warn if mismatching common localhost variations
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        console.warn("Lưu ý: Bạn đang dùng origin:", window.location.origin);
    }

    if (!gisInited) {
        gisLoaded();
    }

    // Wait for inited status if called too early
    for (let i = 0; i < 5; i++) {
        if (gisInited && tokenClient) break;
        console.log("Waiting for GIS initialization...");
        await new Promise(r => setTimeout(r, 1000));
    }

    if (!tokenClient) {
        throw new Error("Thư viện Google chưa nạp xong. Hãy đợi vài giây rồi thử lại.");
    }

    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            const uploadStatus = document.getElementById('uploadStatus');
            if (uploadStatus && uploadStatus.textContent.includes('khởi tạo')) {
                uploadStatus.innerHTML = '⚠️ Nếu không thấy popup, hãy kiểm tra: <br>1. Trình duyệt có chặn popup không? (Góc trên phải)<br>2. Bạn đã nhấn "Cấp lại quyền" chưa?<br>3. Mở Console (nhấn F12) xem có lỗi đỏ không?';
            }
        }, 4000);

        try {
            tokenClient.onTokenCallback = (resp) => {
                clearTimeout(timeoutId);
                console.log("Token Response received:", resp);
                if (resp.error !== undefined) {
                    reject(resp);
                    return;
                }
                driveAccessToken = resp.access_token;
                resolve(resp.access_token);
            };

            tokenClient.requestAccessToken({ prompt: 'consent' });
        } catch (err) {
            clearTimeout(timeoutId);
            console.error("requestAccessToken exception:", err);
            reject(err);
        }
    });
}

function clearDriveAuth() {
    driveAccessToken = null;
    alert("Đã xóa cache xác thực. Hãy nhấn 'Tải Lên' lần nữa.");
}

// ============================================
// AUTH FUNCTIONS
// ============================================

function openLoginModal() {
    document.getElementById('authModal').classList.remove('hidden');
}

function closeLoginModal() {
    document.getElementById('authModal').classList.add('hidden');
}

// ============================================
// UPLOAD MODAL
// ============================================

function openUploadModal() {
    const newAlbumInput = document.getElementById('newAlbumName');
    const albumSelect = document.getElementById('albumSelect');
    const albumSelectGroup = albumSelect.parentElement; // The .form-group
    const uploadModalTitle = document.getElementById('uploadModalTitle');

    if (currentAlbumId) {
        // Inside an album — hide album selector
        uploadModalTitle.textContent = 'Thêm vào: ' + document.getElementById('albumTitle').textContent;
        albumSelectGroup.style.display = 'none';
        newAlbumInput.style.display = 'none';
    } else {
        // Not inside an album - show selector and populate it
        uploadModalTitle.textContent = 'Thêm Ảnh/Video';
        albumSelectGroup.style.display = 'block';
        newAlbumInput.style.display = 'none'; // Hide new album name input initially
        populateAlbumSelector();
    }

    document.getElementById('description').value = '';
    document.getElementById('uploadStatus').textContent = '';
    document.getElementById('selectedFilesPreview').textContent = '';
    document.getElementById('fileInput').value = '';
    document.getElementById('uploadModal').classList.remove('hidden');
}

async function populateAlbumSelector() {
    const albumSelect = document.getElementById('albumSelect');
    albumSelect.innerHTML = '<option value="">Đang tải album...</option>';

    try {
        const snapshot = await db.collection('albums').orderBy('createdAt', 'desc').get();
        albumSelect.innerHTML = ''; // Clear loading text

        // Add option to create a new album
        albumSelect.innerHTML += `<option value="_new_">--- Tạo Album Mới ---</option>`;

        if (!snapshot.empty) {
            snapshot.forEach(doc => {
                const album = doc.data();
                albumSelect.innerHTML += `<option value="${doc.id}">${album.name}</option>`;
            });
        }
    } catch (error) {
        console.error("Error populating album selector:", error);
        albumSelect.innerHTML = '<option value="">Lỗi tải album</option>';
    }
}

function closeUploadModal() {
    document.getElementById('uploadModal').classList.add('hidden');
}

// Close upload modal when clicking backdrop
document.getElementById('uploadModal').addEventListener('click', function (e) {
    if (e.target === this) closeUploadModal();
});

// Login
document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    // Simple hardcoded check
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        isAdmin = true;
        document.getElementById('loginError').textContent = '';
        updateAuthUI();
        loadAlbums(); // Reload to show delete buttons
        document.getElementById('loginForm').reset();
    } else {
        document.getElementById('loginError').textContent = 'Sai tên đăng nhập hoặc mật khẩu!';
    }
});

// Logout
function logout() {
    isAdmin = false;
    updateAuthUI();
    loadAlbums(); // Reload to hide delete buttons
}

// Listen for album selection changes
document.getElementById('albumSelect').addEventListener('change', e => {
    const newAlbumInput = document.getElementById('newAlbumName');
    if (e.target.value === '_new_') {
        newAlbumInput.style.display = 'block';
        newAlbumInput.value = '';
        newAlbumInput.focus();
    } else {
        newAlbumInput.style.display = 'none';
    }
});
// ============================================
// ALBUM FUNCTIONS
// ============================================

async function loadAlbums() {
    const albumList = document.getElementById('albumList');
    albumList.innerHTML = '<p>Đang tải albums...</p>';

    try {
        const snapshot = await db.collection('albums')
            .orderBy('createdAt', 'desc')
            .get();

        albumList.innerHTML = '';

        if (snapshot.empty) {
            albumList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Chưa có album nào. Hãy tạo album đầu tiên!</p>';
            return;
        }

        for (const doc of snapshot.docs) {
            const album = doc.data();
            const albumCard = document.createElement('div');
            albumCard.className = 'album-card';
            albumCard.onclick = () => openAlbum(doc.id, album.name);

            // Try to get the latest file for the thumbnail
            let thumbnailHtml = '<div class="album-thumbnail">📁</div>';
            try {
                const latestFile = await db.collection('files')
                    .where('albumId', '==', doc.id)
                    .orderBy('uploadedAt', 'desc')
                    .limit(1)
                    .get();

                if (!latestFile.empty) {
                    const fileData = latestFile.docs[0].data();
                    const thumbUrl = getDriveImageUrl(fileData.driveId);
                    if (thumbUrl) {
                        thumbnailHtml = `<img src="${thumbUrl}" class="album-thumbnail-img" alt="${album.name}" onerror="this.src='https://via.placeholder.com/300?text=Error'">`;
                    }
                }
            } catch (e) { console.error("Could not load thumbnail", e); }
            
            // Add delete button for admins
            const deleteButtonHtml = isAdmin ? `
                <button
                    class="btn album-delete-btn"
                    title="Xoá Album"
                    onclick="deleteAlbum('${doc.id}'); event.stopPropagation();">
                    🗑️
                </button>
            ` : '';
            
            albumCard.innerHTML = `
                ${deleteButtonHtml}
                ${thumbnailHtml}
                <div class="album-card-content">
                    <div class="album-card-title">${album.name}</div>
                    <div class="album-card-info">
                        ${album.fileCount || 0} items
                    </div>
                </div>
            `;
            albumList.appendChild(albumCard);
        }
    } catch (error) {
        console.error('Lỗi khi tải albums:', error);
        albumList.innerHTML = '<p style="color: red;">Lỗi khi tải albums!</p>';
    }
}

async function deleteAlbum(albumId) {
    if (!isAdmin) {
        alert("Chỉ admin mới có quyền xoá album.");
        return;
    }

    if (!confirm('Bạn có chắc muốn xoá vĩnh viễn album này? Tất cả ảnh/video bên trong cũng sẽ bị xoá! Hành động này không thể hoàn tác.')) return;

    // Show a loading indicator by reducing opacity
    const albumCard = document.querySelector(`[onclick*="deleteAlbum('${albumId}')"]`).closest('.album-card');
    if (albumCard) {
        albumCard.style.pointerEvents = 'none';
        albumCard.style.opacity = '0.5';
    }

    try {
        const albumRef = db.collection('albums').doc(albumId);
        const albumDoc = await albumRef.get();
        if (!albumDoc.exists) {
            console.warn("Album to delete not found in Firestore.");
            loadAlbums(); // Refresh UI
            return;
        }
        const albumData = albumDoc.data();

        // Ensure we have a Drive token if we need to delete a folder
        if (albumData.driveFolderId && !driveAccessToken) {
            console.log("Cần quyền truy cập Drive để xoá thư mục. Yêu cầu token...");
            await getDriveToken();
        }

        // 1. Delete the folder on Drive (this deletes all files inside)
        if (gapiInited && driveAccessToken && albumData.driveFolderId) {
            console.log(`Attempting to delete Drive folder: ${albumData.driveFolderId}`);
            try {
                await gapi.client.drive.files.delete({
                    fileId: albumData.driveFolderId
                });
                console.log("Deleted album folder from Drive");
            } catch (e) {
                console.error("Could not delete folder from Drive, it might already be deleted or permissions are missing.", e);
                // Don't stop the process, just log the error. The folder might not exist or be accessible.
            }
        }

        // 2. Delete file records from Firestore
        const filesSnapshot = await db.collection('files').where('albumId', '==', albumId).get();
        const batch = db.batch();
        if (!filesSnapshot.empty) {
            filesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            console.log(`Deleted ${filesSnapshot.size} file documents from Firestore.`);
        }

        // 3. Delete album record from Firestore
        await albumRef.delete();
        console.log("Album document deleted from Firestore. Reloading albums.");
        loadAlbums();
    } catch (error) {
        alert('Lỗi khi xoá album: ' + error.message);
        // Restore UI on error
        if (albumCard) {
            albumCard.style.pointerEvents = 'auto';
            albumCard.style.opacity = '1';
        }
    }
}

function openAlbum(albumId, albumName) {
    console.log("Opening album:", albumId, albumName);
    currentAlbumId = albumId;

    const titleEl = document.getElementById('albumTitle');
    const albumSec = document.getElementById('albumSection');
    const filesSec = document.getElementById('filesSection');

    if (titleEl) titleEl.textContent = albumName;
    if (albumSec) {
        albumSec.classList.add('hidden');
        albumSec.style.display = 'none'; // Đảm bảo ẩn
    }
    if (filesSec) {
        filesSec.classList.remove('hidden');
        filesSec.style.display = ''; // Xóa inline style để hiện theo CSS
    }

    loadFiles(albumId);
}

function goBackToAlbums() {
    console.log("Đang quay lại danh sách album...");
    currentAlbumId = null;
    const albumSec = document.getElementById('albumSection');
    const filesSec = document.getElementById('filesSection');

    if (albumSec) {
        albumSec.classList.remove('hidden');
        albumSec.style.display = ''; // Hiện lại album list
    }
    if (filesSec) {
        filesSec.classList.add('hidden');
        filesSec.style.display = 'none'; // Đảm bảo ẩn file list
    }

    loadAlbums();
}

// ============================================
// FILE FUNCTIONS
// ============================================

async function loadFiles(albumId) {
    const filesList = document.getElementById('filesList');
    filesList.innerHTML = '<p>Đang tải files...</p>';

    try {
        const snapshot = await db.collection('files')
            .where('albumId', '==', albumId)
            .orderBy('uploadedAt', 'desc')
            .get();

        filesList.innerHTML = '';

        if (snapshot.empty) {
            filesList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Album trống</p>';
            return;
        }

        snapshot.forEach(doc => {
            const file = doc.data();
            const displayUrl = getDriveImageUrl(file.driveId);

            // Chỉ hiện nút xoá ảnh nếu là Admin
            const deleteBtnHtml = isAdmin ? `<button class="btn btn-delete file-btn" onclick="event.stopPropagation(); deleteFile('${doc.id}', '${file.driveId}')" title="Xoá">🗑️</button>` : '';

            const fileCard = document.createElement('div');
            fileCard.className = 'file-card';
            fileCard.innerHTML = `
                <img src="${displayUrl}" class="file-thumbnail" alt="${file.name}" onclick="viewFile('${file.url}')" onerror="this.parentElement.innerHTML='<div style=padding:40px;text-align:center>⚠️ Không thể tải ảnh.</div>'">
                <div class="file-card-overlay">
                    ${deleteBtnHtml}
                </div>
                <div class="file-info">
                    <span style="font-size: 11px; color: #888;">${file.uploadedAt ? new Date(file.uploadedAt.toDate()).toLocaleDateString() : 'N/A'}</span>
                    <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 11px;" onclick="viewFile('${file.url}')">View</button>
                </div>
            `;
            filesList.appendChild(fileCard);
        });
    } catch (error) {
        console.error('Lỗi khi tải files:', error);
        filesList.innerHTML = '<p style="color: red;">Lỗi khi tải files!</p>';
    }
}

function viewFile(url) {
    window.open(url, '_blank');
}

async function deleteFile(fileId, driveId) {
    if (!isAdmin) {
        alert("Chỉ Admin mới có quyền xoá ảnh!");
        return;
    }

    if (!confirm('Bạn có chắc muốn xoá file này?')) return;

    try {
        if (gapiInited && driveAccessToken) {
            await gapi.client.drive.files.delete({
                fileId: driveId
            });
        }
        await db.collection('files').doc(fileId).delete();

        // Update file count
        const albumRef = db.collection('albums').doc(currentAlbumId);
        const albumDoc = await albumRef.get();
        if (albumDoc.exists) {
            await albumRef.update({
                fileCount: (albumDoc.data().fileCount || 1) - 1
            });
        }

        loadFiles(currentAlbumId);
    } catch (error) {
        alert('Lỗi khi xoá file: ' + error.message);
    }
}

// ============================================
// FILE UPLOAD
// ============================================

const uploadArea = document.getElementById('uploadArea');

document.getElementById('fileInput').addEventListener('change', e => {
    const files = e.target.files;
    const preview = document.getElementById('selectedFilesPreview');
    if (files.length > 0) {
        preview.textContent = `✅ Đã chọn ${files.length} file`;
    } else {
        preview.textContent = '';
    }
});

uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('drop', handleDrop);

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    document.getElementById('fileInput').files = files;
}

// ============================================
// IMAGE COMPRESSION
// ============================================

/**
 * Compress an image file using Canvas API.
 * Max dimension: 1920px. Quality: 80% JPEG.
 * Videos are returned as-is.
 */
function compressImage(file, maxSize = 1920, quality = 0.8) {
    return new Promise((resolve) => {
        // Skip compression for non-image files
        if (!file.type.startsWith('image/')) {
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let { width, height } = img;

                // Scale down if needed
                if (width > maxSize || height > maxSize) {
                    if (width > height) {
                        height = Math.round((height * maxSize) / width);
                        width = maxSize;
                    } else {
                        width = Math.round((width * maxSize) / height);
                        height = maxSize;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        const compressed = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });
                        resolve(compressed);
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// ============================================
// GOOGLE DRIVE UPLOAD LOGIC
// ============================================

async function getOrCreateDriveFolder(folderName, parentId = null) {
    console.log(`Checking/Creating folder: ${folderName} (parent: ${parentId || 'root'})`);

    let query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    if (parentId) {
        query += ` and '${parentId}' in parents`;
    } else {
        query += ` and 'root' in parents`;
    }

    try {
        const response = await gapi.client.drive.files.list({
            q: query,
            spaces: 'drive',
            fields: 'files(id, name)'
        });

        if (response.result.files && response.result.files.length > 0) {
            const foundId = response.result.files[0].id;
            console.log(`Folder found: ${folderName} ID: ${foundId}`);
            return foundId;
        }

        console.log(`Folder not found, creating: ${folderName}`);
        const folderMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: parentId ? [parentId] : ['root']
        };

        const folder = await gapi.client.drive.files.create({
            resource: folderMetadata,
            fields: 'id'
        });

        console.log(`Folder created: ${folderName} ID: ${folder.result.id}`);
        return folder.result.id;
    } catch (error) {
        console.error(`Error in getOrCreateDriveFolder for ${folderName}:`, error);
        throw error;
    }
}

async function uploadToDrive(file, folderId) {
    const metadata = {
        name: `${Date.now()}_${file.name}`,
        parents: [folderId]
    };

    const formData = new FormData();
    formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    formData.append("file", file);

    const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webContentLink,thumbnailLink", {
        method: "POST",
        headers: new Headers({ "Authorization": "Bearer " + driveAccessToken }),
        body: formData
    });
    const result = await response.json();
    if (result.error) {
        console.error("Drive upload error detail:", result.error);
        throw new Error("Drive upload failed: " + (result.error.message || JSON.stringify(result.error)));
    }

    // Set permission to anyone with link can view
    await gapi.client.drive.permissions.create({
        fileId: result.id,
        resource: {
            role: 'reader',
            type: 'anyone'
        }
    });

    return result;
}

async function uploadFiles() {
    // Xác định người dùng (nếu không đăng nhập thì là anonymous)
    const userId = isAdmin ? 'admin' : 'anonymous';
    const userEmail = isAdmin ? 'Admin' : 'Guest';

    const files = document.getElementById('fileInput').files;
    const description = document.getElementById('description').value.trim();
    const albumSelect = document.getElementById('albumSelect');

    let albumIdToUse = currentAlbumId; // Use current album if inside one
    let albumNameToUse;

    if (!albumIdToUse) { // Not inside an album, use the selector
        const selectedValue = albumSelect.value;
        if (selectedValue === '_new_') {
            albumNameToUse = document.getElementById('newAlbumName').value.trim();
            if (!albumNameToUse) {
                alert('Vui lòng nhập tên cho album mới!');
                return;
            }
        } else if (selectedValue) {
            albumIdToUse = selectedValue;
            albumNameToUse = albumSelect.options[albumSelect.selectedIndex].text;
        } else {
            alert('Vui lòng chọn một album hoặc tạo album mới!');
            return;
        }
    } else {
        albumNameToUse = document.getElementById('albumTitle').textContent;
    }

    if (files.length === 0) {
        alert('Vui lòng chọn ảnh hoặc video!');
        return;
    }

    const uploadStatus = document.getElementById('uploadStatus');
    uploadStatus.textContent = 'Đang khởi tạo kết nối Drive...';

    try {
        // Ensure we have a Drive token
        if (!driveAccessToken) {
            await getDriveToken();
        }

        const rootFolderId = await getOrCreateDriveFolder(DRIVE_FOLDER_NAME);
        if (!rootFolderId) throw new Error("Could not find or create root folder 'AlbumMemory'");

        // Create or get album in Firestore
        let finalAlbumId = albumIdToUse;
        let albumDriveFolderId = null;

        // If we have an ID, get the folder ID from it
        if (finalAlbumId) {
            const albumDoc = await db.collection('albums').doc(finalAlbumId).get();
            if (albumDoc.exists) {
                albumDriveFolderId = albumDoc.data().driveFolderId;
            } else {
                finalAlbumId = null; // Album was deleted, so we'll create a new one
            }
        } else {
            // We only have a name, so check if it exists
            const albumSnapshot = await db.collection('albums')
                .where('name', '==', albumNameToUse)
                .limit(1)
                .get();

            if (!albumSnapshot.empty) {
                const albumDoc = albumSnapshot.docs[0];
                finalAlbumId = albumDoc.id;
                albumDriveFolderId = albumDoc.data().driveFolderId;
            }
        }

        // Verify/Create album folder in Drive
        if (albumDriveFolderId) {
            try {
                await gapi.client.drive.files.get({ fileId: albumDriveFolderId });
            } catch (e) {
                console.warn("Existing Drive folder ID invalid or inaccessible, will re-create", e);
                albumDriveFolderId = null;
            }
        }

        if (!albumDriveFolderId) {
            uploadStatus.textContent = `📁 Đang tạo thư mục album trên Drive...`;
            albumDriveFolderId = await getOrCreateDriveFolder(albumNameToUse, rootFolderId);

            if (finalAlbumId) {
                await db.collection('albums').doc(finalAlbumId).update({ driveFolderId: albumDriveFolderId });
            } else {
                const newAlbum = await db.collection('albums').add({
                    name: albumNameToUse,
                    description: description,
                    userId: userId,
                    driveFolderId: albumDriveFolderId,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    fileCount: 0
                });
                finalAlbumId = newAlbum.id;
            }
        }

        // Upload files
        let uploadedCount = 0;
        for (const file of files) {
            // Compress images before upload
            const isImage = file.type.startsWith('image/');
            if (isImage) {
                uploadStatus.textContent = `⏳ Đang nén ảnh (${uploadedCount + 1}/${files.length})...`;
            }
            const fileToUpload = isImage ? await compressImage(file) : file;

            uploadStatus.textContent = `☁️ Đang upload lên Drive (${uploadedCount + 1}/${files.length})...`;

            const driveResult = await uploadToDrive(fileToUpload, albumDriveFolderId);

            // Generate a direct link if possible, or use webContentLink
            // thumbnailLink is often small, webContentLink is a download link
            const viewUrl = driveResult.webContentLink.replace('&export=download', '');

            await db.collection('files').add({
                albumId: finalAlbumId,
                url: viewUrl,
                driveId: driveResult.id,
                name: file.name,
                type: file.type,
                size: file.size,
                uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
                uploadedBy: userEmail,
                thumbnail: driveResult.thumbnailLink || viewUrl
            });

            uploadedCount++;
        }

        // Update album file count
        const albumRef = db.collection('albums').doc(finalAlbumId);
        const albumDoc = await albumRef.get();
        await albumRef.update({
            fileCount: (albumDoc.data().fileCount || 0) + uploadedCount
        });

        uploadStatus.textContent = `✅ Tải lên ${uploadedCount} file thành công!`;
        document.getElementById('newAlbumName').value = '';
        document.getElementById('selectedFilesPreview').textContent = '';

        setTimeout(() => {
            uploadStatus.textContent = '';
            closeUploadModal();
            if (currentAlbumId) {
                loadFiles(currentAlbumId);
            } else {
                loadAlbums();
            }
        }, 1500);
    } catch (error) {
        console.error('Upload error details:', error);
        let msg = error.message;

        if (!msg) {
            if (error.error === "popup_blocked_by_browser") {
                msg = "Trình duyệt đã chặn popup. Hãy bật popup cho trang này.";
            } else if (error.error === "access_denied") {
                msg = "Bạn đã từ chối cấp quyền truy cập Drive.";
            } else if (typeof error === 'object') {
                msg = JSON.stringify(error);
            } else {
                msg = "Xác thực Drive thất bại";
            }
        }

        document.getElementById('uploadStatus').textContent = '❌ Lỗi: ' + msg;
    }
}
