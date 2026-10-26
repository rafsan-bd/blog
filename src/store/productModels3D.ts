import * as THREE from 'three';
import { FinishId, FINISH_OPTIONS } from './catalog';

export interface ExplodablePart {
  mesh: THREE.Object3D;
  basePos: [number, number, number];
  explodeVec: [number, number, number];
  spinSpeed?: number;
}

export interface BuiltProduct3D {
  group: THREE.Group;
  parts: ExplodablePart[];
  primaryMaterials: THREE.MeshPhysicalMaterial[];
  dispose: () => void;
}

function registerPart(
  group: THREE.Group,
  parts: ExplodablePart[],
  mesh: THREE.Object3D,
  basePos: [number, number, number],
  explodeVec: [number, number, number],
  spinSpeed = 0
) {
  mesh.position.set(basePos[0], basePos[1], basePos[2]);
  mesh.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  group.add(mesh);
  parts.push({ mesh, basePos, explodeVec, spinSpeed });
}

export function buildProceduralProduct3D(
  productId: string,
  finishId: FinishId,
  isSoftwareGl: boolean
): BuiltProduct3D {
  const finish = FINISH_OPTIONS[finishId];
  const group = new THREE.Group();
  const parts: ExplodablePart[] = [];
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };

  // Primary configurable material (Damascus Brass, Al-Quds Silver, Kiswah Ebony, or Medina Emerald)
  const primaryMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(finish.hex),
      metalness: finish.metalness,
      roughness: finish.roughness,
      clearcoat: finish.clearcoat,
      clearcoatRoughness: 0.14,
    })
  );

  // Contrasting Kiswah Ebony / Dark Bronze architectural accent
  const darkSanctuaryMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#191816'),
      metalness: 0.68,
      roughness: 0.42,
    })
  );

  // 24k Gold-Leaf / Burnished Damascus Brass accent
  const goldLeafMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#D4AF37'),
      metalness: 0.94,
      roughness: 0.16,
      clearcoat: 0.4,
    })
  );

  // Anatolian Walnut / Aged Al-Quds Olivewood timber material
  const walnutTimberMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#5E3A22'),
      metalness: 0.08,
      roughness: 0.56,
    })
  );

  // Honed Carrara / Medina Parchment Alabaster stone
  const marbleParchmentMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#F4EFE6'),
      metalness: 0.04,
      roughness: 0.28,
      clearcoat: 0.35,
    })
  );

  // Iridescent Damascus Mother-of-Pearl (Sadaf) inlay material
  const pearlInlayMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#F8FAFC'),
      metalness: 0.35,
      roughness: 0.12,
      clearcoat: 0.9,
    })
  );

  // Hand-cut Crystal Flacon / Glass material
  const crystalMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#fef3c7'),
      metalness: 0.0,
      roughness: 0.08,
      transmission: isSoftwareGl ? 0 : 0.86,
      transparent: true,
      opacity: isSoftwareGl ? 0.48 : 1.0,
      ior: 1.54,
      thickness: 0.8,
      depthWrite: false,
    })
  );

  // Warm 2700K Fanoos Amber & Bakhoor Ember Glow
  const amberGlowMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFF3D6'),
      emissive: new THREE.Color('#F59E0B'),
      emissiveIntensity: 0.52,
      roughness: 0.22,
      metalness: 0.05,
    })
  );

  if (productId === 'fanoos-01') {
    // 1. Al-Andalus Muqarnas Brass Fanoos (9 parts)
    const octagonalFoot = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.62, 0.72, 0.16, 8)),
      darkSanctuaryMat
    );
    registerPart(group, parts, octagonalFoot, [0, 0.08, 0], [0, -0.4, 0]);

    const lowerStarTray = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.58, 0.54, 0.12, 8)),
      primaryMat
    );
    registerPart(group, parts, lowerStarTray, [0, 0.22, 0], [0, -0.22, 0]);

    // 8-Fold Mashrabiya Pierced Columns Cage
    const cageGroup = new THREE.Group();
    const pillarGeo = trackGeo(new THREE.CylinderGeometry(0.032, 0.032, 0.92, 12));
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const pillar = new THREE.Mesh(pillarGeo, primaryMat);
      pillar.position.set(Math.cos(angle) * 0.48, 0, Math.sin(angle) * 0.48);
      cageGroup.add(pillar);
    }
    registerPart(group, parts, cageGroup, [0, 0.74, 0], [0, 0, 0]);

    // Interlocking Khatam Geometric Lattice Rings
    const latticeRingsGroup = new THREE.Group();
    const ringGeo = trackGeo(new THREE.TorusGeometry(0.49, 0.022, 12, 8));
    for (let r = 0; r < 3; r++) {
      const ring = new THREE.Mesh(ringGeo, goldLeafMat);
      ring.rotation.x = Math.PI / 2;
      ring.rotation.z = (r * Math.PI) / 8;
      ring.position.y = -0.26 + r * 0.26;
      latticeRingsGroup.add(ring);
    }
    registerPart(group, parts, latticeRingsGroup, [0, 0.74, 0], [0, 0.15, 0.45], 0.2);

    // Warm 2700K Hand-Blown Amber Core Diffuser
    const amberCore = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.32, 0.32, 0.78, 32)),
      amberGlowMat
    );
    registerPart(group, parts, amberCore, [0, 0.74, 0], [0, 0.32, 0]);

    // Upper Octagonal Cornice Gallery
    const upperCornice = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.58, 0.5, 0.14, 8)),
      primaryMat
    );
    registerPart(group, parts, upperCornice, [0, 1.26, 0], [0, 0.58, 0]);

    // Stepped Muqarnas Lower Cupola
    const muqarnasTier1 = new THREE.Mesh(
      trackGeo(new THREE.ConeGeometry(0.52, 0.34, 8)),
      goldLeafMat
    );
    registerPart(group, parts, muqarnasTier1, [0, 1.5, 0], [0, 0.85, 0]);

    // Ribbed Dome Lantern Crown
    const domeCupola = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.28, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.65)),
      primaryMat
    );
    registerPart(group, parts, domeCupola, [0, 1.62, 0], [0, 1.08, 0]);

    // Hilal Crescent Finial at Apex
    const hilalGroup = new THREE.Group();
    const crescentRing = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.12, 0.024, 16, 32, Math.PI * 1.45)),
      goldLeafMat
    );
    crescentRing.rotation.z = Math.PI * 0.78;
    const finialSpire = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.018, 0.03, 0.16, 16)),
      goldLeafMat
    );
    finialSpire.position.y = -0.14;
    hilalGroup.add(crescentRing, finialSpire);
    registerPart(group, parts, hilalGroup, [0, 1.98, 0], [0, 1.38, 0], 0.35);
  } else if (productId === 'kufic-mihrab-02') {
    // 2. Ayat al-Kursi Kufic Mihrab Wall Relief (10 parts)
    const galleryPedestal = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.38, 0.14, 0.52)),
      darkSanctuaryMat
    );
    registerPart(group, parts, galleryPedestal, [0, 0.07, 0], [0, -0.4, 0]);

    // Outer Architectural Stone Mihrab Portal
    const outerPortal = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.24, 1.54, 0.12)),
      marbleParchmentMat
    );
    registerPart(group, parts, outerPortal, [0, 0.91, -0.08], [0, 0, -0.45]);

    // Stepped Architectural Muqarnas Arch Crown
    const archCrown = new THREE.Group();
    const tier1 = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.12, 0.12, 0.14)),
      primaryMat
    );
    tier1.position.set(0, -0.06, 0);
    const tier2 = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.84, 0.12, 0.16)),
      goldLeafMat
    );
    tier2.position.set(0, 0.06, 0.01);
    const tier3 = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.52, 0.1, 0.18)),
      primaryMat
    );
    tier3.position.set(0, 0.17, 0.02);
    archCrown.add(tier1, tier2, tier3);
    registerPart(group, parts, archCrown, [0, 1.68, -0.05], [0, 0.52, -0.15]);

    // Kiswah Ebony Sanctuary Backplate
    const ebonyBackplate = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.04, 1.34, 0.08)),
      darkSanctuaryMat
    );
    registerPart(group, parts, ebonyBackplate, [0, 0.9, 0.0], [0, 0, -0.12]);

    // Twin Fluted Mihrab Colonnettes
    const columnsGroup = new THREE.Group();
    const colGeo = trackGeo(new THREE.CylinderGeometry(0.05, 0.05, 1.26, 20));
    const leftCol = new THREE.Mesh(colGeo, goldLeafMat);
    leftCol.position.set(-0.54, 0, 0);
    const rightCol = new THREE.Mesh(colGeo, goldLeafMat);
    rightCol.position.set(0.54, 0, 0);
    columnsGroup.add(leftCol, rightCol);
    registerPart(group, parts, columnsGroup, [0, 0.9, 0.06], [0, 0, 0.25]);

    // Outer Square Kufic (Kufi Murabba) Gold Calligraphy Frame
    const kuficOuterGroup = new THREE.Group();
    const hBarGeo = trackGeo(new THREE.BoxGeometry(0.78, 0.055, 0.06));
    const vBarGeo = trackGeo(new THREE.BoxGeometry(0.055, 0.72, 0.06));
    const topBar = new THREE.Mesh(hBarGeo, goldLeafMat);
    topBar.position.set(0, 0.36, 0);
    const botBar = new THREE.Mesh(hBarGeo, goldLeafMat);
    botBar.position.set(0, -0.36, 0);
    const lBar = new THREE.Mesh(vBarGeo, goldLeafMat);
    lBar.position.set(-0.36, 0, 0);
    const rBar = new THREE.Mesh(vBarGeo, goldLeafMat);
    rBar.position.set(0.36, 0, 0);
    kuficOuterGroup.add(topBar, botBar, lBar, rBar);
    registerPart(group, parts, kuficOuterGroup, [0, 0.88, 0.08], [0, 0.12, 0.52]);

    // Inner Kufic Sacred Script Geometric Bars ("Bismillah / Allahu La Ilaha Illa Huwa")
    const kuficInnerGroup = new THREE.Group();
    const barPositions: [number, number, number, number][] = [
      [0, 0.2, 0.48, 0.048],
      [0, -0.2, 0.48, 0.048],
      [-0.2, 0, 0.048, 0.44],
      [0.2, 0, 0.048, 0.44],
      [0, 0, 0.22, 0.048],
      [0, 0.09, 0.048, 0.22],
    ];
    for (const [bx, by, bw, bh] of barPositions) {
      const bar = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(bw, bh, 0.07)),
        primaryMat
      );
      bar.position.set(bx, by, 0);
      kuficInnerGroup.add(bar);
    }
    registerPart(group, parts, kuficInnerGroup, [0, 0.88, 0.11], [0, 0.22, 0.85]);

    // Central Mother-of-Pearl Khatam 8-Pointed Star Medallion
    const starMedallion = new THREE.Group();
    const sqGeo = trackGeo(new THREE.BoxGeometry(0.18, 0.18, 0.05));
    const sq1 = new THREE.Mesh(sqGeo, pearlInlayMat);
    const sq2 = new THREE.Mesh(sqGeo, goldLeafMat);
    sq2.rotation.z = Math.PI / 4;
    starMedallion.add(sq1, sq2);
    registerPart(group, parts, starMedallion, [0, 0.88, 0.15], [0, 0.35, 1.15], 0.4);

    // Suspended Mihrab Mosque Lamp Ornament in Upper Arch
    const lampOrnament = new THREE.Mesh(
      trackGeo(new THREE.OctahedronGeometry(0.11, 0)),
      amberGlowMat
    );
    registerPart(group, parts, lampOrnament, [0, 1.44, 0.09], [0, 0.65, 0.65]);

    // Qibla French Cleat Back Rail
    const cleatRail = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.92, 0.12, 0.05)),
      walnutTimberMat
    );
    registerPart(group, parts, cleatRail, [0, 1.15, -0.17], [0, 0.25, -0.78]);
  } else if (productId === 'rehal-03') {
    // 3. Sultanate Mother-of-Pearl Walnut Rehal / Qur'an Stand (8 parts)
    const velvetPlinth = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.76, 0.82, 0.1, 8)),
      darkSanctuaryMat
    );
    registerPart(group, parts, velvetPlinth, [0, 0.05, 0], [0, -0.38, 0]);

    // Left Interlocking Walnut X-Wing Leaf
    const leftWing = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.18, 0.09, 0.86)),
      walnutTimberMat
    );
    leftWing.rotation.z = 0.52;
    registerPart(group, parts, leftWing, [-0.14, 0.64, 0], [-0.48, 0.15, 0]);

    // Right Interlocking Walnut X-Wing Leaf
    const rightWing = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.18, 0.09, 0.86)),
      primaryMat
    );
    rightWing.rotation.z = -0.52;
    registerPart(group, parts, rightWing, [0.14, 0.64, 0], [0.48, 0.15, 0]);

    // Central 9-Tooth Mortise Hinge Axis Pin
    const hingePin = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.065, 0.065, 0.92, 24)),
      goldLeafMat
    );
    hingePin.rotation.x = Math.PI / 2;
    registerPart(group, parts, hingePin, [0, 0.56, 0], [0, -0.12, 0.55]);

    // Damascus Mother-of-Pearl (Sadaf) 8-Pointed Star Rosettes on Wings
    const sadafInlayGroup = new THREE.Group();
    const starPlateGeo = trackGeo(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 8));
    const leftStar = new THREE.Mesh(starPlateGeo, pearlInlayMat);
    leftStar.position.set(-0.34, 0.34, 0.44);
    leftStar.rotation.x = Math.PI / 2;
    const rightStar = new THREE.Mesh(starPlateGeo, pearlInlayMat);
    rightStar.position.set(0.34, 0.34, 0.44);
    rightStar.rotation.x = Math.PI / 2;
    sadafInlayGroup.add(leftStar, rightStar);
    registerPart(group, parts, sadafInlayGroup, [0, 0.18, 0], [0, 0.25, 0.65]);

    // Open Illuminated Mushaf (Left & Right Gilded Folios) Resting in Cradle
    const mushafLeftPage = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.56, 0.06, 0.74)),
      marbleParchmentMat
    );
    mushafLeftPage.rotation.z = -0.36;
    registerPart(group, parts, mushafLeftPage, [-0.24, 0.86, 0], [-0.32, 0.62, 0]);

    const mushafRightPage = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.56, 0.06, 0.74)),
      marbleParchmentMat
    );
    mushafRightPage.rotation.z = 0.36;
    registerPart(group, parts, mushafRightPage, [0.24, 0.86, 0], [0.32, 0.62, 0]);

    // Illuminated Surah Header & Woven Silk Bookmark Ribbon
    const illuminationGroup = new THREE.Group();
    const goldMedallionL = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.11, 0.11, 0.02, 16)),
      goldLeafMat
    );
    goldMedallionL.position.set(-0.22, 0.04, 0);
    goldMedallionL.rotation.z = -0.36;
    const goldMedallionR = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.11, 0.11, 0.02, 16)),
      goldLeafMat
    );
    goldMedallionR.position.set(0.22, 0.04, 0);
    goldMedallionR.rotation.z = 0.36;
    illuminationGroup.add(goldMedallionL, goldMedallionR);
    registerPart(group, parts, illuminationGroup, [0, 0.86, 0], [0, 0.95, 0.25]);
  } else if (productId === 'mabkhara-04') {
    // 4. Haramain Royal Oud & Crystal Mabkhara Set (8 parts)
    const presentationTray = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.86, 0.92, 0.1, 8)),
      darkSanctuaryMat
    );
    registerPart(group, parts, presentationTray, [0, 0.05, 0], [0, -0.4, 0]);

    // Mabkhara Pedestal Foot (Left-Center)
    const mabkharaFoot = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.22, 0.38, 0.42, 8)),
      primaryMat
    );
    registerPart(group, parts, mabkharaFoot, [-0.24, 0.31, 0], [-0.25, -0.12, 0]);

    // Mabkhara Geometric Chalice Body
    const chaliceCup = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.42, 0.22, 0.46, 8)),
      primaryMat
    );
    registerPart(group, parts, chaliceCup, [-0.24, 0.74, 0], [-0.25, 0.18, 0]);

    // Corner Castellated Turrets (Najdi / Meccan Mabkhara Silhouette)
    const turretsGroup = new THREE.Group();
    const turretGeo = trackGeo(new THREE.ConeGeometry(0.065, 0.18, 4));
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const t = new THREE.Mesh(turretGeo, goldLeafMat);
      t.position.set(Math.cos(a) * 0.34, 0, Math.sin(a) * 0.34);
      turretsGroup.add(t);
    }
    registerPart(group, parts, turretsGroup, [-0.24, 1.04, 0], [-0.25, 0.52, 0]);

    // Glowing Agarwood Bakhoor Ember Core
    const bakhoorEmber = new THREE.Mesh(
      trackGeo(new THREE.DodecahedronGeometry(0.16, 1)),
      amberGlowMat
    );
    registerPart(group, parts, bakhoorEmber, [-0.24, 0.92, 0], [-0.25, 0.78, 0], 0.5);

    // Pierced Geometric Smoke Diffusion Crown Lid
    const smokeCrown = new THREE.Mesh(
      trackGeo(new THREE.ConeGeometry(0.32, 0.36, 8)),
      goldLeafMat
    );
    registerPart(group, parts, smokeCrown, [-0.24, 1.22, 0], [-0.25, 1.15, 0]);

    // Companion Royal Cambodian Oud Crystal Decanter (Right Side)
    const oudBottleBody = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.2, 0.24, 0.56, 8)),
      crystalMat
    );
    oudBottleBody.renderOrder = 8;
    registerPart(group, parts, oudBottleBody, [0.42, 0.38, 0.12], [0.48, 0.15, 0.25]);

    // Faceted 24k Gold Decanter Stopper & Dipper Wand
    const oudStopper = new THREE.Mesh(
      trackGeo(new THREE.OctahedronGeometry(0.14, 0)),
      goldLeafMat
    );
    registerPart(group, parts, oudStopper, [0.42, 0.78, 0.12], [0.48, 0.72, 0.25], 0.35);
  } else if (productId === 'tasbih-05') {
    // 5. Al-Quds 99-Bead Olivewood & Sterling Silver Tasbih (9 parts)
    const sanctuaryPedestal = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.74, 0.8, 0.12, 48)),
      darkSanctuaryMat
    );
    registerPart(group, parts, sanctuaryPedestal, [0, 0.06, 0], [0, -0.4, 0]);

    const brassInlayRing = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.66, 0.018, 16, 64)),
      goldLeafMat
    );
    brassInlayRing.rotation.x = Math.PI / 2;
    registerPart(group, parts, brassInlayRing, [0, 0.13, 0], [0, -0.22, 0]);

    // Central Turned Al-Quds Olivewood Display Cone
    const oliveStand = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.26, 0.42, 0.54, 32)),
      walnutTimberMat
    );
    registerPart(group, parts, oliveStand, [0, 0.38, 0], [0, 0, 0]);

    // Tier 1: Lower Loop of 33 Olivewood Prayer Beads
    const beadGeo = trackGeo(new THREE.SphereGeometry(0.072, 20, 20));
    const lowerBeadsGroup = new THREE.Group();
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const bead = new THREE.Mesh(beadGeo, i % 4 === 0 ? primaryMat : walnutTimberMat);
      bead.position.set(
        Math.cos(a) * 0.56,
        Math.sin(a * 2) * 0.06,
        Math.sin(a) * 0.56
      );
      lowerBeadsGroup.add(bead);
    }
    registerPart(group, parts, lowerBeadsGroup, [0, 0.48, 0], [0, 0.22, 0], 0.18);

    // Tier 2: Upper Loop of 33 Prayer Beads in Selected Finish
    const upperBeadsGroup = new THREE.Group();
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + 0.2;
      const bead = new THREE.Mesh(beadGeo, primaryMat);
      bead.position.set(
        Math.cos(a) * 0.44,
        Math.cos(a * 2) * 0.05,
        Math.sin(a) * 0.44
      );
      upperBeadsGroup.add(bead);
    }
    registerPart(group, parts, upperBeadsGroup, [0, 0.76, 0], [0, 0.52, 0], -0.22);

    // Twin 33-Count Shahid Divider Rings
    const shahidGroup = new THREE.Group();
    const shahidGeo = trackGeo(new THREE.CylinderGeometry(0.055, 0.055, 0.18, 20));
    const shahidL = new THREE.Mesh(shahidGeo, goldLeafMat);
    shahidL.position.set(-0.56, 0, 0);
    const shahidR = new THREE.Mesh(shahidGeo, goldLeafMat);
    shahidR.position.set(0.56, 0, 0);
    shahidGroup.add(shahidL, shahidR);
    registerPart(group, parts, shahidGroup, [0, 0.62, 0], [0, 0.38, 0.45]);

    // Hand-Filigreed Minaret Imame Finial Stem
    const imameMinaret = new THREE.Mesh(
      trackGeo(new THREE.ConeGeometry(0.11, 0.48, 24)),
      primaryMat
    );
    registerPart(group, parts, imameMinaret, [0, 1.12, 0], [0, 0.88, 0]);

    // Sterling Silver & Gold Tassel Crown Ring
    const imameCrown = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.12, 0.025, 16, 32)),
      goldLeafMat
    );
    imameCrown.rotation.x = Math.PI / 2;
    registerPart(group, parts, imameCrown, [0, 1.38, 0], [0, 1.14, 0]);

    // Crescent Crest Finial
    const topBead = new THREE.Mesh(
      trackGeo(new THREE.OctahedronGeometry(0.09, 0)),
      pearlInlayMat
    );
    registerPart(group, parts, topBead, [0, 1.52, 0], [0, 1.35, 0], 0.4);
  } else {
    // 6. Rawdah Silk & Merino Mihrab Sajjada / Prayer Rug (7 composite parts)
    const loomPlatform = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.48, 0.1, 1.78)),
      darkSanctuaryMat
    );
    loomPlatform.rotation.x = 0.34;
    registerPart(group, parts, loomPlatform, [0, 0.62, 0], [0, -0.42, -0.2]);

    // 14mm Ergonomic Merino Wool Foundation Pile
    const woolFoundation = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.32, 0.08, 1.62)),
      marbleParchmentMat
    );
    woolFoundation.rotation.x = 0.34;
    registerPart(group, parts, woolFoundation, [0, 0.7, 0.02], [0, -0.1, 0]);

    // Medina Emerald / Primary Finish Sanctuary Field
    const sanctuaryField = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.06, 0.06, 1.34)),
      primaryMat
    );
    sanctuaryField.rotation.x = 0.34;
    registerPart(group, parts, sanctuaryField, [0, 0.75, 0.04], [0, 0.18, 0.15]);

    // Raised Mulberry Silk Stepped Mihrab Arch Portal
    const mihrabArchGroup = new THREE.Group();
    const leftPillar = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.08, 0.05, 0.96)),
      goldLeafMat
    );
    leftPillar.position.set(-0.42, 0, 0.08);
    const rightPillar = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.08, 0.05, 0.96)),
      goldLeafMat
    );
    rightPillar.position.set(0.42, 0, 0.08);
    const archHeader = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.42, 0.42, 0.05, 6)),
      goldLeafMat
    );
    archHeader.position.set(0, 0, -0.36);
    mihrabArchGroup.add(leftPillar, rightPillar, archHeader);
    mihrabArchGroup.rotation.x = 0.34;
    registerPart(group, parts, mihrabArchGroup, [0, 0.8, 0.06], [0, 0.48, 0.32]);

    // Suspended Misbah Mosque Lamp Relief in Center of Mihrab
    const misbahRelief = new THREE.Mesh(
      trackGeo(new THREE.OctahedronGeometry(0.12, 0)),
      amberGlowMat
    );
    misbahRelief.rotation.x = 0.34;
    registerPart(group, parts, misbahRelief, [0, 0.92, -0.12], [0, 0.78, 0.45]);

    // Geometric Khatam Border Medallions
    const borderMedallions = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.24, 0.024, 12, 8)),
      pearlInlayMat
    );
    borderMedallions.rotation.x = Math.PI / 2 + 0.34;
    registerPart(group, parts, borderMedallions, [0, 0.76, 0.24], [0, 0.95, 0.58]);

    // Hand-Knotted Silk Warp Fringes (Upper & Lower Ends)
    const fringesGroup = new THREE.Group();
    const topFringe = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.28, 0.04, 0.1)),
      goldLeafMat
    );
    topFringe.position.set(0, 0, -0.84);
    const botFringe = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.28, 0.04, 0.1)),
      goldLeafMat
    );
    botFringe.position.set(0, 0, 0.84);
    fringesGroup.add(topFringe, botFringe);
    fringesGroup.rotation.x = 0.34;
    registerPart(group, parts, fringesGroup, [0, 0.72, 0.02], [0, 0.35, 0.85]);
  }

  return {
    group,
    parts,
    primaryMaterials: [primaryMat],
    dispose: () => {
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
    },
  };
}
