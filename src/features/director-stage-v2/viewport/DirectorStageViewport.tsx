import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type {
    DirectorStageCamera,
    DirectorStageElement,
    DirectorStageFrame,
    DirectorStageOrbit,
} from '../../director-stage/types'
import { getDirectorStageFocusPoint, getDirectorStageJointPreset, normalizeDirectorStageRotation } from '../../director-stage/types'
import { VIEWPORT_COLORS, VIEWPORT_OPACITIES } from './viewport-tokens'
import { makeAssetUrl } from '../../../shared/platform/backendClient'

export const resolveDirectorStageTextureUrl = (value?: string) => {
    if (!value || typeof value !== 'string') return ''
    const trimmed = value.trim()
    if (!trimmed) return ''
    return makeAssetUrl({ src: trimmed })
}

const HTTP_TEXTURE_URL_RE = /^https?:/i
const DIRECTOR_STAGE_TEXTURE_RETRY_DELAYS_MS = [300, 900]

const sleep = (delay: number) => new Promise<void>((resolve) => {
    window.setTimeout(resolve, delay)
})

const isRetryableDirectorStageTextureUrl = (url: string) => {
    if (!url) return false
    if (/^libai-asset:/i.test(url)) return true
    if (url.startsWith('/assets/')) return true
    try {
        const parsed = new URL(url)
        const host = parsed.hostname.toLowerCase()
        return (host === '127.0.0.1' || host === 'localhost') && parsed.pathname.startsWith('/assets/')
    } catch {
        return false
    }
}

const loadDirectorStageTextureOnce = (
    url: string,
    createLoader: () => THREE.TextureLoader,
) => new Promise<THREE.Texture>((resolve, reject) => {
    const loader = createLoader()
    if (HTTP_TEXTURE_URL_RE.test(url)) loader.setCrossOrigin('anonymous')
    loader.load(url, resolve, undefined, reject)
})

export async function loadDirectorStageTextureWithRetry(
    url: string,
    options: {
        createLoader?: () => THREE.TextureLoader
        shouldContinue?: () => boolean
        sleep?: (delay: number) => Promise<void>
    } = {},
) {
    const createLoader = options.createLoader || (() => new THREE.TextureLoader())
    const shouldContinue = options.shouldContinue || (() => true)
    const wait = options.sleep || sleep
    const retryable = isRetryableDirectorStageTextureUrl(url)
    let lastError: unknown = null

    for (let attempt = 0; attempt <= DIRECTOR_STAGE_TEXTURE_RETRY_DELAYS_MS.length; attempt += 1) {
        if (!shouldContinue()) return null
        try {
            return await loadDirectorStageTextureOnce(url, createLoader)
        } catch (error) {
            lastError = error
            const hasRetry = retryable && attempt < DIRECTOR_STAGE_TEXTURE_RETRY_DELAYS_MS.length
            if (!hasRetry) break
            await wait(DIRECTOR_STAGE_TEXTURE_RETRY_DELAYS_MS[attempt])
        }
    }

    throw lastError
}

type DragMode =
    | 'element-move'
    | 'element-rotate'
    | 'element-y'
    | 'camera'
    | 'camera-target'

interface DragState {
    mode: DragMode
    id: string
    planeY?: number
    offsetX?: number
    offsetZ?: number
    angleOffset?: number
    startClientY?: number
    startValue?: number
}

interface MarqueeState {
    additive: boolean
    currentX: number
    currentY: number
    startX: number
    startY: number
}

interface DirectorStageViewportProps {
    backgroundSrc?: string
    backgroundColor: string
    groundPlanSrc?: string
    groundPlanOpacity: number
    groundPlanScale: number
    groundPlanRotation: number
    groundPlanOffsetX: number
    groundPlanOffsetZ: number
    elements: DirectorStageElement[]
    cameras: DirectorStageCamera[]
    selectedElementId?: string
    selectedElementIds?: string[]
    selectedCrowdGroupId?: string
    activeCameraId?: string
    viewportMode: 'director' | 'camera'
    showGrid: boolean
    showCameras: boolean
    showTargets: boolean
    showFocus: boolean
    showElementNumbers: boolean
    showGroundPlan: boolean
    showPaths: boolean
    interactionSuspended?: boolean
    interactionLocked?: boolean
    orbit: DirectorStageOrbit
    onOrbitChange: (orbit: DirectorStageOrbit) => void
    onSelectElement: (elementId: string | null, options?: { additive?: boolean; toggle?: boolean }) => void
    onSelectElements: (elementIds: string[], options?: { additive?: boolean }) => void
    onSelectCamera: (cameraId: string | null) => void
    onMoveElement: (elementId: string, x: number, z: number) => void
    onMoveElementY: (elementId: string, y: number) => void
    onRotateElement: (elementId: string, rotationY: number) => void
    onMoveCamera: (cameraId: string, x: number, z: number) => void
    onMoveCameraTarget: (cameraId: string, x: number, z: number) => void
}

export interface DirectorStageViewportHandle {
    captureImage: (options?: { scale?: number; frame?: DirectorStageFrame }) => Promise<string | null>
    captureShotSet: (options: { cameras: DirectorStageCamera[]; scale?: number; frame?: DirectorStageFrame }) => Promise<Array<{ cameraId: string; cameraName: string; dataUrl: string }>>
    resetView: () => void
    fitScene: () => void
}

const CAMERA_MODE_FOV = 46
const DIRECTOR_HEIGHT_OFFSET = 0.2

const MOVE_HANDLE_COLOR = '#5eead4'
const ROTATE_HANDLE_COLOR = '#22d3ee'
const HEIGHT_HANDLE_COLOR = '#fbbf24'
// V2: camera colors now use VIEWPORT_COLORS
const ACTIVE_CAMERA_COLOR = `#${VIEWPORT_COLORS.cameraActive.toString(16).padStart(6, '0')}`
const IDLE_CAMERA_COLOR = `#${VIEWPORT_COLORS.cameraInactive.toString(16).padStart(6, '0')}`

const readTextureUrl = (value?: string) => {
    return resolveDirectorStageTextureUrl(value)
}

const createMaterial = (color: string, options: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
    new THREE.MeshStandardMaterial({
        color,
        metalness: 0.2,
        roughness: 0.8,
        ...options,
    })

const disposeObject = (object: THREE.Object3D) => {
    object.traverse((child) => {
        if ('geometry' in child && child.geometry instanceof THREE.BufferGeometry) {
            child.geometry.dispose()
        }
        if ('material' in child) {
            const materials = Array.isArray(child.material) ? child.material : [child.material]
            materials.forEach((material) => {
                if (!material) return
                const map = (material as THREE.Material & { map?: THREE.Texture | null }).map
                if (map) map.dispose()
                material.dispose()
            })
        }
    })
}

const clearGroup = (group: THREE.Group | null) => {
    if (!group) return
    const children = [...group.children]
    children.forEach((child) => {
        group.remove(child)
        disposeObject(child)
    })
}

const createRingSprite = (text: string, color: string) => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 96
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'rgba(15, 23, 38, 0.88)'
    ctx.beginPath()
    ctx.roundRect(8, 12, canvas.width - 16, canvas.height - 24, 24)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = color
    ctx.font = '600 30px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    const material = new THREE.SpriteMaterial({ map: texture, depthTest: false, depthWrite: false, transparent: true })
    const sprite = new THREE.Sprite(material)
    sprite.scale.set(1.8, 0.68, 1)
    return sprite
}

const normalizePointer = (event: PointerEvent, rect: DOMRect) =>
    new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
    )

const getFrameAspectRatio = (frame: DirectorStageFrame) => {
    switch (frame) {
        case '16:9':
            return 16 / 9
        case '2.35:1':
            return 2.35
        case '9:16':
            return 9 / 16
        default:
            return null
    }
}

const cropToFrame = async (dataUrl: string, frame: DirectorStageFrame) => {
    const aspectRatio = getFrameAspectRatio(frame)
    if (!aspectRatio) return dataUrl
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const element = new Image()
        element.onload = () => resolve(element)
        element.onerror = () => reject(new Error('裁切截图失败'))
        element.src = dataUrl
    })
    const sourceWidth = image.width
    const sourceHeight = image.height
    const sourceRatio = sourceWidth / sourceHeight
    let targetWidth = sourceWidth
    let targetHeight = sourceHeight
    let offsetX = 0
    let offsetY = 0
    if (sourceRatio > aspectRatio) {
        targetWidth = Math.round(sourceHeight * aspectRatio)
        offsetX = Math.round((sourceWidth - targetWidth) / 2)
    } else if (sourceRatio < aspectRatio) {
        targetHeight = Math.round(sourceWidth / aspectRatio)
        offsetY = Math.round((sourceHeight - targetHeight) / 2)
    }
    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('裁切截图失败')
    ctx.drawImage(image, offsetX, offsetY, targetWidth, targetHeight, 0, 0, targetWidth, targetHeight)
    return canvas.toDataURL('image/png')
}

const getElementById = (elements: DirectorStageElement[], id: string | undefined) =>
    id ? elements.find((element) => element.id === id) : undefined

const getCameraById = (cameras: DirectorStageCamera[], id: string | undefined) =>
    id ? cameras.find((camera) => camera.id === id) : undefined

const attachInteractiveRecursive = (
    object: THREE.Object3D,
    data: { elementId?: string; cameraId?: string; stageHandleType?: string },
    registry: THREE.Object3D[],
) => {
    object.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Sprite || child instanceof THREE.LineSegments || child instanceof THREE.Line) {
            if (data.elementId) child.userData.elementId = data.elementId
            if (data.cameraId) child.userData.cameraId = data.cameraId
            if (data.stageHandleType) child.userData.stageHandleType = data.stageHandleType
            registry.push(child)
        }
    })
}

const createCapsulePart = (
    radius: number,
    length: number,
    material: THREE.Material,
) => new THREE.Mesh(
    new THREE.CapsuleGeometry(radius, Math.max(0.01, length), 6, 12),
    material,
)

const createScaledSpherePart = (
    radius: number,
    scale: { x: number; y: number; z: number },
    material: THREE.Material,
) => {
    const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 18, 14),
        material,
    )
    mesh.scale.set(scale.x, scale.y, scale.z)
    return mesh
}

const addHeadAssembly = ({
    group,
    headRadius,
    accentMaterial,
    detailMaterial,
    noseColor = '#f8fafc',
}: {
    group: THREE.Group
    headRadius: number
    accentMaterial: THREE.Material
    detailMaterial: THREE.Material
    noseColor?: string
}) => {
    const skull = createScaledSpherePart(headRadius, { x: 0.96, y: 1.08, z: 0.94 }, accentMaterial)
    group.add(skull)

    const jaw = createScaledSpherePart(headRadius * 0.68, { x: 0.9, y: 0.62, z: 0.86 }, accentMaterial)
    jaw.position.set(0, -headRadius * 0.38, headRadius * 0.06)
    group.add(jaw)

    const brow = new THREE.Mesh(
        new THREE.BoxGeometry(headRadius * 1.08, headRadius * 0.16, headRadius * 0.24),
        detailMaterial,
    )
    brow.position.set(0, headRadius * 0.18, headRadius * 0.56)
    group.add(brow)

    const eyeBand = new THREE.Mesh(
        new THREE.BoxGeometry(headRadius * 0.76, headRadius * 0.08, headRadius * 0.08),
        detailMaterial,
    )
    eyeBand.position.set(0, headRadius * 0.04, headRadius * 0.72)
    group.add(eyeBand)

    const eyeLeft = new THREE.Mesh(
        new THREE.SphereGeometry(headRadius * 0.055, 10, 8),
        createMaterial('#f8fbff', { roughness: 0.22, metalness: 0.08 }),
    )
    eyeLeft.position.set(-headRadius * 0.18, headRadius * 0.02, headRadius * 0.78)
    group.add(eyeLeft)

    const eyeRight = eyeLeft.clone()
    eyeRight.position.x = headRadius * 0.18
    group.add(eyeRight)

    const nose = new THREE.Mesh(
        new THREE.ConeGeometry(headRadius * 0.12, headRadius * 0.3, 8),
        createMaterial(noseColor, { roughness: 0.3, metalness: 0.06 }),
    )
    nose.rotation.x = Math.PI / 2
    nose.position.set(0, -headRadius * 0.02, headRadius * 0.78)
    group.add(nose)

    const occipital = createScaledSpherePart(headRadius * 0.42, { x: 1.14, y: 0.86, z: 0.54 }, detailMaterial)
    occipital.position.set(0, headRadius * 0.02, -headRadius * 0.68)
    group.add(occipital)
}

const addFoot = ({
    parent,
    position,
    scale,
    material,
}: {
    parent: THREE.Object3D
    position: { x: number; y: number; z: number }
    scale: { width: number; height: number; length: number }
    material: THREE.Material
}) => {
    const foot = new THREE.Mesh(
        new THREE.BoxGeometry(scale.width, scale.height, scale.length),
        material,
    )
    foot.position.set(position.x, position.y, position.z)
    parent.add(foot)

    const toeCap = new THREE.Mesh(
        new THREE.BoxGeometry(scale.width * 0.86, scale.height * 0.72, scale.length * 0.34),
        createMaterial('#f6f9ff', { roughness: 0.3, metalness: 0.06 }),
    )
    toeCap.position.set(position.x, position.y - scale.height * 0.04, position.z + scale.length * 0.33)
    parent.add(toeCap)

    const heel = new THREE.Mesh(
        new THREE.BoxGeometry(scale.width * 0.64, scale.height * 0.82, scale.length * 0.18),
        createMaterial('#0f1728', { roughness: 0.62, metalness: 0.12 }),
    )
    heel.position.set(position.x, position.y + scale.height * 0.04, position.z - scale.length * 0.34)
    parent.add(heel)
}

const addTorsoOrientationMarkers = ({
    parent,
    chestWidth,
    torsoLength,
    frontMaterial,
    backMaterial,
}: {
    parent: THREE.Object3D
    chestWidth: number
    torsoLength: number
    frontMaterial: THREE.Material
    backMaterial: THREE.Material
}) => {
    const sternum = new THREE.Mesh(
        new THREE.BoxGeometry(chestWidth * 0.16, torsoLength * 0.42, 0.04),
        frontMaterial,
    )
    sternum.position.set(0, torsoLength * 0.52, chestWidth * 0.2)
    parent.add(sternum)

    const chestMark = new THREE.Mesh(
        new THREE.BoxGeometry(chestWidth * 0.54, torsoLength * 0.12, 0.06),
        frontMaterial,
    )
    chestMark.position.set(0, torsoLength * 0.68, chestWidth * 0.18)
    parent.add(chestMark)

    const abdomenMark = new THREE.Mesh(
        new THREE.BoxGeometry(chestWidth * 0.42, torsoLength * 0.08, 0.05),
        frontMaterial,
    )
    abdomenMark.position.set(0, torsoLength * 0.34, chestWidth * 0.16)
    parent.add(abdomenMark)

    const spine = new THREE.Mesh(
        new THREE.BoxGeometry(chestWidth * 0.12, torsoLength * 0.52, 0.04),
        backMaterial,
    )
    spine.position.set(0, torsoLength * 0.5, -chestWidth * 0.22)
    parent.add(spine)

    const shoulderBladeLeft = new THREE.Mesh(
        new THREE.BoxGeometry(chestWidth * 0.18, torsoLength * 0.18, 0.04),
        backMaterial,
    )
    shoulderBladeLeft.position.set(-chestWidth * 0.22, torsoLength * 0.62, -chestWidth * 0.2)
    parent.add(shoulderBladeLeft)

    const shoulderBladeRight = shoulderBladeLeft.clone()
    shoulderBladeRight.position.x = chestWidth * 0.22
    parent.add(shoulderBladeRight)
}

const addPelvisOrientationMarkers = ({
    parent,
    hipWidth,
    frontMaterial,
    backMaterial,
}: {
    parent: THREE.Object3D
    hipWidth: number
    frontMaterial: THREE.Material
    backMaterial: THREE.Material
}) => {
    const beltFront = new THREE.Mesh(
        new THREE.BoxGeometry(hipWidth * 0.62, 0.06, 0.05),
        frontMaterial,
    )
    beltFront.position.set(0, 0.02, hipWidth * 0.16)
    parent.add(beltFront)

    const navelPlate = new THREE.Mesh(
        new THREE.BoxGeometry(hipWidth * 0.16, 0.11, 0.04),
        frontMaterial,
    )
    navelPlate.position.set(0, -0.05, hipWidth * 0.18)
    parent.add(navelPlate)

    const beltBack = new THREE.Mesh(
        new THREE.BoxGeometry(hipWidth * 0.58, 0.06, 0.05),
        backMaterial,
    )
    beltBack.position.set(0, 0.02, -hipWidth * 0.18)
    parent.add(beltBack)
}

const buildCrowdProxy = (element: DirectorStageElement, isSelected: boolean, showNumbers: boolean) => {
    const group = new THREE.Group()
    group.userData.elementId = element.id
    group.position.set(element.x, element.y, element.z)
    group.rotation.y = THREE.MathUtils.degToRad(element.rotationY)
    group.scale.setScalar(element.scale)

    const joints = getDirectorStageJointPreset(element.pose === 'idle' ? 'neutral' : element.pose)
    const bodyMaterial = createMaterial(element.color, { metalness: 0.12, roughness: 0.88 })
    const accentMaterial = createMaterial(isSelected ? '#eef4ff' : '#d9e3f5', { metalness: 0.08, roughness: 0.92 })
    const detailMaterial = createMaterial('#111b2b', { metalness: 0.16, roughness: 0.74 })
    const frontMarkerMaterial = createMaterial('#f5f8ff', { metalness: 0.06, roughness: 0.34 })
    const backMarkerMaterial = createMaterial('#0d1524', { metalness: 0.16, roughness: 0.76 })

    const shadow = new THREE.Mesh(
        new THREE.CircleGeometry(0.42, 24),
        new THREE.MeshBasicMaterial({ color: isSelected ? '#0d1828' : '#07101b', transparent: true, opacity: 0.26 }),
    )
    shadow.rotation.x = -Math.PI / 2
    shadow.position.y = 0.015
    group.add(shadow)

    const pelvis = new THREE.Group()
    pelvis.position.y = 0.92 + joints.pelvisHeight * 0.28
    pelvis.rotation.x = THREE.MathUtils.degToRad(joints.pelvisPitch)
    group.add(pelvis)

    const hips = createScaledSpherePart(0.2, { x: 1.28, y: 0.7, z: 0.9 }, bodyMaterial)
    pelvis.add(hips)
    addPelvisOrientationMarkers({
        parent: pelvis,
        hipWidth: 0.44,
        frontMaterial: frontMarkerMaterial,
        backMaterial: backMarkerMaterial,
    })

    const torso = new THREE.Group()
    torso.position.y = 0.36
    torso.rotation.x = THREE.MathUtils.degToRad(joints.torsoPitch)
    pelvis.add(torso)

    const torsoCore = createCapsulePart(0.18, 0.68, bodyMaterial)
    torsoCore.position.y = 0.38
    torso.add(torsoCore)

    const shoulderBar = createCapsulePart(0.055, 0.42, detailMaterial)
    shoulderBar.rotation.z = Math.PI / 2
    shoulderBar.position.y = 0.66
    torso.add(shoulderBar)
    addTorsoOrientationMarkers({
        parent: torso,
        chestWidth: 0.42,
        torsoLength: 0.68,
        frontMaterial: frontMarkerMaterial,
        backMaterial: backMarkerMaterial,
    })

    const neck = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.06, 0.16, 10),
        accentMaterial,
    )
    neck.position.y = 0.9
    torso.add(neck)

    const head = new THREE.Group()
    head.position.y = 1.05
    head.rotation.x = THREE.MathUtils.degToRad(joints.headPitch)
    torso.add(head)
    addHeadAssembly({
        group: head,
        headRadius: 0.18,
        accentMaterial,
        detailMaterial,
    })

    const createArm = (side: -1 | 1) => {
        const shoulder = new THREE.Group()
        shoulder.position.set(side * 0.26, 0.67, 0)
        shoulder.rotation.z = THREE.MathUtils.degToRad(side === -1 ? joints.leftArmLift : -joints.rightArmLift)
        torso.add(shoulder)

        const shoulderJoint = createScaledSpherePart(0.07, { x: 1, y: 1, z: 1 }, accentMaterial)
        shoulder.add(shoulderJoint)

        const upperArm = createCapsulePart(0.055, 0.34, bodyMaterial)
        upperArm.position.y = -0.21
        shoulder.add(upperArm)

        const elbow = new THREE.Group()
        elbow.position.y = -0.42
        elbow.rotation.z = THREE.MathUtils.degToRad(side === -1 ? joints.leftArmBend : -joints.rightArmBend)
        shoulder.add(elbow)

        const elbowJoint = createScaledSpherePart(0.052, { x: 1, y: 1, z: 1 }, detailMaterial)
        elbow.add(elbowJoint)

        const forearm = createCapsulePart(0.046, 0.28, detailMaterial)
        forearm.position.y = -0.16
        elbow.add(forearm)

        const hand = createScaledSpherePart(0.05, { x: 0.88, y: 0.8, z: 0.96 }, accentMaterial)
        hand.position.y = -0.34
        elbow.add(hand)
    }

    const createLeg = (side: -1 | 1) => {
        const hip = new THREE.Group()
        hip.position.set(side * 0.12, -0.02, 0)
        const hipPitch = side === -1 ? joints.leftHipPitch + joints.leftLegStep : joints.rightHipPitch + joints.rightLegStep
        const kneeBend = side === -1 ? joints.leftKneeBend : joints.rightKneeBend
        hip.rotation.x = THREE.MathUtils.degToRad(hipPitch)
        pelvis.add(hip)

        const thigh = createCapsulePart(0.068, 0.42, bodyMaterial)
        thigh.position.y = -0.26
        hip.add(thigh)

        const knee = new THREE.Group()
        knee.position.y = -0.5
        knee.rotation.x = THREE.MathUtils.degToRad(kneeBend)
        hip.add(knee)

        const kneeJoint = createScaledSpherePart(0.058, { x: 1, y: 1, z: 1 }, detailMaterial)
        knee.add(kneeJoint)

        const calf = createCapsulePart(0.056, 0.4, detailMaterial)
        calf.position.y = -0.24
        knee.add(calf)

        addFoot({
            parent: knee,
            position: { x: 0, y: -0.48, z: 0.08 },
            scale: { width: 0.12, height: 0.07, length: 0.26 },
            material: accentMaterial,
        })
    }

    createArm(-1)
    createArm(1)
    createLeg(-1)
    createLeg(1)

    if (isSelected) {
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.62, 0.03, 8, 24),
            new THREE.MeshBasicMaterial({ color: MOVE_HANDLE_COLOR, transparent: true, opacity: 0.86 }),
        )
        ring.rotation.x = Math.PI / 2
        ring.position.y = 0.03
        group.add(ring)
    }

    if (showNumbers) {
        const label = createRingSprite(element.name, '#f8fafc')
        if (label) {
            label.position.set(0, 2.18, 0)
            group.add(label)
        }
    }

    return group
}

const buildAdvancedMannequin = (element: DirectorStageElement, isSelected: boolean, showNumbers: boolean) => {
    const group = new THREE.Group()
    group.userData.elementId = element.id
    group.position.set(element.x, element.y, element.z)
    group.rotation.y = THREE.MathUtils.degToRad(element.rotationY)
    group.scale.setScalar(element.scale)

    if (element.kind !== 'advanced') return buildCrowdProxy(element, isSelected, showNumbers)
    const joints = element.joints
    const style = {
        balanced: {
            torsoRadius: 0.22,
            torsoLength: 0.8,
            chestWidth: 0.5,
            hipWidth: 0.46,
            shoulderWidth: 0.56,
            upperArmLength: 0.42,
            forearmLength: 0.38,
            upperArmRadius: 0.074,
            forearmRadius: 0.062,
            thighLength: 0.54,
            calfLength: 0.5,
            thighRadius: 0.092,
            calfRadius: 0.074,
            headRadius: 0.23,
        },
        slim: {
            torsoRadius: 0.2,
            torsoLength: 0.86,
            chestWidth: 0.44,
            hipWidth: 0.4,
            shoulderWidth: 0.5,
            upperArmLength: 0.46,
            forearmLength: 0.4,
            upperArmRadius: 0.066,
            forearmRadius: 0.054,
            thighLength: 0.58,
            calfLength: 0.54,
            thighRadius: 0.082,
            calfRadius: 0.066,
            headRadius: 0.215,
        },
        bold: {
            torsoRadius: 0.25,
            torsoLength: 0.76,
            chestWidth: 0.58,
            hipWidth: 0.54,
            shoulderWidth: 0.62,
            upperArmLength: 0.44,
            forearmLength: 0.4,
            upperArmRadius: 0.084,
            forearmRadius: 0.072,
            thighLength: 0.56,
            calfLength: 0.52,
            thighRadius: 0.104,
            calfRadius: 0.084,
            headRadius: 0.24,
        },
    }[element.mannequinStyle]

    const bodyMaterial = createMaterial(element.color, { metalness: 0.18, roughness: 0.86 })
    const accentMaterial = createMaterial('#d7e2ff', { metalness: 0.1, roughness: 0.9 })
    const detailMaterial = createMaterial('#101924', { metalness: 0.2, roughness: 0.7 })
    const frontMarkerMaterial = createMaterial('#f4f8ff', { metalness: 0.06, roughness: 0.32 })
    const backMarkerMaterial = createMaterial('#0c1423', { metalness: 0.16, roughness: 0.74 })
    const controlMaterial = new THREE.MeshBasicMaterial({
        color: '#a855f7',
        transparent: true,
        opacity: 0.12,
        wireframe: true,
        depthWrite: false,
    })

    const shadow = new THREE.Mesh(
        new THREE.CircleGeometry(0.54, 24),
        new THREE.MeshBasicMaterial({ color: isSelected ? '#091120' : '#07101b', transparent: true, opacity: 0.24 }),
    )
    shadow.rotation.x = -Math.PI / 2
    shadow.position.y = 0.02
    group.add(shadow)

    const pelvis = new THREE.Group()
    pelvis.position.y = 0.96 + joints.pelvisHeight
    pelvis.rotation.x = THREE.MathUtils.degToRad(joints.pelvisPitch)
    group.add(pelvis)

    const hips = createScaledSpherePart(0.24, {
        x: style.hipWidth / 0.48,
        y: 0.72,
        z: 0.88,
    }, bodyMaterial)
    hips.userData.elementId = element.id
    pelvis.add(hips)
    addPelvisOrientationMarkers({
        parent: pelvis,
        hipWidth: style.hipWidth,
        frontMaterial: frontMarkerMaterial,
        backMaterial: backMarkerMaterial,
    })

    const hipPlate = new THREE.Mesh(
        new THREE.BoxGeometry(style.hipWidth * 0.9, 0.08, 0.16),
        detailMaterial,
    )
    hipPlate.position.set(0, 0.02, 0.11)
    pelvis.add(hipPlate)

    if (element.showControlBlock) {
        const control = new THREE.Mesh(
            new THREE.BoxGeometry(style.hipWidth + 0.06, 0.08, 0.3),
            controlMaterial,
        )
        control.position.y = -0.1
        pelvis.add(control)
    }

    const torso = new THREE.Group()
    torso.position.y = 0.38
    torso.rotation.x = THREE.MathUtils.degToRad(joints.torsoPitch)
    pelvis.add(torso)

    const torsoMesh = createCapsulePart(style.torsoRadius, style.torsoLength, bodyMaterial)
    torsoMesh.userData.elementId = element.id
    torsoMesh.position.y = style.torsoLength * 0.5
    torso.add(torsoMesh)

    const ribCage = createScaledSpherePart(style.torsoRadius * 0.96, {
        x: style.chestWidth / (style.torsoRadius * 2),
        y: 1.02,
        z: 0.88,
    }, bodyMaterial)
    ribCage.position.y = style.torsoLength * 0.58
    torso.add(ribCage)

    const clavicle = createCapsulePart(style.upperArmRadius * 0.72, style.shoulderWidth - style.upperArmRadius * 1.1, detailMaterial)
    clavicle.rotation.z = Math.PI / 2
    clavicle.position.y = style.torsoLength * 0.76
    torso.add(clavicle)
    addTorsoOrientationMarkers({
        parent: torso,
        chestWidth: style.chestWidth,
        torsoLength: style.torsoLength,
        frontMaterial: frontMarkerMaterial,
        backMaterial: backMarkerMaterial,
    })

    const chestPlate = new THREE.Mesh(
        new THREE.BoxGeometry(style.chestWidth, 0.08, 0.22),
        detailMaterial,
    )
    chestPlate.position.set(0, style.torsoLength * 0.66, 0.12)
    chestPlate.userData.elementId = element.id
    torso.add(chestPlate)

    const neck = new THREE.Mesh(
        new THREE.CylinderGeometry(style.headRadius * 0.28, style.headRadius * 0.3, 0.2, 10),
        accentMaterial,
    )
    neck.position.y = style.torsoLength + 0.16
    neck.userData.elementId = element.id
    torso.add(neck)

    const head = new THREE.Group()
    head.position.y = style.torsoLength + 0.34
    head.rotation.x = THREE.MathUtils.degToRad(joints.headPitch)
    torso.add(head)
    addHeadAssembly({
        group: head,
        headRadius: style.headRadius,
        accentMaterial,
        detailMaterial,
    })

    const createArm = (side: -1 | 1) => {
        const shoulder = new THREE.Group()
        shoulder.position.set(side * (style.shoulderWidth / 2), style.torsoLength * 0.77, 0)
        shoulder.rotation.z = THREE.MathUtils.degToRad(side === -1 ? joints.leftArmLift : -joints.rightArmLift)
        torso.add(shoulder)

        const shoulderJoint = createScaledSpherePart(style.upperArmRadius * 1.05, { x: 1, y: 1, z: 1 }, accentMaterial)
        shoulder.add(shoulderJoint)

        const upperArm = createCapsulePart(style.upperArmRadius, style.upperArmLength, bodyMaterial)
        upperArm.position.y = -style.upperArmLength * 0.5
        upperArm.userData.elementId = element.id
        shoulder.add(upperArm)

        const elbow = new THREE.Group()
        elbow.position.y = -style.upperArmLength
        elbow.rotation.z = THREE.MathUtils.degToRad(side === -1 ? joints.leftArmBend : -joints.rightArmBend)
        shoulder.add(elbow)

        const elbowJoint = createScaledSpherePart(style.forearmRadius * 1.05, { x: 1, y: 1, z: 1 }, detailMaterial)
        elbow.add(elbowJoint)

        const lowerArm = createCapsulePart(style.forearmRadius, style.forearmLength, detailMaterial)
        lowerArm.position.y = -style.forearmLength * 0.5
        lowerArm.userData.elementId = element.id
        elbow.add(lowerArm)

        const hand = createScaledSpherePart(style.forearmRadius * 0.92, { x: 0.86, y: 0.78, z: 0.94 }, accentMaterial)
        hand.position.y = -(style.forearmLength + style.forearmRadius * 1.4)
        elbow.add(hand)
    }

    const createLeg = (side: -1 | 1) => {
        const hip = new THREE.Group()
        hip.position.set(side * (style.hipWidth * 0.24), -0.02, 0)
        const hipPitch = side === -1 ? joints.leftHipPitch + joints.leftLegStep : joints.rightHipPitch + joints.rightLegStep
        const kneeBend = side === -1 ? joints.leftKneeBend : joints.rightKneeBend
        hip.rotation.x = THREE.MathUtils.degToRad(hipPitch)
        pelvis.add(hip)

        const upperLeg = createCapsulePart(style.thighRadius, style.thighLength, bodyMaterial)
        upperLeg.position.y = -style.thighLength * 0.5
        upperLeg.userData.elementId = element.id
        hip.add(upperLeg)

        const knee = new THREE.Group()
        knee.position.y = -style.thighLength
        knee.rotation.x = THREE.MathUtils.degToRad(kneeBend)
        hip.add(knee)

        const kneeJoint = createScaledSpherePart(style.calfRadius * 1.04, { x: 1, y: 1, z: 1 }, detailMaterial)
        knee.add(kneeJoint)

        const lowerLeg = createCapsulePart(style.calfRadius, style.calfLength, detailMaterial)
        lowerLeg.position.y = -style.calfLength * 0.5
        lowerLeg.userData.elementId = element.id
        knee.add(lowerLeg)

        addFoot({
            parent: knee,
            position: { x: 0, y: -(style.calfLength + style.calfRadius * 1.1), z: style.calfRadius * 0.9 },
            scale: {
                width: style.calfRadius * 1.8,
                height: style.calfRadius * 0.95,
                length: style.calfRadius * 3.2,
            },
            material: accentMaterial,
        })
    }

    createArm(-1)
    createArm(1)
    createLeg(-1)
    createLeg(1)

    if (isSelected) {
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.72, 0.035, 10, 28),
            new THREE.MeshBasicMaterial({ color: MOVE_HANDLE_COLOR, transparent: true, opacity: 0.88 }),
        )
        ring.rotation.x = Math.PI / 2
        ring.position.y = 0.03
        group.add(ring)
    }

    if (showNumbers) {
        const label = createRingSprite(element.name, '#f8fafc')
        if (label) {
            label.position.set(0, 2.48, 0)
            group.add(label)
        }
    }

    return group
}

const createElementSelectionHandles = (element: DirectorStageElement, registry: THREE.Object3D[]) => {
    const group = new THREE.Group()
    group.position.set(element.x, 0, element.z)

    const moveRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.58, 0.026, 10, 32),
        new THREE.MeshBasicMaterial({ color: MOVE_HANDLE_COLOR, transparent: true, opacity: 0.88 }),
    )
    moveRing.rotation.x = Math.PI / 2
    moveRing.position.y = 0.03
    attachInteractiveRecursive(moveRing, { elementId: element.id, stageHandleType: 'element-move' }, registry)
    group.add(moveRing)

    const rotateRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.82, 0.018, 8, 42),
        new THREE.MeshBasicMaterial({ color: ROTATE_HANDLE_COLOR, transparent: true, opacity: 0.94 }),
    )
    rotateRing.rotation.y = Math.PI / 2
    rotateRing.position.y = 0.72
    attachInteractiveRecursive(rotateRing, { elementId: element.id, stageHandleType: 'element-rotate' }, registry)
    group.add(rotateRing)

    const currentHeight = Math.max(0.05, element.y)
    const axis = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, Math.max(0.8, currentHeight + 0.82), 10),
        new THREE.MeshBasicMaterial({ color: HEIGHT_HANDLE_COLOR, transparent: true, opacity: 0.92 }),
    )
    axis.position.y = Math.max(0.42, currentHeight / 2 + 0.42)
    attachInteractiveRecursive(axis, { elementId: element.id, stageHandleType: 'element-y' }, registry)
    group.add(axis)

    const tip = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 12, 10),
        new THREE.MeshBasicMaterial({ color: HEIGHT_HANDLE_COLOR, transparent: true, opacity: 0.94 }),
    )
    tip.position.y = Math.max(0.84, currentHeight + 0.82)
    attachInteractiveRecursive(tip, { elementId: element.id, stageHandleType: 'element-y' }, registry)
    group.add(tip)

    return group
}

const createCameraVisual = (
    camera: DirectorStageCamera,
    active: boolean,
    showTargets: boolean,
    showNumbers: boolean,
    registry: THREE.Object3D[],
) => {
    const color = camera.locked ? '#94a3b8' : active ? ACTIVE_CAMERA_COLOR : IDLE_CAMERA_COLOR
    const bodyGroup = new THREE.Group()
    bodyGroup.position.set(camera.x, camera.y, camera.z)
    bodyGroup.lookAt(new THREE.Vector3(camera.targetX, camera.targetY, camera.targetZ))

    const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.18, 0.26),
        createMaterial(color, { roughness: 0.35, metalness: 0.42 }),
    )
    body.position.z = -0.14
    attachInteractiveRecursive(body, { cameraId: camera.id, stageHandleType: 'camera' }, registry)
    bodyGroup.add(body)

    const lens = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.09, 0.18, 12),
        createMaterial('#d9e4ff', { roughness: 0.25, metalness: 0.76 }),
    )
    lens.rotation.x = Math.PI / 2
    lens.position.z = 0.06
    attachInteractiveRecursive(lens, { cameraId: camera.id, stageHandleType: 'camera' }, registry)
    bodyGroup.add(lens)

    // V2: 当前机位实心线框，非当前机位虚线轮廓（双态）
    const frustumMat = active
        ? new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 })
        : new THREE.LineDashedMaterial({
            color: VIEWPORT_COLORS.cameraInactive,
            dashSize: 0.08,
            gapSize: 0.06,
            transparent: true,
            opacity: VIEWPORT_OPACITIES.cameraInactive,
        })
    const frustum = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(0.72, 0.42, 0.86)),
        frustumMat,
    )
    if (!active) frustum.computeLineDistances()
    frustum.position.z = 0.08
    frustum.userData.cameraId = camera.id
    frustum.userData.stageHandleType = 'camera'
    registry.push(frustum)
    bodyGroup.add(frustum)

    if (showNumbers) {
        const label = createRingSprite(camera.name, color)
        if (label) {
            label.position.set(0, 0.38, 0)
            bodyGroup.add(label)
        }
    }

    const targetGroup = new THREE.Group()
    const targetPosition = new THREE.Vector3(camera.targetX, camera.targetY, camera.targetZ)

    if (showTargets) {
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(camera.x, camera.y, camera.z),
            targetPosition,
        ])
        const line = new THREE.Line(
            lineGeometry,
            new THREE.LineBasicMaterial({ color, transparent: true, opacity: active ? 0.9 : 0.45 }),
        )
        targetGroup.add(line)

        const target = new THREE.Mesh(
            new THREE.SphereGeometry(active ? 0.08 : 0.05, 10, 8),
            createMaterial(active ? '#ffd166' : '#6fa8ff', { roughness: 0.18, metalness: 0.3 }),
        )
        target.position.copy(targetPosition)
        attachInteractiveRecursive(target, { cameraId: camera.id, stageHandleType: 'camera-target' }, registry)
        targetGroup.add(target)

        const helper = new THREE.LineSegments(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-0.12, 0, 0),
                new THREE.Vector3(0.12, 0, 0),
                new THREE.Vector3(0, -0.12, 0),
                new THREE.Vector3(0, 0.12, 0),
                new THREE.Vector3(0, 0, -0.12),
                new THREE.Vector3(0, 0, 0.12),
            ]),
            new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.86 }),
        )
        helper.position.copy(targetPosition)
        helper.userData.cameraId = camera.id
        helper.userData.stageHandleType = 'camera-target'
        registry.push(helper)
        targetGroup.add(helper)
    }

    return { bodyGroup, targetGroup }
}

const createFocusMarker = (nextOrbit: DirectorStageOrbit) => {
    const group = new THREE.Group()
    group.position.set(nextOrbit.targetX, nextOrbit.targetY, nextOrbit.targetZ)

    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.012, 8, 40),
        new THREE.MeshBasicMaterial({ color: '#f8fafc', transparent: true, opacity: 0.92, depthWrite: false }),
    )
    ring.rotation.x = Math.PI / 2
    group.add(ring)

    const cross = new THREE.LineSegments(
        new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-0.12, 0, 0),
            new THREE.Vector3(0.12, 0, 0),
            new THREE.Vector3(0, -0.12, 0),
            new THREE.Vector3(0, 0.12, 0),
            new THREE.Vector3(0, 0, -0.12),
            new THREE.Vector3(0, 0, 0.12),
        ]),
        new THREE.LineBasicMaterial({ color: '#f8fafc', transparent: true, opacity: 0.88 }),
    )
    group.add(cross)
    return group
}

const createPathVisual = (
    points: Array<{ x: number; y: number; z: number }>,
    options: { color: string; loop?: boolean; elevated?: boolean },
) => {
    if (points.length === 0) return null
    const group = new THREE.Group()
    const pathPoints = points.map(point => new THREE.Vector3(point.x, point.y + (options.elevated ? 0.06 : 0.02), point.z))
    const linePoints = options.loop && points.length > 2
        ? [...pathPoints, pathPoints[0].clone()]
        : pathPoints

    if (linePoints.length > 1) {
        const geometry = new THREE.BufferGeometry().setFromPoints(linePoints)
        const line = new THREE.Line(
            geometry,
            new THREE.LineDashedMaterial({
                color: options.color,
                dashSize: 0.32,
                gapSize: 0.18,
                transparent: true,
                opacity: 0.82,
            }),
        )
        line.computeLineDistances()
        group.add(line)
    }

    pathPoints.forEach((point, index) => {
        const marker = new THREE.Mesh(
            new THREE.SphereGeometry(options.elevated ? 0.08 : 0.06, 12, 10),
            new THREE.MeshBasicMaterial({ color: options.color, transparent: true, opacity: index === 0 ? 0.95 : 0.72 }),
        )
        marker.position.copy(point)
        group.add(marker)
    })
    return group
}

const applyDirectorOrbit = (
    camera: THREE.PerspectiveCamera,
    controls: OrbitControls,
    nextOrbit: DirectorStageOrbit,
) => {
    const target = new THREE.Vector3(nextOrbit.targetX, nextOrbit.targetY, nextOrbit.targetZ)
    controls.target.copy(target)
    const x = Math.sin(nextOrbit.yaw) * Math.cos(nextOrbit.pitch) * nextOrbit.distance
    const y = DIRECTOR_HEIGHT_OFFSET + Math.sin(nextOrbit.pitch) * nextOrbit.distance
    const z = Math.cos(nextOrbit.yaw) * Math.cos(nextOrbit.pitch) * nextOrbit.distance
    camera.position.set(target.x + x, target.y + y, target.z + z)
    camera.lookAt(target)
    camera.fov = CAMERA_MODE_FOV
    camera.updateProjectionMatrix()
    controls.update()
}

const extractDirectorOrbit = (camera: THREE.PerspectiveCamera, controls: OrbitControls): DirectorStageOrbit => {
    const target = controls.target.clone()
    const offset = camera.position.clone().sub(target)
    const offsetY = offset.y - DIRECTOR_HEIGHT_OFFSET
    const distance = Math.max(0.0001, Math.sqrt(offset.x * offset.x + offsetY * offsetY + offset.z * offset.z))
    return {
        yaw: Math.atan2(offset.x, offset.z),
        pitch: Math.asin(THREE.MathUtils.clamp(offsetY / distance, -1, 1)),
        distance,
        targetX: target.x,
        targetY: target.y,
        targetZ: target.z,
    }
}

export const DirectorStageViewport = forwardRef<DirectorStageViewportHandle, DirectorStageViewportProps>(function DirectorStageViewport({
    backgroundSrc,
    backgroundColor,
    groundPlanSrc,
    groundPlanOpacity,
    groundPlanScale,
    groundPlanRotation,
    groundPlanOffsetX,
    groundPlanOffsetZ,
    elements,
    cameras,
    selectedElementId,
    selectedElementIds,
    selectedCrowdGroupId,
    activeCameraId,
    viewportMode,
    showGrid,
    showCameras,
    showTargets,
    showFocus,
    showElementNumbers,
    showGroundPlan,
    showPaths,
    interactionSuspended,
    interactionLocked,
    orbit,
    onOrbitChange,
    onSelectElement,
    onSelectElements,
    onSelectCamera,
    onMoveElement,
    onMoveElementY,
    onRotateElement,
    onMoveCamera,
    onMoveCameraTarget,
}, ref) {
    const hostRef = useRef<HTMLDivElement>(null)
    const sceneRef = useRef<THREE.Scene | null>(null)
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
    const controlsRef = useRef<OrbitControls | null>(null)
    const animationFrameRef = useRef<number | null>(null)
    const resizeObserverRef = useRef<ResizeObserver | null>(null)
    const orbitSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const suppressOrbitSyncRef = useRef(false)
    const backgroundSphereRef = useRef<THREE.Mesh | null>(null)
    const backgroundTextureRef = useRef<THREE.Texture | null>(null)
    const backgroundLoadTokenRef = useRef(0)
    const groundPlanPlaneRef = useRef<THREE.Mesh | null>(null)
    const groundPlanTextureRef = useRef<THREE.Texture | null>(null)
    const groundPlanLoadTokenRef = useRef(0)
    const gridRef = useRef<THREE.GridHelper | null>(null)
    const gridMinorRef = useRef<THREE.GridHelper | null>(null)
    const elementsGroupRef = useRef<THREE.Group | null>(null)
    const camerasGroupRef = useRef<THREE.Group | null>(null)
    const targetsGroupRef = useRef<THREE.Group | null>(null)
    const handlesGroupRef = useRef<THREE.Group | null>(null)
    const pathsGroupRef = useRef<THREE.Group | null>(null)
    const focusGroupRef = useRef<THREE.Group | null>(null)
    const interactiveObjectsRef = useRef<THREE.Object3D[]>([])
    const dragStateRef = useRef<DragState | null>(null)
    const marqueeStateRef = useRef<MarqueeState | null>(null)
    const raycasterRef = useRef(new THREE.Raycaster())
    const pointerRef = useRef(new THREE.Vector2())
    const needsRenderRef = useRef(true)
    const [marqueeRect, setMarqueeRect] = useState<null | { left: number; top: number; width: number; height: number }>(null)

    const propsRef = useRef({
        backgroundSrc,
        backgroundColor,
        groundPlanSrc,
        groundPlanOpacity,
        groundPlanScale,
        groundPlanRotation,
        groundPlanOffsetX,
        groundPlanOffsetZ,
        elements,
        cameras,
        selectedElementId,
        selectedElementIds,
        selectedCrowdGroupId,
        activeCameraId,
        viewportMode,
        showGrid,
        showCameras,
        showTargets,
        showFocus,
        showElementNumbers,
        showGroundPlan,
        showPaths,
        interactionSuspended,
        interactionLocked,
        orbit,
        onOrbitChange,
        onSelectElement,
        onSelectElements,
        onSelectCamera,
        onMoveElement,
        onMoveElementY,
        onRotateElement,
        onMoveCamera,
        onMoveCameraTarget,
    })

    propsRef.current = {
        backgroundSrc,
        backgroundColor,
        groundPlanSrc,
        groundPlanOpacity,
        groundPlanScale,
        groundPlanRotation,
        groundPlanOffsetX,
        groundPlanOffsetZ,
        elements,
        cameras,
        selectedElementId,
        selectedElementIds,
        selectedCrowdGroupId,
        activeCameraId,
        viewportMode,
        showGrid,
        showCameras,
        showTargets,
        showFocus,
        showElementNumbers,
        showGroundPlan,
        showPaths,
        interactionSuspended,
        interactionLocked,
        orbit,
        onOrbitChange,
        onSelectElement,
        onSelectElements,
        onSelectCamera,
        onMoveElement,
        onMoveElementY,
        onRotateElement,
        onMoveCamera,
        onMoveCameraTarget,
    }

    const requestRender = useCallback(() => {
        needsRenderRef.current = true
    }, [])

    const flushOrbitSync = useCallback(() => {
        const perspectiveCamera = cameraRef.current
        const controls = controlsRef.current
        if (!perspectiveCamera || !controls || propsRef.current.viewportMode !== 'director') return
        propsRef.current.onOrbitChange(extractDirectorOrbit(perspectiveCamera, controls))
    }, [])

    const scheduleOrbitSync = useCallback(() => {
        if (orbitSyncTimerRef.current) {
            clearTimeout(orbitSyncTimerRef.current)
        }
        orbitSyncTimerRef.current = setTimeout(() => {
            orbitSyncTimerRef.current = null
            flushOrbitSync()
        }, 120)
    }, [flushOrbitSync])

    const applyOrbitWithoutFeedback = useCallback((nextOrbit: DirectorStageOrbit) => {
        // Applying parent-controlled orbit should not re-emit OrbitControls change events back to the parent.
        const perspectiveCamera = cameraRef.current
        const controls = controlsRef.current
        if (!perspectiveCamera || !controls) return
        if (orbitSyncTimerRef.current) {
            clearTimeout(orbitSyncTimerRef.current)
            orbitSyncTimerRef.current = null
        }
        suppressOrbitSyncRef.current = true
        try {
            applyDirectorOrbit(perspectiveCamera, controls, nextOrbit)
        } finally {
            suppressOrbitSyncRef.current = false
        }
    }, [])

    const resizeViewport = useCallback(() => {
        const renderer = rendererRef.current
        const perspectiveCamera = cameraRef.current
        const host = hostRef.current
        if (!renderer || !perspectiveCamera || !host) return
        const bounds = host.getBoundingClientRect()
        const width = Math.max(1, Math.round(bounds.width))
        const height = Math.max(1, Math.round(bounds.height))
        renderer.setSize(width, height, false)
        renderer.setViewport(0, 0, width, height)
        perspectiveCamera.aspect = width / height
        perspectiveCamera.updateProjectionMatrix()
        requestRender()
    }, [requestRender])

    const syncBackground = useCallback(async () => {
        const sphere = backgroundSphereRef.current
        if (!sphere) return
        const material = sphere.material as THREE.MeshBasicMaterial
        const nextBackgroundSrc = readTextureUrl(propsRef.current.backgroundSrc)
        const loadToken = backgroundLoadTokenRef.current + 1
        backgroundLoadTokenRef.current = loadToken

        if (backgroundTextureRef.current) {
            backgroundTextureRef.current.dispose()
            backgroundTextureRef.current = null
        }

        material.map = null
        material.color = new THREE.Color(propsRef.current.backgroundColor)
        material.needsUpdate = true

        if (!nextBackgroundSrc) {
            requestRender()
            return
        }

        try {
            const texture = await loadDirectorStageTextureWithRetry(nextBackgroundSrc, {
                shouldContinue: () => (
                    backgroundLoadTokenRef.current === loadToken
                    && readTextureUrl(propsRef.current.backgroundSrc) === nextBackgroundSrc
                ),
            })
            if (!texture) return
            texture.colorSpace = THREE.SRGBColorSpace
            texture.minFilter = THREE.LinearFilter
            texture.magFilter = THREE.LinearFilter
            texture.generateMipmaps = false
            texture.needsUpdate = true
            backgroundTextureRef.current = texture
            material.map = texture
            material.color = new THREE.Color('#ffffff')
            material.needsUpdate = true
            requestRender()
        } catch (error) {
            console.error('[director-stage-v2 viewport] Failed to load background texture, url was:',
                          nextBackgroundSrc, 'error:', error)
            requestRender()
        }
    }, [requestRender])

    const syncGroundPlan = useCallback(async () => {
        const plane = groundPlanPlaneRef.current
        if (!plane) return
        const material = plane.material as THREE.MeshBasicMaterial
        const nextGroundPlanSrc = readTextureUrl(propsRef.current.groundPlanSrc)
        const loadToken = groundPlanLoadTokenRef.current + 1
        groundPlanLoadTokenRef.current = loadToken

        if (groundPlanTextureRef.current) {
            groundPlanTextureRef.current.dispose()
            groundPlanTextureRef.current = null
        }

        plane.visible = Boolean(nextGroundPlanSrc) && propsRef.current.showGroundPlan
        plane.position.set(propsRef.current.groundPlanOffsetX, 0.015, propsRef.current.groundPlanOffsetZ)
        plane.rotation.set(-Math.PI / 2, 0, THREE.MathUtils.degToRad(propsRef.current.groundPlanRotation))
        material.opacity = THREE.MathUtils.clamp(propsRef.current.groundPlanOpacity, 0.05, 1)
        material.map = null
        material.needsUpdate = true

        if (!nextGroundPlanSrc) {
            requestRender()
            return
        }

        try {
            const texture = await loadDirectorStageTextureWithRetry(nextGroundPlanSrc, {
                shouldContinue: () => (
                    groundPlanLoadTokenRef.current === loadToken
                    && readTextureUrl(propsRef.current.groundPlanSrc) === nextGroundPlanSrc
                ),
            })
            if (!texture) return
            texture.colorSpace = THREE.SRGBColorSpace
            texture.minFilter = THREE.LinearFilter
            texture.magFilter = THREE.LinearFilter
            texture.generateMipmaps = false
            texture.needsUpdate = true
            groundPlanTextureRef.current = texture
            material.map = texture
            const textureImage = texture.image as { width?: number; height?: number } | undefined
            const aspectRatio = textureImage?.width && textureImage?.height
                ? textureImage.width / textureImage.height
                : 1
            const scale = Math.max(1, propsRef.current.groundPlanScale)
            plane.scale.set(scale * aspectRatio, scale, 1)
            plane.visible = propsRef.current.showGroundPlan
            material.needsUpdate = true
            requestRender()
        } catch (error) {
            console.error('[director-stage-v2 viewport] Failed to load ground plan texture, url was:',
                          nextGroundPlanSrc, 'error:', error)
            requestRender()
        }
    }, [requestRender])

    const rebuildStage = useCallback(() => {
        const {
            elements: nextElements,
            cameras: nextCameras,
            selectedElementId: nextSelectedElementId,
            selectedElementIds: nextSelectedElementIds,
            selectedCrowdGroupId: nextSelectedCrowdGroupId,
            activeCameraId: nextActiveCameraId,
            viewportMode: nextViewportMode,
            showGrid: nextShowGrid,
            showCameras: nextShowCameras,
            showTargets: nextShowTargets,
            showElementNumbers: nextShowElementNumbers,
            showPaths: nextShowPaths,
        } = propsRef.current

        if (gridRef.current) {
            gridRef.current.visible = nextShowGrid
        }
        if (gridMinorRef.current) {
            gridMinorRef.current.visible = nextShowGrid
        }

        clearGroup(elementsGroupRef.current)
        clearGroup(camerasGroupRef.current)
        clearGroup(targetsGroupRef.current)
        clearGroup(handlesGroupRef.current)
        clearGroup(pathsGroupRef.current)
        clearGroup(focusGroupRef.current)
        interactiveObjectsRef.current = []

        nextElements.forEach((element) => {
            const isSelected = Boolean(nextSelectedElementIds?.includes(element.id))
                || element.id === nextSelectedElementId
                || (!!nextSelectedCrowdGroupId && element.kind === 'crowd' && element.crowdGroupId === nextSelectedCrowdGroupId)
            const mesh = element.kind === 'advanced'
                ? buildAdvancedMannequin(element, isSelected, nextShowElementNumbers)
                : buildCrowdProxy(element, isSelected, nextShowElementNumbers)
            attachInteractiveRecursive(mesh, { elementId: element.id }, interactiveObjectsRef.current)
            elementsGroupRef.current?.add(mesh)
            // V2: selection ring（选中焦点环，平躺在地面）
            if (isSelected) {
                const ringColor = element.kind === 'advanced'
                    ? VIEWPORT_COLORS.hero
                    : element.kind === 'crowd'
                    ? VIEWPORT_COLORS.crowd
                    : VIEWPORT_COLORS.cameraActive
                const ringGeo = new THREE.RingGeometry(0.5, 0.6, 48)
                const ringMat = new THREE.MeshBasicMaterial({
                    color: ringColor,
                    transparent: true,
                    opacity: VIEWPORT_OPACITIES.selectionRing,
                    side: THREE.DoubleSide,
                })
                const ring = new THREE.Mesh(ringGeo, ringMat)
                ring.rotation.x = -Math.PI / 2
                ring.position.set(element.x, 0.01, element.z)
                elementsGroupRef.current?.add(ring)
            }
            if (nextViewportMode === 'director' && element.id === nextSelectedElementId && !element.locked) {
                handlesGroupRef.current?.add(createElementSelectionHandles(element, interactiveObjectsRef.current))
            }
            if (nextShowPaths && element.motionPath?.points?.length) {
                const pathVisual = createPathVisual(element.motionPath.points, {
                    color: '#67e8f9',
                    loop: element.motionPath.loop,
                })
                if (pathVisual) pathsGroupRef.current?.add(pathVisual)
            }
        })

        nextCameras.forEach((stageCamera) => {
            const cameraActive = stageCamera.id === nextActiveCameraId
            const { bodyGroup, targetGroup } = createCameraVisual(
                stageCamera,
                cameraActive,
                nextShowTargets && nextViewportMode === 'director',
                nextShowElementNumbers,
                interactiveObjectsRef.current,
            )
            bodyGroup.visible = nextShowCameras && nextViewportMode === 'director'
            targetGroup.visible = nextShowTargets && nextViewportMode === 'director'
            camerasGroupRef.current?.add(bodyGroup)
            targetsGroupRef.current?.add(targetGroup)
            if (nextShowPaths && stageCamera.motionPath?.points?.length) {
                const pathVisual = createPathVisual(stageCamera.motionPath.points, {
                    color: '#fbbf24',
                    loop: stageCamera.motionPath.loop,
                    elevated: true,
                })
                if (pathVisual) pathsGroupRef.current?.add(pathVisual)
            }
        })

        requestRender()
    }, [requestRender])

    const commitMarqueeSelection = useCallback((marqueeState: MarqueeState) => {
        const renderer = rendererRef.current
        const perspectiveCamera = cameraRef.current
        if (!renderer || !perspectiveCamera) return
        const bounds = renderer.domElement.getBoundingClientRect()
        const left = Math.min(marqueeState.startX, marqueeState.currentX)
        const top = Math.min(marqueeState.startY, marqueeState.currentY)
        const width = Math.abs(marqueeState.currentX - marqueeState.startX)
        const height = Math.abs(marqueeState.currentY - marqueeState.startY)
        if (width < 4 || height < 4) return
        const selectedIds = propsRef.current.elements
            .filter((element) => {
                const focus = getDirectorStageFocusPoint(element)
                const projected = new THREE.Vector3(focus.x, focus.y, focus.z).project(perspectiveCamera)
                if (projected.z < -1 || projected.z > 1) return false
                const screenX = (projected.x * 0.5 + 0.5) * bounds.width
                const screenY = (-projected.y * 0.5 + 0.5) * bounds.height
                return (
                    screenX >= left
                    && screenX <= left + width
                    && screenY >= top
                    && screenY <= top + height
                )
            })
            .map(element => element.id)
        propsRef.current.onSelectElements(selectedIds, { additive: marqueeState.additive })
    }, [])

    const handlePointerMove = useCallback((event: PointerEvent) => {
        if (marqueeStateRef.current) {
            const renderer = rendererRef.current
            if (!renderer) return
            const rect = renderer.domElement.getBoundingClientRect()
            const nextMarquee = {
                ...marqueeStateRef.current,
                currentX: THREE.MathUtils.clamp(event.clientX - rect.left, 0, rect.width),
                currentY: THREE.MathUtils.clamp(event.clientY - rect.top, 0, rect.height),
            }
            marqueeStateRef.current = nextMarquee
            setMarqueeRect({
                left: Math.min(nextMarquee.startX, nextMarquee.currentX),
                top: Math.min(nextMarquee.startY, nextMarquee.currentY),
                width: Math.abs(nextMarquee.currentX - nextMarquee.startX),
                height: Math.abs(nextMarquee.currentY - nextMarquee.startY),
            })
            return
        }
        const dragState = dragStateRef.current
        const renderer = rendererRef.current
        const perspectiveCamera = cameraRef.current
        if (!dragState || !renderer || !perspectiveCamera) return

        const rect = renderer.domElement.getBoundingClientRect()
        pointerRef.current.copy(normalizePointer(event, rect))
        raycasterRef.current.setFromCamera(pointerRef.current, perspectiveCamera)
        const { elements: nextElements, cameras: nextCameras } = propsRef.current

        if (dragState.mode === 'element-y') {
            const nextValue = THREE.MathUtils.clamp(
                (dragState.startValue || 0) - (event.clientY - (dragState.startClientY || 0)) * 0.02,
                -4,
                4,
            )
            propsRef.current.onMoveElementY(dragState.id, Math.round(nextValue * 10) / 10)
            return
        }

        const planeY =
            dragState.mode === 'camera'
                ? getCameraById(nextCameras, dragState.id)?.y ?? dragState.planeY ?? 0
                : dragState.mode === 'camera-target'
                    ? getCameraById(nextCameras, dragState.id)?.targetY ?? dragState.planeY ?? 0
                    : getElementById(nextElements, dragState.id)?.y ?? dragState.planeY ?? 0

        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeY)
        const hitPoint = new THREE.Vector3()
        if (!raycasterRef.current.ray.intersectPlane(plane, hitPoint)) return

        if (dragState.mode === 'element-move') {
            const nextX = Math.round((hitPoint.x + (dragState.offsetX || 0)) * 10) / 10
            const nextZ = Math.round((hitPoint.z + (dragState.offsetZ || 0)) * 10) / 10
            propsRef.current.onMoveElement(dragState.id, nextX, nextZ)
            return
        }

        if (dragState.mode === 'camera') {
            const nextX = Math.round((hitPoint.x + (dragState.offsetX || 0)) * 10) / 10
            const nextZ = Math.round((hitPoint.z + (dragState.offsetZ || 0)) * 10) / 10
            propsRef.current.onMoveCamera(dragState.id, nextX, nextZ)
            return
        }

        if (dragState.mode === 'camera-target') {
            const nextX = Math.round((hitPoint.x + (dragState.offsetX || 0)) * 10) / 10
            const nextZ = Math.round((hitPoint.z + (dragState.offsetZ || 0)) * 10) / 10
            propsRef.current.onMoveCameraTarget(dragState.id, nextX, nextZ)
            return
        }

        if (dragState.mode === 'element-rotate') {
            const element = getElementById(nextElements, dragState.id)
            if (!element) return
            const angle = THREE.MathUtils.radToDeg(Math.atan2(hitPoint.x - element.x, hitPoint.z - element.z))
            propsRef.current.onRotateElement(
                dragState.id,
                normalizeDirectorStageRotation(angle + (dragState.angleOffset || 0)),
            )
        }
    }, [])

    const handlePointerUp = useCallback((event?: PointerEvent) => {
        const controls = controlsRef.current
        const renderer = rendererRef.current
        if (marqueeStateRef.current) {
            commitMarqueeSelection(marqueeStateRef.current)
            marqueeStateRef.current = null
            setMarqueeRect(null)
        }
        dragStateRef.current = null
        if (renderer && event && renderer.domElement.hasPointerCapture?.(event.pointerId)) {
            try {
                renderer.domElement.releasePointerCapture(event.pointerId)
            } catch {
                // ignore release failure
            }
        }
        if (controls && propsRef.current.viewportMode === 'director') {
            controls.enabled = true
        }
    }, [commitMarqueeSelection])

    const handlePointerDown = useCallback((event: PointerEvent) => {
        const renderer = rendererRef.current
        const perspectiveCamera = cameraRef.current
        const controls = controlsRef.current
        if (!renderer || !perspectiveCamera) return
        if (propsRef.current.interactionSuspended) return
        const isCameraPreview = propsRef.current.viewportMode === 'camera'
        const interactionsLocked = Boolean(propsRef.current.interactionLocked)
        const additiveSelection = event.shiftKey || event.ctrlKey || event.metaKey

        const rect = renderer.domElement.getBoundingClientRect()
        pointerRef.current.copy(normalizePointer(event, rect))
        raycasterRef.current.setFromCamera(pointerRef.current, perspectiveCamera)

        const intersections = raycasterRef.current.intersectObjects(interactiveObjectsRef.current, true)
        const hit = intersections.find((entry) => Boolean(entry.object.userData.stageHandleType || entry.object.userData.elementId || entry.object.userData.cameraId))
        if (!hit) {
            if (!interactionsLocked && !isCameraPreview && event.shiftKey && event.button === 0) {
                if (controls) controls.enabled = false
                const startX = THREE.MathUtils.clamp(event.clientX - rect.left, 0, rect.width)
                const startY = THREE.MathUtils.clamp(event.clientY - rect.top, 0, rect.height)
                marqueeStateRef.current = {
                    additive: event.ctrlKey || event.metaKey,
                    currentX: startX,
                    currentY: startY,
                    startX,
                    startY,
                }
                setMarqueeRect({ left: startX, top: startY, width: 0, height: 0 })
                renderer.domElement.setPointerCapture?.(event.pointerId)
                event.preventDefault()
                event.stopPropagation()
            }
            return
        }

        const object = hit.object
        const stageHandleType = object.userData.stageHandleType as DragMode | undefined
        const elementId = object.userData.elementId as string | undefined
        const cameraId = object.userData.cameraId as string | undefined
        const hitElement = elementId ? getElementById(propsRef.current.elements, elementId) : undefined
        const hitCamera = cameraId ? getCameraById(propsRef.current.cameras, cameraId) : undefined
        const hitLocked = Boolean(hitElement?.locked || hitCamera?.locked)

        if (stageHandleType && controls && !isCameraPreview && !hitLocked && !interactionsLocked) {
            controls.enabled = false
        }

        if (stageHandleType === 'element-move' && elementId) {
            const element = hitElement
            if (!element) return
            if (element.locked || interactionsLocked) {
                propsRef.current.onSelectElement(elementId, { additive: additiveSelection, toggle: additiveSelection })
                propsRef.current.onSelectCamera(null)
                event.preventDefault()
                event.stopPropagation()
                return
            }
            const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -element.y)
            const point = new THREE.Vector3()
            if (raycasterRef.current.ray.intersectPlane(plane, point)) {
                dragStateRef.current = {
                    mode: 'element-move',
                    id: elementId,
                    planeY: element.y,
                    offsetX: element.x - point.x,
                    offsetZ: element.z - point.z,
                }
            }
            propsRef.current.onSelectElement(elementId, { additive: additiveSelection, toggle: additiveSelection })
            propsRef.current.onSelectCamera(null)
            renderer.domElement.setPointerCapture?.(event.pointerId)
            event.preventDefault()
            event.stopPropagation()
            return
        }

        if (stageHandleType === 'element-y' && elementId) {
            const element = hitElement
            if (!element) return
            if (element.locked || interactionsLocked) {
                propsRef.current.onSelectElement(elementId, { additive: additiveSelection, toggle: additiveSelection })
                propsRef.current.onSelectCamera(null)
                event.preventDefault()
                event.stopPropagation()
                return
            }
            dragStateRef.current = {
                mode: 'element-y',
                id: elementId,
                startClientY: event.clientY,
                startValue: element.y,
            }
            propsRef.current.onSelectElement(elementId, { additive: additiveSelection, toggle: additiveSelection })
            propsRef.current.onSelectCamera(null)
            renderer.domElement.setPointerCapture?.(event.pointerId)
            event.preventDefault()
            event.stopPropagation()
            return
        }

        if (stageHandleType === 'element-rotate' && elementId) {
            const element = hitElement
            if (!element) return
            if (element.locked || interactionsLocked) {
                propsRef.current.onSelectElement(elementId, { additive: additiveSelection, toggle: additiveSelection })
                propsRef.current.onSelectCamera(null)
                event.preventDefault()
                event.stopPropagation()
                return
            }
            const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -element.y)
            const point = new THREE.Vector3()
            if (raycasterRef.current.ray.intersectPlane(plane, point)) {
                const currentAngle = THREE.MathUtils.radToDeg(Math.atan2(point.x - element.x, point.z - element.z))
                dragStateRef.current = {
                    mode: 'element-rotate',
                    id: elementId,
                    planeY: element.y,
                    angleOffset: element.rotationY - currentAngle,
                }
            }
            propsRef.current.onSelectElement(elementId, { additive: additiveSelection, toggle: additiveSelection })
            propsRef.current.onSelectCamera(null)
            renderer.domElement.setPointerCapture?.(event.pointerId)
            event.preventDefault()
            event.stopPropagation()
            return
        }

        if (stageHandleType === 'camera' && cameraId) {
            if (isCameraPreview) return
            const stageCamera = hitCamera
            if (!stageCamera) return
            if (stageCamera.locked || interactionsLocked) {
                propsRef.current.onSelectElement(null)
                propsRef.current.onSelectCamera(cameraId)
                event.preventDefault()
                event.stopPropagation()
                return
            }
            const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -stageCamera.y)
            const point = new THREE.Vector3()
            if (raycasterRef.current.ray.intersectPlane(plane, point)) {
                dragStateRef.current = {
                    mode: 'camera',
                    id: cameraId,
                    planeY: stageCamera.y,
                    offsetX: stageCamera.x - point.x,
                    offsetZ: stageCamera.z - point.z,
                }
            }
            propsRef.current.onSelectElement(null)
            propsRef.current.onSelectCamera(cameraId)
            renderer.domElement.setPointerCapture?.(event.pointerId)
            event.preventDefault()
            event.stopPropagation()
            return
        }

        if (stageHandleType === 'camera-target' && cameraId) {
            if (isCameraPreview) return
            const stageCamera = hitCamera
            if (!stageCamera) return
            if (stageCamera.locked || interactionsLocked) {
                propsRef.current.onSelectElement(null)
                propsRef.current.onSelectCamera(cameraId)
                event.preventDefault()
                event.stopPropagation()
                return
            }
            const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -stageCamera.targetY)
            const point = new THREE.Vector3()
            if (raycasterRef.current.ray.intersectPlane(plane, point)) {
                dragStateRef.current = {
                    mode: 'camera-target',
                    id: cameraId,
                    planeY: stageCamera.targetY,
                    offsetX: stageCamera.targetX - point.x,
                    offsetZ: stageCamera.targetZ - point.z,
                }
            }
            propsRef.current.onSelectElement(null)
            propsRef.current.onSelectCamera(cameraId)
            renderer.domElement.setPointerCapture?.(event.pointerId)
            event.preventDefault()
            event.stopPropagation()
            return
        }

        if (elementId) {
            const element = hitElement
            if (element) {
                if (!element.locked && !interactionsLocked) {
                    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -element.y)
                    const point = new THREE.Vector3()
                    if (raycasterRef.current.ray.intersectPlane(plane, point)) {
                        dragStateRef.current = {
                            mode: 'element-move',
                            id: elementId,
                            planeY: element.y,
                            offsetX: element.x - point.x,
                            offsetZ: element.z - point.z,
                        }
                        renderer.domElement.setPointerCapture?.(event.pointerId)
                    }
                }
            }
            propsRef.current.onSelectElement(elementId, { additive: additiveSelection, toggle: additiveSelection })
            propsRef.current.onSelectCamera(null)
            event.preventDefault()
            event.stopPropagation()
            return
        }

        if (cameraId) {
            propsRef.current.onSelectElement(null)
            propsRef.current.onSelectCamera(cameraId)
            event.preventDefault()
            event.stopPropagation()
        }
    }, [])

    useImperativeHandle(ref, () => ({
        captureImage: async (options) => {
            const renderer = rendererRef.current
            const perspectiveCamera = cameraRef.current
            const host = hostRef.current
            if (!renderer || !perspectiveCamera || !host || !sceneRef.current) return null
            const width = Math.max(1, Math.round(host.clientWidth))
            const height = Math.max(1, Math.round(host.clientHeight))
            const scale = Math.max(1, options?.scale || 1)
            const previousSize = renderer.getSize(new THREE.Vector2())
            const previousAspect = perspectiveCamera.aspect

            renderer.setSize(width * scale, height * scale, false)
            renderer.setViewport(0, 0, width * scale, height * scale)
            perspectiveCamera.aspect = width / height
            perspectiveCamera.updateProjectionMatrix()
            renderer.render(sceneRef.current, perspectiveCamera)
            const snapshot = renderer.domElement.toDataURL('image/png')

            renderer.setSize(previousSize.x, previousSize.y, false)
            renderer.setViewport(0, 0, previousSize.x, previousSize.y)
            perspectiveCamera.aspect = previousAspect
            perspectiveCamera.updateProjectionMatrix()
            requestRender()
            return cropToFrame(snapshot, options?.frame || 'none')
        },
        captureShotSet: async (options) => {
            const renderer = rendererRef.current
            const perspectiveCamera = cameraRef.current
            const host = hostRef.current
            const scene = sceneRef.current
            if (!renderer || !perspectiveCamera || !host || !scene) return []
            const width = Math.max(1, Math.round(host.clientWidth))
            const height = Math.max(1, Math.round(host.clientHeight))
            const scale = Math.max(1, options.scale || 1)
            const previousSize = renderer.getSize(new THREE.Vector2())
            const previousAspect = perspectiveCamera.aspect
            const previousPosition = perspectiveCamera.position.clone()
            const previousQuaternion = perspectiveCamera.quaternion.clone()
            const previousFov = perspectiveCamera.fov
            const previousCamerasVisibility = camerasGroupRef.current?.visible ?? true
            const previousTargetsVisibility = targetsGroupRef.current?.visible ?? true
            const previousHandlesVisibility = handlesGroupRef.current?.visible ?? true
            const previousFocusVisibility = focusGroupRef.current?.visible ?? true

            if (camerasGroupRef.current) camerasGroupRef.current.visible = false
            if (targetsGroupRef.current) targetsGroupRef.current.visible = false
            if (handlesGroupRef.current) handlesGroupRef.current.visible = false
            if (focusGroupRef.current) focusGroupRef.current.visible = false

            renderer.setSize(width * scale, height * scale, false)
            renderer.setViewport(0, 0, width * scale, height * scale)
            perspectiveCamera.aspect = width / height
            perspectiveCamera.updateProjectionMatrix()

            const results: Array<{ cameraId: string; cameraName: string; dataUrl: string }> = []
            for (const stageCamera of options.cameras) {
                perspectiveCamera.position.set(stageCamera.x, stageCamera.y, stageCamera.z)
                perspectiveCamera.fov = stageCamera.fov
                perspectiveCamera.updateProjectionMatrix()
                perspectiveCamera.lookAt(stageCamera.targetX, stageCamera.targetY, stageCamera.targetZ)
                renderer.render(scene, perspectiveCamera)
                const snapshot = renderer.domElement.toDataURL('image/png')
                results.push({
                    cameraId: stageCamera.id,
                    cameraName: stageCamera.name,
                    dataUrl: await cropToFrame(snapshot, options.frame || 'none'),
                })
            }

            perspectiveCamera.position.copy(previousPosition)
            perspectiveCamera.quaternion.copy(previousQuaternion)
            perspectiveCamera.fov = previousFov
            perspectiveCamera.aspect = previousAspect
            perspectiveCamera.updateProjectionMatrix()
            renderer.setSize(previousSize.x, previousSize.y, false)
            renderer.setViewport(0, 0, previousSize.x, previousSize.y)
            if (camerasGroupRef.current) camerasGroupRef.current.visible = previousCamerasVisibility
            if (targetsGroupRef.current) targetsGroupRef.current.visible = previousTargetsVisibility
            if (handlesGroupRef.current) handlesGroupRef.current.visible = previousHandlesVisibility
            if (focusGroupRef.current) focusGroupRef.current.visible = previousFocusVisibility
            requestRender()
            return results
        },
        resetView: () => {
            applyOrbitWithoutFeedback(propsRef.current.orbit)
            requestRender()
        },
        fitScene: () => {
            applyOrbitWithoutFeedback(propsRef.current.orbit)
            requestRender()
        },
    }), [applyOrbitWithoutFeedback, requestRender])

    useEffect(() => {
        const host = hostRef.current
        if (!host) return
        // jsdom / 测试环境下跳过 WebGL 初始化（getContext 在 jsdom 中会抛异常或返回 null）
        try {
            const testCanvas = document.createElement('canvas')
            const ctx = testCanvas.getContext('webgl') || testCanvas.getContext('webgl2')
            if (!ctx) return
        } catch {
            return
        }

        const scene = new THREE.Scene()
        sceneRef.current = scene

        const perspectiveCamera = new THREE.PerspectiveCamera(CAMERA_MODE_FOV, 1, 0.1, 1000)
        perspectiveCamera.position.set(0, 3.2, 8.8)
        cameraRef.current = perspectiveCamera

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            preserveDrawingBuffer: true,
        })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.setClearColor(VIEWPORT_COLORS.bgTop)
        renderer.domElement.style.position = 'absolute'
        renderer.domElement.style.inset = '0'
        renderer.domElement.style.display = 'block'
        renderer.domElement.style.width = '100%'
        renderer.domElement.style.height = '100%'
        host.appendChild(renderer.domElement)
        rendererRef.current = renderer

        const controls = new OrbitControls(perspectiveCamera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.08
        controls.enablePan = true
        controls.screenSpacePanning = false
        controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE
        controls.mouseButtons.RIGHT = THREE.MOUSE.PAN
        controls.minDistance = 1
        controls.maxDistance = 32
        controls.target.set(orbit.targetX, orbit.targetY, orbit.targetZ)
        controls.addEventListener('change', () => {
            if (suppressOrbitSyncRef.current || propsRef.current.viewportMode !== 'director') return
            requestRender()
            scheduleOrbitSync()
        })
        controls.addEventListener('end', () => {
            if (suppressOrbitSyncRef.current || propsRef.current.viewportMode !== 'director') return
            flushOrbitSync()
        })
        controlsRef.current = controls

        const ambient = new THREE.AmbientLight('#ffffff', 1.6)
        scene.add(ambient)

        const keyLight = new THREE.DirectionalLight('#ffffff', 1.15)
        keyLight.position.set(10, 10, 5)
        scene.add(keyLight)

        const fillLight = new THREE.DirectionalLight('#9ad1ff', 0.45)
        fillLight.position.set(-5, 5, -5)
        scene.add(fillLight)

        const pointLight = new THREE.PointLight('#67e8f9', 0.45, 30)
        pointLight.position.set(0, 3, 8)
        scene.add(pointLight)

        const sphereGeometry = new THREE.SphereGeometry(42, 80, 50)
        sphereGeometry.scale(-1, 1, 1)
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(backgroundColor) })
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
        scene.add(sphere)
        backgroundSphereRef.current = sphere

        const groundPlanGeometry = new THREE.PlaneGeometry(1, 1)
        const groundPlanMaterial = new THREE.MeshBasicMaterial({
            color: '#ffffff',
            transparent: true,
            opacity: 0.82,
            depthWrite: false,
            side: THREE.DoubleSide,
        })
        const groundPlanPlane = new THREE.Mesh(groundPlanGeometry, groundPlanMaterial)
        groundPlanPlane.rotation.x = -Math.PI / 2
        groundPlanPlane.position.y = 0.015
        groundPlanPlane.visible = false
        scene.add(groundPlanPlane)
        groundPlanPlaneRef.current = groundPlanPlane

        // V2: 双网格（次网格 1m 间距 + 主网格 5m 间距）替代 V1 单一网格
        const gridMinor = new THREE.GridHelper(80, 80, VIEWPORT_COLORS.gridMinor, VIEWPORT_COLORS.gridMinor)
        ;(gridMinor.material as THREE.Material).opacity = VIEWPORT_OPACITIES.gridMinor
        ;(gridMinor.material as THREE.Material).transparent = true
        gridMinor.position.y = 0
        scene.add(gridMinor)
        gridMinorRef.current = gridMinor

        const gridMajor = new THREE.GridHelper(80, 16, VIEWPORT_COLORS.gridMajor, VIEWPORT_COLORS.gridMajor)
        ;(gridMajor.material as THREE.Material).opacity = VIEWPORT_OPACITIES.gridMajor
        ;(gridMajor.material as THREE.Material).transparent = true
        gridMajor.position.y = 0.001 // 避免 z-fighting
        scene.add(gridMajor)

        // gridRef 指向主网格（用于 showGrid 切换可见性）
        const grid = gridMajor
        gridRef.current = grid

        // V2: 三轴线提示（X=玫瑰红, Z=蓝, Y=绿）
        const axisGeom = (color: number, dir: [number, number, number]) => {
            const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(dir[0] * 10, dir[1] * 10, dir[2] * 10)]
            const geo = new THREE.BufferGeometry().setFromPoints(points)
            const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 })
            return new THREE.Line(geo, mat)
        }
        scene.add(axisGeom(VIEWPORT_COLORS.axisX, [1, 0, 0]))
        scene.add(axisGeom(VIEWPORT_COLORS.axisZ, [0, 0, 1]))
        scene.add(axisGeom(VIEWPORT_COLORS.axisY, [0, 1, 0]))

        const elementsGroup = new THREE.Group()
        const camerasGroup = new THREE.Group()
        const targetsGroup = new THREE.Group()
        const handlesGroup = new THREE.Group()
        const pathsGroup = new THREE.Group()
        const focusGroup = new THREE.Group()
        scene.add(elementsGroup, camerasGroup, targetsGroup, handlesGroup, pathsGroup, focusGroup)
        elementsGroupRef.current = elementsGroup
        camerasGroupRef.current = camerasGroup
        targetsGroupRef.current = targetsGroup
        handlesGroupRef.current = handlesGroup
        pathsGroupRef.current = pathsGroup
        focusGroupRef.current = focusGroup

        const animate = () => {
            animationFrameRef.current = window.requestAnimationFrame(animate)
            if (propsRef.current.interactionSuspended) return
            controls.update()
            if (!needsRenderRef.current) return
            needsRenderRef.current = false
            renderer.render(scene, perspectiveCamera)
        }
        animate()

        renderer.domElement.addEventListener('pointerdown', handlePointerDown, true)
        renderer.domElement.addEventListener('pointermove', handlePointerMove, true)
        renderer.domElement.addEventListener('pointerup', handlePointerUp, true)
        renderer.domElement.addEventListener('pointerleave', handlePointerUp, true)

        resizeObserverRef.current = new ResizeObserver(() => {
            resizeViewport()
        })
        resizeObserverRef.current.observe(host)

        resizeViewport()
        void syncBackground()
        void syncGroundPlan()
        rebuildStage()
        requestRender()

        return () => {
            renderer.domElement.removeEventListener('pointerdown', handlePointerDown, true)
            renderer.domElement.removeEventListener('pointermove', handlePointerMove, true)
            renderer.domElement.removeEventListener('pointerup', handlePointerUp, true)
            renderer.domElement.removeEventListener('pointerleave', handlePointerUp, true)
            resizeObserverRef.current?.disconnect()
            resizeObserverRef.current = null
            if (animationFrameRef.current !== null) {
                window.cancelAnimationFrame(animationFrameRef.current)
                animationFrameRef.current = null
            }
            if (orbitSyncTimerRef.current) {
                clearTimeout(orbitSyncTimerRef.current)
                orbitSyncTimerRef.current = null
            }
            controls.dispose()
            clearGroup(elementsGroupRef.current)
            clearGroup(camerasGroupRef.current)
            clearGroup(targetsGroupRef.current)
            clearGroup(handlesGroupRef.current)
            clearGroup(pathsGroupRef.current)
            clearGroup(focusGroupRef.current)
            if (backgroundTextureRef.current) {
                backgroundTextureRef.current.dispose()
                backgroundTextureRef.current = null
            }
            if (groundPlanTextureRef.current) {
                groundPlanTextureRef.current.dispose()
                groundPlanTextureRef.current = null
            }
            groundPlanGeometry.dispose()
            groundPlanMaterial.dispose()
            sphereGeometry.dispose()
            sphereMaterial.dispose()
            renderer.dispose()
            renderer.forceContextLoss()
            if (renderer.domElement.parentElement === host) {
                host.removeChild(renderer.domElement)
            }
        }
    }, [flushOrbitSync, handlePointerDown, handlePointerMove, handlePointerUp, rebuildStage, requestRender, resizeViewport, scheduleOrbitSync, syncBackground, syncGroundPlan])

    useEffect(() => {
        void syncBackground()
    }, [backgroundColor, backgroundSrc, syncBackground])

    useEffect(() => {
        void syncGroundPlan()
    }, [
        groundPlanOffsetX,
        groundPlanOffsetZ,
        groundPlanOpacity,
        groundPlanRotation,
        groundPlanScale,
        groundPlanSrc,
        showGroundPlan,
        syncGroundPlan,
    ])

    useEffect(() => {
        rebuildStage()
    }, [
        elements,
        cameras,
        selectedElementId,
        selectedElementIds,
        selectedCrowdGroupId,
        activeCameraId,
        viewportMode,
        showGrid,
        showCameras,
        showTargets,
        showElementNumbers,
        showPaths,
        rebuildStage,
    ])

    useEffect(() => {
        clearGroup(focusGroupRef.current)
        if (viewportMode === 'director' && showFocus) {
            focusGroupRef.current?.add(createFocusMarker(orbit))
        }
        const perspectiveCamera = cameraRef.current
        const controls = controlsRef.current
        if (!perspectiveCamera || !controls) return
        const activeStageCamera = getCameraById(cameras, activeCameraId)
        if (viewportMode === 'camera' && activeStageCamera) {
            controls.enabled = false
            perspectiveCamera.position.set(activeStageCamera.x, activeStageCamera.y, activeStageCamera.z)
            perspectiveCamera.fov = activeStageCamera.fov
            perspectiveCamera.updateProjectionMatrix()
            perspectiveCamera.lookAt(activeStageCamera.targetX, activeStageCamera.targetY, activeStageCamera.targetZ)
        } else {
            controls.enabled = true
            applyOrbitWithoutFeedback(orbit)
        }
        requestRender()
    }, [activeCameraId, applyOrbitWithoutFeedback, cameras, orbit, requestRender, showFocus, viewportMode])

    useEffect(() => {
        const controls = controlsRef.current
        if (controls) {
            controls.enabled = !interactionSuspended && viewportMode === 'director'
        }
        if (!interactionSuspended) {
            requestRender()
        }
    }, [interactionSuspended, requestRender, viewportMode])

    useEffect(() => {
        requestRender()
    }, [requestRender])

    return (
        <div ref={hostRef} className="absolute inset-0 overflow-hidden rounded-[26px] bg-transparent">
            {marqueeRect ? (
                <div
                    className="pointer-events-none absolute z-10 border border-cyan-300/80 bg-cyan-300/10 shadow-[0_0_0_1px_rgba(103,232,249,0.2)]"
                    style={{
                        left: marqueeRect.left,
                        top: marqueeRect.top,
                        width: marqueeRect.width,
                        height: marqueeRect.height,
                    }}
                />
            ) : null}
        </div>
    )
})
