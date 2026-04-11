// ═══════════════════════════════════════════════════════════════
// definitions.js — Thuộc tính & defaults của tất cả objects
// Load TRƯỚC app.js
// ═══════════════════════════════════════════════════════════════

// ── VERSION ─────────────────────────────────────────────────────
var VERSION = 'Alpha 0.0.6.20';

// ── FONTS ───────────────────────────────────────────────────────
var FONTS = [
  'GothamMedium','GothamBold','Gotham','Arial','ArialBold',
  'Legacy','Highway','SciFi','Antique','Cartoon','Code',
  'Fantasy','Garamond','Arcade','Ubuntu','Merriweather',
  'Oswald','Nunito','Bangers','Creepster'
];

// ── MÀU ĐẠI DIỆN TỪNG LOẠI ──────────────────────────────────────
var COL = {
  Frame:          '#7c6af7',
  ScrollingFrame: '#a78bfa',
  CanvasGroup:    '#c4b5fd',
  ViewportFrame:  '#60a5fa',
  VideoFrame:     '#f59e0b',
  ScreenGui:      '#22d3ee',
  TextLabel:      '#4ade80',
  ImageLabel:     '#34d399',
  TextButton:     '#f472b6',
  ImageButton:    '#fb7185',
  // Thêm mới
  TextBox:        '#38bdf8',
  BillboardGui:   '#fb923c',
  SurfaceGui:     '#a3e635',
  SelectionBox:   '#f43f5e',
  Highlight:      '#e879f9',
};

// ── KÍCH THƯỚC MẶC ĐỊNH KHI VẼ ──────────────────────────────────
var DW = {
  TextLabel:160, TextButton:120, ImageLabel:100, ImageButton:100,
  VideoFrame:200, ViewportFrame:160, ScreenGui:400, ScrollingFrame:200,
  CanvasGroup:180,
  // Thêm mới
  TextBox:180, BillboardGui:200, SurfaceGui:200,
  SelectionBox:120, Highlight:120,
};
var DH = {
  TextLabel:32, TextButton:36, ImageLabel:100, ImageButton:100,
  VideoFrame:120, ViewportFrame:120, ScreenGui:300, ScrollingFrame:200,
  CanvasGroup:180,
  // Thêm mới
  TextBox:36, BillboardGui:120, SurfaceGui:120,
  SelectionBox:120, Highlight:120,
};

// ── HÀM TẠO UDim2 GỌN ──────────────────────────────────────────
function mkU(px, ox, py, oy, sw, ow, sh, oh) {
  return { psX:px, poX:ox, psY:py, poY:oy, ssW:sw, soW:ow, ssH:sh, soH:oh };
}

// ════════════════════════════════════════════════════════════════
// DEFS — defaults của từng GuiObject
// ════════════════════════════════════════════════════════════════
var DEFS = {

  // ── CONTAINERS ──────────────────────────────────────────────
  Frame: {
    ...mkU(0,40,0,50,0,160,0,120),
    bc:{r:34,g:34,b:54}, bdc:{r:62,g:62,b:96}, bdw:0, cr:0,
    op:1, zi:0, vis:true, rot:0, mods:{},
  },
  ScrollingFrame: {
    ...mkU(0,40,0,50,0,200,0,200),
    bc:{r:26,g:26,b:40}, bdc:{r:62,g:62,b:96}, bdw:0, cr:0,
    op:1, zi:0, vis:true, rot:0, mods:{},
    sbt:6, sbc:{r:124,g:106,b:247}, csy:200, se:true,
  },
  CanvasGroup: {
    ...mkU(0,40,0,50,0,180,0,180),
    bc:{r:44,g:44,b:69}, bdc:{r:62,g:62,b:96}, bdw:0, cr:0,
    op:1, zi:0, vis:true, rot:0, mods:{}, gt:0.1,
  },
  ViewportFrame: {
    ...mkU(0,40,0,50,0,160,0,120),
    bc:{r:17,g:17,b:32}, bdc:{r:62,g:62,b:96}, bdw:0, cr:0,
    op:1, zi:0, vis:true, rot:0, mods:{},
  },
  VideoFrame: {
    ...mkU(0,40,0,50,0,200,0,120),
    bc:{r:17,g:17,b:32}, bdc:{r:62,g:62,b:96}, bdw:0, cr:0,
    op:1, zi:0, vis:true, rot:0, mods:{},
    vid:'rbxassetid://0', vol:0.5, vplay:false, vloop:false,
  },
  ScreenGui: {
    ...mkU(0,0,0,0,0,400,0,300),
    bc:{r:0,g:0,b:0}, op:1, zi:0, vis:true, rot:0, mods:{},
    en:true, dord:0, ros:true, igi:false,
  },

  // ── DISPLAY ─────────────────────────────────────────────────
  TextLabel: {
    ...mkU(0,40,0,50,0,160,0,32),
    bc:{r:0,g:0,b:0}, bdc:{r:62,g:62,b:96}, bdw:0, cr:0,
    op:1, zi:0, vis:true, rot:0, mods:{},
    txt:'Label', tc:{r:226,g:226,b:240}, tsz:14,
    fn:'GothamMedium', txa:'Left', tya:'Center',
    tw:false, tsc:false, rt:false,
  },
  ImageLabel: {
    ...mkU(0,40,0,50,0,100,0,100),
    bc:{r:49,g:50,b:68}, bdc:{r:62,g:62,b:96}, bdw:0, cr:0,
    op:1, zi:0, vis:true, rot:0, mods:{},
    img:'rbxassetid://0', ic:{r:255,g:255,b:255}, st:'Stretch', it:0,
  },

  // ── INTERACTIVE ─────────────────────────────────────────────
  TextButton: {
    ...mkU(0,40,0,50,0,120,0,36),
    bc:{r:124,g:106,b:247}, bdc:{r:167,g:139,b:250}, bdw:0, cr:8,
    op:1, zi:0, vis:true, rot:0, mods:{},
    txt:'Button', tc:{r:255,g:255,b:255}, tsz:14,
    fn:'GothamBold', txa:'Center', tya:'Center',
    tw:false, abc:true, modal:false,
  },
  ImageButton: {
    ...mkU(0,40,0,50,0,100,0,100),
    bc:{r:244,g:114,b:182}, bdc:{r:251,g:113,b:133}, bdw:0, cr:8,
    op:1, zi:0, vis:true, rot:0, mods:{},
    img:'rbxassetid://0', ic:{r:255,g:255,b:255},
    st:'Stretch', it:0, abc:true, modal:false,
  },

  // ── MỚI: TextBox ────────────────────────────────────────────
  TextBox: {
    ...mkU(0,40,0,50,0,180,0,36),
    bc:{r:22,g:22,b:38}, bdc:{r:56,g:189,b:248}, bdw:1, cr:6,
    op:1, zi:0, vis:true, rot:0, mods:{},
    // text
    txt:'', ph:'Nhập text...', tc:{r:226,g:226,b:240},
    phc:{r:90,g:90,b:120}, tsz:14, fn:'GothamMedium',
    txa:'Left', tya:'Center', tw:false, tsc:false, rt:false,
    // behaviour
    cls:false,       // ClearTextOnFocus
    multiLine:false,
    maxLen:0,        // 0 = không giới hạn
  },

  // ── MỚI: BillboardGui ───────────────────────────────────────
  BillboardGui: {
    ...mkU(0,0,0,0,0,200,0,120),
    bc:{r:20,g:20,b:36}, op:1, zi:0, vis:true, rot:0, mods:{},
    // BillboardGui-specific
    sz:{x:4, y:2},          // Size in studs (Vector2)
    studOffset:{x:0,y:1,z:0}, // StudsOffsetWorldSpace
    alwaysOnTop:false,
    lightInfluence:0,
    maxDist:0,               // 0 = unlimited
    enabled:true,
  },

  // ── MỚI: SurfaceGui ─────────────────────────────────────────
  SurfaceGui: {
    ...mkU(0,0,0,0,0,200,0,120),
    bc:{r:20,g:36,b:20}, op:1, zi:0, vis:true, rot:0, mods:{},
    // SurfaceGui-specific
    face:'Front',            // Enum.NormalId
    pixelsPerStud:50,
    alwaysOnTop:false,
    lightInfluence:0,
    enabled:true,
    toolPunchThrough:false,
    sizingMode:'FixedSize',
    canvasSize:{x:800, y:600},
  },

  // ── MỚI: SelectionBox (3D outline) ──────────────────────────
  SelectionBox: {
    ...mkU(0,40,0,50,0,120,0,120),
    bc:{r:244,g:63,b:94}, op:1, zi:0, vis:true, rot:0, mods:{},
    // SelectionBox-specific
    color:{r:244,g:63,b:94},
    lineThickness:0.05,
    surfaceColor:{r:244,g:63,b:94},
    surfaceTransparency:0.7,
    adornee:'',              // tên Part target (string)
  },

  // ── MỚI: Highlight (outline 3D mới hơn SelectionBox) ────────
  Highlight: {
    ...mkU(0,40,0,50,0,120,0,120),
    bc:{r:232,g:121,b:249}, op:1, zi:0, vis:true, rot:0, mods:{},
    // Highlight-specific
    fillColor:{r:232,g:121,b:249},
    fillTransparency:0.5,
    outlineColor:{r:255,g:255,b:255},
    outlineTransparency:0,
    depthMode:'AlwaysOnTop',  // 'AlwaysOnTop' | 'Occluded'
    enabled:true,
    adornee:'',
  },
};

// ════════════════════════════════════════════════════════════════
// MDEF — defaults của từng Modifier/Constraint
// ════════════════════════════════════════════════════════════════
var MDEF = {
  // ── Layout ──────────────────────────────────────────────────
  UIListLayout:  { fd:'Vertical', ha:'Left', va:'Top', so:'LayoutOrder', pd:4, wr:false },
  UIGridLayout:  { cs:100, cpx:4, cpy:4, fd:'Horizontal', ha:'Left', va:'Top', so:'LayoutOrder' },
  UITableLayout: { fec:false, fer:false, pd:0 },
  UIPageLayout:  { an:true, ad:'Horizontal', ci:false, es:'Quad', ed:'Out', pd:0 },

  // ── Modifier cơ bản ─────────────────────────────────────────
  UICorner:    { cr:8 },
  UIGradient:  { c0:'#7c6af7', c1:'#22d3ee', rot:0, en:true,
                 // Nâng cao: multi-stop (hiển thị dưới dạng JSON string)
                 stops:'', // vd: '0=#7c6af7,0.5=#f472b6,1=#22d3ee'
               },
  UIStroke:    { col:'#7c6af7', th:2, tr:0, en:true,
                 applyStrokeMode:'Border', // 'Border' | 'Contextual'
               },
  UIPadding:   { t:8, b:8, l:8, r:8 },
  UIScale:     { sc:1 },
  UIAspectRatioConstraint: { ar:1, at:'FitWithinMaxSize', da:'Width' },
  UISizeConstraint:        { mnx:0, mny:0, mxx:999, mxy:999 },
  UITextSizeConstraint:    { mn:6, mx:100 },
  UIFlexItem:  { fm:'Fill', gr:1, sr:1 },

  // ── Modifier mới bổ sung ─────────────────────────────────────
  UIBlurEffect: {
    size:24,        // BlurSize (0-56)
    en:true,
  },
  UIColorCorrectionEffect: {
    brightness:0,   // -1 → 1
    contrast:0,
    saturation:0,
    tintColor:{r:255,g:255,b:255},
    en:true,
  },
  UIBloomEffect: {
    intensity:0.8,
    size:24,
    threshold:0.95,
    en:true,
  },
  UIDepthOfFieldEffect: {
    farIntensity:0,
    focusDistance:50,
    inFocusRadius:10,
    nearIntensity:0,
    en:true,
  },
  UISunRaysEffect: {
    intensity:0.25,
    spread:1,
    en:true,
  },
};

// ════════════════════════════════════════════════════════════════
// mkEl — tạo element object từ type + UDim2 values
// ════════════════════════════════════════════════════════════════
function mkEl(type, psX, poX, psY, poY, ssW, soW, ssH, soH) {
  var d = JSON.parse(JSON.stringify(DEFS[type] || DEFS.Frame));
  var skipKeys = ['psX','poX','psY','poY','ssW','soW','ssH','soH','rot','mods','ax','ay'];
  var o = {
    id:    'el_' + (++idc),
    type:  type,
    name:  type + idc,
    psX:   psX !== undefined ? psX : d.psX,
    poX:   poX !== undefined ? poX : d.poX,
    psY:   psY !== undefined ? psY : d.psY,
    poY:   poY !== undefined ? poY : d.poY,
    ssW:   ssW !== undefined ? ssW : d.ssW,
    soW:   soW !== undefined ? soW : d.soW,
    ssH:   ssH !== undefined ? ssH : d.ssH,
    soH:   soH !== undefined ? soH : d.soH,
    ax: d.ax || 0,
    ay: d.ay || 0,
    rot: 0,
    parentId: null,
    warp: null,
    mods: {},
  };
  for (var k in d) {
    if (!skipKeys.includes(k)) o[k] = d[k];
  }
  return o;
}

function mkElFromPixel(type, px, py, pw, ph) {
  return mkEl(type, 0, Math.round(px), 0, Math.round(py),
              0, Math.max(20, Math.round(pw)), 0, Math.max(20, Math.round(ph)));
}

// ════════════════════════════════════════════════════════════════
// COMPONENT_GROUPS — cấu hình hiển thị left panel
// app.js đọc cái này để render danh sách component
// ════════════════════════════════════════════════════════════════
var COMPONENT_GROUPS = [
  {
    label: '📦 Containers',
    items: [
      { type:'Frame',          icon:'▭', color:'#7c6af7' },
      { type:'ScrollingFrame', icon:'⊟', color:'#a78bfa' },
      { type:'CanvasGroup',    icon:'⊞', color:'#c4b5fd' },
      { type:'ViewportFrame',  icon:'📦', color:'#60a5fa', badge:'3D' },
      { type:'VideoFrame',     icon:'▶', color:'#f59e0b' },
      { type:'ScreenGui',      icon:'⊡', color:'#22d3ee', badge:'Root' },
    ],
  },
  {
    label: '🔤 Display',
    items: [
      { type:'TextLabel',  icon:'T',  color:'#4ade80' },
      { type:'ImageLabel', icon:'🖼', color:'#34d399' },
    ],
  },
  {
    label: '🖱 Interactive',
    items: [
      { type:'TextButton',  icon:'⊡', color:'#f472b6' },
      { type:'ImageButton', icon:'🔘', color:'#fb7185' },
      { type:'TextBox',     icon:'✎', color:'#38bdf8', badge:'New' },
    ],
  },
  {
    label: '🌐 3D / World',
    items: [
      { type:'BillboardGui', icon:'📌', color:'#fb923c', badge:'3D' },
      { type:'SurfaceGui',   icon:'🟩', color:'#a3e635', badge:'3D' },
      { type:'SelectionBox', icon:'⬜', color:'#f43f5e', badge:'3D' },
      { type:'Highlight',    icon:'✦', color:'#e879f9', badge:'3D' },
    ],
  },
  {
    label: '📐 Layout',
    sublabel: '(select first)',
    items: [
      { type:'UIListLayout',  icon:'≡', color:'#fbbf24', mod:true },
      { type:'UIGridLayout',  icon:'⊞', color:'#fbbf24', mod:true },
      { type:'UITableLayout', icon:'⊟', color:'#fbbf24', mod:true },
      { type:'UIPageLayout',  icon:'⇌', color:'#fbbf24', mod:true },
    ],
  },
  {
    label: '✨ Modifiers',
    sublabel: '(select first)',
    items: [
      { type:'UICorner',                 icon:'◜', color:'#c4b5fd', mod:true },
      { type:'UIGradient',               icon:'▦', color:'#c4b5fd', mod:true },
      { type:'UIStroke',                 icon:'▭', color:'#c4b5fd', mod:true },
      { type:'UIPadding',                icon:'⊡', color:'#c4b5fd', mod:true },
      { type:'UIScale',                  icon:'⤢', color:'#c4b5fd', mod:true },
      { type:'UIAspectRatioConstraint',  icon:'⊠', color:'#c4b5fd', mod:true },
      { type:'UISizeConstraint',         icon:'⊞', color:'#c4b5fd', mod:true },
      { type:'UITextSizeConstraint',     icon:'T↕', color:'#c4b5fd', mod:true },
      { type:'UIFlexItem',               icon:'⇔', color:'#c4b5fd', mod:true, badge:'New' },
    ],
  },
  {
    label: '🌈 Effects',
    sublabel: '(select first)',
    items: [
      { type:'UIBlurEffect',             icon:'◌', color:'#818cf8', mod:true },
      { type:'UIColorCorrectionEffect',  icon:'🎨', color:'#818cf8', mod:true },
      { type:'UIBloomEffect',            icon:'✦', color:'#818cf8', mod:true },
      { type:'UIDepthOfFieldEffect',     icon:'◎', color:'#818cf8', mod:true },
      { type:'UISunRaysEffect',          icon:'☀', color:'#818cf8', mod:true },
    ],
  },
];
