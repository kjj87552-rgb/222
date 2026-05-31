import { createPortal } from 'react-dom'
import './DirectorStageWorkbench.css'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { importLocalFileAsAsset } from '../../shared/utils/uploadHelpers.js'
import {
    Play,
    Pause,
    Camera,
    ChevronLeft,
    ChevronRight,
    Copy,
    Download,
    Eraser,
    Expand,
    FileText,
    Grid3X3,
    ImagePlus,
    Lock,
    LockOpen,
    Maximize2,
    Minimize2,
    Move3D,
    Orbit,
    Plus,
    Route,
    RotateCcw,
    ScanLine,
    Sparkles,
    Trash2,
    Ungroup,
    User,
    Users,
    X,
    BadgeInfo,
    Focus,
    PanelTopOpen,
} from './iconCompat'
import * as THREE from 'three'
import { DirectorStageViewport, type DirectorStageViewportHandle } from './DirectorStageViewport'
import {
    createDirectorStageDefaultCamera,
    createDirectorStageAdvancedElement,
    createDirectorStageCrowdElement,
    createDirectorStagePathPoint,
    createDirectorStageShotCamera,
    DIRECTOR_STAGE_BACKGROUND_COLORS,
    DIRECTOR_STAGE_CAMERA_TEMPLATE_OPTIONS,
    DIRECTOR_STAGE_COLOR_SWATCHES,
    DIRECTOR_STAGE_DEFAULT_BACKGROUND_COLOR,
    DIRECTOR_STAGE_DEFAULT_ORBIT,
    DIRECTOR_STAGE_FRAME_OPTIONS,
    DIRECTOR_STAGE_LOOK_AT_OPTIONS,
    DIRECTOR_STAGE_MANNEQUIN_STYLES,
    DIRECTOR_STAGE_POSE_OPTIONS,
    DIRECTOR_STAGE_SHOT_PRIORITY_OPTIONS,
    DIRECTOR_STAGE_SHOT_TYPE_OPTIONS,
    getDirectorStageFocusPoint,
    getDirectorStageCameraName,
    getDirectorStageJointPreset,
    normalizeDirectorStageRotation,
    type DirectorStageAdvancedElement,
    type DirectorStageCameraTemplate,
    type DirectorStageCrowdElement,
    type DirectorStageCamera,
    type DirectorStageElement,
    type DirectorStageFrame,
    type DirectorStageLookAtMode,
    type DirectorStageMotionPath,
    type DirectorStageNodeSettings,
    type DirectorStageOrbit,
    type DirectorStagePathPoint,
    type DirectorStagePose,
    buildDirectorStageConnectedSources,
} from './types'

type CanvasNode = {
    id: string
    type: string
    x?: number
    y?: number
    width?: number
    height?: number
    w?: number
    h?: number
    title?: string
    displayName?: string
    content?: unknown
    src?: string | null
    poster?: string | null
    videoSrc?: string | null
    settings?: Record<string, any>
    projectId?: string
}

type CanvasEdge = {
    id?: string
    from: string
    to: string
}

interface DirectorStageWorkbenchProps {
    node: CanvasNode
    allNodes?: CanvasNode[]
    edges?: CanvasEdge[]
    projectId?: string
    onUpdateNode?: (id: string, patch: Record<string, any>) => void
    onCreateNode?: (node: CanvasNode) => void
    onCreateEdge?: (edge: CanvasEdge) => void
    onClose: () => void
}


const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error || new Error('File read failed'))
    reader.readAsDataURL(file)
})

const uploadProjectFile = async (projectId: string, file: File, kind: string, _folder: string) => {
    const imported = await importLocalFileAsAsset(file, projectId, kind, {
        source: 'director-stage-upload',
        inLibrary: false,
        libraryAsset: false,
        scope: 'project',
        projectId,
        project_id: projectId,
    })
    const importedUrl = imported?.url || imported?.src || imported?.assetUrl
    if (importedUrl) {
        return { ...imported, url: importedUrl, filename: imported.filename || imported.title || file.name }
    }
    const dataUrl = await readFileAsDataUrl(file)
    const bridge = (window as any).libai
    if (bridge?.asset?.writeDataUrl) {
        try {
            const uploaded = await bridge.asset.writeDataUrl(projectId, {
                filename: file.name,
                dataUrl,
                kind,
                mime: file.type || undefined,
            })
            if (uploaded?.url) return { ...uploaded, filename: uploaded.title || file.name }
        } catch (error) {
            console.warn('[DirectorStage] Asset write bridge failed, falling back to data url:', error)
        }
    }
    return { url: dataUrl, filename: file.name }
}

const getNodePrimarySource = (node: CanvasNode) => (
    node.src
    || node.poster
    || node.videoSrc
    || (typeof node.content === 'string' ? node.content : '')
    || node.settings?.imageUrl
    || node.settings?.panoramaImageUrl
    || node.settings?.selectedPreviewImage
    || node.settings?.image_url
    || node.settings?.reference_image_url
    || ''
)

const toDirectorSourceNode = (node: CanvasNode) => {
    const rawSource = getNodePrimarySource(node)
    const legacyType = node.type === 'image' ? 'input-image' : node.type === 'video' ? 'gen-video' : node.type
    return {
        id: node.id,
        type: legacyType,
        content: rawSource || node.content,
        settings: {
            ...(node.settings || {}),
            displayName: node.settings?.displayName || node.title || node.displayName,
            imageUrl: node.settings?.imageUrl || rawSource || undefined,
            image_url: node.settings?.image_url || rawSource || undefined,
            selectedPreviewImage: node.settings?.selectedPreviewImage || rawSource || undefined,
        },
    }
}

const useDirectorStageSources = (nodeId: string, allNodes: CanvasNode[], edges: CanvasEdge[]) => useMemo(() => {
    const seen = new Set<string>()
    const incomingNodes = edges
        .filter(edge => edge.to === nodeId && !seen.has(edge.from) && seen.add(edge.from))
        .map(edge => allNodes.find(item => item.id === edge.from))
        .filter((item): item is CanvasNode => Boolean(item))
        .map(toDirectorSourceNode)
    return buildDirectorStageConnectedSources(incomingNodes)
}, [allNodes, edges, nodeId])

interface CrowdBuilderState {
    count: number
    layout: 'single' | 'array' | 'random'
    columns: number
    spacingX: number
    spacingZ: number
    radius: number
}

const isEditableTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false
    const tag = target.tagName.toLowerCase()
    return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable
}

const toDataUrlFile = async (dataUrl: string, filename: string) => {
    const response = await fetch(dataUrl)
    const blob = await response.blob()
    return new File([blob], filename, { type: blob.type || 'image/png' })
}

const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

const csvCell = (value: unknown) => {
    const text = String(value ?? '')
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const rowsToCsvBlob = (rows: Array<Record<string, unknown>>) => {
    const headers = rows.length ? Object.keys(rows[0]) : []
    const csv = [
        headers.map(csvCell).join(','),
        ...rows.map(row => headers.map(header => csvCell(row[header])).join(',')),
    ].join('\r\n')
    return new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
}

const timestamp = () => {
    const date = new Date()
    return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}`
}

type DirectorStageElementPatch =
    Partial<Pick<DirectorStageCrowdElement, 'name' | 'x' | 'y' | 'z' | 'rotationY' | 'scale' | 'color' | 'pose' | 'locked' | 'groupId' | 'lookAtMode' | 'lookAtCameraId' | 'lookAtElementId' | 'lookAtPointX' | 'lookAtPointY' | 'lookAtPointZ' | 'motionPath'>>
    & Partial<Pick<DirectorStageAdvancedElement, 'mannequinStyle' | 'showControlBlock' | 'joints'>>

type DirectorStageSidebarTab = 'properties' | 'functions' | 'display' | 'cameras' | 'list'

const applyCrowdPatch = (
    element: DirectorStageCrowdElement,
    patch: DirectorStageElementPatch,
): DirectorStageCrowdElement => ({
    ...element,
    ...(typeof patch.name === 'string' ? { name: patch.name } : {}),
    ...(typeof patch.x === 'number' ? { x: patch.x } : {}),
    ...(typeof patch.y === 'number' ? { y: patch.y } : {}),
    ...(typeof patch.z === 'number' ? { z: patch.z } : {}),
    ...(typeof patch.rotationY === 'number' ? { rotationY: patch.rotationY } : {}),
    ...(typeof patch.scale === 'number' ? { scale: patch.scale } : {}),
    ...(typeof patch.color === 'string' ? { color: patch.color } : {}),
    ...(typeof patch.pose === 'string' ? { pose: patch.pose } : {}),
    ...(typeof patch.locked === 'boolean' ? { locked: patch.locked } : {}),
    ...('groupId' in patch ? { groupId: patch.groupId } : {}),
    ...('lookAtMode' in patch ? { lookAtMode: patch.lookAtMode } : {}),
    ...('lookAtCameraId' in patch ? { lookAtCameraId: patch.lookAtCameraId } : {}),
    ...('lookAtElementId' in patch ? { lookAtElementId: patch.lookAtElementId } : {}),
    ...('lookAtPointX' in patch ? { lookAtPointX: patch.lookAtPointX } : {}),
    ...('lookAtPointY' in patch ? { lookAtPointY: patch.lookAtPointY } : {}),
    ...('lookAtPointZ' in patch ? { lookAtPointZ: patch.lookAtPointZ } : {}),
    ...('motionPath' in patch ? { motionPath: patch.motionPath } : {}),
})

const applyAdvancedPatch = (
    element: DirectorStageAdvancedElement,
    patch: DirectorStageElementPatch,
): DirectorStageAdvancedElement => ({
    ...element,
    ...(typeof patch.name === 'string' ? { name: patch.name } : {}),
    ...(typeof patch.x === 'number' ? { x: patch.x } : {}),
    ...(typeof patch.y === 'number' ? { y: patch.y } : {}),
    ...(typeof patch.z === 'number' ? { z: patch.z } : {}),
    ...(typeof patch.rotationY === 'number' ? { rotationY: patch.rotationY } : {}),
    ...(typeof patch.scale === 'number' ? { scale: patch.scale } : {}),
    ...(typeof patch.color === 'string' ? { color: patch.color } : {}),
    ...(typeof patch.pose === 'string' ? { pose: patch.pose } : {}),
    ...(typeof patch.locked === 'boolean' ? { locked: patch.locked } : {}),
    ...('groupId' in patch ? { groupId: patch.groupId } : {}),
    ...('lookAtMode' in patch ? { lookAtMode: patch.lookAtMode } : {}),
    ...('lookAtCameraId' in patch ? { lookAtCameraId: patch.lookAtCameraId } : {}),
    ...('lookAtElementId' in patch ? { lookAtElementId: patch.lookAtElementId } : {}),
    ...('lookAtPointX' in patch ? { lookAtPointX: patch.lookAtPointX } : {}),
    ...('lookAtPointY' in patch ? { lookAtPointY: patch.lookAtPointY } : {}),
    ...('lookAtPointZ' in patch ? { lookAtPointZ: patch.lookAtPointZ } : {}),
    ...('motionPath' in patch ? { motionPath: patch.motionPath } : {}),
    ...(patch.mannequinStyle ? { mannequinStyle: patch.mannequinStyle } : {}),
    ...(typeof patch.showControlBlock === 'boolean' ? { showControlBlock: patch.showControlBlock } : {}),
    ...(patch.joints ? { joints: patch.joints } : {}),
})

const applyElementPatch = (
    elements: DirectorStageElement[],
    elementId: string,
    patch: DirectorStageElementPatch,
): DirectorStageElement[] => {
    const selected = elements.find(element => element.id === elementId)
    if (!selected) return elements
    if (selected.kind !== 'crowd' || !selected.crowdGroupId) {
        return elements.map(element => {
            if (element.id !== elementId) return element
            return element.kind === 'advanced'
                ? applyAdvancedPatch(element, patch)
                : applyCrowdPatch(element, patch)
        })
    }
    const deltaX = typeof patch.x === 'number' ? patch.x - selected.x : 0
    const deltaY = typeof patch.y === 'number' ? patch.y - selected.y : 0
    const deltaZ = typeof patch.z === 'number' ? patch.z - selected.z : 0
    return elements.map(element => {
        if (element.kind !== 'crowd' || element.crowdGroupId !== selected.crowdGroupId) return element
        return applyCrowdPatch(element, {
            ...patch,
            ...(typeof patch.x === 'number' ? { x: Math.round((element.x + deltaX) * 10) / 10 } : {}),
            ...(typeof patch.y === 'number' ? { y: Math.round((element.y + deltaY) * 10) / 10 } : {}),
            ...(typeof patch.z === 'number' ? { z: Math.round((element.z + deltaZ) * 10) / 10 } : {}),
        })
    })
}

const uniqueIds = (ids: string[]) => Array.from(new Set(ids.filter(Boolean)))

const areIdListsEqual = (left: string[], right: string[]) =>
    left.length === right.length && left.every((id, index) => id === right[index])

const getElementSelectionCluster = (elements: DirectorStageElement[], elementId: string) => {
    const target = elements.find(element => element.id === elementId)
    if (!target) return [] as string[]
    if (target.groupId) {
        return elements
            .filter(element => element.groupId === target.groupId)
            .map(element => element.id)
    }
    if (target.kind === 'crowd' && target.crowdGroupId) {
        return elements
            .filter(element => element.kind === 'crowd' && element.crowdGroupId === target.crowdGroupId)
            .map(element => element.id)
    }
    return [target.id]
}

const expandElementSelection = (elements: DirectorStageElement[], elementIds: string[]) =>
    uniqueIds(elementIds.flatMap(elementId => getElementSelectionCluster(elements, elementId)))

const resolveSelectionTransformIds = (
    elements: DirectorStageElement[],
    anchorId: string,
    selectedElementIds: string[],
) => {
    const expandedSelection = expandElementSelection(elements, selectedElementIds)
    if (expandedSelection.length > 1 && expandedSelection.includes(anchorId)) {
        return expandedSelection
    }
    return getElementSelectionCluster(elements, anchorId)
}

const applyElementPatchToIds = (
    elements: DirectorStageElement[],
    elementIds: string[],
    anchorId: string,
    patch: DirectorStageElementPatch,
) => {
    const anchor = elements.find(element => element.id === anchorId)
    if (!anchor || elementIds.length === 0) return elements
    const targetIds = new Set(elementIds)
    const deltaX = typeof patch.x === 'number' ? patch.x - anchor.x : 0
    const deltaY = typeof patch.y === 'number' ? patch.y - anchor.y : 0
    const deltaZ = typeof patch.z === 'number' ? patch.z - anchor.z : 0
    const deltaRotationY = typeof patch.rotationY === 'number'
        ? normalizeDirectorStageRotation(patch.rotationY - anchor.rotationY)
        : undefined
    return elements.map(element => {
        if (!targetIds.has(element.id)) return element
        const nextPatch: DirectorStageElementPatch = {
            ...patch,
            ...(typeof patch.x === 'number' ? { x: Math.round((element.x + deltaX) * 10) / 10 } : {}),
            ...(typeof patch.y === 'number' ? { y: Math.round((element.y + deltaY) * 10) / 10 } : {}),
            ...(typeof patch.z === 'number' ? { z: Math.round((element.z + deltaZ) * 10) / 10 } : {}),
            ...(deltaRotationY !== undefined ? { rotationY: normalizeDirectorStageRotation(element.rotationY + deltaRotationY) } : {}),
        }
        return element.kind === 'advanced'
            ? applyAdvancedPatch(element, nextPatch)
            : applyCrowdPatch(element, nextPatch)
    })
}

const createCrowdBatch = (state: CrowdBuilderState): DirectorStageCrowdElement[] => {
    const count = Math.max(1, state.count)
    const groupId = state.layout === 'single' ? undefined : `director-crowd-group-${Date.now()}`
    if (state.layout === 'single') return [createDirectorStageCrowdElement(1)]
    if (state.layout === 'random') {
        return Array.from({ length: count }, (_, index) => {
            const angle = Math.random() * Math.PI * 2
            const radius = Math.sqrt(Math.random()) * state.radius
            const crowd = createDirectorStageCrowdElement(index + 1, groupId)
            return {
                ...crowd,
                x: Math.round(Math.cos(angle) * radius * 10) / 10,
                z: Math.round(Math.sin(angle) * radius * 10) / 10,
                rotationY: Math.round(360 * Math.random()),
            }
        })
    }
    const columns = Math.max(1, state.columns)
    const rows = Math.ceil(count / columns)
    const offsetX = (-(columns - 1) * state.spacingX) / 2
    const offsetZ = (-(rows - 1) * state.spacingZ) / 2
    return Array.from({ length: count }, (_, index) => {
        const row = Math.floor(index / columns)
        const column = index % columns
        const crowd = createDirectorStageCrowdElement(index + 1, groupId)
        return {
            ...crowd,
            x: Math.round((offsetX + column * state.spacingX) * 10) / 10,
            z: Math.round((offsetZ + row * state.spacingZ) * 10) / 10,
            rotationY: 180,
        }
    })
}

const getShotTypeLabel = (shotType?: DirectorStageCamera['shotType']) =>
    DIRECTOR_STAGE_SHOT_TYPE_OPTIONS.find(option => option.key === shotType)?.label || '未分类'

const getShotPriorityLabel = (priority?: DirectorStageCamera['priority']) =>
    DIRECTOR_STAGE_SHOT_PRIORITY_OPTIONS.find(option => option.key === priority)?.label || '辅助'

const getCameraTemplateLabel = (templateId: DirectorStageCameraTemplate) =>
    DIRECTOR_STAGE_CAMERA_TEMPLATE_OPTIONS.find(option => option.key === templateId)?.label || '模板'

const getSceneFocusAnchor = (elements: DirectorStageElement[], selectedElementId: string) => {
    const selectedElement = elements.find(element => element.id === selectedElementId)
    if (selectedElement) return getDirectorStageFocusPoint(selectedElement)
    const focusTargets = (elements.filter(element => element.kind === 'advanced').length > 0
        ? elements.filter(element => element.kind === 'advanced')
        : elements
    ).map(element => getDirectorStageFocusPoint(element))
    if (focusTargets.length === 0) {
        return { x: 0, y: 1.4, z: 0 }
    }
    const average = focusTargets.reduce((accumulator, point) => ({
        x: accumulator.x + point.x,
        y: accumulator.y + point.y,
        z: accumulator.z + point.z,
    }), { x: 0, y: 0, z: 0 })
    return {
        x: average.x / focusTargets.length,
        y: average.y / focusTargets.length,
        z: average.z / focusTargets.length,
    }
}

const createTemplateCameraSet = (
    templateId: DirectorStageCameraTemplate,
    elements: DirectorStageElement[],
    selectedElementId: string,
    startIndex: number,
) => {
    const stamp = Date.now()
    let cursor = 0
    const createCamera = (
        partial: Partial<DirectorStageCamera> & Pick<DirectorStageCamera, 'x' | 'y' | 'z' | 'targetX' | 'targetY' | 'targetZ' | 'fov'>,
    ): DirectorStageCamera => {
        const index = startIndex + cursor
        const camera: DirectorStageCamera = {
            id: `director-template-${templateId}-${stamp}-${cursor}`,
            name: getDirectorStageCameraName(index),
            locked: false,
            frame: 'none',
            shotType: 'medium',
            priority: 'support',
            usage: '',
            notes: '',
            durationSeconds: 6,
            ...partial,
        }
        cursor += 1
        return camera
    }

    const focus = getSceneFocusAnchor(elements, selectedElementId)
    const advancedPair = (elements.filter(element => element.kind === 'advanced').length >= 2
        ? elements.filter(element => element.kind === 'advanced')
        : elements
    )
        .slice(0, 2)
        .sort((left, right) => left.x - right.x)

    if (templateId === 'dialogue' && advancedPair.length >= 2) {
        const left = advancedPair[0]
        const right = advancedPair[1]
        const leftFocus = getDirectorStageFocusPoint(left)
        const rightFocus = getDirectorStageFocusPoint(right)
        const center = {
            x: (leftFocus.x + rightFocus.x) / 2,
            y: (leftFocus.y + rightFocus.y) / 2,
            z: (leftFocus.z + rightFocus.z) / 2,
        }
        return [
            createCamera({
                x: center.x,
                y: 1.76,
                z: center.z + 6.2,
                targetX: center.x,
                targetY: center.y,
                targetZ: center.z,
                fov: 38,
                shotType: 'master',
                priority: 'primary',
                usage: '双人主镜头',
                durationSeconds: 10,
                templateId,
            }),
            createCamera({
                x: right.x + 0.95,
                y: 1.72,
                z: right.z + 2.7,
                targetX: leftFocus.x,
                targetY: leftFocus.y,
                targetZ: leftFocus.z,
                fov: 28,
                shotType: 'over-shoulder',
                priority: 'primary',
                usage: `看向 ${left.name}`,
                durationSeconds: 6,
                templateId,
            }),
            createCamera({
                x: left.x - 0.95,
                y: 1.72,
                z: left.z + 2.7,
                targetX: rightFocus.x,
                targetY: rightFocus.y,
                targetZ: rightFocus.z,
                fov: 28,
                shotType: 'over-shoulder',
                priority: 'primary',
                usage: `看向 ${right.name}`,
                durationSeconds: 6,
                templateId,
            }),
        ]
    }

    if (templateId === 'livestream') {
        return [
            createCamera({
                x: focus.x,
                y: 1.85,
                z: focus.z + 7,
                targetX: focus.x,
                targetY: focus.y,
                targetZ: focus.z,
                fov: 34,
                shotType: 'master',
                priority: 'primary',
                usage: '直播主画面',
                durationSeconds: 12,
                templateId,
            }),
            createCamera({
                x: focus.x - 3.8,
                y: 1.7,
                z: focus.z + 4.6,
                targetX: focus.x,
                targetY: focus.y,
                targetZ: focus.z,
                fov: 32,
                shotType: 'medium',
                priority: 'support',
                usage: '左侧补位',
                durationSeconds: 8,
                templateId,
            }),
            createCamera({
                x: focus.x + 3.8,
                y: 1.7,
                z: focus.z + 4.6,
                targetX: focus.x,
                targetY: focus.y,
                targetZ: focus.z,
                fov: 32,
                shotType: 'medium',
                priority: 'support',
                usage: '右侧补位',
                durationSeconds: 8,
                templateId,
            }),
            createCamera({
                x: focus.x,
                y: 4.8,
                z: focus.z + 1.2,
                targetX: focus.x,
                targetY: Math.max(0.6, focus.y - 0.2),
                targetZ: focus.z,
                fov: 30,
                shotType: 'top',
                priority: 'pickup',
                usage: '俯拍补画面',
                durationSeconds: 5,
                templateId,
            }),
        ]
    }

    if (templateId === 'product') {
        return [
            createCamera({
                x: focus.x,
                y: 1.38,
                z: focus.z + 3.8,
                targetX: focus.x,
                targetY: focus.y - 0.18,
                targetZ: focus.z,
                fov: 24,
                shotType: 'master',
                priority: 'primary',
                usage: '主展示镜头',
                durationSeconds: 7,
                templateId,
            }),
            createCamera({
                x: focus.x + 2.4,
                y: 1.56,
                z: focus.z + 2.6,
                targetX: focus.x,
                targetY: focus.y - 0.08,
                targetZ: focus.z,
                fov: 26,
                shotType: 'insert',
                priority: 'support',
                usage: '45 度细节镜头',
                durationSeconds: 5,
                templateId,
            }),
            createCamera({
                x: focus.x,
                y: 4.2,
                z: focus.z + 0.3,
                targetX: focus.x,
                targetY: Math.max(0.4, focus.y - 0.3),
                targetZ: focus.z,
                fov: 22,
                shotType: 'top',
                priority: 'pickup',
                usage: '俯视结构镜头',
                durationSeconds: 4,
                templateId,
            }),
        ]
    }

    return [
        createCamera({
            x: focus.x,
            y: 1.76,
            z: focus.z + 6.4,
            targetX: focus.x,
            targetY: focus.y,
            targetZ: focus.z,
            fov: 38,
            shotType: 'master',
            priority: 'primary',
            usage: '单人主镜头',
            durationSeconds: 9,
            templateId,
        }),
        createCamera({
            x: focus.x - 2.1,
            y: 1.82,
            z: focus.z + 3.8,
            targetX: focus.x,
            targetY: focus.y,
            targetZ: focus.z,
            fov: 31,
            shotType: 'medium',
            priority: 'support',
            usage: '采访侧脸镜头',
            durationSeconds: 7,
            templateId,
        }),
        createCamera({
            x: focus.x + 1.35,
            y: 1.68,
            z: focus.z + 2.45,
            targetX: focus.x,
            targetY: focus.y,
            targetZ: focus.z,
            fov: 25,
            shotType: 'closeup',
            priority: 'pickup',
            usage: '反应近景',
            durationSeconds: 4,
            templateId,
        }),
    ]
}

const cloneMotionPath = (path?: DirectorStageMotionPath): DirectorStageMotionPath => ({
    loop: path?.loop ?? false,
    points: (path?.points || []).map(point => ({ ...point })),
})

const sampleMotionPath = (
    path: DirectorStageMotionPath | undefined,
    fallback: { x: number; y: number; z: number },
    progress: number,
) => {
    const points = path?.points || []
    if (points.length === 0) return fallback
    if (points.length === 1) {
        return { x: points[0].x, y: points[0].y, z: points[0].z }
    }
    const loop = Boolean(path?.loop)
    const normalizedProgress = loop
        ? ((progress % 1) + 1) % 1
        : THREE.MathUtils.clamp(progress, 0, 1)
    const segmentCount = loop ? points.length : points.length - 1
    const scaled = normalizedProgress * segmentCount
    const segmentIndex = Math.min(segmentCount - 1, Math.floor(scaled))
    const nextIndex = loop ? (segmentIndex + 1) % points.length : Math.min(points.length - 1, segmentIndex + 1)
    const segmentProgress = normalizedProgress >= 1 && !loop ? 1 : scaled - segmentIndex
    const start = points[segmentIndex]
    const end = points[nextIndex]
    return {
        x: THREE.MathUtils.lerp(start.x, end.x, segmentProgress),
        y: THREE.MathUtils.lerp(start.y, end.y, segmentProgress),
        z: THREE.MathUtils.lerp(start.z, end.z, segmentProgress),
    }
}

const getLookAtRotation = (
    source: DirectorStageElement,
    target: { x: number; z: number } | null,
) => {
    if (!target) return source.rotationY
    const dx = target.x - source.x
    const dz = target.z - source.z
    if (Math.abs(dx) < 0.0001 && Math.abs(dz) < 0.0001) return source.rotationY
    return normalizeDirectorStageRotation(THREE.MathUtils.radToDeg(Math.atan2(dx, dz)))
}

function StatChip({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/24 px-2 py-1 text-[10px] text-white/72 backdrop-blur-sm">
            {icon}
            <span>{label}</span>
        </div>
    )
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
    return (
        <section className="rounded-[22px] border border-white/8 bg-white/[0.04] p-4">
            <div className="mb-3">
                <div className="text-xs uppercase tracking-[0.22em] text-white/34">{title}</div>
                {hint ? <div className="mt-1 text-[11px] text-white/42">{hint}</div> : null}
            </div>
            {children}
        </section>
    )
}

function SliderField({
    label,
    value,
    min,
    max,
    step,
    disabled,
    accentClass,
    onChange,
}: {
    label: string
    value: number
    min: number
    max: number
    step: number
    disabled?: boolean
    accentClass?: string
    onChange: (value: number) => void
}) {
    return (
        <label className="block">
            <div className="mb-2 flex items-center justify-between text-xs text-white/54">
                <span>{label}</span>
                <span>{value.toFixed(step < 0.1 ? 2 : 1)}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                disabled={disabled}
                onChange={(event) => onChange(Number(event.target.value))}
                className={`w-full ${accentClass || ''} disabled:cursor-not-allowed disabled:opacity-40`}
            />
        </label>
    )
}

type RailIconAccent = 'neutral' | 'cyan' | 'amber' | 'violet' | 'rose'

function RailIconButton({
    icon,
    label,
    active,
    disabled,
    accent = 'neutral',
    onClick,
}: {
    icon: React.ReactNode
    label: string
    active?: boolean
    disabled?: boolean
    accent?: RailIconAccent
    onClick: () => void
}) {
    const accentMap: Record<RailIconAccent, { idle: string; activeCls: string }> = {
        neutral: { idle: 'bg-white/6 text-white/70 hover:bg-white/10', activeCls: 'bg-white/16 text-white' },
        cyan:    { idle: 'bg-white/6 text-white/70 hover:bg-cyan-400/14',   activeCls: 'bg-cyan-400/24 text-cyan-50 ring-1 ring-cyan-300/45' },
        amber:   { idle: 'bg-white/6 text-white/70 hover:bg-amber-400/14',  activeCls: 'bg-amber-400/24 text-amber-50 ring-1 ring-amber-300/45' },
        violet:  { idle: 'bg-white/6 text-white/70 hover:bg-violet-400/14', activeCls: 'bg-violet-400/24 text-violet-50' },
        rose:    { idle: 'bg-white/6 text-white/70 hover:bg-rose-400/14',   activeCls: 'bg-rose-400/24 text-rose-50' },
    }
    const cls = active ? accentMap[accent].activeCls : accentMap[accent].idle
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={label}
            aria-label={label}
            className={`group relative flex h-7 w-7 items-center justify-center rounded-lg transition ${cls} disabled:cursor-not-allowed disabled:opacity-35`}
        >
            {active ? <span aria-hidden className="absolute -left-[3px] top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-sm bg-current" /> : null}
            {icon}
            <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[rgba(10,16,28,0.96)] px-2 py-1 text-[11px] text-white opacity-0 shadow-[0_8px_22px_rgba(0,0,0,0.4)] transition-opacity duration-150 group-hover:opacity-100">
                {label}
            </span>
        </button>
    )
}

function ToolPanelShell({
    icon,
    title,
    accent,
    onClose,
    children,
}: {
    icon: React.ReactNode
    title: string
    accent: 'cyan' | 'amber'
    onClose: () => void
    children: React.ReactNode
}) {
    const badge = accent === 'cyan'
        ? 'bg-cyan-400/18 text-cyan-100'
        : 'bg-amber-400/18 text-amber-100'
    return (
        <div
            className="flex h-full w-[240px] min-w-[240px] flex-col border-r border-white/8 bg-[rgba(12,18,30,0.94)]"
            style={{ animation: 'slideInLeft 200ms ease-out' }}
        >
            <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-md ${badge}`}>
                        {icon}
                    </div>
                    <div className="text-[12.5px] font-semibold text-white">{title}</div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="关闭面板"
                    className="flex h-5 w-5 items-center justify-center rounded-md bg-white/8 text-white/55 transition hover:bg-white/14 hover:text-white"
                >
                    <X size={11} />
                </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-1">
                {children}
            </div>
        </div>
    )
}

function DockTab({
    active,
    label,
    onClick,
}: {
    active: boolean
    label: string
    onClick: () => void
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${active
                ? 'bg-white text-[#0a1220] shadow-[0_8px_20px_rgba(255,255,255,0.18)]'
                : 'bg-white/8 text-white/68 hover:bg-white/12'}`}
        >
            {label}
        </button>
    )
}

function FrameOverlay({
    frame,
    active,
    showGuides,
    showSafeArea,
    showCenterCross,
    showHeadroom,
    showEyeline,
    viewportWidth,
    viewportHeight,
}: {
    frame: DirectorStageFrame
    active: boolean
    showGuides: boolean
    showSafeArea: boolean
    showCenterCross: boolean
    showHeadroom: boolean
    showEyeline: boolean
    viewportWidth: number
    viewportHeight: number
}) {
    const hasCompositionGuides = showSafeArea || showCenterCross || showHeadroom || showEyeline
    const showThirdsGuides = showGuides && active && frame !== 'none'
    if (viewportWidth <= 0 || viewportHeight <= 0) return null
    if (frame === 'none' && !showThirdsGuides && !hasCompositionGuides) return null
    const aspectRatio = frame === 'none'
        ? null
        : frame === '16:9'
            ? 16 / 9
            : frame === '2.35:1'
                ? 2.35
                : 9 / 16
    const viewportRatio = viewportWidth / viewportHeight
    let width = viewportWidth
    let height = viewportHeight
    let left = 0
    let top = 0
    if (aspectRatio && viewportRatio > aspectRatio) {
        width = Math.round(viewportHeight * aspectRatio)
        left = Math.round((viewportWidth - width) / 2)
    } else if (aspectRatio && viewportRatio < aspectRatio) {
        height = Math.round(viewportWidth / aspectRatio)
        top = Math.round((viewportHeight - height) / 2)
    }
    const guideColor = active ? 'rgba(253,230,138,0.62)' : 'rgba(255,255,255,0.36)'
    const emphasisColor = active ? 'rgba(250,204,21,0.78)' : 'rgba(125,211,252,0.64)'
    return (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
                style={{ width, height, left, top }}
                className={`absolute overflow-hidden rounded-[24px] border transition ${active
                    ? 'border-amber-300/70 shadow-[0_0_0_9999px_rgba(3,5,10,0.26)]'
                    : frame === 'none'
                        ? 'border-transparent'
                        : 'border-white/12 shadow-[0_0_0_9999px_rgba(3,5,10,0.18)]'}`}
            >
                {showThirdsGuides ? (
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `linear-gradient(to right, transparent 33.1%, ${guideColor} 33.1%, ${guideColor} 33.9%, transparent 33.9%, transparent 66.1%, ${guideColor} 66.1%, ${guideColor} 66.9%, transparent 66.9%), linear-gradient(to bottom, transparent 33.1%, ${guideColor} 33.1%, ${guideColor} 33.9%, transparent 33.9%, transparent 66.1%, ${guideColor} 66.1%, ${guideColor} 66.9%, transparent 66.9%)`,
                        }}
                    />
                ) : null}
                {showSafeArea ? (
                    <div
                        className="absolute rounded-[18px] border"
                        style={{
                            inset: '8%',
                            borderColor: guideColor,
                        }}
                    />
                ) : null}
                {showCenterCross ? (
                    <>
                        <div className="absolute left-1/2 top-[8%] h-[84%] w-px -translate-x-1/2" style={{ backgroundColor: emphasisColor }} />
                        <div className="absolute left-[8%] top-1/2 h-px w-[84%] -translate-y-1/2" style={{ backgroundColor: emphasisColor }} />
                    </>
                ) : null}
                {showHeadroom ? (
                    <div
                        className="absolute left-[8%] right-[8%] border-t border-dashed"
                        style={{
                            top: '16%',
                            borderColor: emphasisColor,
                        }}
                    />
                ) : null}
                {showEyeline ? (
                    <>
                        <div className="absolute left-[8%] right-[8%] border-t border-dashed" style={{ top: '38%', borderColor: guideColor }} />
                        <div className="absolute left-[8%] right-[8%] border-t border-dashed" style={{ top: '62%', borderColor: guideColor }} />
                    </>
                ) : null}
            </div>
        </div>
    )
}

export function DirectorStageWorkbench({ node, allNodes = [], edges = [], projectId: currentProjectId, onUpdateNode, onCreateNode, onCreateEdge, onClose }: DirectorStageWorkbenchProps) {
    const viewportRef = useRef<DirectorStageViewportHandle | null>(null)
    const viewportShellRef = useRef<HTMLDivElement | null>(null)
    const backgroundInputRef = useRef<HTMLInputElement | null>(null)
    const groundPlanInputRef = useRef<HTMLInputElement | null>(null)
    const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const deleteSelectedRef = useRef<() => void>(() => { })
    const orbitFrameRef = useRef<number | null>(null)
    const pendingOrbitRef = useRef<DirectorStageOrbit | null>(null)
    const pathPreviewFrameRef = useRef<number | null>(null)
    const lastPathPreviewTimeRef = useRef<number | null>(null)

    const [toast, setToast] = useState('')
    const showAlert = useCallback((message: string) => {
        setToast(message)
        window.setTimeout(() => setToast(current => current === message ? '' : current), 1800)
    }, [])
    const projectId = currentProjectId || node.projectId || 'local-default'
    const isCanvasInteracting = false
    const updateNodeSettings = useCallback((id: string, patch: Record<string, any>) => {
        const target = allNodes.find(item => item.id === id) || node
        onUpdateNode?.(id, {
            displayName: patch.displayName || target.displayName,
            title: patch.displayName || target.title,
            settings: {
                ...(target.settings || {}),
                ...patch,
            },
        })
    }, [allNodes, node, onUpdateNode])
    const addNode = useCallback((type: string, x: number, y: number, content?: string) => {
        const id = 'stage_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6)
        const mappedType = type === 'input-image' ? 'image' : type
        const nextNode: CanvasNode = {
            id,
            type: mappedType,
            x,
            y,
            w: mappedType === 'image' ? 392 : 320,
            h: mappedType === 'image' ? 220 : 220,
            title: mappedType === 'image' ? '全景截图' : '全景结果',
            content,
            src: mappedType === 'image' ? content || null : null,
            tag: '全景截图',
            settings: mappedType === 'image' ? { imageUrl: content } : {},
        } as CanvasNode
        onCreateNode?.(nextNode)
        return nextNode
    }, [onCreateNode])
    const connect = useCallback((from: string, to: string) => {
        onCreateEdge?.({ id: 'edge_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6), from, to })
    }, [onCreateEdge])
    const getNodeLayout = useCallback((id: string) => {
        const target = allNodes.find(item => item.id === id) || node
        return target ? { x: target.x || 0, y: target.y || 0, width: target.w || target.width || 320, height: target.h || target.height || 220 } : null
    }, [allNodes, node])

    const connectedSources = useDirectorStageSources(node.id, allNodes, edges)
    const settings = (node.settings || {}) as DirectorStageNodeSettings
    const initialCameras = settings.director3dCameras && settings.director3dCameras.length > 0
        ? settings.director3dCameras
        : [createDirectorStageDefaultCamera()]
    const initialSelectedElementIds = uniqueIds(
        Array.isArray(settings.director3dSelectedElementIds) && settings.director3dSelectedElementIds.length > 0
            ? settings.director3dSelectedElementIds.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
            : settings.director3dSelectedElementId
                ? [settings.director3dSelectedElementId]
                : [],
    )

    const [isFullscreen, setIsFullscreen] = useState(false)
    const [activeTool, setActiveTool] = useState<null | 'background' | 'ground' | 'crowd' | 'camera' | 'frame'>(null)
    const [sidebarTab, setSidebarTab] = useState<DirectorStageSidebarTab>('properties')
    const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })
    const [backgroundUrl, setBackgroundUrl] = useState(settings.director3dBackground || '')
    const [backgroundName, setBackgroundName] = useState(settings.director3dBackgroundName || '')
    const [backgroundSourceNodeId, setBackgroundSourceNodeId] = useState(settings.director3dBackgroundSourceNodeId || '')
    const [backgroundColor, setBackgroundColor] = useState(settings.director3dBackgroundColor || DIRECTOR_STAGE_DEFAULT_BACKGROUND_COLOR)
    const [groundPlanUrl, setGroundPlanUrl] = useState(settings.director3dGroundPlan || '')
    const [groundPlanName, setGroundPlanName] = useState(settings.director3dGroundPlanName || '')
    const [groundPlanOpacity, setGroundPlanOpacity] = useState(settings.director3dGroundPlanOpacity ?? 0.82)
    const [groundPlanScale, setGroundPlanScale] = useState(settings.director3dGroundPlanScale ?? 8)
    const [groundPlanRotation, setGroundPlanRotation] = useState(settings.director3dGroundPlanRotation ?? 0)
    const [groundPlanOffsetX, setGroundPlanOffsetX] = useState(settings.director3dGroundPlanOffsetX ?? 0)
    const [groundPlanOffsetZ, setGroundPlanOffsetZ] = useState(settings.director3dGroundPlanOffsetZ ?? 0)
    const [showGroundPlan, setShowGroundPlan] = useState(settings.director3dShowGroundPlan ?? true)
    const [elements, setElements] = useState<DirectorStageElement[]>(settings.director3dElements || [])
    const [cameras, setCameras] = useState<DirectorStageCamera[]>(initialCameras)
    const [selectedElementIds, setSelectedElementIds] = useState<string[]>(
        expandElementSelection(settings.director3dElements || [], initialSelectedElementIds),
    )
    const [selectedElementId, setSelectedElementId] = useState(
        settings.director3dSelectedElementId || initialSelectedElementIds[0] || '',
    )
    const [activeCameraId, setActiveCameraId] = useState(
        settings.director3dActiveCameraId || initialCameras[0]?.id || '',
    )
    const [viewportMode, setViewportMode] = useState(settings.director3dViewportMode || 'director')
    const [frame, setFrame] = useState<DirectorStageFrame>(settings.director3dFrame || 'none')
    const [showCameras, setShowCameras] = useState(settings.director3dShowCameras ?? true)
    const [showGrid, setShowGrid] = useState(settings.director3dShowGrid ?? true)
    const [showTargets, setShowTargets] = useState(settings.director3dShowTargets ?? true)
    const [showFocus, setShowFocus] = useState(settings.director3dShowFocus ?? true)
    const [showFrameGuides, setShowFrameGuides] = useState(settings.director3dShowFrameGuides ?? false)
    const [showElementNumbers, setShowElementNumbers] = useState(settings.director3dShowElementNumbers ?? true)
    const [showPaths, setShowPaths] = useState(settings.director3dShowPaths ?? true)
    const [pathPreviewEnabled, setPathPreviewEnabled] = useState(settings.director3dPathPreviewEnabled ?? false)
    const [pathPreviewPlaying, setPathPreviewPlaying] = useState(settings.director3dPathPreviewPlaying ?? false)
    const [pathPreviewProgress, setPathPreviewProgress] = useState(settings.director3dPathPreviewProgress ?? 0)
    const [selectedPathPointId, setSelectedPathPointId] = useState('')
    const [showCompositionSafeArea, setShowCompositionSafeArea] = useState(settings.director3dCompositionSafeArea ?? false)
    const [showCompositionCenterCross, setShowCompositionCenterCross] = useState(settings.director3dCompositionCenterCross ?? false)
    const [showCompositionHeadroom, setShowCompositionHeadroom] = useState(settings.director3dCompositionHeadroom ?? false)
    const [showCompositionEyeline, setShowCompositionEyeline] = useState(settings.director3dCompositionEyeline ?? false)
    const [isBundleExporting, setIsBundleExporting] = useState(false)
    const [crowdBuilder, setCrowdBuilder] = useState<CrowdBuilderState>({
        count: 18,
        layout: 'single',
        columns: 4,
        spacingX: 1.5,
        spacingZ: 1.8,
        radius: 4.6,
    })
    const [orbit, setOrbit] = useState<DirectorStageOrbit>({
        yaw: settings.director3dOrbitYaw ?? DIRECTOR_STAGE_DEFAULT_ORBIT.yaw,
        pitch: settings.director3dOrbitPitch ?? DIRECTOR_STAGE_DEFAULT_ORBIT.pitch,
        distance: settings.director3dOrbitDistance ?? DIRECTOR_STAGE_DEFAULT_ORBIT.distance,
        targetX: settings.director3dOrbitTargetX ?? DIRECTOR_STAGE_DEFAULT_ORBIT.targetX,
        targetY: settings.director3dOrbitTargetY ?? DIRECTOR_STAGE_DEFAULT_ORBIT.targetY,
        targetZ: settings.director3dOrbitTargetZ ?? DIRECTOR_STAGE_DEFAULT_ORBIT.targetZ,
    })

    useEffect(() => {
        const shell = viewportShellRef.current
        if (!shell) return
        const readRect = () => {
            setViewportSize({ width: shell.clientWidth, height: shell.clientHeight })
        }
        readRect()
        const observer = new ResizeObserver(() => readRect())
        observer.observe(shell)
        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        return () => {
            if (orbitFrameRef.current !== null) {
                window.cancelAnimationFrame(orbitFrameRef.current)
                orbitFrameRef.current = null
            }
            if (pathPreviewFrameRef.current !== null) {
                window.cancelAnimationFrame(pathPreviewFrameRef.current)
                pathPreviewFrameRef.current = null
            }
        }
    }, [])

    useEffect(() => {
        if (!pathPreviewEnabled && pathPreviewPlaying) {
            setPathPreviewPlaying(false)
        }
    }, [pathPreviewEnabled, pathPreviewPlaying])

    useEffect(() => {
        if (!pathPreviewEnabled || !pathPreviewPlaying || isCanvasInteracting) {
            lastPathPreviewTimeRef.current = null
            if (pathPreviewFrameRef.current !== null) {
                window.cancelAnimationFrame(pathPreviewFrameRef.current)
                pathPreviewFrameRef.current = null
            }
            return
        }
        const tick = (timestampValue: number) => {
            const lastTime = lastPathPreviewTimeRef.current ?? timestampValue
            const delta = timestampValue - lastTime
            lastPathPreviewTimeRef.current = timestampValue
            setPathPreviewProgress(current => {
                const nextValue = current + delta / 8000
                return nextValue >= 1 ? nextValue % 1 : nextValue
            })
            pathPreviewFrameRef.current = window.requestAnimationFrame(tick)
        }
        pathPreviewFrameRef.current = window.requestAnimationFrame(tick)
        return () => {
            lastPathPreviewTimeRef.current = null
            if (pathPreviewFrameRef.current !== null) {
                window.cancelAnimationFrame(pathPreviewFrameRef.current)
                pathPreviewFrameRef.current = null
            }
        }
    }, [isCanvasInteracting, pathPreviewEnabled, pathPreviewPlaying])

    useEffect(() => {
        const previousOverflow = document.body.style.overflow
        const previousMarker = document.body.dataset.directorWorkbenchOpen
        document.body.style.overflow = 'hidden'
        document.body.dataset.directorWorkbenchOpen = 'true'
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault()
                event.stopPropagation()
                if (activeTool) {
                    setActiveTool(null)
                } else {
                    onClose()
                }
                return
            }
            if (event.key === 'Delete' && !isEditableTarget(event.target)) {
                event.preventDefault()
                event.stopPropagation()
                deleteSelectedRef.current()
            }
        }
        window.addEventListener('keydown', handleKeyDown, true)
        return () => {
            document.body.style.overflow = previousOverflow
            if (previousMarker) {
                document.body.dataset.directorWorkbenchOpen = previousMarker
            } else {
                delete document.body.dataset.directorWorkbenchOpen
            }
            window.removeEventListener('keydown', handleKeyDown, true)
        }
    }, [activeTool, onClose])

    useEffect(() => {
        if (!backgroundSourceNodeId) return
        if (!connectedSources.some(source => source.nodeId === backgroundSourceNodeId)) {
            setBackgroundSourceNodeId('')
        }
    }, [connectedSources, backgroundSourceNodeId])

    useEffect(() => {
        const fallbackIds = selectedElementId ? [selectedElementId] : []
        const nextIds = expandElementSelection(elements, selectedElementIds.length > 0 ? selectedElementIds : fallbackIds)
            .filter(elementId => elements.some(element => element.id === elementId))
        const nextPrimary = nextIds.includes(selectedElementId) ? selectedElementId : nextIds[0] || ''
        if (!areIdListsEqual(nextIds, selectedElementIds)) {
            setSelectedElementIds(nextIds)
        }
        if (nextPrimary !== selectedElementId) {
            setSelectedElementId(nextPrimary)
        }
    }, [elements, selectedElementId, selectedElementIds])

    useEffect(() => {
        if (persistTimerRef.current) clearTimeout(persistTimerRef.current)
        persistTimerRef.current = setTimeout(() => {
            updateNodeSettings(node.id, {
                displayName: '全景环绕控制',
                director3dBackground: backgroundUrl || undefined,
                director3dBackgroundName: backgroundName || undefined,
                director3dBackgroundSourceNodeId: backgroundSourceNodeId || undefined,
                director3dBackgroundColor: backgroundColor,
                director3dGroundPlan: groundPlanUrl || undefined,
                director3dGroundPlanName: groundPlanName || undefined,
                director3dGroundPlanOpacity: groundPlanOpacity,
                director3dGroundPlanScale: groundPlanScale,
                director3dGroundPlanRotation: groundPlanRotation,
                director3dGroundPlanOffsetX: groundPlanOffsetX,
                director3dGroundPlanOffsetZ: groundPlanOffsetZ,
                director3dShowGroundPlan: showGroundPlan,
                director3dElements: elements,
                director3dCameras: cameras,
                director3dSelectedElementId: selectedElementId || undefined,
                director3dSelectedElementIds: selectedElementIds.length > 0 ? selectedElementIds : undefined,
                director3dActiveCameraId: activeCameraId || undefined,
                director3dViewportMode: viewportMode,
                director3dFrame: frame,
                director3dOrbitYaw: orbit.yaw,
                director3dOrbitPitch: orbit.pitch,
                director3dOrbitDistance: orbit.distance,
                director3dOrbitTargetX: orbit.targetX,
                director3dOrbitTargetY: orbit.targetY,
                director3dOrbitTargetZ: orbit.targetZ,
                director3dShowCameras: showCameras,
                director3dShowGrid: showGrid,
                director3dShowTargets: showTargets,
                director3dShowFocus: showFocus,
                director3dShowFrameGuides: showFrameGuides,
                director3dShowElementNumbers: showElementNumbers,
                director3dShowPaths: showPaths,
                director3dPathPreviewEnabled: pathPreviewEnabled,
                director3dPathPreviewPlaying: pathPreviewPlaying,
                director3dPathPreviewProgress: pathPreviewProgress,
                director3dCompositionSafeArea: showCompositionSafeArea,
                director3dCompositionCenterCross: showCompositionCenterCross,
                director3dCompositionHeadroom: showCompositionHeadroom,
                director3dCompositionEyeline: showCompositionEyeline,
            })
            persistTimerRef.current = null
        }, 180)
        return () => {
            if (persistTimerRef.current) {
                clearTimeout(persistTimerRef.current)
                persistTimerRef.current = null
            }
        }
    }, [
        activeCameraId,
        backgroundColor,
        backgroundName,
        backgroundSourceNodeId,
        backgroundUrl,
        groundPlanName,
        groundPlanOffsetX,
        groundPlanOffsetZ,
        groundPlanOpacity,
        groundPlanRotation,
        groundPlanScale,
        groundPlanUrl,
        cameras,
        elements,
        frame,
        node.id,
        orbit,
        pathPreviewEnabled,
        pathPreviewPlaying,
        pathPreviewProgress,
        selectedElementId,
        selectedElementIds,
        showCameras,
        showCompositionCenterCross,
        showCompositionEyeline,
        showCompositionHeadroom,
        showCompositionSafeArea,
        showElementNumbers,
        showFocus,
        showFrameGuides,
        showGroundPlan,
        showGrid,
        showPaths,
        showTargets,
        updateNodeSettings,
        viewportMode,
    ])

    const positionedElements = useMemo(() => (
        elements.map(element => {
            if (!pathPreviewEnabled) return element
            const nextPosition = sampleMotionPath(element.motionPath, element, pathPreviewProgress)
            return {
                ...element,
                x: nextPosition.x,
                y: nextPosition.y,
                z: nextPosition.z,
            }
        })
    ), [elements, pathPreviewEnabled, pathPreviewProgress])

    const positionedCameras = useMemo(() => (
        cameras.map(camera => {
            if (!pathPreviewEnabled) return camera
            const nextPosition = sampleMotionPath(camera.motionPath, camera, pathPreviewProgress)
            return {
                ...camera,
                x: nextPosition.x,
                y: nextPosition.y,
                z: nextPosition.z,
            }
        })
    ), [cameras, pathPreviewEnabled, pathPreviewProgress])

    const resolvedCameras = useMemo(() => (
        positionedCameras.map(camera => {
            if (!camera.targetElementId) return camera
            const targetElement = positionedElements.find(element => element.id === camera.targetElementId)
            if (!targetElement) return camera
            const focus = getDirectorStageFocusPoint(targetElement)
            return {
                ...camera,
                targetX: focus.x,
                targetY: focus.y,
                targetZ: focus.z,
            }
        })
    ), [positionedCameras, positionedElements])

    const resolvedElements = useMemo(() => (
        positionedElements.map(element => {
            const lookMode = element.lookAtMode || 'manual'
            if (lookMode === 'manual') return element
            let target: { x: number; z: number } | null = null
            if (lookMode === 'active-camera') {
                const activeCamera = resolvedCameras.find(camera => camera.id === activeCameraId) || resolvedCameras[0]
                if (activeCamera) target = { x: activeCamera.x, z: activeCamera.z }
            } else if (lookMode === 'camera' && element.lookAtCameraId) {
                const targetCamera = resolvedCameras.find(camera => camera.id === element.lookAtCameraId)
                if (targetCamera) target = { x: targetCamera.x, z: targetCamera.z }
            } else if (lookMode === 'element' && element.lookAtElementId) {
                const targetElement = positionedElements.find(item => item.id === element.lookAtElementId && item.id !== element.id)
                if (targetElement) target = { x: targetElement.x, z: targetElement.z }
            } else if (lookMode === 'point') {
                target = {
                    x: element.lookAtPointX ?? element.x,
                    z: element.lookAtPointZ ?? element.z,
                }
            }
            if (!target) return element
            return {
                ...element,
                rotationY: getLookAtRotation(element, target),
            }
        })
    ), [activeCameraId, positionedElements, resolvedCameras])

    const selectedElements = useMemo(
        () => selectedElementIds
            .map(elementId => elements.find(element => element.id === elementId) || null)
            .filter((element): element is DirectorStageElement => element !== null),
        [elements, selectedElementIds],
    )

    const selectedElement = useMemo(
        () => (selectedElementIds.length === 1 ? selectedElements[0] || null : null),
        [selectedElementIds.length, selectedElements],
    )

    const resolvedSelectedElement = useMemo(
        () => (selectedElement ? resolvedElements.find(element => element.id === selectedElement.id) || selectedElement : null),
        [resolvedElements, selectedElement],
    )

    const selectedCrowdGroupId = useMemo(() => {
        if (!selectedElementId) return undefined
        const target = elements.find(element => element.id === selectedElementId)
        return target?.kind === 'crowd' ? target.crowdGroupId : undefined
    }, [elements, selectedElementId])

    const activeCamera = useMemo(
        () => cameras.find(camera => camera.id === activeCameraId) || null,
        [activeCameraId, cameras],
    )

    const resolvedActiveCamera = useMemo(
        () => resolvedCameras.find(camera => camera.id === activeCameraId) || null,
        [activeCameraId, resolvedCameras],
    )

    const activeConnectedSource = useMemo(
        () => connectedSources.find(source => source.nodeId === backgroundSourceNodeId) || null,
        [backgroundSourceNodeId, connectedSources],
    )

    const effectiveBackground = backgroundUrl || activeConnectedSource?.rawSource || ''
    const backgroundReady = Boolean(effectiveBackground) || backgroundColor !== DIRECTOR_STAGE_DEFAULT_BACKGROUND_COLOR
    const selectedElementLocked = Boolean(selectedElement?.locked)
    const selectedLockedCount = useMemo(
        () => selectedElements.filter(element => element.locked).length,
        [selectedElements],
    )
    const selectedGroupIds = useMemo(
        () => uniqueIds(selectedElements.map(element => element.groupId || '')),
        [selectedElements],
    )
    const canGroupSelection = selectedElements.length > 1
    const canUngroupSelection = selectedElements.some(element => Boolean(element.groupId))
    const activeCameraLocked = Boolean(activeCamera?.locked)
    const totalShotDuration = useMemo(
        () => cameras.reduce((sum, camera) => sum + (camera.durationSeconds || 0), 0),
        [cameras],
    )
    const primaryShotCount = useMemo(
        () => cameras.filter(camera => (camera.priority || 'support') === 'primary').length,
        [cameras],
    )
    const selectedElementLookMode = (selectedElement?.lookAtMode || 'manual') as DirectorStageLookAtMode
    const currentPathOwner = selectedElement || activeCamera
    const currentMotionPath = useMemo(
        () => cloneMotionPath(currentPathOwner?.motionPath),
        [currentPathOwner],
    )
    const currentPathPoints = currentMotionPath.points
    const selectedPathPoint = useMemo(
        () => currentPathPoints.find(point => point.id === selectedPathPointId) || null,
        [currentPathPoints, selectedPathPointId],
    )

    const selectElements = useCallback((
        elementIds: string[],
        options?: { additive?: boolean; toggle?: boolean; primaryId?: string },
    ) => {
        const expandedIds = expandElementSelection(elements, elementIds)
        const currentExpanded = expandElementSelection(elements, selectedElementIds)
        let nextIds = expandedIds
        if (options?.additive) {
            if (options.toggle) {
                const nextSet = new Set(currentExpanded)
                expandedIds.forEach(elementId => {
                    if (nextSet.has(elementId)) {
                        nextSet.delete(elementId)
                    } else {
                        nextSet.add(elementId)
                    }
                })
                nextIds = Array.from(nextSet)
            } else {
                nextIds = uniqueIds([...currentExpanded, ...expandedIds])
            }
        }
        const nextPrimary = nextIds.includes(options?.primaryId || '')
            ? options?.primaryId || ''
            : nextIds[0] || ''
        setSelectedElementIds(nextIds)
        setSelectedElementId(nextPrimary)
    }, [elements, selectedElementIds])

    const clearElementSelection = useCallback(() => {
        setSelectedElementIds([])
        setSelectedElementId('')
    }, [])

    useEffect(() => {
        if (currentPathPoints.length === 0) {
            if (selectedPathPointId) setSelectedPathPointId('')
            return
        }
        if (!selectedPathPointId || !currentPathPoints.some(point => point.id === selectedPathPointId)) {
            setSelectedPathPointId(currentPathPoints[0].id)
        }
    }, [currentPathPoints, selectedPathPointId])

    const updateElement = useCallback((patch: DirectorStageElementPatch) => {
        if (!selectedElementId) return
        const transformIds = resolveSelectionTransformIds(elements, selectedElementId, selectedElementIds)
        setElements(current => applyElementPatchToIds(current, transformIds, selectedElementId, patch))
    }, [elements, selectedElementId, selectedElementIds])

    const updateCamera = useCallback((patch: Partial<DirectorStageCamera>) => {
        if (!activeCameraId) return
        const clearsBinding = patch.targetElementId === undefined && (patch.targetX !== undefined || patch.targetY !== undefined || patch.targetZ !== undefined)
        setCameras(current => current.map(camera => (
            camera.id === activeCameraId
                ? {
                    ...camera,
                    ...patch,
                    ...(clearsBinding ? { targetElementId: undefined } : {}),
                }
                : camera
        )))
    }, [activeCameraId])

    const handleToolToggle = useCallback((tool: 'background' | 'ground' | 'crowd' | 'camera' | 'frame') => {
        setActiveTool(current => current === tool ? null : tool)
    }, [])

    const setSelectedElementLookMode = useCallback((mode: DirectorStageLookAtMode) => {
        if (!selectedElement) return
        updateElement({
            lookAtMode: mode,
            ...(mode === 'manual'
                ? {
                    lookAtCameraId: undefined,
                    lookAtElementId: undefined,
                    lookAtPointX: undefined,
                    lookAtPointY: undefined,
                    lookAtPointZ: undefined,
                }
                : {}),
        })
    }, [selectedElement, updateElement])

    const updateCurrentMotionPath = useCallback((updater: (path: DirectorStageMotionPath) => DirectorStageMotionPath) => {
        if (selectedElement) {
            updateElement({ motionPath: updater(cloneMotionPath(selectedElement.motionPath)) })
            return
        }
        if (activeCamera) {
            updateCamera({ motionPath: updater(cloneMotionPath(activeCamera.motionPath)) })
        }
    }, [activeCamera, selectedElement, updateCamera, updateElement])

    const recordCurrentPathPoint = useCallback(() => {
        const pointSource = selectedElement || activeCamera
        if (!pointSource) return
        updateCurrentMotionPath((path) => {
            const nextPoint = createDirectorStagePathPoint(pointSource.x, pointSource.y, pointSource.z)
            setSelectedPathPointId(nextPoint.id)
            return {
                ...path,
                points: [...path.points, nextPoint],
            }
        })
    }, [activeCamera, selectedElement, updateCurrentMotionPath])

    const replaceSelectedPathPointFromCurrentPose = useCallback(() => {
        const pointSource = selectedElement || activeCamera
        if (!pointSource || !selectedPathPointId) return
        updateCurrentMotionPath((path) => ({
            ...path,
            points: path.points.map(point => (
                point.id === selectedPathPointId
                    ? { ...point, x: pointSource.x, y: pointSource.y, z: pointSource.z }
                    : point
            )),
        }))
    }, [activeCamera, selectedElement, selectedPathPointId, updateCurrentMotionPath])

    const updateSelectedPathPoint = useCallback((patch: Partial<DirectorStagePathPoint>) => {
        if (!selectedPathPointId) return
        updateCurrentMotionPath((path) => ({
            ...path,
            points: path.points.map(point => (
                point.id === selectedPathPointId
                    ? { ...point, ...patch }
                    : point
            )),
        }))
    }, [selectedPathPointId, updateCurrentMotionPath])

    const removeSelectedPathPoint = useCallback(() => {
        if (!selectedPathPointId) return
        updateCurrentMotionPath((path) => ({
            ...path,
            points: path.points.filter(point => point.id !== selectedPathPointId),
        }))
        setSelectedPathPointId('')
    }, [selectedPathPointId, updateCurrentMotionPath])

    const clearCurrentMotionPath = useCallback(() => {
        updateCurrentMotionPath((path) => ({ ...path, points: [], loop: false }))
        setSelectedPathPointId('')
    }, [updateCurrentMotionPath])

    const toggleCurrentMotionPathLoop = useCallback(() => {
        updateCurrentMotionPath((path) => ({ ...path, loop: !path.loop }))
    }, [updateCurrentMotionPath])

    const applyCameraTemplate = useCallback((templateId: DirectorStageCameraTemplate) => {
        const nextCameras = createTemplateCameraSet(templateId, elements, selectedElementId, cameras.length)
        if (nextCameras.length === 0) return
        setCameras(current => [...current, ...nextCameras])
        setActiveCameraId(nextCameras[0]?.id || '')
        clearElementSelection()
        setActiveTool(null)
        showAlert?.(`已追加 ${getCameraTemplateLabel(templateId)}`)
    }, [cameras.length, clearElementSelection, elements, selectedElementId, showAlert])

    const toggleSelectedElementLock = useCallback(() => {
        if (!selectedElementId) return
        const transformIds = resolveSelectionTransformIds(elements, selectedElementId, selectedElementIds)
        setElements(current => applyElementPatchToIds(current, transformIds, selectedElementId, { locked: !selectedElementLocked }))
    }, [elements, selectedElementId, selectedElementIds, selectedElementLocked])

    const lockSelectedElements = useCallback(() => {
        if (selectedElementIds.length === 0) return
        setElements(current => current.map(element => (
            selectedElementIds.includes(element.id)
                ? (element.kind === 'advanced'
                    ? applyAdvancedPatch(element, { locked: true })
                    : applyCrowdPatch(element, { locked: true }))
                : element
        )))
    }, [selectedElementIds])

    const unlockSelectedElements = useCallback(() => {
        if (selectedElementIds.length === 0) return
        setElements(current => current.map(element => (
            selectedElementIds.includes(element.id)
                ? (element.kind === 'advanced'
                    ? applyAdvancedPatch(element, { locked: false })
                    : applyCrowdPatch(element, { locked: false }))
                : element
        )))
    }, [selectedElementIds])

    const groupSelectedElements = useCallback(() => {
        if (selectedElementIds.length < 2) return
        const nextGroupId = `director-group-${Date.now()}`
        setElements(current => current.map(element => (
            selectedElementIds.includes(element.id)
                ? (element.kind === 'advanced'
                    ? applyAdvancedPatch(element, { groupId: nextGroupId })
                    : applyCrowdPatch(element, { groupId: nextGroupId }))
                : element
        )))
        showAlert?.('已创建编组')
    }, [selectedElementIds, showAlert])

    const ungroupSelectedElements = useCallback(() => {
        if (selectedElementIds.length === 0) return
        setElements(current => current.map(element => (
            selectedElementIds.includes(element.id)
                ? (element.kind === 'advanced'
                    ? applyAdvancedPatch(element, { groupId: undefined })
                    : applyCrowdPatch(element, { groupId: undefined }))
                : element
        )))
        showAlert?.('已解除编组')
    }, [selectedElementIds, showAlert])

    const toggleActiveCameraLock = useCallback(() => {
        if (!activeCameraId) return
        setCameras(current => current.map(camera => (
            camera.id === activeCameraId
                ? { ...camera, locked: !camera.locked }
                : camera
        )))
    }, [activeCameraId])

    const addCrowd = useCallback(() => {
        const nextBatch = createCrowdBatch(crowdBuilder)
        setElements(current => [...current, ...nextBatch])
        const nextSelection = expandElementSelection([...elements, ...nextBatch], nextBatch[0]?.id ? [nextBatch[0].id] : [])
        setSelectedElementIds(nextSelection)
        setSelectedElementId(nextSelection[0] || '')
        setActiveTool(null)
    }, [crowdBuilder, elements])

    const addAdvanced = useCallback(() => {
        const next = createDirectorStageAdvancedElement(elements.length + 1)
        setElements(current => [...current, next])
        setSelectedElementIds([next.id])
        setSelectedElementId(next.id)
        setActiveTool(null)
    }, [elements.length])

    const addCamera = useCallback(() => {
        const next = createDirectorStageShotCamera(cameras.length)
        setCameras(current => [...current, next])
        setActiveCameraId(next.id)
        clearElementSelection()
        setActiveTool(null)
    }, [cameras.length, clearElementSelection])

    const cloneCamera = useCallback(() => {
        if (!activeCamera) return
        const next = { ...activeCamera, id: `director-shot-${Date.now()}-copy`, name: `${activeCamera.name} 复制` }
        setCameras(current => [...current, next])
        setActiveCameraId(next.id)
        clearElementSelection()
        setActiveTool(null)
    }, [activeCamera, clearElementSelection])

    const createReverseShot = useCallback(() => {
        if (!activeCamera || !resolvedActiveCamera) return
        const next = {
            ...activeCamera,
            id: `director-shot-${Date.now()}-reverse`,
            name: `${activeCamera.name} 反打`,
            x: resolvedActiveCamera.targetX - (activeCamera.x - resolvedActiveCamera.targetX),
            z: resolvedActiveCamera.targetZ - (activeCamera.z - resolvedActiveCamera.targetZ),
        }
        setCameras(current => [...current, next])
        setActiveCameraId(next.id)
        clearElementSelection()
        setActiveTool(null)
    }, [activeCamera, clearElementSelection, resolvedActiveCamera])

    const deleteSelected = useCallback(() => {
        if (selectedElementIds.length > 0 || selectedElementId) {
            const idsToDelete = new Set(expandElementSelection(elements, selectedElementIds.length > 0 ? selectedElementIds : [selectedElementId]))
            setElements(current => {
                if (idsToDelete.size === 0) return current
                return current.filter(element => !idsToDelete.has(element.id))
            })
            clearElementSelection()
            return
        }
        if (activeCameraId && cameras.length > 1) {
            const next = cameras.filter(camera => camera.id !== activeCameraId)
            setCameras(next)
            setActiveCameraId(next[0]?.id || '')
            setViewportMode('director')
        }
    }, [activeCameraId, cameras, clearElementSelection, elements, selectedElementId, selectedElementIds])

    useEffect(() => {
        deleteSelectedRef.current = deleteSelected
    }, [deleteSelected])

    const handleZoom = useCallback((direction: 'in' | 'out') => {
        if (viewportMode === 'camera' && activeCamera) {
            if (activeCamera.locked) return
            updateCamera({
                fov: Math.min(90, Math.max(24, activeCamera.fov + (direction === 'in' ? -3 : 3))),
            })
            return
        }
        setOrbit(current => ({
            ...current,
            distance: Math.min(32, Math.max(1, current.distance + (direction === 'in' ? -0.8 : 0.8))),
        }))
    }, [activeCamera, updateCamera, viewportMode])

    const handleOrbitChange = useCallback((nextOrbit: DirectorStageOrbit) => {
        pendingOrbitRef.current = nextOrbit
        if (orbitFrameRef.current !== null) return
        orbitFrameRef.current = window.requestAnimationFrame(() => {
            orbitFrameRef.current = null
            const pendingOrbit = pendingOrbitRef.current
            if (!pendingOrbit) return
            setOrbit(current => {
                if (
                    Math.abs(current.yaw - pendingOrbit.yaw) < 0.0001
                    && Math.abs(current.pitch - pendingOrbit.pitch) < 0.0001
                    && Math.abs(current.distance - pendingOrbit.distance) < 0.0001
                    && Math.abs(current.targetX - pendingOrbit.targetX) < 0.0001
                    && Math.abs(current.targetY - pendingOrbit.targetY) < 0.0001
                    && Math.abs(current.targetZ - pendingOrbit.targetZ) < 0.0001
                ) {
                    return current
                }
                return pendingOrbit
            })
        })
    }, [])

    const uploadImage = useCallback(async (file: File) => {
        if (!projectId) {
            showAlert?.('请先保存项目，再使用全景环绕控制的图片上传与截图导出。')
            return null
        }
        return uploadProjectFile(projectId, file, 'images', '')
    }, [projectId, showAlert])

    const handleBackgroundUpload = useCallback(async (file: File | null) => {
        if (!file) return
        try {
            const uploaded = await uploadImage(file)
            if (!uploaded?.url) return
            setBackgroundUrl(uploaded.url)
            setBackgroundName(uploaded.filename || file.name)
            setBackgroundSourceNodeId('')
            setActiveTool(null)
            showAlert?.('背景已上传')
        } catch (error) {
            console.error('[DirectorStage] Upload background failed:', error)
            showAlert?.('背景上传失败')
        }
    }, [showAlert, uploadImage])

    const handleGroundPlanUpload = useCallback(async (file: File | null) => {
        if (!file) return
        try {
            const uploaded = await uploadImage(file)
            if (!uploaded?.url) return
            setGroundPlanUrl(uploaded.url)
            setGroundPlanName(uploaded.filename || file.name)
            setShowGroundPlan(true)
            setActiveTool(null)
            showAlert?.('地面平面图已上传')
        } catch (error) {
            console.error('[DirectorStage] Upload ground plan failed:', error)
            showAlert?.('地面平面图上传失败')
        }
    }, [showAlert, uploadImage])

    const clearBackground = useCallback(() => {
        setBackgroundUrl('')
        setBackgroundName('')
        setBackgroundSourceNodeId('')
    }, [])

    const clearGroundPlan = useCallback(() => {
        setGroundPlanUrl('')
        setGroundPlanName('')
        setGroundPlanScale(8)
        setGroundPlanRotation(0)
        setGroundPlanOffsetX(0)
        setGroundPlanOffsetZ(0)
        setShowGroundPlan(false)
    }, [])

    const faceActiveCamera = useCallback(() => {
        if (!selectedElement || !activeCamera || selectedElement.locked) return
        const dx = activeCamera.x - selectedElement.x
        const dz = activeCamera.z - selectedElement.z
        updateElement({ rotationY: normalizeDirectorStageRotation(THREE.MathUtils.radToDeg(Math.atan2(dx, dz))) })
    }, [activeCamera, selectedElement, updateElement])

    const bindCameraTarget = useCallback((elementId: string) => {
        if (!activeCameraId || activeCameraLocked) return
        setCameras(current => current.map(camera => camera.id === activeCameraId ? { ...camera, targetElementId: elementId } : camera))
    }, [activeCameraId, activeCameraLocked])

    const clearCameraTarget = useCallback(() => {
        if (!activeCameraId || !resolvedActiveCamera || activeCameraLocked) return
        setCameras(current => current.map(camera => (
            camera.id === activeCameraId
                ? {
                    ...camera,
                    targetElementId: undefined,
                    targetX: resolvedActiveCamera.targetX,
                    targetY: resolvedActiveCamera.targetY,
                    targetZ: resolvedActiveCamera.targetZ,
                }
                : camera
        )))
    }, [activeCameraId, activeCameraLocked, resolvedActiveCamera])

    const capture = useCallback(async () => {
        if (!viewportRef.current) return
        if (!projectId) {
            showAlert?.('请先保存项目，再使用全景环绕控制的截图导出。')
            return
        }
        try {
            const snapshot = await viewportRef.current.captureImage({ scale: 2.5, frame })
            if (!snapshot) return
            const file = await toDataUrlFile(snapshot, `${activeCamera ? activeCamera.name : 'director-stage'}-${Date.now()}.png`)
            const uploaded = await uploadImage(file)
            if (!uploaded?.url) return
            const layout = getNodeLayout(node.id)
            const x = (layout?.x ?? node.x) + (layout?.width ?? node.width) + 60
            const y = layout?.y ?? node.y
            const resultNode = addNode('input-image', x, y, uploaded.url)
            connect(node.id, resultNode.id, 'default')
            showAlert?.('截图已创建为图片节点')
        } catch (error) {
            console.error('[DirectorStage] Capture failed:', error)
            showAlert?.('截图失败')
        }
    }, [activeCamera, addNode, connect, frame, getNodeLayout, node.height, node.id, node.width, node.x, node.y, projectId, showAlert, uploadImage])

    const exportShotBundle = useCallback(async () => {
        if (!viewportRef.current || resolvedCameras.length === 0) {
            showAlert?.('当前没有可导出的镜头')
            return
        }
        setIsBundleExporting(true)
        try {
            const timestampLabel = timestamp()
            const captures = await viewportRef.current.captureShotSet({
                cameras: resolvedCameras,
                frame,
                scale: 2.5,
            })
            if (captures.length === 0) {
                showAlert?.('整套导出失败，未生成镜头截图')
                return
            }

            const rows = captures.map((captureItem, index) => {
                const camera = resolvedCameras.find(item => item.id === captureItem.cameraId)
                return {
                    序号: index + 1,
                    镜头名: captureItem.cameraName,
                    镜头类型: getShotTypeLabel(camera?.shotType),
                    优先级: getShotPriorityLabel(camera?.priority),
                    用途: camera?.usage || '',
                    备注: camera?.notes || '',
                    时长秒: camera?.durationSeconds || 0,
                    FOV: camera?.fov || 0,
                    机位X: camera?.x ?? 0,
                    机位Y: camera?.y ?? 0,
                    机位Z: camera?.z ?? 0,
                    目标X: camera?.targetX ?? 0,
                    目标Y: camera?.targetY ?? 0,
                    目标Z: camera?.targetZ ?? 0,
                }
            })

            const shotListBlob = rowsToCsvBlob(rows)
            const manifestBlob = new Blob([JSON.stringify({
                exportedAt: new Date().toISOString(),
                frame,
                totalShots: captures.length,
                background: backgroundName || backgroundUrl || '',
                groundPlan: groundPlanName || groundPlanUrl || '',
                shots: rows,
            }, null, 2)], { type: 'application/json;charset=utf-8' })

            const directoryPicker = (window as Window & { showDirectoryPicker?: (options?: Record<string, any>) => Promise<any> }).showDirectoryPicker
            if (directoryPicker) {
                const directoryHandle = await directoryPicker({ mode: 'readwrite' })
                for (const captureItem of captures) {
                    const fileHandle = await directoryHandle.getFileHandle(`${captureItem.cameraName}_${timestampLabel}.png`, { create: true })
                    const writable = await fileHandle.createWritable()
                    const response = await fetch(captureItem.dataUrl)
                    await writable.write(await response.blob())
                    await writable.close()
                }
                const shotListHandle = await directoryHandle.getFileHandle(`全景环绕控制_ShotList_${timestampLabel}.csv`, { create: true })
                const shotListWritable = await shotListHandle.createWritable()
                await shotListWritable.write(shotListBlob)
                await shotListWritable.close()

                const manifestHandle = await directoryHandle.getFileHandle(`全景环绕控制_manifest_${timestampLabel}.json`, { create: true })
                const manifestWritable = await manifestHandle.createWritable()
                await manifestWritable.write(manifestBlob)
                await manifestWritable.close()
                showAlert?.(`已导出 ${captures.length} 个镜头到目标文件夹`)
                return
            }

            captures.forEach((captureItem) => {
                fetch(captureItem.dataUrl)
                    .then(response => response.blob())
                    .then(blob => downloadBlob(blob, `${captureItem.cameraName}_${timestampLabel}.png`))
                    .catch(error => console.error('[DirectorStage] Download shot image failed:', error))
            })
            downloadBlob(shotListBlob, `全景环绕控制_ShotList_${timestampLabel}.csv`)
            downloadBlob(manifestBlob, `全景环绕控制_manifest_${timestampLabel}.json`)
            showAlert?.(`已触发 ${captures.length} 个镜头和清单文件下载`)
        } catch (error) {
            console.error('[DirectorStage] Export shot bundle failed:', error)
            showAlert?.('整套导出失败')
        } finally {
            setIsBundleExporting(false)
        }
    }, [
        backgroundName,
        backgroundUrl,
        frame,
        groundPlanName,
        groundPlanUrl,
        resolvedCameras,
        showAlert,
    ])

    const clearStage = useCallback(() => {
        const nextCamera = createDirectorStageShotCamera(0)
        setBackgroundUrl('')
        setBackgroundName('')
        setBackgroundSourceNodeId('')
        setBackgroundColor(DIRECTOR_STAGE_DEFAULT_BACKGROUND_COLOR)
        clearGroundPlan()
        setElements([])
        clearElementSelection()
        setCameras([nextCamera])
        setActiveCameraId(nextCamera.id)
        setViewportMode('director')
        setFrame('none')
        setOrbit({ ...DIRECTOR_STAGE_DEFAULT_ORBIT })
        setShowCameras(true)
        setShowGrid(true)
        setShowTargets(true)
        setShowFocus(true)
        setShowFrameGuides(false)
        setShowElementNumbers(true)
        setShowPaths(true)
        setPathPreviewEnabled(false)
        setPathPreviewPlaying(false)
        setPathPreviewProgress(0)
        setSelectedPathPointId('')
        setShowCompositionSafeArea(false)
        setShowCompositionCenterCross(false)
        setShowCompositionHeadroom(false)
        setShowCompositionEyeline(false)
        setActiveTool(null)
    }, [clearElementSelection, clearGroundPlan])

    return createPortal(
        <div
            className="director-stage-legacy fixed inset-0 z-[10100] flex items-center justify-center bg-black/72 backdrop-blur-sm"
            style={{ WebkitAppRegion: 'no-drag' } as any}
            onPointerDown={event => event.stopPropagation()}
            onMouseDown={event => event.stopPropagation()}
            onClick={event => event.stopPropagation()}
        >
            <div
                className={`relative flex flex-col overflow-hidden rounded-[34px] border border-white/14 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_22%),linear-gradient(180deg,#0a1220_0%,#071019_100%)] text-white shadow-[0_28px_140px_rgba(0,0,0,0.5)] ${isFullscreen ? 'h-[96vh] w-[96vw]' : 'h-[90vh] w-[94vw] max-w-[1680px]'}`}
                style={{ WebkitAppRegion: 'no-drag' } as any}
            >
                {toast ? <div className="director-stage-toast">{toast}</div> : null}

                <input
                    ref={backgroundInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={event => {
                        void handleBackgroundUpload(event.target.files?.[0] || null)
                        event.target.value = ''
                    }}
                />
                <input
                    ref={groundPlanInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={event => {
                        void handleGroundPlanUpload(event.target.files?.[0] || null)
                        event.target.value = ''
                    }}
                />

                <div
                    className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.03))] px-7 py-3 backdrop-blur-2xl"
                    style={{ WebkitAppRegion: 'no-drag' } as any}
                >
                    <div className="flex items-center justify-between gap-8">
                        <div className="flex-1" />
                        <div className="rounded-full border border-white/14 bg-white/8 p-1 pointer-events-auto shadow-[0_12px_30px_rgba(0,0,0,0.24)] backdrop-blur-xl" style={{ WebkitAppRegion: 'no-drag' } as any}>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        clearElementSelection()
                                        setViewportMode('director')
                                    }}
                                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${viewportMode === 'director' ? 'bg-white text-[#08111f] shadow-[0_8px_24px_rgba(255,255,255,0.2)]' : 'text-white/68 hover:bg-white/8'}`}
                                >
                                    环绕总览
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        clearElementSelection()
                                        setViewportMode('camera')
                                    }}
                                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${viewportMode === 'camera' ? 'bg-[#007AFF] text-white shadow-[0_8px_24px_rgba(0,122,255,0.35)]' : 'text-white/68 hover:bg-white/8'}`}
                                >
                                    镜头预览
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-1 items-center justify-end gap-2">
                            <button
                                type="button"
                                aria-label={isFullscreen ? '退出全屏' : '进入全屏'}
                                onClick={() => setIsFullscreen(current => !current)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/80 transition hover:bg-white/10"
                            >
                                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                            </button>
                            <button
                                type="button"
                                aria-label="关闭全景工作台"
                                onClick={onClose}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/80 transition hover:bg-white/10"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex min-h-0 flex-1">
                    {/* Tool Drawer: icon rail (44px) + optional tool panel (240px, Task 5) */}
                    <div className="flex h-full shrink-0">
                        <div className="flex h-full w-[44px] flex-col items-center gap-1 border-r border-white/8 bg-[rgba(12,18,30,0.96)] py-3">
                            <RailIconButton
                                icon={<ImagePlus size={14} />} label="空间背景" accent="cyan"
                                active={activeTool === 'background'}
                                onClick={() => handleToolToggle('background')}
                            />
                            <RailIconButton
                                icon={<Grid3X3 size={14} />} label="地面图" accent="cyan"
                                active={activeTool === 'ground'}
                                onClick={() => handleToolToggle('ground')}
                            />
                            <RailIconButton
                                icon={<Users size={14} />} label="群组人偶" accent="cyan"
                                active={activeTool === 'crowd'}
                                onClick={() => handleToolToggle('crowd')}
                            />
                            <RailIconButton
                                icon={<User size={14} />} label="主角人偶" accent="violet"
                                onClick={addAdvanced}
                            />
                            <RailIconButton
                                icon={<Camera size={14} />} label="镜头位" accent="amber"
                                active={activeTool === 'camera'}
                                onClick={() => handleToolToggle('camera')}
                            />
                            <RailIconButton
                                icon={<ScanLine size={14} />} label={frame === 'none' ? '取景框：无' : `取景框：${frame}`} accent="amber"
                                active={activeTool === 'frame'}
                                onClick={() => handleToolToggle('frame')}
                            />

                            <div className="my-1 h-px w-5 bg-white/14" aria-hidden />

                            <RailIconButton
                                icon={<BadgeInfo size={14} />} label="记录画面" accent="amber"
                                onClick={capture}
                            />
                            <RailIconButton
                                icon={<Download size={14} />} label={isBundleExporting ? '导出中…' : '整套导出'} accent="amber"
                                disabled={isBundleExporting || resolvedCameras.length === 0}
                                onClick={() => { void exportShotBundle() }}
                            />
                            <RailIconButton
                                icon={<Move3D size={14} />} label="朝向镜头" accent="amber"
                                disabled={!selectedElement || selectedElementLocked || selectedElementLookMode !== 'manual'}
                                onClick={faceActiveCamera}
                            />
                            <RailIconButton
                                icon={<Copy size={14} />} label="编组" accent="cyan"
                                disabled={!canGroupSelection}
                                onClick={groupSelectedElements}
                            />
                            <RailIconButton
                                icon={<Ungroup size={14} />} label="解组" accent="neutral"
                                disabled={!canUngroupSelection}
                                onClick={ungroupSelectedElements}
                            />
                            <RailIconButton
                                icon={<Trash2 size={14} />} label="删除当前选中" accent="rose"
                                disabled={selectedElementIds.length === 0 && cameras.length <= 1}
                                onClick={deleteSelected}
                            />
                            <RailIconButton
                                icon={<RotateCcw size={14} />} label="重置环绕" accent="neutral"
                                onClick={() => viewportRef.current?.resetView()}
                            />
                            <RailIconButton
                                icon={<Eraser size={14} />} label="清空空间" accent="neutral"
                                onClick={clearStage}
                            />
                        </div>
                        {activeTool === 'background' ? (
                            <ToolPanelShell icon={<ImagePlus size={11} />} title="空间背景" accent="cyan" onClose={() => setActiveTool(null)}>
                                <button
                                    type="button"
                                    onClick={() => backgroundInputRef.current?.click()}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400/16 px-3 py-2 text-[12px] font-medium text-cyan-100 transition hover:bg-cyan-400/24"
                                >
                                    <ImagePlus size={13} />
                                    {backgroundUrl ? '替换背景' : '上传背景图片'}
                                </button>
                                <div className="mt-3 rounded-xl border border-white/10 bg-black/16 p-2.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="text-[11px] font-medium text-white/78">连线引用</div>
                                        <div className="rounded-full bg-white/8 px-1.5 py-0.5 text-[10px] text-white/60">{connectedSources.length} 来源</div>
                                    </div>
                                    {connectedSources.length > 0 ? (
                                        <div className="mt-2 space-y-1.5">
                                            {connectedSources.map(source => {
                                                const active = source.nodeId === backgroundSourceNodeId
                                                return (
                                                    <button
                                                        key={source.nodeId}
                                                        type="button"
                                                        onClick={() => {
                                                            setBackgroundUrl('')
                                                            setBackgroundName('')
                                                            setBackgroundSourceNodeId(source.nodeId)
                                                        }}
                                                        className={`flex w-full items-center justify-between gap-2 rounded-lg border px-2 py-1.5 text-left transition ${active ? 'border-cyan-300/35 bg-cyan-400/12' : 'border-white/8 bg-white/[0.03] hover:border-white/16 hover:bg-white/[0.06]'}`}
                                                    >
                                                        <div className="min-w-0">
                                                            <div className="truncate text-[12px] text-white">{source.label}</div>
                                                            <div className="mt-0.5 text-[10px] text-white/44">{source.previewLabel}</div>
                                                        </div>
                                                        <div className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] ${active ? 'bg-cyan-300/18 text-cyan-100' : 'bg-white/8 text-white/56'}`}>
                                                            {active ? '已引用' : '引用'}
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    ) : null}
                                </div>
                                <div className="mt-3">
                                    <div className="mb-1.5 text-[10px] uppercase tracking-[0.16em] text-white/50">舞台底色</div>
                                    <div className="grid grid-cols-6 gap-1">
                                        {DIRECTOR_STAGE_BACKGROUND_COLORS.map(option => (
                                            <button
                                                key={option.color}
                                                type="button"
                                                onClick={() => setBackgroundColor(option.color)}
                                                className={`h-[22px] rounded-md border transition ${backgroundColor === option.color ? 'border-white/60 ring-1 ring-white/30' : 'border-white/10 hover:border-white/24'}`}
                                                style={{ backgroundColor: option.color }}
                                                title={option.label}
                                            />
                                        ))}
                                    </div>
                                </div>
                                {(backgroundUrl || activeConnectedSource) ? (
                                    <button
                                        type="button"
                                        onClick={clearBackground}
                                        className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-white/8 px-3 py-2 text-[11px] text-white/72 transition hover:bg-white/12"
                                    >
                                        清除背景
                                    </button>
                                ) : null}
                            </ToolPanelShell>
                        ) : null}
                        {activeTool === 'ground' ? (
                            <ToolPanelShell icon={<Grid3X3 size={11} />} title="地面平面图" accent="cyan" onClose={() => setActiveTool(null)}>
                                <button
                                    type="button"
                                    onClick={() => groundPlanInputRef.current?.click()}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400/16 px-3 py-2 text-[12px] font-medium text-cyan-100 transition hover:bg-cyan-400/24"
                                >
                                    <ImagePlus size={13} />
                                    {groundPlanUrl ? '替换地面图' : '上传地面图'}
                                </button>
                                <label className="mt-2.5 flex items-center justify-between rounded-xl border border-white/8 bg-black/15 px-2.5 py-1.5 text-[11px] text-white/76">
                                    <span>显示地面图</span>
                                    <input type="checkbox" checked={showGroundPlan} onChange={(event) => setShowGroundPlan(event.target.checked)} className="h-3.5 w-3.5 accent-cyan-400" />
                                </label>
                                <div className={`mt-2.5 space-y-2 ${!groundPlanUrl ? 'pointer-events-none opacity-45' : ''}`}>
                                    <SliderField label="缩放" value={groundPlanScale} min={2} max={20} step={0.1} accentClass="accent-cyan-400" onChange={setGroundPlanScale} />
                                    <SliderField label="透明度" value={groundPlanOpacity} min={0.1} max={1} step={0.01} accentClass="accent-cyan-400" onChange={setGroundPlanOpacity} />
                                    <SliderField label="旋转" value={groundPlanRotation} min={-180} max={180} step={1} accentClass="accent-cyan-400" onChange={setGroundPlanRotation} />
                                    <SliderField label="平移 X" value={groundPlanOffsetX} min={-10} max={10} step={0.1} accentClass="accent-cyan-400" onChange={setGroundPlanOffsetX} />
                                    <SliderField label="平移 Z" value={groundPlanOffsetZ} min={-10} max={10} step={0.1} accentClass="accent-cyan-400" onChange={setGroundPlanOffsetZ} />
                                </div>
                                {groundPlanUrl ? (
                                    <button
                                        type="button"
                                        onClick={clearGroundPlan}
                                        className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-white/8 px-3 py-2 text-[11px] text-white/72 transition hover:bg-white/12"
                                    >
                                        清除地面图
                                    </button>
                                ) : null}
                            </ToolPanelShell>
                        ) : null}
                        {activeTool === 'crowd' ? (
                            <ToolPanelShell icon={<Users size={11} />} title="群组人偶" accent="cyan" onClose={() => setActiveTool(null)}>
                                <div className="flex flex-wrap gap-1.5">
                                    {[
                                        { label: '直接添加', value: 'single' as const },
                                        { label: '阵列', value: 'array' as const },
                                        { label: '随机分布', value: 'random' as const },
                                    ].map(option => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setCrowdBuilder(current => ({ ...current, layout: option.value }))}
                                            className={`rounded-full px-2.5 py-1 text-[11px] transition ${crowdBuilder.layout === option.value ? 'bg-cyan-400/20 text-cyan-100 ring-1 ring-cyan-300/35' : 'bg-white/8 text-white/72 hover:bg-white/12'}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                                {crowdBuilder.layout !== 'single' ? (
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        <div>
                                            <div className="mb-1 text-[10px] text-white/52">数量</div>
                                            <input type="number" min={1} max={120} value={crowdBuilder.count} onChange={event => setCrowdBuilder(current => ({ ...current, count: Number(event.target.value) || 1 }))} className="w-full rounded-lg border border-white/10 bg-black/25 px-2 py-1.5 text-[12px] text-white outline-none transition focus:border-cyan-300/40" />
                                        </div>
                                        {crowdBuilder.layout === 'array' ? (
                                            <div>
                                                <div className="mb-1 text-[10px] text-white/52">列数</div>
                                                <input type="number" min={1} max={24} value={crowdBuilder.columns} onChange={event => setCrowdBuilder(current => ({ ...current, columns: Number(event.target.value) || 1 }))} className="w-full rounded-lg border border-white/10 bg-black/25 px-2 py-1.5 text-[12px] text-white outline-none transition focus:border-cyan-300/40" />
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="mb-1 text-[10px] text-white/52">半径</div>
                                                <input type="number" min={1} max={14} step={0.2} value={crowdBuilder.radius} onChange={event => setCrowdBuilder(current => ({ ...current, radius: Number(event.target.value) || 1 }))} className="w-full rounded-lg border border-white/10 bg-black/25 px-2 py-1.5 text-[12px] text-white outline-none transition focus:border-cyan-300/40" />
                                            </div>
                                        )}
                                        {crowdBuilder.layout === 'array' ? (
                                            <>
                                                <div>
                                                    <div className="mb-1 text-[10px] text-white/52">横距</div>
                                                    <input type="number" min={0.5} max={4} step={0.1} value={crowdBuilder.spacingX} onChange={event => setCrowdBuilder(current => ({ ...current, spacingX: Number(event.target.value) || 0.5 }))} className="w-full rounded-lg border border-white/10 bg-black/25 px-2 py-1.5 text-[12px] text-white outline-none transition focus:border-cyan-300/40" />
                                                </div>
                                                <div>
                                                    <div className="mb-1 text-[10px] text-white/52">纵距</div>
                                                    <input type="number" min={0.5} max={4} step={0.1} value={crowdBuilder.spacingZ} onChange={event => setCrowdBuilder(current => ({ ...current, spacingZ: Number(event.target.value) || 0.5 }))} className="w-full rounded-lg border border-white/10 bg-black/25 px-2 py-1.5 text-[12px] text-white outline-none transition focus:border-cyan-300/40" />
                                                </div>
                                            </>
                                        ) : null}
                                    </div>
                                ) : null}
                                <button
                                    type="button"
                                    onClick={addCrowd}
                                    className="mt-3 w-full rounded-xl bg-cyan-400/16 px-3 py-2 text-[12px] font-medium text-cyan-100 transition hover:bg-cyan-400/24"
                                >
                                    {crowdBuilder.layout === 'single' ? '添加普通假人' : '生成批量路人'}
                                </button>
                            </ToolPanelShell>
                        ) : null}
                        {activeTool === 'camera' ? (
                            <ToolPanelShell icon={<Camera size={11} />} title="镜头位" accent="amber" onClose={() => setActiveTool(null)}>
                                <div className="grid grid-cols-1 gap-1.5">
                                    <button
                                        type="button"
                                        onClick={addCamera}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400/18 px-3 py-2 text-[12px] font-medium text-amber-100 transition hover:bg-amber-400/26"
                                    >
                                        <Camera size={13} />
                                        新增机位
                                    </button>
                                    <button
                                        type="button"
                                        onClick={cloneCamera}
                                        disabled={!activeCamera}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-[12px] text-white/76 transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <Copy size={13} />
                                        复制当前机位
                                    </button>
                                    <button
                                        type="button"
                                        onClick={createReverseShot}
                                        disabled={!activeCamera}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-[12px] text-white/76 transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <RotateCcw size={13} />
                                        生成反打机位
                                    </button>
                                </div>
                                <div className="mt-3 rounded-xl border border-white/10 bg-black/16 p-2.5">
                                    <div className="text-[11px] font-medium text-white/82">镜头模板</div>
                                    <div className="mt-2 grid grid-cols-1 gap-1.5">
                                        {DIRECTOR_STAGE_CAMERA_TEMPLATE_OPTIONS.map(option => (
                                            <button
                                                key={option.key}
                                                type="button"
                                                onClick={() => applyCameraTemplate(option.key)}
                                                className="rounded-lg border border-white/8 bg-white/[0.04] px-2.5 py-2 text-left transition hover:border-amber-300/24 hover:bg-amber-400/8"
                                            >
                                                <div className="text-[12px] font-medium text-white">{option.label}</div>
                                                <div className="mt-0.5 text-[10px] leading-[14px] text-white/46">{option.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </ToolPanelShell>
                        ) : null}
                        {activeTool === 'frame' ? (
                            <ToolPanelShell icon={<ScanLine size={11} />} title="画幅 / 构图" accent="amber" onClose={() => setActiveTool(null)}>
                                <div className="flex flex-wrap gap-1.5">
                                    {DIRECTOR_STAGE_FRAME_OPTIONS.map(option => (
                                        <button
                                            key={option.key}
                                            type="button"
                                            onClick={() => setFrame(option.key)}
                                            className={`rounded-full px-2.5 py-1 text-[11px] transition ${frame === option.key ? 'bg-amber-400/20 text-amber-100 ring-1 ring-amber-300/35' : 'bg-white/8 text-white/72 hover:bg-white/12'}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-3 rounded-xl border border-white/10 bg-black/16 p-2.5">
                                    <div className="text-[11px] font-medium text-white/82">构图辅助</div>
                                    <div className="mt-2 grid grid-cols-2 gap-1.5">
                                        <label className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.04] px-2 py-1.5 text-[11px] text-white/74">
                                            <span>安全区</span>
                                            <input type="checkbox" checked={showCompositionSafeArea} onChange={(event) => setShowCompositionSafeArea(event.target.checked)} className="h-3.5 w-3.5 accent-amber-400" />
                                        </label>
                                        <label className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.04] px-2 py-1.5 text-[11px] text-white/74">
                                            <span>中心十字</span>
                                            <input type="checkbox" checked={showCompositionCenterCross} onChange={(event) => setShowCompositionCenterCross(event.target.checked)} className="h-3.5 w-3.5 accent-amber-400" />
                                        </label>
                                        <label className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.04] px-2 py-1.5 text-[11px] text-white/74">
                                            <span>头顶线</span>
                                            <input type="checkbox" checked={showCompositionHeadroom} onChange={(event) => setShowCompositionHeadroom(event.target.checked)} className="h-3.5 w-3.5 accent-amber-400" />
                                        </label>
                                        <label className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.04] px-2 py-1.5 text-[11px] text-white/74">
                                            <span>视线线</span>
                                            <input type="checkbox" checked={showCompositionEyeline} onChange={(event) => setShowCompositionEyeline(event.target.checked)} className="h-3.5 w-3.5 accent-amber-400" />
                                        </label>
                                    </div>
                                </div>
                            </ToolPanelShell>
                        ) : null}
                    </div>

                    <section className="relative min-w-0 flex-1 bg-transparent px-5 pb-5 pt-5">
                        <div className="relative h-full overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl">
                            <div ref={viewportShellRef} className="relative h-full w-full overflow-hidden rounded-[26px]">
                                <DirectorStageViewport
                                    ref={viewportRef}
                                    backgroundSrc={effectiveBackground}
                                    backgroundColor={backgroundColor}
                                    groundPlanSrc={groundPlanUrl}
                                    groundPlanOpacity={groundPlanOpacity}
                                    groundPlanScale={groundPlanScale}
                                    groundPlanRotation={groundPlanRotation}
                                    groundPlanOffsetX={groundPlanOffsetX}
                                    groundPlanOffsetZ={groundPlanOffsetZ}
                                    elements={resolvedElements}
                                    cameras={resolvedCameras}
                                    selectedElementId={selectedElementId || undefined}
                                    selectedElementIds={selectedElementIds}
                                    selectedCrowdGroupId={selectedCrowdGroupId}
                                    activeCameraId={activeCameraId || undefined}
                                    viewportMode={viewportMode}
                                    showGrid={showGrid}
                                    showCameras={showCameras}
                                    showTargets={showTargets}
                                    showFocus={showFocus}
                                    showElementNumbers={showElementNumbers}
                                    showGroundPlan={showGroundPlan}
                                    showPaths={showPaths}
                                    interactionSuspended={isCanvasInteracting}
                                    interactionLocked={pathPreviewEnabled}
                                    orbit={orbit}
                                    onOrbitChange={handleOrbitChange}
                                    onSelectElement={(id, options) => {
                                        if (!id) {
                                            clearElementSelection()
                                            return
                                        }
                                        selectElements([id], { additive: options?.additive, toggle: options?.toggle, primaryId: id })
                                        setActiveTool(null)
                                    }}
                                    onSelectElements={(ids, options) => {
                                        selectElements(ids, { additive: options?.additive, primaryId: ids[0] || '' })
                                        if (ids.length > 0) setActiveTool(null)
                                    }}
                                    onSelectCamera={(id) => {
                                        if (id) setActiveCameraId(id)
                                        clearElementSelection()
                                        setActiveTool(null)
                                    }}
                                    onMoveElement={(id, x, z) => {
                                        selectElements([id], { primaryId: id })
                                        setElements(current => {
                                            const target = current.find(element => element.id === id)
                                            if (!target || target.locked) return current
                                            const activeSelection = selectedElementIds.includes(id)
                                                ? selectedElementIds
                                                : expandElementSelection(current, [id])
                                            const transformIds = resolveSelectionTransformIds(current, id, activeSelection)
                                            return applyElementPatchToIds(current, transformIds, id, { x, z })
                                        })
                                    }}
                                    onMoveElementY={(id, y) => {
                                        selectElements([id], { primaryId: id })
                                        setElements(current => {
                                            const target = current.find(element => element.id === id)
                                            if (!target || target.locked) return current
                                            const activeSelection = selectedElementIds.includes(id)
                                                ? selectedElementIds
                                                : expandElementSelection(current, [id])
                                            const transformIds = resolveSelectionTransformIds(current, id, activeSelection)
                                            return applyElementPatchToIds(current, transformIds, id, { y })
                                        })
                                    }}
                                    onRotateElement={(id, rotationY) => {
                                        selectElements([id], { primaryId: id })
                                        setElements(current => {
                                            const target = current.find(element => element.id === id)
                                            if (!target || target.locked) return current
                                            const activeSelection = selectedElementIds.includes(id)
                                                ? selectedElementIds
                                                : expandElementSelection(current, [id])
                                            const transformIds = resolveSelectionTransformIds(current, id, activeSelection)
                                            return applyElementPatchToIds(current, transformIds, id, { rotationY })
                                        })
                                    }}
                                    onMoveCamera={(id, x, z) => {
                                        clearElementSelection()
                                        setActiveCameraId(id)
                                        setCameras(current => current.map(camera => (
                                            camera.id === id
                                                ? (camera.locked ? camera : { ...camera, x, z })
                                                : camera
                                        )))
                                    }}
                                    onMoveCameraTarget={(id, x, z) => {
                                        clearElementSelection()
                                        setActiveCameraId(id)
                                        setCameras(current => current.map(camera => (
                                            camera.id === id
                                                ? (camera.locked ? camera : { ...camera, targetElementId: undefined, targetX: x, targetZ: z })
                                                : camera
                                        )))
                                    }}
                                />

                                {(backgroundUrl || activeConnectedSource) ? (
                                    <div className="pointer-events-auto absolute right-5 top-5">
                                        <button
                                            type="button"
                                            onClick={clearBackground}
                                            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/76 transition hover:bg-black/55"
                                        >
                                            清除背景
                                        </button>
                                    </div>
                                ) : null}

                                <FrameOverlay
                                    frame={frame}
                                    active={viewportMode === 'camera'}
                                    showGuides={showFrameGuides}
                                    showSafeArea={showCompositionSafeArea}
                                    showCenterCross={showCompositionCenterCross}
                                    showHeadroom={showCompositionHeadroom}
                                    showEyeline={showCompositionEyeline}
                                    viewportWidth={viewportSize.width}
                                    viewportHeight={viewportSize.height}
                                />

                                <div
                                    className="pointer-events-auto absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-white/12 bg-[rgba(12,18,30,0.78)] px-3 py-2 shadow-[0_18px_48px_rgba(0,0,0,0.38)] backdrop-blur-xl"
                                    style={{ WebkitAppRegion: 'no-drag' } as any}
                                >
                                    <div className="flex h-[22px] w-[22px] items-center justify-center rounded-[7px] bg-cyan-400/18 text-cyan-100">
                                        <Orbit size={12} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-[12px] font-semibold leading-[1.15] tracking-[-0.01em] text-white">全景环绕控制</div>
                                        <div className="mt-0.5 text-[10px] leading-[1.1] text-white/55">
                                            {backgroundReady ? '背景已载入' : '等待背景'} · {elements.length} 对象 · {cameras.length} 镜头位
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute bottom-5 right-5 flex flex-col gap-2">
                                    <button type="button" onClick={() => handleZoom('in')} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white/76 transition hover:bg-black/55">
                                        <Plus size={14} />
                                    </button>
                                    <button type="button" onClick={() => handleZoom('out')} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white/76 transition hover:bg-black/55">
                                        <Minimize2 size={14} />
                                    </button>
                                    <button type="button" onClick={() => viewportRef.current?.resetView()} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white/76 transition hover:bg-black/55">
                                        <RotateCcw size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <aside className="flex min-h-0 w-[352px] min-w-[352px] flex-col border-l border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] backdrop-blur-2xl">
                        <div className="border-b border-white/10 px-5 py-5">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-3 py-1 text-[10px] uppercase tracking-[0.26em] text-white/72">
                                <PanelTopOpen size={11} />
                                Property Dock
                            </div>
                            <div className="mt-3 text-sm font-semibold text-white/92">属性舱</div>
                            <div className="mt-1 text-xs text-white/44">在这里校正角色姿态、镜头目标和空间摆位参数。</div>
                            <div className="mt-4 flex items-center gap-2">
                                <DockTab active={sidebarTab === 'cameras'} label="机位" onClick={() => setSidebarTab('cameras')} />
                                <DockTab active={sidebarTab === 'properties'} label="属性" onClick={() => setSidebarTab('properties')} />
                                <DockTab active={sidebarTab === 'functions'} label="功能" onClick={() => setSidebarTab('functions')} />
                                <DockTab active={sidebarTab === 'display'} label="显示" onClick={() => setSidebarTab('display')} />
                                <DockTab active={sidebarTab === 'list'} label="清单" onClick={() => setSidebarTab('list')} />
                            </div>
                        </div>
                        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-32 pt-4">
                            {sidebarTab === 'cameras' ? (
                                <Section title="机位切换" hint="快速切到不同机位。详情编辑在「清单」。">
                                    <div className="flex flex-wrap gap-2">
                                        {cameras.map(camera => (
                                            <button
                                                key={camera.id}
                                                type="button"
                                                onClick={() => {
                                                    setActiveCameraId(camera.id)
                                                    clearElementSelection()
                                                }}
                                                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${camera.id === activeCameraId ? 'bg-white/92 text-[#091321] shadow-[0_6px_18px_rgba(255,255,255,0.18)]' : 'bg-black/18 text-white/74 hover:bg-white/10'}`}
                                            >
                                                {camera.name}
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addCamera}
                                            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#0B1B33] px-3.5 py-1.5 text-xs font-medium text-white/82 transition hover:bg-[#102446]"
                                        >
                                            <Plus size={12} />
                                            新增镜头位
                                        </button>
                                    </div>
                                    {activeCamera ? (
                                        <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.03] p-3 text-[11px] leading-[1.6] text-white/62">
                                            <div className="flex items-center gap-2 text-white/86">
                                                <Camera size={12} />
                                                <span className="text-[12px] font-medium">{activeCamera.name}</span>
                                            </div>
                                            <div className="mt-1.5">
                                                {activeCamera.usage || '未写用途'}
                                                {activeCamera.notes ? ` · ${activeCamera.notes}` : ''}
                                            </div>
                                        </div>
                                    ) : null}
                                </Section>
                            ) : selectedElementIds.length > 1 ? (
                                <>
                                    {sidebarTab === 'properties' ? (
                                        <Section title="多选概览" hint="这里展示当前多选状态。具体批量操作切到“功能”页。">
                                            <div className="flex flex-wrap gap-2">
                                                <StatChip icon={<Users size={10} />} label={`已选 ${selectedElementIds.length} 个`} />
                                                <StatChip icon={<Lock size={10} />} label={`锁定 ${selectedLockedCount} 个`} />
                                                <StatChip icon={<BadgeInfo size={10} />} label={selectedGroupIds.length > 0 ? `${selectedGroupIds.length} 个编组` : '未编组'} />
                                            </div>
                                        </Section>
                                    ) : null}
                                    {sidebarTab === 'functions' ? (
                                        <Section title="多选对象" hint="可以批量锁定、编组，也可以整体拖动。按住 Shift 拖拽空白区域可框选。">
                                            <div className="flex flex-wrap gap-2">
                                                <StatChip icon={<Users size={10} />} label={`已选 ${selectedElementIds.length} 个`} />
                                                <StatChip icon={<Lock size={10} />} label={`锁定 ${selectedLockedCount} 个`} />
                                                <StatChip icon={<BadgeInfo size={10} />} label={selectedGroupIds.length > 0 ? `${selectedGroupIds.length} 个编组` : '未编组'} />
                                            </div>
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={groupSelectedElements}
                                                    disabled={!canGroupSelection}
                                                    className="rounded-full bg-cyan-400/18 px-3 py-2 text-xs font-medium text-cyan-100 transition hover:bg-cyan-400/26 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    编组选中
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={ungroupSelectedElements}
                                                    disabled={!canUngroupSelection}
                                                    className="rounded-full bg-white/8 px-3 py-2 text-xs font-medium text-white/76 transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    解除编组
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={lockSelectedElements}
                                                    className="rounded-full bg-amber-400/18 px-3 py-2 text-xs font-medium text-amber-100 transition hover:bg-amber-400/26"
                                                >
                                                    批量锁定
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={unlockSelectedElements}
                                                    className="rounded-full bg-white/8 px-3 py-2 text-xs font-medium text-white/76 transition hover:bg-white/12"
                                                >
                                                    批量解锁
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={clearElementSelection}
                                                    className="rounded-full bg-white/8 px-3 py-2 text-xs font-medium text-white/76 transition hover:bg-white/12"
                                                >
                                                    清空选择
                                                </button>
                                            </div>
                                        </Section>
                                    ) : null}
                                    {sidebarTab === 'list' ? (
                                        <Section title="选择列表" hint="这里显示当前批量操作会影响到的对象。">
                                            <div className="flex flex-wrap gap-2">
                                                {selectedElements.map(element => (
                                                    <div key={element.id} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-white/74">
                                                        <span>{element.name}</span>
                                                        {element.groupId ? <span className="text-[10px] text-cyan-200/80">编组</span> : null}
                                                        {element.locked ? <Lock size={10} className="text-amber-200" /> : null}
                                                    </div>
                                                ))}
                                            </div>
                                        </Section>
                                    ) : null}
                                </>
                            ) : selectedElement ? (
                                <>
                                    {sidebarTab === 'properties' ? (
                                    <Section title={selectedElement.kind === 'advanced' ? '高级假人' : '普通假人'} hint={selectedElement.kind === 'advanced' ? '高级假人支持预设姿态、骨盆和关节微调。' : '普通假人适合快速摆位，不建议做复杂姿态。'}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <label className="block">
                                                    <div className="mb-2 text-[11px] text-white/50">名称</div>
                                                    <input
                                                        type="text"
                                                        value={selectedElement.name}
                                                        onChange={(event) => updateElement({ name: event.target.value })}
                                                        className="w-full rounded-2xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm font-medium text-white outline-none transition focus:border-cyan-300/35"
                                                    />
                                                </label>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <StatChip icon={<BadgeInfo size={10} />} label={`姿态 ${(selectedElement.pose || 'idle')}`} />
                                                    <StatChip icon={<Orbit size={10} />} label={`朝向 ${(resolvedSelectedElement?.rotationY ?? selectedElement.rotationY).toFixed(0)}°`} />
                                                    <StatChip icon={<Expand size={10} />} label={`缩放 ${selectedElement.scale.toFixed(2)}`} />
                                                    {selectedElementLocked ? <StatChip icon={<Lock size={10} />} label="已锁定" /> : null}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={toggleSelectedElementLock}
                                                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition ${selectedElementLocked ? 'bg-amber-400/18 text-amber-100 ring-1 ring-amber-300/35' : 'bg-white/8 text-white/72 hover:bg-white/12'}`}
                                            >
                                                {selectedElementLocked ? <Lock size={12} /> : <LockOpen size={12} />}
                                                {selectedElementLocked ? '解除锁定' : '锁定对象'}
                                            </button>
                                        </div>
                                        {selectedElementLocked ? (
                                            <div className="mt-4 rounded-2xl border border-amber-300/18 bg-amber-400/10 px-3 py-3 text-xs leading-5 text-amber-100/88">
                                                当前对象已锁定。你仍然可以选中它，但不能拖动、旋转或修改姿态参数。
                                            </div>
                                        ) : null}
                                    </Section>
                                    ) : null}
                                    <div className={selectedElementLocked ? 'pointer-events-none select-none space-y-4 opacity-45' : 'space-y-4'}>
                                    {sidebarTab === 'properties' ? (
                                    <Section title="位置与朝向" hint="先把人放到正确的位置，再细调动作。">
                                        <div className="space-y-3">
                                            <SliderField label="X" value={selectedElement.x} min={-8} max={8} step={0.1} accentClass="accent-cyan-400" onChange={(value) => updateElement({ x: value })} />
                                            <SliderField label="Y" value={selectedElement.y} min={-4} max={4} step={0.1} accentClass="accent-cyan-400" onChange={(value) => updateElement({ y: value })} />
                                            <SliderField label="Z" value={selectedElement.z} min={-8} max={8} step={0.1} accentClass="accent-cyan-400" onChange={(value) => updateElement({ z: value })} />
                                            <SliderField label="朝向" value={resolvedSelectedElement?.rotationY ?? selectedElement.rotationY} min={-180} max={180} step={1} disabled={selectedElementLookMode !== 'manual'} accentClass="accent-cyan-400" onChange={(value) => updateElement({ rotationY: value })} />
                                            <SliderField label="整体缩放" value={selectedElement.scale} min={0.5} max={2.5} step={0.01} accentClass="accent-cyan-400" onChange={(value) => updateElement({ scale: value })} />
                                        </div>
                                    </Section>
                                    ) : null}
                                    {sidebarTab === 'functions' ? (
                                    <Section title="视线系统" hint="让角色持续看向镜头、对象或自定义点。启用后朝向会由系统接管。">
                                        <div className="flex flex-wrap gap-2">
                                            {DIRECTOR_STAGE_LOOK_AT_OPTIONS.map(option => (
                                                <button
                                                    key={option.key}
                                                    type="button"
                                                    onClick={() => setSelectedElementLookMode(option.key)}
                                                    className={`rounded-full px-3 py-1.5 text-xs transition ${selectedElementLookMode === option.key ? 'bg-cyan-400/18 text-cyan-100 ring-1 ring-cyan-300/35' : 'bg-white/8 text-white/72 hover:bg-white/12'}`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                        {selectedElementLookMode === 'camera' ? (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {cameras.map(camera => (
                                                    <button
                                                        key={camera.id}
                                                        type="button"
                                                        onClick={() => updateElement({ lookAtCameraId: camera.id })}
                                                        className={`rounded-full px-3 py-1.5 text-xs transition ${selectedElement.lookAtCameraId === camera.id ? 'bg-amber-400/18 text-amber-100 ring-1 ring-amber-300/35' : 'bg-white/8 text-white/72 hover:bg-white/12'}`}
                                                    >
                                                        看向 {camera.name}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : null}
                                        {selectedElementLookMode === 'element' ? (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {elements.filter(element => element.id !== selectedElement.id).map(element => (
                                                    <button
                                                        key={element.id}
                                                        type="button"
                                                        onClick={() => updateElement({ lookAtElementId: element.id })}
                                                        className={`rounded-full px-3 py-1.5 text-xs transition ${selectedElement.lookAtElementId === element.id ? 'bg-violet-400/18 text-violet-100 ring-1 ring-violet-300/35' : 'bg-white/8 text-white/72 hover:bg-white/12'}`}
                                                    >
                                                        看向 {element.name}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : null}
                                        {selectedElementLookMode === 'point' ? (
                                            <div className="mt-3 space-y-3">
                                                <SliderField label="视线点 X" value={selectedElement.lookAtPointX ?? selectedElement.x} min={-12} max={12} step={0.1} accentClass="accent-cyan-400" onChange={(value) => updateElement({ lookAtPointX: value })} />
                                                <SliderField label="视线点 Y" value={selectedElement.lookAtPointY ?? getDirectorStageFocusPoint(selectedElement).y} min={0} max={6} step={0.1} accentClass="accent-cyan-400" onChange={(value) => updateElement({ lookAtPointY: value })} />
                                                <SliderField label="视线点 Z" value={selectedElement.lookAtPointZ ?? selectedElement.z + 1} min={-12} max={12} step={0.1} accentClass="accent-cyan-400" onChange={(value) => updateElement({ lookAtPointZ: value })} />
                                            </div>
                                        ) : null}
                                        {selectedElementLookMode !== 'manual' ? (
                                            <div className="mt-3 rounded-2xl border border-cyan-300/14 bg-cyan-400/8 px-3 py-3 text-xs leading-5 text-cyan-100/88">
                                                当前角色会在预演和镜头预览里持续跟随目标方向。若要恢复手动旋转，切回“手动朝向”。
                                            </div>
                                        ) : null}
                                    </Section>
                                    ) : null}
                                    {sidebarTab === 'functions' ? (
                                    <Section title="路径预演" hint="记录多个路径点后，可以在右下角启动路径预演。">
                                        <div className="mb-3 flex flex-wrap gap-2">
                                            <StatChip icon={<Route size={10} />} label={`${currentPathPoints.length} 个路径点`} />
                                            <StatChip icon={<Play size={10} />} label={currentMotionPath.loop ? '循环路径' : '单次路径'} />
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button type="button" onClick={recordCurrentPathPoint} className="rounded-full bg-cyan-400/18 px-3 py-1.5 text-xs font-medium text-cyan-100 transition hover:bg-cyan-400/26">记录当前位置</button>
                                            <button type="button" onClick={replaceSelectedPathPointFromCurrentPose} disabled={!selectedPathPoint} className="rounded-full bg-white/8 px-3 py-1.5 text-xs text-white/76 transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-40">覆盖当前点</button>
                                            <button type="button" onClick={removeSelectedPathPoint} disabled={!selectedPathPoint} className="rounded-full bg-white/8 px-3 py-1.5 text-xs text-white/76 transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-40">删除当前点</button>
                                            <button type="button" onClick={toggleCurrentMotionPathLoop} className={`rounded-full px-3 py-1.5 text-xs transition ${currentMotionPath.loop ? 'bg-amber-400/18 text-amber-100 ring-1 ring-amber-300/35' : 'bg-white/8 text-white/72 hover:bg-white/12'}`}>循环</button>
                                            <button type="button" onClick={clearCurrentMotionPath} disabled={currentPathPoints.length === 0} className="rounded-full bg-white/8 px-3 py-1.5 text-xs text-white/76 transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-40">清空路径</button>
                                        </div>
                                        {currentPathPoints.length > 0 ? (
                                            <>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {currentPathPoints.map((point, index) => (
                                                        <button
                                                            key={point.id}
                                                            type="button"
                                                            onClick={() => setSelectedPathPointId(point.id)}
                                                            className={`rounded-full px-3 py-1.5 text-xs transition ${selectedPathPointId === point.id ? 'bg-cyan-400/18 text-cyan-100 ring-1 ring-cyan-300/35' : 'bg-white/8 text-white/72 hover:bg-white/12'}`}
                                                        >
                                                            点 {index + 1}
                                                        </button>
                                                    ))}
                                                </div>
                                                {selectedPathPoint ? (
                                                    <div className="mt-3 space-y-3">
                                                        <SliderField label="路径点 X" value={selectedPathPoint.x} min={-12} max={12} step={0.1} accentClass="accent-cyan-400" onChange={(value) => updateSelectedPathPoint({ x: value })} />
                                                        <SliderField label="路径点 Y" value={selectedPathPoint.y} min={-4} max={6} step={0.1} accentClass="accent-cyan-400" onChange={(value) => updateSelectedPathPoint({ y: value })} />
                                                        <SliderField label="路径点 Z" value={selectedPathPoint.z} min={-12} max={12} step={0.1} accentClass="accent-cyan-400" onChange={(value) => updateSelectedPathPoint({ z: value })} />
                                                    </div>
                                                ) : null}
                                            </>
                                        ) : (
                                            <div className="mt-3 text-xs leading-5 text-white/44">先把角色摆到目标位置，再点“记录当前位置”去追加路径点。</div>
                                        )}
                                    </Section>
                                    ) : null}
                                    {sidebarTab === 'properties' ? (
                                    <Section title="姿态预设" hint="预设先定大姿势，再在下面按身体部位微调。">
                                        <div className="flex flex-wrap gap-2">
                                            {DIRECTOR_STAGE_POSE_OPTIONS.map(option => {
                                                const poseKey = option.key === 'neutral' ? 'idle' : option.key
                                                return (
                                                    <button
                                                        key={option.key}
                                                        type="button"
                                                        onClick={() => {
                                                            if (selectedElement.kind === 'advanced') {
                                                                updateElement({
                                                                    pose: poseKey,
                                                                    joints: getDirectorStageJointPreset(option.key),
                                                                } as Partial<DirectorStageAdvancedElement>)
                                                            } else {
                                                                updateElement({ pose: poseKey })
                                                            }
                                                        }}
                                                        className={`rounded-full px-3 py-1.5 text-xs transition ${selectedElement.pose === poseKey ? 'bg-cyan-400/18 text-cyan-100 ring-1 ring-cyan-300/35' : 'bg-white/8 text-white/72 hover:bg-white/12'}`}
                                                    >
                                                        {option.label}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </Section>
                                    ) : null}
                                    {selectedElement.kind === 'advanced' ? (
                                        <>
                                            {sidebarTab === 'properties' ? (
                                            <Section title="外观与体块" hint="体块影响轮廓，颜色用于镜头内区分角色。">
                                                <div className="mb-4">
                                                    <div className="mb-2 text-xs text-white/52">颜色</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {DIRECTOR_STAGE_COLOR_SWATCHES.map(option => (
                                                            <button
                                                                key={option.key}
                                                                type="button"
                                                                onClick={() => updateElement({ color: option.color })}
                                                                className={`h-8 w-8 rounded-full border-2 transition ${selectedElement.color === option.color ? 'scale-105 border-white/90' : 'border-white/20 hover:border-white/40'}`}
                                                                style={{ backgroundColor: option.color }}
                                                                title={option.label}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="mb-2 text-xs text-white/52">体块风格</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {DIRECTOR_STAGE_MANNEQUIN_STYLES.map(option => (
                                                            <button
                                                                key={option.key}
                                                                type="button"
                                                                onClick={() => updateElement({ mannequinStyle: option.key })}
                                                                className={`rounded-full px-3 py-1.5 text-xs transition ${selectedElement.mannequinStyle === option.key ? 'bg-violet-400/18 text-violet-100 ring-1 ring-violet-300/35' : 'bg-white/8 text-white/72 hover:bg-white/12'}`}
                                                            >
                                                                {option.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <label className="mt-4 flex items-center justify-between rounded-2xl border border-white/8 bg-black/15 px-3 py-2 text-xs text-white/76">
                                                    <span>显示控制块</span>
                                                    <input type="checkbox" checked={selectedElement.showControlBlock} onChange={(event) => updateElement({ showControlBlock: event.target.checked })} className="h-4 w-4 accent-violet-400" />
                                                </label>
                                            </Section>
                                            ) : null}
                                            {sidebarTab === 'properties' ? (
                                            <Section title="身体核心" hint="骨盆决定坐、跪、趴、躺是否自然，先调这里。">
                                                <div className="grid grid-cols-1 gap-3">
                                                    <SliderField label="骨盆高度" value={selectedElement.joints.pelvisHeight} min={-0.95} max={0.5} step={0.01} accentClass="accent-violet-400" onChange={(value) => updateElement({ joints: { ...selectedElement.joints, pelvisHeight: value } } as Partial<DirectorStageAdvancedElement>)} />
                                                    <SliderField label="骨盆前后倾" value={selectedElement.joints.pelvisPitch} min={-60} max={60} step={1} accentClass="accent-violet-400" onChange={(value) => updateElement({ joints: { ...selectedElement.joints, pelvisPitch: value } } as Partial<DirectorStageAdvancedElement>)} />
                                                    <SliderField label="躯干前倾" value={selectedElement.joints.torsoPitch} min={-95} max={95} step={1} accentClass="accent-violet-400" onChange={(value) => updateElement({ joints: { ...selectedElement.joints, torsoPitch: value } } as Partial<DirectorStageAdvancedElement>)} />
                                                    <SliderField label="头部俯仰" value={selectedElement.joints.headPitch} min={-60} max={60} step={1} accentClass="accent-violet-400" onChange={(value) => updateElement({ joints: { ...selectedElement.joints, headPitch: value } } as Partial<DirectorStageAdvancedElement>)} />
                                                </div>
                                            </Section>
                                            ) : null}
                                            {sidebarTab === 'properties' ? (
                                            <Section title="手臂" hint="抬起控制大方向，弯曲控制动作味道。">
                                                <div className="grid grid-cols-1 gap-3">
                                                    <SliderField label="左臂抬起" value={selectedElement.joints.leftArmLift} min={-90} max={140} step={1} accentClass="accent-violet-400" onChange={(value) => updateElement({ joints: { ...selectedElement.joints, leftArmLift: value } } as Partial<DirectorStageAdvancedElement>)} />
                                                    <SliderField label="左肘弯曲" value={selectedElement.joints.leftArmBend} min={0} max={140} step={1} accentClass="accent-violet-400" onChange={(value) => updateElement({ joints: { ...selectedElement.joints, leftArmBend: value } } as Partial<DirectorStageAdvancedElement>)} />
                                                    <SliderField label="右臂抬起" value={selectedElement.joints.rightArmLift} min={-90} max={140} step={1} accentClass="accent-violet-400" onChange={(value) => updateElement({ joints: { ...selectedElement.joints, rightArmLift: value } } as Partial<DirectorStageAdvancedElement>)} />
                                                    <SliderField label="右肘弯曲" value={selectedElement.joints.rightArmBend} min={0} max={140} step={1} accentClass="accent-violet-400" onChange={(value) => updateElement({ joints: { ...selectedElement.joints, rightArmBend: value } } as Partial<DirectorStageAdvancedElement>)} />
                                                </div>
                                            </Section>
                                            ) : null}
                                            {sidebarTab === 'properties' ? (
                                            <Section title="腿部" hint="髋部负责大腿方向，迈步和膝盖负责落地姿态。">
                                                <div className="grid grid-cols-1 gap-3">
                                                    <SliderField label="左髋修正" value={selectedElement.joints.leftHipPitch} min={-60} max={70} step={1} accentClass="accent-violet-400" onChange={(value) => updateElement({ joints: { ...selectedElement.joints, leftHipPitch: value } } as Partial<DirectorStageAdvancedElement>)} />
                                                    <SliderField label="左腿迈步" value={selectedElement.joints.leftLegStep} min={-135} max={135} step={1} accentClass="accent-violet-400" onChange={(value) => updateElement({ joints: { ...selectedElement.joints, leftLegStep: value } } as Partial<DirectorStageAdvancedElement>)} />
                                                    <SliderField label="左膝弯曲" value={selectedElement.joints.leftKneeBend} min={0} max={150} step={1} accentClass="accent-violet-400" onChange={(value) => updateElement({ joints: { ...selectedElement.joints, leftKneeBend: value } } as Partial<DirectorStageAdvancedElement>)} />
                                                    <SliderField label="右髋修正" value={selectedElement.joints.rightHipPitch} min={-60} max={70} step={1} accentClass="accent-violet-400" onChange={(value) => updateElement({ joints: { ...selectedElement.joints, rightHipPitch: value } } as Partial<DirectorStageAdvancedElement>)} />
                                                    <SliderField label="右腿迈步" value={selectedElement.joints.rightLegStep} min={-135} max={135} step={1} accentClass="accent-violet-400" onChange={(value) => updateElement({ joints: { ...selectedElement.joints, rightLegStep: value } } as Partial<DirectorStageAdvancedElement>)} />
                                                    <SliderField label="右膝弯曲" value={selectedElement.joints.rightKneeBend} min={0} max={150} step={1} accentClass="accent-violet-400" onChange={(value) => updateElement({ joints: { ...selectedElement.joints, rightKneeBend: value } } as Partial<DirectorStageAdvancedElement>)} />
                                                </div>
                                            </Section>
                                            ) : null}
                                        </>
                                    ) : null}
                                    </div>
                                </>
                            ) : activeCamera && resolvedActiveCamera ? (
                                <>
                                    {sidebarTab === 'properties' ? (
                                    <Section title="镜头条目" hint="镜头包生成后，也在这里补充用途、时长和备注。">
                                        <div className="space-y-3">
                                            <label className="block">
                                                <div className="mb-2 text-xs text-white/52">名称</div>
                                                <input
                                                    type="text"
                                                    value={activeCamera.name}
                                                    onChange={(event) => updateCamera({ name: event.target.value })}
                                                    className="w-full rounded-2xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none transition focus:border-amber-300/35"
                                                />
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <label className="block">
                                                    <div className="mb-2 text-xs text-white/52">镜头类型</div>
                                                    <select
                                                        value={activeCamera.shotType || 'medium'}
                                                        onChange={(event) => updateCamera({ shotType: event.target.value as DirectorStageCamera['shotType'] })}
                                                        className="w-full rounded-2xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none transition focus:border-amber-300/35"
                                                    >
                                                        {DIRECTOR_STAGE_SHOT_TYPE_OPTIONS.map(option => (
                                                            <option key={option.key} value={option.key}>{option.label}</option>
                                                        ))}
                                                    </select>
                                                </label>
                                                <label className="block">
                                                    <div className="mb-2 text-xs text-white/52">优先级</div>
                                                    <select
                                                        value={activeCamera.priority || 'support'}
                                                        onChange={(event) => updateCamera({ priority: event.target.value as DirectorStageCamera['priority'] })}
                                                        className="w-full rounded-2xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none transition focus:border-amber-300/35"
                                                    >
                                                        {DIRECTOR_STAGE_SHOT_PRIORITY_OPTIONS.map(option => (
                                                            <option key={option.key} value={option.key}>{option.label}</option>
                                                        ))}
                                                    </select>
                                                </label>
                                                <label className="block">
                                                    <div className="mb-2 text-xs text-white/52">预计时长</div>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={999}
                                                        value={activeCamera.durationSeconds ?? 0}
                                                        onChange={(event) => updateCamera({ durationSeconds: Number(event.target.value) || 0 })}
                                                        className="w-full rounded-2xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none transition focus:border-amber-300/35"
                                                    />
                                                </label>
                                                <label className="block">
                                                    <div className="mb-2 text-xs text-white/52">用途</div>
                                                    <input
                                                        type="text"
                                                        value={activeCamera.usage || ''}
                                                        onChange={(event) => updateCamera({ usage: event.target.value })}
                                                        className="w-full rounded-2xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none transition focus:border-amber-300/35"
                                                    />
                                                </label>
                                            </div>
                                            <label className="block">
                                                <div className="mb-2 text-xs text-white/52">镜头备注</div>
                                                <textarea
                                                    value={activeCamera.notes || ''}
                                                    onChange={(event) => updateCamera({ notes: event.target.value })}
                                                    rows={3}
                                                    className="w-full resize-none rounded-2xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none transition focus:border-amber-300/35"
                                                />
                                            </label>
                                            <button
                                                type="button"
                                                onClick={toggleActiveCameraLock}
                                                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition ${activeCameraLocked ? 'bg-amber-400/18 text-amber-100 ring-1 ring-amber-300/35' : 'bg-white/8 text-white/72 hover:bg-white/12'}`}
                                            >
                                                {activeCameraLocked ? <Lock size={12} /> : <LockOpen size={12} />}
                                                {activeCameraLocked ? '解除镜头锁定' : '锁定镜头位置'}
                                            </button>
                                        </div>
                                    </Section>
                                    ) : null}
                                    <div className={activeCameraLocked ? 'pointer-events-none select-none space-y-4 opacity-45' : 'space-y-4'}>
                                    {sidebarTab === 'functions' ? (
                                    <Section title="目标绑定" hint="绑定高级假人后，目标点会自动跟随角色焦点。">
                                        <div className="space-y-3">
                                            <div className="rounded-2xl border border-white/8 bg-black/15 px-3 py-3 text-xs text-white/68">
                                                {activeCamera.targetElementId
                                                    ? `当前已跟随：${elements.find(element => element.id === activeCamera.targetElementId)?.name || '已绑定目标'}`
                                                    : '当前为手动目标，可绑定到高级假人身上。'}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {elements.filter(element => element.kind === 'advanced').map(element => (
                                                    <button
                                                        key={element.id}
                                                        type="button"
                                                        onClick={() => bindCameraTarget(element.id)}
                                                        className={`rounded-full px-3 py-1.5 text-xs transition ${activeCamera.targetElementId === element.id ? 'bg-amber-400/18 text-amber-100 ring-1 ring-amber-300/35' : 'bg-white/8 text-white/72 hover:bg-white/12'}`}
                                                    >
                                                        绑定 {element.name}
                                                    </button>
                                                ))}
                                                {elements.filter(element => element.kind === 'advanced').length === 0 ? (
                                                    <div className="text-xs text-white/42">当前没有可绑定的高级假人。</div>
                                                ) : null}
                                                {activeCamera.targetElementId ? (
                                                    <button type="button" onClick={clearCameraTarget} className="rounded-full bg-white/8 px-3 py-1.5 text-xs text-white/76 transition hover:bg-white/12">
                                                        解除绑定
                                                    </button>
                                                ) : null}
                                            </div>
                                        </div>
                                    </Section>
                                    ) : null}
                                    {sidebarTab === 'properties' ? (
                                    <Section title="镜头位置" hint="绑定目标后，目标点滑块会自动锁定。">
                                        <div className="space-y-3">
                                            <SliderField label="机位 X" value={activeCamera.x} min={-12} max={12} step={0.1} accentClass="accent-amber-400" onChange={(value) => updateCamera({ x: value })} />
                                            <SliderField label="机位 Y" value={activeCamera.y} min={0.4} max={6} step={0.1} accentClass="accent-amber-400" onChange={(value) => updateCamera({ y: value })} />
                                            <SliderField label="机位 Z" value={activeCamera.z} min={-12} max={12} step={0.1} accentClass="accent-amber-400" onChange={(value) => updateCamera({ z: value })} />
                                            <SliderField label="目标 X" value={resolvedActiveCamera.targetX} min={-12} max={12} step={0.1} accentClass="accent-amber-400" disabled={Boolean(activeCamera.targetElementId)} onChange={(value) => updateCamera({ targetX: value })} />
                                            <SliderField label="目标 Y" value={resolvedActiveCamera.targetY} min={0.2} max={6} step={0.1} accentClass="accent-amber-400" disabled={Boolean(activeCamera.targetElementId)} onChange={(value) => updateCamera({ targetY: value })} />
                                            <SliderField label="目标 Z" value={resolvedActiveCamera.targetZ} min={-12} max={12} step={0.1} accentClass="accent-amber-400" disabled={Boolean(activeCamera.targetElementId)} onChange={(value) => updateCamera({ targetZ: value })} />
                                            <SliderField label="视角 FOV" value={activeCamera.fov} min={24} max={90} step={1} accentClass="accent-amber-400" onChange={(value) => updateCamera({ fov: value })} />
                                        </div>
                                    </Section>
                                    ) : null}
                                    {sidebarTab === 'functions' ? (
                                    <Section title="路径预演" hint="给镜头记录多个位置点后，可以用全局路径预演查看移动机位。">
                                        <div className="mb-3 flex flex-wrap gap-2">
                                            <StatChip icon={<Route size={10} />} label={`${currentPathPoints.length} 个路径点`} />
                                            <StatChip icon={<Play size={10} />} label={currentMotionPath.loop ? '循环路径' : '单次路径'} />
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button type="button" onClick={recordCurrentPathPoint} className="rounded-full bg-amber-400/18 px-3 py-1.5 text-xs font-medium text-amber-100 transition hover:bg-amber-400/26">记录当前机位</button>
                                            <button type="button" onClick={replaceSelectedPathPointFromCurrentPose} disabled={!selectedPathPoint} className="rounded-full bg-white/8 px-3 py-1.5 text-xs text-white/76 transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-40">覆盖当前点</button>
                                            <button type="button" onClick={removeSelectedPathPoint} disabled={!selectedPathPoint} className="rounded-full bg-white/8 px-3 py-1.5 text-xs text-white/76 transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-40">删除当前点</button>
                                            <button type="button" onClick={toggleCurrentMotionPathLoop} className={`rounded-full px-3 py-1.5 text-xs transition ${currentMotionPath.loop ? 'bg-amber-400/18 text-amber-100 ring-1 ring-amber-300/35' : 'bg-white/8 text-white/72 hover:bg-white/12'}`}>循环</button>
                                            <button type="button" onClick={clearCurrentMotionPath} disabled={currentPathPoints.length === 0} className="rounded-full bg-white/8 px-3 py-1.5 text-xs text-white/76 transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-40">清空路径</button>
                                        </div>
                                        {currentPathPoints.length > 0 ? (
                                            <>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {currentPathPoints.map((point, index) => (
                                                        <button
                                                            key={point.id}
                                                            type="button"
                                                            onClick={() => setSelectedPathPointId(point.id)}
                                                            className={`rounded-full px-3 py-1.5 text-xs transition ${selectedPathPointId === point.id ? 'bg-amber-400/18 text-amber-100 ring-1 ring-amber-300/35' : 'bg-white/8 text-white/72 hover:bg-white/12'}`}
                                                        >
                                                            点 {index + 1}
                                                        </button>
                                                    ))}
                                                </div>
                                                {selectedPathPoint ? (
                                                    <div className="mt-3 space-y-3">
                                                        <SliderField label="路径点 X" value={selectedPathPoint.x} min={-12} max={12} step={0.1} accentClass="accent-amber-400" onChange={(value) => updateSelectedPathPoint({ x: value })} />
                                                        <SliderField label="路径点 Y" value={selectedPathPoint.y} min={0.2} max={8} step={0.1} accentClass="accent-amber-400" onChange={(value) => updateSelectedPathPoint({ y: value })} />
                                                        <SliderField label="路径点 Z" value={selectedPathPoint.z} min={-12} max={12} step={0.1} accentClass="accent-amber-400" onChange={(value) => updateSelectedPathPoint({ z: value })} />
                                                    </div>
                                                ) : null}
                                            </>
                                        ) : (
                                            <div className="mt-3 text-xs leading-5 text-white/44">移动镜头到关键位置后记录多个点，再在全局预演区拖动进度查看运动轨迹。</div>
                                        )}
                                    </Section>
                                    ) : null}
                                    </div>
                                    {sidebarTab === 'properties' && activeCameraLocked ? (
                                        <Section title="锁定提示" hint="锁定后仍可写备注，但拖动和视角参数编辑会被冻结。">
                                            <div className="text-sm leading-6 text-white/56">
                                                当前镜头已锁定，适合在确定关键机位后防止误拖。
                                            </div>
                                        </Section>
                                    ) : null}
                                </>
                            ) : (
                                sidebarTab === 'properties' ? (
                                <Section title="控制提示" hint="先从底部添加角色或镜头位，再从这里精调。">
                                    <div className="text-sm leading-6 text-white/56">
                                        选中角色后可以调整位置、预设和身体部位。选中镜头位后可以调整视角、用途和镜头清单信息。
                                    </div>
                                </Section>
                                ) : null
                            )}
                            {sidebarTab === 'display' ? (
                            <Section title="舞台显示" hint="这里集中管理舞台里的叠层、参考物和辅助标记显示。">
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCameras(current => !current)}
                                        className={`flex items-center justify-between rounded-2xl border px-3 py-2.5 text-left text-xs transition ${showCameras ? 'border-cyan-300/30 bg-cyan-400/16 text-cyan-100' : 'border-white/8 bg-white/[0.04] text-white/72 hover:bg-white/[0.08]'}`}
                                    >
                                        <span>显示镜头</span>
                                        <Camera size={14} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowGrid(current => !current)}
                                        className={`flex items-center justify-between rounded-2xl border px-3 py-2.5 text-left text-xs transition ${showGrid ? 'border-cyan-300/30 bg-cyan-400/16 text-cyan-100' : 'border-white/8 bg-white/[0.04] text-white/72 hover:bg-white/[0.08]'}`}
                                    >
                                        <span>显示网格</span>
                                        <Grid3X3 size={14} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowTargets(current => !current)}
                                        className={`flex items-center justify-between rounded-2xl border px-3 py-2.5 text-left text-xs transition ${showTargets ? 'border-cyan-300/30 bg-cyan-400/16 text-cyan-100' : 'border-white/8 bg-white/[0.04] text-white/72 hover:bg-white/[0.08]'}`}
                                    >
                                        <span>显示目标</span>
                                        <ScanLine size={14} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowFocus(current => !current)}
                                        className={`flex items-center justify-between rounded-2xl border px-3 py-2.5 text-left text-xs transition ${showFocus ? 'border-cyan-300/30 bg-cyan-400/16 text-cyan-100' : 'border-white/8 bg-white/[0.04] text-white/72 hover:bg-white/[0.08]'}`}
                                    >
                                        <span>显示焦点</span>
                                        <Focus size={14} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowFrameGuides(current => !current)}
                                        className={`flex items-center justify-between rounded-2xl border px-3 py-2.5 text-left text-xs transition ${showFrameGuides ? 'border-cyan-300/30 bg-cyan-400/16 text-cyan-100' : 'border-white/8 bg-white/[0.04] text-white/72 hover:bg-white/[0.08]'}`}
                                    >
                                        <span>参考线</span>
                                        <BadgeInfo size={14} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowElementNumbers(current => !current)}
                                        className={`flex items-center justify-between rounded-2xl border px-3 py-2.5 text-left text-xs transition ${showElementNumbers ? 'border-cyan-300/30 bg-cyan-400/16 text-cyan-100' : 'border-white/8 bg-white/[0.04] text-white/72 hover:bg-white/[0.08]'}`}
                                    >
                                        <span>显示编号</span>
                                        <Users size={14} />
                                    </button>
                                </div>
                            </Section>
                            ) : null}
                            {sidebarTab === 'functions' ? (
                            <Section title="路径预演控制" hint="打开后会按进度显示所有对象和镜头的路径位置。预演开启时，舞台拖拽会被锁定。">
                                <div className="mb-3 flex flex-wrap gap-2">
                                    <StatChip icon={<Route size={10} />} label={showPaths ? '显示路径' : '隐藏路径'} />
                                    <StatChip icon={<Play size={10} />} label={pathPreviewEnabled ? `进度 ${(pathPreviewProgress * 100).toFixed(0)}%` : '预演关闭'} />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowPaths(current => !current)}
                                        className={`rounded-full px-3 py-1.5 text-xs transition ${showPaths ? 'bg-cyan-400/18 text-cyan-100 ring-1 ring-cyan-300/35' : 'bg-white/8 text-white/72 hover:bg-white/12'}`}
                                    >
                                        {showPaths ? '隐藏路径线' : '显示路径线'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPathPreviewEnabled(current => !current)
                                            setPathPreviewPlaying(false)
                                        }}
                                        className={`rounded-full px-3 py-1.5 text-xs transition ${pathPreviewEnabled ? 'bg-amber-400/18 text-amber-100 ring-1 ring-amber-300/35' : 'bg-white/8 text-white/72 hover:bg-white/12'}`}
                                    >
                                        {pathPreviewEnabled ? '关闭预演' : '开启预演'}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!pathPreviewEnabled}
                                        onClick={() => setPathPreviewPlaying(current => !current)}
                                        className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 text-xs text-white/76 transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {pathPreviewPlaying ? <Pause size={12} /> : <Play size={12} />}
                                        {pathPreviewPlaying ? '暂停' : '播放'}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!pathPreviewEnabled}
                                        onClick={() => {
                                            setPathPreviewPlaying(false)
                                            setPathPreviewProgress(0)
                                        }}
                                        className="rounded-full bg-white/8 px-3 py-1.5 text-xs text-white/76 transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        回到起点
                                    </button>
                                </div>
                                <div className={`mt-4 ${!pathPreviewEnabled ? 'pointer-events-none opacity-45' : ''}`}>
                                    <SliderField
                                        label="预演进度"
                                        value={pathPreviewProgress}
                                        min={0}
                                        max={1}
                                        step={0.001}
                                        accentClass="accent-cyan-400"
                                        onChange={(value) => {
                                            setPathPreviewPlaying(false)
                                            setPathPreviewProgress(value)
                                        }}
                                    />
                                </div>
                            </Section>
                            ) : null}
                            {sidebarTab === 'list' ? (
                            <Section title="镜头清单" hint="这里汇总镜头包和手动新增的镜头，方便快速切换和校对。">
                                <div className="mb-3 flex flex-wrap gap-2">
                                    <StatChip icon={<Camera size={10} />} label={`${cameras.length} 个镜头`} />
                                    <StatChip icon={<FileText size={10} />} label={`总时长 ${totalShotDuration}s`} />
                                    <StatChip icon={<BadgeInfo size={10} />} label={`主用 ${primaryShotCount} 个`} />
                                </div>
                                <div className="space-y-2">
                                    {cameras.map(camera => (
                                        <button
                                            key={camera.id}
                                            type="button"
                                            onClick={() => {
                                                setActiveCameraId(camera.id)
                                                clearElementSelection()
                                            }}
                                            className={`w-full rounded-2xl border px-3 py-3 text-left transition ${camera.id === activeCameraId && !selectedElementId ? 'border-amber-300/35 bg-amber-400/10' : 'border-white/8 bg-white/[0.03] hover:border-white/16 hover:bg-white/[0.06]'}`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="truncate text-sm font-medium text-white">{camera.name}</div>
                                                    <div className="mt-1 text-[11px] leading-5 text-white/46">
                                                        {camera.usage || '未写用途'}
                                                        {camera.notes ? ` · ${camera.notes}` : ''}
                                                    </div>
                                                </div>
                                                {camera.locked ? (
                                                    <div className="rounded-full bg-amber-400/14 px-2 py-1 text-[10px] text-amber-100">已锁定</div>
                                                ) : null}
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <StatChip icon={<Camera size={10} />} label={getShotTypeLabel(camera.shotType)} />
                                                <StatChip icon={<BadgeInfo size={10} />} label={getShotPriorityLabel(camera.priority)} />
                                                <StatChip icon={<FileText size={10} />} label={`${camera.durationSeconds || 0}s`} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </Section>
                            ) : null}
                        </div>
                    </aside>
                </div>

                {/* Old absolute tool drawer removed. New drawer lives as a flex child inside `.flex.min-h-0.flex-1` above. */}
            </div>
        </div>,
        document.body,
    )
}
