export type DirectorStageViewportMode = 'director' | 'camera'

export type DirectorStageFrame = 'none' | '16:9' | '2.35:1' | '9:16'

export type DirectorStagePose =
    | 'idle'
    | 'walk'
    | 'talk'
    | 'point'
    | 'guard'
    | 'crouch'
    | 'sit'
    | 'lay'
    | 'kneel'
    | 'prone'
    | 'crawl'

export type DirectorStageMannequinStyle = 'balanced' | 'slim' | 'bold'
export type DirectorStageLookAtMode = 'manual' | 'active-camera' | 'camera' | 'element' | 'point'

export type DirectorStageShotType =
    | 'master'
    | 'wide'
    | 'medium'
    | 'closeup'
    | 'over-shoulder'
    | 'insert'
    | 'top'

export type DirectorStageShotPriority = 'primary' | 'support' | 'pickup'

export type DirectorStageCameraTemplate = 'interview' | 'dialogue' | 'livestream' | 'product'

export interface DirectorStageJoints {
    pelvisHeight: number
    pelvisPitch: number
    torsoPitch: number
    headPitch: number
    leftHipPitch: number
    rightHipPitch: number
    leftArmLift: number
    leftArmBend: number
    rightArmLift: number
    rightArmBend: number
    leftLegStep: number
    leftKneeBend: number
    rightLegStep: number
    rightKneeBend: number
}

export interface DirectorStagePathPoint {
    id: string
    x: number
    y: number
    z: number
}

export interface DirectorStageMotionPath {
    loop?: boolean
    points: DirectorStagePathPoint[]
}

export interface DirectorStageCrowdElement {
    id: string
    kind: 'crowd'
    crowdGroupId?: string
    groupId?: string
    name: string
    locked?: boolean
    x: number
    y: number
    z: number
    rotationY: number
    scale: number
    color: string
    pose: DirectorStagePose
    lookAtMode?: DirectorStageLookAtMode
    lookAtCameraId?: string
    lookAtElementId?: string
    lookAtPointX?: number
    lookAtPointY?: number
    lookAtPointZ?: number
    motionPath?: DirectorStageMotionPath
}

export interface DirectorStageAdvancedElement {
    id: string
    kind: 'advanced'
    groupId?: string
    name: string
    locked?: boolean
    x: number
    y: number
    z: number
    rotationY: number
    scale: number
    color: string
    pose: DirectorStagePose
    mannequinStyle: DirectorStageMannequinStyle
    showControlBlock: boolean
    joints: DirectorStageJoints
    lookAtMode?: DirectorStageLookAtMode
    lookAtCameraId?: string
    lookAtElementId?: string
    lookAtPointX?: number
    lookAtPointY?: number
    lookAtPointZ?: number
    motionPath?: DirectorStageMotionPath
}

export type DirectorStageElement = DirectorStageCrowdElement | DirectorStageAdvancedElement

export interface DirectorStageCamera {
    id: string
    name: string
    locked?: boolean
    x: number
    y: number
    z: number
    targetX: number
    targetY: number
    targetZ: number
    fov: number
    frame: DirectorStageFrame
    targetElementId?: string
    shotType?: DirectorStageShotType
    priority?: DirectorStageShotPriority
    usage?: string
    notes?: string
    durationSeconds?: number
    templateId?: DirectorStageCameraTemplate
    motionPath?: DirectorStageMotionPath
}

export interface DirectorStageOrbit {
    yaw: number
    pitch: number
    distance: number
    targetX: number
    targetY: number
    targetZ: number
}

export interface DirectorStageConnectedSource {
    nodeId: string
    label: string
    previewLabel: string
    rawSource: string
}

export interface DirectorStageNodeSettings {
    displayName?: string
    director3dBackground?: string
    director3dBackgroundName?: string
    director3dBackgroundSourceNodeId?: string
    director3dBackgroundColor?: string
    director3dGroundPlan?: string
    director3dGroundPlanName?: string
    director3dGroundPlanOpacity?: number
    director3dGroundPlanScale?: number
    director3dGroundPlanRotation?: number
    director3dGroundPlanOffsetX?: number
    director3dGroundPlanOffsetZ?: number
    director3dShowGroundPlan?: boolean
    director3dElements?: DirectorStageElement[]
    director3dCameras?: DirectorStageCamera[]
    director3dSelectedElementId?: string
    director3dSelectedElementIds?: string[]
    director3dActiveCameraId?: string
    director3dViewportMode?: DirectorStageViewportMode
    director3dFrame?: DirectorStageFrame
    director3dOrbitYaw?: number
    director3dOrbitPitch?: number
    director3dOrbitDistance?: number
    director3dOrbitTargetX?: number
    director3dOrbitTargetY?: number
    director3dOrbitTargetZ?: number
    director3dShowCameras?: boolean
    director3dShowGrid?: boolean
    director3dShowTargets?: boolean
    director3dShowFocus?: boolean
    director3dShowFrameGuides?: boolean
    director3dShowElementNumbers?: boolean
    director3dShowPaths?: boolean
    director3dPathPreviewEnabled?: boolean
    director3dPathPreviewPlaying?: boolean
    director3dPathPreviewProgress?: number
    director3dCompositionSafeArea?: boolean
    director3dCompositionCenterCross?: boolean
    director3dCompositionHeadroom?: boolean
    director3dCompositionEyeline?: boolean
}

export interface DirectorStageNodeLike {
    id: string
    type: string
    content?: unknown
    settings?: Record<string, any>
}

export const DIRECTOR_STAGE_DEFAULT_BACKGROUND_COLOR = '#10172a'

export const DIRECTOR_STAGE_BACKGROUND_COLORS = [
    { label: '深蓝', color: '#10172a' },
    { label: '石墨', color: '#151922' },
    { label: '青灰', color: '#16222c' },
    { label: '墨绿', color: '#11201d' },
    { label: '暖棕', color: '#2a1f1a' },
    { label: '酒红', color: '#2a1820' },
    { label: '雾白', color: '#d7dee8' },
    { label: '米杏', color: '#efe7dd' },
    { label: '纯白', color: '#ffffff' },
] as const

export const DIRECTOR_STAGE_COLOR_SWATCHES = [
    { key: 'slate', label: 'Slate', color: '#7d8ca3' },
    { key: 'teal', label: 'Teal', color: '#4fa8a1' },
    { key: 'sand', label: 'Sand', color: '#c8a97e' },
    { key: 'clay', label: 'Clay', color: '#b86d57' },
    { key: 'coral', label: 'Coral', color: '#d4837c' },
    { key: 'sage', label: 'Sage', color: '#8ea57c' },
    { key: 'steel', label: 'Steel', color: '#6f879f' },
    { key: 'plum', label: 'Plum', color: '#8d7398' },
] as const

export const DIRECTOR_STAGE_POSE_OPTIONS: Array<{ key: DirectorStagePose | 'neutral'; label: string }> = [
    { key: 'neutral', label: '中性站姿' },
    { key: 'walk', label: '行走' },
    { key: 'talk', label: '对话' },
    { key: 'point', label: '指向' },
    { key: 'guard', label: '戒备' },
    { key: 'crouch', label: '半蹲' },
    { key: 'sit', label: '坐姿' },
    { key: 'lay', label: '躺下' },
    { key: 'kneel', label: '跪姿' },
    { key: 'prone', label: '趴姿' },
    { key: 'crawl', label: '匍匐' },
]

export const DIRECTOR_STAGE_MANNEQUIN_STYLES: Array<{ key: DirectorStageMannequinStyle; label: string }> = [
    { key: 'balanced', label: '标准体块' },
    { key: 'slim', label: '修身体块' },
    { key: 'bold', label: '强化体块' },
]

export const DIRECTOR_STAGE_FRAME_OPTIONS: Array<{ key: DirectorStageFrame; label: string }> = [
    { key: 'none', label: '无' },
    { key: '16:9', label: '16:9' },
    { key: '2.35:1', label: '2.35:1' },
    { key: '9:16', label: '9:16' },
]

export const DIRECTOR_STAGE_SHOT_TYPE_OPTIONS: Array<{ key: DirectorStageShotType; label: string }> = [
    { key: 'master', label: '主镜头' },
    { key: 'wide', label: '大全景' },
    { key: 'medium', label: '中景' },
    { key: 'closeup', label: '近景' },
    { key: 'over-shoulder', label: '过肩' },
    { key: 'insert', label: '特写插入' },
    { key: 'top', label: '俯拍' },
]

export const DIRECTOR_STAGE_SHOT_PRIORITY_OPTIONS: Array<{ key: DirectorStageShotPriority; label: string }> = [
    { key: 'primary', label: '主用' },
    { key: 'support', label: '辅助' },
    { key: 'pickup', label: '补位' },
]

export const DIRECTOR_STAGE_CAMERA_TEMPLATE_OPTIONS: Array<{ key: DirectorStageCameraTemplate; label: string; description: string }> = [
    { key: 'interview', label: '单人采访', description: '自动补一组主镜头、侧脸和近景。' },
    { key: 'dialogue', label: '双人对话', description: '生成双人主镜头和左右反应镜头。' },
    { key: 'livestream', label: '直播机位', description: '生成主画面、左右补位和俯拍。' },
    { key: 'product', label: '产品环拍', description: '生成主展示、45 度和俯视细节镜头。' },
]

export const DIRECTOR_STAGE_DEFAULT_ORBIT: DirectorStageOrbit = {
    yaw: 0.1,
    pitch: 0.24,
    distance: 9,
    targetX: 0,
    targetY: 1.4,
    targetZ: 0,
}

export const DIRECTOR_STAGE_LOOK_AT_OPTIONS: Array<{ key: DirectorStageLookAtMode; label: string }> = [
    { key: 'manual', label: '手动朝向' },
    { key: 'active-camera', label: '当前镜头' },
    { key: 'camera', label: '指定镜头' },
    { key: 'element', label: '指定对象' },
    { key: 'point', label: '自定义点' },
]

export function getDirectorStageCameraName(index: number) {
    const normalized = Math.max(0, index)
    const code = normalized % 26
    const cycle = Math.floor(normalized / 26)
    const base = String.fromCharCode(65 + code)
    return cycle === 0 ? `${base}机位` : `${base}${cycle + 1}机位`
}

export const createDirectorStageDefaultCamera = (): DirectorStageCamera => ({
    id: `director-camera-${Date.now()}`,
    name: getDirectorStageCameraName(0),
    locked: false,
    x: 0,
    y: 1.7,
    z: 6.5,
    targetX: 0,
    targetY: 1.5,
    targetZ: 0,
    fov: 42,
    frame: 'none',
    shotType: 'master',
    priority: 'primary',
    usage: '空间建立镜头',
    notes: '',
    durationSeconds: 8,
})

export const createDirectorStageDefaultSettings = (): DirectorStageNodeSettings => {
    const camera = createDirectorStageDefaultCamera()
    return {
        displayName: '全景环绕控制',
        director3dBackgroundColor: DIRECTOR_STAGE_DEFAULT_BACKGROUND_COLOR,
        director3dGroundPlanOpacity: 0.82,
        director3dGroundPlanScale: 8,
        director3dGroundPlanRotation: 0,
        director3dGroundPlanOffsetX: 0,
        director3dGroundPlanOffsetZ: 0,
        director3dShowGroundPlan: true,
        director3dElements: [],
        director3dCameras: [camera],
        director3dActiveCameraId: camera.id,
        director3dViewportMode: 'director',
        director3dFrame: 'none',
        director3dOrbitYaw: DIRECTOR_STAGE_DEFAULT_ORBIT.yaw,
        director3dOrbitPitch: DIRECTOR_STAGE_DEFAULT_ORBIT.pitch,
        director3dOrbitDistance: DIRECTOR_STAGE_DEFAULT_ORBIT.distance,
        director3dOrbitTargetX: DIRECTOR_STAGE_DEFAULT_ORBIT.targetX,
        director3dOrbitTargetY: DIRECTOR_STAGE_DEFAULT_ORBIT.targetY,
        director3dOrbitTargetZ: DIRECTOR_STAGE_DEFAULT_ORBIT.targetZ,
        director3dShowCameras: true,
        director3dShowGrid: true,
        director3dShowTargets: true,
        director3dShowFocus: true,
        director3dShowFrameGuides: true,
        director3dShowElementNumbers: true,
        director3dShowPaths: true,
        director3dPathPreviewEnabled: false,
        director3dPathPreviewPlaying: false,
        director3dPathPreviewProgress: 0,
        director3dCompositionSafeArea: false,
        director3dCompositionCenterCross: false,
        director3dCompositionHeadroom: false,
        director3dCompositionEyeline: false,
    }
}

export function getDirectorStageJointPreset(pose: DirectorStagePose | 'neutral' = 'point'): DirectorStageJoints {
    const presets: Record<DirectorStagePose | 'neutral', DirectorStageJoints> = {
        neutral: {
            pelvisHeight: 0,
            pelvisPitch: 0,
            headPitch: 0,
            torsoPitch: 0,
            leftHipPitch: 0,
            rightHipPitch: 0,
            leftArmLift: 8,
            leftArmBend: 14,
            rightArmLift: 8,
            rightArmBend: 14,
            leftLegStep: 0,
            leftKneeBend: 6,
            rightLegStep: 0,
            rightKneeBend: 6,
        },
        idle: {
            pelvisHeight: 0,
            pelvisPitch: 0,
            headPitch: 0,
            torsoPitch: 0,
            leftHipPitch: 0,
            rightHipPitch: 0,
            leftArmLift: 8,
            leftArmBend: 14,
            rightArmLift: 8,
            rightArmBend: 14,
            leftLegStep: 0,
            leftKneeBend: 6,
            rightLegStep: 0,
            rightKneeBend: 6,
        },
        walk: {
            pelvisHeight: 0.02,
            pelvisPitch: 4,
            headPitch: 4,
            torsoPitch: 6,
            leftHipPitch: 8,
            rightHipPitch: -6,
            leftArmLift: -28,
            leftArmBend: 20,
            rightArmLift: 28,
            rightArmBend: 18,
            leftLegStep: 24,
            leftKneeBend: 10,
            rightLegStep: -22,
            rightKneeBend: 18,
        },
        talk: {
            pelvisHeight: 0,
            pelvisPitch: 2,
            headPitch: 3,
            torsoPitch: 4,
            leftHipPitch: 4,
            rightHipPitch: 0,
            leftArmLift: 24,
            leftArmBend: 52,
            rightArmLift: 10,
            rightArmBend: 36,
            leftLegStep: 4,
            leftKneeBend: 8,
            rightLegStep: -2,
            rightKneeBend: 8,
        },
        point: {
            pelvisHeight: 0,
            pelvisPitch: 3,
            headPitch: 0,
            torsoPitch: 8,
            leftHipPitch: 4,
            rightHipPitch: -2,
            leftArmLift: 4,
            leftArmBend: 18,
            rightArmLift: 72,
            rightArmBend: 16,
            leftLegStep: 2,
            leftKneeBend: 8,
            rightLegStep: -4,
            rightKneeBend: 8,
        },
        guard: {
            pelvisHeight: -0.04,
            pelvisPitch: 6,
            headPitch: -2,
            torsoPitch: 10,
            leftHipPitch: 12,
            rightHipPitch: 8,
            leftArmLift: 38,
            leftArmBend: 58,
            rightArmLift: 34,
            rightArmBend: 56,
            leftLegStep: 8,
            leftKneeBend: 18,
            rightLegStep: -8,
            rightKneeBend: 18,
        },
        crouch: {
            pelvisHeight: -0.18,
            pelvisPitch: 14,
            headPitch: 6,
            torsoPitch: 18,
            leftHipPitch: 18,
            rightHipPitch: 18,
            leftArmLift: 16,
            leftArmBend: 26,
            rightArmLift: 16,
            rightArmBend: 26,
            leftLegStep: 10,
            leftKneeBend: 44,
            rightLegStep: -10,
            rightKneeBend: 44,
        },
        sit: {
            pelvisHeight: -0.24,
            pelvisPitch: -8,
            headPitch: 4,
            torsoPitch: 6,
            leftHipPitch: -16,
            rightHipPitch: -16,
            leftArmLift: 14,
            leftArmBend: 28,
            rightArmLift: 10,
            rightArmBend: 24,
            leftLegStep: -34,
            leftKneeBend: 92,
            rightLegStep: -32,
            rightKneeBend: 96,
        },
        lay: {
            pelvisHeight: -0.52,
            pelvisPitch: 8,
            headPitch: 18,
            torsoPitch: -84,
            leftHipPitch: -10,
            rightHipPitch: -10,
            leftArmLift: -8,
            leftArmBend: 8,
            rightArmLift: -8,
            rightArmBend: 8,
            leftLegStep: -72,
            leftKneeBend: 10,
            rightLegStep: -68,
            rightKneeBend: 14,
        },
        kneel: {
            pelvisHeight: -0.16,
            pelvisPitch: 4,
            headPitch: 2,
            torsoPitch: 8,
            leftHipPitch: 4,
            rightHipPitch: 2,
            leftArmLift: 18,
            leftArmBend: 24,
            rightArmLift: 14,
            rightArmBend: 22,
            leftLegStep: 4,
            leftKneeBend: 25,
            rightLegStep: -6,
            rightKneeBend: 102,
        },
        prone: {
            pelvisHeight: -0.42,
            pelvisPitch: -4,
            headPitch: -6,
            torsoPitch: 58,
            leftHipPitch: -2,
            rightHipPitch: -2,
            leftArmLift: 88,
            leftArmBend: 38,
            rightArmLift: 84,
            rightArmBend: 36,
            leftLegStep: -6,
            leftKneeBend: 12,
            rightLegStep: 4,
            rightKneeBend: 10,
        },
        crawl: {
            pelvisHeight: -0.44,
            pelvisPitch: -2,
            headPitch: -14,
            torsoPitch: 66,
            leftHipPitch: 12,
            rightHipPitch: -10,
            leftArmLift: 118,
            leftArmBend: 24,
            rightArmLift: 8,
            rightArmBend: 82,
            leftLegStep: 75,
            leftKneeBend: 108,
            rightLegStep: 90,
            rightKneeBend: 18,
        },
    }
    return { ...presets[pose] }
}

export function createDirectorStageCrowdElement(index = 1, crowdGroupId?: string): DirectorStageCrowdElement {
    const angle = (index / 10) * Math.PI * 2
    const radius = 2.2 + (index % 3) * 0.6
    const crowdColors = ['#4f7a9d', '#8c6a46', '#8a5f75', '#5c7a52']
    return {
        id: `director-crowd-${Date.now()}-${index}`,
        kind: 'crowd',
        crowdGroupId,
        name: `路人 ${index}`,
        locked: false,
        x: Math.cos(angle) * radius,
        y: 0,
        z: Math.sin(angle) * radius,
        rotationY: normalizeDirectorStageRotation((-angle + Math.PI) * (180 / Math.PI)),
        scale: 1.08,
        color: crowdColors[index % crowdColors.length],
        pose: 'idle',
        lookAtMode: 'manual',
        motionPath: { points: [] },
    }
}

export function createDirectorStageAdvancedElement(
    index = 1,
    pose: DirectorStagePose = 'point',
    mannequinStyle: DirectorStageMannequinStyle = 'balanced',
    scale = 1.08,
    color = DIRECTOR_STAGE_COLOR_SWATCHES[0].color,
): DirectorStageAdvancedElement {
    return {
        id: `director-advanced-${Date.now()}-${index}`,
        kind: 'advanced',
        name: `主角 ${index}`,
        locked: false,
        x: 0,
        y: 0,
        z: 0,
        rotationY: 180,
        scale,
        color,
        pose,
        mannequinStyle,
        showControlBlock: true,
        joints: getDirectorStageJointPreset(pose === 'idle' ? 'neutral' : pose),
        lookAtMode: 'manual',
        motionPath: { points: [] },
    }
}

export function createDirectorStageShotCamera(index: number): DirectorStageCamera {
    return {
        id: `director-shot-${Date.now()}-${index}`,
        name: getDirectorStageCameraName(index),
        locked: false,
        x: index % 2 === 0 ? -2.8 : 2.8,
        y: 1.7,
        z: 5.8 - index * 0.4,
        targetX: 0,
        targetY: 1.4,
        targetZ: 0,
        fov: 42,
        frame: 'none',
        shotType: index === 0 ? 'master' : 'medium',
        priority: index === 0 ? 'primary' : 'support',
        usage: index === 0 ? '主镜头' : '补位镜头',
        notes: '',
        durationSeconds: index === 0 ? 8 : 6,
        motionPath: { points: [] },
    }
}

export function createDirectorStagePathPoint(x: number, y: number, z: number): DirectorStagePathPoint {
    return {
        id: `director-path-point-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        x,
        y,
        z,
    }
}

export function getDirectorStageFocusPoint(element: DirectorStageElement) {
    const baseHeight = element.kind === 'advanced' ? 1.55 : 1.48
    return {
        x: element.x,
        y: element.y + baseHeight * element.scale,
        z: element.z,
    }
}

export function normalizeDirectorStageRotation(value: number) {
    let next = value % 360
    if (next > 180) next -= 360
    if (next < -180) next += 360
    return next
}

const readSettingString = (settings: Record<string, any>, ...keys: string[]) => {
    for (const key of keys) {
        const value = settings[key]
        if (typeof value === 'string' && value.trim()) return value.trim()
    }
    return ''
}

const readSettingStringArray = (settings: Record<string, any>, ...keys: string[]) => {
    for (const key of keys) {
        const value = settings[key]
        if (Array.isArray(value) && value.length > 0) {
            const items = value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
            if (items.length > 0) return items
        }
    }
    return [] as string[]
}

const readSettingNumber = (settings: Record<string, any>, ...keys: string[]) => {
    for (const key of keys) {
        const value = settings[key]
        if (typeof value === 'number' && Number.isFinite(value)) return value
        if (typeof value === 'string' && value.trim()) {
            const parsed = Number(value)
            if (Number.isFinite(parsed)) return parsed
        }
    }
    return undefined
}

export function resolveDirectorStageImageSource(node: DirectorStageNodeLike): string {
    const settings = node.settings || {}
    if (node.type === 'input-image' && typeof node.content === 'string' && node.content.trim()) {
        return node.content.trim()
    }
    if (node.type === 'preview') {
        return (
            readSettingString(settings, 'selectedPreviewImage')
            || (typeof node.content === 'string' && node.content.trim() ? node.content.trim() : '')
            || readSettingStringArray(settings, 'previewMjImages')[0]
            || ''
        )
    }
    if (node.type === 'panorama-viewer') {
        return readSettingString(settings, 'panoramaImageUrl') || (typeof node.content === 'string' ? node.content.trim() : '')
    }
    if (node.type === 'vr720-gen' || node.type === 'asset-gen') {
        return readSettingString(settings, 'imageUrl') || (typeof node.content === 'string' ? node.content.trim() : '')
    }
    if (
        node.type === 'gen-image'
        || node.type === 'gen-video'
        || node.type === 'character-maker'
        || node.type === 'scene-maker'
        || node.type === 'generate-character-image'
        || node.type === 'generate-scene-image'
    ) {
        return (
            readSettingString(settings, 'imageUrl')
            || readSettingStringArray(settings, 'imageUrls')[0]
            || (typeof node.content === 'string' ? node.content.trim() : '')
        )
    }
    if (node.type === 'single-image-node') {
        const imageUrls = readSettingStringArray(settings, 'image_urls', 'imageUrls')
        const selectedIndex = readSettingNumber(settings, 'selected_image_index', 'selectedImageIndex') || 0
        return (
            readSettingString(settings, 'image_url', 'imageUrl')
            || imageUrls[Math.min(selectedIndex, Math.max(0, imageUrls.length - 1))]
            || (typeof node.content === 'string' ? node.content.trim() : '')
            || readSettingStringArray(settings, 'reference_images', 'referenceImages')[0]
            || readSettingString(settings, 'reference_image_url', 'referenceImageUrl')
        )
    }
    return ''
}

export function getDirectorStageSourceLabel(node: DirectorStageNodeLike) {
    const settings = node.settings || {}
    return (
        readSettingString(settings, 'displayName', 'name', 'image_name')
        || (typeof node.content === 'string' && node.content.trim() ? node.content.trim().slice(0, 24) : '')
        || ({
            'input-image': '图片输入',
            'preview': '预览窗口',
            'panorama-viewer': '720全景',
            'vr720-gen': '720空间场景',
            'asset-gen': '资产生成',
            'single-image-node': '单图生成',
            'gen-image': 'AI 绘图',
            'character-maker': '人物制作',
            'scene-maker': '场景制作',
        }[node.type] || node.type)
    )
}

export function getDirectorStageSourcePreviewLabel(node: DirectorStageNodeLike) {
    if (node.type === 'panorama-viewer') return '全景'
    if (node.type === 'vr720-gen') return '720场景'
    if (node.type === 'asset-gen') return '资产图'
    if (node.type === 'single-image-node') return '图片'
    if (node.type === 'preview') return '预览'
    return '图片'
}

export function buildDirectorStageConnectedSources(nodes: DirectorStageNodeLike[]) {
    return nodes
        .map((node) => {
            const rawSource = resolveDirectorStageImageSource(node)
            if (!rawSource) return null
            return {
                nodeId: node.id,
                label: getDirectorStageSourceLabel(node),
                previewLabel: getDirectorStageSourcePreviewLabel(node),
                rawSource,
            } satisfies DirectorStageConnectedSource
        })
        .filter((item): item is DirectorStageConnectedSource => item !== null)
}
