import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  CAMERA_PRESETS,
  CameraPresetId,
  FINISH_OPTIONS,
  FINISH_ORDER,
  FinishId,
  Product3DItem,
  STUDIO_LIGHTING_ORDER,
  STUDIO_LIGHTING_PRESETS,
  StudioLightingId,
  computeExplodedOffset,
  getProductSubAssemblies,
} from '../store/catalog';
import {
  BuiltProduct3D,
  buildProceduralProduct3D,
} from '../store/productModels3D';

interface Product3DViewportProps {
  product: Product3DItem;
  finishId: FinishId;
  onSelectFinish: (finish: FinishId) => void;
  explodedProgress: number;
  onExplodedChange: (progress: number) => void;
  cameraPreset: CameraPresetId;
  onSelectCameraPreset: (preset: CameraPresetId) => void;
  lightingPreset?: StudioLightingId;
  onSelectLightingPreset?: (lighting: StudioLightingId) => void;
  selectedSubAssemblyIndex?: number | null;
  onSelectSubAssembly?: (index: number | null) => void;
}

const CAMERA_PRESET_ORDER: CameraPresetId[] = [
  'three-quarter',
  'front',
  'top',
  'profile',
];

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 118);
    grad.addColorStop(0, 'rgba(20, 19, 18, 0.34)');
    grad.addColorStop(0.55, 'rgba(20, 19, 18, 0.14)');
    grad.addColorStop(1, 'rgba(20, 19, 18, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function applyWireframeAndSubAssemblyHighlight(
  build: BuiltProduct3D | null,
  wireframe: boolean,
  highlightedPartIndex: number | null
) {
  if (!build) return;
  build.parts.forEach((part, idx) => {
    const isHighlighted =
      highlightedPartIndex !== null &&
      idx % 3 === highlightedPartIndex % 3;
    part.mesh.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;
      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      for (const mat of materials) {
        const stdMat = mat as THREE.MeshStandardMaterial;
        if ('wireframe' in stdMat) {
          stdMat.wireframe = wireframe;
        }
        if ('emissive' in stdMat && stdMat.emissive) {
          if (isHighlighted) {
            stdMat.emissive.set('#D97736');
            stdMat.emissiveIntensity = 0.28;
          } else if (wireframe) {
            stdMat.emissive.set('#38bdf8');
            stdMat.emissiveIntensity = 0.16;
          } else {
            stdMat.emissive.set('#000000');
            stdMat.emissiveIntensity = 0;
          }
        }
      }
    });
  });
}

export const Product3DViewport: React.FC<Product3DViewportProps> = ({
  product,
  finishId,
  onSelectFinish,
  explodedProgress,
  onExplodedChange,
  cameraPreset,
  onSelectCameraPreset,
  lightingPreset = 'atelier-daylight',
  onSelectLightingPreset,
  selectedSubAssemblyIndex = null,
  onSelectSubAssembly,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [partCount, setPartCount] = useState<number>(product.partCount);

  // Refs for mutable animation loop & live scene lighting targets
  const explodedTargetRef = useRef(explodedProgress);
  const explodedCurrentRef = useRef(explodedProgress);
  const autoRotateRef = useRef(autoRotate);
  const buildResultRef = useRef<BuiltProduct3D | null>(null);
  const isSoftwareGlRef = useRef<boolean>(false);
  const cameraTargetPosRef = useRef<THREE.Vector3 | null>(null);
  const controlsTargetPosRef = useRef<THREE.Vector3 | null>(null);
  const sceneRefs = useRef<{
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    keyLight: THREE.DirectionalLight;
    fillLight: THREE.DirectionalLight;
    rimLight: THREE.DirectionalLight;
    plinthMat: THREE.MeshStandardMaterial;
  } | null>(null);

  useEffect(() => {
    explodedTargetRef.current = explodedProgress;
  }, [explodedProgress]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  // Keyboard shortcut 'H' to toggle HUD dock visibility (when not typing in inputs)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        setDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update camera target position when preset changes
  useEffect(() => {
    const preset = CAMERA_PRESETS[cameraPreset];
    if (preset) {
      cameraTargetPosRef.current = new THREE.Vector3(...preset.position);
      controlsTargetPosRef.current = new THREE.Vector3(...preset.target);
    }
  }, [cameraPreset]);

  // Initialize Three.js WebGL scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 360);

    // Probe GPU renderer string for software WebGL fallback detection
    const probeCanvas = document.createElement('canvas');
    const probeGl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    const debugInfo = probeGl?.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = debugInfo
      ? probeGl?.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || ''
      : '';
    const isSoftwareGl = /SwiftShader|llvmpipe|Software|Mesa OffScreen/i.test(rendererStr);
    isSoftwareGlRef.current = isSoftwareGl;

    const initialLightMeta =
      STUDIO_LIGHTING_PRESETS[lightingPreset] ||
      STUDIO_LIGHTING_PRESETS['atelier-daylight'];

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(initialLightMeta.bgHex);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    const initialPreset = CAMERA_PRESETS['three-quarter'];
    camera.position.set(...initialPreset.position);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = initialLightMeta.exposure;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Environment Lighting
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // 3-Point Architectural Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xfffcf7, 0.55);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(
      initialLightMeta.keyColorHex,
      initialLightMeta.keyIntensity
    );
    keyLight.position.set(4.2, 6.5, 4.5);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 16;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(
      initialLightMeta.hemiSkyHex,
      initialLightMeta.hemiIntensity
    );
    fillLight.position.set(-4.5, 3.2, -2.5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(
      initialLightMeta.rimColorHex,
      initialLightMeta.rimIntensity
    );
    rimLight.position.set(0.5, 4.0, -5.2);
    scene.add(rimLight);

    // Architectural Travertine Studio Plinth + Contact Shadow
    const pedestalGroup = new THREE.Group();
    pedestalGroup.position.set(0, -0.02, 0);

    const plinthGeo = new THREE.CylinderGeometry(1.48, 1.54, 0.14, 64);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: initialLightMeta.id === 'atelier-daylight' ? '#E5E0D7' : '#262421',
      roughness: 0.72,
      metalness: 0.05,
    });
    const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
    plinthMesh.position.y = -0.07;
    plinthMesh.receiveShadow = true;
    pedestalGroup.add(plinthMesh);

    const inlayGeo = new THREE.TorusGeometry(1.36, 0.006, 12, 80);
    const inlayMat = new THREE.MeshStandardMaterial({
      color: '#B89758',
      metalness: 0.85,
      roughness: 0.25,
    });
    const inlayMesh = new THREE.Mesh(inlayGeo, inlayMat);
    inlayMesh.rotation.x = Math.PI / 2;
    inlayMesh.position.y = 0.002;
    pedestalGroup.add(inlayMesh);

    const shadowTexture = createContactShadowTexture();
    const shadowPlaneGeo = new THREE.PlaneGeometry(2.55, 2.55);
    const shadowPlaneMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.004;
    pedestalGroup.add(shadowPlane);

    scene.add(pedestalGroup);

    sceneRefs.current = {
      scene,
      renderer,
      keyLight,
      fillLight,
      rimLight,
      plinthMat,
    };

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 1.95;
    controls.maxDistance = 6.2;
    controls.maxPolarAngle = Math.PI / 2 + 0.08;
    controls.target.set(...initialPreset.target);

    const clearPresetTargets = () => {
      cameraTargetPosRef.current = null;
      controlsTargetPosRef.current = null;
    };
    controls.addEventListener('start', clearPresetTargets);

    // Initial Product Model Build
    const initialBuild = buildProceduralProduct3D(product.id, finishId, isSoftwareGl);
    applyWireframeAndSubAssemblyHighlight(
      initialBuild,
      initialLightMeta.wireframe,
      selectedSubAssemblyIndex
    );
    scene.add(initialBuild.group);
    buildResultRef.current = initialBuild;
    setPartCount(initialBuild.parts.length);

    // ResizeObserver for responsive viewport sizing
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(entry.contentRect.width, 280);
        const h = Math.max(entry.contentRect.height, 320);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    // Animation loop with software-WebGL frame pacing
    let timerId = 0;
    let rafId = 0;
    let disposed = false;
    let lastTime = performance.now();

    const afterDraw = isSoftwareGl
      ? () => {
          timerId = window.setTimeout(
            () => {
              if (!disposed) rafId = requestAnimationFrame(animate);
            },
            1000 / 30
          );
        }
      : () => {
          if (!disposed) rafId = requestAnimationFrame(animate);
        };

    const animate = (now: number) => {
      if (disposed) return;
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      explodedCurrentRef.current = THREE.MathUtils.damp(
        explodedCurrentRef.current,
        explodedTargetRef.current,
        7.5,
        dt
      );

      const currentBuild = buildResultRef.current;
      if (currentBuild) {
        for (const part of currentBuild.parts) {
          const pos = computeExplodedOffset(
            part.basePos,
            part.explodeVec,
            explodedCurrentRef.current
          );
          part.mesh.position.set(pos[0], pos[1], pos[2]);
          if (part.spinSpeed) {
            part.mesh.rotation.z += dt * part.spinSpeed;
          }
        }

        if (autoRotateRef.current && !cameraTargetPosRef.current) {
          currentBuild.group.rotation.y += dt * 0.28;
        }
      }

      if (cameraTargetPosRef.current && controlsTargetPosRef.current) {
        camera.position.lerp(cameraTargetPosRef.current, Math.min(1, dt * 6.5));
        controls.target.lerp(controlsTargetPosRef.current, Math.min(1, dt * 6.5));
        if (camera.position.distanceTo(cameraTargetPosRef.current) < 0.02) {
          cameraTargetPosRef.current = null;
          controlsTargetPosRef.current = null;
        }
      }

      controls.update();
      renderer.render(scene, camera);
      afterDraw();
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      sceneRefs.current = null;
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', clearPresetTargets);
      controls.dispose();
      if (buildResultRef.current) {
        scene.remove(buildResultRef.current.group);
        buildResultRef.current.dispose();
        buildResultRef.current = null;
      }
      plinthGeo.dispose();
      plinthMat.dispose();
      inlayGeo.dispose();
      inlayMat.dispose();
      shadowPlaneGeo.dispose();
      shadowPlaneMat.dispose();
      shadowTexture.dispose();
      envTarget.dispose();
      renderer.dispose();
    };
  }, []);

  // Mutate Studio Lighting & CAD Wireframe mode in real time without remounting WebGL
  useEffect(() => {
    const refs = sceneRefs.current;
    const preset =
      STUDIO_LIGHTING_PRESETS[lightingPreset] ||
      STUDIO_LIGHTING_PRESETS['atelier-daylight'];
    if (refs) {
      refs.scene.background = new THREE.Color(preset.bgHex);
      refs.keyLight.color.set(preset.keyColorHex);
      refs.keyLight.intensity = preset.keyIntensity;
      refs.fillLight.color.set(preset.hemiSkyHex);
      refs.fillLight.intensity = preset.hemiIntensity;
      refs.rimLight.color.set(preset.rimColorHex);
      refs.rimLight.intensity = preset.rimIntensity;
      refs.renderer.toneMappingExposure = preset.exposure;
      refs.plinthMat.color.set(
        preset.id === 'atelier-daylight' ? '#E5E0D7' : '#23201D'
      );
    }
    applyWireframeAndSubAssemblyHighlight(
      buildResultRef.current,
      preset.wireframe,
      selectedSubAssemblyIndex
    );
  }, [lightingPreset, selectedSubAssemblyIndex]);

  // Rebuild 3D product assembly whenever product or finish changes
  useEffect(() => {
    const currentBuild = buildResultRef.current;
    if (!currentBuild) return;
    const parentScene = currentBuild.group.parent;
    if (!parentScene) return;

    const prevRotationY = currentBuild.group.rotation.y;
    parentScene.remove(currentBuild.group);
    currentBuild.dispose();

    const nextBuild = buildProceduralProduct3D(
      product.id,
      finishId,
      isSoftwareGlRef.current
    );
    nextBuild.group.rotation.y = prevRotationY;

    for (const part of nextBuild.parts) {
      const pos = computeExplodedOffset(
        part.basePos,
        part.explodeVec,
        explodedCurrentRef.current
      );
      part.mesh.position.set(pos[0], pos[1], pos[2]);
    }

    const preset =
      STUDIO_LIGHTING_PRESETS[lightingPreset] ||
      STUDIO_LIGHTING_PRESETS['atelier-daylight'];
    applyWireframeAndSubAssemblyHighlight(
      nextBuild,
      preset.wireframe,
      selectedSubAssemblyIndex
    );

    parentScene.add(nextBuild.group);
    buildResultRef.current = nextBuild;
    setPartCount(nextBuild.parts.length);
  }, [product.id, finishId]);

  const activeFinish = FINISH_OPTIONS[finishId];
  const activeLightingMeta =
    STUDIO_LIGHTING_PRESETS[lightingPreset] ||
    STUDIO_LIGHTING_PRESETS['atelier-daylight'];
  const isDarkAtmosphere = activeLightingMeta.id !== 'atelier-daylight';
  const subAssemblies = getProductSubAssemblies(product.id);
  const activeSubAssembly =
    selectedSubAssemblyIndex !== null
      ? subAssemblies.find((s) => s.partIndex === selectedSubAssemblyIndex) || null
      : null;

  const presetShortLabel = (id: CameraPresetId) => {
    if (id === 'three-quarter') return '3/4 View';
    if (id === 'front') return 'Front';
    if (id === 'top') return 'Top';
    return 'Side';
  };

  return (
    <div
      className="relative w-full h-[500px] sm:h-[560px] lg:h-[640px] rounded-xl overflow-hidden border border-[#E6E3DC] bg-[#EFECE6] select-none"
      data-testid="product-3d-viewport"
    >
      {/* Interactive Three.js WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        aria-label={`Interactive 3D model of ${product.name}`}
      />

      {/* Top-Left Minimal Spec & Telemetry Readout (unboxed typography, zero blur, never overlaps right lighting bar) */}
      <div className="pointer-events-none absolute top-4 left-5 max-w-[42%] flex flex-col gap-0.5">
        <span
          className={`font-mono text-[11px] uppercase tracking-[0.14em] truncate ${
            isDarkAtmosphere ? 'text-[#A8A39A]' : 'text-[#66645E]'
          }`}
        >
          {product.origin} · {partCount}-Part · {activeLightingMeta.kelvinLabel}
        </span>
        <span
          className={`text-xs font-medium truncate ${
            isDarkAtmosphere ? 'text-[#F7F6F2]' : 'text-[#141312]'
          }`}
        >
          {product.name} — {activeFinish.name}
        </span>
        {activeSubAssembly && (
          <span className="font-mono text-[11px] text-[#D97736] truncate">
            {activeSubAssembly.code}: {activeSubAssembly.name} ({activeSubAssembly.tolerance})
          </span>
        )}
      </div>

      {/* Top-Right Studio Atmosphere & Lighting Switcher (Solid surface, no backdrop-filter) */}
      {onSelectLightingPreset && (
        <div className="pointer-events-auto absolute top-3.5 right-4 hidden sm:flex items-center gap-1 rounded-lg border border-[#DCD8CF] bg-[#F7F6F2] p-1 shadow-sm">
          {STUDIO_LIGHTING_ORDER.map((lId) => {
            const preset = STUDIO_LIGHTING_PRESETS[lId];
            const active = lightingPreset === lId;
            return (
              <button
                key={lId}
                type="button"
                onClick={() => onSelectLightingPreset(lId)}
                data-testid={`lighting-preset-${lId}`}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#141312] text-[#F7F6F2]'
                    : 'text-[#66645E] hover:text-[#141312]'
                }`}
              >
                {preset.shortLabel}
              </button>
            );
          })}
        </div>
      )}

      {/* Unified Collapsible Bottom Control Dock (Solid surface, no backdrop-filter over WebGL) */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-col items-center pointer-events-none">
        <div className="pointer-events-auto w-full max-w-3xl rounded-lg border border-[#DCD8CF] bg-[#F7F6F2] shadow-sm transition-all">
          {/* Dock Header Bar */}
          <div className="flex items-center justify-between px-3.5 py-2 border-b border-[#E6E3DC]">
            <div className="flex items-center gap-3 overflow-x-auto">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#66645E] whitespace-nowrap shrink-0">
                3D Studio Controls
              </span>
              <span className="text-[#DCD8CF]">·</span>
              <button
                type="button"
                onClick={() => setAutoRotate((prev) => !prev)}
                className={`text-xs font-medium whitespace-nowrap shrink-0 px-2 py-0.5 rounded transition-colors ${
                  autoRotate
                    ? 'bg-[#141312] text-[#F7F6F2]'
                    : 'text-[#66645E] hover:text-[#141312]'
                }`}
                data-testid="toggle-autorotate-btn"
              >
                {autoRotate ? 'Turntable: Active' : 'Turntable: Paused'}
              </button>
              <span className="text-[#DCD8CF] hidden sm:inline">·</span>
              <button
                type="button"
                onClick={() => {
                  const nextVal = explodedProgress > 0.1 ? 0 : 1;
                  onExplodedChange(nextVal);
                  if (nextVal === 0 && onSelectSubAssembly) {
                    onSelectSubAssembly(null);
                  }
                }}
                className="text-xs font-medium text-[#9E472A] hover:underline whitespace-nowrap shrink-0"
                data-testid="quick-explode-btn"
              >
                {explodedProgress > 0.1 ? 'Assemble (0%)' : 'Explode Assembly (100%)'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setDockCollapsed((prev) => !prev)}
              className="text-xs font-mono text-[#66645E] hover:text-[#141312] whitespace-nowrap shrink-0 ml-2 px-1.5 py-0.5"
              data-testid="toggle-dock-btn"
              title="Toggle Studio Controls (Shortcut: H)"
            >
              {dockCollapsed ? '+ Show Controls' : '- Hide Controls'}
            </button>
          </div>

          {/* Expandable Studio Controls Body */}
          {!dockCollapsed && (
            <div className="p-3.5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Material Finish Swatches (4 cols) */}
              <div className="md:col-span-4 flex flex-col gap-1.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#66645E] truncate">
                  Finish: {activeFinish.name}
                </span>
                <div className="flex items-center gap-2">
                  {FINISH_ORDER.map((fId) => {
                    const option = FINISH_OPTIONS[fId];
                    const selected = option.id === finishId;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => onSelectFinish(option.id)}
                        aria-label={`Select ${option.name}`}
                        data-testid={`viewport-finish-${option.id}`}
                        className={`w-7 h-7 rounded-full border transition-transform flex items-center justify-center ${
                          selected
                            ? 'border-[#141312] scale-110 ring-2 ring-[#141312]/20'
                            : 'border-[#C8C4B9] hover:scale-105'
                        }`}
                        style={{ backgroundColor: option.hex }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: option.secondaryHex }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Exploded View Engineering Slider (4 cols) */}
              <div className="md:col-span-4 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="exploded-view-slider"
                    className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#66645E]"
                  >
                    Exploded View
                  </label>
                  <span
                    className="font-mono text-[11px] font-medium text-[#141312] tabular-nums"
                    data-testid="exploded-percentage-readout"
                  >
                    {Math.round(explodedProgress * 100)}%
                  </span>
                </div>
                <input
                  id="exploded-view-slider"
                  data-testid="exploded-view-slider"
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(explodedProgress * 100)}
                  onChange={(e) => onExplodedChange(Number(e.target.value) / 100)}
                  className="w-full h-1.5 bg-[#DCD8CF] rounded-lg appearance-none cursor-pointer accent-[#141312]"
                />
              </div>

              {/* Camera Angle Presets (4 cols) */}
              <div className="md:col-span-4 flex flex-col gap-1.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#66645E]">
                  Camera Elevation
                </span>
                <div className="grid grid-cols-4 gap-1">
                  {CAMERA_PRESET_ORDER.map((presetId) => {
                    const preset = CAMERA_PRESETS[presetId];
                    const active = cameraPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => onSelectCameraPreset(preset.id)}
                        data-testid={`camera-preset-${preset.id}`}
                        className={`px-2 py-1 text-[11px] font-medium rounded border transition-colors whitespace-nowrap shrink-0 ${
                          active
                            ? 'bg-[#141312] text-[#F7F6F2] border-[#141312]'
                            : 'bg-[#EFECE6] text-[#141312] border-[#DCD8CF] hover:border-[#141312]'
                        }`}
                      >
                        {presetShortLabel(preset.id)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

