const Storage = {
    db: null,
    init: async () => {
        return new Promise((resolve) => {
            const request = indexedDB.open("RealOS_MusicDB", 1);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('songs')) db.createObjectStore('songs', { keyPath: 'id', autoIncrement: true });
            };
            request.onsuccess = (e) => { Storage.db = e.target.result; resolve(); };
        });
    },
    saveSong: (song) => {
        if (!Storage.db) return;
        const tx = Storage.db.transaction(['songs'], 'readwrite');
        tx.objectStore('songs').add(song);
    },
    removeSong: (id) => {
        if (!Storage.db) return;
        const tx = Storage.db.transaction(['songs'], 'readwrite');
        tx.objectStore('songs').delete(id);
    },
    loadSongs: () => {
        return new Promise((resolve) => {
            if (!Storage.db) resolve([]);
            const tx = Storage.db.transaction(['songs'], 'readonly');
            const req = tx.objectStore('songs').getAll();
            req.onsuccess = () => resolve(req.result);
        });
    },
    saveSongs: (songs) => {
        if (!Storage.db) return Promise.resolve();
        return new Promise((resolve) => {
            const tx = Storage.db.transaction(['songs'], 'readwrite');
            const store = tx.objectStore('songs');
            store.clear();
            songs.forEach(song => {
                store.add(song);
            });
            tx.oncomplete = () => resolve();
        });
    },
    updateSong: (song) => {
        if (!Storage.db) return;
        const tx = Storage.db.transaction(['songs'], 'readwrite');
        tx.objectStore('songs').put(song);
    },
    saveSettings: () => {
        const data = {
            darkMode: State.darkMode,
            islandMode: State.islandMode,
            islandColor: State.islandColor,
            tapIndicators: State.tapIndicators,
            brightness: State.brightness,
            currentWall: State.currentWall,
            wallpapers: State.wallpapers,
            security: State.security,
            aod: State.aod,
            lsBlur: State.lsBlur,
            glassUI: State.glassUI,
            iconPositions: State.iconPositions,
            punchHole: State.punchHole,
            musicGradient: State.musicGradient,
            notes: State.notes,
            animationSpeed: State.animationSpeed,
            userProfile: State.userProfile,
            appShape: State.appShape,
            iconPack: State.iconPack,
            swipeToClose: State.swipeToClose,
            homescreenBlur: State.homescreenBlur,
            hideAppLabels: State.hideAppLabels,
            phoneName: State.phoneName,
            lockWall: State.lockWall,
            animConfig: State.animConfig,
            ccToggles: State.ccToggles,
            clockConfig: State.clockConfig,
            emptyApps: State.emptyApps
        };
        localStorage.setItem('realos_settings', JSON.stringify(data));
    },
    loadSettings: () => {
        const data = localStorage.getItem('realos_settings');
        if (data) {
            const parsed = JSON.parse(data);

            const defaultWallpapers = [
                'wallpapers/RealOS 3/wallpaper.png',
                'wallpapers/Oneplus/oneplus wallpaper.jpg',
                'wallpapers/Xiaomi/k80 wallpaper.jpg',
                'wallpapers/Xiaomi/k80 wallpaper2.jpg',
                'wallpapers/Xiaomi/k80 wallpaper3.jpg',
                'wallpapers/Xiaomi/k80 wallpaper 4.jpg',
                'wallpapers/Xiaomi/xiaomi 15 wallpaper.jpg',
                'wallpapers/Xiaomi/xiaomi blue.mp4',
                'wallpapers/Xiaomi/xiaomi orange.mp4',
                'wallpapers/Xiaomi/xiaomi purple.mp4',
                'wallpapers/Xiaomi/xiaomi ultra blue.png',
                'wallpapers/Xiaomi/xiaomi ultra green.png',
                'wallpapers/Xiaomi/xiaomi ultra orange.png',
                'wallpapers/Xiaomi/xiaomi ultra purple.png',
                'wallpapers/OriginOS/origin wallpaper dark.png',
                'wallpapers/OriginOS/origin wallpaper.png',
                'wallpapers/OriginOS/origin wallpaper2.png',
                'wallpapers/OriginOS/origin wallpaper3.png',
                'https://i.ibb.co/9HGWgS4w/wallpaper3.jpg',
                'https://i.ibb.co/FMtRmsm/wallpaper4.png',
                'https://i.ibb.co/ymJxLsYz/wallpaper5.png',
                'https://i.ibb.co/43v4xw9/wallpaper6.png'
            ];

            if (parsed.wallpapers) {
                let savedUrl = null;
                if (typeof parsed.currentWall === 'number' && parsed.wallpapers.length > 0) {

                    if (parsed.currentWall >= 0 && parsed.currentWall < parsed.wallpapers.length) {
                        savedUrl = parsed.wallpapers[parsed.currentWall];
                    }
                }

                parsed.wallpapers = parsed.wallpapers.filter(w => !defaultWallpapers.includes(w));
                parsed.wallpapers.unshift(...defaultWallpapers);

                if (savedUrl) {
                    const newIdx = parsed.wallpapers.indexOf(savedUrl);
                    if (newIdx !== -1) {
                        parsed.currentWall = newIdx;
                    } else {
                        parsed.currentWall = 0;
                    }
                } else {
                    parsed.currentWall = 0;
                }
            }

            if (typeof parsed.lockWall === 'number' && parsed.wallpapers && parsed.wallpapers.length > 0) {
                let savedLockUrl = null;
                if (parsed.lockWall >= 0 && parsed.lockWall < parsed.wallpapers.length) {
                    savedLockUrl = parsed.wallpapers[parsed.lockWall];
                }
                if (savedLockUrl) {
                    const newLockIdx = parsed.wallpapers.indexOf(savedLockUrl);
                    parsed.lockWall = newLockIdx !== -1 ? newLockIdx : parsed.currentWall;
                } else {
                    parsed.lockWall = parsed.currentWall;
                }
            } else if (parsed.wallpapers) {
                parsed.lockWall = parsed.currentWall || 0;
            }

            if (parsed.iconPositions) {
                const firstKey = Object.keys(parsed.iconPositions)[0];
                if (firstKey && parsed.iconPositions[firstKey].left !== undefined) {
                    parsed.iconPositions = {};
                }
            }

            Object.assign(State, parsed);
            if (State.ccToggles) {
                setTimeout(() => {
                    if (State.ccToggles.circles) {
                        document.querySelectorAll('.cc-circle').forEach((el, i) => {
                            if (State.ccToggles.circles[i]) el.classList.add('active');
                            else el.classList.remove('active');
                        });
                    }
                    if (State.ccToggles.tiles) {
                        document.querySelectorAll('.cc-tile[onclick^="ControlCenter.toggleTile"]').forEach((el, i) => {
                            if (State.ccToggles.tiles[i]) el.classList.add('active');
                            else el.classList.remove('active');
                        });
                    }
                }, 10);
            }
            const acDefaults = {
                openIconFade: 0.1, closeIconFade: 1.5, wallBlurDur: 0.12, closeShapeMorph: 0.34, openBezier: [0.2, 0.85, 0.1, 1],
                openScaleBezier: [0.2, 0.85, 0.1, 1], openScaleTime: 0.5, closeBezier: [0.15, 1.01, 0.3, 1.02], openAppZoomOut: 0.95,
                openWallZoom: 1.03, openWallBlur: true, fadeBoxes: false
            };
            if (!State.animConfig) State.animConfig = {};
            Object.keys(acDefaults).forEach(k => { if (State.animConfig[k] === undefined) State.animConfig[k] = acDefaults[k]; });
        }
    }
};
const APPS = [
    { id: 'settings', name: 'Settings', color: '#8e8e93', icon: 'fa-cog', area: 'grid', hyperIcon: 'hyperos_icon/system_settings.png', hyperColor: '#8E8E93', colorIcon: 'coloros_icon/settings.png', colorColor: '#8E8E93' },
    { id: 'music', name: 'Music', color: '#fa2d48', icon: 'fa-music', area: 'grid', hyperIcon: 'hyperos_icon/system_music.png', hyperColor: '#FA2D48', colorIcon: 'coloros_icon/music.png', colorColor: '#FA2D48' },
    { id: 'photos', name: 'Photos', color: '#fff', text: '#000', icon: 'fa-images', area: 'grid', hyperIcon: 'hyperos_icon/system_photos.png', hyperColor: '#FFFFFF', colorIcon: 'coloros_icon/gallery.png', colorColor: '#FFFFFF' },
    { id: 'clock', name: 'Clock', color: '#fff', text: '#000', icon: 'fa-clock', area: 'grid', border: false, hyperIcon: 'hyperos_icon/system_clock.png', hyperColor: '#000000', colorIcon: 'coloros_icon/clock.png', colorColor: '#000000' },
    { id: 'notes', name: 'Notes', color: '#f1c40f', icon: 'fa-sticky-note', area: 'grid', hyperIcon: 'hyperos_icon/system_notes.png', hyperColor: '#F1C40F', colorIcon: 'coloros_icon/notes.png', colorColor: '#F1C40F' },
    { id: 'calc', name: 'Calculator', color: '#000', icon: 'fa-calculator', area: 'grid', border: false, hyperIcon: 'hyperos_icon/system_calculator.png', hyperColor: '#333333', colorIcon: 'coloros_icon/calculator.png', colorColor: '#333333' },
    { id: 'files', name: 'Files', color: '#007aff', icon: 'fa-folder', area: 'grid', hyperIcon: 'hyperos_icon/system_filemanager.png', hyperColor: '#007AFF', colorIcon: 'coloros_icon/files.png', colorColor: '#007AFF' },
    { id: 'camera', name: 'Camera', color: '#333', icon: 'fa-camera', area: 'grid', hyperIcon: 'hyperos_icon/system_camera.png', hyperColor: '#1C1C1E', colorIcon: 'coloros_icon/camera.png', colorColor: '#1C1C1E' },
    { id: 'phone', name: 'Phone', color: '#34c759', icon: 'fa-phone', area: 'dock', hyperIcon: 'hyperos_icon/system_dialer.png', hyperColor: '#4CD964', colorIcon: 'coloros_icon/phone.png', colorColor: '#4CD964' },
    { id: 'messages', name: 'Messages', color: '#34c759', icon: 'fa-comment', area: 'dock', hyperIcon: 'hyperos_icon/system_messages.png', hyperColor: '#4CD964', colorIcon: 'coloros_icon/messages.png', colorColor: '#4CD964' },
    { id: 'safari', name: 'Safari', color: '#007aff', icon: 'fa-compass', area: 'dock', hyperIcon: 'hyperos_icon/system_browser.png', hyperColor: '#007AFF', colorIcon: 'coloros_icon/browser.png', colorColor: '#007AFF' },
    { id: 'mail', name: 'Mail', color: '#007aff', icon: 'fa-envelope', area: 'dock', hyperIcon: 'hyperos_icon/system_mail.png', hyperColor: '#5856D6', colorIcon: 'coloros_icon/mail.png', colorColor: '#5856D6' },

];
const State = {
    activeApp: null,
    isAnimating: false,
    darkMode: false,
    accentColor: '#007aff',
    islandMode: 'clock',
    islandColor: '#000',
    tapIndicators: false,
    brightness: 100,
    wallpapers: [
        'wallpapers/RealOS 3/wallpaper.png',
        'wallpapers/Oneplus/oneplus wallpaper.jpg',
        'wallpapers/Xiaomi/k80 wallpaper.jpg',
        'wallpapers/Xiaomi/k80 wallpaper2.jpg',
        'wallpapers/Xiaomi/k80 wallpaper3.jpg',
        'wallpapers/Xiaomi/k80 wallpaper 4.jpg',
        'wallpapers/Xiaomi/xiaomi 15 wallpaper.jpg',
        'wallpapers/Xiaomi/xiaomi blue.mp4',
        'wallpapers/Xiaomi/xiaomi orange.mp4',
        'wallpapers/Xiaomi/xiaomi purple.mp4',
        'wallpapers/Xiaomi/xiaomi ultra blue.png',
        'wallpapers/Xiaomi/xiaomi ultra green.png',
        'wallpapers/Xiaomi/xiaomi ultra orange.png',
        'wallpapers/Xiaomi/xiaomi ultra purple.png',
        'wallpapers/OriginOS/origin wallpaper dark.png',
        'wallpapers/OriginOS/origin wallpaper.png',
        'wallpapers/OriginOS/origin wallpaper2.png',
        'wallpapers/OriginOS/origin wallpaper3.png',
        'https://i.ibb.co/9HGWgS4w/wallpaper3.jpg',
        'https://i.ibb.co/FMtRmsm/wallpaper4.png',
        'https://i.ibb.co/ymJxLsYz/wallpaper5.png',
        'https://i.ibb.co/43v4xw9/wallpaper6.png'
    ],
    currentWall: 0,
    lockWall: 0,
    poweredOn: true,
    security: {
        pin: null,
        fingerprint: false,
        bioIcon: 'default'
    },
    aod: {
        enabled: false,
        image: null,
        style: 'default',
        text: '',
        wallpaper: false
    },
    notes: [],
    lsBlur: false,
    glassUI: true,
    locked: true,
    userProfile: {
        name: 'Guest',
        image: null
    },
    appShape: parseInt(localStorage.getItem('realos_shape')) || 25,
    iconPack: localStorage.getItem('realos_iconpack') || 'default',
    hasSetup: localStorage.getItem('realos_setup') === 'true',
    animationSpeed: parseFloat(localStorage.getItem('realos_animspeed') || '2.0'),
    themeColor: localStorage.getItem('realos_theme') || '#ffffff',
    swipeToClose: true,
    homescreenBlur: localStorage.getItem('realos_hs_blur') === 'true',
    blurBehindApps: localStorage.getItem('realos_blur_behind') !== 'false',
    punchHole: localStorage.getItem('realos_punch') === 'true',
    animStyle: localStorage.getItem('realos_anim_style') || 'new',
    musicGradient: localStorage.getItem('realos_music_grad') !== 'false',
    liteMode: localStorage.getItem('realos_litemode') === 'true',
    specialEffects: localStorage.getItem('realos_special') === 'true',
    iconPositions: {},
    animConfig: {
        openIconFade: 0.1,
        closeIconFade: 1.5,
        wallBlurDur: 0.12,
        closeShapeMorph: 0.34,
        openBezier: [0.2, 0.85, 0.1, 1],
        openScaleBezier: [0.2, 0.85, 0.1, 1],
        openScaleTime: 0.5,
        closeBezier: [0.15, 1.01, 0.3, 1.02],
        openAppZoomOut: 0.95,
        openWallZoom: 1.03,
        openWallBlur: true
    },
    clockConfig: {
        style: 'default',
        font: 'default',
        hourColor: '#ffffff',
        minuteColor: '#ffffff',
        autoColor: false,
        boldOpacity: 0.72,
        statusBarColor: false
    },
};
function resize() {
    const wrap = document.getElementById('scale-wrapper');
    const targetWidth = 400;
    const targetHeight = 860;
    const availW = window.innerWidth - 20;
    const availH = window.innerHeight - 20;
    const scale = Math.min(availW / targetWidth, availH / targetHeight);
    wrap.style.transform = `scale(${scale})`;
}
window.onresize = resize;
setTimeout(resize, 0);
const OS = {
    getShapeRadius: () => {
        let v = parseInt(State.appShape);
        if (isNaN(v)) v = 50;
        if (v < 27) v = 27;
        if (v > 50) v = 50;
        return v + '%';
    },
    updateWallpaperEffect: (idx) => {
        const wallLayer = document.getElementById('wallpaper-layer');
        const powerLayer = document.getElementById('power-layer');
        const aodBg = document.getElementById('aod-bg-layer');
        const bio = document.getElementById('ls-biometric');

        if (!wallLayer) return;

        const i = idx !== undefined ? idx : State.currentWall;

        const currentUrl = State.wallpapers[State.currentWall];
        const isSpecial = !isVideoWallpaper(currentUrl) && State.specialEffects;

        const lsHideElements = [
            document.getElementById('ls-date'),
            document.getElementById('ls-pin-pad'),
            document.querySelector('.ls-hint')
        ];

        const statusBar = document.querySelector('.status-bar');
        const island = document.getElementById('island-wrap');
        const lsDate = document.getElementById('ls-date');
        const lsHint = document.querySelector('.ls-hint');
        const gestureBar = document.querySelector('.home-bar');

        const lockScreen = document.getElementById('lock-screen');
        const gestureArea = document.getElementById('gesture-area');

        if (lsDate) lsDate.style.transition = 'opacity 0.5s ease';

        if (gestureBar) {
            if (State.swipeToClose === false) {
                gestureBar.classList.add('no-animation');
            } else {
                gestureBar.classList.remove('no-animation');
            }
        }

        if (bio) {
            if (State.security.fingerprint) {
                bio.style.display = 'flex';
                bio.style.opacity = '0';
                bio.style.pointerEvents = 'none';
            } else {
                bio.style.display = 'none';
            }
        }

        if (!State.poweredOn) {
            if (!State.aod.enabled) {
                if (lockScreen) {
                    lockScreen.style.opacity = '0';
                    lockScreen.style.pointerEvents = 'none';
                }
                if (gestureArea) {
                    gestureArea.style.opacity = '0';
                    gestureArea.style.pointerEvents = 'none';
                }
            } else {
                if (lockScreen) {
                    lockScreen.style.opacity = '';
                    lockScreen.style.pointerEvents = '';
                }

                if (gestureArea) {
                    gestureArea.style.opacity = '0';
                    gestureArea.style.pointerEvents = 'none';
                }

                lsHideElements.forEach(el => { if (el) { el.style.opacity = '0'; el.style.pointerEvents = 'none'; } });
                if (lsHint) { lsHint.style.opacity = '0'; lsHint.style.visibility = ''; }

                if (bio && State.security.fingerprint) {
                    bio.style.opacity = '1';
                    bio.style.pointerEvents = 'auto';
                }

                if (statusBar) {
                    statusBar.style.zIndex = '10002';
                    statusBar.style.opacity = '0.5';
                    statusBar.style.filter = 'grayscale(1)';
                    statusBar.style.transition = 'none';
                }
                if (island) {
                    island.style.zIndex = '10002';
                    island.style.opacity = '0.6';
                    island.style.filter = '';
                    island.style.transition = 'none';
                }
            }
        } else if (State.locked) {
            if (lockScreen) {
                lockScreen.style.opacity = '';
                lockScreen.style.pointerEvents = '';
            }
            if (gestureArea) {
                gestureArea.style.opacity = '';
                gestureArea.style.pointerEvents = '';
            }

            lsHideElements.forEach(el => { if (el) { el.style.opacity = ''; el.style.pointerEvents = ''; } });
            if (lsHint) { lsHint.style.opacity = ''; lsHint.style.visibility = ''; }

            if (statusBar) {
                statusBar.style.zIndex = '';
                statusBar.style.opacity = '';
                statusBar.style.filter = '';
                statusBar.style.transition = 'none';
            }
            if (island) {
                island.style.zIndex = '';
                island.style.opacity = '';
                island.style.filter = '';
                island.style.transition = 'none';
            }
            if (bio && State.security.fingerprint) {
                bio.style.opacity = '1';
                bio.style.pointerEvents = 'auto';
            }
        } else {
            if (lockScreen) {
                lockScreen.style.opacity = '';
                lockScreen.style.pointerEvents = '';
            }
            if (gestureArea) {
                gestureArea.style.opacity = '';
                gestureArea.style.pointerEvents = '';
            }

            lsHideElements.forEach(el => { if (el) { el.style.opacity = ''; el.style.pointerEvents = ''; } });
            if (lsHint) { lsHint.style.visibility = ''; lsHint.style.opacity = ''; }

            if (bio) {
                bio.style.opacity = '0';
                bio.style.pointerEvents = 'none';
            }

            if (statusBar) {
                statusBar.style.zIndex = '';
                statusBar.style.opacity = '';
                statusBar.style.filter = '';
                statusBar.style.transition = '';
            }
            if (island) {
                island.style.zIndex = '';
                island.style.opacity = '';
                island.style.filter = '';
                island.style.transition = '';
            }
        }

        if (isSpecial) {
            wallLayer.style.transition = 'background-position 1s cubic-bezier(0.2, 0.85, 0.1, 1), transform 1s cubic-bezier(0.2, 0.85, 0.1, 1)';
            wallLayer.style.transformOrigin = 'top center';

            if (powerLayer) powerLayer.style.background = 'transparent';
            if (aodBg) aodBg.style.display = 'none';
            const lockLayer = document.getElementById('lock-wallpaper-layer');
            if (lockLayer) lockLayer.style.opacity = '0';

            if (!State.poweredOn && State.aod.enabled) {
                wallLayer.style.backgroundPosition = 'top center';
                wallLayer.style.transform = 'scale(1.1)';
            } else if (State.locked) {
                wallLayer.style.backgroundPosition = 'top center';
                wallLayer.style.transform = 'scale(1.2)';
            } else {
                wallLayer.style.backgroundPosition = 'center center';
                wallLayer.style.transform = '';
                setTimeout(() => {
                    if (!State.locked && !isVideoWallpaper(currentUrl)) {
                        wallLayer.style.transition = '';
                    }
                }, 1000);
            }


        } else {
            wallLayer.style.transition = '';
            wallLayer.style.backgroundPosition = '';
            wallLayer.style.transform = '';
            wallLayer.style.transformOrigin = '';
            if (powerLayer) powerLayer.style.background = '';
            if (aodBg) aodBg.style.display = '';
            const lockLayer = document.getElementById('lock-wallpaper-layer');
            if (lockLayer) lockLayer.style.opacity = '';
        }

        const isVideoUrl = isVideoWallpaper(currentUrl);
        const isVideoSpecial = isVideoUrl && State.specialEffects;
        const videoEl = VideoWallpaper.videoEl;

        if (isVideoUrl) {
            if (!videoEl) VideoWallpaper.load(currentUrl);
            else if (VideoWallpaper.currentSrc !== currentUrl) VideoWallpaper.load(currentUrl);
            VideoWallpaper.show();
            wallLayer.style.backgroundImage = 'none';

            if (VideoWallpaper.videoEl) {
                const v = VideoWallpaper.videoEl;
                v.style.transition = 'transform 1s cubic-bezier(0.2, 0.85, 0.1, 1)';
                v.style.transformOrigin = 'top center';

                if (isVideoSpecial) {
                    if (!State.poweredOn && State.aod.enabled) {
                        v.style.transform = 'scale(1.1)';
                    } else if (State.locked) {
                        v.style.transform = 'scale(1.2)';
                    } else {
                        v.style.transform = '';
                    }
                } else {
                    v.style.transform = '';
                }
            }



        } else {
            VideoWallpaper.hide();
            wallLayer.style.backgroundImage = '';
        }

        const shouldHideAodOverlay = (State.aod.enabled && State.aod.wallpaper && (isSpecial || isVideoSpecial)) || (isVideoUrl && State.aod.wallpaper);

        if (shouldHideAodOverlay) {
            if (powerLayer) powerLayer.style.background = 'rgba(0, 0, 0, 0.55)';
            if (aodBg) aodBg.style.display = 'none';
        } else {
            if (powerLayer) powerLayer.style.background = '';
            if (aodBg) aodBg.style.display = '';
        }
    },
    init: async () => {
        resize();
        Storage.loadSettings();
        await Storage.init();
        await Music.loadFromDB();
        if (OS.loaded) return;
        OS.loaded = true;
        OS.renderApps();
        OS.setupHomeEdit();
        IconDrag.init();
        OS.updateTime();
        OS.applySettings();
        if (State.liteMode) document.body.classList.add('lite-mode');
        setInterval(OS.updateTime, 1000);
        const updateBattery = (level) => {
            const pct = Math.round(level * 100);
            const fill = document.getElementById('battery-fill');
            const text = document.getElementById('battery-text');
            if (fill) {
                fill.style.width = pct + '%';
                if (pct <= 20) fill.classList.add('low');
                else fill.classList.remove('low');
            }
            if (text) text.innerText = pct;
        };
        if (navigator.getBattery) {
            navigator.getBattery().then(bat => {
                updateBattery(bat.level);
                bat.addEventListener('levelchange', () => updateBattery(bat.level));
            });
        } else {
            updateBattery(1);
        }
        OS.setupGestures();
        ControlCenter.init();
        Island.renderIdle();
        Setup.check();
        document.body.addEventListener('click', (e) => {
            if (State.tapIndicators && State.poweredOn) OS.createRipple(e);
        });

        window.addEventListener('mouseup', () => Music.endScrub());
        window.addEventListener('touchend', () => Music.endScrub());
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') AppManager.close();
            if (e.code === 'KeyQ' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                OS.togglePower();
            }
        });
        const wallInput = document.getElementById('wall-input');
        if (wallInput) {
            wallInput.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const url = evt.target.result;
                    State.wallpapers.push(url);
                    State.currentWall = State.wallpapers.length - 1;
                    OS.applySettings();
                    if (Apps.settings.view === 'wallpaper') Apps.settings.render('wallpaper');
                };
                reader.readAsDataURL(file);
                e.target.value = '';
            };
        }
        LockScreen.init();
    },
    togglePower: () => {
        if (document.getElementById('setup-screen').classList.contains('active')) return;
        if (State.poweredOn && Island.expanded) {
            Island.collapse();
            setTimeout(OS.togglePower, 50);
            return;
        }
        State.poweredOn = !State.poweredOn;
        const layer = document.getElementById('power-layer');
        const gClock = document.getElementById('global-clock');
        const aodTxt = document.getElementById('aod-user-text');
        if (!State.poweredOn) {
            ControlCenter.forceClose();
            document.querySelectorAll('.app-window-closing-clone').forEach(clone => clone.remove());
            if (AppManager.closingApps) {
                Object.keys(AppManager.closingApps).forEach(appId => {
                    clearTimeout(AppManager.closingApps[appId].closeTimeout);
                    clearTimeout(AppManager.closingApps[appId].iconFadeTimeout);
                    const icon = document.getElementById(`icon-${appId}`);
                    if (icon) {
                        icon.classList.remove('app-current');
                        const box = icon.querySelector('.icon-box') || icon;
                        box.style.opacity = '1';
                        box.style.visibility = 'visible';
                    }
                });
                AppManager.closingApps = {};
            }
            document.body.classList.remove('closing-active');
            if (State.activeApp) AppManager.close();
            const settingsOverlay = document.getElementById('settings-section-overlay');
            if (settingsOverlay) settingsOverlay.remove();
            const settingsSubOverlay = document.getElementById('settings-sub-overlay');
            if (settingsSubOverlay) settingsSubOverlay.remove();
            const settingsMainVeilPw = document.getElementById('settings-main-dim-veil');
            if (settingsMainVeilPw) settingsMainVeilPw.remove();
            const appBody = document.getElementById('app-body');
            if (appBody) {
                const settingsFade = appBody.querySelector('.anim-fade');
                if (settingsFade) { settingsFade.style.transform = ''; settingsFade.style.transition = ''; }
                appBody.style.transform = ''; appBody.style.filter = ''; appBody.style.transition = '';
            }
            const appHeaderEl = document.getElementById('app-header');
            if (appHeaderEl) {
                appHeaderEl.classList.remove('settings-header-dim', 'settings-header-dim-visible');
                appHeaderEl.style.transform = ''; appHeaderEl.style.filter = ''; appHeaderEl.style.transition = ''; appHeaderEl.style.position = ''; appHeaderEl.style.top = ''; appHeaderEl.style.left = ''; appHeaderEl.style.right = ''; appHeaderEl.style.zIndex = '';
            }
            const screenClose = document.getElementById('screen');
            if (screenClose) screenClose.classList.remove('settings-subpage-dim');
            if (Apps.settings && Apps.settings.view) Apps.settings.view = 'root';

            const wallLayer = document.getElementById('wallpaper-layer');
            if (wallLayer && State.homescreenBlur) {
                wallLayer.style.transition = 'filter 0.4s ease-out';
                wallLayer.style.filter = 'blur(0px)';
            }

            layer.classList.add('off');
            document.body.classList.add('button-fade');
            const homeContents = document.getElementById('home-contents');
            if (homeContents) {
                homeContents.style.transition = 'opacity 0.15s ease';
                homeContents.style.opacity = '0';
            }
            LockScreen.lock();
            if (State.lsCustomizing) LockScreen.exitCustomization();
            document.body.classList.remove('ls-blurred');
            gClock.classList.remove('in-statusbar');

            if (typeof Island !== 'undefined') {
                Island.isMorphing = false;
                Island.expanded = null;
                Island.update();
            }

            if (State.aod.enabled) {
                layer.classList.add('aod-active');
                gClock.classList.add('aod-mode');
                const cf = ((State.clockConfig || {}).style === 'stretched') ? 'default' : ((State.clockConfig || {}).font || 'default');
                let cfFam = "'Inter', sans-serif";
                if (cf === 'serif') cfFam = "'Times New Roman', serif";
                else if (cf === 'science') cfFam = "'Rajdhani', sans-serif";
                else if (cf === 'mono') cfFam = "'Monoton', cursive";
                else if (cf === 'lux') cfFam = "'Luxurious Roman', serif";
                gClock.style.fontFamily = cfFam;
                aodTxt.innerText = State.aod.text || "";
                if (State.aod.wallpaper) {
                    const wallUrl = State.wallpapers[State.currentWall] || '';
                    const specialUrls = ['https://i.ibb.co/9HGWgS4w/wallpaper3.jpg', 'https://i.ibb.co/FMtRmsm/wallpaper4.png', 'https://i.ibb.co/ymJxLsYz/wallpaper5.png', 'https://i.ibb.co/43v4xw9/wallpaper6.png'];
                    const isSpecial = State.specialEffects && (isVideoWallpaper(wallUrl) || specialUrls.includes(wallUrl));
                    if (isSpecial) {
                        layer.classList.remove('aod-wall-on');
                    } else {
                        layer.classList.add('aod-wall-on');
                    }
                }
                else layer.classList.remove('aod-wall-on');

            } else {
                layer.classList.remove('aod-active');
                gClock.classList.add('hidden');
            }
            const currentUrl = State.wallpapers[State.currentWall];
            if (Music && typeof Music.collapse === 'function') Music.collapse();
            if (State.specialEffects) {
                OS.updateWallpaperEffect();
            }
            if (isVideoWallpaper(currentUrl)) {
                VideoWallpaper.reverseToStart();
            }
        } else {
            layer.classList.remove('off');
            layer.classList.remove('aod-active');
            layer.classList.remove('aod-wall-on');
            document.body.classList.remove('button-fade');
            gClock.classList.remove('aod-mode');
            gClock.classList.remove('hidden');
            gClock.style.fontFamily = 'inherit';
            const homeContents = document.getElementById('home-contents');
            if (homeContents) {
                homeContents.style.transition = '';
                homeContents.style.opacity = '';
            }
            OS.applySettings();
            OS.updateWallpaperEffect();
            const currentUrl = State.wallpapers[State.currentWall];
            if (isVideoWallpaper(currentUrl)) {
                VideoWallpaper.playForward();
            }
        }
    },
    showPopup: (title, msg, onYes, onNo) => {
        document.getElementById('osm-title').innerText = title;
        document.getElementById('osm-msg').innerHTML = msg;
        const footer = document.getElementById('osm-footer');
        footer.innerHTML = '';
        if (onYes) {
            const yes = document.createElement('div');
            yes.className = 'osm-btn primary';
            yes.innerText = 'Yes';
            yes.onclick = () => { onYes(); OS.hidePopup(); };
            const no = document.createElement('div');
            no.className = 'osm-btn secondary';
            no.innerText = 'No';
            no.onclick = () => { if (onNo) onNo(); OS.hidePopup(); };
            footer.appendChild(no);
            footer.appendChild(yes);
        } else {
            const ok = document.createElement('div');
            ok.className = 'osm-btn primary';
            ok.innerText = 'OK';
            ok.onclick = OS.hidePopup;
            footer.appendChild(ok);
        }
        document.getElementById('modal-overlay').classList.add('active');
        if (!State.liteMode) {
            const box = document.querySelector('.os-modal');
            if (box) {
                box.classList.add('motion-in');
                setTimeout(() => box.classList.remove('motion-in'), 250);
            }
        }
    },
    hidePopup: () => {
        document.getElementById('modal-overlay').classList.remove('active');
    },
    createRipple: (e) => {
        const ripple = document.createElement('div');
        ripple.className = 'touch-ripple';
        ripple.style.left = e.clientX - 10 + 'px';
        ripple.style.top = e.clientY - 10 + 'px';
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 400);
    },
    renderApps: () => {
        const grid = document.getElementById('app-grid');
        const dock = document.getElementById('dock');
        grid.innerHTML = ''; dock.innerHTML = '';
        const isHyper = State.iconPack === 'hyperos';
        const isColor = State.iconPack === 'coloros';
        const isImagePack = isHyper || isColor;
        let gridIdx = 0;
        const occupiedCells = {};
        const gridAppsData = [];
        APPS.forEach((app, idx) => {
            if (app.hidden || app.area !== 'grid') return;
            if (State.iconPositions && State.iconPositions[app.id]) {
                const pos = State.iconPositions[app.id];
                occupiedCells[`${pos.row},${pos.col}`] = true;
            }
        });
        if (State.emptyApps) {
            State.emptyApps.forEach(ea => {
                if (State.iconPositions && State.iconPositions[ea.id]) {
                    const pos = State.iconPositions[ea.id];
                    occupiedCells[`${pos.row},${pos.col}`] = true;
                }
            });
        }
        APPS.forEach((app, idx) => {
            if (app.hidden) return;
            const el = document.createElement('div');
            el.className = 'app-icon';
            el.id = `icon-${app.id}`;
            el.onclick = () => AppManager.open(app.id);
            if (app.area === 'grid') {
                if (State.iconPositions && State.iconPositions[app.id]) {
                    const pos = State.iconPositions[app.id];
                    el.style.gridRow = pos.row + 1;
                    el.style.gridColumn = pos.col + 1;
                } else {
                    let r = Math.floor(gridIdx / 4);
                    let c = gridIdx % 4;
                    while (occupiedCells[`${r},${c}`]) {
                        gridIdx++;
                        r = Math.floor(gridIdx / 4);
                        c = gridIdx % 4;
                    }
                    el.style.gridRow = r + 1;
                    el.style.gridColumn = c + 1;
                    if (!State.iconPositions) State.iconPositions = {};
                    State.iconPositions[app.id] = { row: r, col: c };
                    occupiedCells[`${r},${c}`] = true;
                    gridIdx++;
                }
            }
            let iconContent, bg;
            const packIcon = isHyper ? app.hyperIcon : (isColor ? app.colorIcon : null);
            if (isImagePack && packIcon) {
                iconContent = `<img src="${packIcon}" class="app-img-icon" alt="${app.name}">`;
                bg = 'transparent';
            } else {
                bg = app.color;
                if (app.id === 'photos') {
                    iconContent = `<div class="photos-icon-flower">
                        <div class="petal-wrap p1"><div class="petal"></div></div>
                        <div class="petal-wrap p2"><div class="petal"></div></div>
                        <div class="petal-wrap p3"><div class="petal"></div></div>
                        <div class="petal-wrap p4"><div class="petal"></div></div>
                        <div class="petal-wrap p5"><div class="petal"></div></div>
                        <div class="petal-wrap p6"><div class="petal"></div></div>
                        <div class="petal-wrap p7"><div class="petal"></div></div>
                        <div class="petal-wrap p8"><div class="petal"></div></div>
                    </div>`;
                } else if (app.id === 'settings') {
                    iconContent = `<div class="settings-icon-gear" style="transform: scale(1.15);">
                        <div class="gear-base"></div>
                        <div class="gear-teeth">
                            <div class="tooth"></div><div class="tooth"></div><div class="tooth"></div>
                            <div class="tooth"></div><div class="tooth"></div><div class="tooth"></div>
                        </div>
                        <div class="gear-inner-ring"></div>
                        <div class="gear-spoke spoke-1"></div><div class="gear-spoke spoke-2"></div><div class="gear-spoke spoke-3"></div>
                        <div class="gear-center-dot"></div>
                    </div>`;
                } else if (app.id === 'camera') {
                    bg = 'linear-gradient(135deg, #fbfbfb 0%, #e8e8e8 50%, #d1d1d1 100%)';
                    iconContent = `<div class="camera-icon-lens" style="transform: scale(1.39);">
                        <div class="camera-base"></div>
                        <div class="lens-outer-ring"></div>
                        <div class="lens-inner-black"></div>
                        <div class="lens-core-glass"></div>
                        <div class="lens-glare-1"></div>
                        <div class="lens-glare-2"></div>
                        <div class="flash-ring"><div class="flash-bulb"></div></div>
                    </div>`;
                } else if (app.id === 'music') {
                    bg = '#fa2d48';
                    iconContent = `<div class="music-icon-note" style="transform: scale(1.0);">
                        <div class="music-note">&#9834;</div>
                        <div class="music-sparkles">
                            <div class="sparkle sparkle-lg" style="top:22%; right:2%;"></div>
                            <div class="sparkle sparkle-sm sparkle-green" style="top:55%; left:5%;"></div>
                            <div class="sparkle sparkle-xs sparkle-yellow" style="bottom:15%; left:22%;"></div>
                            <div class="sparkle sparkle-xs sparkle-orange" style="top:12%; right:22%;"></div>
                        </div>
                    </div>`;
                } else if (app.id === 'clock') {
                    bg = '#fff';
                    const now = new Date();
                    const hDeg = (now.getHours() % 12) * 30 + now.getMinutes() * 0.5 + now.getSeconds() * (0.5 / 60);
                    const mDeg = now.getMinutes() * 6 + now.getSeconds() * 0.1;
                    iconContent = `<div class="clock-icon-face">
                        <div class="clock-dial"></div>
                        <div class="clock-hand clock-hour" style="transform: rotate(${hDeg}deg);"></div>
                        <div class="clock-hand clock-minute" style="transform: rotate(${mDeg}deg);"></div>
                        <div class="clock-center-dot"></div>
                    </div>`;
                } else {
                    const lowBg = (bg || "").toLowerCase().trim();
                    const isWhiteBg = app.id === 'photos' || lowBg === '#fff' || lowBg.startsWith('#ffffff') || lowBg === 'white' || lowBg.replace(/\s/g, '') === 'rgb(255,255,255)';
                    const shadeColor = isWhiteBg ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)';
                    const shadeHtml = `<div style="position:absolute; inset:0; background: radial-gradient(circle at top right, ${shadeColor} 0%, transparent 70%); pointer-events:none; border-radius:inherit; z-index:10;"></div>`;
                    iconContent = `${shadeHtml}<i class="fas ${app.icon}"></i>`;
                }
            }
            el.innerHTML = `
                <div class="icon-box" style="overflow:hidden; background:${bg}; color:${app.text || 'white'}; ${app.border ? 'border:1px solid #333' : ''}">
                    ${iconContent}
                </div>
                <div class="icon-label">${app.name}</div>
            `;
            (app.area === 'dock' ? dock : grid).appendChild(el);
        });
        if (State.emptyApps) {
            State.emptyApps.forEach(ea => {
                const el = document.createElement('div');
                el.className = 'app-icon';
                el.id = `icon-${ea.id}`;
                el.onclick = () => AppManager.open(ea.id);
                if (State.iconPositions && State.iconPositions[ea.id]) {
                    const pos = State.iconPositions[ea.id];
                    el.style.gridRow = pos.row + 1;
                    el.style.gridColumn = pos.col + 1;
                } else {
                    let r = Math.floor(gridIdx / 4);
                    let c = gridIdx % 4;
                    while (occupiedCells[`${r},${c}`]) {
                        gridIdx++;
                        r = Math.floor(gridIdx / 4);
                        c = gridIdx % 4;
                    }
                    el.style.gridRow = r + 1;
                    el.style.gridColumn = c + 1;
                    if (!State.iconPositions) State.iconPositions = {};
                    State.iconPositions[ea.id] = { row: r, col: c };
                    occupiedCells[`${r},${c}`] = true;
                    gridIdx++;
                }
                el.innerHTML = `
                    <div class="icon-box" style="overflow:hidden; background:#888; color:white;">
                    </div>
                    <div class="icon-label">None</div>
                `;
                grid.appendChild(el);
            });
        }
    },
    setupHomeEdit: () => {
        let longPressTimer = null;
        const homeContents = document.getElementById('home-contents');
        const grid = document.getElementById('app-grid');
        if (!grid || !homeContents) return;
        grid.addEventListener('pointerdown', (e) => {
            if (e.target.closest('.app-icon') || document.body.classList.contains('home-edit-mode')) return;
            longPressTimer = setTimeout(() => {
                OS.enterEditMode();
            }, 600);
        });
        grid.addEventListener('pointerup', () => clearTimeout(longPressTimer));
        grid.addEventListener('pointermove', () => clearTimeout(longPressTimer));
        grid.addEventListener('pointercancel', () => clearTimeout(longPressTimer));
    },
    enterEditMode: () => {
        if (document.body.classList.contains('home-edit-mode')) return;
        document.body.classList.add('home-edit-mode');
        const homeContents = document.getElementById('home-contents');
        document.querySelectorAll('.app-window-closing-clone').forEach(clone => {
            const appId = clone.dataset.appId;
            if (appId && AppManager.closingApps && AppManager.closingApps[appId]) {
                clearTimeout(AppManager.closingApps[appId].closeTimeout);
                clearTimeout(AppManager.closingApps[appId].iconFadeTimeout);
                const icon = document.getElementById(`icon-${appId}`);
                if (icon) {
                    icon.classList.remove('app-current');
                    const box = icon.querySelector('.icon-box') || icon;
                    box.style.transition = 'none';
                    box.style.opacity = '1';
                    box.style.visibility = 'visible';
                }
                delete AppManager.closingApps[appId];
            }
            if (clone._syncZoomState) { clone._syncZoomState.active = false; }
            clone.remove();
        });
        if (Object.keys(AppManager.closingApps || {}).length === 0) {
            document.body.classList.remove('closing-active');
        }
        let addBtn = document.getElementById('home-add-btn');
        if (!addBtn) {
            addBtn = document.createElement('div');
            addBtn.id = 'home-add-btn';
            addBtn.innerHTML = '<i class="fas fa-plus"></i>';
            addBtn.onclick = (e) => {
                e.stopPropagation();
                OS.addEmptyApp();
            };
            homeContents.parentElement.appendChild(addBtn);
        }
        addBtn.style.display = 'flex';
        let trashBtn = document.getElementById('home-trash-btn');
        if (!trashBtn) {
            trashBtn = document.createElement('div');
            trashBtn.id = 'home-trash-btn';
            trashBtn.innerHTML = '<i class="fas fa-trash"></i>';
            homeContents.parentElement.appendChild(trashBtn);
        }
        const screen = document.getElementById('screen');
        const exitHandler = (e) => {
            if (e.target.closest('#home-add-btn') || e.target.closest('.app-icon')) return;
            OS.exitEditMode();
            screen.removeEventListener('click', exitHandler, true);
        };
        setTimeout(() => screen.addEventListener('click', exitHandler, true), 300);
    },
    exitEditMode: () => {
        document.body.classList.remove('home-edit-mode');
        const addBtn = document.getElementById('home-add-btn');
        if (addBtn) addBtn.style.display = 'none';
    },
    addEmptyApp: () => {
        State.emptyApps = State.emptyApps || [];
        const maxIcons = 6 * 4;
        const gridEls = Array.from(document.getElementById('app-grid').children)
            .filter(el => el.classList.contains('app-icon') && el.id !== 'home-add-btn');
        if (State.emptyApps.length >= 16 || gridEls.length >= maxIcons) {
            return;
        }
        const id = 'empty_' + Date.now();
        State.emptyApps.push({ id, name: 'None' });
        Storage.saveSettings();
        OS.renderApps();
        OS.enterEditMode();
    },
    updateTime: () => {
        const d = new Date();
        const hours = d.getHours();
        let hours12 = hours % 12;
        if (hours12 === 0) hours12 = 12;
        const minutes = d.getMinutes();
        const minutesPadded = minutes < 10 ? '0' + minutes : minutes;
        const time = hours12 + ':' + minutesPadded;
        document.getElementById('clock').innerHTML = `<span class="c-hour">${hours12}</span>:<span class="c-min">${minutesPadded}</span>`;
        const globalTimeEl = document.getElementById('global-time');
        const cc = State.clockConfig || {};
        const gClock = document.getElementById('global-clock');
        const cf = cc.font || 'default';
        const isInStatusbar = gClock.classList.contains('in-statusbar');
        const fontClasses = ['font-default', 'font-serif', 'font-science', 'font-mono', 'font-lux'];
        globalTimeEl.classList.remove(...fontClasses);

        if (!isInStatusbar) {
            globalTimeEl.classList.add(`font-${cf}`);
        }
        if (gClock) gClock.dataset.clockStyle = cc.style || 'default';

        const fw = cc.fontWeight || 200;
        const bOp = cc.boldOpacity !== undefined ? cc.boldOpacity : 0.72;
        gClock.style.setProperty('--clock-hc', cc.hourColor || '#ffffff');
        gClock.style.setProperty('--clock-mc', cc.minuteColor || '#ffffff');
        gClock.style.setProperty('--clock-op', bOp);

        if (!isInStatusbar) {
            gClock.style.setProperty('--clock-fw', fw);
        } else {
            gClock.style.removeProperty('--clock-fw');
        }

        if (cc.style === 'stretched') {
            globalTimeEl.innerHTML = `<span class="gc-hour">${hours12}</span><span class="gc-colon">:</span><span class="gc-minute">${minutesPadded}</span>`;
            globalTimeEl.classList.add('stretched-clock');
            globalTimeEl.classList.remove('bold-clock', 'tilt-clock');
        } else if (cc.style === 'tilt') {
            globalTimeEl.innerHTML = `<span class="gc-hour">${hours12}</span><span class="gc-colon">:</span><span class="gc-minute">${minutesPadded}</span>`;
            globalTimeEl.classList.add('tilt-clock');
            globalTimeEl.classList.remove('bold-clock', 'stretched-clock');
        } else {
            globalTimeEl.innerHTML = `<span class="gc-hour">${hours12}</span><span class="gc-colon">:</span><span class="gc-minute">${minutesPadded}</span>`;
            globalTimeEl.classList.remove('bold-clock', 'stretched-clock', 'tilt-clock');
        }

        const mainClock = document.getElementById('clock');
        if (cc.statusBarColor) {
            gClock.classList.add('sb-custom-color');
            const cHour = mainClock.querySelector('.c-hour');
            const cMin = mainClock.querySelector('.c-min');
            if (cHour) cHour.style.color = cc.hourColor || '#ffffff';
            if (cMin) cMin.style.color = cc.minuteColor || '#ffffff';
            mainClock.style.color = 'inherit';
        } else {
            gClock.classList.remove('sb-custom-color');
            const cHour = mainClock.querySelector('.c-hour');
            const cMin = mainClock.querySelector('.c-min');
            if (cHour) cHour.style.color = 'inherit';
            if (cMin) cMin.style.color = 'inherit';
            mainClock.style.color = '';
        }
        const opts = { weekday: 'long', month: 'short', day: 'numeric' };
        const dateStr = d.toLocaleDateString('en-US', opts);
        document.getElementById('ls-date').innerText = dateStr;
        document.getElementById('gc-date').innerText = dateStr;
        const aodDateEl = document.getElementById('aod-date');
        if (aodDateEl) aodDateEl.innerText = dateStr;
        if (State.islandMode === 'clock') {
            const iText = document.getElementById('di-idle-text');
            if (iText) iText.innerText = time;
        }

        const lsPreviewTimeEl = document.getElementById('ls-preview-time');
        if (lsPreviewTimeEl) {
            lsPreviewTimeEl.classList.remove(...fontClasses);
            lsPreviewTimeEl.classList.add(`font-${cf}`);
            if (cc.style === 'stretched') {
                lsPreviewTimeEl.textContent = hours12 + ':' + minutesPadded;
            } else {
                lsPreviewTimeEl.innerHTML = `<span style="color:${cc.hourColor || '#fff'};opacity:${bOp}">${hours12}</span><span style="opacity:${bOp}">:</span><span style="color:${cc.minuteColor || '#fff'};opacity:${bOp}">${minutesPadded}</span>`;
            }
        }
        const lsPreviewDateEl = document.getElementById('ls-preview-date');
        if (lsPreviewDateEl) lsPreviewDateEl.innerText = dateStr;

    },
    updateStatusBarColors: (isOpen, isDarkApp, immediate = false) => {
        const sb = document.querySelector('.status-bar');
        const hb = document.querySelector('.home-bar');
        const dur = immediate ? '0s' : `${0.5 * State.animationSpeed * 0.7}s`;

        if (sb) {
            sb.style.transition = `color ${dur} ease`;
            sb.style.color = '';
            const sbIcons = sb.querySelectorAll('.fas, .fab');
            sbIcons.forEach(i => {
                i.style.transition = `color ${dur} ease`;
                i.style.color = '';
            });
            if (isOpen && !isDarkApp && !State.darkMode) {
                sb.classList.add('sb-app-overlay');
            } else {
                sb.classList.remove('sb-app-overlay');
            }
        }
        if (hb) {
            const targetBgColor = isOpen ? (isDarkApp ? '#fff' : '#000') : '#fff';
            hb.style.transition = `background-color ${dur} ease`;
            hb.style.backgroundColor = targetBgColor;
        }
    },
    setupGestures: () => {
        const bar = document.querySelector('.home-bar');
        const gestureArea = document.getElementById('gesture-area');
        if (gestureArea) {
            gestureArea.style.zIndex = '100000';
            gestureArea.style.position = 'absolute';
        }
        const handleClose = () => {
            if (!State.swipeToClose) AppManager.close();
        };
        const newBar = bar.cloneNode(true);
        bar.parentNode.replaceChild(newBar, bar);
        newBar.style.setProperty('cursor', 'grab', 'important');
        if (!State.swipeToClose) {
            newBar.classList.add('no-animation');
        } else {
            newBar.classList.remove('no-animation');
        }
        Array.from(newBar.children).forEach(c => c.style.pointerEvents = 'none');
        let startY = 0;
        let startX = 0;
        let isSwipe = false;
        const onStart = (x, y) => {
            startY = y;
            startX = x;
            isSwipe = false;
            newBar.style.transition = 'transform 0.1s ease';
            newBar.style.transform = 'scale(0.9)';
            newBar.style.setProperty('cursor', 'grabbing', 'important');
            document.body.style.cursor = 'grabbing';
            if (State.swipeToClose && State.activeApp && State.activeApp !== 'home') {
                const win = document.getElementById('app-window');
                if (win) {
                    win.style.transition = 'none';
                }
            }
            setTimeout(() => newBar.style.transition = 'none', 50);
        };
        const onMove = (x, y) => {
            if (!startY) return;
            const diff = y - startY;
            if (diff < 0) {
                isSwipe = true;
                const visualDiff = Math.max(diff, -20);
                const atMax = diff <= -20;
                newBar.style.transform = `translateY(${visualDiff}px) scale(0.9)`;
                if (State.swipeToClose && State.activeApp && State.activeApp !== 'home') {
                    const win = document.getElementById('app-window');
                    if (win) {
                        const scale = Math.max(0.96, 1 + (diff / 2000));
                        const winDiff = atMax ? visualDiff - 2 : visualDiff;
                        let hDiff = 0;
                        if (atMax) {
                            hDiff = Math.max(-50, Math.min(50, x - startX));
                        }
                        win.style.transform = `translate(${hDiff}px, ${winDiff}px) scale(${scale})`;
                        win.style.borderRadius = '24px';
                    }
                }
            }
        };
        const onEnd = (y) => {
            newBar.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.85, 0.1, 1)';
            newBar.style.transform = 'translateY(0px) scale(1)';
            newBar.style.setProperty('cursor', 'grab', 'important');
            document.body.style.cursor = '';
            if (State.swipeToClose) {
                if (startY && (y - startY < -5)) {
                    requestAnimationFrame(() => AppManager.close());
                } else {
                    if (State.activeApp && State.activeApp !== 'home') {
                        const win = document.getElementById('app-window');
                        if (win) {
                            win.style.transition = 'all 0.3s cubic-bezier(0.2, 0.85, 0.1, 1)';
                            win.style.transform = '';
                            win.style.borderRadius = '';
                        }
                    }
                }
            } else {
                if (!isSwipe && Math.abs(y - startY) < 3) {
                }
            }
            startY = 0;
            startX = 0;
        };
        newBar.addEventListener('touchstart', e => onStart(e.touches[0].clientX, e.touches[0].clientY), { passive: false });
        newBar.addEventListener('touchmove', e => onMove(e.touches[0].clientX, e.touches[0].clientY), { passive: false });
        newBar.addEventListener('touchend', e => onEnd(e.changedTouches[0].clientY));
        if (gestureArea) {
            gestureArea.addEventListener('touchstart', e => onStart(e.touches[0].clientX, e.touches[0].clientY), { passive: false });
            gestureArea.addEventListener('touchmove', e => { e.preventDefault(); onMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
            gestureArea.addEventListener('touchend', e => onEnd(e.changedTouches[0].clientY));
        }
        const mouseMoveHandler = (e) => {
            if (startY) onMove(e.clientX, e.clientY);
        };
        const mouseUpHandler = (e) => {
            if (startY) {
                onEnd(e.clientY);
                document.removeEventListener('mousemove', mouseMoveHandler);
                document.removeEventListener('mouseup', mouseUpHandler);
            }
        };
        newBar.addEventListener('mousedown', e => {
            onStart(e.clientX, e.clientY);
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        });
        if (gestureArea) {
            gestureArea.addEventListener('mousedown', e => {
                onStart(e.clientX, e.clientY);
                document.addEventListener('mousemove', mouseMoveHandler);
                document.addEventListener('mouseup', mouseUpHandler);
            });
        }
        document.getElementById('device').addEventListener('click', (e) => {
            if (!e.target.closest('#island-wrap') && !e.target.closest('.app-icon') && Island.expanded !== 'unlocked' && Island.expanded !== 'notify') {
                Island.collapse();
            }
        });
    },

    applySettings: () => {
        OS.updateWallpaperEffect();
        document.documentElement.style.setProperty('--accent', State.accentColor);
        const island = document.getElementById('dynamic-island');
        if (State.islandColor.includes('gradient') || State.islandColor === 'rainbow') {
            document.documentElement.style.setProperty('--island-bg', '#000');
        } else {
            document.documentElement.style.setProperty('--island-bg', State.islandColor);
        }
        const bar = document.querySelector('.home-bar');
        if (State.darkMode) {
            document.body.classList.add('dark-mode');
            bar.style.backgroundColor = '#fff';
        } else {
            document.body.classList.remove('dark-mode');
            bar.style.backgroundColor = '#000';
        }

        if (State.glassUI) document.body.classList.add('glass-ui');
        else document.body.classList.remove('glass-ui');
        const animDur = 0.5 * State.animationSpeed;
        document.documentElement.style.setProperty('--home-anim-dur', `${animDur}s`);
        document.documentElement.style.setProperty('--wall-blur-dur', (State.animConfig.wallBlurDur * State.animationSpeed) + 's');
        document.getElementById('brightness-layer').style.opacity = (100 - State.brightness) / 100;
        Island.renderIdle();
        const aodImg = document.getElementById('aod-img');
        if (State.aod.image) {
            aodImg.src = State.aod.image;
            aodImg.style.display = 'block';
        } else {
            aodImg.style.display = 'none';
        }
        const gClock = document.getElementById('global-clock');
        const cc = State.clockConfig || {};

        if (cc.style === 'stretched') document.body.classList.add('has-stretched-clock');
        else document.body.classList.remove('has-stretched-clock');
        document.documentElement.style.setProperty('--home-anim-dur', (0.5 * State.animationSpeed) + 's');
        const currentWallUrl = State.wallpapers[State.currentWall];
        if (isVideoWallpaper(currentWallUrl)) {
            VideoWallpaper.load(currentWallUrl);
            VideoWallpaper.show();
            VideoWallpaper.getThumbnail((url) => {
                document.documentElement.style.setProperty('--wall', `url('${url}')`);
            });
        } else {
            document.documentElement.style.setProperty('--wall', `url('${currentWallUrl}')`);
            VideoWallpaper.hide();
        }
        const lockWallUrl = State.wallpapers[State.lockWall] || currentWallUrl;
        const lockLayer = document.getElementById('lock-wallpaper-layer');
        const existingLockVid = lockLayer ? lockLayer.querySelector('video') : null;
        if (isVideoWallpaper(lockWallUrl)) {
            if (lockLayer) {
                lockLayer.style.backgroundImage = 'none';
                lockLayer.style.backgroundColor = 'transparent';
            }
            if (State.specialEffects) {
                document.body.classList.add('vid-special-effects');
            } else {
                document.body.classList.remove('vid-special-effects');
            }
            const rawSrc = existingLockVid ? existingLockVid.getAttribute('data-raw-src') : null;
            if (!existingLockVid || rawSrc !== lockWallUrl) {
                if (existingLockVid) existingLockVid.remove();
                const vid = document.createElement('video');
                vid.src = lockWallUrl;
                vid.setAttribute('data-raw-src', lockWallUrl);
                vid.muted = true;
                vid.playsInline = true;
                vid.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none;';
                vid.addEventListener('loadedmetadata', () => {
                    if (!State.specialEffects) {
                        vid.currentTime = vid.duration || 9999;
                        vid.pause();
                    }
                });
                if (lockLayer) lockLayer.appendChild(vid);
            }
            VideoWallpaper.getThumbnail((thumbUrl) => {
                document.documentElement.style.setProperty('--wall-lock', `url('${thumbUrl}')`);
            });
        } else {
            if (existingLockVid) existingLockVid.remove();
            document.documentElement.style.setProperty('--wall-lock', `url('${lockWallUrl}')`);
        }
        if (State.locked && State.lsBlur) document.body.classList.add('ls-blurred');
        else document.body.classList.remove('ls-blurred');
        if (State.blurBehindApps) document.body.classList.add('blur-behind');
        else document.body.classList.remove('blur-behind');
        if (State.homescreenBlur) document.body.classList.add('hs-blur');
        else document.body.classList.remove('hs-blur');
        if (State.hideAppLabels) document.body.classList.add('hide-labels');
        else document.body.classList.remove('hide-labels');
        if (State.locked) document.body.classList.add('ls-active');
        else document.body.classList.remove('ls-active');
        LockScreen.updateUI();
        document.body.setAttribute('data-app-shape', State.appShape || 50);
        document.documentElement.style.setProperty('--app-radius', OS.getShapeRadius());
        if (typeof Island !== 'undefined') Island.update();
        Storage.saveSettings();
    }
};
function isVideoWallpaper(url) {
    return url && url.endsWith('.mp4');
}
const VideoWallpaper = {
    videoEl: null,
    isPlaying: false,
    isReversing: false,
    animFrameId: null,
    lastFrameTime: 0,
    currentSrc: '',
    init: () => {
        if (VideoWallpaper.videoEl) return;
        const video = document.createElement('video');
        video.id = 'wallpaper-video';
        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        const wallLayer = document.getElementById('wallpaper-layer');
        if (wallLayer) wallLayer.appendChild(video);
        VideoWallpaper.videoEl = video;
        video.addEventListener('ended', () => {
            VideoWallpaper.isPlaying = false;
        });
    },
    load: (src) => {
        VideoWallpaper.init();
        const video = VideoWallpaper.videoEl;
        if (!video) return;

        const setEndState = () => {
            if (!State.specialEffects && video.duration) {
                video.currentTime = video.duration;
                video.pause();
            } else if (!State.specialEffects) {
                video.currentTime = 0;
                video.pause();
            }
        };

        if (VideoWallpaper.currentSrc !== src) {
            VideoWallpaper.cancelAll();
            video.src = src;
            video.currentTime = 0;
            video.load();
            VideoWallpaper.currentSrc = src;
            video.onloadedmetadata = setEndState;
        } else {
            setEndState();
        }
    },
    getThumbnail: (callback) => {
        const video = VideoWallpaper.videoEl;
        if (!video) return;
        const capture = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth || 1920;
                canvas.height = video.videoHeight || 1080;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                callback(canvas.toDataURL('image/jpeg', 0.8));
            } catch (e) {
            }
        };

        if (video.seeking) {
            video.addEventListener('seeked', capture, { once: true });
        } else if (video.readyState >= 2) {
            capture();
        } else {
            video.addEventListener('loadeddata', capture, { once: true });
        }
    },
    show: () => {
        VideoWallpaper.init();
        const video = VideoWallpaper.videoEl;
        if (video) video.style.display = 'block';
    },
    hide: () => {
        if (VideoWallpaper.videoEl) {
            VideoWallpaper.videoEl.style.display = 'none';
            VideoWallpaper.cancelAll();
        }
    },
    cancelAll: () => {
        const video = VideoWallpaper.videoEl;
        if (video && !video.paused) video.pause();
        if (video) video.onseeked = null;
        if (VideoWallpaper.animFrameId) {
            cancelAnimationFrame(VideoWallpaper.animFrameId);
            VideoWallpaper.animFrameId = null;
        }
        VideoWallpaper.isPlaying = false;
        VideoWallpaper.isReversing = false;
    },
    playForward: () => {
        const homeVideo = VideoWallpaper.videoEl;
        const lockLayer = document.getElementById('lock-wallpaper-layer');
        let lockVideo = null;
        if (lockLayer) lockVideo = lockLayer.querySelector('video');

        if ((!homeVideo || !homeVideo.src) && (!lockVideo || !lockVideo.src)) return;
        VideoWallpaper.cancelAll();
        if (!State.specialEffects) {
            if (homeVideo && homeVideo.duration) homeVideo.currentTime = homeVideo.duration;
            if (homeVideo) homeVideo.pause();
            if (lockVideo && lockVideo.duration) lockVideo.currentTime = lockVideo.duration;
            if (lockVideo) lockVideo.pause();
            return;
        }
        VideoWallpaper.isPlaying = true;
        if (homeVideo) homeVideo.play().catch(e => { });
        if (lockVideo) lockVideo.play().catch(e => { });
        const checkEnd = () => {
            if (!VideoWallpaper.isPlaying) return;
            let ended = true;
            if (homeVideo && !(homeVideo.ended || homeVideo.currentTime >= homeVideo.duration)) ended = false;
            if (lockVideo && !(lockVideo.ended || lockVideo.currentTime >= lockVideo.duration)) ended = false;

            if (ended) {
                VideoWallpaper.isPlaying = false;
            } else {
                VideoWallpaper.animFrameId = requestAnimationFrame(checkEnd);
            }
        };
        VideoWallpaper.animFrameId = requestAnimationFrame(checkEnd);
    },
    reverseToStart: () => {
        const homeVideo = VideoWallpaper.videoEl;
        const lockLayer = document.getElementById('lock-wallpaper-layer');
        let lockVideo = null;
        if (lockLayer) lockVideo = lockLayer.querySelector('video');

        if ((!homeVideo || !homeVideo.src) && (!lockVideo || !lockVideo.src)) return;
        VideoWallpaper.cancelAll();
        if (!State.specialEffects) {
            if (homeVideo && homeVideo.duration) homeVideo.currentTime = homeVideo.duration;
            if (homeVideo) homeVideo.pause();
            if (lockVideo && lockVideo.duration) lockVideo.currentTime = lockVideo.duration;
            if (lockVideo) lockVideo.pause();
            return;
        }
        if (homeVideo && homeVideo.currentTime <= 0 && lockVideo && lockVideo.currentTime <= 0) {
            if (homeVideo) homeVideo.currentTime = 0;
            if (lockVideo) lockVideo.currentTime = 0;
            return;
        }
        VideoWallpaper.isReversing = true;
        let seekStart = performance.now();
        const stepBack = () => {
            if (!VideoWallpaper.isReversing) return;
            const now = performance.now();
            const delta = (now - seekStart) / 1000;
            seekStart = now;
            let finished = true;

            const calcNewTime = (vid) => {
                if (!vid) return 0;
                const newTime = vid.currentTime - Math.max(delta, 1 / 30);
                if (newTime <= 0) {
                    vid.currentTime = 0;
                    return 0;
                }
                vid.currentTime = newTime;
                finished = false;
                return newTime;
            };

            calcNewTime(homeVideo);
            calcNewTime(lockVideo);

            if (finished) {
                VideoWallpaper.isReversing = false;
                return;
            }
        };
        if (homeVideo) {
            homeVideo.onseeked = () => {
                if (!VideoWallpaper.isReversing) {
                    homeVideo.onseeked = null;
                    if (lockVideo) lockVideo.onseeked = null;
                    return;
                }
                VideoWallpaper.animFrameId = requestAnimationFrame(stepBack);
            };
        } else if (lockVideo) {
            lockVideo.onseeked = () => {
                if (!VideoWallpaper.isReversing) {
                    lockVideo.onseeked = null;
                    return;
                }
                VideoWallpaper.animFrameId = requestAnimationFrame(stepBack);
            };
        }
        VideoWallpaper.animFrameId = requestAnimationFrame(stepBack);
    },
    reset: () => {
        const video = VideoWallpaper.videoEl;
        if (!video) return;
        VideoWallpaper.cancelAll();
        video.currentTime = 0;
    }
};
const Setup = {
    helloInterval: null,
    pinEntry: '',
    pinFirst: '',
    pinConfirming: false,
    helloWords: ['Hello!', 'Hola!', 'مرحبًا!', 'Hallo!', 'Bonjour!', 'Ciao!', '你好!', 'Olá!', 'こんにちは!', 'Привет!'],
    helloIndex: 0,
    check: () => {
        const status = localStorage.getItem('realos_setup_status');
        if (!status) {
            document.getElementById('setup-screen').classList.add('active');
            Setup.startHelloCycle();
        } else if (status === 'notice_only' || status === 'done') {
            const setupScreen = document.getElementById('setup-screen');
            setupScreen.classList.add('active');
            const welcomeSlide = document.getElementById('slide-welcome');
            welcomeSlide.classList.remove('current');
            welcomeSlide.style.display = 'none';
            const noticeSlide = document.getElementById('slide-notice');
            noticeSlide.style.transform = 'translateX(0)';
            noticeSlide.style.opacity = '1';
            noticeSlide.classList.add('current');
        }
    },
    startHelloCycle: () => {
        const el = document.getElementById('setup-hello');
        if (!el) return;
        Setup.helloInterval = setInterval(() => {
            el.classList.add('fading');
            setTimeout(() => {
                Setup.helloIndex = (Setup.helloIndex + 1) % Setup.helloWords.length;
                el.textContent = Setup.helloWords[Setup.helloIndex];
                el.classList.remove('fading');
            }, 300);
        }, 1500);
    },
    startWelcome: () => {
        if (Setup.helloInterval) clearInterval(Setup.helloInterval);
        const btn = document.getElementById('setup-go-btn');
        const setupScreen = document.getElementById('setup-screen');
        const noticeSlide = document.getElementById('slide-notice');
        const welcomeSlide = document.getElementById('slide-welcome');
        const btnRect = btn.getBoundingClientRect();
        const sRect = document.getElementById('screen').getBoundingClientRect();
        const scaleFactor = document.fullscreenElement ? 1 : document.getElementById('scale-wrapper').getBoundingClientRect().width / 400;
        const startTop = (btnRect.top - sRect.top) / scaleFactor;
        const startLeft = (btnRect.left - sRect.left) / scaleFactor;
        const startW = btnRect.width / scaleFactor;
        const startH = btnRect.height / scaleFactor;
        btn.style.display = 'none';
        const expandWin = document.createElement('div');
        expandWin.className = 'setup-expand-window';
        expandWin.id = 'setup-expand-win';
        expandWin.style.top = startTop + 'px';
        expandWin.style.left = startLeft + 'px';
        expandWin.style.width = startW + 'px';
        expandWin.style.height = startH + 'px';
        expandWin.style.borderRadius = (startW / 2) + 'px';
        noticeSlide.style.transform = 'translateX(0)';
        noticeSlide.style.opacity = '1';
        noticeSlide.classList.add('current');
        expandWin.appendChild(noticeSlide);
        setupScreen.appendChild(expandWin);
        requestAnimationFrame(() => {
            const anim = expandWin.animate([
                { top: startTop + 'px', left: startLeft + 'px', width: startW + 'px', height: startH + 'px', borderRadius: (startW / 2) + 'px' },
                { top: '0px', left: '0px', width: '100%', height: '100%', borderRadius: '60px' }
            ], {
                duration: 500,
                easing: 'cubic-bezier(' + (State.animConfig.openBezier || [0.2, 0.85, 0.1, 1]).join(', ') + ')',
                fill: 'forwards'
            });
            anim.onfinish = () => {
                expandWin.style.top = '0';
                expandWin.style.left = '0';
                expandWin.style.width = '100%';
                expandWin.style.height = '100%';
                expandWin.style.borderRadius = '60px';
                welcomeSlide.classList.remove('current');
                welcomeSlide.style.display = 'none';
            };
        });
    },
    next: (curr, nextId) => {
        const currEl = document.getElementById(`slide-${curr}`);
        const nextEl = document.getElementById(`slide-${nextId}`);
        if (currEl) {
            currEl.classList.add('prev');
            currEl.classList.remove('current');
        }
        if (nextEl) {
            nextEl.classList.add('current');
        }
    },
    handleNoticeNext: () => {
        const expandWin = document.getElementById('setup-expand-win');
        const noticeSlide = document.getElementById('slide-notice');
        if (expandWin) {
            const setupScreen = document.getElementById('setup-screen');
            setupScreen.insertBefore(noticeSlide, expandWin);
            expandWin.remove();
        }
        noticeSlide.style.transform = '';
        noticeSlide.style.opacity = '';
        const status = localStorage.getItem('realos_setup_status');
        if (status === 'notice_only' || status === 'done') {
            const el = document.getElementById('setup-screen');
            el.classList.add('fade-out');
            setTimeout(() => {
                el.classList.remove('active', 'fade-out');
            }, 500);
        } else {
            Setup.next('notice', 'theme');
        }
    },
    setTheme: (theme) => {
        const lightP = document.getElementById('tp-light');
        const darkP = document.getElementById('tp-dark');
        if (theme === 'dark' && !State.darkMode) {
            Apps.settings.toggleDark();
            lightP.classList.remove('active');
            darkP.classList.add('active');
        } else if (theme === 'light' && State.darkMode) {
            Apps.settings.toggleDark();
            darkP.classList.remove('active');
            lightP.classList.add('active');
        }
    },
    pinDigit: (n) => {
        if (Setup.pinEntry.length >= 4) return;
        Setup.pinEntry += n;
        Setup.updatePinDots();
        if (Setup.pinEntry.length === 4) {
            setTimeout(() => {
                if (!Setup.pinConfirming) {
                    Setup.pinFirst = Setup.pinEntry;
                    Setup.pinEntry = '';
                    Setup.pinConfirming = true;
                    document.getElementById('setup-pin-status').textContent = 'Confirm PIN';
                    document.getElementById('setup-pin-back').style.visibility = 'visible';
                    Setup.updatePinDots();
                } else {
                    if (Setup.pinEntry === Setup.pinFirst) {
                        State.security.pin = Setup.pinEntry;
                        State.security.lockEnabled = true;
                        Storage.saveSettings();
                        document.getElementById('setup-pin-status').textContent = 'PIN Set!';
                        setTimeout(() => Setup.next('security', 'finish'), 500);
                    } else {
                        document.getElementById('setup-pin-status').textContent = 'PINs don\'t match. Try again.';
                        Setup.pinEntry = '';
                        Setup.updatePinDots();
                        const area = document.getElementById('setup-pin-area');
                        area.style.animation = 'none';
                        void area.offsetWidth;
                        area.style.animation = 'shake 0.3s ease';
                        setTimeout(() => {
                            document.getElementById('setup-pin-status').textContent = 'Confirm PIN';
                        }, 1000);
                    }
                }
            }, 200);
        }
    },
    pinDelete: () => {
        if (Setup.pinEntry.length > 0) {
            Setup.pinEntry = Setup.pinEntry.slice(0, -1);
            Setup.updatePinDots();
        }
    },
    pinBack: () => {
        Setup.pinConfirming = false;
        Setup.pinFirst = '';
        Setup.pinEntry = '';
        document.getElementById('setup-pin-status').textContent = 'Enter a PIN';
        document.getElementById('setup-pin-back').style.visibility = 'hidden';
        Setup.updatePinDots();
    },
    updatePinDots: () => {
        const container = document.getElementById('setup-pin-dots');
        let html = '';
        for (let i = 0; i < 4; i++) {
            html += `<div class="setup-pin-dot ${i < Setup.pinEntry.length ? 'filled' : ''}"></div>`;
        }
        container.innerHTML = html;
    },
    finish: () => {
        const el = document.getElementById('setup-screen');
        el.classList.add('fade-out');
        if (Setup.helloInterval) clearInterval(Setup.helloInterval);
        setTimeout(() => {
            el.classList.remove('active', 'fade-out');
            localStorage.setItem('realos_setup_status', 'done');
            LockScreen.unlock(true);
        }, 500);
    }
};
const LockScreen = {
    currentPin: '',
    init: () => {
        const ls = document.getElementById('lock-screen');
        let startY = 0;
        ls.addEventListener('touchstart', e => startY = e.touches[0].clientY);
        ls.addEventListener('touchend', e => {
            if (!State.poweredOn) return;
            if (startY && e.changedTouches[0].clientY - startY < -50) LockScreen.attemptUnlock();
            startY = 0;
        });
        ls.addEventListener('mousedown', e => startY = e.clientY);
        window.addEventListener('mouseup', e => {
            if (!State.poweredOn) return;
            if (startY && State.locked && e.clientY - startY < -50 && e.target.closest('#lock-screen')) LockScreen.attemptUnlock();
            startY = 0;
        });
        const bioBtn = document.getElementById('ls-biometric');
        let holdTimer = null;
        let isHolding = false;
        const startScan = (e) => {
            e.stopPropagation(); e.preventDefault();
            if (!State.security.fingerprint) return;
            isHolding = true;
            bioBtn.classList.add('scanning');
            holdTimer = setTimeout(() => {
                if (isHolding) {
                    LockScreen.unlock();
                    bioBtn.classList.remove('scanning');
                    isHolding = false;
                }
            }, State.security.slowFingerprint ? 1250 : 250);
        };
        const endScan = (e) => {
            e.stopPropagation(); e.preventDefault();
            clearTimeout(holdTimer);
            isHolding = false;
            bioBtn.classList.remove('scanning');
        };
        bioBtn.addEventListener('mousedown', startScan);
        bioBtn.addEventListener('mouseup', endScan);
        bioBtn.addEventListener('mouseleave', endScan);
        bioBtn.addEventListener('touchstart', startScan);
        bioBtn.addEventListener('touchend', endScan);

        const pinPad = document.getElementById('ls-pin-pad');
        let pinStartY = 0;
        pinPad.addEventListener('touchstart', (e) => { pinStartY = e.touches[0].clientY; }, { passive: true });
        pinPad.addEventListener('touchmove', (e) => {
            if (!pinStartY) return;
            const deltaY = e.touches[0].clientY - pinStartY;
            if (deltaY > 60) {
                LockScreen.cancelPin();
                pinStartY = 0;
            }
        }, { passive: true });
        pinPad.addEventListener('mousedown', (e) => { pinStartY = e.clientY; });
        window.addEventListener('mousemove', (e) => {
            if (pinStartY && e.buttons === 1) {
                const deltaY = e.clientY - pinStartY;
                if (deltaY > 60) {
                    LockScreen.cancelPin();
                    pinStartY = 0;
                }
            }
        });
        window.addEventListener('mouseup', () => { pinStartY = 0; });

        let _lastLsTapTime = 0;
        let _lastLsTapY = 0;
        const handleLsDoubleTap = (clientY) => {
            const now = Date.now();
            if (now - _lastLsTapTime < 300 && Math.abs(clientY - _lastLsTapY) < 15) {
                _lastLsTapTime = 0;
                if (!State.lsCustomizing) {
                    OS.togglePower();
                }
            } else {
                _lastLsTapTime = now;
                _lastLsTapY = clientY;
            }
        };
        ls.addEventListener('touchend', (e) => {
            if (e.target.closest('#ls-biometric') || e.target.closest('#ls-pin-pad')) return;
            handleLsDoubleTap(e.changedTouches[0].clientY);
        });
        ls.addEventListener('click', (e) => {
            if (e.target.closest('#ls-biometric') || e.target.closest('#ls-pin-pad')) return;
            handleLsDoubleTap(e.clientY);
        });

        const powerLayer = document.getElementById('power-layer');
        let _lastPowerTapTime = 0;
        powerLayer.addEventListener('touchend', (e) => {
            if (e.target.closest('#ls-biometric')) return;
            const now = Date.now();
            if (now - _lastPowerTapTime < 300) {
                _lastPowerTapTime = 0;
                if (!State.poweredOn) OS.togglePower();
            } else {
                _lastPowerTapTime = now;
            }
        });
        powerLayer.addEventListener('click', (e) => {
            if (e.target.closest('#ls-biometric')) return;
            const now = Date.now();
            if (now - _lastPowerTapTime < 300) {
                _lastPowerTapTime = 0;
                if (!State.poweredOn) OS.togglePower();
            } else {
                _lastPowerTapTime = now;
            }
        });

        let _lsHoldTimer = null;
        let _lsHoldStartX = 0;
        let _lsHoldStartY = 0;
        const startLsHold = (x, y) => {
            _lsHoldStartX = x;
            _lsHoldStartY = y;
            _lsHoldTimer = setTimeout(() => {
                if (State.poweredOn && State.locked && !State.lsCustomizing) {
                    LockScreen.enterCustomization();
                }
            }, 500);
        };
        const cancelLsHold = () => { clearTimeout(_lsHoldTimer); _lsHoldTimer = null; };
        const moveLsHold = (x, y) => {
            if (_lsHoldTimer && (Math.abs(x - _lsHoldStartX) > 10 || Math.abs(y - _lsHoldStartY) > 10)) cancelLsHold();
        };
        ls.addEventListener('touchstart', (e) => {
            if (e.target.closest('#ls-biometric') || e.target.closest('#ls-pin-pad')) return;
            startLsHold(e.touches[0].clientX, e.touches[0].clientY);
        });
        ls.addEventListener('touchmove', (e) => moveLsHold(e.touches[0].clientX, e.touches[0].clientY));
        ls.addEventListener('touchend', cancelLsHold);
        ls.addEventListener('mousedown', (e) => {
            if (e.target.closest('#ls-biometric') || e.target.closest('#ls-pin-pad')) return;
            startLsHold(e.clientX, e.clientY);
        });
        ls.addEventListener('mousemove', (e) => moveLsHold(e.clientX, e.clientY));
        ls.addEventListener('mouseup', cancelLsHold);

        LockScreen.updateUI();
    },
    shake: () => {
        const els = [document.getElementById('ls-biometric'), document.getElementById('ls-pin-pad')];
        els.forEach(el => {
            if (el) {
                el.classList.add('shake');
                setTimeout(() => el.classList.remove('shake'), 400);
            }
        });
    },
    lock: () => {
        const wallLayer = document.getElementById('wallpaper-layer');
        if (wallLayer && State.homescreenBlur) {
            wallLayer.style.transition = 'filter 0.4s ease-out';
            wallLayer.style.filter = 'blur(0px)';
        }

        setTimeout(() => {
            State.locked = true;
            ControlCenter.forceClose();
            document.body.classList.add('ls-active');
            document.getElementById('lock-screen').classList.remove('hidden');
            document.getElementById('home-screen').classList.add('hidden-locked');
            document.getElementById('ls-pin-pad').classList.remove('active');
            document.getElementById('global-clock').classList.remove('in-statusbar');
            OS.applySettings();
            LockScreen.currentPin = '';
            const bioBtn = document.getElementById('ls-biometric');
            if (bioBtn) { bioBtn.style.transition = ''; bioBtn.style.opacity = ''; }
            LockScreen.updateUI();
            if (wallLayer) {
                wallLayer.style.transition = '';
                wallLayer.style.filter = '';
            }
        }, 300);
    },
    unlock: () => {
        if (!State.poweredOn) OS.togglePower();
        State.locked = false;
        const bioBtn = document.getElementById('ls-biometric');
        if (bioBtn) {
            bioBtn.style.transition = 'opacity 0.01s ease';
            bioBtn.style.opacity = '0';
        }
        document.getElementById('lock-screen').classList.add('hidden');
        document.getElementById('home-screen').classList.remove('hidden-locked');
        document.getElementById('global-clock').classList.add('in-statusbar');
        document.body.classList.remove('ls-blurred');
        const homeUrl = State.wallpapers[State.currentWall] || '';
        const lockUrl = State.wallpapers[State.lockWall] || '';
        if (homeUrl !== lockUrl) {
            const lockLayer = document.getElementById('lock-wallpaper-layer');
            const wallLayer = document.getElementById('wallpaper-layer');
            if (lockLayer) {
                lockLayer.style.transition = 'opacity 0.3s ease';
                lockLayer.style.filter = 'blur(20px)';
            }
            if (wallLayer) {
                wallLayer.style.filter = 'blur(20px)';
                wallLayer.style.transition = 'filter 0.25s ease';
            }
            document.body.classList.remove('ls-active');
            setTimeout(() => {
                if (wallLayer) {
                    wallLayer.style.filter = '';
                    wallLayer.style.transition = '';
                }
                if (lockLayer) {
                    lockLayer.style.filter = '';
                    lockLayer.style.transition = '';
                }
            }, 250);
        } else {
            document.body.classList.remove('ls-active');
        }
        Island.notifyUnlock();
        OS.updateWallpaperEffect();
        const grid = document.getElementById('app-grid');
        const dock = document.getElementById('dock');
        if (grid) {
            const screenEl = document.getElementById('screen');
            const phoneW = screenEl.offsetWidth;
            const phoneH = screenEl.offsetHeight;
            const gridIcons = Array.from(grid.querySelectorAll('.app-icon'));
            const dockIcons = dock ? Array.from(dock.querySelectorAll('.app-icon')) : [];
            const cols = 4;
            const colFracs = [-0.7, -0.2333333, 0.2333333, 0.7];
            const rowYStart = -0.44;
            const rowYStep = 0.24;
            const iconCells = gridIcons.map((icon, idx) => {
                const gr = parseInt(icon.style.gridRow) || 0;
                const gc = parseInt(icon.style.gridColumn) || 0;
                const r = gr > 0 ? gr - 1 : Math.floor(idx / cols);
                const c = gc > 0 ? gc - 1 : idx % cols;
                return { r, c, idx };
            });
            const maxRow = iconCells.reduce((m, ic) => Math.max(m, ic.r), 0);
            const gridRows = maxRow + 1;
            const unlockTransforms = {};
            iconCells.forEach(({ r, c, idx }) => {
                const clampC = Math.max(0, Math.min(cols - 1, c));
                const tx = colFracs[clampC] * phoneW;
                const ty = (rowYStart + r * rowYStep) * phoneH;
                unlockTransforms[idx] = `translate(${tx}px, ${ty}px) scale(3)`;
            });
            const groups = [];
            if (gridRows >= 4) {
                groups.push([]);
                iconCells.forEach(({ r, c, idx }) => {
                    if (r >= 1 && r < gridRows - 1 && c >= 1 && c <= 2) groups[0].push(idx);
                });
                groups.push([]);
                iconCells.forEach(({ r, c, idx }) => {
                    if (r >= 1 && r < gridRows - 1 && (c === 0 || c === 3)) groups[1].push(idx);
                });
                groups.push([]);
                iconCells.forEach(({ r, c, idx }) => {
                    if ((r === 0 || r === gridRows - 1) && c >= 1 && c <= 2) groups[2].push(idx);
                });
                groups.push([]);
                iconCells.forEach(({ r, c, idx }) => {
                    if ((r === 0 || r === gridRows - 1) && (c === 0 || c === 3)) groups[3].push(idx);
                });
            } else {
                for (let r = 0; r < gridRows; r++) {
                    const rowGroup = [];
                    iconCells.forEach(({ r: ir, idx }) => {
                        if (ir === r) rowGroup.push(idx);
                    });
                    groups.push(rowGroup);
                }
            }
            const delayPerGroup = 60;
            const duration = 520;
            const easing = 'cubic-bezier(.38, 1.22, .27, 1)';
            groups.forEach((idxGroup, gi) => {
                const delay = gi * delayPerGroup;
                idxGroup.forEach(idx => {
                    const icon = gridIcons[idx];
                    if (!icon) return;
                    icon.animate(
                        [
                            { opacity: 0, transform: unlockTransforms[idx], filter: State.liteMode ? 'none' : 'blur(10px)', offset: 0 },
                            { opacity: 1, filter: 'blur(0px)', offset: 0.3 },
                            { opacity: 1, transform: 'none', filter: 'blur(0px)', offset: 1 }
                        ],
                        { duration, delay, easing, fill: 'backwards' }
                    );
                });
            });
            const dockDelay = ((groups.length - 1) * delayPerGroup) + (duration * 0.25);
            const dockEl = document.getElementById('dock');
            if (dockEl) {
                dockEl.animate(
                    [
                        { opacity: 0, transform: 'translateY(100px)' },
                        { opacity: 1, transform: 'translateY(0)' }
                    ],
                    { duration: 400, delay: dockDelay, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' }
                );
            }
        }
    },
    attemptUnlock: () => {
        if (State.security.pin) {
            document.getElementById('ls-pin-pad').classList.add('active');
            LockScreen.renderDots();
        } else {
            LockScreen.unlock();
        }
    },
    updateUI: () => {
        const bioBtn = document.getElementById('ls-biometric');
        if (State.security.fingerprint) {
            bioBtn.style.display = 'flex';

            const icon = State.security.bioIcon;
            if (bioBtn.dataset.currentIcon === icon) return;

            bioBtn.dataset.currentIcon = icon;
            bioBtn.className = '';
            bioBtn.innerHTML = '';
            if (icon === 'glow-circle') {
                bioBtn.style.border = 'none';
                bioBtn.style.background = 'transparent';
                bioBtn.style.backdropFilter = 'none';
                bioBtn.innerHTML = '<div class="bio-glow-circle"></div><div class="bio-blur-wave"></div>';
            } else if (icon === 'blur-ring') {
                bioBtn.style.border = 'none';
                bioBtn.style.background = 'transparent';
                bioBtn.style.backdropFilter = 'none';
                bioBtn.innerHTML = '<div class="bio-blur-ring"></div><div class="bio-ocean-wave"></div>';
            } else if (icon === 'pulse-dot') {
                bioBtn.style.border = 'none';
                bioBtn.style.background = 'transparent';
                bioBtn.style.backdropFilter = 'none';
                bioBtn.innerHTML = '<div class="bio-pulse-dot"></div><div class="bio-pulse-rings"></div>';
            } else if (icon === 'frost-ring') {
                bioBtn.style.border = 'none';
                bioBtn.style.background = 'transparent';
                bioBtn.style.backdropFilter = 'none';
                bioBtn.innerHTML = '<div class="bio-frost-ring"></div><div class="bio-frost-wave"></div>';
            } else if (icon === 'diamond') {
                bioBtn.style.border = 'none';
                bioBtn.style.background = 'transparent';
                bioBtn.style.backdropFilter = 'none';
                bioBtn.innerHTML = '<div class="bio-ripple-ring"></div><div class="bio-ripple-wave"></div>';
            } else if (icon === 'fingerprint') {
                bioBtn.style.border = 'none';
                bioBtn.style.background = 'transparent';
                bioBtn.style.backdropFilter = 'none';
                bioBtn.innerHTML = '<i class="fas fa-fingerprint" style="font-size:28px;color:white"></i><div class="bio-print-wave"></div>';
            } else {
                bioBtn.style.border = '4px solid rgba(145,147,151,0.7)';
                bioBtn.style.background = 'transparent';
                bioBtn.style.backdropFilter = 'none';
                bioBtn.innerHTML = '<div class="bio-default-glow"></div>';
            }
        }
        else bioBtn.style.display = 'none';
    },
    addPin: (n) => {
        if (LockScreen.currentPin.length < 4) {
            LockScreen.currentPin += n;
            LockScreen.renderDots();
            if (LockScreen.currentPin.length === 4) LockScreen.verifyPin();
        }
    },
    cancelPin: () => {
        document.getElementById('ls-pin-pad').classList.remove('active');
        LockScreen.currentPin = '';
        LockScreen.renderDots();
    },
    renderDots: () => {
        const dots = document.getElementById('ls-dots').children;
        for (let i = 0; i < 4; i++) {
            if (i < LockScreen.currentPin.length) dots[i].classList.add('filled');
            else dots[i].classList.remove('filled');
        }
    },
    verifyPin: () => {
        setTimeout(() => {
            if (LockScreen.currentPin === State.security.pin) {
                LockScreen.unlock();
            } else {
                LockScreen.shake();
                LockScreen.currentPin = '';
                LockScreen.renderDots();
            }
        }, 200);
    },
    enterCustomization: () => {
        if (State.lsCustomizing) return;
        State.lsCustomizing = true;
        LockScreen._customizeEnteredAt = Date.now();
        const ls = document.getElementById('lock-screen');
        const bio = document.getElementById('ls-biometric');
        const gClock = document.getElementById('global-clock');
        const device = document.getElementById('device');

        document.body.classList.add('ls-customizing-active');

        let backdrop = document.getElementById('ls-custom-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.id = 'ls-custom-backdrop';
            backdrop.className = 'ls-custom-backdrop';
            backdrop.addEventListener('click', (e) => {
                LockScreen.exitCustomization();
            });
            device.appendChild(backdrop);
        }
        requestAnimationFrame(() => backdrop.classList.add('active'));

        const scr = document.getElementById('screen');
        if (scr && scr.animate) {
            scr.animate(
                [{ transform: 'scale(1)', borderRadius: '48px' }, { transform: 'scale(0.85)', borderRadius: '60px' }],
                { duration: 400, easing: 'cubic-bezier(0.32, 0.72, 0, 1)' }
            );
        }

        LockScreen._screenEmptyClickHandler = (e) => {
            if (!State.lsCustomizing) return;
            if (Date.now() - (LockScreen._customizeEnteredAt || 0) < 600) return;
            if (e.target.closest('#global-clock') || e.target.closest('#ls-custom-sheet') || e.target.closest('.ls-widget')) return;
            LockScreen.exitCustomization();
        };
        if (scr) scr.addEventListener('click', LockScreen._screenEmptyClickHandler);

        ls.classList.add('ls-customizing');

        if (bio) { bio.style.transition = 'opacity 0.3s ease'; bio.style.opacity = '0'; bio.style.pointerEvents = 'none'; }

        if (gClock) gClock.classList.add('ls-clock-box');
        LockScreen._clockBoxHandler = (e) => {
            e.stopPropagation();
            e.preventDefault();
            LockScreen.showClockSheet();
        };
        if (gClock) gClock.addEventListener('click', LockScreen._clockBoxHandler);
    },
    exitCustomization: () => {
        if (!State.lsCustomizing) return;
        State.lsCustomizing = false;
        const ls = document.getElementById('lock-screen');
        const bio = document.getElementById('ls-biometric');
        const gClock = document.getElementById('global-clock');

        const sheet = document.getElementById('ls-custom-sheet');
        if (sheet) { sheet.classList.remove('active'); setTimeout(() => sheet.remove(), 550); }

        const backdrop = document.getElementById('ls-custom-backdrop');
        if (backdrop) { backdrop.classList.remove('active'); setTimeout(() => backdrop.remove(), 350); }

        ls.classList.remove('ls-customizing');
        document.body.classList.remove('ls-customizing-active');

        const scr = document.getElementById('screen');
        if (scr && scr.animate) {
            const anim = scr.animate(
                [{ transform: 'scale(0.85)', borderRadius: '60px' }, { transform: 'scale(1)', borderRadius: '48px' }],
                { duration: 400, easing: 'cubic-bezier(0.32, 0.72, 0, 1)' }
            );
            anim.onfinish = () => {
                scr.style.borderRadius = '';
                scr.style.transform = '';
            };
        }
        if (scr && LockScreen._screenEmptyClickHandler) {
            scr.removeEventListener('click', LockScreen._screenEmptyClickHandler);
            LockScreen._screenEmptyClickHandler = null;
        }

        if (bio && State.security.fingerprint) {
            bio.style.transition = 'opacity 0.3s ease';
            bio.style.opacity = '1';
            bio.style.pointerEvents = 'auto';
        }

        if (gClock) {
            gClock.classList.remove('ls-clock-box');
            if (LockScreen._clockBoxHandler) gClock.removeEventListener('click', LockScreen._clockBoxHandler);
        }
    },
    showClockSheet: () => {
        if (document.getElementById('ls-custom-sheet')) return;
        const device = document.getElementById('device');
        const cc = State.clockConfig || {};
        const fw = cc.fontWeight || 200;
        const bOp = cc.boldOpacity !== undefined ? cc.boldOpacity : 0.72;
        const cf = cc.font || 'default';
        const fontNames = { default: 'Inter', serif: 'Serif', science: 'Science Gothic', mono: 'Monoton', lux: 'Luxurious Roman' };
        const isStretched = cc.style === 'stretched';

        const sheet = document.createElement('div');
        sheet.id = 'ls-custom-sheet';
        sheet.className = 'ls-custom-sheet';
        sheet.addEventListener('click', (e) => e.stopPropagation());
        sheet.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <span style="font-size:18px; font-weight:600; color:#fff;">Clock</span>
                <button id="ls-sheet-done" style="background:none; border:none; color:#0a84ff; font-size:16px; font-weight:600; cursor:pointer; padding:6px 12px;">Done</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:14px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:#fff; font-size:15px;">Style</span>
                    <div class="settings-dropdown" id="ls-clock-style">
                        <div class="sd-trigger" onclick="Apps.settings.toggleDropdown(this)">
                            <span class="sd-value" id="ls-style-val">${cc.style === 'stretched' ? 'Stretched' : cc.style === 'tilt' ? 'Tilt' : 'Default'}</span>
                            <i class="fas fa-chevron-down sd-chevron"></i>
                        </div>
                        <div class="sd-options">
                            <div class="sd-option" data-val="default"><span>Default</span>${cc.style === 'default' || !cc.style ? '<i class="fas fa-check"></i>' : ''}</div>
                            <div class="sd-option" data-val="stretched"><span>Stretched</span>${isStretched ? '<i class="fas fa-check"></i>' : ''}</div>
                            <div class="sd-option" data-val="tilt"><span>Tilt</span>${cc.style === 'tilt' ? '<i class="fas fa-check"></i>' : ''}</div>
                        </div>
                    </div>
                </div>
                <div id="ls-sheet-font-row" style="display:flex; justify-content:space-between; align-items:center; ${isStretched ? 'opacity:0.4; pointer-events:none;' : ''}">
                    <span style="color:#fff; font-size:15px;" id="ls-font-label">${isStretched ? 'Font (disabled)' : 'Font'}</span>
                    <div class="settings-dropdown" id="ls-clock-font">
                        <div class="sd-trigger" onclick="Apps.settings.toggleDropdown(this)">
                            <span class="sd-value" id="ls-font-val">${fontNames[cf] || 'Inter'}</span>
                            <i class="fas fa-chevron-down sd-chevron"></i>
                        </div>
                        <div class="sd-options">
                            <div class="sd-option" data-val="default"><span>Inter</span>${cf == 'default' ? '<i class="fas fa-check"></i>' : ''}</div>
                            <div class="sd-option" data-val="serif"><span style="font-family:'Times New Roman', serif">Serif</span>${cf == 'serif' ? '<i class="fas fa-check"></i>' : ''}</div>
                            <div class="sd-option" data-val="science"><span style="font-family:'Rajdhani', sans-serif">Science Gothic</span>${cf == 'science' ? '<i class="fas fa-check"></i>' : ''}</div>
                            <div class="sd-option" data-val="mono"><span style="font-family:'Monoton', cursive">Monoton</span>${cf == 'mono' ? '<i class="fas fa-check"></i>' : ''}</div>
                            <div class="sd-option" data-val="lux"><span style="font-family:'Luxurious Roman', serif">Luxurious Roman</span>${cf == 'lux' ? '<i class="fas fa-check"></i>' : ''}</div>
                        </div>
                    </div>
                </div>
                <div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:6px;"><span style="color:#fff; font-size:15px;">Font Weight</span><span id="ls-fw-val" style="color:rgba(255,255,255,0.6); font-size:14px;">${fw}</span></div>
                    <div class="custom-slider" data-min="100" data-max="900" data-step="100" data-value="${fw}" data-oninput="State.clockConfig = State.clockConfig || {}; State.clockConfig.fontWeight = value; document.getElementById('ls-fw-val').innerText = value; Storage.saveSettings(); OS.updateTime();"><div class="cs-track"><div class="cs-fill"><div class="cs-thumb"></div></div></div></div>
                </div>
                <div style="display:flex; gap:16px; align-items:center;">
                    <span style="color:#fff; font-size:15px; flex:1;">Hour Color</span>
                    <input type="color" id="ls-sheet-hc" value="${cc.hourColor && cc.hourColor.startsWith('#') ? cc.hourColor : '#ffffff'}" style="border:none; background:none; width:36px; height:36px; cursor:pointer; padding:0;" />
                </div>
                <div style="display:flex; gap:16px; align-items:center;">
                    <span style="color:#fff; font-size:15px; flex:1;">Minute Color</span>
                    <input type="color" id="ls-sheet-mc" value="${cc.minuteColor && cc.minuteColor.startsWith('#') ? cc.minuteColor : '#ffffff'}" style="border:none; background:none; width:36px; height:36px; cursor:pointer; padding:0;" />
                </div>
                <div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:6px;"><span style="color:#fff; font-size:15px;">Opacity</span><span id="ls-op-val" style="color:rgba(255,255,255,0.6); font-size:14px;">${Math.round(bOp * 100)}%</span></div>
                    <div class="custom-slider" data-min="20" data-max="100" data-step="1" data-value="${Math.round(bOp * 100)}" data-oninput="State.clockConfig = State.clockConfig || {}; State.clockConfig.boldOpacity = value / 100; document.getElementById('ls-op-val').innerText = Math.round(value) + '%'; Storage.saveSettings(); OS.updateTime();"><div class="cs-track"><div class="cs-fill"><div class="cs-thumb"></div></div></div></div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:#fff; font-size:15px;">Apply colors to status bar</span>
                    <div id="ls-sheet-sb-color" class="toggle ${cc.statusBarColor ? 'active' : ''}"></div>
                </div>
            </div>
        `;
        device.appendChild(sheet);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => sheet.classList.add('active'));
            if (Apps.settings && Apps.settings.initSliders) {
                const sheetSliders = sheet.querySelectorAll('.custom-slider');
                sheetSliders.forEach(slider => {
                    slider._csInit = false;
                });
                Apps.settings.initSliders();
            }
        });

        document.getElementById('ls-sheet-done').addEventListener('click', () => {
            const sheet = document.getElementById('ls-custom-sheet');
            if (sheet) {
                sheet.classList.remove('active');
                setTimeout(() => sheet.remove(), 550);
            }
        });

        document.getElementById('ls-sheet-sb-color').addEventListener('click', (e) => {
            State.clockConfig = State.clockConfig || {};
            State.clockConfig.statusBarColor = !State.clockConfig.statusBarColor;
            e.target.classList.toggle('active', State.clockConfig.statusBarColor);
            Storage.saveSettings();
            OS.updateTime();
        });

        sheet.querySelectorAll('#ls-clock-style .sd-option').forEach(opt => {
            opt.addEventListener('click', (e) => {
                const val = opt.getAttribute('data-val');
                const isS = val === 'stretched';
                State.clockConfig = State.clockConfig || {};
                State.clockConfig.style = val;
                Storage.saveSettings();
                OS.applySettings();
                OS.updateTime();

                const fRow = document.getElementById('ls-sheet-font-row');
                if (fRow) fRow.style.cssText = 'display:flex; justify-content:space-between; align-items:center;';
                const fLabel = document.getElementById('ls-font-label');
                if (fLabel) fLabel.innerText = 'Font';

                const dd = document.getElementById('ls-clock-style');
                dd.classList.remove('open');
                dd.querySelector('.sd-value').innerText = opt.querySelector('span').innerText;
                dd.querySelectorAll('.fa-check').forEach(i => i.remove());
                opt.insertAdjacentHTML('beforeend', '<i class="fas fa-check"></i>');
            });
        });

        sheet.querySelectorAll('#ls-clock-font .sd-option').forEach(opt => {
            opt.addEventListener('click', (e) => {
                const val = opt.getAttribute('data-val');
                State.clockConfig = State.clockConfig || {};
                State.clockConfig.font = val;
                Storage.saveSettings();
                OS.applySettings();
                OS.updateTime();

                const dd = document.getElementById('ls-clock-font');
                dd.classList.remove('open');
                dd.querySelector('.sd-value').innerText = opt.querySelector('span').innerText;
                dd.querySelectorAll('.fa-check').forEach(i => i.remove());
                opt.insertAdjacentHTML('beforeend', '<i class="fas fa-check"></i>');
            });
        });

        document.getElementById('ls-sheet-hc').addEventListener('input', (e) => {
            State.clockConfig = State.clockConfig || {};
            State.clockConfig.hourColor = e.target.value;
            State.clockConfig.autoColor = false;
            Storage.saveSettings(); OS.updateTime();
        });

        document.getElementById('ls-sheet-mc').addEventListener('input', (e) => {
            State.clockConfig = State.clockConfig || {};
            State.clockConfig.minuteColor = e.target.value;
            State.clockConfig.autoColor = false;
            Storage.saveSettings(); OS.updateTime();
        });
    }
};
const ControlCenter = {
    isOpen: false,
    _closeTimer: null,
    _openTimer: null,
    init: () => {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'e' || e.key === 'E') {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                if (!State.poweredOn || State.locked) return;
                e.preventDefault();
                ControlCenter.toggle();
            }
        });
        const screen = document.getElementById('screen');
        let ccStartY = 0;
        let ccTracking = false;

        const updateCCProgress = (diff, isRelease = false) => {
            const maxPull = 300;
            const progress = Math.max(0, Math.min(1, diff / maxPull));
            const overlay = document.getElementById('cc-overlay');
            const statusBar = document.querySelector('.status-bar');
            const clock = statusBar ? statusBar.querySelector('#clock') : null;
            const globalClock = document.getElementById('global-clock');

            if (!isRelease) {
                if (!ControlCenter.isOpen) {
                    if (ControlCenter._closeTimer) { clearTimeout(ControlCenter._closeTimer); ControlCenter._closeTimer = null; }
                    document.body.classList.add('cc-open');
                }
                overlay.style.transition = 'none';
                if (statusBar) statusBar.style.transition = 'none';
                if (globalClock) globalClock.style.transition = 'none';
                if (clock) clock.style.transition = 'none';

                overlay.style.opacity = progress;
                if (globalClock) globalClock.style.opacity = '0';
                if (statusBar) {
                    statusBar.style.transform = `translateY(${progress * 40}px)`;
                    statusBar.style.zIndex = '2500';
                }
                if (clock) clock.style.opacity = '1';
            } else {
                const ease = '0.45s cubic-bezier(0.2, 0.85, 0.1, 1)';
                overlay.style.transition = '';
                if (statusBar) statusBar.style.transition = `transform ${ease}`;
                if (globalClock) globalClock.style.transition = `opacity 0.2s ease`;
                if (clock) clock.style.transition = `opacity 0.2s ease`;

                if (progress > 0.1 || diff > 50) {
                    overlay.style.opacity = '';
                    if (globalClock) globalClock.style.opacity = '0';
                    if (statusBar) statusBar.style.transform = 'translateY(40px)';
                    if (clock) clock.style.opacity = '1';
                    ControlCenter.open();
                } else {
                    overlay.style.opacity = '';
                    if (globalClock) globalClock.style.opacity = '';
                    if (statusBar) statusBar.style.transform = '';
                    if (clock) clock.style.opacity = '';
                    if (!ControlCenter.isOpen) {
                        document.body.classList.remove('cc-open');
                    } else {
                        ControlCenter.close();
                    }
                }
            }
        };

        screen.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const rect = screen.getBoundingClientRect();
            const scaleFactor = document.fullscreenElement ? 1 : rect.width / 400;
            const localX = (touch.clientX - rect.left) / scaleFactor;
            const localY = (touch.clientY - rect.top) / scaleFactor;
            if (localX > 200 && localY < 50 && !State.locked && State.poweredOn && (!ControlCenter.isOpen || (ControlCenter.isOpen && localY < 50))) {
                ccStartY = touch.clientY;
                ccTracking = true;
            }
        }, { passive: true });

        screen.addEventListener('touchmove', (e) => {
            if (!ccTracking) return;
            const diff = e.touches[0].clientY - ccStartY;
            if (diff > 0) {
                if (e.cancelable) e.preventDefault();
                updateCCProgress(diff);
            }
        }, { passive: false });

        screen.addEventListener('touchend', (e) => {
            if (!ccTracking) return;
            const diff = e.changedTouches[0].clientY - ccStartY;
            updateCCProgress(diff, true);
            ccTracking = false;
        });

        const statusBar = document.querySelector('.status-bar');
        if (statusBar) {
            const rightArea = statusBar.querySelector('div');
            if (rightArea) {
                rightArea.style.pointerEvents = 'auto';
                rightArea.style.cursor = 'grab';
                let dragStartY = 0;
                let dragging = false;
                rightArea.addEventListener('mousedown', (e) => {
                    if (!State.locked && State.poweredOn && (!ControlCenter.isOpen || (ControlCenter.isOpen && e.clientY < 50))) {
                        dragStartY = e.clientY;
                        dragging = true;
                        rightArea.style.cursor = 'grabbing';
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });
                document.addEventListener('mousemove', (e) => {
                    if (!dragging) return;
                    if (e.buttons !== 1) {
                        dragging = false;
                        rightArea.style.cursor = 'grab';
                        return;
                    }
                    const diff = e.clientY - dragStartY;
                    if (diff > 0) updateCCProgress(diff);
                });
                document.addEventListener('mouseup', (e) => {
                    if (dragging) {
                        const diff = e.clientY - dragStartY;
                        updateCCProgress(diff, true);
                        dragging = false;
                        rightArea.style.cursor = 'grab';
                    }
                });
                rightArea.addEventListener('wheel', (e) => {
                    if (!State.locked && State.poweredOn && e.deltaY > 0 && !ControlCenter.isOpen) {
                        e.preventDefault();
                        e.stopPropagation();
                        ControlCenter.open();
                    }
                }, { passive: false });
            }
        }
        ControlCenter.bindVerticalSliders();
    },
    bindVerticalSliders: () => {
        document.querySelectorAll('.cc-slider-tile').forEach((tile) => {
            if (tile.dataset.ccBound) return;
            tile.dataset.ccBound = '1';
            const input = tile.querySelector('.cc-vslider');
            if (!input) return;
            let dragging = false;
            const syncFromY = (clientY) => {
                const r = tile.getBoundingClientRect();
                const h = r.height || 1;
                const min = parseInt(input.min, 10);
                const max = parseInt(input.max, 10);
                const ratio = 1 - (clientY - r.top) / h;
                const v = Math.round(min + Math.max(0, Math.min(1, ratio)) * (max - min));
                input.value = String(v);
                if (input.id === 'cc-brightness') ControlCenter.setBrightness(v);
                else if (input.id === 'cc-volume') ControlCenter.setVolume(v);
            };
            tile.addEventListener('pointerdown', (e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                e.stopPropagation();
                dragging = true;
                tile.setPointerCapture(e.pointerId);
                tile.classList.add('cc-slider-dragging');
                const panel = document.getElementById('cc-panel');
                if (panel) panel.style.overflowY = 'hidden';
                syncFromY(e.clientY);
            });
            tile.addEventListener('pointermove', (e) => {
                if (!dragging) return;
                e.preventDefault();
                syncFromY(e.clientY);
            });
            const endDrag = (e) => {
                if (!dragging) return;
                dragging = false;
                tile.classList.remove('cc-slider-dragging');
                const panel = document.getElementById('cc-panel');
                if (panel) panel.style.overflowY = '';
            };
            tile.addEventListener('pointerup', endDrag);
            tile.addEventListener('pointercancel', endDrag);
        });
    },
    toggle: () => {
        if (ControlCenter.isOpen) ControlCenter.close();
        else ControlCenter.open();
    },
    open: () => {
        if (!State.poweredOn || State.locked) return;
        if (ControlCenter._closeTimer) { clearTimeout(ControlCenter._closeTimer); ControlCenter._closeTimer = null; }
        ControlCenter._animVersion = (ControlCenter._animVersion || 0) + 1;
        ControlCenter.isOpen = true;
        ControlCenter.syncState();
        const overlay = document.getElementById('cc-overlay');
        const panel = document.getElementById('cc-panel');
        const statusBar = document.querySelector('.status-bar');
        const clock = statusBar ? statusBar.querySelector('#clock') : null;
        const globalClock = document.getElementById('global-clock');
        document.body.classList.add('cc-open');
        panel.classList.remove('cc-closing');
        overlay.classList.add('cc-visible');
        panel.classList.add('cc-visible');
        if (globalClock) { globalClock.style.transition = 'none'; globalClock.style.opacity = '0'; }
        if (statusBar) {
            statusBar.style.transition = 'transform 0.45s cubic-bezier(0.2, 0.85, 0.1, 1)';
            statusBar.style.transform = 'translateY(40px)';
            statusBar.style.zIndex = '2500';
            statusBar.style.pointerEvents = 'none';
        }
        if (clock) { clock.style.transition = 'none'; clock.style.opacity = '1'; }
    },
    close: () => {
        if (!ControlCenter.isOpen) return;
        ControlCenter.isOpen = false;
        ControlCenter._animVersion = (ControlCenter._animVersion || 0) + 1;
        const ver = ControlCenter._animVersion;
        const overlay = document.getElementById('cc-overlay');
        const panel = document.getElementById('cc-panel');
        const statusBar = document.querySelector('.status-bar');
        const clock = statusBar ? statusBar.querySelector('#clock') : null;
        const globalClock = document.getElementById('global-clock');
        panel.classList.add('cc-closing');
        overlay.classList.remove('cc-visible');
        document.body.classList.remove('cc-open');
        if (statusBar) {
            statusBar.style.transition = 'transform 0.45s cubic-bezier(0.2, 0.85, 0.1, 1)';
            statusBar.style.transform = '';
            statusBar.style.pointerEvents = '';
            const onDone = (e) => {
                if (e.propertyName !== 'transform') return;
                statusBar.removeEventListener('transitionend', onDone);
                if (ver !== ControlCenter._animVersion) return;
                if (clock) { clock.style.transition = 'none'; clock.style.opacity = '0'; }
                if (globalClock) { globalClock.style.transition = 'none'; globalClock.style.opacity = '1'; }
                statusBar.style.transition = '';
                statusBar.style.zIndex = '';

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        if (ver !== ControlCenter._animVersion) return;
                        if (clock) clock.style.transition = '';
                        if (globalClock) globalClock.style.transition = '';
                    });
                });
            };
            statusBar.addEventListener('transitionend', onDone);
        }
        ControlCenter._closeTimer = setTimeout(() => {
            if (ver !== ControlCenter._animVersion) return;
            panel.classList.remove('cc-visible');
            panel.classList.remove('cc-closing');
            ControlCenter._closeTimer = null;
        }, 550);
    },
    forceClose: () => {
        ControlCenter.isOpen = false;
        ControlCenter._animVersion = (ControlCenter._animVersion || 0) + 1;
        if (ControlCenter._closeTimer) { clearTimeout(ControlCenter._closeTimer); ControlCenter._closeTimer = null; }
        const overlay = document.getElementById('cc-overlay');
        const panel = document.getElementById('cc-panel');
        const statusBar = document.querySelector('.status-bar');
        const clock = statusBar ? statusBar.querySelector('#clock') : null;
        const globalClock = document.getElementById('global-clock');
        document.body.classList.remove('cc-open');
        overlay.classList.remove('cc-visible');
        panel.classList.remove('cc-visible');
        panel.classList.remove('cc-closing');
        if (statusBar) { statusBar.style.transition = ''; statusBar.style.transform = ''; statusBar.style.zIndex = ''; statusBar.style.pointerEvents = ''; }
        if (clock) { clock.style.transition = ''; clock.style.opacity = ''; }
        if (globalClock) { globalClock.style.transition = ''; globalClock.style.opacity = ''; }
    },
    syncState: () => {
        const ccBright = document.getElementById('cc-brightness');
        if (ccBright) {
            ccBright.value = State.brightness || 100;
            const bMin = parseInt(ccBright.min), bMax = parseInt(ccBright.max);
            const bPct = ((ccBright.value - bMin) / (bMax - bMin)) * 100;
            ccBright.closest('.cc-slider-tile').style.setProperty('--fill', bPct + '%');
        }
        const ccVol = document.getElementById('cc-volume');
        if (ccVol && typeof Music !== 'undefined' && Music.audio) {
            ccVol.value = Math.round(Music.audio.volume * 100);
            const vMin = parseInt(ccVol.min), vMax = parseInt(ccVol.max);
            const vPct = ((ccVol.value - vMin) / (vMax - vMin)) * 100;
            ccVol.closest('.cc-slider-tile').style.setProperty('--fill', vPct + '%');
        }
        const ccTitle = document.getElementById('cc-media-title');
        const ccArtist = document.getElementById('cc-media-artist');
        const ccArt = document.getElementById('cc-media-art');
        const ccPlayBtn = document.getElementById('cc-play-btn');
        if (typeof Music !== 'undefined' && Music.active && Music.library && Music.library.length > 0) {
            const current = Music.library[Music.currentIdx] || {};
            if (ccTitle) ccTitle.textContent = current.title || 'Unknown';
            if (ccArtist) ccArtist.textContent = current.artist || 'Unknown Artist';
            if (ccArt) ccArt.style.backgroundImage = current.art ? `url('${current.art}')` : '';
            if (ccPlayBtn) ccPlayBtn.className = Music.audio && !Music.audio.paused ? 'fas fa-pause' : 'fas fa-play';
        } else {
            if (ccTitle) ccTitle.textContent = 'Not Playing';
            if (ccArtist) ccArtist.textContent = '';
            if (ccArt) ccArt.style.backgroundImage = '';
            if (ccPlayBtn) ccPlayBtn.className = 'fas fa-play';
        }
    },
    setBrightness: (v) => {
        State.brightness = parseInt(v);
        document.getElementById('brightness-layer').style.opacity = (100 - State.brightness) / 100;
        const el = document.getElementById('cc-brightness');
        if (el) {
            const min = parseInt(el.min), max = parseInt(el.max);
            el.closest('.cc-slider-tile').style.setProperty('--fill', (((v - min) / (max - min)) * 100) + '%');
        }
        const sun = document.getElementById('cc-sun-icon');
        if (sun) {
            sun.style.transform = `rotate(${v * 2}deg)`;
        }
        Storage.saveSettings();
    },
    setVolume: (v) => {
        if (typeof Music !== 'undefined' && Music.audio) {
            Music.audio.volume = parseInt(v) / 100;
        }
        const el = document.getElementById('cc-volume');
        if (el) {
            const min = parseInt(el.min), max = parseInt(el.max);
            el.closest('.cc-slider-tile').style.setProperty('--fill', (((v - min) / (max - min)) * 100) + '%');
        }
    },
    toggleVisual: (el) => {
        el.classList.toggle('active');
        const circles = Array.from(document.querySelectorAll('.cc-circle'));
        State.ccToggles = State.ccToggles || {};
        State.ccToggles.circles = circles.map(e => e.classList.contains('active'));
        Storage.saveSettings();
    },
    toggleTile: (el) => {
        el.classList.toggle('active');
        const tiles = Array.from(document.querySelectorAll('.cc-tile[onclick^="ControlCenter.toggleTile"]'));
        State.ccToggles = State.ccToggles || {};
        State.ccToggles.tiles = tiles.map(e => e.classList.contains('active'));
        Storage.saveSettings();
    }
};
const AppManager = {
    origin: null,
    closingApps: {},
    currentZIndex: 100,
    open: (id) => {
        if (document.body.classList.contains('home-edit-mode') && typeof OS !== 'undefined' && OS.exitEditMode) {
            OS.exitEditMode();
        }
        if (ControlCenter.isOpen) ControlCenter.close();
        clearTimeout(AppManager._blurTimeout);
        if (State.blurBehindApps) {
            document.querySelectorAll('.app-window-closing-clone').forEach(clone => {
                const cloneAppId = clone.dataset.appId;
                if (cloneAppId && cloneAppId !== id && clone.animate) {
                    clone.animate([{ filter: 'blur(25px) brightness(0.5)' }], {
                        duration: 250,
                        easing: 'ease-out',
                        fill: 'forwards',
                        composite: 'add'
                    });
                }
            });
        }
        AppManager.closingApps = AppManager.closingApps || {};
        const oldClosingInfo = AppManager.closingApps[id];
        if (oldClosingInfo && oldClosingInfo.clone) {
            clearTimeout(oldClosingInfo.closeTimeout);
            clearTimeout(oldClosingInfo.iconFadeTimeout);
            const closeClone = oldClosingInfo.clone;
            if (closeClone && closeClone.isConnected) {
                if (closeClone._syncZoomState) { closeClone._syncZoomState.active = false; }
                const computed = window.getComputedStyle(closeClone);
                const rect = closeClone.getBoundingClientRect();
                const screenRect = document.getElementById('screen').getBoundingClientRect();
                const scale = document.fullscreenElement ? 1 : document.getElementById('scale-wrapper').getBoundingClientRect().width / 400;
                const curTop = (rect.top - screenRect.top) / scale;
                const curLeft = (rect.left - screenRect.left) / scale;
                const curW = parseFloat(computed.width) || rect.width / scale;
                const curH = parseFloat(computed.height) || rect.height / scale;
                const curRadius = computed.borderRadius;
                const startOpacity = computed.opacity || '1';
                let startZoom = curW / document.getElementById('screen').offsetWidth;
                const cloneHeader = closeClone.querySelector('#app-header') || closeClone.querySelector('.app-header');
                const cloneBody = closeClone.querySelector('.app-content') || closeClone.querySelector('#app-body');
                const headerOp = cloneHeader ? window.getComputedStyle(cloneHeader).opacity : '1';
                const bodyOp = cloneBody ? window.getComputedStyle(cloneBody).opacity : '1';

                delete AppManager.closingApps[id];
                if (Object.keys(AppManager.closingApps).length === 0) {
                    document.body.classList.remove('closing-active');
                }
                document.body.classList.add('app-open');

                if (State.animConfig.openAppFade) {
                    document.body.classList.add('fade-app-boxes');
                }
                if (State.homescreenBlur) {
                    if (State.animConfig.openWallBlur === false) {
                        document.body.classList.remove('hs-blur');
                    } else {
                        document.body.classList.add('hs-blur');
                    }
                }

                const homeScreenEl = document.getElementById('home-screen');
                if (State.animStyle === 'new' && homeScreenEl) {
                    const cmpScale = window.getComputedStyle(homeScreenEl).transform;
                    let mScale = 1;
                    if (cmpScale && cmpScale !== 'none') {
                        const v = cmpScale.match(/matrix\((.+)\)/);
                        if (v) mScale = parseFloat(v[1].split(',')[0]);
                    }
                    if (homeScreenEl._zoomAnim) homeScreenEl._zoomAnim.cancel();
                    const targetScale = (State.animConfig.openAppZoomOut !== undefined) ? State.animConfig.openAppZoomOut : 0.95;
                    homeScreenEl._zoomAnim = homeScreenEl.animate([
                        { transform: `scale(${mScale})` },
                        { transform: `scale(${targetScale})` }
                    ], {
                        duration: 500,
                        easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
                        fill: 'forwards'
                    });
                }

                const win = document.getElementById('app-window');
                State.activeApp = id;
                State.isAnimating = true;
                const isDarkApp = ['camera'].includes(id) || State.darkMode;
                OS.updateStatusBarColors(true, isDarkApp);
                win.classList.remove('closing', 'closing-custom');
                win.style.display = 'flex';
                win.style.transition = 'none';
                win.style.transformOrigin = 'top left';
                win.style.willChange = 'transform, width, height, border-radius, opacity';
                const header = document.getElementById('app-header');
                const appBody = document.getElementById('app-body');
                const appInfo = APPS.find(a => a.id === id) || (State.emptyApps ? State.emptyApps.find(a => a.id === id) : null) || { colorColor: '#888', hyperColor: '#888', color: '#888', name: id };
                if (header) {
                    header.style.color = isDarkApp ? '#fff' : '#000';
                    document.getElementById('app-title').innerText = id === 'settings' ? '' : (appInfo.name || id);
                    header.classList.remove('calc-header');
                }
                win.classList.remove('calc-app-bg');
                const appBack = document.getElementById('app-back');
                if (appBack) {
                    appBack.style.display = 'none';
                    appBack.onclick = AppManager.close;
                }
                if (typeof Apps !== 'undefined' && Apps[id] && Apps[id].render) {
                    Apps[id].render();
                } else if (appBody) {
                    appBody.innerHTML = `
                        <div style="height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; color:${isDarkApp ? '#fff' : '#000'}">
                            <i class="fas fa-tools" style="font-size:50px; margin-bottom:20px; opacity:0.3"></i>
                            <div style="font-size:22px; font-weight:600; margin-bottom:8px">Work in Progress</div>
                            <div style="font-size:15px; opacity:0.6; max-width:80%">This application is currently under development.</div>
                        </div>
                    `;
                }

                if (State.glassUI && appBody) {
                    appBody.style.background = 'transparent';
                } else if ((State.iconPack === 'hyperos' || State.iconPack === 'coloros') && appBody) {
                    appBody.style.background = isDarkApp ? '#000' : '#f2f2f7';
                } else if (appBody) {
                    appBody.style.background = '';
                }

                if (header) { header.style.transition = 'none'; header.style.opacity = headerOp; }
                if (appBody) { appBody.style.transition = 'none'; appBody.style.opacity = bodyOp; }
                if (header) header.style.zoom = startZoom;
                if (appBody) appBody.style.zoom = startZoom;
                win.style.transform = 'translate(0,0) scale(1)';
                win.style.top = `${curTop}px`;
                win.style.left = `${curLeft}px`;
                win.style.width = `${curW}px`;
                win.style.height = `${curH}px`;
                win.style.borderRadius = curRadius;
                win.style.opacity = startOpacity;
                win.style.zIndex = 10000;
                win.style.overflow = 'hidden';
                const iconEl = document.getElementById(`icon-${id}`);
                if (iconEl) iconEl.classList.add('app-current');

                const staleOverlays = win.querySelectorAll('#app-open-icon-overlay');
                staleOverlays.forEach(el => el.remove());

                const salvagedIconLayer = closeClone.querySelector('#close-icon-layer');
                if (salvagedIconLayer) {
                    const iconOp = window.getComputedStyle(salvagedIconLayer).opacity;
                    salvagedIconLayer.id = 'app-open-icon-overlay';
                    salvagedIconLayer.style.transition = 'none';
                    salvagedIconLayer.style.opacity = iconOp;
                    win.appendChild(salvagedIconLayer);
                }

                closeClone.remove();
                void win.offsetHeight;

                win.style.zIndex = AppManager.currentZIndex;
                if (State.homescreenBlur) document.body.classList.add('hs-blur');
                const totalDur = 0.5 * State.animationSpeed;
                win.style.transition = 'none';
                const openEase = 'cubic-bezier(' + (State.animConfig.openBezier || [0.2, 0.85, 0.1, 1]).join(', ') + ')';
                const openScaleEase = 'cubic-bezier(' + (State.animConfig.openScaleBezier || [0.2, 0.85, 0.1, 1]).join(', ') + ')';
                const scaleDur = (State.animConfig.openScaleTime || 0.5) * State.animationSpeed;

                if (AppManager._currentOpenAnim) { try { AppManager._currentOpenAnim.cancel(); } catch (e) { } }
                if (AppManager._currentScaleAnim) { try { AppManager._currentScaleAnim.cancel(); } catch (e) { } }

                if (header) {
                    header.style.transition = 'opacity 0.35s ease';
                    header.style.opacity = '1';
                }
                if (appBody) {
                    appBody.style.transition = 'opacity 0.35s ease';
                    appBody.style.opacity = '1';
                }

                const posAnim = win.animate([
                    { top: `${curTop}px`, left: `${curLeft}px`, opacity: startOpacity },
                    { top: '0px', left: '0px', opacity: '1' }
                ], { duration: totalDur * 1000, easing: openEase, fill: 'forwards' });

                const scaleAnim = win.animate([
                    { width: `${curW}px`, height: `${curH}px`, borderRadius: curRadius },
                    { width: '100%', height: '100%', borderRadius: '60px' }
                ], { duration: scaleDur * 1000, easing: openScaleEase, fill: 'forwards' });

                win._syncZoomState = { active: true };
                const scrW = document.getElementById('screen').offsetWidth;
                const sEl = document.getElementById('scale-wrapper');
                const updateZ = () => {
                    if (!win._syncZoomState.active) return;
                    const cS = document.fullscreenElement ? 1 : sEl.getBoundingClientRect().width / 400;
                    const bW = win.getBoundingClientRect().width / cS;
                    const z = bW / scrW;
                    if (header) header.style.zoom = z;
                    if (appBody) appBody.style.zoom = z;
                    requestAnimationFrame(updateZ);
                };
                requestAnimationFrame(updateZ);

                AppManager._currentOpenAnim = posAnim;
                AppManager._currentScaleAnim = scaleAnim;

                posAnim.onfinish = () => {
                    if (win._syncZoomState) { win._syncZoomState.active = false; }
                    win.style.top = '0px';
                    win.style.left = '0px';
                    win.style.width = '100%';
                    win.style.height = '100%';
                    win.style.borderRadius = '60px';
                    win.style.opacity = '1';
                    win.classList.remove('app-animating');
                    win.style.overflow = '';
                    win.style.willChange = '';
                    if (header) header.style.zoom = '';
                    if (appBody) appBody.style.zoom = '';
                    State.isAnimating = false;
                    Island.update();
                };
                let iconOverlay = win.querySelector('#app-open-icon-overlay');
                if (iconOverlay) {
                    iconOverlay.style.transition = 'none';
                    iconOverlay.animate([{ opacity: window.getComputedStyle(iconOverlay).opacity || '1' }, { opacity: '0' }], {
                        duration: totalDur * 1000 * (State.animConfig.openIconFade || 1),
                        easing: 'ease',
                        fill: 'forwards'
                    });
                    const fIcon = iconOverlay.querySelector('.photos-icon-flower') || iconOverlay.querySelector('.settings-icon-gear') || iconOverlay.querySelector('.camera-icon-lens');
                    if (fIcon) {
                        fIcon.style.transition = `transform ${totalDur}s cubic-bezier(0.2, 0.85, 0.1, 1)`;
                        if (fIcon.classList.contains('settings-icon-gear')) {
                            fIcon.style.transform = 'scale(2.05)';
                        } else if (fIcon.classList.contains('camera-icon-lens')) {
                            fIcon.style.transform = 'scale(2.5)';
                        } else {
                            fIcon.style.transform = 'scale(1.8)';
                        }
                    }
                }
                if (header) { header.style.opacity = '1'; }
                if (appBody) { appBody.style.opacity = '1'; }
                setTimeout(() => {
                    if (iconOverlay && iconOverlay.parentNode) iconOverlay.remove();
                }, 200 * State.animationSpeed);
                return;
            }
        } else {
            delete AppManager.closingApps[id];
            if (Object.keys(AppManager.closingApps).length === 0) {
                document.body.classList.remove('closing-active');
            }
        }
        if (State.activeApp === id && !AppManager.closingApps[id]) return;
        if (State.activeApp && State.activeApp !== id) {
            if (AppManager._switchCooldown && Date.now() - AppManager._switchCooldown < 150) return;
            AppManager._switchCooldown = Date.now();
            const oldId = State.activeApp;
            const win = document.getElementById('app-window');
            if (AppManager._currentOpenAnim) { try { AppManager._currentOpenAnim.cancel(); } catch (e) { } AppManager._currentOpenAnim = null; }
            if (AppManager._currentScaleAnim) { try { AppManager._currentScaleAnim.cancel(); } catch (e) { } AppManager._currentScaleAnim = null; }
            const liveComp = window.getComputedStyle(win);
            const liveOpacity = parseFloat(liveComp.opacity);
            const liveRect = win.getBoundingClientRect();
            if (win.getAnimations) { win.getAnimations().forEach(a => { try { a.cancel(); } catch (e) { } }); }
            AppManager._openAnimGen = (AppManager._openAnimGen || 0) + 1;
            if (liveOpacity > 0.01 && liveRect.width > 10 && liveRect.height > 10) {
                const screenEl = document.getElementById('screen');
                const scaleWrapper = document.getElementById('scale-wrapper');
                const scaleFactor = document.fullscreenElement ? 1 : scaleWrapper.getBoundingClientRect().width / 400;
                const sRect = screenEl.getBoundingClientRect();
                const curTop = (liveRect.top - sRect.top) / scaleFactor;
                const curLeft = (liveRect.left - sRect.left) / scaleFactor;
                const curW = liveRect.width / scaleFactor;
                const curH = liveRect.height / scaleFactor;
                win.style.transition = 'none';
                win.style.top = `${curTop}px`;
                win.style.left = `${curLeft}px`;
                win.style.width = `${curW}px`;
                win.style.height = `${curH}px`;
                win.style.borderRadius = liveComp.borderRadius;
                win.style.background = liveComp.backgroundColor;
                win.style.transform = 'translate(0,0) scale(1)';
                win.style.opacity = liveOpacity;
                win.style.filter = 'none';
                AppManager.close();
            } else {
                win.style.transition = 'none';
                win.style.display = 'none';
                win.style.transform = '';
                win.style.top = '';
                win.style.left = '';
                win.style.width = '';
                win.style.height = '';
                win.style.borderRadius = '';
                win.style.opacity = '';
                win.style.overflow = '';
                win.style.filter = '';
                win.classList.remove('app-animating', 'closing', 'closing-custom', 'hyperos-anim');
                const oldOverlay = win.querySelector('#app-open-icon-overlay');
                if (oldOverlay) oldOverlay.remove();
                const oldIconEl = document.getElementById(`icon-${oldId}`);
                if (oldIconEl) {
                    oldIconEl.classList.remove('app-current');
                    const oldIconBox = oldIconEl.querySelector('.icon-box') || oldIconEl;
                    oldIconBox.style.opacity = '1';
                    oldIconBox.style.visibility = 'visible';
                }
                document.body.classList.remove('app-open');
                document.body.classList.remove('fade-app-boxes');
                if (State.homescreenBlur) document.body.classList.add('hs-blur');
                document.body.classList.remove('closing-active');
                State.activeApp = null;
                State.isAnimating = false;
            }
        }
        let inheritedIconOpacity = null;
        const existingClones = document.querySelectorAll(`.app-window-closing-clone[data-app-id="${id}"]`);
        existingClones.forEach(existingClone => {
            const staleCloseLayer = existingClone.querySelector('#close-icon-layer');
            if (staleCloseLayer && inheritedIconOpacity === null) {
                inheritedIconOpacity = parseFloat(window.getComputedStyle(staleCloseLayer).opacity);
            }
            existingClone.remove();
        });
        if (AppManager.closingApps && AppManager.closingApps[id]) {
            clearTimeout(AppManager.closingApps[id].closeTimeout);
            clearTimeout(AppManager.closingApps[id].iconFadeTimeout);
            delete AppManager.closingApps[id];
        }
        if (Object.keys(AppManager.closingApps || {}).length === 0) {
            document.body.classList.remove('closing-active');
        }
        const staleIcon = document.getElementById(`icon-${id}`);
        if (staleIcon) {
            staleIcon.classList.remove('app-current');
            const staleBox = staleIcon.querySelector('.icon-box') || staleIcon;
            staleBox.style.opacity = '1';
            staleBox.style.visibility = 'visible';
        }
        State.activeApp = id;
        State.isAnimating = true;
        AppManager._openAnimGen = (AppManager._openAnimGen || 0) + 1;
        const _openGen = AppManager._openAnimGen;
        const win = document.getElementById('app-window');
        const extraOverlays = win.querySelectorAll('.settings-section-overlay');
        extraOverlays.forEach(el => el.remove());
        const launchMainVeil = document.getElementById('settings-main-dim-veil');
        if (launchMainVeil) launchMainVeil.remove();
        const staleIconOverlay = win.querySelector('#app-open-icon-overlay');
        if (staleIconOverlay) staleIconOverlay.remove();
        const staleCloseLayer = win.querySelector('#close-icon-layer');
        if (staleCloseLayer) staleCloseLayer.remove();

        AppManager.currentZIndex += 10;
        win.style.zIndex = AppManager.currentZIndex;
        const iconEl = document.getElementById(`icon-${id}`);
        const icon = iconEl.querySelector('.icon-box');
        iconEl.classList.add('app-current');
        icon.classList.remove('fade-in-anim');
        icon.style.transition = '';
        icon.style.opacity = '';
        icon.style.visibility = '';
        const iRect = icon.getBoundingClientRect();
        const sRect = document.getElementById('screen').getBoundingClientRect();
        const scaleFactor = document.fullscreenElement ? 1 : document.getElementById('scale-wrapper').getBoundingClientRect().width / 400;
        const startWidth = icon.offsetWidth;
        const startHeight = icon.offsetHeight;
        const cx = iRect.left + (iRect.width / 2);
        const cy = iRect.top + (iRect.height / 2);
        const startLeft = ((cx - sRect.left) / scaleFactor) - (startWidth / 2);
        const startTop = ((cy - sRect.top) / scaleFactor) - (startHeight / 2);
        AppManager.origin = { top: startTop, left: startLeft, w: startWidth, h: startHeight };
        win.style.top = `${startTop}px`;
        win.style.left = `${startLeft}px`;
        win.style.width = `${startWidth}px`;
        win.style.height = `${startHeight}px`;
        let shapePct = parseFloat(OS.getShapeRadius()) / 100;
        let startRadiusForAnim = (startWidth * shapePct) + 'px';
        if (parseInt(State.appShape) >= 45) {
            startRadiusForAnim = (Math.min(startWidth, startHeight) / 2) + 'px';
        }
        win.style.borderRadius = startRadiusForAnim;
        win.style.opacity = '0';
        win.style.display = 'flex';
        void win.offsetWidth;
        win.style.transition = 'none';
        win.style.transformOrigin = 'top left';
        win.style.transform = 'translate(0,0) scale(1)';
        win.style.willChange = 'transform, width, height, border-radius, opacity';
        const appInfo = APPS.find(a => a.id === id) || (State.emptyApps ? State.emptyApps.find(a => a.id === id) : null) || { colorColor: '#888', hyperColor: '#888', color: '#888' };
        win.classList.add('app-animating');

        const packColorNorm = State.iconPack === 'hyperos' ? appInfo.hyperColor : (State.iconPack === 'coloros' ? appInfo.colorColor : null);
        let overlayBg = 'transparent';
        if ((State.iconPack === 'hyperos' || State.iconPack === 'coloros') && packColorNorm) {
            overlayBg = 'transparent';
        } else if (appInfo.id === 'settings') {
            overlayBg = appInfo.color || '#8e8e93';
        } else if (appInfo.id === 'camera') {
            overlayBg = 'linear-gradient(135deg, #fbfbfb 0%, #e8e8e8 50%, #d1d1d1 100%)';
        } else if (appInfo.id === 'music') {
            overlayBg = '#fa2d48';
        } else if (appInfo.id === 'clock') {
            overlayBg = '#fff';
        } else if (id.startsWith('empty_')) {
            overlayBg = '#888';
        } else {
            overlayBg = icon.style.background || appInfo.color || '#000';
        }
        win.style.background = overlayBg;

        const isDarkApp = ['camera'].includes(id) || State.darkMode;
        const iconOverlay = document.createElement('div');
        iconOverlay.id = 'app-open-icon-overlay';

        let startOp = 1;
        if (inheritedIconOpacity !== null && !isNaN(inheritedIconOpacity)) {
            startOp = inheritedIconOpacity;
        }

        iconOverlay.style.cssText = `
                    position: absolute;
                    inset: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    pointer-events: none;
                    border-radius: inherit;
                    opacity: ${startOp};
                    transition: opacity ${State.animConfig.openIconFade * State.animationSpeed}s ease;
                `;

        const packIconNorm = State.iconPack === 'hyperos' ? appInfo.hyperIcon : (State.iconPack === 'coloros' ? appInfo.colorIcon : null);
        const isImagePackNorm = (State.iconPack === 'hyperos' || State.iconPack === 'coloros') && packIconNorm;
        if (isImagePackNorm) {
            iconOverlay.innerHTML = `<img src="${packIconNorm}" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit; transform: scale(1.0);">`;
        } else if (appInfo.id === 'photos') {
            iconOverlay.innerHTML = `<div style="width:100%; height:100%; border-radius:inherit; display:flex; justify-content:center; align-items:center; background:${overlayBg}; position:relative; overflow:hidden;"><div class="photos-icon-flower" style="transform: scale(1.0); transition: transform ${0.5 * State.animationSpeed}s cubic-bezier(0.2, 0.85, 0.1, 1);"><div class="petal-wrap p1"><div class="petal"></div></div><div class="petal-wrap p2"><div class="petal"></div></div><div class="petal-wrap p3"><div class="petal"></div></div><div class="petal-wrap p4"><div class="petal"></div></div><div class="petal-wrap p5"><div class="petal"></div></div><div class="petal-wrap p6"><div class="petal"></div></div><div class="petal-wrap p7"><div class="petal"></div></div><div class="petal-wrap p8"><div class="petal"></div></div></div></div>`;
        } else if (appInfo.id === 'settings') {
            iconOverlay.innerHTML = `<div style="width:100%; height:100%; border-radius:inherit; display:flex; justify-content:center; align-items:center; background:${overlayBg}; position:relative; overflow:hidden;"><div class="settings-icon-gear" style="transform: scale(1.15); transition: transform ${0.5 * State.animationSpeed}s cubic-bezier(0.2, 0.85, 0.1, 1);">
                <div class="gear-base"></div>
                <div class="gear-teeth">
                    <div class="tooth"></div><div class="tooth"></div><div class="tooth"></div>
                    <div class="tooth"></div><div class="tooth"></div><div class="tooth"></div>
                </div>
                <div class="gear-inner-ring"></div>
                <div class="gear-spoke spoke-1"></div><div class="gear-spoke spoke-2"></div><div class="gear-spoke spoke-3"></div>
                <div class="gear-center-dot"></div>
            </div></div>`;
        } else if (appInfo.id === 'camera') {
            iconOverlay.innerHTML = `<div style="width:100%; height:100%; border-radius:inherit; display:flex; justify-content:center; align-items:center; background:${overlayBg}; position:relative; overflow:hidden;"><div class="camera-icon-lens" style="transform: scale(1.39); transition: transform ${0.5 * State.animationSpeed}s cubic-bezier(0.2, 0.85, 0.1, 1);">
                <div class="camera-base"></div>
                <div class="lens-outer-ring"></div>
                <div class="lens-inner-black"></div>
                <div class="lens-core-glass"></div>
                <div class="lens-glare-1"></div>
                <div class="lens-glare-2"></div>
                <div class="flash-ring"><div class="flash-bulb"></div></div>
            </div></div>`;
        } else if (appInfo.id === 'music') {
            iconOverlay.innerHTML = `<div style="width:100%; height:100%; border-radius:inherit; display:flex; justify-content:center; align-items:center; background:${overlayBg}; position:relative; overflow:hidden;"><div class="music-icon-note" style="transform: scale(1.0); transition: transform ${0.5 * State.animationSpeed}s cubic-bezier(0.2, 0.85, 0.1, 1);">
                <div class="music-note">&#9834;</div>
                <div class="music-sparkles">
                    <div class="sparkle sparkle-lg" style="top:22%; right:2%;"></div>
                    <div class="sparkle sparkle-sm sparkle-green" style="top:55%; left:5%;"></div>
                    <div class="sparkle sparkle-xs sparkle-yellow" style="bottom:15%; left:22%;"></div>
                    <div class="sparkle sparkle-xs sparkle-orange" style="top:12%; right:22%;"></div>
                </div>
            </div></div>`;
        } else if (appInfo.id === 'clock') {
            const now = new Date();
            const hDeg = (now.getHours() % 12) * 30 + now.getMinutes() * 0.5;
            const mDeg = now.getMinutes() * 6;
            iconOverlay.innerHTML = `<div style="width:100%; height:100%; border-radius:inherit; display:flex; justify-content:center; align-items:center; background:${overlayBg}; position:relative; overflow:hidden;"><div class="clock-icon-face" style="transform: scale(1.0); transition: transform ${0.5 * State.animationSpeed}s cubic-bezier(0.2, 0.85, 0.1, 1);">
                <div class="clock-dial"></div>
                <div class="clock-hand clock-hour" style="transform: rotate(${hDeg}deg);"></div>
                <div class="clock-hand clock-minute" style="transform: rotate(${mDeg}deg);"></div>
                <div class="clock-center-dot"></div>
            </div></div>`;
        } else {
            const bg = appInfo.color || '#000';
            const lowBg = (bg || "").toLowerCase().trim();
            const isWhiteBg = lowBg === '#fff' || lowBg.startsWith('#ffffff') || lowBg === 'white' || lowBg.replace(/\s/g, '') === 'rgb(255,255,255)';
            const shadeColor = isWhiteBg ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)';
            const shadeHtml = `<div style="position:absolute; inset:0; background: radial-gradient(circle at top right, ${shadeColor} 0%, transparent 70%); pointer-events:none; border-radius:inherit; z-index:10;"></div>`;
            iconOverlay.innerHTML = `<div style="width:100%; height:100%; border-radius:inherit; display:flex; justify-content:center; align-items:center; background:${overlayBg || bg}; position:relative; overflow:hidden;">${shadeHtml}<i class="fas ${appInfo.icon}" style="font-size: 28px; color: ${appInfo.text || 'white'}; z-index: 2;"></i></div>`;
        }
        win.appendChild(iconOverlay);
        const header = document.getElementById('app-header');
        const appBody = document.getElementById('app-body');
        header.style.transition = 'none';
        header.style.opacity = '0';
        appBody.style.transition = 'none';
        appBody.style.opacity = '0';
        appBody.scrollTop = 0;
        win.scrollTop = 0;
        if (State.glassUI) {
            appBody.style.background = 'transparent';
        } else if (State.iconPack === 'hyperos' || State.iconPack === 'coloros') {
            const bgCol = isDarkApp ? '#000' : '#f2f2f7';
            appBody.style.background = bgCol;
        } else {
            appBody.style.background = '';
        }
        header.style.color = isDarkApp ? '#fff' : '#000';
        document.getElementById('app-title').innerText = id === 'settings' ? '' : appInfo.name;
        header.classList.remove('calc-header');
        win.classList.remove('calc-app-bg');
        document.getElementById('app-back').style.display = 'none';
        document.getElementById('app-back').onclick = AppManager.close;
        if (Apps[id] && Apps[id].render) {
            Apps[id].render();
        } else {
            if (appBody) {
                appBody.innerHTML = `
                            <div style="height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; color:${isDarkApp ? '#fff' : '#000'}">
                                <i class="fas fa-tools" style="font-size:50px; margin-bottom:20px; opacity:0.3"></i>
                                <div style="font-size:22px; font-weight:600; margin-bottom:8px">Work in Progress</div>
                                <div style="font-size:15px; opacity:0.6; max-width:80%">This application is currently under development.</div>
                            </div>
                        `;
            }
        }
        OS.updateStatusBarColors(true, isDarkApp);
        requestAnimationFrame(() => {
            if (AppManager._openAnimGen !== _openGen) return;
            requestAnimationFrame(() => {
                if (AppManager._openAnimGen !== _openGen) return;
                appBody.scrollTop = 0;
                win.scrollTop = 0;
                document.body.classList.remove('closing-active');
                if (AppManager._homeZoomTimeout) {
                    clearTimeout(AppManager._homeZoomTimeout);
                    AppManager._homeZoomTimeout = null;
                }
                const homeScreenEl = document.getElementById('home-screen');
                if (State.animStyle === 'new' && homeScreenEl) {
                    const cmpScale = window.getComputedStyle(homeScreenEl).transform;
                    let mScale = 1;
                    if (cmpScale && cmpScale !== 'none') {
                        const v = cmpScale.match(/matrix\((.+)\)/);
                        if (v) mScale = parseFloat(v[1].split(',')[0]);
                    }
                    if (homeScreenEl._zoomAnim) homeScreenEl._zoomAnim.cancel();

                    document.body.classList.add('app-open');

                    const targetScale = (State.animConfig.openAppZoomOut !== undefined) ? State.animConfig.openAppZoomOut : 0.95;
                    homeScreenEl._zoomAnim = homeScreenEl.animate([
                        { transform: `scale(${mScale})` },
                        { transform: `scale(${targetScale})` }
                    ], {
                        duration: 500,
                        easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
                        fill: 'forwards'
                    });
                } else {
                    document.body.classList.add('app-open');
                }

                const wallLayer = document.getElementById('wallpaper-layer');
                if (wallLayer) {
                    if (State.animConfig.wallBlurDur !== undefined) {
                        wallLayer.style.setProperty('--wall-blur-dur', `${State.animConfig.wallBlurDur}s`);
                    }
                }

                if (State.homescreenBlur) {
                    if (State.animConfig.openWallBlur === false) {
                        document.body.classList.remove('hs-blur');
                    } else {
                        document.body.classList.add('hs-blur');
                    }
                }
                if (State.animConfig.openAppFade) {
                    document.body.classList.add('fade-app-boxes');
                }
                const totalDur = 0.5 * State.animationSpeed;
                const startBg = win.style.background;
                let endBg = isDarkApp ? '#000' : '#f2f2f7';
                if (State.glassUI) endBg = State.darkMode ? 'rgba(30,30,30,0.65)' : 'rgba(243,243,243,0.65)';

                OS.updateStatusBarColors(true, isDarkApp);

                if (header) { header.style.transition = 'none'; header.style.opacity = '1'; }
                if (appBody) { appBody.style.transition = 'none'; appBody.style.opacity = '1'; }
                if (iconOverlay) {
                    void iconOverlay.offsetWidth;
                    iconOverlay.style.transition = `opacity ${totalDur * State.animConfig.openIconFade}s ease`;
                    iconOverlay.style.opacity = '0';
                }
                win.style.transition = 'none';
                win.style.overflow = 'hidden';
                const contentZoom = startWidth / document.getElementById('screen').offsetWidth;
                if (header) header.style.zoom = contentZoom;
                if (appBody) appBody.style.zoom = contentZoom;
                let startRadius = startRadiusForAnim;
                if (State.animStyle === 'new') {
                    win.style.transition = 'none';
                    const openEase = 'cubic-bezier(' + (State.animConfig.openBezier || [0.2, 0.85, 0.1, 1]).join(', ') + ')';
                    const openScaleEase = 'cubic-bezier(' + (State.animConfig.openScaleBezier || [0.2, 0.85, 0.1, 1]).join(', ') + ')';
                    const scaleDur = (State.animConfig.openScaleTime || 0.5) * State.animationSpeed;
                    const zoomStart = (State.animConfig.openAppZoomOut !== undefined) ? State.animConfig.openAppZoomOut : 0.95;
                    const homeScreen = document.getElementById('home-screen');
                    const topWallLayer = document.getElementById('wallpaper-layer');

                    const wallZoom = State.animConfig.openWallZoom !== undefined ? State.animConfig.openWallZoom : 1.05;

                    document.body.style.setProperty('--app-open-scale', zoomStart);
                    document.body.style.setProperty('--app-open-wall-scale', wallZoom);
                    if (State.animConfig.openWallBlur === false && !State.homescreenBlur) {
                        document.body.style.setProperty('--wall-blur-amt', '0px');
                    } else {
                        document.body.style.setProperty('--wall-blur-amt', '50px');
                    }

                    if (AppManager._currentOpenAnim) { try { AppManager._currentOpenAnim.cancel(); } catch (e) { } }
                    if (AppManager._currentScaleAnim) { try { AppManager._currentScaleAnim.cancel(); } catch (e) { } }

                    const posAnim = win.animate([
                        { top: startTop + 'px', left: startLeft + 'px', backgroundColor: startBg, opacity: 0 },
                        { top: startTop + 'px', left: startLeft + 'px', backgroundColor: startBg, opacity: 1, offset: 0.01 },
                        { backgroundColor: startBg, opacity: 1, offset: 0.2 },
                        { backgroundColor: endBg, opacity: 1, offset: 0.5 },
                        { top: '0px', left: '0px', backgroundColor: endBg, opacity: 1 }
                    ], {
                        duration: totalDur * 1000,
                        easing: openEase,
                        fill: 'forwards'
                    });
                    const screenWNum = document.getElementById('screen').offsetWidth;
                    const screenHNum = document.getElementById('screen').offsetHeight;
                    const scaleAnim = win.animate([
                        { width: startWidth + 'px', height: startHeight + 'px', borderRadius: startRadius, offset: 0 },
                        { width: '100%', height: '100%', borderRadius: '60px', offset: 1 }
                    ], {
                        duration: scaleDur * 1000,
                        easing: openScaleEase,
                        fill: 'forwards'
                    });
                    win._syncZoomState = { active: true };
                    const scrW = document.getElementById('screen').offsetWidth;
                    const sEl = document.getElementById('scale-wrapper');
                    const updateOpenZ = () => {
                        if (!win._syncZoomState.active) return;
                        const cS = document.fullscreenElement ? 1 : sEl.getBoundingClientRect().width / 400;
                        const bW = win.getBoundingClientRect().width / cS;
                        const z = bW / scrW;
                        if (header) header.style.zoom = z;
                        if (appBody) appBody.style.zoom = z;
                        requestAnimationFrame(updateOpenZ);
                    };
                    requestAnimationFrame(updateOpenZ);

                    AppManager._currentOpenAnim = posAnim;
                    AppManager._currentScaleAnim = scaleAnim;

                    posAnim.onfinish = () => {
                        if (win._syncZoomState) { win._syncZoomState.active = false; }
                        AppManager._currentOpenAnim = null;
                        AppManager._currentScaleAnim = null;
                        finalizeAnimation(win, endBg);
                    };
                }
                function finalizeAnimation(element, finalBg) {
                    element.style.transition = 'none';
                    element.style.top = '0px';
                    element.style.left = '0px';
                    element.style.width = '100%';
                    element.style.height = '100%';
                    element.style.borderRadius = '60px';
                    element.style.background = finalBg;
                    element.style.opacity = '1';
                    element.style.overflow = '';
                    if (header) header.style.zoom = '';
                    if (appBody) appBody.style.zoom = '';

                    if (iconOverlay && iconOverlay.parentNode) iconOverlay.remove();
                    State.isAnimating = false;
                    Island.update();
                }
                if (iconOverlay) {
                    const fIcon = iconOverlay.querySelector('.photos-icon-flower') || iconOverlay.querySelector('.settings-icon-gear') || iconOverlay.querySelector('.camera-icon-lens') || iconOverlay.querySelector('.music-icon-note') || iconOverlay.querySelector('.clock-icon-face');
                    if (fIcon) {
                        fIcon.style.transition = `transform ${totalDur}s cubic-bezier(0.2, 0.85, 0.1, 1)`;
                        if (fIcon.classList.contains('settings-icon-gear')) {
                            fIcon.style.transform = 'scale(2.05)';
                        } else if (fIcon.classList.contains('camera-icon-lens')) {
                            fIcon.style.transform = 'scale(2.5)';
                        } else if (fIcon.classList.contains('music-icon-note')) {
                            fIcon.style.transform = 'scale(2.0)';
                            const sparklesEl = fIcon.querySelector('.music-sparkles');
                            if (sparklesEl) {
                                sparklesEl.style.transition = `transform ${totalDur}s cubic-bezier(0.2, 0.85, 0.1, 1)`;
                                sparklesEl.style.transform = 'rotate(360deg)';
                            }
                        } else if (fIcon.classList.contains('clock-icon-face')) {
                            fIcon.style.transform = 'scale(2.0)';
                            const hourH = fIcon.querySelector('.clock-hour');
                            const minH = fIcon.querySelector('.clock-minute');
                            if (hourH) { hourH.style.transition = `transform ${totalDur}s cubic-bezier(0.2, 0.85, 0.1, 1)`; hourH.style.transform = `rotate(${parseFloat(hourH.style.transform.replace(/[^0-9.-]/g, '')) + 180}deg)`; }
                            if (minH) { minH.style.transition = `transform ${totalDur}s cubic-bezier(0.2, 0.85, 0.1, 1)`; minH.style.transform = `rotate(${parseFloat(minH.style.transform.replace(/[^0-9.-]/g, '')) + 360}deg)`; }
                        } else {
                            fIcon.style.transform = 'scale(1.8)';
                        }
                    }
                }
                setTimeout(() => {
                    if (AppManager._openAnimGen !== _openGen) return;
                    win.classList.remove('app-animating');
                    if (iconOverlay && iconOverlay.parentNode) iconOverlay.remove();
                    appBody.style.background = '';
                    if (State.glassUI) {
                        win.style.background = State.darkMode ? 'rgba(30,30,30,0.65)' : 'rgba(243,243,243,0.65)';
                    } else {
                        win.style.background = isDarkApp ? '#000' : '#f2f2f7';
                    }
                }, 200 * State.animationSpeed);
                setTimeout(() => {
                    if (AppManager._openAnimGen !== _openGen) return;
                    State.isAnimating = false; Island.update();
                    win.style.willChange = '';
                }, totalDur * 1000);
            });
        });
    },
    close: () => {
        document.querySelectorAll('.app-window-closing-clone').forEach(clone => {
            if (clone.getAnimations && clone.getAnimations().some(a => a.effect && a.effect.getKeyframes && a.effect.getKeyframes().some(k => k.filter))) {
                clone.animate([{ filter: 'blur(0px) brightness(1)' }], {
                    duration: 220,
                    delay: 0,
                    easing: 'ease-out',
                    fill: 'forwards'
                });
            }
        });
        const wallOverlay = document.getElementById('wall-expand-overlay');
        if (wallOverlay) {
            wallOverlay.style.opacity = '0';
            wallOverlay.style.transition = 'opacity 0.3s ease';
            setTimeout(() => wallOverlay.remove(), 300);
        }
        if (!State.activeApp) return;
        const win = document.getElementById('app-window');
        const id = State.activeApp;
        if (!State.poweredOn) {
            win.style.display = 'none';
            win.classList.remove('active', 'closing', 'app-open');
            document.body.classList.remove('app-open', 'fade-app-boxes');
            if (State.homescreenBlur) document.body.classList.add('hs-blur');

            if (State.animStyle === 'new') {
                const homeScreen = document.getElementById('home-screen');
                if (homeScreen) {
                    if (homeScreen._zoomAnim) homeScreen._zoomAnim.cancel();
                    homeScreen.style.transform = '';
                }
            }

            State.activeApp = null;
            State.isAnimating = false;
            document.getElementById('app-body').innerHTML = '';
            const nnModal = document.getElementById('new-note-modal');
            if (nnModal) nnModal.classList.remove('active');
            const icon = document.getElementById(`icon-${id}`);
            if (icon) {
                const iconBox = icon.querySelector('.icon-box') || icon;
                iconBox.style.opacity = '1';
                iconBox.style.visibility = 'visible';
            }
            return;
        }
        State.activeApp = null;
        State.isAnimating = true;
        AppManager._openAnimGen = (AppManager._openAnimGen || 0) + 1;
        AppManager.closingApps = AppManager.closingApps || {};
        document.body.classList.add('closing-active');
        Music.collapse();
        const nnModalActive = document.getElementById('new-note-modal');
        if (nnModalActive) nnModalActive.classList.remove('active');
        let appInfo = APPS.find(a => a.id === id) || (State.emptyApps ? State.emptyApps.find(a => a.id === id) : null) || { colorIcon: '', hyperIcon: '', color: '#888' };
        const homeScreen = document.getElementById('home-screen');
        const screenEl = document.getElementById('screen');
        const screenRect = screenEl.getBoundingClientRect();
        const homeRect = homeScreen.getBoundingClientRect();
        const scale = (homeRect.width > 10 && homeScreen.offsetWidth > 0) ? (homeRect.width / homeScreen.offsetWidth) : 1;
        const winRect = win.getBoundingClientRect();
        const comp = window.getComputedStyle(win);
        const curRadius = comp.borderRadius;
        const startTopScreen = (winRect.top - screenRect.top) / scale;
        const startLeftScreen = (winRect.left - screenRect.left) / scale;
        const startTopHome = (winRect.top - homeRect.top) / scale;
        const startLeftHome = (winRect.left - homeRect.left) / scale;
        const startW = winRect.width / scale;
        const startH = winRect.height / scale;
        const iconEl = document.getElementById(`icon-${id}`);
        let endTop = 0, endLeft = 0, endW = 0, endH = 0;
        if (iconEl) {
            const iconBox = iconEl.querySelector('.icon-box') || iconEl;

            let topAcc = 0;
            let leftAcc = 0;
            let curr = iconBox;
            while (curr && curr !== homeScreen) {
                topAcc += curr.offsetTop;
                leftAcc += curr.offsetLeft;
                curr = curr.offsetParent;
            }

            endTop = topAcc;
            endLeft = leftAcc;
            endW = iconBox.offsetWidth;
            endH = iconBox.offsetHeight;
        }
        const musicPlaying = Music.active && !Music.audio.paused;
        const timerActive = Timer.running || Timer.finished;
        const isSplit = musicPlaying && timerActive;
        const morphToIsland = false
        let islandMorphTarget = null;
        let islandTargetEl = null;
        if (morphToIsland) {
            const screenEl = document.getElementById('screen');
            const screenRect = screenEl.getBoundingClientRect();
            const scaleFactor = document.fullscreenElement ? 1 : screenRect.width / screenEl.offsetWidth;
            const island = document.getElementById('dynamic-island');
            const islandSec = document.getElementById('dynamic-island-sec');
            document.body.classList.remove('app-open');
            const islandWrap = document.getElementById('island-wrap');
            const savedTransitions = {
                island: island.style.transition,
                sec: islandSec.style.transition,
                wrap: islandWrap ? islandWrap.style.transition : ''
            };
            island.style.transition = 'none';
            islandSec.style.transition = 'none';
            if (islandWrap) islandWrap.style.transition = 'none';
            Island.update();
            void island.offsetWidth;
            void islandSec.offsetWidth;
            if (id === 'clock' && isSplit) {
                islandTargetEl = islandSec;
                islandSec.style.transition = 'opacity 0.1s ease';
                islandSec.style.opacity = '0';
                const secRect = islandSec.getBoundingClientRect();
                islandMorphTarget = {
                    top: (secRect.top - screenRect.top) / scaleFactor,
                    left: (secRect.left - screenRect.left) / scaleFactor,
                    w: secRect.width / scaleFactor,
                    h: secRect.height / scaleFactor,
                    radius: '50%'
                };
            } else if (id === 'music' && isSplit) {
                islandTargetEl = island;
                island.style.transition = 'opacity 0.1s ease';
                island.style.opacity = '0';
                const pillRect = island.getBoundingClientRect();
                islandMorphTarget = {
                    top: (pillRect.top - screenRect.top) / scaleFactor,
                    left: (pillRect.left - screenRect.left) / scaleFactor,
                    w: pillRect.width / scaleFactor,
                    h: pillRect.height / scaleFactor,
                    radius: '20px'
                };
            } else {
                islandTargetEl = island;
                island.style.transition = 'opacity 0.1s ease';
                island.style.opacity = '0';
                const islandRect = island.getBoundingClientRect();
                islandMorphTarget = {
                    top: (islandRect.top - screenRect.top) / scaleFactor,
                    left: (islandRect.left - screenRect.left) / scaleFactor,
                    w: islandRect.width / scaleFactor,
                    h: islandRect.height / scaleFactor,
                    radius: '20px'
                };
            }
            Island.isMorphing = true;
            island.style.transition = savedTransitions.island;
            islandSec.style.transition = savedTransitions.sec;
            if (islandWrap) islandWrap.style.transition = savedTransitions.wrap;
        }
        const appBodyEl = document.getElementById('app-body');
        const appHeaderEl = document.getElementById('app-header');
        const liveBodyOp = appBodyEl ? window.getComputedStyle(appBodyEl).opacity : '1';
        const liveHeaderOp = appHeaderEl ? window.getComputedStyle(appHeaderEl).opacity : '1';
        const liveBodyZoom = startW / document.getElementById('screen').offsetWidth;
        const liveHeaderZoom = liveBodyZoom;

        const closeClone = win.cloneNode(true);
        const settingsOverlay = document.getElementById('settings-section-overlay');
        if (settingsOverlay) settingsOverlay.remove();
        const settingsSubOverlay = document.getElementById('settings-sub-overlay');
        if (settingsSubOverlay) settingsSubOverlay.remove();
        const closeMainVeil = document.getElementById('settings-main-dim-veil');
        if (closeMainVeil) closeMainVeil.remove();
        if (appBodyEl) {
            const closeFade = appBodyEl.querySelector('.anim-fade');
            if (closeFade) { closeFade.style.transform = ''; closeFade.style.transition = ''; }
            appBodyEl.style.transform = ''; appBodyEl.style.filter = ''; appBodyEl.style.transition = '';
        }
        const appHeaderReset = document.getElementById('app-header');
        if (appHeaderReset) {
            appHeaderReset.classList.remove('settings-header-dim', 'settings-header-dim-visible');
            appHeaderReset.style.transform = ''; appHeaderReset.style.filter = ''; appHeaderReset.style.transition = ''; appHeaderReset.style.position = ''; appHeaderReset.style.top = ''; appHeaderReset.style.left = ''; appHeaderReset.style.right = ''; appHeaderReset.style.zIndex = '';
        }
        const screenAc = document.getElementById('screen');
        if (screenAc) screenAc.classList.remove('settings-subpage-dim');
        if (Apps.settings && Apps.settings.view) Apps.settings.view = 'root';
        if (morphToIsland) {
            closeClone.id = `app-window-morphing-${id}`;
            closeClone.classList.add('app-window-morphing-clone');
        } else {
            closeClone.id = `app-window-closing-${id}`;
            closeClone.classList.add('app-window-closing-clone');
            closeClone.dataset.appId = id;
        }
        const staleOpenLayer = closeClone.querySelector('#app-open-icon-overlay');
        if (staleOpenLayer) staleOpenLayer.remove();
        const staleCloseLayer = closeClone.querySelector('#close-icon-layer');
        if (staleCloseLayer) staleCloseLayer.remove();

        closeClone.querySelector('#new-note-modal')?.remove();
        closeClone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
        const computedBg = window.getComputedStyle(win).backgroundColor;
        closeClone.style.cssText = win.style.cssText;
        closeClone.style.background = computedBg;
        closeClone.style.position = 'absolute';
        closeClone.style.top = '0';
        closeClone.style.left = '0';
        closeClone.style.width = `${startW}px`;
        closeClone.style.height = `${startH}px`;
        closeClone.style.transform = `translate(${morphToIsland ? startLeftScreen : startLeftHome}px, ${morphToIsland ? startTopScreen : startTopHome}px)`;
        closeClone.style.zIndex = '100';
        closeClone.style.overflow = 'hidden';
        closeClone.style.transformOrigin = 'top left';
        closeClone.style.borderRadius = curRadius;
        closeClone.style.margin = '0';
        closeClone.style.transition = 'none';
        closeClone.style.pointerEvents = 'none';
        closeClone.style.flexDirection = 'column';
        closeClone.style.willChange = 'transform, width, height, border-radius, opacity';
        closeClone.style.backfaceVisibility = 'hidden';
        closeClone.style.webkitBackfaceVisibility = 'hidden';
        closeClone.style.outline = '1px solid transparent';
        const contentEl = closeClone.querySelector('.app-content') || closeClone.querySelector('#app-body');
        if (contentEl) {
            contentEl.style.opacity = liveBodyOp;
            contentEl.style.zoom = liveBodyZoom;
        }
        const headerElClone = closeClone.querySelector('#app-header') || closeClone.querySelector('.app-header');
        if (headerElClone) {
            headerElClone.style.opacity = liveHeaderOp;
            headerElClone.style.zoom = liveHeaderZoom;
        }
        const openIconOverlay = win.querySelector('#app-open-icon-overlay');
        const startIconOpacity = openIconOverlay ? parseFloat(window.getComputedStyle(openIconOverlay).opacity) : 0;
        const iconLayer = document.createElement('div');
        iconLayer.id = 'close-icon-layer';
        iconLayer.style.position = 'absolute';
        iconLayer.style.inset = '0';
        iconLayer.style.display = 'flex';
        iconLayer.style.justifyContent = 'center';
        iconLayer.style.alignItems = 'center';
        iconLayer.style.opacity = `${startIconOpacity}`;
        iconLayer.style.transition = 'none';
        iconLayer.style.zIndex = '9999';
        const packIconClose = State.iconPack === 'hyperos' ? appInfo.hyperIcon : (State.iconPack === 'coloros' ? appInfo.colorIcon : null);
        const isImagePackClose = (State.iconPack === 'hyperos' || State.iconPack === 'coloros') && packIconClose;
        let iconInner;
        if (isImagePackClose) {
            iconInner = document.createElement('img');
            iconInner.src = packIconClose;
            iconInner.style.cssText = `width: 100%; height: 100%; object-fit: cover; border-radius: inherit; transform: scale(1.0); transition: transform ${0.45 * State.animationSpeed}s cubic-bezier(0.32, 0.72, 0, 1); outline:none; border:none; box-shadow:none;`;
            iconLayer.style.outline = 'none';
            iconLayer.style.border = 'none';
            iconLayer.appendChild(iconInner);
        } else if (appInfo.id === 'photos') {
            const bg = appInfo.color || comp.backgroundColor;
            iconLayer.style.background = bg || '#fff';
            iconLayer.innerHTML = `<div class="photos-icon-flower" style="transform: scale(1.8); transition: transform ${0.45 * State.animationSpeed}s cubic-bezier(0.34, 1.15, 0.64, 1);"><div class="petal-wrap p1"><div class="petal"></div></div><div class="petal-wrap p2"><div class="petal"></div></div><div class="petal-wrap p3"><div class="petal"></div></div><div class="petal-wrap p4"><div class="petal"></div></div><div class="petal-wrap p5"><div class="petal"></div></div><div class="petal-wrap p6"><div class="petal"></div></div><div class="petal-wrap p7"><div class="petal"></div></div><div class="petal-wrap p8"><div class="petal"></div></div></div>`;
            iconLayer.style.outline = 'none';
            iconLayer.style.border = 'none';
        } else if (id.startsWith('empty_')) {
            iconLayer.style.background = '#888';
            iconLayer.style.outline = 'none';
            iconLayer.style.border = 'none';
        } else if (appInfo.id === 'settings') {
            const bg = appInfo.color || comp.backgroundColor;
            iconLayer.style.background = bg || '#8e8e93';
            iconLayer.innerHTML = `<div class="settings-icon-gear" style="transform: scale(2.05); transition: transform ${0.45 * State.animationSpeed}s cubic-bezier(0.34, 1.15, 0.64, 1);">
                <div class="gear-base"></div>
                <div class="gear-teeth">
                    <div class="tooth"></div><div class="tooth"></div><div class="tooth"></div>
                    <div class="tooth"></div><div class="tooth"></div><div class="tooth"></div>
                </div>
                <div class="gear-inner-ring"></div>
                <div class="gear-spoke spoke-1"></div><div class="gear-spoke spoke-2"></div><div class="gear-spoke spoke-3"></div>
                <div class="gear-center-dot"></div>
            </div>`;
            iconLayer.style.outline = 'none';
            iconLayer.style.border = 'none';
        } else if (appInfo.id === 'camera') {
            iconLayer.style.background = 'linear-gradient(135deg, #fbfbfb 0%, #e8e8e8 50%, #d1d1d1 100%)';
            iconLayer.innerHTML = `<div class="camera-icon-lens" style="transform: scale(2.5); transition: transform ${0.45 * State.animationSpeed}s cubic-bezier(0.34, 1.15, 0.64, 1);">
                <div class="camera-base"></div>
                <div class="lens-outer-ring"></div>
                <div class="lens-inner-black"></div>
                <div class="lens-core-glass"></div>
                <div class="lens-glare-1"></div>
                <div class="lens-glare-2"></div>
                <div class="flash-ring"><div class="flash-bulb"></div></div>
            </div>`;
            iconLayer.style.outline = 'none';
            iconLayer.style.border = 'none';
        } else if (appInfo.id === 'music') {
            iconLayer.style.background = '#fa2d48';
            iconLayer.innerHTML = `<div class="music-icon-note" style="transform: scale(2.0); transition: transform ${0.45 * State.animationSpeed}s cubic-bezier(0.34, 1.15, 0.64, 1);">
                <div class="music-note">&#9834;</div>
                <div class="music-sparkles">
                    <div class="sparkle sparkle-lg" style="top:22%; right:2%;"></div>
                    <div class="sparkle sparkle-sm sparkle-green" style="top:55%; left:5%;"></div>
                    <div class="sparkle sparkle-xs sparkle-yellow" style="bottom:15%; left:22%;"></div>
                    <div class="sparkle sparkle-xs sparkle-orange" style="top:12%; right:22%;"></div>
                </div>
            </div>`;
            iconLayer.style.outline = 'none';
            iconLayer.style.border = 'none';
        } else if (appInfo.id === 'clock') {
            iconLayer.style.background = '#fff';
            const now = new Date();
            const hDeg = (now.getHours() % 12) * 30 + now.getMinutes() * 0.5 + now.getSeconds() * (0.5 / 60);
            const mDeg = now.getMinutes() * 6 + now.getSeconds() * 0.1;
            iconLayer.innerHTML = `<div class="clock-icon-face" style="transform: scale(2.0); transition: transform ${0.45 * State.animationSpeed}s cubic-bezier(0.34, 1.15, 0.64, 1);">
                <div class="clock-dial"></div>
                <div class="clock-hand clock-hour" style="transform: rotate(${hDeg}deg);"></div>
                <div class="clock-hand clock-minute" style="transform: rotate(${mDeg}deg);"></div>
                <div class="clock-center-dot"></div>
            </div>`;
            iconLayer.style.outline = 'none';
            iconLayer.style.border = 'none';
        } else {
            const bg = appInfo.color || comp.backgroundColor;
            iconLayer.style.background = bg || '#000';
            iconInner = document.createElement('i');
            iconInner.className = `fas ${appInfo.icon}`;
            iconInner.style.cssText = `font-size: 28px; color: ${appInfo.text || 'white'}; display: flex; align-items: center; justify-content: center; line-height: 1; width: 100%; height: 100%; transition: font-size ${0.45 * State.animationSpeed}s cubic-bezier(0.32, 0.72, 0, 1);`;

            const lowBg = (bg || "").toString().toLowerCase().trim();
            const isWhiteBg = lowBg === '#fff' || lowBg.startsWith('#ffffff') || lowBg === 'white' || lowBg.replace(/\s/g, '') === 'rgb(255,255,255)';
            const shadeColor = isWhiteBg ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)';
            const shade = document.createElement('div');
            shade.style.cssText = `position:absolute; inset:0; background: radial-gradient(circle at top right, ${shadeColor} 0%, transparent 70%); pointer-events:none; border-radius:inherit; z-index:10;`;
            iconLayer.appendChild(shade);
            iconLayer.style.outline = 'none';
            iconLayer.style.border = 'none';
            iconLayer.appendChild(iconInner);
        }
        iconLayer.style.outline = 'none';

        if (!morphToIsland) {
            closeClone.appendChild(iconLayer);
            closeClone.style.pointerEvents = 'none';
            homeScreen.appendChild(closeClone);
        } else {
            closeClone.style.pointerEvents = 'none';
            const screenEl = document.getElementById('screen');
            const screenRect = screenEl.getBoundingClientRect();
            const scaleFactor = document.fullscreenElement ? 1 : screenRect.width / screenEl.offsetWidth;
            closeClone.style.transform = `translate(${(winRect.left - screenRect.left) / scaleFactor}px, ${(winRect.top - screenRect.top) / scaleFactor}px)`;
            closeClone.style.width = `${winRect.width / scaleFactor}px`;
            closeClone.style.height = `${winRect.height / scaleFactor}px`;
            closeClone.style.zIndex = '3001';
            let miniContentHtml = '';
            if (id === 'music') {
                const track = Music.library[Music.currentIdx];
                const artStyle = track && track.art ? `background-image:url('${track.art}'); background-size:cover;` : 'background:#333;';
                miniContentHtml = `<div style="display:flex; align-items:center; width:100%; height:100%; padding:0 10px;">
                    <div style="width:24px; height:24px; border-radius:6px; flex-shrink:0; margin-right:10px; ${artStyle}"></div>
                    <div class="di-wave" style="margin-left:auto;">
                        <div class="bar"></div>
                        <div class="bar"></div>
                        <div class="bar"></div>
                    </div>
                </div>`;
            } else if (id === 'clock') {
                if (isSplit) {
                    miniContentHtml = `<div style="display:flex; align-items:center; justify-content:center; width:100%; height:100%; color:#ff9f0a;">
                        <i class="fas fa-stopwatch" style="font-size:18px;"></i>
                    </div>`;
                } else {
                    const mins = Math.floor(Math.abs(Timer.time) / 60).toString();
                    const secs = (Math.abs(Timer.time) % 60).toString().padStart(2, '0');
                    miniContentHtml = `<div style="display:flex; align-items:center; justify-content:center; width:100%; height:100%; color:#ff9f0a; gap:6px; font-size:12px;">
                        <i class="fas fa-stopwatch" style="font-size:11px;"></i>
                        <span id="di-morph-timer-val" style="font-family:monospace; font-weight:bold;">${mins}:${secs}</span>
                    </div>`;
                    if (AppManager.morphInterval) clearInterval(AppManager.morphInterval);
                    AppManager.morphInterval = setInterval(() => {
                        const el = document.getElementById('di-morph-timer-val');
                        if (el) {
                            const m = Math.floor(Math.abs(Timer.time) / 60);
                            const s = Math.abs(Timer.time) % 60;
                            el.innerText = `${m}:${s.toString().padStart(2, '0')}`;
                        }
                    }, 500);
                }
            }
            const miniOverlay = document.createElement('div');
            miniOverlay.className = 'di-mini-overlay';
            miniOverlay.style.cssText = 'position:absolute; inset:0; display:flex; align-items:center; justify-content:center; opacity:0; z-index:10002; pointer-events:none; transition:none;';
            miniOverlay.innerHTML = miniContentHtml;
            closeClone.appendChild(miniOverlay);
            screenEl.appendChild(closeClone);
        }


        win.style.display = 'none';
        win.classList.remove('closing', 'calc-app-bg');
        if (!morphToIsland) {
            AppManager.closingApps[id] = {
                clone: closeClone,
                iconFadeTimeout: null,
                closeTimeout: null
            };
        }
        void closeClone.offsetWidth;
        const totalDur = win.classList.contains('app-animating') ? 0.60 * State.animationSpeed : 0.45 * State.animationSpeed;
        const morphDur = totalDur * State.animConfig.closeShapeMorph;
        const iconFadeDur = morphDur * State.animConfig.closeIconFade;
        if (morphToIsland && islandMorphTarget) {
            const moveDur = 0.45;
            const startW = parseFloat(closeClone.style.width);
            const startH = parseFloat(closeClone.style.height);
            const startRadius = closeClone.style.borderRadius || '16px';
            const pillW = islandMorphTarget.w;
            const pillH = islandMorphTarget.h;
            const tMatch = closeClone.style.transform.match(/translate\(([\d.-]+)px,\s*([\d.-]+)px\)/);
            const startX = tMatch ? parseFloat(tMatch[1]) : 0;
            const startY = tMatch ? parseFloat(tMatch[2]) : 0;
            closeClone.style.outline = '0.5px solid rgba(149, 149, 149, 0.3)';
            closeClone.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
            closeClone.style.background = '#000';
            closeClone.style.overflow = 'hidden';
            const s = 0.35;
            const midX = startX + s * (islandMorphTarget.left - startX);
            const midY = startY + s * (islandMorphTarget.top - startY);
            const midW = startW + 0.95 * (pillW - startW);
            const midH = startH + 0.95 * (pillH - startH);

            closeClone.animate([
                {
                    transform: `translate(${startX}px, ${startY}px)`,
                    width: `${startW}px`, height: `${startH}px`,
                    borderRadius: startRadius,
                    offset: 0
                },
                {
                    transform: `translate(${midX}px, ${midY}px)`,
                    width: `${midW}px`, height: `${midH}px`,
                    borderRadius: islandMorphTarget.radius,
                    offset: s
                },
                {
                    transform: `translate(${islandMorphTarget.left}px, ${islandMorphTarget.top}px)`,
                    width: `${pillW}px`, height: `${pillH}px`,
                    borderRadius: islandMorphTarget.radius,
                    offset: 1
                }
            ], {
                duration: moveDur * 1000,
                easing: 'ease-in-out',
                fill: 'forwards'
            });

            if (State.animStyle === 'new' && homeScreen) {
                if (AppManager._currentOpenAnim) { try { AppManager._currentOpenAnim.cancel(); } catch (e) { } }
                if (AppManager._currentScaleAnim) { try { AppManager._currentScaleAnim.cancel(); } catch (e) { } }
            }


            if (contentEl) {
                contentEl.style.transition = `opacity 0.2s ease`;
                contentEl.style.opacity = '0';
                contentEl.style.width = '';
            }
            const headerEl = closeClone.querySelector('.app-header');
            const originalHeaderEl = win.querySelector('.app-header');

            if (headerEl) {
                headerEl.style.transition = `opacity 0.2s ease`;
                headerEl.style.opacity = '0';
            }
            const miniOverlay = closeClone.querySelector('.di-mini-overlay');
            if (miniOverlay) {
                setTimeout(() => {
                    miniOverlay.style.transition = `opacity 0.2s ease`;
                    miniOverlay.style.opacity = '1';
                }, 50);
            }
            if (iconEl) {
                if (State.activeApp !== id) {
                    iconEl.classList.remove('app-current');
                    const iconBox = iconEl.querySelector('.icon-box') || iconEl;
                    iconBox.style.transition = 'none';
                    iconBox.style.visibility = 'visible';
                }
            }
            const revealTime = moveDur * 900;
            setTimeout(() => {
                if (islandTargetEl) {
                    islandTargetEl.style.transition = '';
                    islandTargetEl.style.opacity = '';
                }
                const secEl = document.getElementById('dynamic-island-sec');
                if (isSplit && secEl) {
                    secEl.style.transition = 'none';
                    secEl.style.transform = 'translateX(-50%) scale(0.8)';
                    secEl.style.opacity = '0';
                    void secEl.offsetWidth;
                    secEl.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease';
                    secEl.style.transform = '';
                    secEl.style.opacity = '1';
                    setTimeout(() => {
                        secEl.style.transition = '';
                    }, 400);
                }
                Island.isMorphing = false;
                closeClone.style.transition = 'opacity 0.1s';
                closeClone.style.pointerEvents = 'none';
                closeClone.style.opacity = '0';
                setTimeout(() => {
                    closeClone.remove();
                }, 150);
                if (AppManager.morphInterval) {
                    clearInterval(AppManager.morphInterval);
                    AppManager.morphInterval = null;
                }
            }, revealTime);

            setTimeout(() => {
                Island.isMorphing = false;
            }, revealTime + 300);
        } else {
            const ease = 'cubic-bezier(' + (State.animConfig.closeBezier || [0.15, 1.01, 0.3, 1.02]).join(', ') + ')';
            if (iconLayer) {
                iconLayer.style.transition = 'none';
                iconLayer.animate([
                    { opacity: startIconOpacity !== null && startIconOpacity !== undefined ? startIconOpacity : 0 },
                    { opacity: 1 }
                ], { duration: morphDur * State.animConfig.closeIconFade * 1000, easing: 'ease', fill: 'forwards' });
                const fIcon = iconLayer.querySelector('.photos-icon-flower') || iconLayer.querySelector('.settings-icon-gear') || iconLayer.querySelector('.camera-icon-lens') || iconLayer.querySelector('.music-icon-note') || iconLayer.querySelector('.clock-icon-face');
                if (fIcon) {
                    if (fIcon.classList.contains('settings-icon-gear')) {
                        fIcon.style.transition = `transform ${totalDur * 0.7}s cubic-bezier(0.2, 0.6, 0.1, 1)`;
                        fIcon.style.transform = 'scale(1.15) rotate(360deg)';
                    } else if (fIcon.classList.contains('camera-icon-lens')) {
                        fIcon.style.transform = 'scale(1.39)';
                    } else if (fIcon.classList.contains('photos-icon-flower')) {
                        fIcon.style.transition = `transform ${totalDur * 0.7}s cubic-bezier(0.2, 0.6, 0.1, 1)`;
                        fIcon.style.transform = 'scale(1) rotate(360deg)';
                    } else if (fIcon.classList.contains('music-icon-note')) {
                        fIcon.style.transition = `transform ${totalDur * 0.7}s cubic-bezier(0.2, 0.6, 0.1, 1)`;
                        fIcon.style.transform = 'scale(1.0)';
                        const noteEl = fIcon.querySelector('.music-note');
                        if (noteEl) {
                            noteEl.style.transition = `transform ${totalDur * 0.5}s cubic-bezier(0.34, 1.56, 0.64, 1)`;
                            noteEl.style.transform = 'scale(1.15)';
                            setTimeout(() => { noteEl.style.transform = 'scale(1.0)'; }, totalDur * 500);
                        }
                        const sparklesEl = fIcon.querySelector('.music-sparkles');
                        if (sparklesEl) {
                            sparklesEl.style.transition = `transform ${totalDur * 0.7}s cubic-bezier(0.2, 0.6, 0.1, 1)`;
                            sparklesEl.style.transform = 'rotate(360deg)';
                        }
                    } else if (fIcon.classList.contains('clock-icon-face')) {
                        fIcon.style.transition = `transform ${totalDur * 0.7}s cubic-bezier(0.2, 0.6, 0.1, 1)`;
                        fIcon.style.transform = 'scale(1.0)';
                        const hourHand = fIcon.querySelector('.clock-hour');
                        const minHand = fIcon.querySelector('.clock-minute');
                        if (hourHand) { hourHand.style.transition = `transform ${totalDur * 0.7}s cubic-bezier(0.2, 0.6, 0.1, 1)`; hourHand.style.transform = `rotate(${parseFloat(hourHand.style.transform.replace(/[^0-9.-]/g, '')) + 360}deg)`; }
                        if (minHand) { minHand.style.transition = `transform ${totalDur * 0.7}s cubic-bezier(0.2, 0.6, 0.1, 1)`; minHand.style.transform = `rotate(${parseFloat(minHand.style.transform.replace(/[^0-9.-]/g, '')) + 720}deg)`; }
                    } else {
                        fIcon.style.transform = 'scale(0.96)';
                    }
                }
            }
            const contentFadeDur = totalDur * 0.15;

            const closeAnimEase = 'cubic-bezier(' + (State.animConfig.closeBezier || [0.15, 1.01, 0.3, 1.02]).join(', ') + ')';

            closeClone.style.transition = 'none';
            closeClone.style.backgroundColor = computedBg;
            const currentOp = window.getComputedStyle(closeClone).opacity || 1;

            const posAnimClose = closeClone.animate([
                { transform: `translate(${startLeftHome}px, ${startTopHome}px)`, opacity: currentOp },
                { transform: `translate(${endLeft}px, ${endTop}px)`, opacity: currentOp }
            ], {
                duration: totalDur * 0.55 * 1000,
                easing: closeAnimEase,
                fill: 'forwards'
            });

            let finalRadius = (endW * (parseFloat(OS.getShapeRadius()) / 100)) + 'px';
            if (parseInt(State.appShape) >= 45) {
                finalRadius = (Math.min(endW, endH) / 2) + 'px';
            }

            const shapeAnimClose = closeClone.animate([
                { width: `${startW}px`, height: `${startH}px`, borderRadius: curRadius },
                { width: `${endW}px`, height: `${endH}px`, borderRadius: finalRadius }
            ], {
                duration: morphDur * 1000,
                easing: ease,
                fill: 'forwards'
            });

            const bgAnimClose = closeClone.animate([
                { backgroundColor: computedBg },
                { backgroundColor: 'transparent' }
            ], {
                duration: 0,
                delay: iconFadeDur * 1000,
                fill: 'forwards'
            });

            closeClone._posAnim = posAnimClose;
            closeClone._shapeAnim = shapeAnimClose;

            const closeTargetZoom = endW / document.getElementById('screen').offsetWidth;

            const contentElClone = closeClone.querySelector('.app-content') || closeClone.querySelector('#app-body');
            if (contentElClone) {
                contentElClone.style.transition = 'none';
                contentElClone.animate([
                    { opacity: 1 },
                    { opacity: 0 }
                ], { duration: contentFadeDur * 1000, easing: 'ease', fill: 'forwards' });
            }
            const headerElClone2 = closeClone.querySelector('#app-header') || closeClone.querySelector('.app-header');
            if (headerElClone2) {
                headerElClone2.style.transition = 'none';
                headerElClone2.animate([
                    { opacity: 1 },
                    { opacity: 0 }
                ], { duration: contentFadeDur * 1000, easing: 'ease', fill: 'forwards' });
            }

            closeClone._syncZoomState = { active: true };
            const scrWNum = document.getElementById('screen').offsetWidth;
            const scrScaleEl = document.getElementById('scale-wrapper');
            const updateCloseZ = () => {
                if (!closeClone._syncZoomState.active) return;
                const cScale = document.fullscreenElement ? 1 : scrScaleEl.getBoundingClientRect().width / 400;
                const boundW = closeClone.getBoundingClientRect().width / cScale;
                const z = boundW / scrWNum;
                if (contentElClone) contentElClone.style.zoom = z;
                if (headerElClone2) headerElClone2.style.zoom = z;
                requestAnimationFrame(updateCloseZ);
            };
            requestAnimationFrame(updateCloseZ);

            setTimeout(() => {
                if (closeClone._syncZoomState) { closeClone._syncZoomState.active = false; }
            }, morphDur * 1000 + 50);

            OS.updateStatusBarColors(false, false, false);

            if (State.animStyle === 'new' && homeScreen) {
                if (win._syncZoomState) { win._syncZoomState.active = false; }
                if (AppManager._currentOpenAnim) { try { AppManager._currentOpenAnim.cancel(); } catch (e) { } }
                if (AppManager._currentScaleAnim) { try { AppManager._currentScaleAnim.cancel(); } catch (e) { } }
                if (AppManager._cloneReopenWinAnim) { try { AppManager._cloneReopenWinAnim.cancel(); } catch (e) { } AppManager._cloneReopenWinAnim = null; }
                if (win.getAnimations) { win.getAnimations().forEach(function (a) { try { a.cancel(); } catch (e) { } }); }
                const ahClear = document.getElementById('app-header');
                const abClear = document.getElementById('app-body');
                if (ahClear) ahClear.style.zoom = '';
                if (abClear) abClear.style.zoom = '';
            }


        }
        if (!morphToIsland && isImagePackClose && iconInner) {
            let shapePctClip = parseFloat(OS.getShapeRadius()) / 100;
            let clipRadius = (endW * shapePctClip) + 'px';
            if (parseInt(State.appShape) >= 45) {
                clipRadius = (Math.min(endW, endH) / 2) + 'px';
            }
            let clipPath = `inset(0 round ${clipRadius})`;

            closeClone.style.clipPath = clipPath;
            closeClone.style.webkitClipPath = clipPath;
        }
        setTimeout(() => {
            if (!State.activeApp) {
                document.body.classList.remove('app-open');
                document.body.classList.remove('fade-app-boxes');
                if (State.homescreenBlur) document.body.classList.add('hs-blur');
            }
            if (typeof Island !== 'undefined' && !morphToIsland) Island.update();
        }, 50);
        if (State.animStyle === 'new' && homeScreen) {
            const currentScale = window.getComputedStyle(homeScreen).transform;
            let matrixScale = 1;
            if (currentScale && currentScale !== 'none') {
                const vals = currentScale.match(/matrix\((.+)\)/);
                if (vals) matrixScale = parseFloat(vals[1].split(',')[0]);
            }
            if (homeScreen._zoomAnim) homeScreen._zoomAnim.cancel();

            homeScreen._zoomAnim = homeScreen.animate([
                { transform: `scale(${matrixScale})` },
                { transform: `scale(1)` }
            ], {
                duration: 500,
                easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
                fill: 'forwards'
            });
        }
        if (iconEl && !morphToIsland) {
            const timeoutDur = Math.max(0, totalDur * 900 * 0.75);
            if (AppManager.closingApps[id]) {
                AppManager.closingApps[id].iconFadeTimeout = setTimeout(() => {
                    iconEl.classList.remove('app-current');
                    if (id === 'clock') {
                        const clockFace = iconEl.querySelector('.clock-icon-face');
                        if (clockFace) {
                            const n = new Date();
                            const h = (n.getHours() % 12) * 30 + n.getMinutes() * 0.5 + n.getSeconds() * (0.5 / 60);
                            const m = n.getMinutes() * 6 + n.getSeconds() * 0.1;
                            const hh = clockFace.querySelector('.clock-hour');
                            const mm = clockFace.querySelector('.clock-minute');
                            if (hh) hh.style.transform = `rotate(${h}deg)`;
                            if (mm) mm.style.transform = `rotate(${m}deg)`;
                        }
                    }
                }, timeoutDur);
            }
        }
        if (AppManager.closingApps[id]) {
            AppManager.closingApps[id].closeTimeout = setTimeout(() => {
                if (closeClone && closeClone.parentNode) closeClone.remove();
                if (AppManager.closingApps[id]) delete AppManager.closingApps[id];
                if (Object.keys(AppManager.closingApps).length === 0) {
                    document.body.classList.remove('closing-active');
                }
                if (typeof Island !== 'undefined') Island.update();
                State.isAnimating = false;
                document.body.classList.remove('dark-bar');
                if (State.darkMode) {
                    document.querySelector('.home-bar').style.backgroundColor = 'rgba(255,255,255,0.4)';
                } else {
                    document.querySelector('.home-bar').style.backgroundColor = '#000';
                }
                document.querySelector('.home-bar').style.backgroundColor = '';

                if (morphToIsland && iconEl) {
                    const iconBox = iconEl.querySelector('.icon-box') || iconEl;
                    iconBox.style.transition = '';
                    iconBox.style.opacity = '';
                    iconBox.style.visibility = '';
                }
            }, Math.max(500 * State.animationSpeed, iconFadeDur * 1000 + 100));
        }
    }
};
const IconDrag = {
    active: false,
    dragEl: null,
    pressTimer: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    originalPos: null,
    placeholder: null,
    emptyIndicators: [],
    activeDisplacement: null,
    animatingIcons: new Map(),
    touchId: null,
    hasMoved: false,
    sourceEl: null,
    currentTarget: null,
    COLS: 4,
    ROWS: 8,
    resolveAnimations: () => {
        IconDrag.animatingIcons.forEach((timer, iconId) => {
            clearTimeout(timer);
            const el = document.getElementById('icon-' + iconId);
            if (el) {
                el.style.transition = '';
                el.style.transform = '';
            }
        });
        IconDrag.animatingIcons.clear();
    },
    animateIcon: (el, appId, fromRect) => {
        const toRect = el.getBoundingClientRect();
        const dx = fromRect.left - toRect.left;
        const dy = fromRect.top - toRect.top;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
        el.style.transition = 'none';
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        el.offsetHeight;
        el.style.transition = 'transform 0.45s cubic-bezier(0.25,1,0.5,1)';
        el.style.transform = 'translate(0,0)';
        if (IconDrag.animatingIcons.has(appId)) {
            clearTimeout(IconDrag.animatingIcons.get(appId));
        }
        const timer = setTimeout(() => {
            el.style.transition = '';
            el.style.transform = '';
            IconDrag.animatingIcons.delete(appId);
        }, 460);
        IconDrag.animatingIcons.set(appId, timer);
    },
    init: () => {
        const grid = document.getElementById('app-grid');
        if (!grid) return;
        grid.addEventListener('mousedown', IconDrag.onStart);
        grid.addEventListener('touchstart', IconDrag.onStart, { passive: false });
        document.addEventListener('mousemove', IconDrag.onMove);
        document.addEventListener('touchmove', IconDrag.onMove, { passive: false });
        document.addEventListener('mouseup', IconDrag.onEnd);
        document.addEventListener('touchend', IconDrag.onEnd);
    },
    getPos: (e) => {
        if (e.touches && IconDrag.touchId !== null) {
            for (let i = 0; i < e.touches.length; i++) {
                if (e.touches[i].identifier === IconDrag.touchId) {
                    return { x: e.touches[i].clientX, y: e.touches[i].clientY };
                }
            }
        }
        const t = e.touches ? e.touches[0] : (e.changedTouches ? e.changedTouches[0] : e);
        return { x: t.clientX, y: t.clientY };
    },
    getGridApps: () => {
        const apps = APPS.filter(a => a.area === 'grid' && !a.hidden);
        if (State.emptyApps) {
            State.emptyApps.forEach(ea => apps.push({ id: ea.id, name: ea.name, area: 'grid' }));
        }
        return apps;
    },
    getGridMetrics: () => {
        const grid = document.getElementById('app-grid');
        const gridRect = grid.getBoundingClientRect();
        const gridStyles = window.getComputedStyle(grid);
        const colGap = parseFloat(gridStyles.columnGap) || 15;
        const rowGap = parseFloat(gridStyles.rowGap) || 25;
        const totalScale = gridRect.width / grid.offsetWidth;
        const cellW = (grid.offsetWidth - colGap * (IconDrag.COLS - 1)) / IconDrag.COLS;
        const firstIcon = grid.querySelector('.app-icon:not(.app-clone)');
        let cellH = 86;
        if (firstIcon && firstIcon !== IconDrag.sourceEl) {
            cellH = firstIcon.getBoundingClientRect().height / totalScale;
        }
        return { gridRect, colGap, rowGap, totalScale, cellW, cellH };
    },
    cellFromClientPoint: (clientX, clientY) => {
        const grid = document.getElementById('app-grid');
        if (!grid) return null;
        const dock = document.getElementById('dock');
        if (dock) {
            const dockRect = dock.getBoundingClientRect();
            if (clientY >= dockRect.top) return null;
        }
        const m = IconDrag.getGridMetrics();
        let maxRows = IconDrag.ROWS;
        const dockEl = document.getElementById('dock');
        if (dockEl) {
            const dockTop = dockEl.getBoundingClientRect().top;
            const availableH = (dockTop - m.gridRect.top) / m.totalScale;
            const rowStride = m.cellH + m.rowGap;
            maxRows = Math.min(IconDrag.ROWS, Math.floor(availableH / rowStride));
        }
        const relX = (clientX - m.gridRect.left) / m.totalScale;
        const relY = (clientY - m.gridRect.top) / m.totalScale;
        if (relX < 0 || relY < 0) return null;
        const colStride = m.cellW + m.colGap;
        const rowStride = m.cellH + m.rowGap;
        const col = Math.floor(relX / colStride);
        const row = Math.floor(relY / rowStride);
        if (col < 0 || col >= IconDrag.COLS || row < 0 || row >= maxRows) return null;
        const inCellX = relX - col * colStride;
        const inCellY = relY - row * rowStride;
        if (inCellX > m.cellW + m.colGap * 0.5 || inCellY > m.cellH + m.rowGap * 0.5) return null;
        return { row, col };
    },
    getOccupied: (excludeId) => {
        const occupied = {};
        const gridApps = IconDrag.getGridApps();
        gridApps.forEach((app, idx) => {
            if (app.id === excludeId) return;
            let pos;
            if (State.iconPositions && State.iconPositions[app.id]) {
                pos = State.iconPositions[app.id];
            } else {
                pos = { row: Math.floor(idx / 4), col: idx % 4 };
            }
            occupied[`${pos.row},${pos.col}`] = app.id;
        });
        return occupied;
    },
    getCellRect: (row, col) => {
        const grid = document.getElementById('app-grid');
        const gridRect = grid.getBoundingClientRect();
        const scaleFactor = document.fullscreenElement ? 1 : document.getElementById('scale-wrapper').getBoundingClientRect().width / 400;
        const homeRect = document.getElementById('home-contents').getBoundingClientRect();
        const screenRect = document.getElementById('screen').getBoundingClientRect();
        const zoomScale = (homeRect.width / screenRect.width) || 0.92;
        const totalScale = scaleFactor * zoomScale;
        const gridStyles = window.getComputedStyle(grid);
        const colGap = parseFloat(gridStyles.columnGap) || 15;
        const rowGap = parseFloat(gridStyles.rowGap) || 25;
        const gridW = gridRect.width / totalScale;
        const cellW = (gridW - colGap * (IconDrag.COLS - 1)) / IconDrag.COLS;
        const cellH = 86;
        return {
            x: col * (cellW + colGap),
            y: row * (cellH + rowGap),
            w: cellW,
            h: cellH
        };
    },
    onStart: (e) => {
        if (IconDrag.active || IconDrag.dragEl) return;
        if (e.touches && e.touches.length > 1) return;
        const icon = e.target.closest('.app-icon');
        if (!icon || icon.closest('.dock')) return;
        if (State.activeApp || State.isAnimating) return;
        if (e.touches && e.touches[0]) {
            IconDrag.touchId = e.touches[0].identifier;
        } else {
            IconDrag.touchId = null;
        }
        IconDrag.activeDisplacement = null;
        const pos = IconDrag.getPos(e);
        IconDrag.startX = pos.x;
        IconDrag.startY = pos.y;
        IconDrag.pressTimer = setTimeout(() => {
            IconDrag.activate(icon, pos);
        }, 500);
    },
    activate: (icon, pos) => {
        IconDrag.active = true;
        const appId = icon.id.replace('icon-', '');

        const screen = document.getElementById('screen');
        const rect = icon.getBoundingClientRect();
        const screenRect = screen.getBoundingClientRect();
        const scaleFactor = document.fullscreenElement ? 1 : document.getElementById('scale-wrapper').getBoundingClientRect().width / 400;

        const clone = icon.cloneNode(true);
        clone.id = icon.id + '-clone';
        clone.classList.add('dragging');
        clone.classList.add('app-clone');
        clone.style.position = 'absolute';
        clone.style.margin = '0';
        clone.style.zIndex = '9999';

        const localX = (rect.left - screenRect.left) / scaleFactor;
        const localY = (rect.top - screenRect.top) / scaleFactor;

        clone.style.left = localX + 'px';
        clone.style.top = localY + 'px';
        clone.style.width = (rect.width / scaleFactor) + 'px';
        clone.style.height = (rect.height / scaleFactor) + 'px';

        screen.appendChild(clone);

        IconDrag.dragEl = clone;
        IconDrag.sourceEl = icon;
        icon.style.opacity = '0';

        const gridApps = IconDrag.getGridApps();
        const idx = gridApps.findIndex(a => a.id === appId);
        if (State.iconPositions && State.iconPositions[appId]) {
            IconDrag.originalPos = { ...State.iconPositions[appId] };
        } else {
            IconDrag.originalPos = { row: Math.floor(idx / 4), col: idx % 4 };
        }
        document.body.classList.add('drag-mode');

        IconDrag.offsetX = pos.x - rect.left;
        IconDrag.offsetY = pos.y - rect.top;
        IconDrag.hasMoved = false;
        IconDrag.currentTarget = null;

        const ph = document.createElement('div');
        ph.className = 'grid-placeholder';
        ph.style.gridRow = IconDrag.originalPos.row + 1;
        ph.style.gridColumn = IconDrag.originalPos.col + 1;
        document.getElementById('app-grid').appendChild(ph);
        IconDrag.placeholder = ph;

        IconDrag.emptyIndicators = [];
        const occupied = IconDrag.getOccupied(appId);
        const m = IconDrag.getGridMetrics();
        const dockEl = document.getElementById('dock');
        let maxRows = IconDrag.ROWS;
        if (dockEl) {
            const dockTop = dockEl.getBoundingClientRect().top;
            const availableH = (dockTop - m.gridRect.top) / m.totalScale;
            const rowStride = m.cellH + m.rowGap;
            maxRows = Math.min(IconDrag.ROWS, Math.floor(availableH / rowStride));
        }
        for (let r = 0; r < maxRows; r++) {
            for (let c = 0; c < IconDrag.COLS; c++) {
                if (!occupied[`${r},${c}`] && !(r === IconDrag.originalPos.row && c === IconDrag.originalPos.col)) {
                    const ind = document.createElement('div');
                    ind.className = 'grid-empty-indicator';
                    ind.style.gridRow = r + 1;
                    ind.style.gridColumn = c + 1;
                    document.getElementById('app-grid').appendChild(ind);
                    IconDrag.emptyIndicators.push(ind);
                }
            }
        }

        if (appId.startsWith('empty_')) {
            let trashBtn = document.getElementById('home-trash-btn');
            if (!trashBtn) {
                trashBtn = document.createElement('div');
                trashBtn.id = 'home-trash-btn';
                trashBtn.innerHTML = '<i class="fas fa-trash"></i>';
                const contents = document.getElementById('home-contents');
                if (contents && contents.parentElement) {
                    contents.parentElement.appendChild(trashBtn);
                }
            }
            if (trashBtn) {
                trashBtn.style.opacity = '1';
                trashBtn.style.pointerEvents = 'auto';
            }
        }

        if (navigator.vibrate) navigator.vibrate(30);
    },
    onMove: (e) => {
        if (e.touches && IconDrag.touchId !== null) {
            let found = false;
            for (let i = 0; i < e.touches.length; i++) {
                if (e.touches[i].identifier === IconDrag.touchId) { found = true; break; }
            }
            if (!found) return;
        }
        if (Math.abs(IconDrag.getPos(e).x - IconDrag.startX) > 10 || Math.abs(IconDrag.getPos(e).y - IconDrag.startY) > 10) {
            if (IconDrag.pressTimer && !IconDrag.active) {
                clearTimeout(IconDrag.pressTimer);
                IconDrag.pressTimer = null;
            }
        }
        if (!IconDrag.active || !IconDrag.dragEl) return;
        e.preventDefault();
        IconDrag.hasMoved = true;
        const pos = IconDrag.getPos(e);
        const screenRect = document.getElementById('screen').getBoundingClientRect();

        const trashBtn = document.getElementById('home-trash-btn');
        if (trashBtn && trashBtn.style.opacity === '1') {
            const tr = trashBtn.getBoundingClientRect();
            const trashCx = tr.left + tr.width / 2;
            const trashCy = tr.top + tr.height / 2;
            const dist = Math.hypot(pos.x - trashCx, pos.y - trashCy);
            if (dist < 60) {
                trashBtn.classList.add('active-drop');
            } else {
                trashBtn.classList.remove('active-drop');
            }
        }

        const scaleFactor = document.fullscreenElement ? 1 : document.getElementById('scale-wrapper').getBoundingClientRect().width / 400;

        const localX = (pos.x - IconDrag.offsetX - screenRect.left) / scaleFactor;
        const localY = (pos.y - IconDrag.offsetY - screenRect.top) / scaleFactor;
        IconDrag.dragEl.style.left = localX + 'px';
        IconDrag.dragEl.style.top = localY + 'px';

        const dragRect = IconDrag.dragEl.getBoundingClientRect();
        const centerX = dragRect.left + dragRect.width / 2;
        const centerY = dragRect.top + dragRect.height / 2;

        const cell = IconDrag.cellFromClientPoint(centerX, centerY);

        const cellChanged = !cell || !IconDrag.currentTarget ? !!IconDrag.currentTarget :
            (cell.row !== IconDrag.currentTarget.row || cell.col !== IconDrag.currentTarget.col);

        if (cellChanged && IconDrag.activeDisplacement && IconDrag.currentTarget) {
            const d = IconDrag.activeDisplacement;
            const displacedEl = document.getElementById('icon-' + d.appId);
            if (displacedEl) {
                IconDrag.resolveAnimations();
                const fromRect = displacedEl.getBoundingClientRect();
                displacedEl.style.gridRow = d.originalPos.row + 1;
                displacedEl.style.gridColumn = d.originalPos.col + 1;
                IconDrag.animateIcon(displacedEl, d.appId, fromRect);
                if (!State.iconPositions) State.iconPositions = {};
                State.iconPositions[d.appId] = { row: d.originalPos.row, col: d.originalPos.col };

                const ind = document.createElement('div');
                ind.className = 'grid-empty-indicator';
                ind.style.gridRow = d.newPos.row + 1;
                ind.style.gridColumn = d.newPos.col + 1;
                document.getElementById('app-grid').appendChild(ind);
                IconDrag.emptyIndicators.push(ind);
            }
            IconDrag.activeDisplacement = null;
        }

        if (!cell) {
            if (IconDrag.placeholder) IconDrag.placeholder.classList.remove('visible');
            IconDrag.currentTarget = null;
            return;
        }

        if (cell.row === IconDrag.originalPos.row && cell.col === IconDrag.originalPos.col) {
            if (IconDrag.placeholder) IconDrag.placeholder.classList.remove('visible');
            IconDrag.currentTarget = null;
            return;
        }

        if (IconDrag.currentTarget && cell.row === IconDrag.currentTarget.row && cell.col === IconDrag.currentTarget.col) return;

        const appId = IconDrag.sourceEl.id.replace('icon-', '');
        const occupied = IconDrag.getOccupied(appId);
        const occupantId = occupied[`${cell.row},${cell.col}`];

        if (occupantId) {
            const occupantEl = document.getElementById('icon-' + occupantId);
            if (occupantEl) {
                const m = IconDrag.getGridMetrics();
                const dockEl = document.getElementById('dock');
                let maxRows = IconDrag.ROWS;
                if (dockEl) {
                    const dockTop = dockEl.getBoundingClientRect().top;
                    const availableH = (dockTop - m.gridRect.top) / m.totalScale;
                    const rowStride = m.cellH + m.rowGap;
                    maxRows = Math.min(IconDrag.ROWS, Math.floor(availableH / rowStride));
                }

                const occupantRow = parseInt(occupantEl.style.gridRow) - 1;
                const occupantCol = parseInt(occupantEl.style.gridColumn) - 1;
                let bestRow = -1, bestCol = -1, bestDist = Infinity;
                for (let r = 0; r < maxRows; r++) {
                    for (let c = 0; c < IconDrag.COLS; c++) {
                        if (r === cell.row && c === cell.col) continue;
                        const isOccupied = occupied[`${r},${c}`];
                        const isDragOrigin = r === IconDrag.originalPos.row && c === IconDrag.originalPos.col;
                        if (!isOccupied || isDragOrigin) {
                            const dist = Math.abs(r - occupantRow) + Math.abs(c - occupantCol);
                            if (dist < bestDist) {
                                bestDist = dist;
                                bestRow = r;
                                bestCol = c;
                            }
                        }
                    }
                }
                if (bestRow === -1) {
                    bestRow = IconDrag.originalPos.row;
                    bestCol = IconDrag.originalPos.col;
                }
                const nextRow = bestRow;
                const nextCol = bestCol;

                const originalPos = {
                    row: occupantRow,
                    col: occupantCol
                };

                IconDrag.resolveAnimations();
                const fromRect = occupantEl.getBoundingClientRect();
                occupantEl.style.gridRow = nextRow + 1;
                occupantEl.style.gridColumn = nextCol + 1;
                IconDrag.animateIcon(occupantEl, occupantId, fromRect);

                if (!State.iconPositions) State.iconPositions = {};
                State.iconPositions[occupantId] = { row: nextRow, col: nextCol };

                IconDrag.activeDisplacement = {
                    appId: occupantId,
                    originalPos: originalPos,
                    newPos: { row: nextRow, col: nextCol },
                    triggerCell: { row: cell.row, col: cell.col }
                };

                const indToRemove = IconDrag.emptyIndicators.find(ind => parseInt(ind.style.gridRow) === nextRow + 1 && parseInt(ind.style.gridColumn) === nextCol + 1);
                if (indToRemove) {
                    indToRemove.remove();
                    IconDrag.emptyIndicators = IconDrag.emptyIndicators.filter(i => i !== indToRemove);
                }
            }
        }

        IconDrag.currentTarget = { row: cell.row, col: cell.col };

        if (IconDrag.placeholder) {
            IconDrag.placeholder.style.gridRow = cell.row + 1;
            IconDrag.placeholder.style.gridColumn = cell.col + 1;
            IconDrag.placeholder.classList.add('visible');
        }
    },
    onEnd: (e) => {
        if (e.changedTouches && IconDrag.touchId !== null) {
            let found = false;
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === IconDrag.touchId) { found = true; break; }
            }
            if (!found) return;
        }
        if (IconDrag.pressTimer) {
            clearTimeout(IconDrag.pressTimer);
            IconDrag.pressTimer = null;
        }
        IconDrag.activeDisplacement = null;
        if (!IconDrag.active || !IconDrag.dragEl) {
            IconDrag.touchId = null;
            return;
        }
        IconDrag.active = false;
        IconDrag.touchId = null;
        const clone = IconDrag.dragEl;
        const source = IconDrag.sourceEl;
        const appId = source.id.replace('icon-', '');

        let trashed = false;
        if (appId.startsWith('empty_')) {
            const trashBtn = document.getElementById('home-trash-btn');
            if (trashBtn && trashBtn.classList.contains('active-drop')) {
                trashed = true;
                State.emptyApps = State.emptyApps.filter(ea => ea.id !== appId);
                Storage.saveSettings();
                OS.renderApps();
                setTimeout(() => OS.enterEditMode(), 100);
            }
            if (trashBtn) {
                trashBtn.style.opacity = '0';
                trashBtn.style.pointerEvents = 'none';
                trashBtn.classList.remove('active-drop');
            }
        }

        if (trashed) {
            if (IconDrag.placeholder) IconDrag.placeholder.remove();
            IconDrag.emptyIndicators.forEach(ind => ind.remove());
            IconDrag.emptyIndicators = [];
            if (clone) clone.remove();
            document.body.classList.remove('drag-mode');
            IconDrag.dragEl = null;

            IconDrag.sourceEl = null;
            IconDrag.originalPos = null;
            IconDrag.placeholder = null;
            IconDrag.currentTarget = null;
            return;
        }

        let targetRow, targetCol;
        if (!IconDrag.hasMoved || !IconDrag.currentTarget) {
            targetRow = IconDrag.originalPos.row;
            targetCol = IconDrag.originalPos.col;
        } else {
            targetRow = IconDrag.currentTarget.row;
            targetCol = IconDrag.currentTarget.col;
        }

        if (!State.iconPositions) State.iconPositions = {};
        State.iconPositions[appId] = { row: targetRow, col: targetCol };
        const targetCell = IconDrag.getCellRect(targetRow, targetCol);
        const grid = document.getElementById('app-grid');
        const gridRect = grid.getBoundingClientRect();
        const totalScale = gridRect.width / grid.offsetWidth;
        const screenRect = document.getElementById('screen').getBoundingClientRect();
        const scaleFactor = document.fullscreenElement ? 1 : document.getElementById('scale-wrapper').getBoundingClientRect().width / 400;
        const screenTargetX = (gridRect.left + targetCell.x * totalScale - screenRect.left) / scaleFactor;
        const screenTargetY = (gridRect.top + targetCell.y * totalScale - screenRect.top) / scaleFactor;
        clone.classList.add('snap-anim');
        clone.style.left = screenTargetX + 'px';
        clone.style.top = screenTargetY + 'px';
        clone.style.transform = 'scale(1)';
        if (IconDrag.placeholder) {
            IconDrag.placeholder.remove();
            IconDrag.placeholder = null;
        }
        IconDrag.emptyIndicators.forEach(ind => ind.remove());
        IconDrag.emptyIndicators = [];
        IconDrag.activeDisplacement = null;
        document.body.classList.remove('drag-mode');
        setTimeout(() => {
            source.style.gridRow = targetRow + 1;
            source.style.gridColumn = targetCol + 1;
            source.style.opacity = '';
            if (clone && clone.parentNode) clone.remove();
            IconDrag.dragEl = null;
            IconDrag.sourceEl = null;
            IconDrag.originalPos = null;
            IconDrag.currentTarget = null;
            Storage.saveSettings();
        }, 300);
    }
};
const Timer = {
    running: false, interval: null, finished: false,
    interruptedMusic: false,
    time: 300,
    ringtone: new Audio('https://dl.dropboxusercontent.com/scl/fi/j9qld9u2xcl0mihv2kuk1/ringtone-024-376907.mp3?rlkey=1tosgk2oyw73eqzczl8yoh1pz&st=pc8cfmrk'),
    init: () => {
        Timer.ringtone.loop = true;
        Timer.ringtone = new Audio('https://dl.dropboxusercontent.com/scl/fi/j9qld9u2xcl0mihv2kuk1/ringtone-024-376907.mp3?rlkey=1tosgk2oyw73eqzczl8yoh1pz&st=pc8cfmrk');
        Timer.ringtone.loop = true;

    },
    toggle: () => {
        if (Timer.running) Timer.stop(true); else Timer.start();
    },
    start: () => {
        if (Timer.running) return;
        let seconds = Timer.time;
        if (Timer.finished) {
            Timer.finished = false;
            Timer.time = 300;
            seconds = 300;
        }
        if (seconds <= 0 && !Timer.finished) seconds = 300;
        Timer.running = true;
        Timer.finished = false;
        Timer.paused = false;
        Island.update();
        Timer.interval = setInterval(() => {
            seconds--;
            Timer.time = seconds;
            if (seconds < 0) {
                if (!Timer.finished) {
                    Timer.finished = true;
                    if (Music.active) {
                        Music.audio.pause();
                        Timer.interruptedMusic = true;
                    }
                    Timer.ringtone.loop = true;
                    Timer.ringtone.currentTime = 0;
                    Timer.ringtone.play()
                    Island.update();
                    Island.expand('timerDone');
                }
                Timer.updateUI();
            } else {
                Timer.updateUI();
            }
        }, 1000);
    },
    stop: (pause) => {
        clearInterval(Timer.interval);
        Timer.running = false;
        if (!pause) {
            Timer.paused = false;
            Timer.finished = false;
            Timer.ringtone.pause();
            Timer.ringtone.currentTime = 0;
            Timer.time = 300;
            Timer.updateUI();
            let didCollapse = false;
            if (Island.expanded === 'timer' || Island.expanded === 'timerDone') {
                Island.collapse();
                didCollapse = true;
            }
            if (Timer.interruptedMusic) {
                Music.toggle();
                Timer.interruptedMusic = false;
            }
            if (!didCollapse) Island.update();
        } else {
            Timer.paused = true;
            Island.update();
        }
    },
    setCustom: (mins) => {
        Timer.time = mins * 60;
        Timer.finished = false;
        Timer.updateUI();
    },
    updateUI: () => {
        let absTime = Math.abs(Timer.time);
        const m = Math.floor(absTime / 60);
        const s = absTime % 60;
        let txt = `${m}:${s.toString().padStart(2, '0')}`;
        if (Timer.time < 0) txt = txt + "+";
        if (document.getElementById('di-timer-val')) document.getElementById('di-timer-val').innerText = txt;
        if (document.getElementById('di-timer-mini-val')) document.getElementById('di-timer-mini-val').innerText = txt;
        if (document.getElementById('timer-sec-display')) document.getElementById('timer-sec-display').innerText = txt;
        if (document.getElementById('timer-sec-mini-display')) document.getElementById('timer-sec-mini-display').innerText = txt;
        if (document.getElementById('stopwatch-val')) document.getElementById('stopwatch-val').innerText = txt;
        if (Timer.finished && document.querySelector('#view-timer-done span')) {
            document.querySelector('#view-timer-done span').innerText = txt;
        }
    }
};
const Island = {
    expanded: null, unlockTimer: null,
    renderIdle: () => {
        document.getElementById('view-idle').innerHTML = '';
    },
    update: () => {
        const island = document.getElementById('dynamic-island');
        const wrapper = document.getElementById('island-wrap');
        const device = document.getElementById('device');
        const views = document.querySelectorAll('.di-view');
        const sec = document.getElementById('dynamic-island-sec');
        const wasMusicExpanded = wrapper.classList.contains('music-expanded');
        const wasTimerExpanded = wrapper.classList.contains('timer-expanded');
        island.className = ''; wrapper.className = '';
        if (State.islandColor) {
            if (State.islandColor.includes('gradient') || State.islandColor === 'rainbow') {
                if (State.islandColor === 'rainbow') island.classList.add('island-rainbow');
                else island.classList.add('island-purple-grad');
            }
        }
        if (device) device.classList.remove('di-expanded-global');
        if (wasMusicExpanded) wrapper.classList.add('music-expanded');
        if (wasTimerExpanded) wrapper.classList.add('timer-expanded');
        if (device) device.classList.remove('di-expanded-global');
        const bgBlur = document.getElementById('di-bg-blur');
        if (bgBlur) bgBlur.style.opacity = '0';
        island.classList.remove('has-aura');
        if (State.musicGradient && Island.expanded === 'music') {
            const track = Music.library[Music.currentIdx];
            if (track && track.art) {
                island.classList.add('has-aura');
                Island.extractAlbumColor(track.art, (color) => {
                    island.style.setProperty('--aura-color', color);
                });
            }
        }
        if (Island.expanded) {
            if (device) device.classList.add('di-expanded-global');
            const isSplit = (Music.active && !Music.audio.paused) && (Timer.running || Timer.finished || (Timer.paused && (Island.expanded === 'timer' || Island.expanded === 'timerDone')));
            if (isSplit) {
                wrapper.classList.add('split');
                sec.style.display = 'flex';
            } else {
                wrapper.classList.add('main-expanded');
            }
            if (Island.expanded === 'unlocked') {
                if (Music.active || Timer.running || Timer.finished) wrapper.classList.remove('main-expanded'); else island.classList.add('expanded-unlock');
                views.forEach(v => v.classList.remove('active'));
                document.getElementById('view-unlocked').classList.add('active');
            } else {
                views.forEach(v => v.classList.remove('active'));
                if (isSplit) {
                    if (Island.expanded === 'music') {
                        island.classList.add('expanded');
                        document.getElementById('view-music-exp').classList.add('active');
                    } else if (Island.expanded === 'timer' || Island.expanded === 'timerDone') {
                        document.getElementById('view-music-mini').classList.add('active');
                    }
                } else {
                    island.classList.add('expanded');
                    if (Island.expanded === 'music') document.getElementById('view-music-exp').classList.add('active');
                    else if (Island.expanded === 'timer') { island.classList.add('timer-mode'); document.getElementById('view-timer-exp').classList.add('active'); }
                    else if (Island.expanded === 'timerDone') { island.classList.add('notify'); document.getElementById('view-timer-done').classList.add('active'); }
                    else if (Island.expanded === 'notify') { island.classList.add('notify'); document.getElementById('view-notify').classList.add('active'); }
                }
            }
            return;
        }
        const musicAppOpen = State.activeApp === 'music' && !AppManager.closingApps['music'];
        const clockAppOpen = State.activeApp === 'clock' && !AppManager.closingApps['clock'];
        if (State.punchHole && (!Music.active || Music.audio.paused || musicAppOpen) && !Timer.running && !Timer.finished && !Island.expanded) island.classList.add('punch-hole');
        const showMusic = Music.active && !Music.audio.paused && !musicAppOpen;
        const showTimer = (Timer.running || Timer.finished) && !clockAppOpen;
        views.forEach(v => v.classList.remove('active'));
        if (showMusic && showTimer) {
            wrapper.classList.add('split');
            document.getElementById('view-music-mini').classList.add('active');
            document.getElementById('dynamic-island-sec').style.display = 'flex';
        }
        else if (showTimer) {
            document.getElementById('view-timer-mini').classList.add('active');
        }
        else if (Timer.finished && !clockAppOpen) {
            island.classList.add('notify');
            document.getElementById('view-timer-done').classList.add('active');
        }
        else if (showMusic) {
            document.getElementById('view-music-mini').classList.add('active');
        }
        else {
            document.getElementById('view-idle').classList.add('active');
            Island.renderIdle();
        }
    },
    tapMain: (e) => {
        if (Island.isMorphing) return;
        e.stopPropagation();
        const isSplit = (Music.active && !Music.audio.paused) && (Timer.running || Timer.finished || Timer.paused);
        if (Island.expanded) {
            if (Island.expanded === 'unlocked') {
                clearTimeout(Island.unlockTimer);
                Island.collapse();
            } else if (isSplit && (Island.expanded === 'timer' || Island.expanded === 'timerDone')) {
                if (Timer.paused && !Timer.running) {
                    Island.collapse();
                } else {
                    Island.expand('music');
                }
            } else {
                Island.collapse();
            }
        } else if (Music.active && !Music.audio.paused) {
            Island.expand('music');
        } else if (Timer.running) {
            Island.expand('timer');
        }
    },
    tapSec: (e) => {
        if (Island.isMorphing) return;
        e.stopPropagation();
        if (Timer.running || Timer.finished) Island.expand('timer');
    },
    expand: (type) => {
        if (Island.isMorphing) return;
        if (type === 'timer' && Timer.finished) type = 'timerDone';
        const sec = document.getElementById('dynamic-island-sec');
        const wrapper = document.getElementById('island-wrap');
        const isSplit = (Music.active && !Music.audio.paused) && (Timer.running || Timer.finished || Timer.paused);
        wrapper.classList.remove('music-expanded', 'timer-expanded');
        sec.classList.remove('as-pill');
        if (isSplit) {
            document.querySelectorAll('.di-view-sec').forEach(v => v.classList.remove('active'));
            if (type === 'music') {
                wrapper.classList.add('music-expanded');
                document.getElementById('view-timer-sec-mini').classList.add('active');
            } else if (type === 'timer') {
                wrapper.classList.add('timer-expanded');
                document.getElementById('view-timer-sec-exp').classList.add('active');
            } else if (type === 'timerDone') {
                wrapper.classList.add('timer-expanded');
                document.getElementById('view-timer-sec-done').classList.add('active');
            }
        }
        Island.expanded = type;
        Island.update();
    },
    collapse: () => {
        if (Island.isMorphing) return;
        const island = document.getElementById('dynamic-island');
        const sec = document.getElementById('dynamic-island-sec');
        const wrapper = document.getElementById('island-wrap');
        const inSplit = wrapper.classList.contains('split') || wrapper.classList.contains('music-expanded') || wrapper.classList.contains('timer-expanded');
        const shouldFade = inSplit && (
            (Island.expanded === 'music' && (Music.audio.paused || !Music.active)) ||
            ((Island.expanded === 'timer' || Island.expanded === 'timerDone') && (!Timer.running))
        );
        if (shouldFade) {
            Island.isMorphing = true;
            const isTimerExp = wrapper.classList.contains('timer-expanded');
            const fadeTarget = isTimerExp ? sec : island;
            if (fadeTarget) fadeTarget.classList.add('di-fading');
            setTimeout(() => {
                if (fadeTarget) {
                    fadeTarget.classList.remove('di-fading');
                    fadeTarget.style.transition = 'none';
                }
                wrapper.classList.remove('music-expanded', 'timer-expanded');
                sec.classList.remove('as-pill');
                document.querySelectorAll('.di-view-sec').forEach(v => v.classList.remove('active'));
                Island.expanded = null;
                Island.update();
                if (fadeTarget) {
                    fadeTarget.offsetHeight;
                    fadeTarget.style.transition = '';
                }
                Island.isMorphing = false;
            }, 350);
            return;
        }
        wrapper.classList.remove('music-expanded', 'timer-expanded');
        sec.classList.remove('as-pill');
        document.querySelectorAll('.di-view-sec').forEach(v => v.classList.remove('active'));
        Island.expanded = null;
        Island.update();
    },
    notify: (title, msg, icon) => {
        document.getElementById('notify-title').innerText = title;
        document.getElementById('notify-msg').innerHTML = msg;
        document.getElementById('notify-icon').className = `fas ${icon}`;
        Island.expand('notify');
        setTimeout(() => { if (Island.expanded === 'notify') Island.collapse(); }, 3000);
    },
    notifyUnlock: () => {
        if (Island.expanded === 'unlocked') return;
        Island.expand('unlocked');
        Island.unlockTimer = setTimeout(() => { if (Island.expanded === 'unlocked') Island.collapse(); }, 1000);
    },
    extractAlbumColor: (imageUrl, callback) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 50;
            canvas.height = 50;
            ctx.drawImage(img, 0, 0, 50, 50);
            try {
                const imageData = ctx.getImageData(0, 0, 50, 50).data;
                let r = 0, g = 0, b = 0, count = 0;
                for (let i = 0; i < imageData.length; i += 16) {
                    r += imageData[i];
                    g += imageData[i + 1];
                    b += imageData[i + 2];
                    count++;
                }
                r = Math.round(r / count);
                g = Math.round(g / count);
                b = Math.round(b / count);
                const max = Math.max(r, g, b);
                const boost = 1.3;
                r = Math.min(255, Math.round(r * boost));
                g = Math.min(255, Math.round(g * boost));
                b = Math.min(255, Math.round(b * boost));
                callback(`rgba(${r}, ${g}, ${b}, 0.6)`);
            } catch (e) {
                callback('rgba(255, 120, 80, 0.5)');
            }
        };
        img.onerror = () => {
            callback('rgba(255, 120, 80, 0.5)');
        };
        img.src = imageUrl;
    }
};
const Music = {
    active: false, currentIdx: 0, library: [], audio: document.getElementById('audio-player'), scrubbing: false,
    init: () => {
        Music.audio.onended = () => {
            if (Music.repeat || Music.shuffle) {
                Music.next();
            } else {
                Music.audio.pause();
                Music.audio.currentTime = 0;
                Music.active = false;
                Music.updateUI();
            }
        };
        Music.audio.ontimeupdate = () => Music.updateProgress();
    },
    loadFromDB: async () => {
        const songs = await Storage.loadSongs();
        if (songs.length > 0) Music.library = songs;
    },
    playTrack: (index) => {
        if (!Music.library[index]) return;
        const prevTrack = Music.library[Music.currentIdx];
        const prevHadLyrics = prevTrack && prevTrack.lrcData && prevTrack.lrcData.length > 0;
        Music.currentIdx = index;
        const track = Music.library[index];
        const currentHasLyrics = track && track.lrcData && track.lrcData.length > 0;
        let src = track.url;
        if (track.blob && !src) src = URL.createObjectURL(track.blob);
        Music.audio.src = src;
        Music.active = true;
        Music.audio.play()
        Music.updateUI();
        Island.update();
        if (typeof Lyrics !== 'undefined') {
            Lyrics.onSongChange(prevHadLyrics, currentHasLyrics);
        }
    },
    toggle: () => {
        if (!Music.active && Music.library.length > 0) { Music.playTrack(0); return; }
        if (Music.audio.paused) { Music.audio.play(); Music.active = true; } else { Music.audio.pause(); }
        Music.updateUI();
        if (typeof Island !== 'undefined') Island.update();
    },
    next: () => {
        if (Music.repeat) {
            Music.playTrack(Music.currentIdx);
            return;
        }
        let nextIdx;
        if (Music.shuffle) {
            if (Music.library.length > 1) {
                let newIdx = Music.currentIdx;
                let attempts = 0;
                while (newIdx === Music.currentIdx && attempts < 5) {
                    newIdx = Math.floor(Math.random() * Music.library.length);
                    attempts++;
                }
                nextIdx = newIdx;
            } else {
                nextIdx = 0;
            }
        } else {
            nextIdx = Music.currentIdx + 1;
            if (nextIdx >= Music.library.length) nextIdx = 0;
        }
        Music.playTrack(nextIdx);
    },
    prev: () => {
        let prev = Music.currentIdx - 1;
        if (prev < 0) prev = Music.library.length - 1;
        Music.playTrack(prev);
    },
    startScrub: (e, elem) => { Music.scrubbing = true; Music.seek(e, elem); },
    handleScrub: (e, elem) => { if (Music.scrubbing) Music.seek(e, elem); },
    endScrub: () => { Music.scrubbing = false; },
    seek: (e, elem) => {
        const rect = elem.getBoundingClientRect();
        let percent = (e.clientX - rect.left) / rect.width;
        if (percent < 0) percent = 0; if (percent > 1) percent = 1;
        if (Music.audio.duration) { Music.audio.currentTime = percent * Music.audio.duration; Music.updateProgress(); }
    },
    updateProgress: () => {
        if (!Music.active && !Music.scrubbing) return;
        const curr = Music.audio.currentTime;
        const dur = Music.audio.duration || 0;
        const pct = (curr / dur) * 100;
        const fmt = (t) => { const m = Math.floor(t / 60); const s = Math.floor(t % 60).toString().padStart(2, '0'); return `${m}:${s}`; };
        ['exp', 'fs'].forEach(p => {
            const f = document.getElementById(`${p}-prog-fill`); if (f) f.style.width = `${pct}%`;
            const c = document.getElementById(`${p}-curr-time`); if (c) c.innerText = fmt(curr);
            const t = document.getElementById(`${p}-tot-time`); if (t) t.innerText = fmt(dur);
        });
        if (typeof Lyrics !== 'undefined') {
            Lyrics.sync();
        }
    },
    handleFile: (e) => {
        const f = e.target.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const blob = new Blob([evt.target.result], { type: f.type });
            const newTrack = { id: Date.now(), title: f.name, artist: "Unknown Artist", blob: blob, art: null };
            jsmediatags.read(blob, {
                onSuccess: (tag) => {
                    newTrack.title = tag.tags.title || f.name;
                    newTrack.artist = tag.tags.artist || "Unknown Artist";
                    if (tag.tags.picture) {
                        const data = tag.tags.picture.data;
                        let base64 = "";
                        for (let i = 0; i < data.length; i++) base64 += String.fromCharCode(data[i]);
                        newTrack.art = `data:${tag.tags.picture.format};base64,${window.btoa(base64)}`;
                    }
                    Storage.saveSong(newTrack);
                    Music.library.unshift(newTrack);
                    Apps.music.render();
                    Music.playTrack(0);
                },
                onError: (err) => {
                    Storage.saveSong(newTrack);
                    Music.library.unshift(newTrack);
                    Apps.music.render();
                    Music.playTrack(0);
                }
            });
        };
        reader.readAsArrayBuffer(f);
        e.target.value = '';
    },
    removeTrack: (idx) => {
        const track = Music.library[idx];
        OS.showPopup('Remove Song', `Are you sure you want to remove ${track.title}?`, () => {
            if (track.id) Storage.removeSong(track.id);
            Music.library.splice(idx, 1);
            if (Music.currentIdx === idx) Music.audio.pause();
            Apps.music.render();
        });
    },
    expand: () => {
        document.getElementById('music-fs-overlay').classList.add('active');
        Music.updateUI();
    },
    collapse: () => {
        const overlay = document.getElementById('music-fs-overlay');
        if (Lyrics && Lyrics.active) {
            Lyrics.active = false;
            overlay.classList.remove('lyrics-active');
            document.getElementById('lyrics-btn').classList.remove('active');
            document.getElementById('lyrics-container').innerHTML = '';
        }
        overlay.classList.remove('active');
    },
    updateUI: () => {
        const track = Music.library[Music.currentIdx];
        if (!track) return;
        const artUrl = track.art || 'linear-gradient(45deg, #333, #666)';
        const artStyle = track.art ? `background-image:url('${track.art}')` : `background:${artUrl}`;
        const blurStyle = track.art ? `background-image:url('${track.art}')` : `background:#333`;
        document.getElementById('mini-art').style = `width:24px; height:24px; margin-right:10px; border-radius:4px; ${artStyle}; background-size:cover;`;
        document.getElementById('exp-art').style = `width:55px; height:55px; border-radius:12px; ${artStyle}; background-size:cover;`;
        document.getElementById('exp-title').innerText = track.title;
        document.getElementById('exp-artist').innerText = track.artist;
        document.getElementById('exp-play').className = Music.audio.paused ? 'fas fa-play' : 'fas fa-pause';
        const wave = document.querySelector('.di-wave');
        if (wave) {
            if (Music.audio.paused) wave.classList.add('paused');
            else wave.classList.remove('paused');
        }
        if (document.querySelector('.mini-player-bg')) {
            document.querySelector('.mini-player-bg').style = `${blurStyle}; background-size:cover; filter: blur(30px); opacity: 0.6;`;
            document.getElementById('mp-title').innerText = track.title;
            document.getElementById('mp-artist').innerText = track.artist;
            document.getElementById('mp-art').style = `width:50px; height:50px; border-radius:8px; flex-shrink:0; margin-right:15px; ${artStyle}; background-size:cover;`;
            document.getElementById('mp-play-icon').className = Music.audio.paused ? 'fas fa-play' : 'fas fa-pause';
        }
        document.getElementById('fs-bg').style = `${blurStyle}; background-size:cover; filter: blur(60px); opacity: 0.5;`;
        document.getElementById('fs-art').style = `${artStyle}; background-size:cover;`;
        document.getElementById('fs-title').innerText = track.title;
        document.getElementById('fs-artist').innerText = track.artist;
        document.getElementById('fs-play').className = Music.audio.paused ? 'fas fa-play' : 'fas fa-pause';
        Music.updatePlayingIndicators();
        const shuffleBtn = document.getElementById('fs-shuffle');
        const repeatBtn = document.getElementById('fs-repeat');
        if (shuffleBtn) shuffleBtn.classList.toggle('active', Music.shuffle);
        if (repeatBtn) repeatBtn.classList.toggle('active', Music.repeat);
    },
    shuffle: false,
    repeat: false,
    toggleShuffle: () => {
        Music.shuffle = !Music.shuffle;
        const btn = document.getElementById('fs-shuffle');
        if (btn) btn.classList.toggle('active', Music.shuffle);
        Island.notify(Music.shuffle ? 'Shuffle On' : 'Shuffle Off', '', 'fa-random');
    },
    toggleRepeat: () => {
        Music.repeat = !Music.repeat;
        const btn = document.getElementById('fs-repeat');
        if (btn) btn.classList.toggle('active', Music.repeat);
        Island.notify(Music.repeat ? 'Repeat On' : 'Repeat Off', '', 'fa-redo');
    },
    updatePlayingIndicators: () => {
        const indicators = document.querySelectorAll('.song-playing-indicator');
        indicators.forEach(ind => {
            const songItem = ind.closest('.song-item');
            if (songItem) {
                const idx = parseInt(songItem.dataset.songIdx);
                const isPlaying = Music.currentIdx === idx && Music.active;
                ind.classList.toggle('active', isPlaying);
            }
        });
    }
};
Music.init();
const Lyrics = {
    active: false,
    currentLineIdx: -1,
    parse: (lrcText) => {
        const lines = lrcText.split('\n');
        const lyrics = [];
        const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;
        lines.forEach(line => {
            const matches = [...line.matchAll(timeRegex)];
            if (matches.length > 0) {
                const text = line.replace(timeRegex, '').trim();
                if (text) {
                    matches.forEach(match => {
                        const minutes = parseInt(match[1]);
                        const seconds = parseInt(match[2]);
                        const ms = parseInt(match[3]);
                        const time = minutes * 60 + seconds + ms / 1000;
                        lyrics.push({ time, text });
                    });
                }
            }
        });
        lyrics.sort((a, b) => a.time - b.time);
        return lyrics;
    },
    toggleMode: () => {
        const overlay = document.getElementById('music-fs-overlay');
        const track = Music.library[Music.currentIdx];
        if (Lyrics.active) {
            Lyrics.active = false;
            overlay.classList.remove('lyrics-active');
            document.getElementById('lyrics-btn').classList.remove('active');
            document.getElementById('lyrics-container').innerHTML = '';
            return;
        }
        if (!track || !track.lrcData || track.lrcData.length === 0) {
            const footer = document.getElementById('osm-footer');
            document.getElementById('osm-title').innerText = 'No Lyrics';
            document.getElementById('osm-msg').innerText = "You haven't added a .lrc file to this song";
            footer.innerHTML = '';
            const cancelBtn = document.createElement('div');
            cancelBtn.className = 'osm-btn secondary';
            cancelBtn.innerText = 'Cancel';
            cancelBtn.onclick = OS.hidePopup;
            const addBtn = document.createElement('div');
            addBtn.className = 'osm-btn primary';
            addBtn.innerText = 'Add';
            addBtn.onclick = () => {
                OS.hidePopup();
                Lyrics.promptAddLrc();
            };
            footer.appendChild(cancelBtn);
            footer.appendChild(addBtn);
            document.getElementById('modal-overlay').classList.add('active');
            return;
        }
        Lyrics.active = true;
        overlay.classList.add('lyrics-active');
        document.getElementById('lyrics-btn').classList.add('active');
        Lyrics.render();
    },
    render: () => {
        const container = document.getElementById('lyrics-container');
        const track = Music.library[Music.currentIdx];
        if (!track || !track.lrcData) {
            container.innerHTML = '<div class="lyric-line" style="opacity:0.5">No lyrics available</div>';
            return;
        }
        container.innerHTML = track.lrcData.map((line, i) =>
            `<div class="lyric-line" data-idx="${i}" onclick="Lyrics.seekTo(${line.time})">${line.text}</div>`
        ).join('');
        Lyrics.currentLineIdx = -1;
        Lyrics.sync();
    },
    sync: () => {
        if (!Lyrics.active) return;
        const track = Music.library[Music.currentIdx];
        if (!track || !track.lrcData) return;
        const currentTime = Music.audio.currentTime;
        let newIdx = -1;
        for (let i = track.lrcData.length - 1; i >= 0; i--) {
            if (currentTime >= track.lrcData[i].time) {
                newIdx = i;
                break;
            }
        }
        if (newIdx !== Lyrics.currentLineIdx) {
            Lyrics.currentLineIdx = newIdx;
            Lyrics.highlightLine(newIdx);
        }
    },
    highlightLine: (idx) => {
        const container = document.getElementById('lyrics-container');
        const lines = container.querySelectorAll('.lyric-line');
        lines.forEach((line, i) => {
            line.classList.remove('active', 'past');
            if (i === idx) {
                line.classList.add('active');
                line.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else if (i < idx) {
                line.classList.add('past');
            }
        });
    },
    seekTo: (time) => {
        Music.audio.currentTime = time;
    },
    promptAddLrc: () => {
        const input = document.getElementById('lrc-input');
        input.onclick = null;
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (!file.name.toLowerCase().endsWith('.lrc')) {
                OS.showPopup('Invalid File', 'Only .lrc files are accepted. Please select a valid LRC file.');
                e.target.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = (evt) => {
                const lrcText = evt.target.result;
                const parsed = Lyrics.parse(lrcText);
                if (parsed.length > 0) {
                    Music.library[Music.currentIdx].lrcData = parsed;
                    Storage.saveSongs(Music.library);
                    Island.notify('Lyrics Added', `${parsed.length} lines loaded`, 'fa-music');
                    if (!Lyrics.active) {
                        Lyrics.toggleMode();
                    } else {
                        Lyrics.render();
                    }
                } else {
                    OS.showPopup('Error', 'Could not parse LRC file');
                }
            };
            reader.readAsText(file);
            e.target.value = '';
        };
        input.click();
    },
    confirmRemove: () => {
        const track = Music.library[Music.currentIdx];
        if (!track || !track.lrcData) return;
        const footer = document.getElementById('osm-footer');
        document.getElementById('osm-title').innerText = 'Remove Lyrics';
        document.getElementById('osm-msg').innerText = 'Are you sure you want to remove the .lrc file from this song?';
        footer.innerHTML = '';
        const noBtn = document.createElement('div');
        noBtn.className = 'osm-btn secondary';
        noBtn.innerText = 'No';
        noBtn.onclick = OS.hidePopup;
        const yesBtn = document.createElement('div');
        yesBtn.className = 'osm-btn primary';
        yesBtn.style.background = '#ff3b30';
        yesBtn.innerText = 'Yes';
        yesBtn.onclick = () => {
            delete Music.library[Music.currentIdx].lrcData;
            Storage.saveSongs(Music.library);
            Lyrics.toggleMode();
            OS.hidePopup();
            Island.notify('Lyrics Removed', 'LRC file has been removed', 'fa-trash');
        };
        footer.appendChild(noBtn);
        footer.appendChild(yesBtn);
        document.getElementById('modal-overlay').classList.add('active');
    },
    onSongChange: (prevHadLyrics, currentHasLyrics) => {
        if (Lyrics.active) {
            if (!currentHasLyrics) {
                Lyrics.active = false;
                document.getElementById('music-fs-overlay').classList.remove('lyrics-active');
                document.getElementById('lyrics-btn').classList.remove('active');
                document.getElementById('lyrics-container').innerHTML = '';
            } else {
                Lyrics.render();
            }
        }
    }
};
const Apps = {
    placeholder: { render: () => document.getElementById('app-body').innerHTML = `<div style="height:100%; display:flex; justify-content:center; align-items:center; opacity:0.5">Under Construction</div>` },
    notes: {
        render: () => {
            const body = document.getElementById('app-body');
            document.getElementById('app-header').style.display = 'none';
            let notesHTML = '';
            State.notes.forEach((note, i) => {
                notesHTML += `
                    <div class="note-card ${note.color}">
                        <div style="font-weight:600; margin-bottom:5px; white-space:pre-wrap;">${note.text}</div>
                        <div class="note-del" onclick="event.stopPropagation(); Apps.notes.delete(${i})"><i class="fas fa-trash"></i></div>
                    </div>`;
            });
            if (State.notes.length === 0) {
                notesHTML = `<div style="text-align:center; color:#888; margin-top:50px;">No notes yet</div>`;
            }
            body.innerHTML = `
                <div style="padding:20px 20px 80px; overflow-y:auto; height:100%;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                        <h1 style="margin:0; font-size:32px; font-weight:700;">Notes</h1>
                        <div style="display:flex; gap:10px;">
                            <div style="width:35px; height:35px; background:rgba(128,128,128,0.2); border-radius:10px; display:flex; justify-content:center; align-items:center;"><i class="fas fa-search"></i></div>
                            <div style="width:35px; height:35px; background:rgba(128,128,128,0.2); border-radius:10px; display:flex; justify-content:center; align-items:center;"><i class="fas fa-info-circle"></i></div>
                        </div>
                    </div>
                    <div class="notes-grid">
                        ${notesHTML}
                    </div>
                    <div class="notes-add-btn" onclick="Apps.notes.showAdd()"><i class="fas fa-plus"></i></div>
                </div>
            `;
        },
        showAdd: () => {
            document.getElementById('new-note-modal').classList.add('active');
            document.querySelectorAll('.color-opt').forEach(el => {
                el.onclick = function () {
                    document.querySelectorAll('.color-opt').forEach(c => c.classList.remove('selected'));
                    this.classList.add('selected');
                }
            });
        },
        cancelAdd: () => {
            document.getElementById('new-note-modal').classList.remove('active');
            document.getElementById('nn-text').value = '';
        },
        saveAdd: () => {
            const text = document.getElementById('nn-text').value;
            if (!text.trim()) return;
            const colorEl = document.querySelector('.color-opt.selected');
            const color = colorEl ? colorEl.getAttribute('data-c') : 'note-yellow';
            State.notes.push({ text: text, color: color });
            Storage.saveSettings();
            Apps.notes.cancelAdd();
            Apps.notes.render();
        },
        delete: (idx) => {
            State.notes.splice(idx, 1);
            Storage.saveSettings();
            Apps.notes.render();
        }
    },
    camera: {
        render: () => {
            const body = document.getElementById('app-body');
            document.getElementById('app-header').style.display = 'none';
            body.innerHTML = `
                <div style="height:100%; background:black; color:white; display:flex; flex-direction:column;">
                    <div style="padding:45px 20px 10px 20px; display:flex; justify-content:space-between; align-items:center; z-index:20;">
                        <i class="fas fa-bolt" style="font-size:18px;"></i>
                        <div style="width:20px; height:20px; background:#333; border-radius:50%; display:flex; justify-content:center; align-items:center; font-size:10px;"><i class="fas fa-chevron-down"></i></div>
                        <i class="fas fa-record-vinyl" style="font-size:18px;"></i>
                    </div>
                    <div style="flex:1; background:#111; position:relative; overflow:hidden;">
                        <div style="position:absolute; inset:0; display:flex; flex-direction:column;">
                            <div style="flex:1; border-bottom:1px solid rgba(255,255,255,0.1)"></div>
                            <div style="flex:1; border-bottom:1px solid rgba(255,255,255,0.1)"></div>
                            <div style="flex:1"></div>
                        </div>
                        <div style="position:absolute; inset:0; display:flex;">
                            <div style="flex:1; border-right:1px solid rgba(255,255,255,0.1)"></div>
                            <div style="flex:1; border-right:1px solid rgba(255,255,255,0.1)"></div>
                            <div style="flex:1"></div>
                        </div>
                        <div style="position:absolute; bottom:10px; left:50%; transform:translateX(-50%); display:flex; gap:10px; font-size:12px; font-weight:600; background:rgba(0,0,0,0.5); padding:5px 10px; border-radius:20px;">
                            <span>0.5</span><span style="color:#fcd116">1x</span><span>3</span>
                        </div>
                    </div>
                    <div style="height:140px; background:black; display:flex; flex-direction:column; justify-content:center; padding-bottom:20px;">
                        <div style="display:flex; justify-content:center; gap:20px; font-size:13px; font-weight:600; color:#888; margin-bottom:20px;">
                            <span>CINEMATIC</span><span>VIDEO</span><span style="color:#fcd116">PHOTO</span><span>PORTRAIT</span><span>PANO</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:0 30px;">
                            <div style="width:45px; height:45px; background:#333; border-radius:6px; overflow:hidden; border:1px solid #555;">
                                <img src="https://ibb.co/zTKVc2QL" style="width:100%; height:100%; object-fit:cover; opacity:0.7">
                            </div>
                            <div style="width:70px; height:70px; border-radius:50%; border:4px solid white; display:flex; justify-content:center; align-items:center; cursor:pointer;">
                                <div style="width:60px; height:60px; background:white; border-radius:50%; transition:0.1s;" onmousedown="this.style.transform='scale(0.9)'" onmouseup="this.style.transform='scale(1)'"></div>
                            </div>
                            <div style="width:45px; height:45px; background:#1c1c1e; border-radius:50%; display:flex; justify-content:center; align-items:center; font-size:20px;">
                                <i class="fas fa-sync-alt"></i>
                            </div>
                        </div>
                    </div>
                </div>`;
        }
    },
    phone: {
        num: '',
        render: () => {
            document.getElementById('app-body').innerHTML = `
                <div style="height:100%; display:flex; flex-direction:column;">
                    <div class="phone-display" id="p-disp"></div>
                    <div class="phone-grid">
                        <button class="num-btn" onclick="Apps.phone.add('1',this)"><div class="nb-big">1</div><div class="nb-sm">&nbsp;</div></button>
                        <button class="num-btn" onclick="Apps.phone.add('2',this)"><div class="nb-big">2</div><div class="nb-sm">ABC</div></button>
                        <button class="num-btn" onclick="Apps.phone.add('3',this)"><div class="nb-big">3</div><div class="nb-sm">DEF</div></button>
                        <button class="num-btn" onclick="Apps.phone.add('4',this)"><div class="nb-big">4</div><div class="nb-sm">GHI</div></button>
                        <button class="num-btn" onclick="Apps.phone.add('5',this)"><div class="nb-big">5</div><div class="nb-sm">JKL</div></button>
                        <button class="num-btn" onclick="Apps.phone.add('6',this)"><div class="nb-big">6</div><div class="nb-sm">MNO</div></button>
                        <button class="num-btn" onclick="Apps.phone.add('7',this)"><div class="nb-big">7</div><div class="nb-sm">PQRS</div></button>
                        <button class="num-btn" onclick="Apps.phone.add('8',this)"><div class="nb-big">8</div><div class="nb-sm">TUV</div></button>
                        <button class="num-btn" onclick="Apps.phone.add('9',this)"><div class="nb-big">9</div><div class="nb-sm">WXYZ</div></button>
                        <button class="num-btn" onclick="Apps.phone.add('*',this)"><div class="nb-big" style="font-size:36px; padding-top:10px">*</div></button>
                        <button class="num-btn" onclick="Apps.phone.add('0',this)"><div class="nb-big">0</div><div class="nb-sm">+</div></button>
                        <button class="num-btn" onclick="Apps.phone.add('#',this)"><div class="nb-big">#</div></button>
                        <button class="call-btn" onclick="Apps.phone.call()"><i class="fas fa-phone"></i></button>
                    </div>
                </div>
            `;
            Apps.phone.num = '';
        },
        add: (n, btn) => {
            if (Apps.phone.num.length < 15) {
                Apps.phone.num += n;
                const disp = document.getElementById('p-disp');
                const span = document.createElement('span');
                span.textContent = n;
                span.style.display = 'inline-block';
                span.style.animation = 'digitIn 0.15s ease forwards';
                disp.appendChild(span);
                if (State.glassUI && btn) {
                    btn.classList.add('glass-glow');
                    const parent = btn.parentElement;
                    if (parent) {
                        const siblings = parent.querySelectorAll('.num-btn');
                        const r = btn.getBoundingClientRect();
                        siblings.forEach(s => { if (s !== btn && Math.hypot(s.getBoundingClientRect().left - r.left, s.getBoundingClientRect().top - r.top) < 120) s.classList.add('glass-glow-neighbor'); });
                    }
                    setTimeout(() => { btn.classList.remove('glass-glow'); if (parent) parent.querySelectorAll('.glass-glow-neighbor').forEach(s => s.classList.remove('glass-glow-neighbor')); }, 400);
                }
            }
        },
        call: () => { Toast.show('Sim card unavailable'); }
    },
    clock: {
        selectedHours: 0,
        selectedMinutes: 5,
        selectedSeconds: 0,
        render: () => {
            document.getElementById('app-window').style.background = 'var(--bg-app)';
            const genItems = (max, padLen = 2) => {
                let html = '<div class="timer-digit-item" style="opacity:0"></div>';
                for (let i = 0; i <= max; i++) {
                    html += `<div class="timer-digit-item" data-val="${i}">${i.toString().padStart(padLen, '0')}</div>`;
                }
                html += '<div class="timer-digit-item" style="opacity:0"></div>';
                return html;
            };
            document.getElementById('app-body').innerHTML = `
                <div style="height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; color:var(--text-main); padding: 20px;">
                    <div style="font-size:18px; color:#888; margin-bottom:20px;">Set Timer Duration</div>
                    <div class="timer-scroll-container">
                        <div>
                            <div class="timer-scroll-digit" id="scroll-hours">${genItems(23)}</div>
                            <div class="timer-scroll-label">Hours</div>
                        </div>
                        <div class="timer-scroll-separator">:</div>
                        <div>
                            <div class="timer-scroll-digit" id="scroll-minutes">${genItems(59)}</div>
                            <div class="timer-scroll-label">Minutes</div>
                        </div>
                        <div class="timer-scroll-separator">:</div>
                        <div>
                            <div class="timer-scroll-digit" id="scroll-seconds">${genItems(59)}</div>
                            <div class="timer-scroll-label">Seconds</div>
                        </div>
                    </div>
                    <div id="stopwatch-val" style="font-size:60px; font-weight:200; font-family:monospace; margin:20px 0">${Math.floor(Timer.time / 60).toString().padStart(2, '0')}:${(Timer.time % 60).toString().padStart(2, '0')}</div>
                    <div style="display:flex; gap:20px; margin-top:20px;">
                        <button class="btn-pill" style="width:80px; background:rgba(128,128,128,0.2); color:var(--text-main); border-radius:50%; height:80px;" onclick="Timer.stop()">Cancel</button>
                        <button class="btn-pill" style="width:80px; background:#34c759; border-radius:50%; height:80px; color:#000;" onclick="Apps.clock.start()">Start</button>
                    </div>
                </div>`;
            Apps.clock.initScroller('scroll-hours', 'selectedHours', 23);
            Apps.clock.initScroller('scroll-minutes', 'selectedMinutes', 59);
            Apps.clock.initScroller('scroll-seconds', 'selectedSeconds', 59);
            setTimeout(() => {
                Apps.clock.scrollToValue('scroll-hours', Apps.clock.selectedHours);
                Apps.clock.scrollToValue('scroll-minutes', Apps.clock.selectedMinutes);
                Apps.clock.scrollToValue('scroll-seconds', Apps.clock.selectedSeconds);
            }, 50);
        },
        initScroller: (id, prop, max) => {
            const el = document.getElementById(id);
            if (!el) return;
            let isDragging = false;
            let startY = 0;
            let startScroll = 0;
            el.addEventListener('mousedown', (e) => {
                isDragging = true;
                startY = e.clientY;
                startScroll = el.scrollTop;
                el.style.cursor = 'grabbing';
                e.preventDefault();
            });
            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const deltaY = startY - e.clientY;
                el.scrollTop = startScroll + deltaY;
            });
            document.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    el.style.cursor = 'grab';
                    const itemHeight = 50;
                    const targetScroll = Math.round(el.scrollTop / itemHeight) * itemHeight;
                    el.scrollTo({ top: targetScroll, behavior: 'smooth' });
                }
            });
            el.addEventListener('touchstart', (e) => {
                isDragging = true;
                startY = e.touches[0].clientY;
                startScroll = el.scrollTop;
            }, { passive: true });
            el.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                const deltaY = startY - e.touches[0].clientY;
                el.scrollTop = startScroll + deltaY;
            }, { passive: true });
            el.addEventListener('touchend', () => {
                if (isDragging) {
                    isDragging = false;
                    const itemHeight = 50;
                    const targetScroll = Math.round(el.scrollTop / itemHeight) * itemHeight;
                    el.scrollTo({ top: targetScroll, behavior: 'smooth' });
                }
            });
            el.addEventListener('scroll', () => {
                const itemHeight = 50;
                const scrollTop = el.scrollTop;
                const selectedIdx = Math.round(scrollTop / itemHeight);
                Apps.clock[prop] = Math.min(max, Math.max(0, selectedIdx));
                const items = el.querySelectorAll('.timer-digit-item[data-val]');
                items.forEach((item, i) => {
                    if (i === Apps.clock[prop]) {
                        item.classList.add('selected');
                    } else {
                        item.classList.remove('selected');
                    }
                });
                Apps.clock.updatePreview();
            });
            el.style.cursor = 'grab';
        },
        scrollToValue: (id, value) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.scrollTop = value * 50;
        },
        updatePreview: () => {
            const totalSeconds = Apps.clock.selectedHours * 3600 + Apps.clock.selectedMinutes * 60 + Apps.clock.selectedSeconds;
            const m = Math.floor(totalSeconds / 60);
            const s = totalSeconds % 60;
            const display = document.getElementById('stopwatch-val');
            if (display) {
                display.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            }
        },
        start: () => {
            const totalSeconds = Apps.clock.selectedHours * 3600 + Apps.clock.selectedMinutes * 60 + Apps.clock.selectedSeconds;
            Timer.time = totalSeconds > 0 ? totalSeconds : 300;
            Timer.start();
        }
    },
    calc: {
        val: '',
        history: JSON.parse(localStorage.getItem('calc_history') || '[]'),
        render: () => {
            document.getElementById('app-body').innerHTML = `
                <div style="display:flex; flex-direction:column; height:100%;">
                     <div style="position:absolute; top:50px; right:20px; z-index:100; font-size:20px; color:#888; cursor:pointer;" onclick="Apps.calc.showHistory()"><i class="fas fa-history"></i></div>
                    <div class="calc-display" id="c-disp">0</div>
                    <div class="calc-grid">
                        <button class="calc-btn cb-lt" onclick="Apps.calc.clr()">AC</button>
                        <button class="calc-btn cb-lt">+/-</button>
                        <button class="calc-btn cb-lt">%</button>
                        <button class="calc-btn cb-or" onclick="Apps.calc.add('/',this)">&divide;</button>
                        <button class="calc-btn cb-dk" onclick="Apps.calc.add('7',this)">7</button>
                        <button class="calc-btn cb-dk" onclick="Apps.calc.add('8',this)">8</button>
                        <button class="calc-btn cb-dk" onclick="Apps.calc.add('9',this)">9</button>
                        <button class="calc-btn cb-or" onclick="Apps.calc.add('*',this)">&times;</button>
                        <button class="calc-btn cb-dk" onclick="Apps.calc.add('4',this)">4</button>
                        <button class="calc-btn cb-dk" onclick="Apps.calc.add('5',this)">5</button>
                        <button class="calc-btn cb-dk" onclick="Apps.calc.add('6',this)">6</button>
                        <button class="calc-btn cb-or" onclick="Apps.calc.add('-',this)">-</button>
                        <button class="calc-btn cb-dk" onclick="Apps.calc.add('1',this)">1</button>
                        <button class="calc-btn cb-dk" onclick="Apps.calc.add('2',this)">2</button>
                        <button class="calc-btn cb-dk" onclick="Apps.calc.add('3',this)">3</button>
                        <button class="calc-btn cb-or" onclick="Apps.calc.add('+',this)">+</button>
                        <button class="calc-btn cb-dk" style="grid-column:span 2; border-radius:24px; aspect-ratio:auto;" onclick="Apps.calc.add('0',this)">0</button>
                        <button class="calc-btn cb-dk" onclick="Apps.calc.add('.',this)">.</button>
                        <button class="calc-btn cb-or" onclick="Apps.calc.solve()">=</button>
                    </div>
                </div>`;
        },
        add: (n, btn) => {
            Apps.calc.val += n;
            const disp = document.getElementById('c-disp');
            disp.innerHTML = '';
            for (let i = 0; i < Apps.calc.val.length; i++) {
                const span = document.createElement('span');
                span.textContent = Apps.calc.val[i];
                span.style.display = 'inline-block';
                if (i === Apps.calc.val.length - 1) span.style.animation = 'digitIn 0.15s ease forwards';
                disp.appendChild(span);
            }
            if (State.glassUI && btn) {
                btn.classList.add('glass-glow');
                const parent = btn.parentElement;
                if (parent) {
                    const siblings = parent.querySelectorAll('.calc-btn');
                    const r = btn.getBoundingClientRect();
                    siblings.forEach(s => { if (s !== btn && Math.hypot(s.getBoundingClientRect().left - r.left, s.getBoundingClientRect().top - r.top) < 120) s.classList.add('glass-glow-neighbor'); });
                }
                setTimeout(() => { btn.classList.remove('glass-glow'); if (parent) parent.querySelectorAll('.glass-glow-neighbor').forEach(s => s.classList.remove('glass-glow-neighbor')); }, 400);
            }
        },
        clr: () => {
            const disp = document.getElementById('c-disp');
            const spans = disp.querySelectorAll('span');
            if (spans.length > 0) {
                spans.forEach(s => { s.style.animation = 'digitOut 0.15s ease forwards'; });
                setTimeout(() => { Apps.calc.val = ''; disp.innerHTML = '0'; }, 160);
            } else {
                Apps.calc.val = '';
                disp.innerHTML = '0';
            }
        },
        solve: () => {
            try {
                const result = eval(Apps.calc.val);
                if (Apps.calc.val && result !== undefined) {
                    Apps.calc.history.unshift({ eq: Apps.calc.val, res: result });
                    if (Apps.calc.history.length > 20) Apps.calc.history.pop();
                    localStorage.setItem('calc_history', JSON.stringify(Apps.calc.history));
                }
                Apps.calc.val = result;
                document.getElementById('c-disp').innerText = Apps.calc.val;
            } catch (e) { document.getElementById('c-disp').innerText = 'Error'; Apps.calc.val = ''; }
        },
        showHistory: () => {
            const list = Apps.calc.history.map(h => `<div style="padding:10px; border-bottom:1px solid #333; display:flex; justify-content:space-between; color:white;"><span style="opacity:0.6">${h.eq} =</span> <span style="font-weight:bold">${h.res}</span></div>`).join('');
            OS.showPopup('History', `<div style="max-height:300px; overflow-y:auto; text-align:left;">${list || '<div style="text-align:center;color:#888">No history</div>'}</div>`);
        }
    },
    settings: {
        view: 'root', tempPin: '', previousView: null,
        render: (v) => {
            const subSections = { 'aod': 'wallpaper', 'clockconfig': 'wallpaper', 'animconfig': 'customization', 'changelog': 'about', 'fingerprint-icon': 'security', 'bio': 'security' };
            const isSubForward = v && subSections[v] && Apps.settings.view === subSections[v];
            const isSubBack = subSections[Apps.settings.view] && v === subSections[Apps.settings.view];
            const isForward = (v && v !== 'root' && Apps.settings.view === 'root') || isSubForward;
            const isBack = (v === 'root' && Apps.settings.view !== 'root') || isSubBack;
            Apps.settings.previousView = Apps.settings.view;
            if (v) Apps.settings.view = v;
            const view = Apps.settings.view;
            const body = document.getElementById('app-body');
            const headerTitle = document.getElementById('app-title');
            const backBtn = document.getElementById('app-back');
            const win = document.getElementById('app-window');
            const bg = 'var(--bg-app)';
            win.style.background = bg;
            body.style.background = bg;
            const appHeader = document.getElementById('app-header');
            if (view === 'root') { headerTitle.innerText = ''; backBtn.style.display = 'none'; }
            else if (isForward && view === 'about') { backBtn.style.display = 'none'; }
            else if (isForward) { backBtn.style.display = 'none'; }
            else if (isBack) { headerTitle.innerText = ''; backBtn.style.display = 'none'; }
            else { backBtn.style.display = 'none'; }
            if (view === 'about') {
                if (!isForward) {
                    appHeader.style.display = 'flex';
                    appHeader.style.visibility = 'visible';
                    appHeader.style.setProperty('background', 'transparent', 'important');
                    appHeader.style.setProperty('backdrop-filter', 'none', 'important');
                    appHeader.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
                    appHeader.style.position = 'absolute';
                    appHeader.style.top = '0';
                    appHeader.style.left = '0';
                    appHeader.style.right = '0';
                    appHeader.style.zIndex = '100';
                    appHeader.style.pointerEvents = 'none';
                    headerTitle.style.display = 'none';
                }
            } else if (view !== 'root') {
            } else {
                appHeader.style.display = 'flex';
                appHeader.style.visibility = 'visible';
                const isDark = State.darkMode;
                const bgBlur = isDark ? 'rgba(0,0,0,0.7)' : 'rgba(242,242,247,0.7)';
                appHeader.style.background = State.liteMode ? '' : bgBlur;
                appHeader.style.backdropFilter = State.liteMode ? '' : 'blur(20px)';
                appHeader.style.webkitBackdropFilter = State.liteMode ? '' : 'blur(20px)';
                appHeader.style.position = '';
                appHeader.style.top = '';
                appHeader.style.left = '';
                appHeader.style.right = '';
                appHeader.style.width = '';
                appHeader.style.zIndex = '';
                appHeader.style.pointerEvents = '';
                body.style.paddingTop = '';
                body.style.boxSizing = '';
                headerTitle.style.display = '';
            }
            let content = '';
            if (view === 'root') {
                content = `
                    <div class="anim-fade" style="padding-bottom:20px;">
                        <div style="padding:30px 24px 20px; font-size:28px; font-weight:700; color:var(--text-main);">Settings</div>
                        <div class="s-section" style="margin:0 16px 12px; overflow:hidden;">
                            <div class="settings-profile-header" onclick="Apps.settings.render('profile')" style="padding:16px 16px; margin:0; background:transparent; border-radius:0; display:flex; align-items:center; gap:16px;">
                                <div class="profile-avatar">
                                    ${State.userProfile.image ?
                        `<img src="${State.userProfile.image}">` :
                        `<i class="fas fa-user"></i>`}
                                </div>
                                <div class="profile-info" style="flex:1;">
                                    <div class="profile-greeting" style="font-size:17px; font-weight:600;">${State.userProfile.name}</div>
                                    <div class="profile-subtitle" style="font-size:13px; opacity:0.5;">Tap to edit profile</div>
                                </div>
                                <i class="fas fa-chevron-right" style="color:rgba(128,128,128,0.4); font-size:13px"></i>
                            </div>
                            <div style="height:1px; background:rgba(128,128,128,0.15); margin-left:60px;"></div>
                            <div class="s-row" onclick="Apps.settings.render('about')" style="padding:14px 16px;">
                                <div class="s-row-left"><div class="s-icon-round" style="background:#9396a6"><i class="fa-solid fa-mobile"></i></div><span>About</span></div>
                                <i class="fas fa-chevron-right s-chev"></i>
                            </div>
                        </div>
                        <div class="s-section" style="margin:0 16px 12px;">
                            <div class="s-row" onclick="Apps.settings.render('wallpaper')">
                                <div class="s-row-left"><div class="s-icon-round" style="background:#5856d6"><i class="fa-solid fa-brush"></i></div><span>Wallpaper & personalization</span></div>
                                <i class="fas fa-chevron-right s-chev"></i>
                            </div>
                            <div class="s-row" onclick="Apps.settings.render('island')">
                                <div class="s-row-left"><div class="s-icon-round" style="background:#000000"><i class="fas fa-minus"></i></div><span>Dynamic Island</span></div>
                                <i class="fas fa-chevron-right s-chev"></i>
                            </div>
                            <div class="s-row" onclick="Apps.settings.render('customization')">
                                <div class="s-row-left"><div class="s-icon-round" style="background:#2e84fd"><i class="fas fa-home"></i></div><span>Home screen</span></div>
                                <i class="fas fa-chevron-right s-chev"></i>
                            </div>
                        </div>
                        <div class="s-section" style="margin:0 16px 12px;">
                            <div class="s-row" onclick="Apps.settings.render('security')">
                                <div class="s-row-left"><div class="s-icon-round" style="background:#27cb43"><i class="fas fa-lock"></i></div><span>PIN & Fingerprint</span></div>
                                <i class="fas fa-chevron-right s-chev"></i>
                            </div>
                        </div>
                        <div class="s-section" style="margin:0 16px 12px;">
                            <div class="s-row" onclick="Apps.settings.render('display')">
                                <div class="s-row-left"><div class="s-icon-round" style="background:#f2bd1d"><svg style="width:30px; height:30px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="currentColor" d="M320 496C333.3 496 344 506.7 344 520L344 584C344 597.3 333.3 608 320 608C306.7 608 296 597.3 296 584L296 520C296 506.7 306.7 496 320 496zM161.6 444.4C171 435 186.2 435 195.6 444.4C205 453.8 205 469 195.6 478.4L150.3 523.7C140.9 533.1 125.7 533.1 116.4 523.7C107.1 514.3 107 499.1 116.4 489.8L161.6 444.5zM444.4 444.4C453.8 435 469 435 478.4 444.4L523.7 489.7C533.1 499.1 533.1 514.3 523.7 523.6C514.3 532.9 499.1 533 489.8 523.6L444.5 478.3C435.1 468.9 435.1 453.7 444.5 444.3zM320 448C249.3 448 192 390.7 192 320C192 249.3 249.3 192 320 192C390.7 192 448 249.3 448 320C448 390.7 390.7 448 320 448zM120 296C133.3 296 144 306.7 144 320C144 333.3 133.3 344 120 344L56 344C42.7 344 32 333.3 32 320C32 306.7 42.7 296 56 296L120 296zM584 296C597.3 296 608 306.7 608 320C608 333.3 597.3 344 584 344L520 344C506.7 344 496 333.3 496 320C496 306.7 506.7 296 520 296L584 296zM116.3 116.3C125.7 106.9 140.9 106.9 150.2 116.3L195.5 161.5C204.9 170.9 204.9 186.1 195.5 195.5C186.1 204.9 170.9 204.9 161.5 195.5L116.3 150.3C106.9 140.9 106.9 125.7 116.3 116.4zM489.7 116.3C499.1 106.9 514.3 106.9 523.6 116.3C532.9 125.7 533 140.9 523.6 150.2L478.3 195.5C468.9 204.9 453.7 204.9 444.3 195.5C434.9 186.1 434.9 170.9 444.3 161.5L489.6 116.3zM320 32C333.3 32 344 42.7 344 56L344 120C344 133.3 333.3 144 320 144C306.7 144 296 133.3 296 120L296 56C296 42.7 306.7 32 320 32z"/></svg></div><span>Display & brightness</span></div>
                                <i class="fas fa-chevron-right s-chev"></i>
                            </div>
                        </div>
                    </div>`;
            }
            else if (view === 'aod') {
                headerTitle.innerText = 'Always On Display';
                content = `
                    <div class="anim-fade">
                        <div id="aod-preview" style="height:150px; background:#000; margin:0 20px 20px; border-radius:15px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#ccc; border:1px solid #333; position:relative; overflow:hidden;">
                            <div id="aod-preview-wall" style="position:absolute; inset:0; background:var(--wall); background-size:cover; opacity:${State.aod.wallpaper ? '0.5' : '0'}; filter:brightness(0.5); transition: opacity 0.3s ease;"></div>
                            <div style="z-index:2; text-align:center;">
                                <div style="font-size:12px; font-weight:600; opacity:0.7">SATURDAY, JAN 1</div>
                                <div id="aod-preview-clock" style="font-size:40px; font-weight:200; line-height:1; font-family:${State.aod.style == 'serif' ? "'Times New Roman', serif" : State.aod.style == 'science' ? "'Rajdhani', sans-serif" : State.aod.style == 'mono' ? "'Monoton', cursive" : State.aod.style == 'lux' ? "'Luxurious Roman', serif" : "'Inter', sans-serif"}">12:00</div>
                                <div id="aod-preview-text" style="font-size:10px; margin-top:5px; opacity:0.8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${State.aod.text || "Your Text"}</div>
                            </div>
                        </div>
                        <div class="list-group">
                             <div class="list-item" onclick="Apps.settings.toggleAOD()"><span>Always On Display</span><div class="toggle ${State.aod.enabled ? 'active' : ''}"></div></div>
                        </div>
                        <div style="padding:0 20px 5px; font-size:13px; color:var(--text-sec);">TEXT</div>
                        <div style="margin:0 20px 20px;">
                            <input type="text" value="${State.aod.text}" placeholder="Enter custom text..." onkeydown="event.stopPropagation()" oninput="Apps.settings.updateAODTextPreview(this.value)" style="width:100%; padding:12px; border-radius:10px; border:none; background:rgba(128,128,128,0.1); color:var(--text-main); font-size:16px;">
                        </div>
                        <div style="padding:0 20px 5px; font-size:13px; color:var(--text-sec);">BACKGROUND</div>
                        <div class="list-group">
                             <div class="list-item" onclick="Apps.settings.toggleAODWall()"><span>Show Wallpaper</span><div class="toggle ${State.aod.wallpaper ? 'active' : ''}"></div></div>
                             <div class="list-item" onclick="document.getElementById('aod-input').click()"><span>Custom Image</span><i class="fas fa-image"></i></div>
                             <div class="list-item" onclick="Apps.settings.setAODImg(null)"><span>No Image</span>${State.aod.image == null ? '<i class="fas fa-check"></i>' : ''}</div>
                        </div>
                    </div>`;
                document.getElementById('aod-input').onchange = (e) => { const f = e.target.files[0]; if (f) Apps.settings.setAODImg(URL.createObjectURL(f)); };
            }

            else if (view === 'security') {
                headerTitle.innerText = 'PIN and Fingerprint';
                content = `
                    <div class="anim-fade">
                        <div class="list-group">
                            <div class="list-item" onclick="Apps.settings.render('pin')"><span>${State.security.pin ? 'Change PIN' : 'Set PIN'}</span><span style="color:var(--text-sec); margin-right:10px">${State.security.pin ? 'On' : 'Off'}</span></div>
                            <div class="list-item" onclick="${State.security.pin ? "Apps.settings.render('bio')" : "Toast.show('Set a PIN first')"}"><span style="${!State.security.pin ? 'opacity:0.5' : ''}">Fingerprint</span><span style="color:var(--text-sec); margin-right:10px">${State.security.fingerprint ? 'Enrolled' : 'Off'}</span></div>
                        </div>
                        ${State.security.fingerprint ? `
                        <div class="list-group" style="margin: 0 20px 10px;">
                            <div class="list-item" onclick="Apps.settings.render('fingerprint-icon')"><span>Fingerprint Icon</span><span style="color:var(--text-sec); margin-right:10px"><i class="fas fa-chevron-right" style="font-size:12px; opacity:0.4;"></i></span></div>
                        </div>` : ''}
                    </div>`;
            }
            else if (view === 'fingerprint-icon') {
                headerTitle.innerText = 'Fingerprint Icon';
                const icon = State.security.bioIcon || 'default';
                const _fpPreviewHtml = (ic) => {
                    return '<div style="width:48px;height:48px;border:4px solid rgba(145,147,151,0.7);border-radius:50%"></div>';
                };
                Apps.settings._fpPreviewHtml = _fpPreviewHtml;
                content = `
                    <div class="anim-fade">
                        <div style="display:flex; flex-direction:column; align-items:center; padding:20px 16px; margin-top:20px;">
                            <div id="fp-phone-mockup" style="
                                width: 220px; height: 440px; background: #000; border-radius: 36px;
                                border: 3px solid rgba(255,255,255,0.15); position: relative;
                                display: flex; flex-direction: column; align-items: center;
                                overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.5);
                                margin-bottom: 24px;
                            ">
                                <div id="fp-mock-time" style="
                                    margin-top: 60px; font-size: 52px; font-weight: 300; color: white;
                                    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
                                    letter-spacing: 1px;
                                "></div>
                                <div id="fp-mock-date" style="
                                    font-size: 15px; color: rgba(255,255,255,0.6); margin-top: 4px;
                                    font-weight: 500;
                                "></div>
                                <div id="fp-mock-icon" style="
                                    position: absolute; bottom: 30px; width: 48px; height: 48px;
                                    display: flex; align-items: center; justify-content: center;
                                ">${_fpPreviewHtml(icon)}</div>
                            </div>
                            <div class="list-group" style="width:100%; margin-bottom:16px;">
                                <div class="list-item" onclick="Apps.settings.toggleSlowFingerprint()"><span>Slow Animation</span><div class="toggle ${State.security.slowFingerprint ? 'active' : ''}"></div></div>
                            </div>
                            <div style="background:var(--bg-card, rgba(128, 128, 128, 0.06)); border-radius:16px; padding:20px; width:100%; box-sizing:border-box;">
                                <div class="fp-grid" style="gap:24px; justify-content:center;">
                                    <div class="fp-opt selected" onclick="Apps.settings.setBioIconLive('default')" style="width:64px;height:64px;"><div style="width:48px;height:48px;border:4px solid rgba(145,147,151,0.7);border-radius:50%"></div></div>
                                </div>
                            </div>
                        </div>
                    </div>`;
                setTimeout(() => {
                    const updateMockClock = () => {
                        const timeEl = document.getElementById('fp-mock-time');
                        const dateEl = document.getElementById('fp-mock-date');
                        if (!timeEl) return;
                        const now = new Date();
                        const h = now.getHours();
                        const m = now.getMinutes().toString().padStart(2, '0');
                        const h12 = State.clockFormat === '24h' ? h : ((h % 12) || 12);
                        timeEl.innerText = `${h12}:${m}`;
                        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                        if (dateEl) dateEl.innerText = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
                    };
                    updateMockClock();
                    Apps.settings._fpClockInterval = setInterval(updateMockClock, 1000);
                }, 50);
            }
            else if (view === 'pin') {
                headerTitle.innerText = 'Set PIN';
                Apps.settings.tempPin = '';
                content = `
                    <div class="anim-fade" style="text-align:center; padding-top:40px;">
                         <div style="margin-bottom:20px; font-size:18px;">Enter new 4-digit PIN</div>
                         <div id="set-pin-disp" style="font-size:30px; letter-spacing:10px; margin-bottom:40px; font-weight:bold; min-height:40px;">_ _ _ _</div>
                         <div class="setup-pin-grid">
                            <button class="setup-pin-btn glass-btn" onclick="Apps.settings.handlePinIn('1')">1</button>
                            <button class="setup-pin-btn glass-btn" onclick="Apps.settings.handlePinIn('2')">2</button>
                            <button class="setup-pin-btn glass-btn" onclick="Apps.settings.handlePinIn('3')">3</button>
                            <button class="setup-pin-btn glass-btn" onclick="Apps.settings.handlePinIn('4')">4</button>
                            <button class="setup-pin-btn glass-btn" onclick="Apps.settings.handlePinIn('5')">5</button>
                            <button class="setup-pin-btn glass-btn" onclick="Apps.settings.handlePinIn('6')">6</button>
                            <button class="setup-pin-btn glass-btn" onclick="Apps.settings.handlePinIn('7')">7</button>
                            <button class="setup-pin-btn glass-btn" onclick="Apps.settings.handlePinIn('8')">8</button>
                            <button class="setup-pin-btn glass-btn" onclick="Apps.settings.handlePinIn('9')">9</button>
                            <button class="setup-pin-btn glass-btn" style="visibility:hidden"></button>
                            <button class="setup-pin-btn glass-btn" onclick="Apps.settings.handlePinIn('0')">0</button>
                            <button class="setup-pin-btn glass-btn" onclick="Apps.settings.render('security')"><i class="fas fa-backspace"></i></button>
                         </div>
                    </div>`;
            }
            else if (view === 'bio') {
                headerTitle.innerText = 'Fingerprint enroll';
                content = `
                    <div class="anim-fade">
                        <div style="display:flex; flex-direction:column; align-items:center; height:100%; position:relative; padding-top:60px;">
                            <div style="text-align:center; padding:0 30px;">
                                <div style="font-size:16px; font-weight:600; margin-bottom:8px;">Register your fingerprint</div>
                                <div style="font-size:13px; color:var(--text-sec); line-height:1.5;">Hold your finger on the sensor below until the circle fills completely.</div>
                            </div>
                            <div style="
                                width: 160px; height: 280px; background: #000; border-radius: 30px;
                                border: 3px solid rgba(255,255,255,0.12); position: relative;
                                display: flex; flex-direction: column; align-items: center;
                                margin-top: 24px;
                                box-shadow: 0 6px 24px rgba(0,0,0,0.4);
                            ">
                                <div style="flex:1;"></div>
                                <i class="fas fa-fingerprint" style="font-size:36px; color:rgba(255,255,255,0.3);"></i>
                                <div style="font-size:11px; color:rgba(255,255,255,0.3); margin-top:10px; margin-bottom:30px;">Hold here ↓</div>
                            </div>
                            <div id="enroll-status" style="height:20px; color:var(--accent); font-weight:600; margin-top:16px;"></div>
                            <div style="flex:1;"></div>
                            <div class="enroll-circle" id="enroll-btn" style="
                                position: absolute; bottom: -200px; left: 50%; transform: translateX(-50%);
                                width: 60px; height: 60px; margin: 0;
                                border-width: 3px; z-index: 10;
                            ">
                                <div class="enroll-fill" id="enroll-fill"></div>
                                <i class="fas fa-fingerprint" style="position:relative; z-index:2; font-size:28px;"></i>
                            </div>
                        </div>
                    </div>
                `;
                setTimeout(() => {
                    const btn = document.getElementById('enroll-btn');
                    const fill = document.getElementById('enroll-fill');
                    const stat = document.getElementById('enroll-status');
                    if (!btn || !fill || !stat) return;
                    let progress = 0;
                    let timer = null;
                    const start = (e) => {
                        e.preventDefault();
                        btn.classList.add('active');
                        stat.innerText = "Scanning...";
                        timer = setInterval(() => {
                            progress += 2;
                            fill.style.height = progress + '%';
                            if (progress >= 100) {
                                clearInterval(timer);
                                State.security.fingerprint = true;
                                stat.innerText = "Success!";
                                stat.style.color = "#34c759";
                                btn.style.borderColor = "#34c759";
                                btn.style.color = "#34c759";
                                Storage.saveSettings();
                                setTimeout(() => Apps.settings.render('security'), 1000);
                            }
                        }, 20);
                    };
                    const end = (e) => {
                        e.preventDefault();
                        clearInterval(timer);
                        btn.classList.remove('active');
                        if (progress < 100) {
                            progress = 0;
                            fill.style.height = '0%';
                            stat.innerText = "Hold longer";
                        }
                    };
                    btn.addEventListener('mousedown', start);
                    btn.addEventListener('mouseup', end);
                    btn.addEventListener('mouseleave', end);
                    btn.addEventListener('touchstart', start);
                    btn.addEventListener('touchend', end);
                }, 50);
            }
            else if (view === 'display') {
                headerTitle.innerText = 'Display';
                content = `<div class="anim-fade"><div class="list-group"><div class="list-item" onclick="Apps.settings.toggleDark()"><span>Dark Mode</span><div class="toggle ${State.darkMode ? 'active' : ''}"></div></div><div class="list-item" style="display:block; cursor:default"><div style="margin-bottom:10px; font-size:14px;">Brightness</div><div class="custom-slider" data-min="20" data-max="100" data-step="1" data-value="${State.brightness}" data-oninput="Apps.settings.setBright(value)"><div class="cs-track"><div class="cs-fill"><div class="cs-thumb"></div></div></div></div></div><div class="list-item" onclick="Apps.settings.toggleGlass()"><span>Liquid Glass</span><div class="toggle ${State.glassUI ? 'active' : ''}"></div></div><div class="list-item" onclick="Apps.settings.toggleTap()"><span>Visual Taps</span><div class="toggle ${State.tapIndicators ? 'active' : ''}"></div></div><div class="list-item" onclick="Apps.settings.toggleLiteMode()"><span>Lite Mode</span><div class="toggle ${State.liteMode ? 'active' : ''}"></div></div><div class="list-item" onclick="Apps.settings.toggleFullscreen()"><span>Fullscreen Mode</span><div class="toggle ${document.fullscreenElement ? 'active' : ''}" id="fs-toggle"></div></div></div><div style="margin:10px 20px; font-size:12px; color:var(--text-sec);">Liquid Glass applies a translucent glass effect to the Dock, Volume Bar, and Popups. Fullscreen Mode expands the UI to take up your entire monitor.</div></div>`;
            }
            else if (view === 'wallpaper') {
                headerTitle.innerText = 'Personalization';
                const homeWallUrl = State.wallpapers[State.currentWall] || '';
                const lockWallUrl = State.wallpapers[State.lockWall] || homeWallUrl;
                const homeIsVid = isVideoWallpaper(homeWallUrl);
                const lockIsVid = isVideoWallpaper(lockWallUrl);
                const homeBg = homeIsVid ? '' : `background-image:url('${homeWallUrl}');background-size:cover;background-position:center;`;
                const lockBg = lockIsVid ? '' : `background-image:url('${lockWallUrl}');background-size:cover;background-position:center;`;
                const homeVidEl = homeIsVid ? `<video src="${homeWallUrl}" muted autoplay playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none;"></video>` : '';
                const lockVidEl = lockIsVid ? `<video src="${lockWallUrl}" muted autoplay playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none;"></video>` : '';

                const gridApps = APPS.filter(a => a.area === 'grid').slice(0, 8);
                const dockApps = APPS.filter(a => a.area === 'dock');

                const getMiniIcon = (app) => {
                    const isHyper = State.iconPack === 'hyperos';
                    const isColor = State.iconPack === 'coloros';
                    const isImagePack = isHyper || isColor;
                    const packIcon = isHyper ? app.hyperIcon : (isColor ? app.colorIcon : null);
                    let bg = isImagePack ? 'transparent' : app.color;
                    let iconContent = '';
                    if (isImagePack && packIcon) {
                        iconContent = `<img src="${packIcon}" style="width:100%; height:100%; object-fit:cover; border-radius: inherit;">`;
                    } else {
                        if (app.id === 'settings') {
                            iconContent = `<div class="settings-icon-gear" style="transform: scale(0.40);"><div class="gear-base"></div><div class="gear-teeth"><div class="tooth"></div><div class="tooth"></div><div class="tooth"></div><div class="tooth"></div><div class="tooth"></div><div class="tooth"></div></div><div class="gear-inner-ring"></div><div class="gear-spoke spoke-1"></div><div class="gear-spoke spoke-2"></div><div class="gear-spoke spoke-3"></div><div class="gear-center-dot"></div></div>`;
                        } else if (app.id === 'camera') {
                            iconContent = `<div class="camera-icon-lens" style="transform: scale(0.48);"><div class="camera-base"></div><div class="lens-outer-ring"></div><div class="lens-inner-black"></div><div class="lens-core-glass"></div><div class="lens-glare-1"></div><div class="lens-glare-2"></div><div class="flash-ring"><div class="flash-bulb"></div></div></div>`;
                            bg = 'linear-gradient(135deg, #fbfbfb 0%, #e8e8e8 50%, #d1d1d1 100%)';
                        } else if (app.id === 'photos') {
                            iconContent = `<div class="photos-icon-flower" style="transform: scale(0.35);"><div class="petal-wrap p1"><div class="petal"></div></div><div class="petal-wrap p2"><div class="petal"></div></div><div class="petal-wrap p3"><div class="petal"></div></div><div class="petal-wrap p4"><div class="petal"></div></div><div class="petal-wrap p5"><div class="petal"></div></div><div class="petal-wrap p6"><div class="petal"></div></div><div class="petal-wrap p7"><div class="petal"></div></div><div class="petal-wrap p8"><div class="petal"></div></div></div>`;
                        } else if (app.id === 'music') {
                            iconContent = `<div class="music-icon-note" style="transform: scale(0.38);"><div class="music-note">&#9834;</div><div class="music-sparkles"><div class="sparkle sparkle-lg" style="top:22%; right:2%;"></div><div class="sparkle sparkle-sm sparkle-green" style="top:55%; left:5%;"></div><div class="sparkle sparkle-xs sparkle-yellow" style="bottom:15%; left:22%;"></div><div class="sparkle sparkle-xs sparkle-orange" style="top:12%; right:22%;"></div></div></div>`;
                        } else if (app.id === 'clock') {
                            const now = new Date();
                            const hDeg = (now.getHours() % 12) * 30 + now.getMinutes() * 0.5;
                            const mDeg = now.getMinutes() * 6;
                            iconContent = `<div class="clock-icon-face" style="transform: scale(0.48);"><div class="clock-hand clock-hour" style="transform: rotate(${hDeg}deg);"></div><div class="clock-hand clock-minute" style="transform: rotate(${mDeg}deg);"></div><div class="clock-center-dot"></div></div>`;
                        } else {
                            const lowBg = (bg || "").toLowerCase().trim();
                            const isWhiteBg = app.id === 'photos' || lowBg === '#fff' || lowBg.startsWith('#ffffff') || lowBg === 'white' || lowBg.replace(/\s/g, '') === 'rgb(255,255,255)';
                            const shadeColor = isWhiteBg ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)';
                            const shadeHtml = `<div style="position:absolute; inset:0; background: radial-gradient(circle at top right, ${shadeColor} 0%, transparent 70%); pointer-events:none; border-radius:inherit; z-index:10;"></div>`;
                            iconContent = `${shadeHtml}<i class="fas ${app.icon}" style="font-size:10px; color:${app.text || 'white'}; display:flex; align-items:center; justify-content:center; width:100%; height:100%;"></i>`;
                        }
                    }
                    if (app.id === 'music' && !(isImagePack && packIcon)) {
                        return `<div style="width:22px;height:22px;border-radius:${OS.getShapeRadius()};background:${bg};position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;">${iconContent || '<i class="fas fa-music" style="font-size:10px; color:white;"></i>'}</div>`;
                    }
                    return `<div style="width:22px;height:22px;border-radius:${OS.getShapeRadius()};background:${bg};position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;">${iconContent}</div>`;
                };

                const miniIcons = gridApps.map(getMiniIcon).join('');
                const miniDock = dockApps.map(getMiniIcon).join('');

                const specialUrls = ['https://i.ibb.co/9HGWgS4w/wallpaper3.jpg', 'https://i.ibb.co/FMtRmsm/wallpaper4.png', 'https://i.ibb.co/ymJxLsYz/wallpaper5.png', 'https://i.ibb.co/43v4xw9/wallpaper6.png'];
                const currentSupportsEffects = isVideoWallpaper(homeWallUrl) || specialUrls.includes(homeWallUrl);

                const cc = State.clockConfig || {};
                const now = new Date();
                let h12 = now.getHours() % 12; if (h12 === 0) h12 = 12;
                const h12Padded = h12 < 10 ? '0' + h12 : h12;
                const mins = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
                const bOp = cc.boldOpacity !== undefined ? cc.boldOpacity : 0.72;
                const fw = cc.fontWeight || 200;

                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const dateStr = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;

                let clockHtml = '';
                if (cc.style === 'stretched') {
                    clockHtml = `<div id="ls-preview-time" style="font-size:42px;font-weight:${fw};line-height:0.85;letter-spacing:-1px;font-family:'Oswald',sans-serif;text-shadow:0 2px 6px rgba(0,0,0,0.4);color:#fff">${h12}:${mins}</div>`;
                } else {
                    const fonts = { 'default': "'Inter',sans-serif", 'serif': "'Times New Roman',serif", 'science': "'Rajdhani',sans-serif", 'mono': "'Monoton',cursive", 'lux': "'Luxurious Roman',serif" };
                    const f = cc.font || 'default';
                    clockHtml = `<div id="ls-preview-time" style="font-size:32px;font-weight:${fw};line-height:1;font-family:${fonts[f] || fonts['default']};text-shadow:0 2px 6px rgba(0,0,0,0.4);"><span style="color:${cc.hourColor || '#fff'};opacity:${bOp}">${h12}</span><span style="opacity:${bOp}">:</span><span style="color:${cc.minuteColor || '#fff'};opacity:${bOp}">${mins}</span></div>`;
                }

                content = `
                    <div class="anim-fade" style="padding:0;height:100%;box-sizing:border-box; overflow-y:auto;">
                        <div style="padding:20px;">
                            <div style="display:flex;gap:16px;justify-content:center;align-items:flex-start;margin-bottom:24px;">
                                <div style="text-align:center;">
                                    <div class="wall-preview-card ${State.homescreenBlur ? 'blurred-preview' : ''}" id="hs-preview" style="${homeBg}">
                                        ${homeVidEl}
                                        <div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:space-between;padding:12px 8px 8px;z-index:1;">
                                            <div></div>
                                            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:0 4px;">${miniIcons}</div>
                                            <div style="background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);border-radius:16px;padding:4px 6px;display:flex;justify-content:space-around;margin-top:6px;">${miniDock}</div>
                                        </div>
                                    </div>
                                    <div style="margin-top:8px;font-size:13px;color:var(--text-sec);font-weight:600;">Home Screen</div>
                                </div>
                                <div style="text-align:center;">
                                    <div class="wall-preview-card" id="ls-preview" onclick="Apps.settings.expandPreview('lock')" style="${lockBg}">
                                        ${lockVidEl}
                                        <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;padding-top:30px;z-index:1;">
                                            <div id="ls-preview-date" style="font-size:10px;color:white;opacity:0.8;text-shadow:0 1px 3px rgba(0,0,0,0.5);">${dateStr}</div>
                                            ${clockHtml}
                                        </div>
                                    </div>
                                    <div style="margin-top:8px;font-size:13px;color:var(--text-sec);font-weight:600;">Lock Screen</div>
                                </div>
                            </div>
                            <div class="list-group">
                                <div class="list-item" onclick="Apps.settings.toggleHsBlur()">
                                    <span>Home Screen Blur</span>
                                    <div class="toggle ${State.homescreenBlur ? 'active' : ''}"></div>
                                </div>
                                <div class="list-item" onclick="if(this.style.opacity !== '0.5') Apps.settings.toggleSpecialEffects()" id="main-sfx-toggle" style="${currentSupportsEffects ? '' : 'opacity:0.5; cursor:default;'}">
                                    <span>Special Effects</span>
                                    <div class="toggle ${State.specialEffects && currentSupportsEffects ? 'active' : ''}"></div>
                                </div>
                            </div>
                            <div style="font-size:13px; color:var(--text-sec); margin: 20px 20px 5px;">CUSTOMIZATION</div>
                            <div class="list-group">
                                <div class="list-item" onclick="Apps.settings.render('aod')">
                                    <div style="display:flex; align-items:center; gap:12px;"><div class="s-icon-round" style="background:#000; position:relative;"><div style="position:absolute; inset:0; margin:11px; transform:scale(1.3)"><div style="position:absolute; width:4px; height:4px; background:#ad565d; border-radius:50%; top:-1px; left:50%; transform:translate(-50%, -50%);"></div><div style="position:absolute; width:4px; height:4px; background:#ad565d; border-radius:50%; bottom:-1px; left:50%; transform:translate(-50%, 50%);"></div><div style="position:absolute; width:4px; height:4px; background:#e1c285; border-radius:50%; left:-1px; top:50%; transform:translate(-50%, -50%);"></div><div style="position:absolute; width:4px; height:4px; background:#e1c285; border-radius:50%; right:-1px; top:50%; transform:translate(50%, -50%);"></div><div style="position:absolute; width:3.5px; height:6px; background:#2596be; border-radius:1.5px; top:2px; left:2px; transform:translate(-50%,-50%) rotate(-45deg);"></div><div style="position:absolute; width:3.5px; height:6px; background:#2596be; border-radius:1.5px; bottom:2px; right:2px; transform:translate(50%,50%) rotate(-45deg);"></div><div style="position:absolute; width:3.5px; height:6px; background:#6cbb81; border-radius:1.5px; top:2px; right:2px; transform:translate(50%,-50%) rotate(45deg);"></div><div style="position:absolute; width:3.5px; height:6px; background:#6cbb81; border-radius:1.5px; bottom:2px; left:2px; transform:translate(-50%,50%) rotate(45deg);"></div></div></div><span>Always On Display</span></div>
                                    <i class="fas fa-chevron-right s-chev"></i>
                                </div>

                            </div>
                        </div>
                    </div>`;
            }
            else if (view === 'customization') {
                headerTitle.innerText = 'Home screen';
                content = `<div class="anim-fade">
                            <div class="icon-preview-row" id="shape-preview-row" style="margin:20px; padding:15px; background:var(--bg-card); border-radius:12px; display:flex; justify-content:center; gap:20px; align-items:center; position:relative; overflow:hidden;">
                                ${isVideoWallpaper(State.wallpapers[State.currentWall] || '') ? `<video src="${State.wallpapers[State.currentWall]}" muted playsinline style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; filter:blur(10px) brightness(0.7); transform:scale(1.2); z-index:0;"></video>` : `<div style="position:absolute; inset:0; background-image:url('${State.wallpapers[State.currentWall] || ''}'); background-size:cover; background-position:center; filter:blur(10px) brightness(0.7); transform:scale(1.2); z-index:0;"></div>`}
                                ${(() => {
                        const isHyper = State.iconPack === 'hyperos';
                        const isColor = State.iconPack === 'coloros';
                        const isImagePack = isHyper || isColor;
                        const sampleApps = ['phone', 'messages', 'settings', 'camera'];
                        return sampleApps.map(id => {
                            const app = APPS.find(a => a.id === id);
                            const packIcon = isHyper ? app.hyperIcon : (isColor ? app.colorIcon : null);
                            let bg = isImagePack ? 'transparent' : app.color;
                            let iconContent = '';
                            if (isImagePack && packIcon) {
                                iconContent = `<img src="${packIcon}" style="width:100%; height:100%; object-fit:cover; border-radius: inherit;">`;
                            } else {
                                iconContent = `<i class="fas ${app.icon}" style="font-size:24px; color:${app.text || 'white'};"></i>`;
                            }
                            return `<div class="icon-box" style="width:48px; height:48px; position:relative; overflow:hidden; display:flex; justify-content:center; align-items:center; font-size:24px; background:${bg}; border-radius:${OS.getShapeRadius()}!important; z-index:1;">${iconContent}</div>`;
                        }).join('');
                    })()}
                            </div>
                            <div style="padding:0 20px 5px; font-size:13px; color:var(--text-sec);">APP SHAPE</div>
                            <div class="list-group">
                                <div class="list-item" style="display:block; cursor:default">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                                        <span>Corner Radius</span>
                                        <span id="shape-value" style="color:var(--text-sec)">${(parseInt(State.appShape) || 50) - 27}%</span>
                                    </div>
                                    <div class="custom-slider" data-min="27" data-max="50" data-step="1" data-value="${State.appShape || 50}" data-oninput="Apps.settings.setAppShape(parseInt(value)); document.getElementById('shape-value').innerText = Math.round(value - 27) + '%'"><div class="cs-track"><div class="cs-fill"><div class="cs-thumb"></div></div></div></div>
                                </div>
                            </div>
                            <div style="padding:0 20px 5px; font-size:13px; color:var(--text-sec); margin-top:10px;">ANIMATION</div>
                            <div class="list-group">
                                <div class="list-item" style="display:block; cursor:default">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                                        <span>Animation Speed</span>
                                        <span id="speed-value" style="color:var(--text-sec)">${State.animationSpeed}x</span>
                                    </div>
                                    <div class="custom-slider" data-min="0.5" data-max="10" data-step="0.25" data-value="${State.animationSpeed}" data-oninput="Apps.settings.setAnimSpeed(parseFloat(value)); document.getElementById('speed-value').innerText = value + 'x'"><div class="cs-track"><div class="cs-fill"><div class="cs-thumb"></div></div></div></div>
                                </div>
                                ${State.homescreenBlur ? `
                                <div class="list-item" style="opacity:0.6; pointer-events:none; align-items:flex-start;">
                                    <div style="display:flex; flex-direction:column;">
                                        <span>Blur Behind Apps</span>
                                        <span style="font-size:12px; margin-top:4px; opacity:0.8;">Homescreen blur is enabled.</span>
                                    </div>
                                    <div class="toggle"></div>
                                </div>
                                ` : `
                                <div class="list-item" onclick="Apps.settings.toggleBlurBehindApps()">
                                    <span>Blur Behind Apps</span>
                                    <div class="toggle ${State.blurBehindApps ? 'active' : ''}"></div>
                                </div>
                                `}
                            </div>


                            <div style="padding:0 20px 5px; font-size:13px; color:var(--text-sec); margin-top:10px;">HOME SCREEN</div>
                            <div class="list-group">
                                <div class="list-item" onclick="Apps.settings.toggleHideLabels()">
                                    <span>Hide App Labels</span>
                                    <div class="toggle ${State.hideAppLabels ? 'active' : ''}"></div>
                                </div>
                                <div class="list-item">
                                    <span>Icon Pack</span>
                                    <div class="settings-dropdown" id="sd-icon-pack">
                                        <div class="sd-trigger" onclick="Apps.settings.toggleDropdown(this)">
                                            <span class="sd-value" id="sd-icon-pack-val">${(!State.iconPack || State.iconPack === 'default') ? 'RealOS' : State.iconPack === 'hyperos' ? 'HyperOS' : 'ColorOS'}</span>
                                            <i class="fas fa-chevron-down sd-chevron"></i>
                                        </div>
                                        <div class="sd-options">
                                            <div class="sd-option" onclick="Apps.settings.setIconPack('default')"><span>RealOS</span>${(!State.iconPack || State.iconPack === 'default') ? '<i class="fas fa-check"></i>' : ''}</div>
                                            <div class="sd-option" onclick="Apps.settings.setIconPack('hyperos')"><span>HyperOS</span>${State.iconPack === 'hyperos' ? '<i class="fas fa-check"></i>' : ''}</div>
                                            <div class="sd-option" onclick="Apps.settings.setIconPack('coloros')"><span>ColorOS</span>${State.iconPack === 'coloros' ? '<i class="fas fa-check"></i>' : ''}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="list-group" style="margin-top:10px;">
                                <div class="list-item" onclick="Apps.settings.render('animconfig')">
                                    <span>Animations Configuration</span>
                                    <i class="fas fa-chevron-right" style="color:#ccc; font-size:14px"></i>
                            </div>`;
            }
            else if (view === 'animconfig') {
                headerTitle.innerText = 'Animations';
                const ac = State.animConfig;
                const obz = ac.openBezier || [0.2, 0.85, 0.1, 1];
                const cbz = ac.closeBezier || [0.15, 1.01, 0.3, 1.02];
                content = `<div class="anim-fade">
                    <div style="display:flex; justify-content:center; padding:10px 0 5px;">
                        <div class="anim-preview-container" id="anim-preview-box">
                            <div class="ap-wallpaper" id="ap-wall">${isVideoWallpaper(State.wallpapers[State.currentWall] || '') ? `<video id="ap-wall-video" src="${State.wallpapers[State.currentWall]}" muted playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"></video>` : ''}</div>
                            <div class="ap-icon" id="ap-icon" style="background:#8e8e93;">
                                <i class="fas fa-cog" style="font-size:16px; color:white;"></i>
                            </div>
                            <div class="ap-window" id="ap-window" style="opacity:0;">
                                <div class="ap-icon-overlay" id="ap-overlay" style="opacity:1; background:#8e8e93; position:absolute; inset:0; display:flex; justify-content:center; align-items:center; z-index:5; border-radius:inherit;">
                                    <i class="fas fa-cog" style="font-size:16px; color:white;"></i>
                                </div>
                                <div class="ap-win-content" style="position:relative; z-index:1;">Settings</div>
                            </div>
                        </div>
                    </div>
                    <div style="text-align:center; font-size:12px; color:var(--text-sec); margin-bottom:15px;">Animation Preview</div>
                    <div style="padding:0 20px 5px; font-size:13px; color:var(--text-sec);">OPENING ANIMATION</div>
                    <div class="list-group">
                        <div class="list-item anim-config-slider">
                            <div class="ac-label-row"><span>Icon Fade Out</span><span class="ac-value" id="ac-open-icon-val">${(ac.openIconFade * 100).toFixed(0)}%</span></div>
                            <div class="custom-slider" data-min="5" data-max="80" data-step="1" data-value="${ac.openIconFade * 100}" data-oninput="Apps.settings.setAnimConfig('openIconFade', value / 100)"><div class="cs-track"><div class="cs-fill"><div class="cs-thumb"></div></div></div></div>
                            <div class="ac-range-labels"><span>Fast</span><span>Slow</span></div>
                        </div>
                        <div class="list-item anim-config-slider">
                            <div class="ac-label-row"><span>Wallpaper Blur</span><span class="ac-value" id="ac-wall-blur-val">${ac.wallBlurDur.toFixed(2)}s</span></div>
                            <div class="custom-slider" data-min="5" data-max="100" data-step="1" data-value="${ac.wallBlurDur * 100}" data-oninput="Apps.settings.setAnimConfig('wallBlurDur', value / 100)"><div class="cs-track"><div class="cs-fill"><div class="cs-thumb"></div></div></div></div>
                            <div class="ac-range-labels"><span>Fast</span><span>Slow</span></div>
                        </div>
                    </div>
                    <div style="padding:0 20px 5px; font-size:13px; color:var(--text-sec); margin-top:10px;">OPENING CURVE (Position)</div>
                    <div style="margin:0 20px 10px; padding:15px; background:var(--bg-card); border-radius:16px;">
                        <canvas id="bezier-open" width="200" height="200" style="width:100%; aspect-ratio:1; border-radius:12px; cursor:crosshair; touch-action:none;"></canvas>
                        <input id="bezier-open-vals" value="cubic-bezier(${obz.join(', ')})" onchange="Apps.settings.parseBezierInput(this,'openBezier')" style="width:100%; text-align:center; font-size:12px; color:var(--text-sec); margin-top:8px; font-family:monospace; background:transparent; border:1px solid rgba(128,128,128,0.3); border-radius:8px; padding:6px; outline:none;">
                    </div>
                    <div style="padding:0 20px 5px; font-size:13px; color:var(--text-sec); margin-top:10px;">SCALE CURVE (Size)</div>
                    <div style="margin:0 20px 10px; padding:15px; background:var(--bg-card); border-radius:16px;">
                        <canvas id="bezier-open-scale" width="200" height="200" style="width:100%; aspect-ratio:1; border-radius:12px; cursor:crosshair; touch-action:none;"></canvas>
                        <input id="bezier-open-scale-vals" value="cubic-bezier(${(ac.openScaleBezier || [0.2, 0.85, 0.1, 1]).join(', ')})" onchange="Apps.settings.parseBezierInput(this,'openScaleBezier')" style="width:100%; text-align:center; font-size:12px; color:var(--text-sec); margin-top:8px; font-family:monospace; background:transparent; border:1px solid rgba(128,128,128,0.3); border-radius:8px; padding:6px; outline:none;">
                    </div>
                    <div class="list-group" style="margin-top:10px;">
                        <div class="list-item anim-config-slider">
                            <div class="ac-label-row"><span>Scale Duration</span><span class="ac-value" id="ac-scale-time-val">${(ac.openScaleTime || 0.5).toFixed(2)}s</span></div>
                            <div class="custom-slider" data-min="25" data-max="90" data-step="1" data-value="${((ac.openScaleTime || 0.5) * 100).toFixed(0)}" data-oninput="Apps.settings.setAnimConfig('openScaleTime', value / 100)"><div class="cs-track"><div class="cs-fill"><div class="cs-thumb"></div></div></div></div>
                            <div class="ac-range-labels"><span>Fast</span><span>Slow</span></div>
                        </div>
                        <div class="list-item anim-config-slider">
                            <div class="ac-label-row"><span>Zoom Out Scale</span><span class="ac-value" id="ac-zoom-out-val">${((ac.openAppZoomOut !== undefined ? ac.openAppZoomOut : 0.95) * 100).toFixed(0)}%</span></div>
                            <div class="custom-slider" data-min="10" data-max="100" data-step="1" data-value="${(ac.openAppZoomOut !== undefined ? ac.openAppZoomOut : 0.95) * 100}" data-oninput="Apps.settings.setAnimConfig('openAppZoomOut', value / 100)"><div class="cs-track"><div class="cs-fill"><div class="cs-thumb"></div></div></div></div>
                            <div class="ac-range-labels"><span>Far</span><span>Near</span></div>
                        </div>
                    </div>
                    <div style="padding:0 20px 5px; font-size:13px; color:var(--text-sec); margin-top:10px;">WALLPAPER EFFECTS</div>
                    <div class="list-group">
                        <div class="list-item anim-config-slider">
                            <div class="ac-label-row"><span>Wallpaper Zoom</span><span class="ac-value" id="ac-wall-zoom-val">${((ac.openWallZoom !== undefined ? ac.openWallZoom : 1.05) * 100).toFixed(0)}%</span></div>
                            <div class="custom-slider" data-min="100" data-max="150" data-step="1" data-value="${(ac.openWallZoom !== undefined ? ac.openWallZoom : 1.05) * 100}" data-oninput="Apps.settings.setAnimConfig('openWallZoom', value / 100)"><div class="cs-track"><div class="cs-fill"><div class="cs-thumb"></div></div></div></div>
                            <div class="ac-range-labels"><span>Normal</span><span>Deep</span></div>
                        </div>

                        <div class="list-item" onclick="Apps.settings.toggleAnimConfigValue('openAppFade')">
                            <span>App Boxes Fade Out</span>
                            <div class="toggle ${(ac.openAppFade) ? 'active' : ''}">
                                <div class="knob"></div>
                            </div>
                        </div>
                    </div>
                    <div style="padding:0 20px 5px; font-size:13px; color:var(--text-sec); margin-top:10px;">CLOSING ANIMATION</div>
                    <div class="list-group">
                        <div class="list-item anim-config-slider">
                            <div class="ac-label-row"><span>Icon Fade</span><span class="ac-value" id="ac-close-icon-val">${(ac.closeIconFade * 100).toFixed(0)}%</span></div>
                            <div class="custom-slider" data-min="50" data-max="300" data-step="5" data-value="${ac.closeIconFade * 100}" data-oninput="Apps.settings.setAnimConfig('closeIconFade', value / 100)"><div class="cs-track"><div class="cs-fill"><div class="cs-thumb"></div></div></div></div>
                            <div class="ac-range-labels"><span>Fast</span><span>Slow</span></div>
                        </div>
                        <div class="list-item anim-config-slider">
                            <div class="ac-label-row"><span>Shape Transform</span><span class="ac-value" id="ac-close-shape-val">${(ac.closeShapeMorph * 100).toFixed(0)}%</span></div>
                            <div class="custom-slider" data-min="10" data-max="60" data-step="1" data-value="${ac.closeShapeMorph * 100}" data-oninput="Apps.settings.setAnimConfig('closeShapeMorph', value / 100)"><div class="cs-track"><div class="cs-fill"><div class="cs-thumb"></div></div></div></div>
                            <div class="ac-range-labels"><span>Early</span><span>Late</span></div>
                        </div>
                    </div>
                    <div style="padding:0 20px 5px; font-size:13px; color:var(--text-sec); margin-top:10px;">CLOSING CURVE</div>
                    <div style="margin:0 20px 10px; padding:15px; background:var(--bg-card); border-radius:16px;">
                        <canvas id="bezier-close" width="200" height="200" style="width:100%; aspect-ratio:1; border-radius:12px; cursor:crosshair; touch-action:none;"></canvas>
                        <input id="bezier-close-vals" value="cubic-bezier(${cbz.join(', ')})" onchange="Apps.settings.parseBezierInput(this,'closeBezier')" style="width:100%; text-align:center; font-size:12px; color:var(--text-sec); margin-top:8px; font-family:monospace; background:transparent; border:1px solid rgba(128,128,128,0.3); border-radius:8px; padding:6px; outline:none;">
                    </div>
                    <div style="text-align:center; padding:15px 20px;">
                        <button class="btn-pill" style="background:var(--text-sec); opacity:0.6; margin-bottom:10px;" onclick="State.animConfig = {openIconFade:0.1, closeIconFade:1.5, wallBlurDur:0.12, closeShapeMorph:0.34, openBezier:[0.2,0.85,0.1,1], openScaleBezier:[0.2,0.85,0.1,1], openScaleTime:0.5, closeBezier:[0.15,1.01,0.3,1.02], openAppZoomOut:0.95, openWallZoom:1.03, openWallBlur:State.animConfig.openWallBlur, fadeBoxes:State.animConfig.fadeBoxes}; Storage.saveSettings(); Apps.settings.render('animconfig');">Reset to Defaults</button>
                        <div class="ac-range-labels">
                            <span style="display:none;"></span>
                        </div>
                        <div style="display:flex; gap:10px; justify-content:center;">
                            <button class="btn-pill" style="flex:1; background:var(--bg-card); color:var(--text);" onclick="Apps.settings.exportAnimConfig()">Export Config</button>
                            <button class="btn-pill" style="flex:1; background:var(--bg-card); color:var(--text);" onclick="Apps.settings.importAnimConfig()">Import Config</button>
                        </div>
                    </div>
                </div>`;
                setTimeout(() => { Apps.settings.initAnimPreview(); Apps.settings.initBezierEditor('bezier-open', 'openBezier'); Apps.settings.initBezierEditor('bezier-open-scale', 'openScaleBezier'); Apps.settings.initBezierEditor('bezier-close', 'closeBezier'); }, 100);
            }
            else if (view === 'profile') {
                headerTitle.innerText = 'Profile';
                content = `<div class="anim-fade">
                            <div class="setup-profile-container" style="margin-top:20px;">
                                <div class="setup-profile-icon" onclick="document.getElementById('profile-input').click()">
                                    ${State.userProfile.image ?
                        `<img src="${State.userProfile.image}">` :
                        `<i class="fas fa-user"></i>`}
                                    <div class="setup-profile-edit"><i class="fas fa-camera"></i></div>
                                </div>
                            </div>
                            <div style="padding:0 20px 5px; font-size:13px; color:var(--text-sec);">NAME</div>
                            <div style="margin:0 20px 20px;">
                                <input type="text" value="${State.userProfile.name}" placeholder="Enter your name"
                                    onkeydown="event.stopPropagation()"
                                    onchange="Apps.settings.updateProfile(this.value, null)"
                                    style="width:100%; padding:12px; border-radius:10px; border:none; background:rgba(128,128,128,0.1); color:var(--text-main); font-size:16px;">
                            </div>
                            <div style="padding:0 20px; color:var(--text-sec); font-size:12px; text-align:center;">
                                Tap the icon to change profile picture
                            </div>
                        </div>`;
                document.getElementById('profile-input').onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                            Apps.settings.updateProfile(State.userProfile.name, evt.target.result);
                        };
                        reader.readAsDataURL(file);
                    }
                };
            }
            else if (view === 'island') {
                headerTitle.innerText = 'Dynamic Island';
                content = `<div class="anim-fade"><div class="list-group"><div class="list-item" onclick="Apps.settings.togglePunchHole()"><span>Punch Hole Style</span><div class="toggle ${State.punchHole ? 'active' : ''}"></div></div><div class="list-item" onclick="Apps.settings.toggleMusicGrad()"><span>Music Gradient</span><div class="toggle ${State.musicGradient ? 'active' : ''}"></div></div></div></div>`;
            }
            else if (view === 'about') {
                let storageTxt = '0 KB';
                try {
                    let bs = 0;
                    for (let i = 0; i < localStorage.length; i++) {
                        let k = localStorage.key(i);
                        bs += localStorage.getItem(k).length * 2;
                    }
                    storageTxt = bs > 1024 * 1024 ? (bs / 1024 / 1024).toFixed(2) + ' MB' : (bs / 1024).toFixed(2) + ' KB';
                    storageTxt += ' / 5.00 MB';
                } catch (e) { }
                const auraClass = State.darkMode ? 'aura-dark' : 'aura-light';
                const phoneName = State.phoneName || 'RealPhone 2 Ultra';
                content = `<div class="anim-fade-overlay about-wrapper" style="padding-top:90px; position:relative; min-height:100%; overflow-y:auto;">
                            <div class="aura-container ${auraClass}" style="position:fixed; top:0; left:0; width:100%; height:77%; z-index:0;">
                                <div class="aura-circle ac-1"></div>
                                <div class="aura-circle ac-2"></div>
                                <div class="aura-circle ac-3"></div>
                                <div class="aura-circle ac-4"></div>
                            </div>
                            <div id="about-container" style="z-index:1;">
                                <div class="about-hero" style="position:relative;">
                                <div class="realos-text">RealOS</div>
                                <div class="realos-ver">V3.0.0</div>
                            </div>
                                <div style="text-align:center; color:var(--text-sec); margin-top:5px; margin-bottom:30px;">@rrealomarr</div>
                            </div>
                            <div style="padding:0; position:relative; z-index:2;">
                                
                                <div class="about-specs-box" style="padding: 15px 20px; min-height: auto;">
                                    <div class="list-item about-list-item" style="cursor:pointer;" onclick="Apps.settings.renamePhone()">
                                        <span style="font-weight:600; color:var(--text-main); font-size:18px;">Name</span>
                                        <span class="val" id="about-phone-name-val">${phoneName}</span>
                                    </div>
                                    <div class="list-item about-list-item" style="cursor:pointer;" onclick="Apps.settings.render('changelog')">
                                        <span style="font-weight:600; color:var(--text-main); font-size:18px;">OS Version</span>
                                        <span class="val">3.0.0</span>
                                    </div>
                                    <div class="list-item about-list-item" style="cursor:default;">
                                        <span style="font-weight:600; color:var(--text-main); font-size:18px;">Browser Storage</span>
                                        <span class="val">${storageTxt}</span>
                                    </div>
                                </div>

                                <div class="about-specs-box">
                                    <div class="about-specs-title" id="about-phone-name-title">RealPhone 2 Ultra</div>
                                    <div class="about-spec-item">
                                        <span class="as-val">RP-G2U</span>
                                        <span class="as-name">Model</span>
                                    </div>
                                    <div class="about-spec-item">
                                        <span class="as-val">RealCPU Gen 2+</span>
                                        <span class="as-name">Chipset</span>
                                    </div>
                                    <div class="about-spec-item">
                                        <span class="as-val">12GB</span>
                                        <span class="as-name">RAM</span>
                                    </div>
                                    <div class="about-spec-item">
                                        <span class="as-val">6500 mAh</span>
                                        <span class="as-name">Battery</span>
                                    </div>
                                    <div class="about-spec-item">
                                        <span class="as-val">512GB</span>
                                        <span class="as-name">Storage</span>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                setTimeout(() => {
                    const overlay = document.getElementById('settings-section-overlay');
                    const aura = overlay ? overlay.querySelector('.aura-container') : null;
                    const aboutContainer = overlay ? overlay.querySelector('#about-container') : null;
                    if (overlay && (aura || aboutContainer)) {
                        overlay.addEventListener('scroll', () => {
                            const scrollTop = overlay.scrollTop;
                            const fadeDistance = 200;
                            const opacity = Math.max(0, 1 - (scrollTop / fadeDistance));
                            if (aura) aura.style.opacity = opacity;
                            if (aboutContainer) {
                                const ver = aboutContainer.querySelector('.realos-ver');
                                if (ver) ver.style.opacity = opacity;
                                Array.from(aboutContainer.children).forEach(child => {
                                    if (!child.classList.contains('about-hero')) {
                                        child.style.opacity = opacity;
                                    }
                                });
                            }
                        });
                    }
                }, 300);
            } else if (view === 'changelog') {
                headerTitle.innerText = 'Changelogs';
                content = `<div class="anim-fade" style="padding: 0; overflow-y:auto; height: 100%; box-sizing: border-box; background: var(--bg-app); color: var(--text-main);">
                    <div style="padding: 0 20px 20px;">
                        <div class="s-section" style="padding: 20px;">
                            <div style="font-weight: 600; font-size: 18px; margin-bottom: 10px; color: var(--text-main);">RealOS 3.0 Inital Release</div>
                            <div id="changelog-content" style="opacity: 0.8; line-height: 1.5;">
                                This new RealOS release brings many customization options, refined UI and better optimization for low end devices<br>

                               <br><strong>What's New</strong><br>

                               <br> &bull; Redesigned Settings app<br>
                               (now with smooother slide animations and UI enhancements)<br>
                               <br> &bull; New Improved and Optimized App animations<br>
                               (runs slightly better on low end devices and improved app animations greatly)<br>
                               <br> &bull; New RealOS animated icons<br>
                               (some icons don't have an animated icon yet, new ones will soon be added)<br>
                               <br> &bull; New Empty apps<br>
                               (added by holding an empty space in homescreen and pressing the + button)<br>
                               <br> &bull; New Clock Customization<br>
                               (Accessed by holding an empty space in the lockscreen and clicking on the clock)<br>
                               <br> &bull; New Control center<br>
                               <br> &bull; New liquid glass effect<br>
                               <br> &bull; Dynamic island improvements & bug fixes<br>
                               <br> &bull; New Fullscreen mode<br>
                               <br> &bull; New Corner/Shape radius slider<br>
                               <br> &bull; New Setup Screen<br>
                               <br> &bull; New Advanced toggles and options for app opening and closing animations<br>
                               <br> &bull; + More 
                            </div>
                        </div>
                    </div>
                </div>`;
            }
            if (view !== 'root' && content) {
                const subSectionParents = { 'aod': 'wallpaper', 'animconfig': 'customization', 'changelog': 'about', 'fingerprint-icon': 'security', 'bio': 'security' };
                const parentView = subSectionParents[view];
                const backTarget = parentView || 'root';
                const titleText = headerTitle.innerText || '';
                const isAboutView = view === 'about';
                const isChangelogView = view === 'changelog';
                const headerStyle = isAboutView ? 'background:transparent !important; position:absolute; top:0; left:0; right:0; z-index:100;' : '';
                let inlineHeader = '';
                if (isChangelogView) {
                    inlineHeader = `<div class="settings-inline-header" style="${headerStyle}"><span class="settings-inline-back" onclick="Apps.settings.render('${backTarget}')"><i class="fas fa-chevron-left"></i> Back</span><span class="settings-inline-title">${titleText}</span><span style="width:40px"></span></div>`;
                } else {
                    inlineHeader = `<div class="settings-inline-header" style="${headerStyle}"><span class="settings-inline-back" onclick="Apps.settings.render('${backTarget}')"><i class="fas fa-chevron-left"></i> Back</span><span class="settings-inline-title">${isAboutView ? '' : titleText}</span><span style="width:40px"></span></div>`;
                }
                content = content.replace(/(<div class="anim-fade[^>]*>)/, '$1' + inlineHeader);
                headerTitle.innerText = '';
            }
            if (isForward) {
                const screenDimEl = document.getElementById('screen');
                if (screenDimEl) screenDimEl.classList.add('settings-subpage-dim');
                const overlay = document.createElement('div');
                overlay.className = 'settings-section-overlay';
                if (isSubForward) {
                    overlay.id = 'settings-sub-overlay';
                    const parentOverlay = document.getElementById('settings-section-overlay');
                    if (parentOverlay) {
                        const parentFade = parentOverlay.querySelector('.anim-fade');
                        parentOverlay.style.filter = '';
                        parentOverlay.style.transition = '';
                        parentOverlay.style.transform = '';
                        if (parentFade) {
                            parentFade.style.transition = 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)';
                            parentFade.style.transform = 'translateX(-80px)';
                        }
                        let pveil = parentOverlay.querySelector('.settings-parent-dim-veil');
                        if (!pveil) {
                            pveil = document.createElement('div');
                            pveil.className = 'settings-parent-dim-veil';
                            parentOverlay.appendChild(pveil);
                        }
                        pveil.classList.remove('visible');
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => { pveil.classList.add('visible'); });
                        });
                    }
                } else {
                    overlay.id = 'settings-section-overlay';
                    const rootFade = body.querySelector('.anim-fade');
                    body.style.filter = '';
                    body.style.transition = '';
                    body.style.transform = '';
                    if (rootFade) {
                        rootFade.style.transition = 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                        rootFade.style.transform = 'translateX(-80px)';
                    }
                    let mainVeil = document.getElementById('settings-main-dim-veil');
                    if (!mainVeil) {
                        mainVeil = document.createElement('div');
                        mainVeil.id = 'settings-main-dim-veil';
                        const bodyEl = document.getElementById('app-body');
                        if (bodyEl && bodyEl.parentNode) bodyEl.parentNode.insertBefore(mainVeil, bodyEl.nextSibling);
                        else win.appendChild(mainVeil);
                    }
                    mainVeil.classList.remove('settings-dim-veil-visible');
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            mainVeil.classList.add('settings-dim-veil-visible');
                        });
                    });
                    if (view !== 'about') {
                        appHeader.style.transition = 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                        appHeader.style.transform = 'translateX(-80px)';
                        appHeader.style.filter = '';
                        appHeader.classList.remove('settings-header-dim', 'settings-header-dim-visible');
                    }
                }
                overlay.style.background = 'var(--bg-app)';
                overlay.style.color = 'var(--text-main)';
                overlay.innerHTML = content;
                win.appendChild(overlay);
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        overlay.classList.add('active');
                    });
                });

            } else if (isBack) {
                if (isSubBack) {
                    const subOverlay = document.getElementById('settings-sub-overlay');
                    if (subOverlay) {
                        subOverlay.classList.remove('active');
                        subOverlay.classList.add('exiting');
                        subOverlay.addEventListener('transitionend', () => {
                            if (subOverlay.parentNode) subOverlay.remove();
                        }, { once: true });
                    }
                    const parentOverlay = document.getElementById('settings-section-overlay');
                    if (parentOverlay) {
                        const pVeil = parentOverlay.querySelector('.settings-parent-dim-veil');
                        if (pVeil) pVeil.remove();
                        const parentFade = parentOverlay.querySelector('.anim-fade');
                        parentOverlay.style.transform = '';
                        if (parentFade) {
                            parentFade.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                            parentFade.style.transform = '';
                        }
                        setTimeout(() => {
                            parentOverlay.style.transition = '';
                        }, 350);
                        if (view === 'about') {
                            parentOverlay.innerHTML = content;
                        }
                    }
                } else {
                    const subOverlay = document.getElementById('settings-sub-overlay');
                    if (subOverlay) subOverlay.remove();
                    const overlay = document.getElementById('settings-section-overlay');
                    if (overlay) {
                        overlay.classList.remove('active');
                        overlay.classList.add('exiting');
                        overlay.addEventListener('transitionend', () => {
                            if (overlay.parentNode) overlay.remove();
                        }, { once: true });
                    }
                    const rootFadeBack = body.querySelector('.anim-fade');
                    const mainVeilBack = document.getElementById('settings-main-dim-veil');
                    if (mainVeilBack) mainVeilBack.classList.remove('settings-dim-veil-visible');
                    body.style.filter = '';
                    body.style.transition = '';
                    body.style.transform = '';
                    if (rootFadeBack) {
                        rootFadeBack.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                        rootFadeBack.style.transform = '';
                    }
                    appHeader.classList.remove('settings-header-dim', 'settings-header-dim-visible');
                    appHeader.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    appHeader.style.transform = '';
                    appHeader.style.filter = '';
                    const screenUndim = document.getElementById('screen');
                    if (screenUndim) screenUndim.classList.remove('settings-subpage-dim');
                    setTimeout(() => {
                        body.style.transition = '';
                        appHeader.style.transition = '';
                        if (rootFadeBack) rootFadeBack.style.transition = '';
                        appHeader.classList.remove('settings-header-dim', 'settings-header-dim-visible');
                        if (mainVeilBack && mainVeilBack.parentNode) mainVeilBack.remove();
                    }, 350);
                }
            } else {
                const subOverlay = document.getElementById('settings-sub-overlay');
                const overlay = document.getElementById('settings-section-overlay');
                if (['aod', 'clockconfig', 'animconfig'].includes(view) && subOverlay) {
                    subOverlay.innerHTML = content;
                } else if (overlay && view !== 'root') {
                    overlay.innerHTML = content;
                } else {
                    body.style.filter = '';
                    body.style.transform = '';
                    body.style.transition = '';
                    appHeader.classList.remove('settings-header-dim', 'settings-header-dim-visible');
                    const screenRoot = document.getElementById('screen');
                    if (screenRoot) screenRoot.classList.remove('settings-subpage-dim');
                    const rootVeil = document.getElementById('settings-main-dim-veil');
                    if (rootVeil) rootVeil.remove();
                    body.innerHTML = content;
                }
            }
            setTimeout(() => Apps.settings.initSliders(), 50);
        },
        handlePinIn: (n) => {
            if (Apps.settings.tempPin.length < 4) {
                Apps.settings.tempPin += n;
                document.getElementById('set-pin-disp').innerText = Apps.settings.tempPin.padEnd(4, '_').split('').join(' ');
                if (Apps.settings.tempPin.length === 4) {
                    State.security.pin = Apps.settings.tempPin;
                    Storage.saveSettings();
                    const setupActive = document.getElementById('setup-screen').classList.contains('active');
                    if (setupActive) {
                        Setup.next('security', 'finish');
                        document.getElementById('app-window').style.display = 'none';
                        document.getElementById('app-window').style.zIndex = '';
                    } else {
                        setTimeout(() => Apps.settings.render('security'), 300);
                    }
                }
            }
        },
        toggleDark: () => {
            State.darkMode = !State.darkMode;
            OS.applySettings();
            const win = document.getElementById('app-window');
            const body = document.getElementById('app-body');
            const bg = State.darkMode ? '#000' : '#f2f2f7';
            const textColor = State.darkMode ? '#fff' : '#000';
            if (State.activeApp === 'settings' && win) {
                win.style.background = bg;
            }
            const header = document.getElementById('app-header');
            if (header && State.activeApp === 'settings') {
                header.style.background = bg;
            }
            if (body) {
                body.style.background = bg;
                body.style.color = textColor;
            }
            const animFades = body ? body.querySelectorAll('.anim-fade') : [];
            animFades.forEach(el => { el.style.background = bg; });
            const inlineHeaders = body ? body.querySelectorAll('.settings-inline-header') : [];
            inlineHeaders.forEach(el => { el.style.setProperty('background', bg, 'important'); });
            const listItem = event && event.target && event.target.closest ? event.target.closest('.list-item') : null;
            if (listItem) {
                const toggle = listItem.querySelector('.toggle');
                if (toggle) toggle.classList.toggle('active', State.darkMode);
            }
        },
        toggleLiteMode: () => {
            State.liteMode = !State.liteMode;
            localStorage.setItem('realos_litemode', State.liteMode ? 'true' : 'false');
            OS.applySettings();
            document.body.classList.toggle('lite-mode', State.liteMode);
            const listItem = event && event.target && event.target.closest ? event.target.closest('.list-item') : null;
            if (listItem) {
                const toggle = listItem.querySelector('.toggle');
                if (toggle) toggle.classList.toggle('active', State.liteMode);
            }
        },
        toggleTap: () => {
            State.tapIndicators = !State.tapIndicators;
            OS.applySettings();
            const toggle = event.target.closest('.list-item').querySelector('.toggle');
            if (toggle) toggle.classList.toggle('active', State.tapIndicators);
        },
        toggleGlass: () => {
            State.glassUI = !State.glassUI;
            OS.applySettings();
            const toggle = event.target.closest('.list-item').querySelector('.toggle');
            if (toggle) toggle.classList.toggle('active', State.glassUI);
        },
        setBright: (v) => { State.brightness = v; OS.applySettings(); },
        previewWall: (i, el, fromScroll) => {
            document.querySelectorAll('.wall-grid-item').forEach(item => {
                item.classList.remove('active');
                item.style.borderColor = 'transparent';
                item.style.transform = 'scale(1)';
                const btn = item.querySelector('.wall-apply-btn');
                if (btn) {
                    btn.style.opacity = '0';
                    btn.style.pointerEvents = 'none';
                }
            });

            if (el) {
                el.classList.add('active');
                el.style.borderColor = 'var(--accent)';
                el.style.transform = 'scale(1.05)';
                if (!fromScroll) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

                const btn = el.querySelector('.wall-apply-btn');
                if (btn) {
                    btn.innerText = "Apply";
                    btn.style.background = "var(--accent)";
                    btn.style.opacity = '1';
                    btn.style.pointerEvents = 'auto';
                }

                OS.updateWallpaperEffect(i);
            }
        },
        handleWallScroll: (scrollArea) => {
            const rows = scrollArea.querySelectorAll('.wall-category-row');
            if (rows.length === 0) return;
            const sRect = scrollArea.getBoundingClientRect();
            const scrollCenter = sRect.top + (sRect.height / 2);
            const scaleFactor = sRect.height / scrollArea.clientHeight || 1;
            rows.forEach(row => {
                const rect = row.getBoundingClientRect();
                const rowCenter = rect.top + (rect.height / 2);
                const dist = Math.abs(scrollCenter - rowCenter) / scaleFactor;
                if (dist > 180) {
                    row.style.filter = 'brightness(0.35)';
                } else {
                    row.style.filter = 'brightness(1)';
                }
            });
        },
        expandPreview: (type) => {
            if (type === 'home') return;
            const previewEl = document.getElementById('ls-preview');
            if (!previewEl) return;
            const iRect = previewEl.getBoundingClientRect();
            const sRect = document.getElementById('screen').getBoundingClientRect();
            const scaleFactor = document.fullscreenElement ? 1 : document.getElementById('scale-wrapper').getBoundingClientRect().width / 400;

            const startLeft = ((iRect.left + iRect.width / 2 - sRect.left) / scaleFactor) - (iRect.width / scaleFactor / 2);
            const startTop = ((iRect.top + iRect.height / 2 - sRect.top) / scaleFactor) - (iRect.height / scaleFactor / 2);
            const startW = iRect.width / scaleFactor;
            const startH = iRect.height / scaleFactor;

            const overlay = document.createElement('div');
            overlay.id = 'wall-expand-overlay';
            overlay.style.cssText = `position:absolute;z-index:1900;overflow:hidden;display:flex;flex-direction:column;`;
            overlay.style.left = startLeft + 'px';
            overlay.style.top = startTop + 'px';
            overlay.style.width = startW + 'px';
            overlay.style.height = startH + 'px';
            overlay.style.borderRadius = '28px';
            overlay.style.transition = 'none';

            const specialUrls = ['https://i.ibb.co/9HGWgS4w/wallpaper3.jpg', 'https://i.ibb.co/FMtRmsm/wallpaper4.png', 'https://i.ibb.co/ymJxLsYz/wallpaper5.png', 'https://i.ibb.co/43v4xw9/wallpaper6.png'];
            const customWalls = [], realosWalls = [], specialWalls = [], xiaomiWalls = [], originWalls = [];
            const seen = new Set();
            State.wallpapers.forEach((url, i) => {
                if (!url || seen.has(url)) return;
                seen.add(url);
                if (url.includes('xiaomi') || url.includes('Xiaomi')) xiaomiWalls.push({ url, i });
                else if (url.includes('origin') || url.includes('OriginOS')) originWalls.push({ url, i });
                else if (specialUrls.includes(url)) specialWalls.push({ url, i });
                else if (url.includes('RealOS 3') || url.includes('Oneplus')) realosWalls.push({ url, i });
                else customWalls.push({ url, i });
            });

            const wallCard = (url, idx) => {
                if (url === 'ADD_NEW') {
                    return `<div class="stack-wall-card" style="position:absolute;left:50%;top:0;width:180px;height:320px;margin-left:-90px;border-radius:18px;border:2px dashed rgba(255,255,255,0.15);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:transform 0.4s cubic-bezier(0.4,0,0.2,1),opacity 0.4s ease;will-change:transform,opacity;" onclick="document.getElementById('wall-input').click()">
                        <i class="fas fa-plus" style="color:var(--text-sec);font-size:28px;"></i>
                        <span style="color:var(--text-sec);font-size:13px;">Add wallpaper</span>
                    </div>`;
                }
                const isVid = isVideoWallpaper(url);
                const isActive = idx === State.lockWall;
                const thumb = isVid
                    ? `<video src="${url}" muted playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none;"></video>`
                    : `<div style="position:absolute;inset:0;background-image:url('${url}');background-size:cover;background-position:center;"></div>`;
                return `<div class="stack-wall-card" data-wall-idx="${idx}" style="position:absolute;left:50%;top:0;width:180px;height:320px;margin-left:-90px;border-radius:18px;overflow:hidden;cursor:pointer;box-shadow:0 8px 30px rgba(0,0,0,0.45);border:2.5px solid ${isActive ? 'var(--accent)' : 'rgba(255,255,255,0.08)'};transition:transform 0.4s cubic-bezier(0.4,0,0.2,1),opacity 0.4s ease;will-change:transform,opacity;">${thumb}<div class="wall-apply-btn" style="${isActive ? 'opacity:1;pointer-events:auto;background:#000;' : ''}" onclick="Apps.settings.applyWall(${idx}); event.stopPropagation()">${isActive ? 'Applied' : 'Apply'}</div></div>`;
            };

            const makeStackRow = (title, walls) => {
                if (!walls || walls.length === 0) return '';
                const cards = walls.map(w => wallCard(w.url, w.i)).join('');
                const uid = 'sr-' + Math.random().toString(36).slice(2, 8);
                return `<div class="wall-category-row" style="margin-bottom:60px; transition: filter 0.4s ease; scroll-snap-align: center;">
                    <div style="font-size:20px;font-weight:600;color:var(--text-main);margin-bottom:14px;padding:0 6px;text-align:center;">${title}</div>
                    <div class="stack-row" data-sr-id="${uid}" style="position:relative;width:100%;height:320px;touch-action:pan-y;">
                        ${cards}
                    </div>
                    <div class="stack-scrollbar" data-sr-for="${uid}" style="overflow-x:auto;overflow-y:hidden;height:6px;margin:8px 40px 0;">
                        <div style="width:${walls.length * 200}px;height:1px;"></div>
                    </div>
                </div>`;
            };

            customWalls.unshift({ url: 'ADD_NEW', i: -1 });
            let customContent = makeStackRow('Custom Wallpapers', customWalls);

            overlay.innerHTML = `
                <style>
                    #wallpaper-scroll-container::-webkit-scrollbar { display: none; }
                    #wallpaper-scroll-container { -ms-overflow-style: none; scrollbar-width: none; }
                </style>
                <div style="background:var(--bg-card);height:100%;display:flex;flex-direction:column;overflow:hidden;">
                    <div style="padding:44px 16px 14px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
                        <div onclick="Apps.settings.collapsePreview()" style="cursor:pointer;display:flex;align-items:center;gap:6px;color:var(--accent);font-size:14px;"><i class="fas fa-chevron-left"></i> Back</div>
                        <span style="font-weight:600;font-size:16px;color:var(--text-main);">Wallpapers</span>
                        <div style="width:40px;"></div>
                    </div>
                    <div id="wallpaper-scroll-container" style="flex:1;overflow-y:auto;overflow-x:hidden;padding:15vh 14px; scroll-snap-type: y mandatory;" onscroll="if(Apps.settings.handleWallScroll) Apps.settings.handleWallScroll(this)">
                        <input type="file" id="wall-input" accept="image/*,video/mp4" style="display:none">
                        ${customContent}
                        ${makeStackRow('RealOS 3', realosWalls)}
                        ${makeStackRow('Special Wallpapers', specialWalls)}
                        ${makeStackRow('Xiaomi Wallpapers', xiaomiWalls)}
                        ${makeStackRow('OriginOS Wallpapers', originWalls)}
                    </div>
                </div>`;

            document.getElementById('screen').appendChild(overlay);
            setTimeout(() => {
                const sc = overlay.querySelector('#wallpaper-scroll-container');
                if (sc && Apps.settings.handleWallScroll) Apps.settings.handleWallScroll(sc);
            }, 100);

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const totalDur = 0.4;
                    overlay.style.transition = `left ${totalDur}s cubic-bezier(0.2,0,0,1), top ${totalDur}s cubic-bezier(0.2,0,0,1), width ${totalDur}s cubic-bezier(0.2,0,0,1), height ${totalDur}s cubic-bezier(0.2,0,0,1), border-radius ${totalDur}s cubic-bezier(0.2,0,0,1)`;
                    overlay.style.left = '0';
                    overlay.style.top = '0';
                    overlay.style.width = '100%';
                    overlay.style.height = '100%';
                    overlay.style.borderRadius = '60px';
                    previewEl.style.transition = 'opacity 0.2s ease';
                    previewEl.style.opacity = '0';
                });
            });

            setTimeout(() => {
                overlay.querySelectorAll('.stack-row').forEach(row => {
                    const cards = Array.from(row.querySelectorAll('.stack-wall-card'));
                    if (cards.length === 0) return;
                    let current = 0;
                    const activeCard = cards.findIndex(c => parseInt(c.dataset.wallIdx) === State.lockWall);
                    if (activeCard >= 0) current = activeCard;

                    const arrange = (center) => {
                        cards.forEach((card, i) => {
                            const diff = i - center;
                            const absDiff = Math.abs(diff);
                            if (absDiff > 3) {
                                card.style.opacity = '0';
                                card.style.pointerEvents = 'none';
                                card.style.transform = `translateX(${diff > 0 ? 80 : -80}px) scale(0.75)`;
                                card.style.zIndex = '0';
                            } else if (absDiff === 0) {
                                card.style.opacity = '1';
                                card.style.pointerEvents = 'auto';
                                card.style.transform = 'translateX(0) scale(1)';
                                card.style.zIndex = '10';
                            } else {
                                const offsetX = diff * 28;
                                const sc = 1 - (absDiff * 0.05);
                                card.style.opacity = `${1 - (absDiff * 0.2)}`;
                                card.style.pointerEvents = 'none';
                                card.style.transform = `translateX(${offsetX}px) scale(${sc})`;
                                card.style.zIndex = `${10 - absDiff}`;
                            }
                        });

                        cards.forEach(c => {
                            const isA = parseInt(c.dataset.wallIdx) === State.lockWall;
                            c.style.borderColor = isA ? 'var(--accent)' : 'rgba(255,255,255,0.08)';
                            const btn = c.querySelector('.wall-apply-btn');
                            if (btn) {
                                btn.innerText = isA ? 'Applied' : 'Apply';
                                btn.style.opacity = isA ? '1' : '0';
                                btn.style.pointerEvents = isA ? 'auto' : 'none';
                                btn.style.background = isA ? '#000' : 'var(--accent)';
                                btn.style.transform = isA ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(20px)';
                            }
                        });
                        const focused = cards[center];
                        if (focused) {
                            const btn = focused.querySelector('.wall-apply-btn');
                            if (btn) {
                                btn.style.opacity = '1';
                                btn.style.pointerEvents = 'auto';
                                btn.style.transform = 'translateX(-50%) translateY(0)';
                            }
                        }
                    };

                    arrange(current);
                    row._arrange = arrange;
                    row._getCurrent = () => current;

                    const goTo = (idx) => {
                        if (idx < 0 || idx >= cards.length) return;
                        current = idx;
                        arrange(current);
                        const srId = row.dataset.srId;
                        if (srId) {
                            const sb = overlay.querySelector(`.stack-scrollbar[data-sr-for="${srId}"]`);
                            if (sb && cards.length > 1) {
                                const maxScroll = sb.scrollWidth - sb.clientWidth;
                                sb.scrollLeft = (current / (cards.length - 1)) * maxScroll;
                            }
                        }
                    };

                    cards.forEach((card, i) => {
                        card.addEventListener('click', () => { if (i !== current) goTo(i); });
                    });

                    let dragStartX = 0, isDragging = false;
                    row.addEventListener('mousedown', (e) => { dragStartX = e.clientX; isDragging = true; e.preventDefault(); });
                    row.addEventListener('mousemove', (e) => { if (isDragging) e.preventDefault(); });
                    document.addEventListener('mouseup', (e) => {
                        if (!isDragging) return;
                        isDragging = false;
                        const dx = e.clientX - dragStartX;
                        if (Math.abs(dx) > 30) {
                            if (dx < 0) goTo(current + 1);
                            else goTo(current - 1);
                        }
                    });
                    row.addEventListener('touchstart', (e) => { dragStartX = e.touches[0].clientX; }, { passive: true });
                    row.addEventListener('touchend', (e) => {
                        const dx = e.changedTouches[0].clientX - dragStartX;
                        if (Math.abs(dx) > 30) {
                            if (dx < 0) goTo(current + 1);
                            else goTo(current - 1);
                        }
                    }, { passive: true });

                    const srId = row.dataset.srId;
                    if (srId) {
                        const sb = overlay.querySelector(`.stack-scrollbar[data-sr-for="${srId}"]`);
                        if (sb && cards.length > 1) {
                            const maxScroll = sb.scrollWidth - sb.clientWidth;
                            sb.scrollLeft = (current / (cards.length - 1)) * maxScroll;
                            let sbDragging = false;
                            sb.addEventListener('scroll', () => {
                                if (sbDragging) return;
                                sbDragging = true;
                                requestAnimationFrame(() => {
                                    const ms = sb.scrollWidth - sb.clientWidth;
                                    if (ms > 0) {
                                        const ratio = sb.scrollLeft / ms;
                                        const newIdx = Math.round(ratio * (cards.length - 1));
                                        if (newIdx !== current && newIdx >= 0 && newIdx < cards.length) {
                                            current = newIdx;
                                            arrange(current);
                                        }
                                    }
                                    sbDragging = false;
                                });
                            }, { passive: true });
                        }
                    }
                });

                const wallInput = document.getElementById('wall-input');
                if (wallInput) wallInput.onchange = (e) => {
                    const f = e.target.files[0];
                    if (f) {
                        const r = new FileReader();
                        r.onload = (ev) => {
                            State.wallpapers.push(ev.target.result);
                            const newIdx = State.wallpapers.length - 1;
                            State.lockWall = newIdx;
                            Storage.saveSettings();
                            OS.applySettings();
                            if ((State.clockConfig || {}).autoColor) Apps.settings.extractWallpaperColors();
                            Apps.settings.collapsePreview();
                        };
                        r.readAsDataURL(f);
                    }
                };
            }, 100);
        },
        collapsePreview: () => {
            const overlay = document.getElementById('wall-expand-overlay');
            if (!overlay) return;
            const previewEl = document.getElementById('ls-preview');
            const sRect = document.getElementById('screen').getBoundingClientRect();
            const scaleFactor = document.fullscreenElement ? 1 : document.getElementById('scale-wrapper').getBoundingClientRect().width / 400;

            const lockWallUrl = State.wallpapers[State.lockWall] || State.wallpapers[State.currentWall] || '';
            const lockIsVid = isVideoWallpaper(lockWallUrl);
            const lockBg = lockIsVid ? '' : `background-image:url('${lockWallUrl}');background-size:cover;background-position:center;`;
            const lockVidEl = lockIsVid ? `<video src="${lockWallUrl}" muted playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none;"></video>` : '';

            const cc = State.clockConfig || {};
            const now = new Date();
            let h12 = now.getHours() % 12; if (h12 === 0) h12 = 12;
            const h12Padded = h12 < 10 ? '0' + h12 : h12;
            const mins = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
            const bOp = cc.boldOpacity !== undefined ? cc.boldOpacity : 0.72;
            const fw = cc.fontWeight || 200;

            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const dateStr = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;

            let clockHtml = '';
            if (cc.style === 'stretched') {
                clockHtml = `<div style="font-size:42px;font-weight:${fw};line-height:0.85;letter-spacing:-1px;font-family:'Oswald',sans-serif;text-shadow:0 2px 6px rgba(0,0,0,0.4);color:#fff">${h12}:${mins}</div>`;
            } else {
                const fonts = { 'default': "'Inter',sans-serif", 'serif': "'Times New Roman',serif", 'science': "'Rajdhani',sans-serif", 'mono': "'Monoton',cursive", 'lux': "'Luxurious Roman',serif" };
                const f = cc.font || 'default';
                clockHtml = `<div style="font-size:32px;font-weight:${fw};line-height:1;font-family:${fonts[f] || fonts['default']};text-shadow:0 2px 6px rgba(0,0,0,0.4);"><span style="color:${cc.hourColor || '#fff'};opacity:${bOp}">${h12}</span><span style="opacity:${bOp}">:</span><span style="color:${cc.minuteColor || '#fff'};opacity:${bOp}">${mins}</span></div>`;
            }

            overlay.innerHTML = `<div style="position:absolute;inset:0;${lockBg}">${lockVidEl}</div>
                <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;padding-top:30px;z-index:1;">
                    <div style="font-size:10px;color:white;opacity:0.8;text-shadow:0 1px 3px rgba(0,0,0,0.5);">${dateStr}</div>
                    ${clockHtml}
                </div>`;

            if (previewEl) {
                const iRect = previewEl.getBoundingClientRect();
                const endLeft = ((iRect.left + iRect.width / 2 - sRect.left) / scaleFactor) - (iRect.width / scaleFactor / 2);
                const endTop = ((iRect.top + iRect.height / 2 - sRect.top) / scaleFactor) - (iRect.height / scaleFactor / 2);
                const endW = iRect.width / scaleFactor;
                const endH = iRect.height / scaleFactor;
                const totalDur = 0.35;
                overlay.style.transition = `left ${totalDur}s cubic-bezier(0.2,0,0,1), top ${totalDur}s cubic-bezier(0.2,0,0,1), width ${totalDur}s cubic-bezier(0.2,0,0,1), height ${totalDur}s cubic-bezier(0.2,0,0,1), border-radius ${totalDur}s cubic-bezier(0.2,0,0,1)`;
                overlay.style.left = endLeft + 'px';
                overlay.style.top = endTop + 'px';
                overlay.style.width = endW + 'px';
                overlay.style.height = endH + 'px';
                overlay.style.borderRadius = '28px';
            }
            setTimeout(() => {
                overlay.remove();
                const homeWallUrl = State.wallpapers[State.currentWall] || '';
                const lockWallUrl = State.wallpapers[State.lockWall] || homeWallUrl;
                const hsPreview = document.getElementById('hs-preview');
                const lsPreview = document.getElementById('ls-preview');
                if (hsPreview) {
                    hsPreview.style.backgroundImage = isVideoWallpaper(homeWallUrl) ? 'none' : `url('${homeWallUrl}')`;
                }
                if (lsPreview) {
                    lsPreview.style.backgroundImage = isVideoWallpaper(lockWallUrl) ? 'none' : `url('${lockWallUrl}')`;
                    lsPreview.style.transition = 'none';
                    lsPreview.style.opacity = '1';
                }
            }, 380);
        },
        applyWall: (i) => {
            const url = State.wallpapers[i] || '';
            const specialUrls = ['https://i.ibb.co/9HGWgS4w/wallpaper3.jpg', 'https://i.ibb.co/FMtRmsm/wallpaper4.png', 'https://i.ibb.co/ymJxLsYz/wallpaper5.png', 'https://i.ibb.co/43v4xw9/wallpaper6.png'];
            const isSpecial = isVideoWallpaper(url) || specialUrls.includes(url);
            if (isSpecial) {
                Apps.settings.applyWallTo(i, 'both');
                return;
            }
            const currentHomeUrl = State.wallpapers[State.currentWall] || '';
            const currentLockUrl = State.wallpapers[State.lockWall] || '';
            const homeIsSpecial = isVideoWallpaper(currentHomeUrl) || specialUrls.includes(currentHomeUrl);
            const lockIsSpecial = isVideoWallpaper(currentLockUrl) || specialUrls.includes(currentLockUrl);
            const hasSpecialActive = homeIsSpecial || lockIsSpecial;
            if (hasSpecialActive) {
                Apps.settings.applyWallTo(i, 'both');
                setTimeout(() => {
                    OS.showPopup('Wallpaper Changed', 'A special effects wallpaper was in use. The new wallpaper has been applied to both screens.');
                }, 100);
                return;
            }
            const optionStyle = 'padding:14px 0;text-align:center;color:var(--accent);font-size:17px;cursor:pointer;border-top:1px solid rgba(128,128,128,0.15);';
            const msg = `<div style="margin:-10px -20px -10px;">
                <div onclick="Apps.settings.applyWallTo(${i},'home')" style="${optionStyle}">Home Screen</div>
                <div onclick="Apps.settings.applyWallTo(${i},'lock')" style="${optionStyle}">Lock Screen</div>
                <div onclick="Apps.settings.applyWallTo(${i},'both')" style="${optionStyle}font-weight:600;">Both</div>
            </div>`;
            OS.showPopup('Set Wallpaper', msg);
        },
        applyWallTo: (i, target) => {
            const url = State.wallpapers[i] || '';
            const supportedSpecialUrls = ['https://i.ibb.co/9HGWgS4w/wallpaper3.jpg', 'https://i.ibb.co/FMtRmsm/wallpaper4.png', 'https://i.ibb.co/ymJxLsYz/wallpaper5.png', 'https://i.ibb.co/43v4xw9/wallpaper6.png'];
            const supportsEffects = isVideoWallpaper(url) || supportedSpecialUrls.includes(url);
            if (target === 'home' || target === 'both') {
                State.currentWall = i;
                document.documentElement.style.setProperty('--wall', `url("${url}")`);
                if (!supportsEffects && State.specialEffects) {
                    State.specialEffects = false;
                    localStorage.setItem('realos_special', false);

                    const mainToggle = document.querySelector('#main-sfx-toggle .toggle');
                    if (mainToggle) mainToggle.classList.remove('active');
                }

                const mainSfxToggleItem = document.getElementById('main-sfx-toggle');
                if (mainSfxToggleItem) {
                    mainSfxToggleItem.style.opacity = supportsEffects ? '1' : '0.5';
                    mainSfxToggleItem.style.cursor = supportsEffects ? 'pointer' : 'default';
                }
            }
            if (target === 'lock' || target === 'both') {
                State.lockWall = i;
                if (isVideoWallpaper(url)) {
                    VideoWallpaper.getThumbnail((thumbUrl) => {
                        document.documentElement.style.setProperty('--wall-lock', `url("${thumbUrl}")`);
                    });
                } else {
                    document.documentElement.style.setProperty('--wall-lock', `url("${url}")`);
                }
            }
            Storage.saveSettings();
            OS.applySettings();
            OS.updateWallpaperEffect();
            OS.hidePopup();
            if ((target === 'lock' || target === 'both') && (State.clockConfig || {}).autoColor) {
                Apps.settings.extractWallpaperColors();
            }

            document.querySelectorAll('.wall-grid-item').forEach(item => {
                item.classList.remove('active');
                item.style.borderColor = 'transparent';
                const btn = item.querySelector('.wall-apply-btn');
                if (btn) {
                    btn.innerText = 'Apply';
                    btn.style.background = 'var(--accent)';
                    btn.style.opacity = '0';
                    btn.style.pointerEvents = 'none';
                }
            });
            const appliedEl = document.querySelector(`.wall-grid-item[data-wall-idx="${i}"]`);
            if (appliedEl) {
                appliedEl.classList.add('active');
                appliedEl.style.borderColor = 'var(--accent)';
                const btn = appliedEl.querySelector('.wall-apply-btn');
                if (btn) {
                    btn.innerText = 'Applied';
                    btn.style.background = '#000';
                    btn.style.opacity = '1';
                    btn.style.pointerEvents = 'auto';
                }
            }

            document.querySelectorAll('.stack-wall-card').forEach(card => {
                const isA = parseInt(card.dataset.wallIdx) === i;
                card.style.borderColor = isA ? 'var(--accent)' : 'rgba(255,255,255,0.08)';
                const btn = card.querySelector('.wall-apply-btn');
                if (btn) {
                    btn.innerText = isA ? 'Applied' : 'Apply';
                    btn.style.background = isA ? '#000' : 'var(--accent)';
                }
            });
            document.querySelectorAll('.stack-row').forEach(row => {
                if (row._arrange) row._arrange(row._getCurrent());
            });
        },
        toggleAOD: () => {
            State.aod.enabled = !State.aod.enabled;
            Storage.saveSettings();
            const toggle = event.target.closest('.list-item').querySelector('.toggle');
            if (toggle) toggle.classList.toggle('active', State.aod.enabled);
        },
        toggleAODWall: () => {
            State.aod.wallpaper = !State.aod.wallpaper;
            Storage.saveSettings();
            const toggle = event.target.closest('.list-item').querySelector('.toggle');
            if (toggle) toggle.classList.toggle('active', State.aod.wallpaper);
            const wallEl = document.getElementById('aod-preview-wall');
            if (wallEl) {
                wallEl.style.opacity = State.aod.wallpaper ? '0.5' : '0';
            }
        },
        toggleHsBlur: () => {
            State.homescreenBlur = !State.homescreenBlur;
            Storage.saveSettings();
            if (State.homescreenBlur) {
                document.body.classList.add('hs-blur');
                const hsPreview = document.getElementById('hs-preview');
                if (hsPreview) hsPreview.classList.add('blurred-preview');
            } else {
                document.body.classList.remove('hs-blur');
                const hsPreview = document.getElementById('hs-preview');
                if (hsPreview) hsPreview.classList.remove('blurred-preview');
            }
            const toggle = event.target.closest('.list-item').querySelector('.toggle');
            if (toggle) toggle.classList.toggle('active', State.homescreenBlur);
        },
        toggleHideLabels: () => {
            State.hideAppLabels = !State.hideAppLabels;
            Storage.saveSettings();
            if (State.hideAppLabels) document.body.classList.add('hide-labels');
            else document.body.classList.remove('hide-labels');
            const toggle = event.target.closest('.list-item').querySelector('.toggle');
            if (toggle) toggle.classList.toggle('active', State.hideAppLabels);
        },
        toggleBlurBehindApps: () => {
            State.blurBehindApps = !State.blurBehindApps;
            localStorage.setItem('realos_blur_behind', State.blurBehindApps);
            State.animConfig.openWallBlur = State.blurBehindApps;
            Storage.saveSettings();
            if (State.blurBehindApps) document.body.classList.add('blur-behind');
            else document.body.classList.remove('blur-behind');
            const toggle = event.target.closest('.list-item').querySelector('.toggle');
            if (toggle) toggle.classList.toggle('active', State.blurBehindApps);
        },
        togglePunchHole: () => {
            State.punchHole = !State.punchHole;
            OS.applySettings();
            localStorage.setItem('realos_punch', State.punchHole);
            const toggle = event.target.closest('.list-item').querySelector('.toggle');
            if (toggle) toggle.classList.toggle('active', State.punchHole);
        },
        toggleMusicGrad: () => {
            State.musicGradient = !State.musicGradient;
            Storage.saveSettings();
            Island.update();
            localStorage.setItem('realos_music_grad', State.musicGradient);
            const toggle = event.target.closest('.list-item').querySelector('.toggle');
            if (toggle) toggle.classList.toggle('active', State.musicGradient);
        },
        setAppShape: (val) => {
            State.appShape = parseInt(val);
            OS.applySettings();
            localStorage.setItem('realos_shape', val);
            const previewRow = document.getElementById('shape-preview-row');
            if (previewRow) {
                previewRow.querySelectorAll('[style*="border-radius"]').forEach(box => {
                    box.style.borderRadius = OS.getShapeRadius();
                });
            }
            const mainPreview = document.querySelector('.icon-preview-row');
            if (mainPreview) {
                mainPreview.querySelectorAll('.icon-box, [style*="border-radius"]').forEach(box => {
                    box.style.borderRadius = OS.getShapeRadius();
                });
            }
        },
        toggleSpecialEffects: () => {
            State.specialEffects = !State.specialEffects;
            localStorage.setItem('realos_special', State.specialEffects);
            OS.applySettings();
            const toggle = event.target.closest('.list-item').querySelector('.toggle');
            if (toggle) toggle.classList.toggle('active', State.specialEffects);
        },
        setIconPack: (pack) => {
            State.iconPack = pack;
            OS.applySettings();
            OS.renderApps();
            localStorage.setItem('realos_iconpack', pack);
            const packNames = { default: 'RealOS (Default)', hyperos: 'HyperOS', coloros: 'ColorOS' };
            const dd = document.getElementById('sd-icon-pack');
            if (dd) {
                dd.classList.remove('open');
                const val = dd.querySelector('.sd-value');
                if (val) val.innerText = packNames[pack] || packNames['default'];
                dd.querySelectorAll('.fa-check').forEach(c => c.remove());
                dd.querySelectorAll('.sd-option').forEach(opt => {
                    const key = Object.keys(packNames).find(k => packNames[k] === opt.querySelector('span').innerText);
                    if (key === pack) opt.insertAdjacentHTML('beforeend', '<i class="fas fa-check"></i>');
                });
            }
            const previewRow = document.querySelector('#app-window .icon-preview-row');
            if (previewRow) {
                const previewApps = ['phone', 'messages', 'settings', 'camera'];
                const packs = { hyperos: 'hyperIcon', coloros: 'colorIcon' };
                previewRow.querySelectorAll('.icon-box').forEach(b => b.remove());
                const wallDiv = previewRow.querySelector('div[style*="blur"]');
                const wallVid = previewRow.querySelector('video');
                const wallUrl = State.wallpapers[State.currentWall] || '';
                if (!wallDiv && !wallVid) {
                    if (isVideoWallpaper(wallUrl)) {
                        const ve = document.createElement('video');
                        ve.src = wallUrl;
                        ve.muted = true;
                        ve.playsInline = true;
                        ve.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; object-fit:cover; filter:blur(10px) brightness(0.7); transform:scale(1.2); z-index:0;';
                        previewRow.prepend(ve);
                    } else {
                        const wd = document.createElement('div');
                        wd.style.cssText = `position:absolute; inset:0; background-image:url('${wallUrl}'); background-size:cover; background-position:center; filter:blur(10px) brightness(0.7); transform:scale(1.2); z-index:0;`;
                        previewRow.prepend(wd);
                    }
                }
                previewApps.forEach(id => {
                    const app = APPS.find(a => a.id === id);
                    const isImagePack = pack === 'hyperos' || pack === 'coloros';
                    const packIconKey = packs[pack];
                    const packIcon = packIconKey ? app[packIconKey] : null;
                    let iconContent = '';
                    let bg = isImagePack ? 'transparent' : app.color;
                    if (isImagePack && packIcon) {
                        iconContent = `<img src="${packIcon}" style="width:100%; height:100%; object-fit:cover; border-radius: inherit;">`;
                    } else {
                        if (app.id === 'settings') {
                            iconContent = `<div class="settings-icon-gear" style="transform: scale(0.86);"><div class="gear-base"></div><div class="gear-teeth"><div class="tooth"></div><div class="tooth"></div><div class="tooth"></div><div class="tooth"></div><div class="tooth"></div><div class="tooth"></div></div><div class="gear-inner-ring"></div><div class="gear-spoke spoke-1"></div><div class="gear-spoke spoke-2"></div><div class="gear-spoke spoke-3"></div><div class="gear-center-dot"></div></div>`;
                        } else if (app.id === 'camera') {
                            iconContent = `<div class="camera-icon-lens" style="transform: scale(1.04);"><div class="camera-base"></div><div class="lens-outer-ring"></div><div class="lens-inner-black"></div><div class="lens-core-glass"></div><div class="lens-glare-1"></div><div class="lens-glare-2"></div><div class="flash-ring"><div class="flash-bulb"></div></div></div>`;
                            bg = 'linear-gradient(135deg, #fbfbfb 0%, #e8e8e8 50%, #d1d1d1 100%)';
                        } else {
                            const lowBg = (bg || '').toLowerCase().trim();
                            const isWhiteBg = lowBg === '#fff' || lowBg.startsWith('#ffffff') || lowBg === 'white' || lowBg.replace(/\s/g, '') === 'rgb(255,255,255)';
                            const shadeColor = isWhiteBg ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)';
                            const shadeHtml = `<div style="position:absolute; inset:0; background: radial-gradient(circle at top right, ${shadeColor} 0%, transparent 70%); pointer-events:none; border-radius:inherit; z-index:10;"></div>`;
                            iconContent = `${shadeHtml}<i class="fas ${app.icon}" style="font-size:24px; color:${app.text || 'white'}; display:flex; align-items:center; justify-content:center; width:100%; height:100%;"></i>`;
                        }
                    }
                    const div = document.createElement('div');
                    div.className = 'icon-box';
                    div.style.cssText = `width:48px; height:48px; font-size:24px; background:${bg}; border-radius:${OS.getShapeRadius()}!important; z-index:1; position:relative; overflow:hidden; display:flex; justify-content:center; align-items:center;`;
                    div.innerHTML = iconContent;
                    previewRow.appendChild(div);
                });
            }
        },
        toggleSlowFingerprint: () => {
            State.security.slowFingerprint = !State.security.slowFingerprint;
            Storage.saveSettings();
            const toggle = event.target.closest('.list-item').querySelector('.toggle');
            if (toggle) toggle.classList.toggle('active', State.security.slowFingerprint);
        },
        setAODStyle: (s) => {
            State.aod.style = s;
            Storage.saveSettings();
            const parent = event.target.closest('.list-group');
            if (parent) {
                parent.querySelectorAll('.fa-check').forEach(c => c.remove());
                const clicked = event.target.closest('.list-item');
                if (clicked) clicked.insertAdjacentHTML('beforeend', '<i class="fas fa-check"></i>');
            }
            const clockEl = document.getElementById('aod-preview-clock');
            if (clockEl) {
                const fonts = {
                    'default': "'Inter', sans-serif",
                    'serif': "'Times New Roman', serif",
                    'science': "'Rajdhani', sans-serif",
                    'mono': "'Monoton', cursive",
                    'lux': "'Luxurious Roman', serif"
                };
                clockEl.style.fontFamily = fonts[s] || fonts['default'];
            }
        },
        updateAODTextPreview: (t) => { State.aod.text = t; Storage.saveSettings(); document.getElementById('aod-preview-text').innerText = t || "Your Text"; },
        setAODText: (t) => { State.aod.text = t; Storage.saveSettings(); },
        setAODImg: (src) => { State.aod.image = src; OS.applySettings(); },
        toggleDropdown: (trigger) => {
            const dd = trigger.closest('.settings-dropdown');
            if (!dd) return;
            const isOpen = dd.classList.contains('open');
            document.querySelectorAll('.settings-dropdown.open').forEach(d => d.classList.remove('open'));
            if (!isOpen) {
                const rect = trigger.getBoundingClientRect();
                const appWin = document.getElementById('app-window');
                const bottomSpace = appWin ? (appWin.getBoundingClientRect().bottom - rect.bottom) : (window.innerHeight - rect.bottom);
                if (bottomSpace < 160) dd.classList.add('sd-flip');
                else dd.classList.remove('sd-flip');
                dd.classList.add('open');
            }
        },
        initSliders: () => {
            document.querySelectorAll('.custom-slider').forEach(slider => {
                if (slider._csInit) return;
                slider._csInit = true;
                const min = parseFloat(slider.dataset.min);
                const max = parseFloat(slider.dataset.max);
                const step = parseFloat(slider.dataset.step) || 1;
                const update = (clientX) => {
                    const rect = slider.getBoundingClientRect();
                    let ratio = (clientX - rect.left) / rect.width;
                    ratio = Math.max(0, Math.min(1, ratio));
                    let val = min + ratio * (max - min);
                    val = Math.round(val / step) * step;
                    val = Math.max(min, Math.min(max, val));
                    const pct = ((val - min) / (max - min)) * 100;
                    slider.style.setProperty('--slider-pct', pct);
                    slider.dataset.value = val;
                    if (slider.dataset.oninput) {
                        const fn = new Function('value', slider.dataset.oninput);
                        fn(val);
                    }
                };
                const pct = ((parseFloat(slider.dataset.value) - min) / (max - min)) * 100;
                slider.style.setProperty('--slider-pct', pct);
                const onMove = (e) => {
                    if (!e.touches && e.buttons !== 1) { onUp(); return; }
                    e.preventDefault();
                    update(e.touches ? e.touches[0].clientX : e.clientX);
                };
                const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onUp); };
                slider.addEventListener('mousedown', (e) => { update(e.clientX); window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp); });
                slider.addEventListener('touchstart', (e) => { update(e.touches[0].clientX); window.addEventListener('touchmove', onMove, { passive: false }); window.addEventListener('touchend', onUp); });
            });
        },
        setClockStyle: (s) => {
            State.clockConfig = State.clockConfig || {};
            State.clockConfig.style = s;
            Storage.saveSettings();
            OS.applySettings();
            OS.updateTime();
            Apps.settings.updateClockPreview();

            const isStretched = s === 'stretched';
            const isTilt = s === 'tilt';
            const dd = document.getElementById('sd-clock-style');
            if (dd) {
                dd.classList.remove('open');
                const val = dd.querySelector('.sd-value');
                if (val) val.innerText = s === 'stretched' ? 'Stretched' : s === 'tilt' ? 'Tilt' : 'Default';
                dd.querySelectorAll('.fa-check').forEach(c => c.remove());
                dd.querySelectorAll('.sd-option').forEach(opt => {
                    const label = opt.querySelector('span').innerText.toLowerCase();
                    if (label === s) opt.insertAdjacentHTML('beforeend', '<i class="fas fa-check"></i>');
                });
            }
            const fontLabel = document.getElementById('clock-font-label');
            const fontItem = document.getElementById('clock-font-item');
            if (fontLabel) fontLabel.innerText = isStretched ? 'Clock Font (disabled)' : 'Clock Font';
            if (fontItem) fontItem.style.cssText = isStretched ? 'opacity:0.4; pointer-events:none;' : '';
        },
        setClockFont: (f) => {
            State.clockConfig = State.clockConfig || {};
            if (State.clockConfig.style === 'stretched') return;
            State.clockConfig.font = f;
            Storage.saveSettings();
            OS.applySettings();
            const fontNames = { default: 'Inter (Default)', serif: 'Serif', science: 'Science Gothic', mono: 'Monoton', lux: 'Luxurious Roman' };
            const dd = document.getElementById('sd-clock-font');
            if (dd) {
                dd.classList.remove('open');
                const val = dd.querySelector('.sd-value');
                if (val) val.innerText = fontNames[f] || fontNames['default'];
                dd.querySelectorAll('.fa-check').forEach(c => c.remove());
                dd.querySelectorAll('.sd-option').forEach(opt => {
                    const key = Object.keys(fontNames).find(k => fontNames[k] === opt.querySelector('span').innerText);
                    if (key === f) opt.insertAdjacentHTML('beforeend', '<i class="fas fa-check"></i>');
                });
            }
            const fonts = {
                'default': "'Inter', sans-serif",
                'serif': "'Times New Roman', serif",
                'science': "'Rajdhani', sans-serif",
                'mono': "'Monoton', cursive",
                'lux': "'Luxurious Roman', serif"
            };
            const previewEl = document.getElementById('clock-preview-time');
            if (previewEl) previewEl.style.fontFamily = fonts[f] || fonts['default'];
            OS.updateTime();
        },
        setClockHourColor: (c) => {
            State.clockConfig = State.clockConfig || {};
            State.clockConfig.hourColor = c;
            State.clockConfig.autoColor = false;
            Storage.saveSettings();
            OS.updateTime();
            const previewEl = document.getElementById('clock-preview-time');
            if (previewEl) {
                const hourDiv = previewEl.querySelector('div:first-child');
                if (hourDiv) hourDiv.style.color = c;
            }
            const autoToggle = document.querySelector('.list-item .toggle.active');
        },
        setClockMinuteColor: (c) => {
            State.clockConfig = State.clockConfig || {};
            State.clockConfig.minuteColor = c;
            State.clockConfig.autoColor = false;
            Storage.saveSettings();
            OS.updateTime();
            const previewEl = document.getElementById('clock-preview-time');
            if (previewEl) {
                const minDiv = previewEl.querySelector('div:last-child');
                if (minDiv) minDiv.style.color = c;
            }
        },

        setBoldOpacity: (v) => {
            State.clockConfig = State.clockConfig || {};
            State.clockConfig.boldOpacity = v;
            Storage.saveSettings();
            OS.updateTime();
            const label = document.getElementById('bold-opacity-val');
            if (label) label.textContent = Math.round(v * 100) + '%';
        },
        toggleStatusBarColor: () => {
            State.clockConfig = State.clockConfig || {};
            State.clockConfig.statusBarColor = !State.clockConfig.statusBarColor;
            const toggle = event && event.target ? event.target.closest('.list-item').querySelector('.toggle') : null;
            if (toggle) toggle.classList.toggle('active', State.clockConfig.statusBarColor);
            Storage.saveSettings();
            OS.updateTime();
        },
        updateClockPreview: () => {
            const previewEl = document.getElementById('clock-preview-time');
            if (!previewEl) return;
            const cc = State.clockConfig || {};
            const now = new Date();
            let h12 = now.getHours() % 12; if (h12 === 0) h12 = 12;
            const h12Padded = h12 < 10 ? '0' + h12 : h12;
            const mins = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
            const bOp = cc.boldOpacity !== undefined ? cc.boldOpacity : 0.72;
            const fw = cc.fontWeight || 200;
            const isStretched = cc.style === 'stretched';
            const isTilt = cc.style === 'tilt';
            if (isStretched) {
                previewEl.style.cssText = `font-size:70px;font-weight:${fw};line-height:0.85;letter-spacing:-1px;font-family:Oswald,sans-serif;`;
                previewEl.textContent = h12 + ':' + mins;
            } else if (isTilt) {
                const fonts = { 'default': "'Inter',sans-serif", 'serif': "'Times New Roman',serif", 'science': "'Rajdhani',sans-serif", 'mono': "'Monoton',cursive", 'lux': "'Luxurious Roman',serif" };
                const f = cc.font || 'default';
                previewEl.style.cssText = `font-size:52px;font-weight:${fw};line-height:1;letter-spacing:-1px;font-family:${fonts[f] || fonts['default']};transform:perspective(400px) rotateY(25deg);text-shadow:3px 0 15px rgba(0,0,0,0.3);`;
                previewEl.innerHTML = `<span style="color:${cc.hourColor || '#fff'};opacity:${bOp}">${h12}</span><span style="opacity:${bOp}">:</span><span style="color:${cc.minuteColor || '#fff'};opacity:${bOp}">${mins}</span>`;
            } else {
                const fonts = { 'default': "'Inter',sans-serif", 'serif': "'Times New Roman',serif", 'science': "'Rajdhani',sans-serif", 'mono': "'Monoton',cursive", 'lux': "'Luxurious Roman',serif" };
                const f = cc.font || 'default';
                previewEl.style.cssText = `font-size:48px;font-weight:${fw};line-height:1;font-family:${fonts[f] || fonts['default']};`;
                previewEl.innerHTML = `<span style="color:${cc.hourColor || '#fff'};opacity:${bOp}">${h12}</span><span style="opacity:${bOp}">:</span><span style="color:${cc.minuteColor || '#fff'};opacity:${bOp}">${mins}</span>`;
            }
            const appBody = document.getElementById('app-body');
            const settingsOverlay = document.getElementById('settings-section-overlay');
            const searchRoot = settingsOverlay || appBody;
            if (!searchRoot) return;
            const allGroups = searchRoot.querySelectorAll('.list-group');
            const allSectionHeaders = searchRoot.querySelectorAll('[style*="color:var(--text-sec)"]');
            allGroups.forEach((group, idx) => {
                const items = group.querySelectorAll('.list-item');
                const firstSpan = items[0] ? items[0].querySelector('span') : null;
                const firstText = firstSpan ? firstSpan.textContent.trim() : '';
                if (['Default', 'Stretched', 'Tilt'].includes(firstText)) {
                    items.forEach(item => {
                        const span = item.querySelector('span');
                        const check = item.querySelector('.fa-check');
                        if (!span) return;
                        const text = span.textContent.trim();
                        const styleMap = { 'Default': 'default', 'Stretched': 'stretched', 'Tilt': 'tilt' };
                        if (styleMap[text] !== undefined) {
                            const expected = styleMap[text];
                            const current = cc.style || 'default';
                            if (expected === current && !check) {
                                item.insertAdjacentHTML('beforeend', '<i class="fas fa-check"></i>');
                            } else if (expected !== current && check) {
                                check.remove();
                            }
                        }
                    });
                }
                if (!group.closest('.bold-options-wrapper') && (['Inter (Default)', 'Serif'].includes(firstText) || firstText.includes('Inter'))) {
                    group.style.opacity = isSpecial ? '0.4' : '1';
                    group.style.pointerEvents = isSpecial ? 'none' : 'auto';
                }
            });

            const boldOptionsWrapper = searchRoot.querySelector('.bold-options-wrapper');
            if (boldOptionsWrapper) {
                boldOptionsWrapper.style.transition = 'opacity 0.25s ease';
                boldOptionsWrapper.style.opacity = isBold ? '1' : '0.4';
                boldOptionsWrapper.style.pointerEvents = isBold ? 'auto' : 'none';
                boldOptionsWrapper.querySelectorAll('.list-group').forEach(lg => {
                    lg.style.transition = 'opacity 0.25s ease';
                    lg.style.opacity = '1';
                    lg.style.pointerEvents = 'auto';
                });

                const titleNode = boldOptionsWrapper.previousElementSibling;
                if (titleNode && titleNode.innerText.includes('BOLD CLOCK SETTINGS')) {
                    titleNode.innerText = isBold ? 'BOLD CLOCK SETTINGS' : 'BOLD CLOCK SETTINGS (disabled for this style)';
                }

                const opacityVal = boldOptionsWrapper.querySelector('#bold-opacity-val');
                const opacitySlider = boldOptionsWrapper.querySelector('.bold-opacity-slider');
                if (opacityVal) opacityVal.innerText = Math.round(bOp * 100) + '%';
                if (opacitySlider) opacitySlider.value = Math.round(bOp * 100);
            }
        },

        setBioIcon: (i) => {
            State.security.bioIcon = i;
            Storage.saveSettings();
            LockScreen.updateUI();
            document.querySelectorAll('.fp-opt').forEach(opt => opt.classList.remove('selected'));
            const clicked = event.target.closest('.fp-opt');
            if (clicked) clicked.classList.add('selected');
        },
        setBioIconLive: (i) => {
            State.security.bioIcon = i;
            Storage.saveSettings();
            LockScreen.updateUI();
            document.querySelectorAll('.fp-opt').forEach(opt => opt.classList.remove('selected'));
            const clicked = event.target.closest('.fp-opt');
            if (clicked) clicked.classList.add('selected');
            const preview = document.getElementById('fp-mock-icon');
            if (preview && Apps.settings._fpPreviewHtml) {
                preview.innerHTML = Apps.settings._fpPreviewHtml(i);
            }
        },
        toggleLsBlur: () => {
            State.lsBlur = !State.lsBlur;
            OS.applySettings();
            const toggle = event.target.closest('.list-item').querySelector('.toggle');
            if (toggle) toggle.classList.toggle('active', State.lsBlur);
        },
        setAnimSpeed: (speed) => {
            State.animationSpeed = speed;
            OS.applySettings();
            localStorage.setItem('realos_animspeed', speed);
            Storage.saveSettings();
        },
        toggleFullscreen: () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen()
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        },
        toggleSwipeClose: () => {
            State.swipeToClose = !State.swipeToClose;
            localStorage.setItem('realos_swipe_close', State.swipeToClose);
            Storage.saveSettings();
            OS.setupGestures();
            const toggle = event.target.closest('.list-item').querySelector('.toggle');
            if (toggle) toggle.classList.toggle('active', State.swipeToClose);
        },
        toggleAnimConfigValue: (key) => {
            State.animConfig[key] = !State.animConfig[key];
            if (key === 'openWallBlur' && !State.animConfig[key]) {
                const wallLayer = document.getElementById('wallpaper-layer');
                if (wallLayer) wallLayer.style.filter = '';
            }
            Storage.saveSettings();
            OS.applySettings();
            const toggle = event.target.closest('.list-item').querySelector('.toggle');
            if (toggle) toggle.classList.toggle('active', State.animConfig[key]);
        },
        exportAnimConfig: () => {
            if (!State.animConfig) return;
            let str = '';
            for (const [k, v] of Object.entries(State.animConfig)) {
                if (Array.isArray(v)) str += `${k}: [${v.join(',')}]\n`;
                else str += `${k}: ${v}\n`;
            }
            const blob = new Blob([str], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'animconfig.txt';
            a.click();
            URL.revokeObjectURL(url);
            OS.showNotification('System', 'Animation config exported');
        },
        importAnimConfig: () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.txt';
            input.onchange = e => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = e => {
                    const text = e.target.result;
                    const lines = text.split('\n');
                    let p = false;
                    for (let line of lines) {
                        line = line.trim();
                        if (!line || !line.includes(':')) continue;
                        let [k, v] = line.split(/:(.+)/);
                        k = k.trim(); v = v.trim();
                        if (v.startsWith('[') && v.endsWith(']')) {
                            const arr = v.slice(1, -1).split(',').map(Number);
                            if (arr.length === 4 && !arr.some(isNaN)) { State.animConfig[k] = arr; p = true; }
                        } else {
                            const num = parseFloat(v);
                            if (!isNaN(num)) { State.animConfig[k] = num; p = true; }
                        }
                    }
                    if (p) {
                        Storage.saveSettings();
                        OS.applySettings();
                        if (document.getElementById('ac-open-icon-val')) Apps.settings.render('animconfig');
                        OS.showNotification('System', 'Animation config imported');
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        },
        parseBezierInput: (input, configKey) => {
            let raw = input.value.replace(/cubic-bezier\s*\(/i, '').replace(/\)/g, '').trim();
            const parts = raw.split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
            if (parts.length === 4) {
                parts[0] = Math.max(0, Math.min(1, parts[0]));
                parts[2] = Math.max(0, Math.min(1, parts[2]));
                parts[1] = Math.max(-2, Math.min(2, parts[1]));
                parts[3] = Math.max(-2, Math.min(2, parts[3]));
                State.animConfig[configKey] = parts;
                Storage.saveSettings();
                input.value = 'cubic-bezier(' + parts.join(', ') + ')';
                setTimeout(() => {
                    Apps.settings.initAnimPreview();
                    if (Apps.settings.initBezierEditor) {
                        Apps.settings.initBezierEditor(input.id.replace('-vals', ''), configKey);
                    }
                }, 50);
            } else {
                const cur = State.animConfig[configKey] || [0.2, 0.85, 0.1, 1];
                input.value = 'cubic-bezier(' + cur.join(', ') + ')';
            }
        },
        setAnimConfig: (key, val) => {
            State.animConfig[key] = parseFloat(val);
            Storage.saveSettings();
            OS.applySettings();
            const labels = {
                openIconFade: { id: 'ac-open-icon-val', fmt: v => (v * 100).toFixed(0) + '%' },
                closeIconFade: { id: 'ac-close-icon-val', fmt: v => (v * 100).toFixed(0) + '%' },
                wallBlurDur: { id: 'ac-wall-blur-val', fmt: v => v.toFixed(2) + 's' },
                closeShapeMorph: { id: 'ac-close-shape-val', fmt: v => (v * 100).toFixed(0) + '%' },
                openScaleTime: { id: 'ac-scale-time-val', fmt: v => v.toFixed(2) + 's' },
                openAppZoomOut: { id: 'ac-zoom-out-val', fmt: v => (v * 100).toFixed(0) + '%' },
                openWallZoom: { id: 'ac-wall-zoom-val', fmt: v => (v * 100).toFixed(0) + '%' }
            };
            if (labels[key]) {
                const el = document.getElementById(labels[key].id);
                if (el) el.innerText = labels[key].fmt(parseFloat(val));
            }
            if (Apps.settings._animPreviewRunning) {
                Apps.settings._animPreviewRunning = false;
                setTimeout(() => Apps.settings.initAnimPreview(), 50);
            }
        },
        initBezierEditor: (canvasId, configKey) => {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const size = 200;
            const pad = 15;
            const area = size - pad * 2;
            let pts = (State.animConfig[configKey] || [0.2, 0.85, 0.1, 1]).slice();
            let dragging = -1;
            function toCanvas(x, y) { return [pad + x * area, pad + (1 - y) * area]; }
            function fromCanvas(cx, cy) { return [Math.max(0, Math.min(1, (cx - pad) / area)), Math.max(-0.5, Math.min(1.5, 1 - (cy - pad) / area))]; }
            function draw() {
                const isDark = State.darkMode;
                ctx.clearRect(0, 0, size, size);
                ctx.fillStyle = isDark ? '#1c1c1e' : '#f2f2f7';
                ctx.beginPath();
                ctx.roundRect(0, 0, size, size, 12);
                ctx.fill();
                ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
                ctx.lineWidth = 1;
                for (let gi = 0; gi <= 4; gi++) { const gp = pad + (area / 4) * gi; ctx.beginPath(); ctx.moveTo(gp, pad); ctx.lineTo(gp, pad + area); ctx.stroke(); ctx.beginPath(); ctx.moveTo(pad, gp); ctx.lineTo(pad + area, gp); ctx.stroke(); }
                ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
                ctx.setLineDash([4, 4]);
                const [p1x, p1y] = toCanvas(pts[0], pts[1]);
                const [p2x, p2y] = toCanvas(pts[2], pts[3]);
                const [sx, sy] = toCanvas(0, 0);
                const [ex, ey] = toCanvas(1, 1);
                ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(p1x, p1y); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(p2x, p2y); ctx.stroke();
                ctx.setLineDash([]);
                ctx.strokeStyle = isDark ? '#0a84ff' : '#007AFF';
                ctx.lineWidth = 2.5;
                ctx.beginPath(); ctx.moveTo(sx, sy); ctx.bezierCurveTo(p1x, p1y, p2x, p2y, ex, ey); ctx.stroke();
                [[sx, sy], [ex, ey]].forEach(([x, y]) => { ctx.fillStyle = isDark ? '#555' : '#999'; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); });
                ctx.fillStyle = '#ff9500'; ctx.beginPath(); ctx.arc(p1x, p1y, 7, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#ff375f'; ctx.beginPath(); ctx.arc(p2x, p2y, 7, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#fff'; ctx.font = '8px sans-serif'; ctx.textAlign = 'center';
                ctx.fillText('P1', p1x, p1y + 3); ctx.fillText('P2', p2x, p2y + 3);
            }
            function getPos(e) {
                const rect = canvas.getBoundingClientRect();
                const scaleX = size / rect.width;
                const scaleY = size / rect.height;
                const t = e.touches ? e.touches[0] : e;
                return [(t.clientX - rect.left) * scaleX, (t.clientY - rect.top) * scaleY];
            }
            function onDown(e) {
                e.preventDefault();
                const [mx, my] = getPos(e);
                const [p1x, p1y] = toCanvas(pts[0], pts[1]);
                const [p2x, p2y] = toCanvas(pts[2], pts[3]);
                const d1 = Math.hypot(mx - p1x, my - p1y);
                const d2 = Math.hypot(mx - p2x, my - p2y);
                if (d1 < 20 && d1 <= d2) dragging = 0;
                else if (d2 < 20) dragging = 1;
                else dragging = -1;
            }
            function onMove(e) {
                if (dragging < 0) return;
                e.preventDefault();
                const [mx, my] = getPos(e);
                const [nx, ny] = fromCanvas(mx, my);
                if (dragging === 0) { pts[0] = parseFloat(nx.toFixed(2)); pts[1] = parseFloat(ny.toFixed(2)); }
                else { pts[2] = parseFloat(nx.toFixed(2)); pts[3] = parseFloat(ny.toFixed(2)); }
                draw();
                const valEl = document.getElementById(canvasId + '-vals');
                if (valEl) valEl.value = 'cubic-bezier(' + pts.join(', ') + ')';
            }
            function onUp() {
                if (dragging >= 0) {
                    dragging = -1;
                    State.animConfig[configKey] = pts.slice();
                    Storage.saveSettings();
                    if (Apps.settings._animPreviewRunning) { Apps.settings._animPreviewRunning = false; setTimeout(() => Apps.settings.initAnimPreview(), 50); }
                }
            }
            canvas.addEventListener('mousedown', onDown); canvas.addEventListener('mousemove', onMove); canvas.addEventListener('mouseup', onUp); canvas.addEventListener('mouseleave', onUp);
            canvas.addEventListener('touchstart', onDown, { passive: false }); canvas.addEventListener('touchmove', onMove, { passive: false }); canvas.addEventListener('touchend', onUp);
            draw();
        },
        initAnimPreview: () => {
            const box = document.getElementById('anim-preview-box');
            if (!box) return;
            Apps.settings._animPreviewGen = (Apps.settings._animPreviewGen || 0) + 1;
            const gen = Apps.settings._animPreviewGen;
            Apps.settings._animPreviewRunning = true;
            const wall = document.getElementById('ap-wall');
            const icon = document.getElementById('ap-icon');
            const win = document.getElementById('ap-window');
            const overlay = document.getElementById('ap-overlay');
            const wallUrl = State.wallpapers[State.currentWall] || '';
            if (isVideoWallpaper(wallUrl)) {
                wall.style.backgroundImage = 'none';
                let vid = wall.querySelector('video');
                if (!vid) {
                    vid = document.createElement('video');
                    vid.muted = true;
                    vid.playsInline = true;
                    vid.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
                    wall.appendChild(vid);
                }
                vid.src = wallUrl;
                vid.currentTime = 1e6;
                vid.pause();
            } else {
                wall.style.backgroundImage = "url('" + wallUrl + "')";
                const existingVid = wall.querySelector('video');
                if (existingVid) existingVid.remove();
            }
            const iconW = 32, iconH = 32;
            const iconLeft = (180 - iconW) / 2;
            const iconTop = 320 - 60 - iconH;
            const spd = State.animationSpeed;
            const ac = State.animConfig;
            const totalDur = 0.5 * spd;
            const ob = ac.openBezier || [0.2, 0.85, 0.1, 1];
            const cb = ac.closeBezier || [0.15, 1.01, 0.3, 1.02];
            const openEase = 'cubic-bezier(' + ob.join(',') + ')';
            const osb = ac.openScaleBezier || [0.2, 0.85, 0.1, 1];
            const openScaleEase = 'cubic-bezier(' + osb.join(',') + ')';
            const scaleDur = (ac.openScaleTime || 0.5) * spd;
            const closeEase = 'cubic-bezier(' + cb.join(',') + ')';
            function alive() { return Apps.settings._animPreviewGen === gen && Apps.settings._animPreviewRunning && document.getElementById('anim-preview-box'); }
            function resetState() {
                win.style.transition = 'none'; win.style.left = iconLeft + 'px'; win.style.top = iconTop + 'px';
                win.style.width = iconW + 'px'; win.style.height = iconH + 'px'; win.style.borderRadius = '8px'; win.style.opacity = '0';
                overlay.style.transition = 'none'; overlay.style.opacity = '1';
                icon.style.transition = 'none'; icon.style.opacity = '1';
                wall.style.transition = 'none'; wall.style.filter = 'none'; wall.style.transform = 'scale(1)';
                void win.offsetWidth;
            }
            function openAnim() {
                if (!alive()) return;
                resetState(); void win.offsetWidth;
                icon.style.opacity = '0'; win.style.opacity = '1';
                win.style.transition = 'top ' + totalDur + 's ' + openEase + ', left ' + totalDur + 's ' + openEase + ', width ' + scaleDur + 's ' + openScaleEase + ', height ' + scaleDur + 's ' + openScaleEase + ', border-radius ' + scaleDur + 's ' + openScaleEase;
                wall.style.transition = 'filter ' + (ac.wallBlurDur * spd) + 's ease-out, transform 0.5s ' + openEase;
                overlay.style.transition = 'opacity ' + (totalDur * ac.openIconFade) + 's ease';
                requestAnimationFrame(function () {
                    if (!alive()) return;
                    win.style.left = '0px'; win.style.top = '0px'; win.style.width = '180px'; win.style.height = '320px'; win.style.borderRadius = '24px';
                    wall.style.filter = 'blur(8px) brightness(0.8)'; wall.style.transform = 'scale(1.1)';
                    overlay.style.opacity = '0';
                });
                setTimeout(function () { if (alive()) closeAnim(); }, totalDur * 1000 + 800);
            }
            function closeAnim() {
                if (!alive()) return;
                var morphDur = totalDur * ac.closeShapeMorph;
                overlay.style.transition = 'opacity ' + (morphDur * ac.closeIconFade) + 's ease'; overlay.style.opacity = '1';
                win.style.transition = 'top ' + (totalDur * 0.55) + 's ' + closeEase + ', left ' + (totalDur * 0.55) + 's ' + closeEase + ', width ' + morphDur + 's ' + closeEase + ', height ' + morphDur + 's ' + closeEase + ', border-radius ' + morphDur + 's ' + closeEase;
                wall.style.transition = 'filter ' + (ac.wallBlurDur * spd) + 's ease-out, transform 0.5s ' + closeEase;
                requestAnimationFrame(function () {
                    if (!alive()) return;
                    win.style.left = iconLeft + 'px'; win.style.top = iconTop + 'px'; win.style.width = iconW + 'px'; win.style.height = iconH + 'px'; win.style.borderRadius = '8px';
                    wall.style.filter = 'none'; wall.style.transform = 'scale(1)';
                });
                setTimeout(function () {
                    if (!alive()) return;
                    win.style.transition = 'opacity 0.15s ease'; win.style.opacity = '0';
                    icon.style.transition = 'opacity 0.15s ease'; icon.style.opacity = '1';
                    setTimeout(function () { if (alive()) openAnim(); }, 800);
                }, totalDur * 0.55 * 1000 + 100);
            }
            openAnim();
        },
        toggleAnimStyle: () => {
            State.animStyle = State.animStyle === 'new' ? 'old' : 'new';
            localStorage.setItem('realos_anim_style', State.animStyle);
            Storage.saveSettings();
            const toggle = event.target.closest('.list-item').querySelector('.toggle');
            if (toggle) toggle.classList.toggle('active', State.animStyle === 'new');
        },

        updateProfile: (name, image) => {
            State.userProfile.name = name || 'Guest';
            if (image) State.userProfile.image = image;
            Storage.saveSettings();
            Apps.settings.render('profile');
        },
        renamePhone: () => {
            const footer = document.getElementById('osm-footer');
            const overlay = document.getElementById('modal-overlay');
            const msgContainer = document.getElementById('osm-msg');

            document.getElementById('osm-title').innerText = 'Rename Phone';

            msgContainer.innerHTML = '';
            const inputEl = document.createElement('input');
            inputEl.type = 'text';
            inputEl.id = 'rename-phone-input';
            inputEl.placeholder = 'RealPhone 2 Ultra';
            inputEl.style.width = '100%';
            inputEl.style.padding = '10px';
            inputEl.style.borderRadius = '8px';
            inputEl.style.border = State.darkMode ? '1px solid #555' : '1px solid #ccc';
            inputEl.style.background = 'transparent';
            inputEl.style.color = 'inherit';
            inputEl.style.fontSize = '16px';
            inputEl.style.outline = 'none';
            inputEl.style.marginTop = '10px';
            inputEl.autocomplete = 'off';
            msgContainer.appendChild(inputEl);

            footer.innerHTML = '';

            const cancelBtn = document.createElement('div');
            cancelBtn.className = 'osm-btn secondary';
            cancelBtn.innerText = 'Cancel';
            cancelBtn.onclick = () => {
                OS.hidePopup();
            };

            const addBtn = document.createElement('div');
            addBtn.className = 'osm-btn primary';
            addBtn.innerText = 'Apply';
            addBtn.onclick = () => {
                let val = document.getElementById('rename-phone-input').value.trim();
                State.phoneName = val || 'RealPhone 2 Ultra';
                Storage.saveSettings();

                const nameEl = document.getElementById('about-phone-name-val');
                if (nameEl) nameEl.innerText = State.phoneName;

                OS.hidePopup();
            };

            footer.appendChild(cancelBtn);
            footer.appendChild(addBtn);

            overlay.classList.add('active');

            setTimeout(() => inputEl.focus(), 100);
        },
    },
    music: {
        render: () => {
            document.getElementById('app-window').style.background = 'var(--bg-app)';
            const body = document.getElementById('app-body');
            document.getElementById('app-header').style.display = 'none';
            let listHTML = '';
            Music.library.forEach((track, i) => {
                const artStyle = track.art ? `background-image:url('${track.art}')` : `background:linear-gradient(45deg, #333, #666)`;
                const isPlaying = Music.currentIdx === i && Music.active;
                listHTML += `
                    <div class="song-item" data-song-idx="${i}" onclick="Music.playTrack(${i})">
                        <div class="song-art" style="${artStyle}"></div>
                        <div class="song-info">
                            <div class="song-title">${track.title}</div>
                            <div class="song-artist">${track.artist}</div>
                        </div>
                        <div style="display:flex; align-items:center; gap:10px">
                            <span class="song-playing-indicator ${isPlaying ? 'active' : ''}"><i class="fas fa-volume-up" style="color:var(--accent)"></i></span>
                            <div style="padding:10px; color:#666; cursor:pointer;" onclick="event.stopPropagation(); Music.removeTrack(${i})"><i class="fas fa-times"></i></div>
                        </div>
                    </div>
                `;
            });
            const current = Music.library[Music.currentIdx] || { title: 'No Song', artist: '-', art: null };
            const curArt = current.art ? `background-image:url('${current.art}')` : `background:linear-gradient(45deg, #333, #666)`;
            const blurArt = current.art ? `background-image:url('${current.art}')` : `background:#333`;
            body.innerHTML = `
                <div class="music-app">
                    <div class="music-header">
                        <button class="add-song-btn" onclick="document.getElementById('file-input').click()"><i class="fas fa-plus"></i></button>
                        <h2 style="margin:0">Music</h2>
                    </div>
                    <div class="song-list">
                        ${Music.library.length ? listHTML : '<div style="padding:20px; color:#666; text-align:center;">No songs added. Tap + to add MP3.</div>'}
                    </div>
                    <div class="mini-player" onclick="Music.expand()">
                        <div class="mini-player-bg" style="${blurArt}; background-size:cover; filter: blur(30px); opacity: var(--glass-opacity, 0.4);"></div>
                        <div class="mini-player-content">
                            <div id="mp-art" style="width:50px; height:50px; border-radius:8px; flex-shrink:0; margin-right:15px; ${curArt}; background-size:cover;"></div>
                            <div style="flex:1; overflow:hidden;">
                                <div id="mp-title" style="font-weight:600; white-space:nowrap;">${current.title}</div>
                                <div id="mp-artist" style="font-size:12px; color:#aaa;">${current.artist}</div>
                                <div class="prog-bar-container" style="height:4px; margin-top:5px; cursor:default;" onclick="event.stopPropagation()">
                                    <div class="prog-bar-bg" style="background:rgba(128,128,128,0.3)"><div class="prog-bar-fill" id="app-prog-fill"></div></div>
                                </div>
                            </div>
                            <div style="font-size:24px; margin-left:15px;">
                                <i id="mp-play-icon" class="fas ${Music.audio.paused ? 'fa-play' : 'fa-pause'}" onclick="event.stopPropagation(); Music.toggle()"></i>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.getElementById('file-input').onchange = Music.handleFile;
        }
    }
};
const Volume = {
    timer: null,
    silent: false,
    level: 50,
    isDragging: false,
    init: () => {
        const bar = document.getElementById('volume-bar');
        if (!bar) return;
        bar.addEventListener('pointerdown', Volume.startDrag);
        bar.addEventListener('touchstart', Volume.startDrag, { passive: false });
        window.addEventListener('pointermove', Volume.handleDrag, { passive: false });
        window.addEventListener('pointerup', Volume.endDrag);
        window.addEventListener('pointercancel', Volume.endDrag);
        window.addEventListener('touchmove', Volume.handleDrag, { passive: false });
        window.addEventListener('touchend', Volume.endDrag);
        window.addEventListener('touchcancel', Volume.endDrag);
        Volume.setLevel(50);
    },
    show: () => {
        const overlay = document.getElementById('volume-overlay');
        overlay.classList.add('active');
        const silentBtn = document.getElementById('silent-btn');
        if (silentBtn) {

        }
        if (Volume.timer) clearTimeout(Volume.timer);
        Volume.timer = setTimeout(Volume.hide, 3000);
    },
    hide: () => {
        if (Volume.isDragging) return;
        document.getElementById('volume-overlay').classList.remove('active');
    },
    handlePress: (type) => {
        Volume.show();
        let change = 10;
        if (type === 'down') change = -10;
        Volume.setLevel(Volume.level + change);
        const btn = type === 'up' ? document.getElementById('vol-up') : document.getElementById('vol-down');
        if (btn) {
            btn.style.transform = 'scale(0.9)';
            setTimeout(() => btn.style.transform = 'scale(1)', 100);
        }
    },
    setLevel: (val) => {
        if (val < 0) val = 0;
        if (val > 100) val = 100;
        Volume.level = val;
        const fill = document.querySelector('.vol-fill');
        const icon = document.getElementById('vol-icon');
        if (!fill || !icon) return;
        fill.style.height = `${val}%`;
        if (val <= 1) icon.className = 'fas fa-volume-mute vol-icon';
        else if (val < 50) icon.className = 'fas fa-volume-down vol-icon';
        else icon.className = 'fas fa-volume-up vol-icon';
        if (val > 12) icon.classList.add('dark');
        else icon.classList.remove('dark');
    },
    startDrag: (e) => {
        Volume.isDragging = true;
        Volume.show();
        const fill = document.querySelector('.vol-fill');
        if (fill) fill.style.transition = 'none';
        Volume.handleDrag(e);
        if (Volume.timer) clearTimeout(Volume.timer);
    },
    handleDrag: (e) => {
        if (!Volume.isDragging) return;
        if (e.cancelable !== false) e.preventDefault();

        let clientY = e.clientY;
        if (e.touches && e.touches.length > 0) {
            clientY = e.touches[0].clientY;
        }

        const bar = document.getElementById('volume-bar');
        const rect = bar.getBoundingClientRect();
        let dist = rect.bottom - clientY;
        let pct = (dist / rect.height) * 100;
        Volume.setLevel(pct);
    },
    endDrag: () => {
        if (Volume.isDragging) {
            Volume.isDragging = false;
            document.getElementById('volume-bar').classList.remove('pulse');
            const fill = document.querySelector('.vol-fill');
            if (fill) fill.style.transition = 'height 0.1s linear';
            Volume.timer = setTimeout(Volume.hide, 3000);
            document.getElementById('volume-bar').style.transform = 'none';
        }
    },
    toggleSilent: () => {
        Volume.silent = !Volume.silent;
        const btn = document.getElementById('silent-btn');
        Volume.show();
        if (Volume.silent) {
            btn.classList.add('silent-active');
            if (typeof Island !== 'undefined' && Island.notify) {
                Island.notify('Silent Mode', 'On', 'fa-bell-slash');
            }
        } else {
            btn.classList.remove('silent-active');
            if (typeof Island !== 'undefined' && Island.notify) {
                Island.notify('Ring', 'On', 'fa-bell');
            }
        }
    }
};
document.addEventListener('click', (e) => {
    const overlay = document.getElementById('volume-overlay');
    if (overlay.classList.contains('active') && !overlay.contains(e.target) && !e.target.id.includes('vol-') && !Volume.isDragging) {
        Volume.hide();
    }
});
setTimeout(Volume.init, 100);

document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        document.body.classList.add('is-fullscreen');
        const fsToggle = document.getElementById('fs-toggle');
        if (fsToggle) fsToggle.classList.add('active');
    } else {
        document.body.classList.remove('is-fullscreen');
        const fsToggle = document.getElementById('fs-toggle');
        if (fsToggle) fsToggle.classList.remove('active');
    }
});

const Toast = {
    timer: null,
    show: (msg, duration = 2500) => {
        const el = document.getElementById('os-toast');
        const txt = document.getElementById('os-toast-msg');
        if (!el || !txt) return;
        clearTimeout(Toast.timer);
        txt.innerText = msg;
        el.classList.remove('active');
        void el.offsetHeight;
        el.classList.add('active');
        Toast.timer = setTimeout(() => el.classList.remove('active'), duration);
    }
};

OS.init();
