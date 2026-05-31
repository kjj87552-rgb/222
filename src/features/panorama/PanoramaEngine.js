import * as THREE from 'three';

const WINDOWS_PATH_RE = /^[a-zA-Z]:[\\/]/;
const FILE_URL_RE = /^file:\/\//i;
const DATA_URL_RE = /^data:/i;
const BLOB_URL_RE = /^blob:/i;
const HTTP_URL_RE = /^https?:/i;

export const PANORAMA_PREVIEW_CONSTRAINTS = Object.freeze({
  fov: Object.freeze({ min: 35, max: 80, default: 55 }),
  pitch: Object.freeze({ min: -85, max: 85, default: 0 }),
  smoothing: Object.freeze({ factor: 0.25, snapEpsilon: 0.01 }),
});

function finiteNumber(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function approachScalar(current, target, factor) {
  const delta = target - current;
  if (Math.abs(delta) <= PANORAMA_PREVIEW_CONSTRAINTS.smoothing.snapEpsilon) return target;
  return current + delta * factor;
}

export function normalizePanoramaPreviewView(state = {}, fallback = {}) {
  const fallbackView = {
    yaw: finiteNumber(fallback.yaw, 0),
    pitch: finiteNumber(fallback.pitch, PANORAMA_PREVIEW_CONSTRAINTS.pitch.default),
    fov: finiteNumber(fallback.fov, PANORAMA_PREVIEW_CONSTRAINTS.fov.default),
  };
  const yaw = finiteNumber(state.yaw, fallbackView.yaw);
  const pitch = clamp(
    finiteNumber(state.pitch, fallbackView.pitch),
    PANORAMA_PREVIEW_CONSTRAINTS.pitch.min,
    PANORAMA_PREVIEW_CONSTRAINTS.pitch.max,
  );
  const fov = clamp(
    finiteNumber(state.fov, fallbackView.fov),
    PANORAMA_PREVIEW_CONSTRAINTS.fov.min,
    PANORAMA_PREVIEW_CONSTRAINTS.fov.max,
  );
  return { yaw, pitch, fov };
}

export function approachPanoramaPreviewView(current = {}, target = {}, factor = PANORAMA_PREVIEW_CONSTRAINTS.smoothing.factor) {
  const safeCurrent = normalizePanoramaPreviewView(current);
  const safeTarget = normalizePanoramaPreviewView(target, safeCurrent);
  const amount = clamp(finiteNumber(factor, PANORAMA_PREVIEW_CONSTRAINTS.smoothing.factor), 0, 1);
  return normalizePanoramaPreviewView({
    yaw: approachScalar(safeCurrent.yaw, safeTarget.yaw, amount),
    pitch: approachScalar(safeCurrent.pitch, safeTarget.pitch, amount),
    fov: approachScalar(safeCurrent.fov, safeTarget.fov, amount),
  });
}

function nearestRatioLabel(aspectRatio) {
  const ratios = [
    { label: '2:1', value: 2 },
    { label: '16:9', value: 16 / 9 },
    { label: '4:3', value: 4 / 3 },
    { label: '3:2', value: 3 / 2 },
    { label: '1:1', value: 1 },
  ];
  return ratios.reduce((best, item) => (
    Math.abs(item.value - aspectRatio) < Math.abs(best.value - aspectRatio) ? item : best
  ), ratios[0]).label;
}

export function resolvePanoramaImageInfo(width, height) {
  const w = Math.round(finiteNumber(width, 0));
  const h = Math.round(finiteNumber(height, 0));
  if (w <= 0 || h <= 0) return null;
  const aspectRatio = Number((w / h).toFixed(4));
  return {
    width: w,
    height: h,
    aspectRatio,
    aspectRatioLabel: nearestRatioLabel(aspectRatio),
    isNearEquirectangular: Math.abs(aspectRatio - 2) <= 0.08,
  };
}

function normalizeTextureUrl(url) {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (
    DATA_URL_RE.test(trimmed) ||
    BLOB_URL_RE.test(trimmed) ||
    HTTP_URL_RE.test(trimmed) ||
    FILE_URL_RE.test(trimmed) ||
    trimmed.startsWith('/')
  ) {
    return trimmed;
  }
  if (WINDOWS_PATH_RE.test(trimmed)) {
    return encodeURI(`file:///${trimmed.replace(/\\/g, '/')}`);
  }
  return trimmed;
}

export class PanoramaEngine {
  constructor(container, options = {}) {
    const initialView = normalizePanoramaPreviewView(options);
    this.container = container;
    this.fov = initialView.fov;
    this.yaw = initialView.yaw;
    this.pitch = initialView.pitch;
    this.targetView = { ...initialView };
    this.onViewChange = options.onViewChange;
    this.originalUrl = '';
    this.imageInfo = null;
    this.texture = null;
    this.animationId = null;
    this.isDisposed = false;
    this.needsRender = true;
    this.isViewSmoothing = false;
    this.isDragging = false;
    this.activePointerId = null;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragStartYaw = 0;
    this.dragStartPitch = 0;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(this.fov, 1, 0.1, 1000);
    this.camera.position.set(0, 0, 0.1);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0x111111);
    Object.assign(this.renderer.domElement.style, {
      display: 'block',
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
    });
    container.appendChild(this.renderer.domElement);

    this.syncSize();

    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);
    this.material = new THREE.MeshBasicMaterial({
      color: 0x111111,
      side: THREE.FrontSide,
    });
    this.sphere = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.sphere);

    this.boundOnPointerDown = this.onPointerDown.bind(this);
    this.boundOnPointerMove = this.onPointerMove.bind(this);
    this.boundOnPointerUp = this.onPointerUp.bind(this);
    this.boundOnPointerCancel = this.onPointerCancel.bind(this);
    this.boundOnLostPointerCapture = this.onLostPointerCapture.bind(this);
    this.boundOnWheel = this.onWheelEvent.bind(this);
    this.boundOnContextMenu = (event) => event.preventDefault();
    this.boundOnWindowBlur = this.onWindowBlur.bind(this);

    const el = this.renderer.domElement;
    el.addEventListener('pointerdown', this.boundOnPointerDown);
    el.addEventListener('pointermove', this.boundOnPointerMove);
    el.addEventListener('pointerup', this.boundOnPointerUp);
    el.addEventListener('pointercancel', this.boundOnPointerCancel);
    el.addEventListener('pointerleave', this.boundOnPointerUp);
    el.addEventListener('lostpointercapture', this.boundOnLostPointerCapture);
    el.addEventListener('wheel', this.boundOnWheel, { passive: false });
    el.addEventListener('contextmenu', this.boundOnContextMenu);
    window.addEventListener('blur', this.boundOnWindowBlur);

    this.updateCameraDirection();
    this.animate();
  }

  async loadImage(url) {
    const normalized = normalizeTextureUrl(url);
    if (!normalized) return;
    if (this.texture) {
      this.texture.dispose();
      this.texture = null;
    }

    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      if (HTTP_URL_RE.test(normalized)) loader.setCrossOrigin('anonymous');
      loader.load(
        normalized,
        (texture) => {
          this.applyTexture(texture);
          resolve(this.imageInfo);
        },
        undefined,
        () => {
          this.loadTextureViaImage(normalized).then(resolve).catch(reject);
        },
      );
    });
  }

  applyRenderedView(view, options = {}) {
    const next = normalizePanoramaPreviewView(view, this);
    const fovChanged = options.forceProjection || next.fov !== this.fov;
    this.fov = next.fov;
    this.yaw = next.yaw;
    this.pitch = next.pitch;
    this.camera.fov = this.fov;
    if (fovChanged) this.camera.updateProjectionMatrix();
    this.updateCameraDirection();
  }

  setTargetView(state = {}, options = {}) {
    const next = normalizePanoramaPreviewView({ ...this.targetView, ...state }, this.targetView || this);
    this.targetView = next;
    if (options.immediate) {
      this.applyRenderedView(next, { forceProjection: true });
      this.isViewSmoothing = false;
    } else {
      this.isViewSmoothing = true;
    }
    this.requestRender();
    if (options.emit) this.emitViewChange();
  }

  setView(state = {}, options = {}) {
    this.setTargetView(state, options);
  }

  resetView() {
    this.setTargetView({
      yaw: 0,
      pitch: PANORAMA_PREVIEW_CONSTRAINTS.pitch.default,
      fov: PANORAMA_PREVIEW_CONSTRAINTS.fov.default,
    }, { emit: true });
  }

  setOriginalUrl(url) {
    this.originalUrl = url || '';
  }

  downloadOriginal() {
    if (!this.originalUrl) return;
    const link = document.createElement('a');
    link.href = this.originalUrl;
    link.download = `panorama_${Date.now()}.jpg`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async captureScreenshots(mode = 'single') {
    const results = [];
    const origView = normalizePanoramaPreviewView(this);
    const origTargetView = normalizePanoramaPreviewView(this.targetView, origView);
    const cellW = 960;
    const cellH = 540;

    const captureOne = (yaw, pitch, fov = 90) => {
      this.renderer.setSize(cellW, cellH, false);
      this.renderer.setViewport(0, 0, cellW, cellH);
      this.camera.aspect = cellW / cellH;
      this.applyRenderedView({ yaw, pitch, fov }, { forceProjection: true });
      this.renderer.render(this.scene, this.camera);
      return { url: this.renderer.domElement.toDataURL('image/jpeg', 0.92), aspectRatio: '16:9' };
    };

    if (mode === 'single') {
      this.renderer.setSize(1920, 1080, false);
      this.renderer.setViewport(0, 0, 1920, 1080);
      this.camera.aspect = 1920 / 1080;
      this.applyRenderedView(origTargetView, { forceProjection: true });
      this.renderer.render(this.scene, this.camera);
      results.push({ url: this.renderer.domElement.toDataURL('image/jpeg', 0.92), aspectRatio: '16:9' });
    } else if (mode === 'grid4') {
      for (let i = 0; i < 4; i += 1) results.push(captureOne(origTargetView.yaw + i * 90, 0));
    } else if (mode === 'grid6') {
      for (let i = 0; i < 4; i += 1) results.push(captureOne(origTargetView.yaw + i * 90, 0));
      results.push(captureOne(origTargetView.yaw, 60));
      results.push(captureOne(origTargetView.yaw, -60));
    } else if (mode === 'grid9') {
      [45, 0, -45].forEach((pitch) => {
        for (let i = 0; i < 3; i += 1) results.push(captureOne(origTargetView.yaw + i * 120, pitch));
      });
    } else if (mode === 'grid12') {
      [45, 0, -45].forEach((pitch) => {
        for (let i = 0; i < 4; i += 1) results.push(captureOne(origTargetView.yaw + i * 90, pitch));
      });
    }

    this.targetView = origTargetView;
    this.applyRenderedView(origView, { forceProjection: true });
    this.syncSize();
    return results;
  }

  resize() {
    this.syncSize();
  }

  dispose() {
    if (this.isDisposed) return;
    this.isDisposed = true;
    if (this.animationId !== null) cancelAnimationFrame(this.animationId);

    const el = this.renderer.domElement;
    el.removeEventListener('pointerdown', this.boundOnPointerDown);
    el.removeEventListener('pointermove', this.boundOnPointerMove);
    el.removeEventListener('pointerup', this.boundOnPointerUp);
    el.removeEventListener('pointercancel', this.boundOnPointerCancel);
    el.removeEventListener('pointerleave', this.boundOnPointerUp);
    el.removeEventListener('lostpointercapture', this.boundOnLostPointerCapture);
    el.removeEventListener('wheel', this.boundOnWheel);
    el.removeEventListener('contextmenu', this.boundOnContextMenu);
    window.removeEventListener('blur', this.boundOnWindowBlur);

    if (this.texture) this.texture.dispose();
    this.sphere.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    if (el.parentElement) el.parentElement.removeChild(el);
  }

  syncSize() {
    const bounds = this.container.getBoundingClientRect();
    const w = Math.round(bounds.width || this.container.clientWidth || 480);
    const h = Math.round(bounds.height || this.container.clientHeight || 320);
    if (w < 2 || h < 2) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    this.renderer.setViewport(0, 0, w, h);
    this.requestRender();
  }

  applyTexture(texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    const image = texture.image || {};
    this.imageInfo = resolvePanoramaImageInfo(
      image.naturalWidth || image.videoWidth || image.width,
      image.naturalHeight || image.videoHeight || image.height,
    );
    this.texture = texture;
    this.material.map = texture;
    this.material.color.setHex(0xffffff);
    this.material.needsUpdate = true;
    this.requestRender();
  }

  loadTextureViaImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (HTTP_URL_RE.test(url)) img.crossOrigin = 'anonymous';
      img.onload = () => {
        const texture = new THREE.Texture(img);
        this.applyTexture(texture);
        resolve(this.imageInfo);
      };
      img.onerror = () => reject(new Error('Failed to load panorama image'));
      img.src = url;
    });
  }

  updateCameraDirection() {
    const phi = THREE.MathUtils.degToRad(90 - this.pitch);
    const theta = THREE.MathUtils.degToRad(this.yaw);
    const target = new THREE.Vector3(
      500 * Math.sin(phi) * Math.cos(theta),
      500 * Math.cos(phi),
      500 * Math.sin(phi) * Math.sin(theta),
    );
    this.camera.lookAt(target);
  }

  requestRender() {
    this.needsRender = true;
  }

  animate() {
    if (this.isDisposed) return;
    this.animationId = requestAnimationFrame(() => this.animate());
    const viewChanged = this.stepViewSmoothing();
    if (viewChanged || this.needsRender) {
      this.needsRender = false;
      this.renderer.render(this.scene, this.camera);
    }
  }

  stepViewSmoothing() {
    if (!this.isViewSmoothing) return false;
    const next = approachPanoramaPreviewView(this, this.targetView);
    const changed = next.yaw !== this.yaw || next.pitch !== this.pitch || next.fov !== this.fov;
    if (changed) this.applyRenderedView(next);
    const isSettled = next.yaw === this.targetView.yaw && next.pitch === this.targetView.pitch && next.fov === this.targetView.fov;
    this.isViewSmoothing = !isSettled;
    return changed;
  }

  emitViewChange() {
    this.onViewChange?.(normalizePanoramaPreviewView(this.targetView, this));
  }

  onPointerDown(event) {
    event.stopPropagation();
    if (event.button !== 0) return;
    event.preventDefault();
    this.isDragging = true;
    this.activePointerId = event.pointerId;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragStartYaw = this.targetView.yaw;
    this.dragStartPitch = this.targetView.pitch;
    this.capturePointer(event.pointerId);
  }

  onPointerMove(event) {
    event.stopPropagation();
    if (!this.isDragging) return;
    if (this.activePointerId !== null && event.pointerId !== this.activePointerId) return;
    if (event.buttons === 0) {
      this.finishPointerDrag(event);
      return;
    }
    const dx = event.clientX - this.dragStartX;
    const dy = event.clientY - this.dragStartY;
    const sensitivity = 0.25;
    this.setTargetView({
      yaw: this.dragStartYaw - dx * sensitivity,
      pitch: this.dragStartPitch + dy * sensitivity,
    });
  }

  onPointerUp(event) {
    event.stopPropagation();
    if (this.activePointerId !== null && event.pointerId !== this.activePointerId) return;
    this.finishPointerDrag(event);
  }

  onPointerCancel(event) {
    event.stopPropagation();
    if (this.activePointerId !== null && event.pointerId !== this.activePointerId) return;
    this.finishPointerDrag(event);
  }

  onLostPointerCapture(event) {
    event.stopPropagation();
    if (this.activePointerId !== null && event.pointerId !== this.activePointerId) return;
    this.finishPointerDrag(event, { release: false });
  }

  onWindowBlur() {
    this.finishPointerDrag(null);
  }

  capturePointer(pointerId) {
    if (pointerId === undefined || pointerId === null) return;
    try {
      this.renderer.domElement.setPointerCapture?.(pointerId);
    } catch (_) {}
  }

  releasePointer(pointerId) {
    if (pointerId === undefined || pointerId === null) return;
    const el = this.renderer.domElement;
    try {
      if (typeof el.hasPointerCapture === 'function' && !el.hasPointerCapture(pointerId)) return;
      el.releasePointerCapture?.(pointerId);
    } catch (_) {}
  }

  finishPointerDrag(event, options = {}) {
    if (!this.isDragging) return;
    const pointerId = event?.pointerId ?? this.activePointerId;
    this.isDragging = false;
    this.activePointerId = null;
    if (options.release !== false) this.releasePointer(pointerId);
    this.emitViewChange();
  }

  onWheelEvent(event) {
    event.preventDefault();
    event.stopPropagation();
    const delta = event.deltaY > 0 ? 3 : -3;
    this.setTargetView({ fov: this.targetView.fov + delta }, { emit: true });
  }
}
