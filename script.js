// Replace with your actual Google API Client ID and Album ID
const CLIENT_ID = '976167542273-7gr73u90201fh3n9agsip6une7d9cb2k.apps.googleusercontent.com';
const ALBUM_ID = 'AF1QipPtOEYUJ4-o0FUg6aErVc3D5xvGeB2wLJ2GhHYS';

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const REDIRECT_URI = window.location.origin; // Current origin
const SCOPES = 'https://www.googleapis.com/auth/photoslibrary.readonly';

const galleryDiv = document.getElementById('gallery');
const icecreamCountSpan = document.getElementById('icecream-count');
const photoModal = document.getElementById('photo-modal');
const modalImage = document.getElementById('modal-image');
const photoDescription = document.getElementById('photo-description');
const photoCreationTime = document.getElementById('photo-creation-time');
const photoCameraModel = document.getElementById('photo-camera-model');
const photoDimensions = document.getElementById('photo-dimensions');
const closeButton = document.querySelector('.close-button');

let accessToken = null;

// PKCE helper functions
function dec2hex(dec) {
    return ('0' + dec.toString(16)).substr(-2);
}

function generateCodeVerifier() {
    const array = new Uint32Array(56 / 2);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec2hex).join('');
}

function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
}

function base64urlencode(a) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(a)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

async function generateCodeChallengeFromVerifier(v) {
    const hashed = await sha256(v);
    return base64urlencode(hashed);
}

async function authenticate() {
    const codeVerifier = generateCodeVerifier();
    sessionStorage.setItem('code_verifier', codeVerifier);
    const codeChallenge = await generateCodeChallengeFromVerifier(codeVerifier);

    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope: SCOPES,
        access_type: 'offline',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
    });

    window.location.href = `${AUTH_URL}?${params.toString()}`;
}

async function handleAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const storedCodeVerifier = sessionStorage.getItem('code_verifier');

    if (code && storedCodeVerifier) {
        const params = new URLSearchParams({
            client_id: CLIENT_ID,
            code: code,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code',
            code_verifier: storedCodeVerifier
        });

        try {
            const response = await fetch(TOKEN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params.toString()
            });
            const data = await response.json();
            if (data.access_token) {
                accessToken = data.access_token;
                sessionStorage.setItem('access_token', accessToken);
                // Clear URL parameters
                window.history.replaceState({}, document.title, REDIRECT_URI);
                fetchPhotos();
            } else {
                console.error('Failed to get access token:', data);
                alert('認証に失敗しました。');
            }
        } catch (error) {
            console.error('Error exchanging code for token:', error);
            alert('認証中にエラーが発生しました。');
        }
    } else if (sessionStorage.getItem('access_token')) {
        accessToken = sessionStorage.getItem('access_token');
        fetchPhotos();
    } else {
        authenticate();
    }
}

async function fetchPhotos() {
    if (!accessToken) {
        console.error('Access token not available.');
        return;
    }

    const photos = [];
    let nextPageToken = null;

    try {
        do {
            const response = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems:search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    albumId: ALBUM_ID,
                    pageSize: 100, // Max page size
                    pageToken: nextPageToken
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.error('Unauthorized: Access token expired or invalid. Re-authenticating...');
                    sessionStorage.removeItem('access_token');
                    authenticate();
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.mediaItems) {
                photos.push(...data.mediaItems);
            }
            nextPageToken = data.nextPageToken;
        } while (nextPageToken);

        displayPhotos(photos);
    } catch (error) {
        console.error('Error fetching photos:', error);
        alert('写真の取得中にエラーが発生しました。');
    }
}

function displayPhotos(photos) {
    galleryDiv.innerHTML = ''; // Clear existing photos
    icecreamCountSpan.textContent = `食べたアイスの数：${photos.length}個`;

    photos.forEach(photo => {
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('gallery-item');

        const img = document.createElement('img');
        img.src = `${photo.baseUrl}=w250-h250-c`; // Optimized for gallery view
        img.alt = photo.description || 'Ice Cream Photo';
        img.dataset.fullSizeUrl = photo.baseUrl;
        img.dataset.description = photo.description || 'N/A';
        img.dataset.creationTime = new Date(photo.mediaMetadata.creationTime).toLocaleString() || 'N/A';
        img.dataset.cameraModel = photo.mediaMetadata.cameraModel || 'N/A';
        img.dataset.width = photo.mediaMetadata.width || 'N/A';
        img.dataset.height = photo.mediaMetadata.height || 'N/A';

        imgContainer.appendChild(img);
        galleryDiv.appendChild(imgContainer);

        imgContainer.addEventListener('click', () => openModal(img));
    });
}

function openModal(imgElement) {
    modalImage.src = imgElement.dataset.fullSizeUrl;
    photoDescription.textContent = imgElement.dataset.description;
    photoCreationTime.textContent = imgElement.dataset.creationTime;
    photoCameraModel.textContent = imgElement.dataset.cameraModel;
    photoDimensions.textContent = `${imgElement.dataset.width} x ${imgElement.dataset.height}`;
    photoModal.style.display = 'block';
}

closeButton.addEventListener('click', () => {
    photoModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === photoModal) {
        photoModal.style.display = 'none';
    }
});

// Initial call to handle authentication flow
handleAuthCallback();
