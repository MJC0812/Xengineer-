class VoiceDrawingApp {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d',{ willReadFrequently: true });
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');
        this.voiceBtn = document.getElementById('voiceBtn');
        this.historyList = document.getElementById('historyList');
        this.currentToolDiv = document.getElementById('currentTool');
        this.dialectInfo = document.getElementById('dialectInfo');
        this.tipsList = document.getElementById('tipsList');
        this.modeValue = document.getElementById('modeValue');
        this.sizeValue = document.getElementById('sizeValue');
        this.sizeDisplay = document.getElementById('sizeDisplay');
        this.chatContainer = document.getElementById('chatContainer');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.dialectButtons = null;
        
        this.isListening = false;
        this.recognition = null;
        this.commandHistory = [];
        
        this.currentTool = 'brush';
        this.currentColor = '#333333';
        this.currentSize = 5;
        this.lineType = 'solid';  // 线型：solid, dashed, dotted, dashdot
        
        this.drawingHistory = [];
        this.historyIndex = -1;
        
        this.currentDialect = 'mandarin';
        this.fillMode = false;
        this.gradientMode = false;
        
        // 多函数叠加
        this.functionLayers = [];
        this.maxFunctionLayers = 5;
        
        this.renderQueue = [];
        this.isRendering = false;
        this.renderTimestamp = 0;
        
        this.layers = [];
        this.currentLayerIndex = 0;
        this.maxLayers = 10;
        
        this.precisionMode = false;
        this.gridVisible = false;
        this.snapToGrid = false;
        this.gridSize = 20;
        
        this.currentShapeSize = 100;
        this.currentShapePosition = { x: 0.5, y: 0.5 };
        
        this.smartSuggestions = [];
        this.commandSuggestions = [];
        
        this.pinyinMap = this.buildPinyinMap();
        this.intentAnalyzer = new IntentAnalyzer();
        
        this.voiceActivationEnabled = true;
        this.wakeWords = ['小助手', '助手', '画画', '绘图', '嘿助手', '你好助手'];
        this.isWakeWordDetected = false;
        this.silenceTimeout = null;
        this.lastSpeechTime = 0;
        this.autoStopDelay = 30000;
        
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.animationId = null;
        
        // 智能特性
        this.commandHistory = [];
        this.userPreferences = this.loadUserPreferences();
        this.contextHistory = [];
        this.maxContextHistory = 5;
        this.commandFrequency = {};
        
        this.initLayers();
        
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });
        
        this.cachedGradients = {};
        this.lastDrawTime = 0;
        
        this.dialects = {
            mandarin: {
                name: '普通话',
                langCode: 'zh-CN',
                speechLang: 'zh-CN',
                commands: {
                    drawCircle: ['画圆', '圆形', '圆圈', '画一个圆', '绘制圆形', '给我画个圆', '帮我画圆', '画个圆圈', '我要画圆', '画圆形', '画一个圆圈', '画个圆'],
                    drawSquare: ['画正方形', '正方形', '方块', '画一个正方形', '绘制正方形', '给我画个正方形', '帮我画正方形', '画个方块', '我要画正方形', '画方形', '画一个方块'],
                    drawRectangle: ['画长方形', '长方形', '矩形', '画一个长方形', '绘制矩形', '给我画个长方形', '帮我画长方形', '画个长方形', '我要画长方形', '画矩形', '画个矩形'],
                    drawLine: ['画直线', '直线', '画线', '画一条直线', '给我画条线', '帮我画直线', '画一条线', '我要画直线', '画条线', '画横线', '画竖线'],
                    drawTriangle: ['画三角形', '三角形', '画一个三角形', '给我画个三角形', '帮我画三角形', '画个三角形', '我要画三角形', '画三角'],
                    drawEllipse: ['画椭圆', '椭圆形', '椭圆', '给我画个椭圆', '帮我画椭圆', '画个椭圆', '我要画椭圆', '画椭圆形'],
                    drawDiamond: ['画菱形', '菱形', '菱形图案', '给我画个菱形', '帮我画菱形', '画个菱形', '我要画菱形', '画钻石形状'],
                    drawStar: ['画五角星', '五角星', '星星', '星', '给我画个五角星', '帮我画星星', '画个星星', '我要画星星', '画五角星', '画个五角星'],
                    drawPolygon: ['画多边形', '多边形', '五边形', '六边形', '八边形', '给我画个多边形', '帮我画多边形', '画个五边形', '画个六边形', '我要画多边形'],
                    drawArc: ['画弧线', '弧线', '圆弧', '给我画个弧线', '帮我画弧线', '画个弧线', '我要画弧线', '画圆弧'],
                    drawCurve: ['画曲线', '曲线', '波浪线', '给我画条曲线', '帮我画曲线', '画波浪线', '我要画曲线', '画波浪', '画条波浪线'],
                    drawSin: ['画正弦', '正弦函数', 'sin', '正弦曲线', '给我画正弦曲线', '帮我画正弦', '画正弦函数', '我要画正弦', '画sin曲线'],
                    drawCos: ['画余弦', '余弦函数', 'cos', '余弦曲线', '给我画余弦曲线', '帮我画余弦', '画余弦函数', '我要画余弦', '画cos曲线'],
                    drawTan: ['画正切', '正切函数', 'tan', '正切曲线', '给我画正切曲线', '帮我画正切', '画正切函数', '我要画正切', '画tan曲线'],
                    drawParabola: ['画抛物线', '抛物线', '二次函数', 'y等于x平方', '给我画抛物线', '帮我画抛物线', '画二次函数', '我要画抛物线', '画y等于x平方'],
                    drawExponential: ['画指数', '指数函数', 'e的x次方', '指数曲线', '给我画指数曲线', '帮我画指数', '画指数函数', '我要画指数', '画e的x次方'],
                    drawLog: ['画对数', '对数函数', 'ln', 'log', '对数曲线', '给我画对数曲线', '帮我画对数', '画对数函数', '我要画对数', '画ln曲线'],
                    drawAbs: ['画绝对值', '绝对值函数', '绝对值曲线', '给我画绝对值', '帮我画绝对值', '画绝对值函数', '我要画绝对值', '画y等于x绝对值'],
                    drawCsc: ['画余割', '余割函数', 'csc', '给我画余割', '帮我画余割', '画csc曲线'],
                    drawSec: ['画正割', '正割函数', 'sec', '给我画正割', '帮我画正割', '画sec曲线'],
                    drawCot: ['画余切', '余切函数', 'cot', '给我画余切', '帮我画余切', '画cot曲线'],
                    drawSinh: ['画双曲正弦', '双曲正弦函数', 'sinh', '给我画双曲正弦', '帮我画sinh'],
                    drawCosh: ['画双曲余弦', '双曲余弦函数', 'cosh', '给我画双曲余弦', '帮我画cosh'],
                    drawTanh: ['画双曲正切', '双曲正切函数', 'tanh', '给我画双曲正切', '帮我画tanh'],
                    drawSqrt: ['画平方根', '根号函数', 'sqrt', '给我画平方根', '帮我画根号', '画根号'],
                    drawCube: ['画立方函数', '三次函数', '立方', 'x立方', '给我画立方', '帮我画三次函数', '画x的立方'],
                    drawReciprocal: ['画倒数函数', '倒数曲线', '反比例', '给我画倒数', '帮我画倒数', '画反比例', '画1除以x'],
                    // 反三角函数
                    drawAsin: ['画反正弦', '反正弦函数', 'asin', 'arcsin', '给我画反正弦', '帮我画反正弦', '画arcsin'],
                    drawAcos: ['画反余弦', '反余弦函数', 'acos', 'arccos', '给我画反余弦', '帮我画反余弦', '画arccos'],
                    drawAtan: ['画反正切', '反正切函数', 'atan', 'arctan', '给我画反正切', '帮我画反正切', '画arctan'],
                    drawAcsc: ['画反余割', '反余割函数', 'acsc', 'arccsc', '给我画反余割', '帮我画反余割'],
                    drawAsec: ['画反正割', '反正割函数', 'asec', 'arcsec', '给我画反正割', '帮我画反正割'],
                    drawAcot: ['画反余切', '反余切函数', 'acot', 'arccot', '给我画反余切', '帮我画反余切'],
                    // 高次幂函数
                    drawQuartic: ['画四次函数', '四次方', 'x四次方', '给我画四次函数', '帮我画四次方', '画x的四次方'],
                    drawQuintic: ['画五次函数', '五次方', 'x五次方', '给我画五次函数', '帮我画五次方', '画x的五次方'],
                    drawSextic: ['画六次函数', '六次方', 'x六次方', '给我画六次函数', '帮我画六次方', '画x的六次方'],
                    // 极坐标图形
                    drawPolarRose: ['画玫瑰曲线', '玫瑰曲线', '极坐标玫瑰', '给我画玫瑰曲线', '帮我画玫瑰曲线', '画玫瑰花瓣'],
                    drawPolarHeart: ['画极坐标心形', '极坐标心形', '心形线', '给我画极坐标心形', '帮我画心形线'],
                    drawPolarSpiral: ['画极坐标螺旋', '极坐标螺旋', '阿基米德螺旋', '给我画极坐标螺旋', '帮我画阿基米德螺旋'],
                    // 参数方程图形
                    drawLissajous: ['画利萨如图形', '利萨如图形', '利萨如曲线', '给我画利萨如图形', '帮我画利萨如'],
                    drawParametricCircle: ['画参数圆', '参数圆', '给我画参数圆'],
                    drawParametricEllipse: ['画参数椭圆', '参数椭圆', '给我画参数椭圆'],
                    drawParametricFigure8: ['画八字曲线', '八字曲线', '给我画八字曲线', '帮我画八字'],
                    // 线型切换
                    setSolidLine: ['实线', '切换实线', '用实线', '画实线', '我要实线'],
                    setDashedLine: ['虚线', '切换虚线', '用虚线', '画虚线', '我要虚线'],
                    setDottedLine: ['点线', '切换点线', '用点线', '画点线', '我要点线'],
                    setDashDotLine: ['点划线', '切换点划线', '用点划线', '画点划线', '我要点划线'],
                    // 标注功能
                    drawCoordinateLabel: ['添加坐标标注', '坐标标注', '显示坐标', '标注坐标', '给我添加标注'],
                    // 多函数叠加
                    addSinLayer: ['叠加正弦', '添加正弦函数', '叠加sin', '再加正弦'],
                    addCosLayer: ['叠加余弦', '添加余弦函数', '叠加cos', '再加余弦'],
                    addParabolaLayer: ['叠加抛物线', '添加抛物线函数', '再加抛物线'],
                    clearFunctionLayers: ['清除函数叠加', '清除叠加', '清空函数图层'],
                    drawGrid: ['画坐标系', '坐标系', '网格', '坐标轴', '给我画坐标系', '帮我画坐标系', '画坐标轴', '我要画坐标系', '画网格', '画坐标'],
                    drawBezier: ['画贝塞尔曲线', '贝塞尔曲线', '贝塞尔', '画曲线', '平滑曲线', '给我画贝塞尔曲线'],
                    drawArrow: ['画箭头', '箭头', '带箭头的线', '给我画箭头', '画一个箭头', '箭头线'],
                    drawDashedLine: ['画虚线', '虚线', '断线', '给我画虚线', '画一条虚线'],
                    drawHeart: ['画心形', '心形', '爱心', '心', '给我画心形', '画爱心', '画一个心'],
                    drawRoundedRect: ['画圆角矩形', '圆角矩形', '圆角方块', '给我画圆角矩形', '画圆角方块'],
                    drawCross: ['画十字', '十字', '十字线', '给我画十字', '画一个十字'],
                    drawConcentricCircles: ['画同心圆', '同心圆', '多个圆', '给我画同心圆', '画一组圆'],
                    drawSpiral: ['画螺旋线', '螺旋线', '螺旋', '涡旋', '给我画螺旋线', '画螺旋'],
                    drawSector: ['画扇形', '扇形', '扇区', '给我画扇形', '画一个扇形'],
                    drawParallelogram: ['画平行四边形', '平行四边形', '平行', '给我画平行四边形', '帮我画平行四边形', '画个平行四边形'],
                    drawRing: ['画圆环', '圆环', '环形', '给我画圆环', '帮我画圆环', '画个圆环', '画环形'],
                    drawNGon: ['画多边形', '多边形', 'N边形', '给我画多边形', '帮我画多边形', '画个多边形'],
                    drawPentagon: ['画五边形', '五边形', '给我画五边形', '帮我画五边形', '画个五边形'],
                    drawHexagon: ['画六边形', '六边形', '给我画六边形', '帮我画六边形', '画个六边形'],
                    drawOctagon: ['画八边形', '八边形', '给我画八边形', '帮我画八边形', '画个八边形'],
                    showGrid: ['显示网格', '打开网格', '显示参考网格', '参考网格', '开启网格'],
                    hideGrid: ['隐藏网格', '关闭网格', '隐藏参考网格', '关掉网格'],
                    addLayer: ['添加图层', '新建图层', '创建图层', '增加图层', '我要添加图层'],
                    precisionMode: ['精确模式', '开启精确模式', '启用精确模式', '精确绘制'],
                    quickHelp: ['快速帮助', '快捷指令', '指令列表', '帮助', '有哪些指令'],
                    brush: ['画笔', '笔刷', '切换画笔', '使用画笔', '我要用画笔', '换成画笔', '切换到画笔', '选择画笔', '使用画笔工具'],
                    eraser: ['橡皮', '橡皮擦', '切换橡皮', '使用橡皮', '我要用橡皮', '换成橡皮', '切换到橡皮', '选择橡皮', '使用橡皮擦', '用橡皮擦擦'],
                    fill: ['填充', '填充颜色', '实心', '我要填充', '填充这个', '实心填充', '启用填充', '打开填充', '填充模式'],
                    gradient: ['渐变', '渐变填充', '渐变色', '我要渐变', '渐变填充', '启用渐变', '打开渐变', '渐变模式', '渐变颜色'],
                    text: ['文字', '添加文字', '输入文字', '我要写文字', '写字', '输入文字', '添加文字', '插入文字', '文字工具'],
                    select: ['选择', '选择工具', '选取', '我要选择', '选择图形', '切换选择', '选择工具', '选中它'],
                    move: ['移动', '移动图形', '我要移动', '移一下', '移动这个', '挪一下', '搬过去', '拖过去'],
                    rotate: ['旋转', '旋转图形', '我要旋转', '转一下', '旋转这个', '转个圈', '转角度'],
                    scale: ['缩放', '放大', '缩小', '我要放大', '放大一点', '缩小一点', '变大', '变小', '调大', '调小'],
                    undo: ['撤销', '后退', '返回上一步', '我要撤销', '撤销一下', '回到上一步', '取消', '不要这个', '撤回'],
                    redo: ['重做', '前进', '恢复', '我要重做', '重做一下', '前进', '恢复刚才', '再做一次'],
                    clear: ['清空', '清除', '重置画布', '擦除所有', '我要清空', '清空画布', '擦掉所有', '重新来', '全部清除', '擦干净'],
                    save: ['保存', '保存图片', '导出图片', '我要保存', '保存一下', '导出图片', '下载图片', '存起来', '保存画布'],
                    help: ['帮助', '指令', '命令列表', '有哪些命令', '我需要帮助', '帮我一下', '有什么命令', '怎么用', '功能介绍', '指令说明'],
                    dialectMandarin: ['普通话', '切换普通话', '使用普通话', '说普通话', '改成普通话'],
                    dialectCantonese: ['粤语', '广东话', '切换粤语', '使用粤语', '说粤语', '改成粤语'],
                    dialectSichuan: ['四川话', '切换四川话', '使用四川话', '说四川话', '改成四川话'],
                    dialectShanghai: ['上海话', '切换上海话', '使用上海话', '说上海话', '改成上海话'],
                    dialectMinnan: ['闽南语', '闽南话', '切换闽南语', '使用闽南语', '说闽南语', '改成闽南语'],
                    dialectNortheast: ['东北话', '切换东北话', '使用东北话', '说东北话', '改成东北话'],
                    dialectWu: ['吴语', '切换吴语', '使用吴语', '说吴语', '改成吴语'],
                    dialectHakka: ['客家话', '切换客家话', '使用客家话', '说客家话', '改成客家话']
                },
                colors: {
                    '红色': '#FF0000', '红': '#FF0000', '大红色': '#FF0000', '鲜红色': '#FF0000',
                    '绿色': '#00FF00', '绿': '#00FF00', '草绿色': '#00FF00', '翠绿色': '#00FF00',
                    '蓝色': '#0000FF', '蓝': '#0000FF', '天蓝色': '#0000FF', '深蓝色': '#0000FF',
                    '黄色': '#FFFF00', '黄': '#FFFF00', '金黄色': '#FFFF00', '淡黄色': '#FFFF00',
                    '黑色': '#000000', '黑': '#000000', '深黑色': '#000000',
                    '白色': '#FFFFFF', '白': '#FFFFFF', '纯白色': '#FFFFFF',
                    '橙色': '#FFA500', '橙': '#FFA500', '橘色': '#FFA500', '橘黄色': '#FFA500',
                    '紫色': '#800080', '紫': '#800080', '深紫色': '#800080', '紫罗兰': '#800080',
                    '粉色': '#FFC0CB', '粉': '#FFC0CB', '粉红色': '#FFC0CB', '浅粉色': '#FFC0CB',
                    '灰色': '#808080', '灰': '#808080', '深灰色': '#808080', '浅灰色': '#808080',
                    '青色': '#00FFFF', '青': '#00FFFF', '天青色': '#00FFFF', '水青色': '#00FFFF',
                    '棕色': '#A0522D', '棕': '#A0522D', '咖啡色': '#A0522D', '深棕色': '#A0522D',
                    '金色': '#FFD700', '金': '#FFD700', '金黄色': '#FFD700',
                    '银色': '#C0C0C0', '银': '#C0C0C0', '银白色': '#C0C0C0',
                    '靛蓝': '#4B0082', '靛蓝色': '#4B0082',
                    '玫瑰红': '#FF69B4', '玫瑰色': '#FF69B4',
                    '橄榄绿': '#808000', '橄榄色': '#808000',
                    '珊瑚色': '#FF7F50', '珊瑚红': '#FF7F50'
                },
                feedback: {
                    circle: '已绘制圆形',
                    square: '已绘制正方形',
                    rectangle: '已绘制长方形',
                    line: '已绘制直线',
                    triangle: '已绘制三角形',
                    ellipse: '已绘制椭圆',
                    diamond: '已绘制菱形',
                    star: '已绘制五角星',
                    polygon: '已绘制多边形',
                    arc: '已绘制弧线',
                    curve: '已绘制曲线',
                    sin: '已绘制正弦曲线',
                    cos: '已绘制余弦曲线',
                    tan: '已绘制正切曲线',
                    parabola: '已绘制抛物线',
                    exponential: '已绘制指数曲线',
                    log: '已绘制对数曲线',
                    abs: '已绘制绝对值曲线',
                    csc: '已绘制余割曲线',
                    sec: '已绘制正割曲线',
                    cot: '已绘制余切曲线',
                    sinh: '已绘制双曲正弦曲线',
                    cosh: '已绘制双曲余弦曲线',
                    tanh: '已绘制双曲正切曲线',
                    sqrt: '已绘制平方根函数',
                    cube: '已绘制立方函数',
                    reciprocal: '已绘制倒数函数',
                    // 反三角函数
                    asin: '已绘制反正弦曲线',
                    acos: '已绘制反余弦曲线',
                    atan: '已绘制反正切曲线',
                    acsc: '已绘制反余割曲线',
                    asec: '已绘制反正割曲线',
                    acot: '已绘制反余切曲线',
                    // 高次幂函数
                    quartic: '已绘制四次函数',
                    quintic: '已绘制五次函数',
                    sextic: '已绘制六次函数',
                    // 极坐标图形
                    polarRose: '已绘制玫瑰曲线',
                    polarHeart: '已绘制极坐标心形',
                    polarSpiral: '已绘制极坐标螺旋',
                    // 参数方程图形
                    lissajous: '已绘制利萨如图形',
                    parametricCircle: '已绘制参数圆',
                    parametricEllipse: '已绘制参数椭圆',
                    parametricFigure8: '已绘制八字曲线',
                    // 线型
                    lineType: '已切换线型',
                    solidLine: '已切换为实线',
                    dashedLine: '已切换为虚线',
                    dottedLine: '已切换为点线',
                    dashDotLine: '已切换为点划线',
                    // 标注
                    coordinateLabel: '已添加坐标标注',
                    // 多函数叠加
                    functionLayerAdded: '已添加函数图层',
                    functionLayersCleared: '已清除函数图层',
                    grid: '已绘制坐标系',
                    parallelogram: '已绘制平行四边形',
                    ring: '已绘制圆环',
                    ngon: '已绘制多边形',
                    pentagon: '已绘制五边形',
                    hexagon: '已绘制六边形',
                    octagon: '已绘制八边形',
                    brush: '已切换到画笔工具',
                    eraser: '已切换到橡皮擦工具',
                    fill: '已启用填充模式',
                    gradient: '已启用渐变模式',
                    text: '已切换到文字工具',
                    select: '已切换到选择工具',
                    move: '已切换到移动工具',
                    rotate: '已切换到旋转工具',
                    scale: '已切换到缩放工具',
                    undo: '已撤销',
                    redo: '已重做',
                    clear: '画布已清空',
                    save: '图片已保存',
                    color: '已切换到{color}',
                    size: '笔刷粗细已设置为{size}像素',
                    noUndo: '没有可以撤销的操作',
                    noRedo: '没有可以重做的操作',
                    unknown: '抱歉，我没有听懂您的指令',
                    received: '收到指令: {command}'
                },
                tips: [
                    '说"画圆"绘制圆形',
                    '说"画正弦"绘制正弦曲线',
                    '说"画抛物线"绘制抛物线',
                    '说"画坐标系"绘制坐标轴',
                    '说"填充"启用填充模式',
                    '说"红色"切换颜色',
                    '说"撤销"撤销操作',
                    '说"帮助"查看所有指令',
                    '说"sinx"绘制正弦函数',
                    '说"x平方"绘制二次函数',
                    '说"e的x次方"绘制指数函数',
                    '说"画余割"绘制csc函数'
                ]
            },
            cantonese: {
                name: '粤语/广东话',
                langCode: 'zh-HK',
                speechLang: 'zh-HK',
                commands: {
                    drawCircle: ['画圆', '画个圆', '圆形', '圆圈', '画一个圆', '画只圆', '帮我画个圆', '画个圆圈', '我要画圆'],
                    drawSquare: ['画正方形', '正方形', '方块', '画个正方形', '画个方', '画只方', '帮我画正方形', '画个方块', '我要画正方形'],
                    drawRectangle: ['画长方形', '长方形', '矩形', '画个长方形', '画个长方', '帮我画长方形', '画个矩形', '我要画长方形'],
                    drawLine: ['画直线', '直线', '画线', '画条线', '画一条直线', '帮我画条线', '画一条线', '我要画直线'],
                    drawTriangle: ['画三角形', '三角形', '画个三角形', '画只三角', '帮我画三角形', '画个三角', '我要画三角形'],
                    drawEllipse: ['画椭圆', '椭圆形', '椭圆', '帮我画椭圆', '画个椭圆', '我要画椭圆'],
                    drawDiamond: ['画菱形', '菱形', '帮我画菱形', '画个菱形', '我要画菱形'],
                    drawStar: ['画五角星', '五角星', '星星', '星', '帮我画星星', '画个星星', '我要画星星'],
                    drawPolygon: ['画多边形', '多边形', '五边形', '六边形', '帮我画多边形', '画个五边形', '我要画多边形'],
                    drawArc: ['画弧线', '弧线', '圆弧', '帮我画弧线', '画个弧线', '我要画弧线'],
                    drawCurve: ['画曲线', '曲线', '波浪线', '帮我画曲线', '画波浪线', '我要画曲线'],
                    drawSin: ['画正弦', '正弦函数', 'sin', '正弦曲线', '帮我画正弦', '画正弦曲线', '我要画正弦'],
                    drawCos: ['画余弦', '余弦函数', 'cos', '余弦曲线', '帮我画余弦', '画余弦曲线', '我要画余弦'],
                    drawTan: ['画正切', '正切函数', 'tan', '正切曲线', '帮我画正切', '画正切曲线', '我要画正切'],
                    drawParabola: ['画抛物线', '抛物线', '二次函数', '帮我画抛物线', '画抛物线', '我要画抛物线'],
                    drawExponential: ['画指数', '指数函数', '指数曲线', '帮我画指数', '画指数曲线', '我要画指数'],
                    drawLog: ['画对数', '对数函数', '对数曲线', '帮我画对数', '画对数曲线', '我要画对数'],
                    drawAbs: ['画绝对值', '绝对值函数', '帮我画绝对值', '画绝对值', '我要画绝对值'],
                    drawCsc: ['画余割', '余割函数', 'csc', '帮我画余割', '画csc曲线'],
                    drawSec: ['画正割', '正割函数', 'sec', '帮我画正割', '画sec曲线'],
                    drawCot: ['画余切', '余切函数', 'cot', '帮我画余切', '画cot曲线'],
                    drawSinh: ['画双曲正弦', '双曲正弦函数', 'sinh', '帮我画双曲正弦', '画sinh'],
                    drawCosh: ['画双曲余弦', '双曲余弦函数', 'cosh', '帮我画双曲余弦', '画cosh'],
                    drawTanh: ['画双曲正切', '双曲正切函数', 'tanh', '帮我画双曲正切', '画tanh'],
                    drawSqrt: ['画平方根', '根号函数', 'sqrt', '帮我画平方根', '画根号'],
                    drawCube: ['画立方函数', '三次函数', '立方', 'x立方', '帮我画立方', '画三次函数'],
                    drawReciprocal: ['画倒数函数', '倒数曲线', '反比例', '帮我画倒数', '画反比例'],
                    drawGrid: ['画坐标系', '坐标系', '网格', '坐标轴', '帮我画坐标系', '画坐标轴', '我要画坐标系'],
                    drawParallelogram: ['画平行四边形', '平行四边形', '平行', '帮我画平行四边形', '画个平行四边形'],
                    drawRing: ['画圆环', '圆环', '环形', '帮我画圆环', '画个圆环'],
                    drawPentagon: ['画五边形', '五边形', '帮我画五边形', '画个五边形'],
                    drawHexagon: ['画六边形', '六边形', '帮我画六边形', '画个六边形'],
                    drawOctagon: ['画八边形', '八边形', '帮我画八边形', '画个八边形'],
                    brush: ['画笔', '笔刷', '切换画笔', '用画笔', '用笔', '我要用画笔', '转成画笔', '选择画笔'],
                    eraser: ['橡皮', '橡皮擦', '胶擦', '切换橡皮', '用橡皮', '我要用橡皮', '转成橡皮', '用胶擦擦'],
                    fill: ['填充', '填充颜色', '实心', '我要填充', '实心填充', '启用填充'],
                    gradient: ['渐变', '渐变填充', '我要渐变', '渐变填充', '启用渐变'],
                    text: ['文字', '添加文字', '我要写字', '写字', '输入文字'],
                    select: ['选择', '选择工具'],
                    move: ['移动', '移动图形'],
                    rotate: ['旋转', '旋转图形'],
                    scale: ['缩放', '放大', '缩小'],
                    undo: ['撤销', '撤回', '返转头', '返回上一步', '唔要'],
                    redo: ['重做', '再做', '恢复', '返去'],
                    clear: ['清空', '清除', '清晒', '重置画布', '擦晒', '抹晒'],
                    save: ['保存', '保存图片', '存图', '导出图片', '储存'],
                    help: ['帮助', '指令', '命令列表', '有咩命令', '有边些命令']
                },
                colors: {
                    '红色': '#FF0000', '红': '#FF0000',
                    '绿色': '#00FF00', '绿': '#00FF00',
                    '蓝色': '#0000FF', '蓝': '#0000FF',
                    '黄色': '#FFFF00', '黄': '#FFFF00',
                    '黑色': '#000000', '黑': '#000000',
                    '白色': '#FFFFFF', '白': '#FFFFFF',
                    '橙色': '#FFA500', '橙': '#FFA500',
                    '紫色': '#800080', '紫': '#800080',
                    '粉色': '#FFC0CB', '粉': '#FFC0CB',
                    '灰色': '#808080', '灰': '#808080',
                    '青色': '#00FFFF', '青': '#00FFFF',
                    '棕色': '#A0522D', '棕': '#A0522D',
                    '金色': '#FFD700', '金': '#FFD700'
                },
                feedback: {
                    circle: '画好咗个圆',
                    square: '画好咗个正方形',
                    rectangle: '画好咗个长方形',
                    line: '画好咗条线',
                    triangle: '画好咗个三角形',
                    ellipse: '画好咗个椭圆',
                    diamond: '画好咗个菱形',
                    star: '画好咗个五角星',
                    polygon: '画好咗个多边形',
                    arc: '画好咗条弧线',
                    curve: '画好咗条曲线',
                    sin: '画好咗正弦曲线',
                    cos: '画好咗余弦曲线',
                    tan: '画好咗正切曲线',
                    parabola: '画好咗抛物线',
                    exponential: '画好咗指数曲线',
                    log: '画好咗对数曲线',
                    abs: '画好咗绝对值曲线',
                    grid: '画好咗坐标系',
                    brush: '转咗做画笔',
                    eraser: '转咗做橡皮擦',
                    fill: '转咗做填充模式',
                    gradient: '转咗做渐变模式',
                    text: '转咗做文字工具',
                    select: '转咗做选择工具',
                    move: '转咗做移动工具',
                    rotate: '转咗做旋转工具',
                    scale: '转咗做缩放工具',
                    undo: '撤返咗',
                    redo: '重做咗',
                    clear: '清晒画布',
                    save: '存咗图片',
                    color: '转咗做{color}',
                    size: '笔刷粗细设咗做{size}像素',
                    noUndo: '冇得撤返',
                    noRedo: '冇得重做',
                    unknown: '唔明你讲乜',
                    received: '收到指令: {command}'
                },
                tips: [
                    '讲"画圆"画个圆',
                    '讲"画椭圆"画个椭圆',
                    '讲"画五角星"画星星',
                    '讲"填充"转填充模式',
                    '讲"渐变"转渐变模式',
                    '讲"红色"转颜色',
                    '讲"撤销"撤返',
                    '讲"清空"清晒画布'
                ]
            },
            sichuan: {
                name: '四川话',
                langCode: 'zh-CN',
                speechLang: 'zh-CN',
                commands: {
                    drawCircle: ['画圆', '画个圆圈', '圆形', '圆圈', '画一个圆', '画个圆'],
                    drawSquare: ['画正方形', '正方形', '方块', '画个正方形', '画个方块'],
                    drawRectangle: ['画长方形', '长方形', '矩形', '画个长方形'],
                    drawLine: ['画直线', '直线', '画线', '画条线', '画一条直线'],
                    drawTriangle: ['画三角形', '三角形', '画个三角形'],
                    drawSin: ['画正弦', '正弦函数', 'sin', '正弦曲线', '帮我画正弦'],
                    drawCos: ['画余弦', '余弦函数', 'cos', '余弦曲线', '帮我画余弦'],
                    drawTan: ['画正切', '正切函数', 'tan', '正切曲线', '帮我画正切'],
                    drawParabola: ['画抛物线', '抛物线', '二次函数', '帮我画抛物线'],
                    drawExponential: ['画指数', '指数函数', '指数曲线', '帮我画指数'],
                    drawLog: ['画对数', '对数函数', '对数曲线', '帮我画对数'],
                    drawAbs: ['画绝对值', '绝对值函数', '帮我画绝对值'],
                    drawGrid: ['画坐标系', '坐标系', '网格', '坐标轴', '帮我画坐标系'],
                    brush: ['画笔', '笔刷', '切换画笔', '用画笔'],
                    eraser: ['橡皮', '橡皮擦', '切换橡皮', '用橡皮', '擦擦'],
                    undo: ['撤销', '撤回', '返回上一步', '不要这个', '重来'],
                    redo: ['重做', '恢复', '再来一次'],
                    clear: ['清空', '清除', '清干净', '擦干净', '重来画布'],
                    save: ['保存', '保存图片', '存图片', '导出图片'],
                    help: ['帮助', '指令', '命令列表', '有哪些命令', '咋个用']
                },
                colors: {
                    '红色': '#FF0000', '红': '#FF0000',
                    '绿色': '#00FF00', '绿': '#00FF00',
                    '蓝色': '#0000FF', '蓝': '#0000FF',
                    '黄色': '#FFFF00', '黄': '#FFFF00',
                    '黑色': '#000000', '黑': '#000000',
                    '白色': '#FFFFFF', '白': '#FFFFFF',
                    '橙色': '#FFA500', '橙': '#FFA500',
                    '紫色': '#800080', '紫': '#800080',
                    '粉色': '#FFC0CB', '粉': '#FFC0CB',
                    '灰色': '#808080', '灰': '#808080'
                },
                feedback: {
                    circle: '圆圈画好咯',
                    square: '正方形画好咯',
                    rectangle: '长方形画好咯',
                    line: '直线画好咯',
                    triangle: '三角形画好咯',
                    sin: '正弦曲线画好咯',
                    cos: '余弦曲线画好咯',
                    tan: '正切曲线画好咯',
                    parabola: '抛物线画好咯',
                    exponential: '指数曲线画好咯',
                    log: '对数曲线画好咯',
                    abs: '绝对值曲线画好咯',
                    grid: '坐标系画好咯',
                    brush: '换成画笔咯',
                    eraser: '换成橡皮擦咯',
                    undo: '撤销咯',
                    redo: '重做咯',
                    clear: '画布清干净咯',
                    save: '图片存好咯',
                    color: '换成{color}咯',
                    size: '笔刷粗细设成{size}咯',
                    noUndo: '没得撤销咯',
                    noRedo: '没得重做咯',
                    unknown: '没听懂你说啥子',
                    received: '收到指令: {command}'
                },
                tips: [
                    '说"画圆"画个圆圈',
                    '说"画正方形"画个方块',
                    '说"画直线"画条线',
                    '说"红色"换颜色',
                    '说"撤销"撤销',
                    '说"清空"清干净画布'
                ]
            },
            shanghai: {
                name: '上海话',
                langCode: 'zh-CN',
                speechLang: 'zh-CN',
                commands: {
                    drawCircle: ['画圆', '画个圆', '圆形', '圆圈', '画一个圆'],
                    drawSquare: ['画正方形', '正方形', '方块', '画个正方形', '画个方'],
                    drawRectangle: ['画长方形', '长方形', '矩形', '画个长方形'],
                    drawLine: ['画直线', '直线', '画线', '画条线'],
                    drawTriangle: ['画三角形', '三角形', '画个三角形'],
                    drawSin: ['画正弦', '正弦函数', 'sin', '正弦曲线', '帮我画正弦'],
                    drawCos: ['画余弦', '余弦函数', 'cos', '余弦曲线', '帮我画余弦'],
                    drawTan: ['画正切', '正切函数', 'tan', '正切曲线', '帮我画正切'],
                    drawParabola: ['画抛物线', '抛物线', '二次函数', '帮我画抛物线'],
                    drawExponential: ['画指数', '指数函数', '指数曲线', '帮我画指数'],
                    drawLog: ['画对数', '对数函数', '对数曲线', '帮我画对数'],
                    drawAbs: ['画绝对值', '绝对值函数', '帮我画绝对值'],
                    drawGrid: ['画坐标系', '坐标系', '网格', '坐标轴', '帮我画坐标系'],
                    brush: ['画笔', '笔刷', '切换画笔', '用画笔'],
                    eraser: ['橡皮', '橡皮擦', '切换橡皮', '用橡皮'],
                    undo: ['撤销', '撤回', '返回上一步', '不要了'],
                    redo: ['重做', '恢复', '再来'],
                    clear: ['清空', '清除', '清清爽爽', '擦掉'],
                    save: ['保存', '保存图片', '存图片', '导出图片'],
                    help: ['帮助', '指令', '命令列表', '有哪些命令']
                },
                colors: {
                    '红色': '#FF0000', '红': '#FF0000',
                    '绿色': '#00FF00', '绿': '#00FF00',
                    '蓝色': '#0000FF', '蓝': '#0000FF',
                    '黄色': '#FFFF00', '黄': '#FFFF00',
                    '黑色': '#000000', '黑': '#000000',
                    '白色': '#FFFFFF', '白': '#FFFFFF'
                },
                feedback: {
                    circle: '圆画好了',
                    square: '正方形画好了',
                    rectangle: '长方形画好了',
                    line: '直线画好了',
                    triangle: '三角形画好了',
                    sin: '正弦曲线画好了',
                    cos: '余弦曲线画好了',
                    tan: '正切曲线画好了',
                    parabola: '抛物线画好了',
                    exponential: '指数曲线画好了',
                    log: '对数曲线画好了',
                    abs: '绝对值曲线画好了',
                    grid: '坐标系画好了',
                    brush: '换成画笔了',
                    eraser: '换成橡皮擦了',
                    undo: '撤销了',
                    redo: '重做了',
                    clear: '画布清清爽爽了',
                    save: '图片存好了',
                    color: '换成{color}了',
                    size: '笔刷粗细设成{size}了',
                    noUndo: '没有撤销了',
                    noRedo: '没有重做了',
                    unknown: '没听懂侬讲啥',
                    received: '收到指令: {command}'
                },
                tips: [
                    '讲"画圆"画个圆',
                    '讲"画正方形"画个方',
                    '讲"画直线"画条线',
                    '讲"红色"换颜色',
                    '讲"撤销"撤销',
                    '讲"清空"清清爽爽'
                ]
            },
            minnan: {
                name: '闽南语',
                langCode: 'zh-TW',
                speechLang: 'zh-TW',
                commands: {
                    drawCircle: ['画圆', '画圆圈', '圆形', '画一个圆', '画一粒圆'],
                    drawSquare: ['画正方形', '正方形', '方块', '画一个正方形', '画一块方'],
                    drawRectangle: ['画长方形', '长方形', '矩形', '画一个长方形'],
                    drawLine: ['画直线', '直线', '画线', '画一条线'],
                    drawTriangle: ['画三角形', '三角形', '画一个三角形'],
                    brush: ['画笔', '笔刷', '切换画笔', '用画笔'],
                    eraser: ['橡皮', '橡皮擦', '切换橡皮', '用橡皮'],
                    undo: ['撤销', '撤回', '返回上一步', '不要'],
                    redo: ['重做', '恢复', '再来'],
                    clear: ['清空', '清除', '清掉', '擦掉', '洗掉'],
                    save: ['保存', '保存图片', '存图片', '导出图片'],
                    help: ['帮助', '指令', '命令列表', '有什么命令']
                },
                colors: {
                    '红色': '#FF0000', '红': '#FF0000',
                    '绿色': '#00FF00', '绿': '#00FF00',
                    '蓝色': '#0000FF', '蓝': '#0000FF',
                    '黄色': '#FFFF00', '黄': '#FFFF00',
                    '黑色': '#000000', '黑': '#000000',
                    '白色': '#FFFFFF', '白': '#FFFFFF'
                },
                feedback: {
                    circle: '圆画好了',
                    square: '正方形画好了',
                    rectangle: '长方形画好了',
                    line: '直线画好了',
                    triangle: '三角形画好了',
                    brush: '换成画笔了',
                    eraser: '换成橡皮擦了',
                    undo: '撤销了',
                    redo: '重做了',
                    clear: '画布清掉了',
                    save: '图片存好了',
                    color: '换成{color}了',
                    size: '笔刷粗细设成{size}了',
                    noUndo: '没有撤销了',
                    noRedo: '没有重做了',
                    unknown: '听无你讲什么',
                    received: '收到指令: {command}'
                },
                tips: [
                    '讲"画圆"画圆圈',
                    '讲"画正方形"画方块',
                    '讲"画直线"画线',
                    '讲"红色"换颜色',
                    '讲"撤销"撤销',
                    '讲"清空"清掉画布'
                ]
            },
            northeast: {
                name: '东北话',
                langCode: 'zh-CN',
                speechLang: 'zh-CN',
                commands: {
                    drawCircle: ['画圆', '画个圆', '圆形', '圆圈', '画一个圆', '画个大圆'],
                    drawSquare: ['画正方形', '正方形', '方块', '画个正方形', '画个方块'],
                    drawRectangle: ['画长方形', '长方形', '矩形', '画个长方形'],
                    drawLine: ['画直线', '直线', '画线', '画条线', '画一条直线'],
                    drawTriangle: ['画三角形', '三角形', '画个三角形'],
                    brush: ['画笔', '笔刷', '切换画笔', '用画笔'],
                    eraser: ['橡皮', '橡皮擦', '切换橡皮', '用橡皮', '擦子'],
                    undo: ['撤销', '撤回', '返回上一步', '不要了', '重来'],
                    redo: ['重做', '恢复', '再来一次', '整回去'],
                    clear: ['清空', '清除', '清干净', '擦干净', '整干净'],
                    save: ['保存', '保存图片', '存图片', '导出图片'],
                    help: ['帮助', '指令', '命令列表', '有哪些命令', '咋整']
                },
                colors: {
                    '红色': '#FF0000', '红': '#FF0000',
                    '绿色': '#00FF00', '绿': '#00FF00',
                    '蓝色': '#0000FF', '蓝': '#0000FF',
                    '黄色': '#FFFF00', '黄': '#FFFF00',
                    '黑色': '#000000', '黑': '#000000',
                    '白色': '#FFFFFF', '白': '#FFFFFF'
                },
                feedback: {
                    circle: '圆画好了',
                    square: '正方形画好了',
                    rectangle: '长方形画好了',
                    line: '直线画好了',
                    triangle: '三角形画好了',
                    brush: '换成画笔了',
                    eraser: '换成橡皮擦了',
                    undo: '撤销了',
                    redo: '重做了',
                    clear: '画布整干净了',
                    save: '图片存好了',
                    color: '换成{color}了',
                    size: '笔刷粗细设成{size}了',
                    noUndo: '没撤销了',
                    noRedo: '没重做了',
                    unknown: '没听懂你说啥',
                    received: '收到指令: {command}'
                },
                tips: [
                    '说"画圆"画个圆',
                    '说"画正方形"画个方块',
                    '说"画直线"画条线',
                    '说"红色"换颜色',
                    '说"撤销"撤销',
                    '说"清空"整干净画布'
                ]
            },
            wu: {
                name: '吴语',
                langCode: 'zh-CN',
                speechLang: 'zh-CN',
                commands: {
                    drawCircle: ['画圆', '画个圆', '圆形', '圆圈', '画一个圆'],
                    drawSquare: ['画正方形', '正方形', '方块', '画个正方形'],
                    drawRectangle: ['画长方形', '长方形', '矩形', '画个长方形'],
                    drawLine: ['画直线', '直线', '画线', '画条线'],
                    drawTriangle: ['画三角形', '三角形', '画个三角形'],
                    brush: ['画笔', '笔刷', '切换画笔', '用画笔'],
                    eraser: ['橡皮', '橡皮擦', '切换橡皮', '用橡皮'],
                    undo: ['撤销', '撤回', '返回上一步'],
                    redo: ['重做', '恢复', '再来'],
                    clear: ['清空', '清除', '清清爽爽', '擦掉'],
                    save: ['保存', '保存图片', '存图片', '导出图片'],
                    help: ['帮助', '指令', '命令列表', '有哪些命令']
                },
                colors: {
                    '红色': '#FF0000', '红': '#FF0000',
                    '绿色': '#00FF00', '绿': '#00FF00',
                    '蓝色': '#0000FF', '蓝': '#0000FF',
                    '黄色': '#FFFF00', '黄': '#FFFF00',
                    '黑色': '#000000', '黑': '#000000',
                    '白色': '#FFFFFF', '白': '#FFFFFF'
                },
                feedback: {
                    circle: '圆画好了',
                    square: '正方形画好了',
                    rectangle: '长方形画好了',
                    line: '直线画好了',
                    triangle: '三角形画好了',
                    sin: '正弦曲线画好了',
                    cos: '余弦曲线画好了',
                    tan: '正切曲线画好了',
                    parabola: '抛物线画好了',
                    exponential: '指数曲线画好了',
                    log: '对数曲线画好了',
                    abs: '绝对值曲线画好了',
                    grid: '坐标系画好了',
                    brush: '换成画笔了',
                    eraser: '换成橡皮擦了',
                    undo: '撤销了',
                    redo: '重做了',
                    clear: '画布清清爽爽了',
                    save: '图片存好了',
                    color: '换成{color}了',
                    size: '笔刷粗细设成{size}了',
                    noUndo: '没有撤销了',
                    noRedo: '没有重做了',
                    unknown: '没听懂侬讲啥',
                    received: '收到指令: {command}'
                },
                tips: [
                    '讲"画圆"画个圆',
                    '讲"画正方形"画个方块',
                    '讲"画直线"画条线',
                    '讲"红色"换颜色',
                    '讲"撤销"撤销',
                    '讲"清空"清清爽爽'
                ]
            },
            hakka: {
                name: '客家话',
                langCode: 'zh-CN',
                speechLang: 'zh-CN',
                commands: {
                    drawCircle: ['画圆', '画个圆', '圆形', '圆圈', '画一个圆'],
                    drawSquare: ['画正方形', '正方形', '方块', '画个正方形'],
                    drawRectangle: ['画长方形', '长方形', '矩形', '画个长方形'],
                    drawLine: ['画直线', '直线', '画线', '画条线'],
                    drawTriangle: ['画三角形', '三角形', '画个三角形'],
                    brush: ['画笔', '笔刷', '切换画笔', '用画笔'],
                    eraser: ['橡皮', '橡皮擦', '切换橡皮', '用橡皮'],
                    undo: ['撤销', '撤回', '返回上一步', '唔要'],
                    redo: ['重做', '恢复', '再来'],
                    clear: ['清空', '清除', '清掉', '擦掉'],
                    save: ['保存', '保存图片', '存图片', '导出图片'],
                    help: ['帮助', '指令', '命令列表', '有哪些命令']
                },
                colors: {
                    '红色': '#FF0000', '红': '#FF0000',
                    '绿色': '#00FF00', '绿': '#00FF00',
                    '蓝色': '#0000FF', '蓝': '#0000FF',
                    '黄色': '#FFFF00', '黄': '#FFFF00',
                    '黑色': '#000000', '黑': '#000000',
                    '白色': '#FFFFFF', '白': '#FFFFFF'
                },
                feedback: {
                    circle: '圆画好了',
                    square: '正方形画好了',
                    rectangle: '长方形画好了',
                    line: '直线画好了',
                    triangle: '三角形画好了',
                    brush: '换成画笔了',
                    eraser: '换成橡皮擦了',
                    undo: '撤销了',
                    redo: '重做了',
                    clear: '画布清掉了',
                    save: '图片存好了',
                    color: '换成{color}了',
                    size: '笔刷粗细设成{size}了',
                    noUndo: '冇撤销了',
                    noRedo: '冇重做了',
                    unknown: '听唔到你讲什么',
                    received: '收到指令: {command}'
                },
                tips: [
                    '讲"画圆"画个圆',
                    '讲"画正方形"画个方块',
                    '讲"画直线"画条线',
                    '讲"红色"换颜色',
                    '讲"撤销"撤销',
                    '讲"清空"清掉画布'
                ]
            },
            english: {
                name: 'English',
                langCode: 'en-US',
                speechLang: 'en-US',
                commands: {
                    drawCircle: ['draw circle', 'circle', 'draw a circle', 'create circle', 'make a circle', 'circle please'],
                    drawSquare: ['draw square', 'square', 'draw a square', 'create square', 'make square', 'square please'],
                    drawRectangle: ['draw rectangle', 'rectangle', 'draw a rectangle', 'create rectangle', 'make rectangle'],
                    drawLine: ['draw line', 'line', 'draw a line', 'create line', 'make line', 'straight line'],
                    drawTriangle: ['draw triangle', 'triangle', 'draw a triangle', 'create triangle', 'make triangle'],
                    drawEllipse: ['draw ellipse', 'ellipse', 'oval', 'draw oval', 'create ellipse'],
                    drawDiamond: ['draw diamond', 'diamond', 'rhombus', 'create diamond'],
                    drawStar: ['draw star', 'star', 'draw a star', 'create star', 'five pointed star'],
                    drawPolygon: ['draw polygon', 'polygon', 'hexagon', 'pentagon', 'octagon'],
                    drawArc: ['draw arc', 'arc', 'draw an arc', 'create arc'],
                    drawCurve: ['draw curve', 'curve', 'wave', 'draw wave', 'create curve'],
                    drawSin: ['draw sine', 'sine', 'sin', 'sine wave', 'sin curve'],
                    drawCos: ['draw cosine', 'cosine', 'cos', 'cosine wave', 'cos curve'],
                    drawTan: ['draw tangent', 'tangent', 'tan', 'tan curve'],
                    drawParabola: ['draw parabola', 'parabola', 'quadratic', 'y equals x squared'],
                    drawExponential: ['draw exponential', 'exponential', 'e to the x', 'exp'],
                    drawLog: ['draw log', 'logarithm', 'ln', 'natural log', 'log curve'],
                    drawAbs: ['draw absolute', 'absolute', 'abs', 'absolute value'],
                    drawCsc: ['draw cosecant', 'cosecant', 'csc', 'cosecant curve'],
                    drawSec: ['draw secant', 'secant', 'sec', 'secant curve'],
                    drawCot: ['draw cotangent', 'cotangent', 'cot', 'cotangent curve'],
                    drawSinh: ['draw hyperbolic sine', 'sinh', 'hyperbolic sine curve'],
                    drawCosh: ['draw hyperbolic cosine', 'cosh', 'hyperbolic cosine curve'],
                    drawTanh: ['draw hyperbolic tangent', 'tanh', 'hyperbolic tangent curve'],
                    drawSqrt: ['draw square root', 'sqrt', 'square root function', 'root function'],
                    drawCube: ['draw cubic', 'cubic', 'x cubed', 'x to the power of three'],
                    drawReciprocal: ['draw reciprocal', 'reciprocal', '1 over x', 'inverse function'],
                    drawGrid: ['draw grid', 'grid', 'coordinate system', 'axes', 'draw axes'],
                    drawParallelogram: ['draw parallelogram', 'parallelogram', 'draw a parallelogram', 'create parallelogram'],
                    drawRing: ['draw ring', 'ring', 'annulus', 'draw a ring', 'create ring'],
                    drawPentagon: ['draw pentagon', 'pentagon', 'five sided polygon', 'draw a pentagon'],
                    drawHexagon: ['draw hexagon', 'hexagon', 'six sided polygon', 'draw a hexagon'],
                    drawOctagon: ['draw octagon', 'octagon', 'eight sided polygon', 'draw an octagon'],
                    brush: ['brush', 'use brush', 'select brush', 'switch to brush', 'pen tool'],
                    eraser: ['eraser', 'use eraser', 'select eraser', 'switch to eraser', 'rubber'],
                    fill: ['fill', 'fill mode', 'solid', 'solid fill', 'enable fill'],
                    gradient: ['gradient', 'gradient fill', 'gradient mode', 'enable gradient'],
                    text: ['text', 'add text', 'text tool', 'type text'],
                    select: ['select', 'select tool', 'selection'],
                    move: ['move', 'move tool', 'move selection'],
                    rotate: ['rotate', 'rotate tool', 'rotate selection'],
                    scale: ['scale', 'scale tool', 'resize', 'enlarge', 'shrink'],
                    undo: ['undo', 'undo that', 'go back', 'undo last', 'cancel'],
                    redo: ['redo', 'redo that', 'go forward', 'redo last'],
                    clear: ['clear', 'clear canvas', 'erase all', 'reset', 'clean'],
                    save: ['save', 'save image', 'save canvas', 'export', 'download'],
                    help: ['help', 'commands', 'show commands', 'list commands', 'what can I do'],
                    dialectEnglish: ['english', 'switch to english', 'use english', 'speak english'],
                    dialectMandarin: ['mandarin', 'chinese', 'switch to chinese', 'use chinese']
                },
                colors: {
                    'red': '#FF0000', 'crimson': '#FF0000', 'scarlet': '#FF0000',
                    'green': '#00FF00', 'lime': '#00FF00', 'emerald': '#00FF00',
                    'blue': '#0000FF', 'navy': '#0000FF', 'azure': '#0000FF',
                    'yellow': '#FFFF00', 'gold': '#FFFF00', 'amber': '#FFFF00',
                    'black': '#000000', 'dark': '#000000', 'blackness': '#000000',
                    'white': '#FFFFFF', 'bright': '#FFFFFF', 'whiteness': '#FFFFFF',
                    'orange': '#FFA500', 'tangerine': '#FFA500', 'apricot': '#FFA500',
                    'purple': '#800080', 'violet': '#800080', 'lavender': '#800080',
                    'pink': '#FFC0CB', 'rose': '#FFC0CB', 'blush': '#FFC0CB',
                    'gray': '#808080', 'grey': '#808080', 'silver': '#808080',
                    'cyan': '#00FFFF', 'teal': '#00FFFF', 'turquoise': '#00FFFF',
                    'brown': '#A0522D', 'tan': '#A0522D', 'coffee': '#A0522D',
                    'golden': '#FFD700', 'silver': '#C0C0C0', 'indigo': '#4B0082',
                    'coral': '#FF7F50', 'olive': '#808000', 'maroon': '#800000'
                },
                feedback: {
                    circle: 'Circle drawn',
                    square: 'Square drawn',
                    rectangle: 'Rectangle drawn',
                    line: 'Line drawn',
                    triangle: 'Triangle drawn',
                    ellipse: 'Ellipse drawn',
                    diamond: 'Diamond drawn',
                    star: 'Star drawn',
                    polygon: 'Polygon drawn',
                    arc: 'Arc drawn',
                    curve: 'Curve drawn',
                    sin: 'Sine curve drawn',
                    cos: 'Cosine curve drawn',
                    tan: 'Tangent curve drawn',
                    parabola: 'Parabola drawn',
                    exponential: 'Exponential curve drawn',
                    log: 'Logarithm curve drawn',
                    abs: 'Absolute value drawn',
                    grid: 'Grid drawn',
                    brush: 'Brush tool selected',
                    eraser: 'Eraser tool selected',
                    fill: 'Fill mode enabled',
                    gradient: 'Gradient mode enabled',
                    text: 'Text tool selected',
                    select: 'Select tool selected',
                    move: 'Move tool selected',
                    rotate: 'Rotate tool selected',
                    scale: 'Scale tool selected',
                    undo: 'Undone',
                    redo: 'Redone',
                    clear: 'Canvas cleared',
                    save: 'Image saved',
                    color: 'Color changed to {color}',
                    size: 'Brush size set to {size} pixels',
                    noUndo: 'Nothing to undo',
                    noRedo: 'Nothing to redo',
                    unknown: 'Sorry, I did not understand',
                    received: 'Command received: {command}'
                },
                tips: [
                    'Say "draw circle" to draw a circle',
                    'Say "draw sine" for sine curve',
                    'Say "draw parabola" for parabola',
                    'Say "draw grid" for coordinate axes',
                    'Say "red" to change color',
                    'Say "undo" to undo',
                    'Say "save" to save image',
                    'Say "help" for commands'
                ]
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupVoiceRecognition();
        this.setupEventListeners();
        this.updateDialectUI();
        this.updateWakeWordButton();
        this.saveState();
    }
    
    setupCanvas() {
        const container = this.canvas.parentElement;
        this.resizeCanvas(container.clientWidth, container.clientHeight);
        
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.currentSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.offscreenCtx.strokeStyle = this.currentColor;
        this.offscreenCtx.lineWidth = this.currentSize;
        this.offscreenCtx.lineCap = 'round';
        this.offscreenCtx.lineJoin = 'round';
        
        window.addEventListener('resize', () => {
            const imageData = this.offscreenCtx.getImageData(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
            this.resizeCanvas(container.clientWidth, container.clientHeight);
            this.offscreenCtx.putImageData(imageData, 0, 0);
            this.copyOffscreenToMain();
        });
    }
    
    resizeCanvas(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.offscreenCanvas.width = width;
        this.offscreenCanvas.height = height;
    }
    
    buildPinyinMap() {
        return {
            'yuan': ['圆', '元', '原', '员', '园', '源', '缘'],
            'fang': ['方', '放', '房', '防', '芳'],
            'zheng': ['正', '整', '证', '征', '症'],
            'chang': ['长', '常', '场', '尝', '偿'],
            'zhi': ['直', '只', '支', '知', '至', '志'],
            'san': ['三', '山', '散', '伞', '参'],
            'jiao': ['角', '交', '教', '较', '觉'],
            'tu': ['图', '途', '土', '兔', '突'],
            'jian': ['箭', '建', '件', '健', '见'],
            'qu': ['曲', '区', '取', '去', '趣'],
            'xian': ['线', '现', '限', '鲜', '先'],
            'xing': ['形', '行', '星', '兴', '性'],
            'hong': ['红', '虹', '洪', '宏', '鸿'],
            'lu': ['绿', '路', '陆', '录', '露'],
            'lan': ['蓝', '兰', '篮', '拦', '栏'],
            'huang': ['黄', '皇', '慌', '荒', '簧'],
            'hei': ['黑', '嘿', '海', '害', '嗨'],
            'bai': ['白', '百', '摆', '拜', '柏'],
            'fen': ['分', '份', '粉', '奋', '粪'],
            'jian': ['渐', '间', '件', '减', '建'],
            'hui': ['回', '会', '绘', '悔', '毁'],
            'che': ['撤', '车', '彻', '扯', '澈'],
            'qing': ['清', '青', '轻', '晴', '氢'],
            'bao': ['保', '报', '抱', '暴', '宝'],
            'cun': ['存', '寸', '村', '错', '促'],
            'zhu': ['助', '住', '注', '主', '柱'],
            'bang': ['帮', '绑', '棒', '磅', '傍'],
            'hua': ['画', '话', '化', '华', '划'],
            'shu': ['数', '树', '术', '述', '束'],
            'zu': ['组', '族', '租', '足', '阻'],
            'xi': ['系', '细', '洗', '戏', '息'],
            'yu': ['余', '与', '于', '鱼', '语'],
            'bian': ['边', '变', '便', '编', '遍'],
            'bei': ['贝', '被', '杯', '悲', '备'],
            'ai': ['爱', '哎', '哀', '埃', '碍'],
            'xin': ['心', '新', '信', '辛', '欣'],
            'yu': ['圆', '鱼', '语', '雨', '玉'],
            'xiang': ['相', '香', '向', '想', '象'],
            'tong': ['同', '通', '童', '铜', '桶'],
            'luo': ['螺', '罗', '洛', '落', '骆'],
            'xuan': ['旋', '选', '宣', '玄', '悬'],
            'shan': ['扇', '山', '闪', '善', '衫'],
            'duan': ['断', '段', '端', '短', '锻'],
            'kou': ['口', '扣', '寇', '枯', '哭'],
            'shi': ['事', '是', '时', '实', '式'],
            'mo': ['模', '莫', '墨', '磨', '末'],
            'jing': ['精', '经', '净', '境', '镜'],
            'wang': ['网', '忘', '望', '旺', '往'],
            'ce': ['测', '册', '侧', '策', '厕'],
            'ceng': ['层', '曾', '蹭', '层', '橙'],
            'tian': ['添', '天', '田', '甜', '填'],
            'tuo': ['脱', '拖', '托', '妥', '拓'],
            'she': ['设', '社', '舍', '射', '涉'],
            'zhi': ['制', '治', '质', '智', '致'],
            'da': ['大', '打', '达', '答', '搭'],
            'xiao': ['小', '笑', '消', '效', '校'],
            'da': ['加', '家', '嘉', '佳', '假'],
            'jian': ['减', '简', '检', '剪', '碱'],
            'gou': ['勾', '沟', '狗', '够', '购'],
            'hua': ['画', '化', '话', '华', '划'],
            'tu': ['图', '涂', '土', '突', '吐'],
            'zhen': ['真', '珍', '针', '诊', '震'],
            'yan': ['研', '言', '严', '延', '盐'],
            'ji': ['积', '机', '基', '极', '急'],
            'shu': ['输', '书', '舒', '蔬', '疏'],
            'dui': ['对', '队', '堆', '兑', '敦'],
            'duo': ['多', '朵', '躲', '夺', '惰'],
            'shao': ['少', '烧', '勺', '哨', '梢'],
            'liang': ['量', '亮', '凉', '良', '梁'],
            'fang': ['放', '方', '房', '防', '芳'],
            'da': ['大', '打', '达', '答', '搭']
        };
    }
    
    convertPinyinToCharacter(pinyin) {
        const normalized = pinyin.toLowerCase().trim();
        return this.pinyinMap[normalized] || [];
    }
    
    getPinyinSimilarity(str1, str2) {
        const pinyin1 = this.getCharacterPinyin(str1);
        const pinyin2 = this.getCharacterPinyin(str2);
        
        if (!pinyin1 || !pinyin2) {
            return this.calculateSimilarity(str1, str2);
        }
        
        return this.calculateSimilarity(pinyin1, pinyin2);
    }
    
    getCharacterPinyin(char) {
        const pinyinTable = {
            '画': 'hua', '圆': 'yuan', '方': 'fang', '正': 'zheng',
            '长': 'chang', '直': 'zhi', '三': 'san', '角': 'jiao',
            '图': 'tu', '箭': 'jian', '曲': 'qu', '线': 'xian',
            '形': 'xing', '红': 'hong', '绿': 'lu', '蓝': 'lan',
            '黄': 'huang', '黑': 'hei', '白': 'bai', '粉': 'fen',
            '渐': 'jian', '回': 'hui', '撤': 'che', '清': 'qing',
            '保': 'bao', '存': 'cun', '助': 'zhu', '帮': 'bang',
            '数': 'shu', '组': 'zu', '系': 'xi', '余': 'yu',
            '边': 'bian', '贝': 'bei', '爱': 'ai', '心': 'xin',
            '相': 'xiang', '同': 'tong', '螺': 'luo', '旋': 'xuan',
            '扇': 'shan', '断': 'duan', '口': 'kou', '事': 'shi',
            '模': 'mo', '精': 'jing', '网': 'wang', '测': 'ce',
            '层': 'ceng', '添': 'tian', '脱': 'tuo', '设': 'she',
            '制': 'zhi', '大': 'da', '小': 'xiao', '加': 'jia',
            '减': 'jian', '勾': 'gou', '真': 'zhen', '研': 'yan',
            '积': 'ji', '输': 'shu', '对': 'dui', '多': 'duo',
            '少': 'shao', '量': 'liang', '放': 'fang', '上': 'shang',
            '下': 'xia', '左': 'zuo', '右': 'you', '中': 'zhong',
            '前': 'qian', '后': 'hou', '高': 'gao', '低': 'di',
            '宽': 'kuan', '窄': 'zhai', '厚': 'hou', '薄': 'bao',
            '快': 'kuai', '慢': 'man', '好': 'hao', '坏': 'huai',
            '新': 'xin', '旧': 'jiu', '有': 'you', '无': 'wu',
            '来': 'lai', '去': 'qu', '进': 'jin', '出': 'chu',
            '开': 'kai', '关': 'guan', '起': 'qi', '停': 'ting',
            '动': 'dong', '静': 'jing', '转': 'zhuan', '停': 'ting',
            '升': 'sheng', '降': 'jiang', '生': 'sheng', '死': 'si',
            '学': 'xue', '教': 'jiao', '工': 'gong', '作': 'zuo',
            '人': 'ren', '物': 'wu', '时': 'shi', '空': 'kong',
            '音': 'yin', '色': 'se', '光': 'guang', '影': 'ying',
            '水': 'shui', '火': 'huo', '土': 'tu', '风': 'feng',
            '雨': 'yu', '雪': 'xue', '雷': 'lei', '电': 'dian',
            '山': 'shan', '海': 'hai', '江': 'jiang', '河': 'he',
            '花': 'hua', '草': 'cao', '树': 'shu', '木': 'mu',
            '鸟': 'niao', '鱼': 'yu', '虫': 'chong', '兽': 'shou',
            '日': 'ri', '月': 'yue', '星': 'xing', '云': 'yun',
            '金': 'jin', '银': 'yin', '铜': 'tong', '铁': 'tie',
            '石': 'shi', '土': 'tu', '沙': 'sha', '泥': 'ni',
            '纸': 'zhi', '笔': 'bi', '墨': 'mo', '砚': 'yan',
            '书': 'shu', '画': 'hua', '诗': 'shi', '歌': 'ge',
            '舞': 'wu', '戏': 'xi', '乐': 'le', '舞': 'wu',
            '吃': 'chi', '喝': 'he', '玩': 'wan', '睡': 'shui',
            '走': 'zou', '跑': 'pao', '跳': 'tiao', '飞': 'fei',
            '看': 'kan', '听': 'ting', '说': 'shuo', '写': 'xie',
            '想': 'xiang', '做': 'zuo', '爱': 'ai', '恨': 'hen',
            '喜': 'xi', '怒': 'nu', '哀': 'ai', '乐': 'le',
            '方': 'fang', '法': 'fa', '技': 'ji', '术': 'shu',
            '工': 'gong', '具': 'ju', '机': 'ji', '器': 'qi',
            '电': 'dian', '脑': 'nao', '手': 'shou', '机': 'ji',
            '网': 'wang', '络': 'luo', '软': 'ruan', '件': 'jian',
            '硬': 'ying', '件': 'jian', '系': 'xi', '统': 'tong',
            '程': 'cheng', '序': 'xu', '编': 'bian', '译': 'yi',
            '语': 'yu', '言': 'yan', '开': 'kai', '发': 'fa',
            '设': 'she', '计': 'ji', '测': 'ce', '试': 'shi',
            '维': 'wei', '护': 'hu', '升': 'sheng', '级': 'ji',
            '更': 'geng', '新': 'xin', '修': 'xiu', '改': 'gai',
            '删': 'shan', '除': 'chu', '添': 'tian', '加': 'jia',
            '查': 'cha', '找': 'zhao', '搜': 'sou', '索': 'suo',
            '复': 'fu', '制': 'zhi', '粘': 'zhan', '贴': 'tie',
            '剪': 'jian', '切': 'qie', '复': 'fu', '原': 'yuan',
            '撤': 'che', '销': 'xiao', '重': 'chong', '做': 'zuo',
            '保': 'bao', '存': 'cun', '导': 'dao', '入': 'ru',
            '导': 'dao', '出': 'chu', '打': 'da', '印': 'yin',
            '发': 'fa', '送': 'song', '接': 'jie', '收': 'shou',
            '回': 'hui', '复': 'fu', '转': 'zhuan', '发': 'fa',
            '删': 'shan', '除': 'chu', '移': 'yi', '动': 'dong',
            '复': 'fu', '制': 'zhi', '删': 'shan', '除': 'chu',
            '隐': 'yin', '藏': 'cang', '显': 'xian', '示': 'shi',
            '关': 'guan', '闭': 'bi', '打': 'da', '开': 'kai',
            '创': 'chuang', '建': 'jian', '删': 'shan', '除': 'chu',
            '编': 'bian', '辑': 'ji', '修': 'xiu', '改': 'gai',
            '查': 'cha', '看': 'kan', '浏': 'liu', '览': 'lan',
            '搜': 'sou', '索': 'suo', '过': 'guo', '滤': 'lv',
            '排': 'pai', '序': 'xu', '分': 'fen', '类': 'lei',
            '标': 'biao', '记': 'ji', '评': 'ping', '论': 'lun',
            '赞': 'zan', '踩': 'cai', '收': 'shou', '藏': 'cang',
            '分': 'fen', '享': 'xiang', '转': 'zhuan', '发': 'fa',
            '订': 'ding', '阅': 'yue', '关': 'guan', '注': 'zhu',
            '取': 'qu', '消': 'xiao', '加': 'jia', '入': 'ru',
            '退': 'tui', '出': 'chu', '登': 'deng', '录': 'lu',
            '注': 'zhu', '册': 'ce', '忘': 'wang', '记': 'ji',
            '找': 'zhao', '回': 'hui', '绑': 'bang', '定': 'ding',
            '解': 'jie', '绑': 'bang', '设': 'she', '置': 'zhi',
            '修': 'xiu', '改': 'gai', '更': 'geng', '换': 'huan',
            '升': 'sheng', '级': 'ji', '降': 'jiang', '级': 'ji',
            '奖': 'jiang', '励': 'li', '惩': 'cheng', '罚': 'fa',
            '表': 'biao', '扬': 'yang', '批': 'pi', '评': 'ping',
            '建': 'jian', '议': 'yi', '投': 'tou', '诉': 'su',
            '反': 'fan', '馈': 'kui', '举': 'ju', '报': 'bao',
            '帮': 'bang', '助': 'zhu', '指': 'zhi', '导': 'dao',
            '教': 'jiao', '学': 'xue', '培': 'pei', '训': 'xun',
            '考': 'kao', '试': 'shi', '作': 'zuo', '业': 'ye',
            '课': 'ke', '程': 'cheng', '学': 'xue', '期': 'qi',
            '学': 'xue', '分': 'fen', '毕': 'bi', '业': 'ye',
            '论': 'lun', '文': 'wen', '答': 'da', '辩': 'bian',
            '录': 'lu', '取': 'qu', '注': 'zhu', '销': 'xiao',
            '休': 'xiu', '学': 'xue', '退': 'tui', '学': 'xue',
            '转': 'zhuan', '专': 'zhuan', '升': 'sheng', '学': 'xue',
            '奖': 'jiang', '学': 'xue', '金': 'jin', '助': 'zhu',
            '学': 'xue', '贷': 'dai', '勤': 'qin', '工': 'gong',
            '俭': 'jian', '学': 'xue', '实': 'shi', '习': 'xi',
            '实': 'shi', '践': 'jian', '社': 'she', '会': 'hui',
            '实': 'shi', '习': 'xi', '研': 'yan', '究': 'jiu',
            '生': 'sheng', '导': 'dao', '师': 'shi', '课': 'ke',
            '题': 'ti', '组': 'zu', '项': 'xiang', '目': 'mu',
            '课': 'ke', '题': 'ti', '经': 'jing', '费': 'fei',
            '设': 'she', '备': 'bei', '仪': 'yi', '器': 'qi',
            '实': 'shi', '验': 'yan', '室': 'shi', '图': 'tu',
            '书': 'shu', '馆': 'guan', '办': 'ban', '公': 'gong',
            '室': 'shi', '宿': 'su', '舍': 'she', '食': 'shi',
            '堂': 'tang', '校': 'xiao', '园': 'yuan', '门': 'men',
            '卫': 'wei', '保': 'bao', '安': 'an', '消': 'xiao',
            '防': 'fang', '医': 'yi', '务': 'wu', '室': 'shi',
            '心': 'xin', '理': 'li', '中': 'zhong', '心': 'xin',
            '就': 'jiu', '业': 'ye', '指': 'zhi', '导': 'dao',
            '中': 'zhong', '心': 'xin', '团': 'tuan', '委': 'wei',
            '学': 'xue', '生': 'sheng', '会': 'hui', '社': 'she',
            '团': 'tuan', '活': 'huo', '动': 'dong', '晚': 'wan',
            '会': 'hui', '运': 'yun', '动': 'dong', '会': 'hui',
            '文': 'wen', '艺': 'yi', '节': 'jie', '开': 'kai',
            '学': 'xue', '典': 'dian', '礼': 'li', '毕': 'bi',
            '业': 'ye', '典': 'dian', '礼': 'li', '招': 'zhao',
            '生': 'sheng', '就': 'jiu', '业': 'ye', '就': 'jiu',
            '职': 'zhi', '创': 'chuang', '业': 'ye', '离': 'li',
            '校': 'xiao', '联': 'lian', '谊': 'yi', '会': 'hui'
        };
        
        let result = '';
        for (let i = 0; i < char.length; i++) {
            const c = char[i];
            result += pinyinTable[c] || c;
            if (i < char.length - 1) {
                result += ' ';
            }
        }
        return result;
    }
    
    findBestMatchByPinyin(command, commands, commandMap) {
        let bestMatch = null;
        let bestScore = 0;
        
        for (const [cmdKey, cmdValues] of Object.entries(commands)) {
            if (!Array.isArray(cmdValues) || !commandMap[cmdKey]) continue;
            
            for (const cmd of cmdValues) {
                const pinyinScore = this.getPinyinSimilarity(command, cmd);
                const charScore = this.calculateSimilarity(command, cmd);
                const combinedScore = (pinyinScore * 0.6 + charScore * 0.4);
                
                if (combinedScore > bestScore) {
                    bestScore = combinedScore;
                    bestMatch = cmdKey;
                }
            }
        }
        
        if (bestScore >= 0.5) {
            return bestMatch;
        }
        
        return null;
    }
    
    initLayers() {
        this.layers = [{
            name: '背景层',
            visible: true,
            data: null
        }];
        this.currentLayerIndex = 0;
    }
    
    addLayer(name) {
        if (this.layers.length >= this.maxLayers) {
            this.addChatMessage('已达到最大图层数量限制', 'system');
            return false;
        }
        
        this.layers.push({
            name: name || `图层${this.layers.length}`,
            visible: true,
            data: null
        });
        this.currentLayerIndex = this.layers.length - 1;
        this.addChatMessage(`已添加新图层: ${name || `图层${this.layers.length}`}`, 'system');
        return true;
    }
    
    switchLayer(index) {
        if (index >= 0 && index < this.layers.length) {
            this.currentLayerIndex = index;
            this.addChatMessage(`已切换到图层: ${this.layers[index].name}`, 'system');
        }
    }
    
    deleteLayer(index) {
        if (index > 0 && index < this.layers.length) {
            const layerName = this.layers[index].name;
            this.layers.splice(index, 1);
            if (this.currentLayerIndex >= this.layers.length) {
                this.currentLayerIndex = this.layers.length - 1;
            }
            this.addChatMessage(`已删除图层: ${layerName}`, 'system');
        }
    }
    
    setPrecisionMode(enabled) {
        this.precisionMode = enabled;
        this.addChatMessage(enabled ? '已启用精确模式，图形将按指定尺寸绘制' : '已关闭精确模式', 'system');
    }
    
    setShapeSize(size) {
        this.currentShapeSize = Math.max(10, Math.min(500, size));
        this.addChatMessage(`图形尺寸设置为: ${this.currentShapeSize}px`, 'system');
    }
    
    setShapePosition(x, y) {
        this.currentShapePosition = {
            x: Math.max(0, Math.min(1, x)),
            y: Math.max(0, Math.min(1, y))
        };
        this.addChatMessage(`图形位置设置为: (${Math.round(x * 100)}%, ${Math.round(y * 100)}%)`, 'system');
    }
    
    showGrid() {
        this.gridVisible = true;
        this.drawReferenceGrid();
        this.addChatMessage('已显示参考网格', 'system');
    }
    
    hideGrid() {
        this.gridVisible = false;
        this.addChatMessage('已隐藏参考网格', 'system');
    }
    
    drawReferenceGrid() {
        if (!this.gridVisible) return;
        
        const ctx = this.offscreenCtx;
        ctx.save();
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
        ctx.lineWidth = 1;
        
        for (let x = 0; x < this.canvas.width; x += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height; y += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
        
        ctx.restore();
        this.copyOffscreenToMain();
    }
    
    drawBezierCurve() {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const centerX = this.canvas.width * this.currentShapePosition.x;
        const centerY = this.canvas.height * this.currentShapePosition.y;
        const size = this.currentShapeSize;
        
        ctx.beginPath();
        ctx.moveTo(centerX - size, centerY);
        ctx.bezierCurveTo(
            centerX - size / 2, centerY - size,
            centerX + size / 2, centerY + size,
            centerX + size, centerY
        );
        
        ctx.stroke();
        this.copyOffscreenToMain();
        
        this.addChatMessage('已绘制贝塞尔曲线', 'system');
    }
    
    drawArrow() {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const startX = this.canvas.width * 0.2;
        const startY = this.canvas.height * 0.5;
        const endX = this.canvas.width * 0.8;
        const endY = this.canvas.height * 0.5;
        const arrowSize = 20;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        const angle = Math.atan2(endY - startY, endX - startX);
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowSize * Math.cos(angle - Math.PI / 6),
            endY - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowSize * Math.cos(angle + Math.PI / 6),
            endY - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
        
        this.copyOffscreenToMain();
        this.addChatMessage('已绘制箭头', 'system');
    }
    
    drawDashedLine() {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        ctx.setLineDash([10, 5]);
        
        ctx.beginPath();
        ctx.moveTo(this.canvas.width * 0.2, this.canvas.height * 0.5);
        ctx.lineTo(this.canvas.width * 0.8, this.canvas.height * 0.5);
        ctx.stroke();
        
        ctx.setLineDash([]);
        this.copyOffscreenToMain();
        
        this.addChatMessage('已绘制虚线', 'system');
    }
    
    drawSector(startAngle, endAngle) {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const centerX = this.canvas.width * this.currentShapePosition.x;
        const centerY = this.canvas.height * this.currentShapePosition.y;
        const radius = this.currentShapeSize;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle * Math.PI / 180, endAngle * Math.PI / 180);
        ctx.closePath();
        
        this.drawShape();
        this.addChatMessage(`已绘制扇形 (${startAngle}°-${endAngle}°)`, 'system');
    }
    
    drawHeart() {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const centerX = this.canvas.width * this.currentShapePosition.x;
        const centerY = this.canvas.height * this.currentShapePosition.y;
        const size = this.currentShapeSize;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + size / 4);
        ctx.bezierCurveTo(
            centerX - size / 2, centerY - size / 2,
            centerX - size, centerY + size / 4,
            centerX, centerY + size
        );
        ctx.bezierCurveTo(
            centerX + size, centerY + size / 4,
            centerX + size / 2, centerY - size / 2,
            centerX, centerY + size / 4
        );
        
        this.drawShape();
        this.addChatMessage('已绘制心形', 'system');
    }
    
    drawParallelogram() {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const centerX = this.canvas.width * this.currentShapePosition.x;
        const centerY = this.canvas.height * this.currentShapePosition.y;
        const width = this.currentShapeSize * 2;
        const height = this.currentShapeSize;
        const skew = width * 0.3;  // 倾斜偏移
        
        ctx.beginPath();
        ctx.moveTo(centerX - width / 2 + skew, centerY - height / 2);
        ctx.lineTo(centerX + width / 2 + skew, centerY - height / 2);
        ctx.lineTo(centerX + width / 2 - skew, centerY + height / 2);
        ctx.lineTo(centerX - width / 2 - skew, centerY + height / 2);
        ctx.closePath();
        
        this.drawShape();
        this.speak(this.getFeedback('parallelogram'));
    }
    
    drawRing() {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const centerX = this.canvas.width * this.currentShapePosition.x;
        const centerY = this.canvas.height * this.currentShapePosition.y;
        const outerRadius = this.currentShapeSize;
        const innerRadius = this.currentShapeSize * 0.5;
        
        // 绘制外圆
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
        ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2, true);  // 反向绘制内圆形成环形
        ctx.closePath();
        
        this.drawShape();
        this.speak(this.getFeedback('ring'));
    }
    
    drawNGon(n) {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const centerX = this.canvas.width * this.currentShapePosition.x;
        const centerY = this.canvas.height * this.currentShapePosition.y;
        const radius = this.currentShapeSize;
        const sides = n || 6;  // 默认六边形
        
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI / sides) - Math.PI / 2;  // 从顶部开始
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        
        this.drawShape();
        this.speak(this.getFeedback('ngon'));
    }
    
    drawPentagon() {
        this.drawNGon(5);
    }
    
    drawHexagon() {
        this.drawNGon(6);
    }
    
    drawOctagon() {
        this.drawNGon(8);
    }
    
    // 极坐标图形
    drawPolarRose(n = 4, d = 1) {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const params = this.getMathCoordinateParams();
        const { centerX, centerY, scaleX } = params;
        const radius = Math.min(scaleX * 3, this.canvas.width / 4);
        
        ctx.beginPath();
        ctx.strokeStyle = this.currentColor;
        ctx.lineWidth = this.currentSize;
        
        const k = n / d;
        const steps = 1000;
        
        for (let i = 0; i <= steps; i++) {
            const theta = (i / steps) * Math.PI * 2 * d;
            const r = radius * Math.cos(k * theta);
            
            if (r < 0) continue;  // 只绘制正值
            
            const { px, py } = this.polarToCanvas(r / scaleX, theta, params);
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        
        ctx.stroke();
        this.copyOffscreenToMain();
        this.speak(this.getFeedback('polarRose'));
    }
    
    drawPolarHeart() {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const params = this.getMathCoordinateParams();
        const { centerX, centerY, scaleX } = params;
        const radius = Math.min(scaleX * 2, this.canvas.width / 4);
        
        ctx.beginPath();
        ctx.strokeStyle = this.currentColor;
        ctx.lineWidth = this.currentSize;
        
        const steps = 500;
        
        for (let i = 0; i <= steps; i++) {
            const theta = (i / steps) * Math.PI * 2;
            const r = radius * (1 - Math.sin(theta));
            
            const { px, py } = this.polarToCanvas(r / scaleX, theta, params);
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        
        ctx.stroke();
        this.copyOffscreenToMain();
        this.speak(this.getFeedback('polarHeart'));
    }
    
    drawPolarSpiral(a = 1, b = 0.1) {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const params = this.getMathCoordinateParams();
        const { centerX, centerY, scaleX } = params;
        
        ctx.beginPath();
        ctx.strokeStyle = this.currentColor;
        ctx.lineWidth = this.currentSize;
        
        const steps = 500;
        const maxTheta = 6 * Math.PI;
        
        for (let i = 0; i <= steps; i++) {
            const theta = (i / steps) * maxTheta;
            const r = (a + b * theta) * scaleX / 10;
            
            const { px, py } = this.polarToCanvas(r / scaleX, theta, params);
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        
        ctx.stroke();
        this.copyOffscreenToMain();
        this.speak(this.getFeedback('polarSpiral'));
    }
    
    // 参数方程图形
    drawLissajous(a = 3, b = 2, delta = Math.PI / 2) {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const params = this.getMathCoordinateParams();
        const { centerX, centerY, scaleX, scaleY } = params;
        const amplitude = Math.min(scaleX * 2, this.canvas.width / 4);
        
        ctx.beginPath();
        ctx.strokeStyle = this.currentColor;
        ctx.lineWidth = this.currentSize;
        
        const steps = 500;
        
        for (let i = 0; i <= steps; i++) {
            const t = (i / steps) * Math.PI * 2;
            const x = amplitude * Math.sin(a * t + delta);
            const y = amplitude * Math.sin(b * t);
            
            const { px, py } = this.mathToCanvas(x / scaleX, y / scaleY, params);
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        
        ctx.stroke();
        this.copyOffscreenToMain();
        this.speak(this.getFeedback('lissajous'));
    }
    
    drawParametricCircle() {
        this.drawLissajous(1, 1, 0);
    }
    
    drawParametricEllipse() {
        this.drawLissajous(2, 1, 0);
    }
    
    drawParametricFigure8() {
        this.drawLissajous(1, 2, 0);
    }
    
    // 线型切换
    setLineType(type) {
        this.lineType = type;
        this.speak(this.getFeedback('lineType'));
    }
    
    applyLineType(ctx) {
        switch (this.lineType) {
            case 'dashed':
                ctx.setLineDash([10, 5]);
                break;
            case 'dotted':
                ctx.setLineDash([2, 3]);
                break;
            case 'dashdot':
                ctx.setLineDash([10, 5, 2, 5]);
                break;
            case 'solid':
                ctx.setLineDash([]);
                break;
            default:
                ctx.setLineDash([]);
        }
    }
    
    // 标注功能
    drawAnnotation(text, x, y) {
        const ctx = this.offscreenCtx;
        const params = this.getMathCoordinateParams();
        const { px, py } = this.mathToCanvas(x, y, params);
        
        ctx.font = '14px Arial';
        ctx.fillStyle = this.currentColor;
        ctx.fillText(text, px + 5, py - 5);
        
        this.copyOffscreenToMain();
    }
    
    drawCoordinateLabel() {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const params = this.getMathCoordinateParams();
        const { centerX, centerY, scaleX, scaleY, width, height } = params;
        
        ctx.font = '12px Arial';
        ctx.fillStyle = '#666666';
        
        // X轴标注
        for (let x = -5; x <= 5; x++) {
            if (x === 0) continue;
            const { px, py } = this.mathToCanvas(x, 0, params);
            ctx.fillText(x.toString(), px - 5, centerY + 15);
        }
        
        // Y轴标注
        for (let y = -5; y <= 5; y++) {
            if (y === 0) continue;
            const { px, py } = this.mathToCanvas(0, y, params);
            ctx.fillText(y.toString(), centerX + 5, py + 5);
        }
        
        this.copyOffscreenToMain();
        this.speak('已添加坐标标注');
    }
    
    drawFunctionLabel(functionName) {
        const ctx = this.offscreenCtx;
        const params = this.getMathCoordinateParams();
        
        ctx.font = '14px Arial';
        ctx.fillStyle = this.currentColor;
        ctx.fillText(`y = ${functionName}`, 20, 30);
        
        this.copyOffscreenToMain();
    }
    
    // 多函数叠加
    addFunctionLayer(type, color) {
        if (this.functionLayers.length >= this.maxFunctionLayers) {
            this.speak('已达到最大函数数量限制');
            return;
        }
        
        this.functionLayers.push({
            type: type,
            color: color || this.currentColor
        });
        
        this.renderAllFunctionLayers();
        this.speak(`已添加${type}函数，当前共${this.functionLayers.length}个函数`);
    }
    
    renderAllFunctionLayers() {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const params = this.getMathCoordinateParams();
        const { centerX, centerY, scaleX, scaleY, width, height } = params;
        
        for (const layer of this.functionLayers) {
            ctx.beginPath();
            ctx.strokeStyle = layer.color;
            ctx.lineWidth = this.currentSize;
            this.applyLineType(ctx);
            
            let started = false;
            
            for (let px = 0; px < width; px++) {
                const x = (px - centerX) / scaleX;
                let y = 0;
                
                try {
                    y = this.calculateFunctionValue(layer.type, x);
                } catch (e) {
                    started = false;
                    continue;
                }
                
                if (isNaN(y) || !isFinite(y) || Math.abs(y) > 10) {
                    started = false;
                    continue;
                }
                
                const py = centerY - y * scaleY;
                
                if (!started) {
                    ctx.moveTo(px, py);
                    started = true;
                } else {
                    ctx.lineTo(px, py);
                }
            }
            
            ctx.stroke();
            ctx.setLineDash([]);  // 重置线型
            
            // 添加函数标签
            ctx.font = '12px Arial';
            ctx.fillStyle = layer.color;
            ctx.fillText(layer.type, 20 + this.functionLayers.indexOf(layer) * 80, 30);
        }
        
        this.copyOffscreenToMain();
    }
    
    calculateFunctionValue(type, x) {
        switch (type) {
            case 'sin': return Math.sin(x * Math.PI);
            case 'cos': return Math.cos(x * Math.PI);
            case 'tan': return Math.tan(x);
            case 'parabola': return x * x / 4;
            case 'exponential': return Math.exp(x) / 5;
            case 'log': return x > 0 ? Math.log(x) * 2 : NaN;
            case 'abs': return Math.abs(x) / 3;
            case 'sqrt': return x >= 0 ? Math.sqrt(x) : NaN;
            case 'cube': return Math.pow(x, 3) / 8;
            case 'reciprocal': return x !== 0 ? 1 / x : NaN;
            default: return 0;
        }
    }
    
    clearFunctionLayers() {
        this.functionLayers = [];
        this.speak('已清除所有函数图层');
    }
    
    drawRoundedRect(radius) {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const centerX = this.canvas.width * this.currentShapePosition.x;
        const centerY = this.canvas.height * this.currentShapePosition.y;
        const width = this.currentShapeSize * 2;
        const height = this.currentShapeSize;
        const r = radius || 20;
        
        ctx.beginPath();
        ctx.moveTo(centerX - width / 2 + r, centerY - height / 2);
        ctx.lineTo(centerX + width / 2 - r, centerY - height / 2);
        ctx.quadraticCurveTo(centerX + width / 2, centerY - height / 2, centerX + width / 2, centerY - height / 2 + r);
        ctx.lineTo(centerX + width / 2, centerY + height / 2 - r);
        ctx.quadraticCurveTo(centerX + width / 2, centerY + height / 2, centerX + width / 2 - r, centerY + height / 2);
        ctx.lineTo(centerX - width / 2 + r, centerY + height / 2);
        ctx.quadraticCurveTo(centerX - width / 2, centerY + height / 2, centerX - width / 2, centerY + height / 2 - r);
        ctx.lineTo(centerX - width / 2, centerY - height / 2 + r);
        ctx.quadraticCurveTo(centerX - width / 2, centerY - height / 2, centerX - width / 2 + r, centerY - height / 2);
        ctx.closePath();
        
        this.drawShape();
        this.addChatMessage('已绘制圆角矩形', 'system');
    }
    
    drawCross() {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const centerX = this.canvas.width * this.currentShapePosition.x;
        const centerY = this.canvas.height * this.currentShapePosition.y;
        const size = this.currentShapeSize;
        
        ctx.beginPath();
        ctx.moveTo(centerX - size / 2, centerY);
        ctx.lineTo(centerX + size / 2, centerY);
        ctx.moveTo(centerX, centerY - size / 2);
        ctx.lineTo(centerX, centerY + size / 2);
        ctx.stroke();
        
        this.copyOffscreenToMain();
        this.addChatMessage('已绘制十字', 'system');
    }
    
    drawConcentricCircles(count) {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const centerX = this.canvas.width * this.currentShapePosition.x;
        const centerY = this.canvas.height * this.currentShapePosition.y;
        const maxRadius = this.currentShapeSize;
        const circles = count || 5;
        
        for (let i = 1; i <= circles; i++) {
            const radius = maxRadius * i / circles;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        this.copyOffscreenToMain();
        this.addChatMessage(`已绘制同心圆 (${circles}个)`, 'system');
    }
    
    drawSpiral() {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const centerX = this.canvas.width * this.currentShapePosition.x;
        const centerY = this.canvas.height * this.currentShapePosition.y;
        const maxRadius = this.currentShapeSize;
        
        ctx.beginPath();
        for (let i = 0; i < 720; i++) {
            const angle = i * Math.PI / 180;
            const radius = maxRadius * i / 720;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        
        this.copyOffscreenToMain();
        this.addChatMessage('已绘制螺旋线', 'system');
    }
    
    provideSmartSuggestion(command) {
        const suggestions = {
            '画圆': ['您可以尝试说"画同心圆"绘制多个圆', '说"红色填充圆"可以绘制填充的红色圆'],
            '画正方形': ['说"画圆角矩形"可以绘制圆角矩形', '说"画菱形"可以绘制菱形'],
            '画直线': ['说"画箭头"可以绘制带箭头的直线', '说"画虚线"可以绘制虚线'],
            '画正弦': ['说"画余弦"绘制余弦曲线', '说"画坐标系"添加坐标轴'],
            '画抛物线': ['说"画指数函数"绘制指数曲线', '说"画对数函数"绘制对数曲线']
        };
        
        const suggestionList = suggestions[command] || [];
        if (suggestionList.length > 0) {
            const randomSuggestion = suggestionList[Math.floor(Math.random() * suggestionList.length)];
            this.addChatMessage(randomSuggestion, 'system');
        }
    }
    
    showQuickHelp() {
        const helpMessages = [
            '快捷指令：画圆、画正方形、画三角形、画直线',
            '数学函数：画正弦、画余弦、画抛物线、画坐标系',
            '颜色切换：红色、绿色、蓝色、黄色等',
            '尺寸调整：粗细5、大一点、小一点',
            '高级图形：画贝塞尔曲线、画箭头、画心形',
            '图层操作：添加图层、切换图层、删除图层'
        ];
        
        helpMessages.forEach(msg => this.addChatMessage(msg, 'system'));
    }
    
    copyOffscreenToMain() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.offscreenCanvas, 0, 0);
    }
    
    enqueueRender(task) {
        this.renderQueue.push(task);
        if (!this.isRendering) {
            this.processRenderQueue();
        }
    }
    
    processRenderQueue() {
        if (this.renderQueue.length === 0) {
            this.isRendering = false;
            return;
        }
        
        this.isRendering = true;
        
        requestAnimationFrame(() => {
            const batchSize = Math.min(this.renderQueue.length, 10);
            const batch = this.renderQueue.splice(0, batchSize);
            
            for (const task of batch) {
                task.execute();
            }
            
            this.copyOffscreenToMain();
            this.processRenderQueue();
        });
    }
    
    setupVoiceRecognition() {
        // 关键修复1：实现单例模式，避免重复创建实例
        // 如果已经存在实例，直接更新配置而不是重新创建
        if (this.recognition && this._recognitionInitialized) {
            // 只更新语言配置
            const newLangCode = this.getDialectConfig().langCode;
            this.recognition.lang = newLangCode;
            console.log(`语音识别语言已更新为: ${newLangCode}`);
            return;
        }
        
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
            // 关键修复2：正确配置参数，避免搭配不当
            // continuous=true + interimResults=true 是最佳组合，支持多轮对话和实时反馈
            this.recognition = new SpeechRecognition();
            this._recognitionInitialized = true;  // 标记为已初始化
            this._isRestarting = false;  // 防止重复重启标志
            
            // 正确配置 - 连续模式支持多轮对话
            this.recognition.continuous = true;
            this.recognition.interimResults = true;  // 开启临时结果提供实时反馈
            
            // 关键修复3：确保语种编码正确
            this.recognition.lang = this.getDialectConfig().langCode;
            console.log(`初始化语音识别，语言: ${this.recognition.lang}`);
            
            // 候选结果数量
            this.recognition.maxAlternatives = 10;
            
            // 关键修复4：调整超时/阈值参数，避免启动瞬间就触发超时
            this.maxSpeechDuration = 60000;      // 60秒最大语音时长
            this.silenceTimeoutDuration = 15000;   // 15秒静音超时（大幅增加）
            this.confidenceThreshold = 0.3;       // 降低置信度阈值
            this.retryCount = 0;
            this.maxRetryCount = 3;               // 最大重试次数
            this.lastSpeechTime = Date.now();
            
            // 关键修复5：正确处理onend事件，避免状态混乱
            this.recognition.onstart = () => {
                this._isRestarting = false;  // 重置重启标志
                this.isListening = true;
                this.retryCount = 0;  // 重置重试计数
                
                this.updateStatus('listening', '正在听...');
                this.voiceBtn.classList.remove('start');
                this.voiceBtn.classList.add('stop');
                this.voiceBtn.innerHTML = '<span class="voice-icon-active">🎤</span><span>停止语音</span>';
                this.startAudioVisualization();
                this.showVoiceTip('请说出您的指令...');
                this.activateWaveformContainer();
                this.showMicStatusIndicator();
                
                // 启动超时检测
                this.startSilenceDetection();
                this.updateWakeWordButton();
                
                this.addChatMessage(`🎤 语音识别已启动 (${this.recognition.lang})`, 'system');
            };
            
            this.recognition.onend = () => {
                // 关键修复：防止重复触发onend事件
                if (this._isRestarting) {
                    console.log('识别正在重启中，忽略onend事件');
                    return;
                }
                
                this.stopSilenceDetection();
                
                // 只有在isListening=true时才处理重启
                if (!this.isListening) {
                    console.log('用户已停止监听，不重启');
                    return;
                }
                
                // 防止实例状态混乱，添加延迟
                this._isRestarting = true;
                setTimeout(() => {
                    this._isRestarting = false;
                    
                    if (this.isListening && this.recognition) {
                        try {
                            // 在启动前检查状态
                            if (!this.recognition.continuous) {
                                this.recognition.continuous = true;
                            }
                            this.recognition.start();
                            console.log('识别已重启');
                        } catch (e) {
                            console.log('重启识别失败:', e);
                            // 如果重启失败，停止监听
                            if (e.name === 'InvalidStateError') {
                                this.stopListening();
                            }
                        }
                    }
                }, 500);  // 延迟500ms重启
            };
            
            // 关键修复6：完善错误处理
            this.recognition.onerror = (event) => {
                console.error('语音识别错误:', event.error, event.message);
                
                // 某些错误不需要重试
                const noRetryErrors = ['not-allowed', 'service-not-allowed', 'language-not-supported'];
                
                if (noRetryErrors.includes(event.error)) {
                    this.shouldAutoRetry = false;
                } else {
                    this.shouldAutoRetry = true;
                }
                
                // 权限错误 - 需要用户手动处理
                if (event.error === 'not-allowed') {
                    this.showMicPermissionTip();
                    this.speak('麦克风权限被拒绝，请在浏览器设置中允许使用麦克风');
                    this.isListening = false;
                    this.resetVoiceButton();
                    this.stopAudioVisualization();
                    this.deactivateWaveformContainer();
                    this.hideMicStatusIndicator();
                    return;
                }
                
                // 语言不支持 - 切换到普通话
                if (event.error === 'language-not-supported') {
                    this.updateStatus('error', '当前语言不支持，切换到普通话');
                    this.speak('当前语言不支持，已切换到普通话');
                    this.currentDialect = 'mandarin';
                    this.setupVoiceRecognition();
                    return;
                }
                
                // 其他错误 - 自动重试
                if (this.shouldAutoRetry && this.retryCount < this.maxRetryCount) {
                    this.retryCount++;
                    this.addChatMessage(`⚠️ 识别异常，正在重试 (${this.retryCount}/${this.maxRetryCount})...`, 'system');
                    
                    // 延迟重试
                    setTimeout(() => {
                        if (this.isListening) {
                            try {
                                this.recognition.start();
                            } catch (e) {
                                console.log('重试失败:', e);
                                this.stopListening();
                            }
                        }
                    }, 1000);
                } else {
                    this.updateStatus('warning', '识别已停止');
                    this.isListening = false;
                    this.resetVoiceButton();
                    this.stopAudioVisualization();
                }
            };
            
            // 关键修复7：正确处理onresult，不误写stop()
            this.recognition.onresult = (event) => {
                // 重置超时
                this.lastSpeechTime = Date.now();
                this.clearSilenceTimeout();
                
                // 处理所有结果
                let finalTranscript = '';
                let interimTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript.trim();
                    
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }
                
                // 显示临时结果
                if (interimTranscript) {
                    this.showInterimResult(interimTranscript);
                }
                
                // 处理最终结果
                if (finalTranscript) {
                    this.hideInterimResult();
                    this.clearSilenceTimeout();
                    
                    // 清洗文本
                    const cleanedTranscript = this.cleanTranscript(finalTranscript);
                    
                    // 显示识别结果
                    this.addChatMessage(`识别: "${cleanedTranscript}"`, 'user');
                    
                    // 处理唤醒词
                    if (this.voiceActivationEnabled && !this.isWakeWordDetected) {
                        if (this.checkWakeWord(cleanedTranscript)) {
                            this.isWakeWordDetected = true;
                            this.showVoiceTip('唤醒成功！请说出您的指令...');
                            this.speak('我在，请说');
                            this.updateWakeWordButton();
                            this.startSilenceDetection();
                            return;
                        }
                    }
                    
                    // 处理命令
                    if (!this.voiceActivationEnabled || this.isWakeWordDetected) {
                        const matched = this.tryMultipleMatching(cleanedTranscript);
                        
                        if (matched) {
                            this.isWakeWordDetected = false;
                            this.updateWakeWordButton();
                        } else {
                            this.showFallbackSuggestions(cleanedTranscript);
                        }
                    }
                    
                    this.startSilenceDetection();
                }
            };
            
            // 语音活动检测事件
            this.recognition.onspeechstart = () => {
                this.updateStatus('active', '检测到语音...');
                this.lastSpeechTime = Date.now();
                this.stopSilenceDetection();
            };
            
            this.recognition.onspeechend = () => {
                this.updateStatus('listening', '正在处理...');
                this.lastSpeechEndTime = Date.now();
                this.startSilenceDetection();
            };
            
            this.recognition.onaudiostart = () => {
                this.updateStatus('listening', '音频已连接');
            };
            
            this.recognition.onaudioend = () => {
                this.updateStatus('listening', '等待音频...');
            };
            
        } else {
            this.updateStatus('error', '您的浏览器不支持语音识别');
            this.voiceBtn.disabled = true;
            this.addChatMessage('❌ 您的浏览器不支持语音识别，请使用Chrome浏览器', 'system');
        }
    }
    
    // 停止语音识别 - 正确实现
    stopListening() {
        this.isListening = false;
        this.isWakeWordDetected = false;
        this.shouldAutoRetry = false;  // 停止时不允许重试
        this.clearSilenceTimeout();
        this.stopAudioVisualization();
        this.hideInterimResult();
        this.deactivateWaveformContainer();
        this.hideMicStatusIndicator();
        
        // 正确停止识别
        if (this.recognition) {
            try {
                // 如果正在运行，则停止
                if (this.recognition.state === 'running') {
                    this.recognition.stop();
                }
            } catch (e) {
                console.log('停止识别时出错:', e);
            }
        }
        
        this.updateStatus('idle', '已停止');
        this.resetVoiceButton();
        this.updateWakeWordButton();
    }
    
    // 开始语音识别 - 增强错误处理
    startListening() {
        if (!this.recognition) {
            this.setupVoiceRecognition();
        }
        
        // 检查是否已经在运行
        if (this.recognition.state === 'running') {
            console.log('识别已经在运行中');
            return;
        }
        
        try {
            // 重置状态
            this.isListening = true;
            this.retryCount = 0;
            this.lastSpeechTime = Date.now();
            
            // 确保参数正确
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            
            this.recognition.start();
        } catch (e) {
            console.error('启动识别失败:', e);
            
            if (e.name === 'InvalidStateError') {
                // 实例状态错误，尝试重新创建
                this._recognitionInitialized = false;
                this.setupVoiceRecognition();
                
                setTimeout(() => {
                    try {
                        this.recognition.start();
                    } catch (e2) {
                        console.error('重新创建后启动失败:', e2);
                        this.stopListening();
                    }
                }, 100);
            } else {
                this.stopListening();
            }
        }
    }
    
    // 错误分类方法
    classifyError(errorType) {
        const errorMap = {
            'not-allowed': {
                type: 'permission',
                message: '麦克风权限被拒绝',
                speakMessage: '请允许使用麦克风'
            },
            'audio-capture': {
                type: 'hardware',
                message: '麦克风设备异常',
                speakMessage: '请检查麦克风设备'
            },
            'network': {
                type: 'network',
                message: '网络连接异常',
                speakMessage: '网络异常，正在重试'
            },
            'no-speech': {
                type: 'silence',
                message: '未检测到语音',
                speakMessage: '请对着麦克风说话'
            },
            'language-not-supported': {
                type: 'language',
                message: '语言不支持',
                speakMessage: '请选择其他语言'
            },
            'service-not-allowed': {
                type: 'service',
                message: '服务不可用',
                speakMessage: '语音服务暂时不可用'
            },
            'aborted': {
                type: 'aborted',
                message: '识别被中止',
                speakMessage: '识别已停止'
            },
            'bad-grammar': {
                type: 'grammar',
                message: '语法错误',
                speakMessage: '语音格式有误'
            }
        };
        
        return errorMap[errorType] || {
            type: 'unknown',
            message: '未知错误',
            speakMessage: '发生未知错误'
        };
    }
    
    // 尝试多种匹配方式 - 提高识别成功率
    tryMultipleMatching(text) {
        // 1. 直接匹配（最优先）
        if (this.processCommand(text)) {
            return true;
        }
        
        // 2. 模糊匹配 - 降低阈值要求
        const fuzzyMatch = this.fuzzyMatchCommand(text);
        if (fuzzyMatch && fuzzyMatch.confidence >= 0.4) {  // 降低到0.4
            this.addChatMessage(`🔍 模糊匹配: "${fuzzyMatch.commandKey}"`, 'system');
            return this.processCommand(fuzzyMatch.commandKey);
        }
        
        // 3. 拼音匹配
        const pinyinMatch = this.matchByPinyin(text);
        if (pinyinMatch) {
            this.addChatMessage(`🔤 拼音匹配: "${pinyinMatch.commandKey}"`, 'system');
            return this.processCommand(pinyinMatch.commandKey);
        }
        
        // 4. 拆分组合指令
        if (this.processCombinedCommand(text)) {
            return true;
        }
        
        // 5. 自然语言语义分析
        if (this.analyzeNaturalLanguage(text)) {
            return true;
        }
        
        return false;
    }
    
    // 超时检测机制 - 修复状态混乱问题
    startSilenceDetection() {
        // 先清除之前的检测
        this.stopSilenceDetection();
        
        this.silenceDetectionTimer = setInterval(() => {
            if (!this.isListening) {
                this.stopSilenceDetection();
                return;
            }
            
            const timeSinceLastSpeech = Date.now() - this.lastSpeechTime;
            
            if (timeSinceLastSpeech > this.silenceTimeoutDuration) {
                this.addChatMessage(`⏱️ ${this.silenceTimeoutDuration/1000}秒无语音，保持监听中...`, 'system');
                this.stopSilenceDetection();
                
                if (this.isListening) {
                    // 重置唤醒词状态
                    this.isWakeWordDetected = false;
                    this.updateWakeWordButton();
                    this.showVoiceTip('超时已重置，请继续说话...');
                    
                    // 重启超时检测
                    this.startSilenceDetection();
                }
            }
        }, 2000);  // 每2秒检查一次
    }
    
    stopSilenceDetection() {
        if (this.silenceDetectionTimer) {
            clearInterval(this.silenceDetectionTimer);
            this.silenceDetectionTimer = null;
        }
    }
    
    // 第二层：文本清洗与指令匹配优化
    cleanTranscript(transcript) {
        if (!transcript) return '';
        
        let cleaned = transcript;
        
        // 移除标点符号和特殊字符
        cleaned = cleaned.replace(/[，,。.！!？?；;：:、/\\|`~@#$%^&*()_+\-=\[\]{}"']/g, '');
        
        // 移除多余空格
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
        
        // 常见噪音词过滤（扩展列表）
        const noiseWords = [
            '嗯', '啊', '哦', '呃', '那个', '然后', '就是说', '那个啥', '嗯哼', '好吧', '其实', '那个那个',
            '就是', '所以', '因为', '但是', '不过', '还有', '比如说', '比如说呢', '你知道吗',
            '我想说', '我想', '我觉得', '我认为', '怎么说呢', '怎么说', '等一下', '稍等',
            'wait', 'um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally'
        ];
        for (const word of noiseWords) {
            cleaned = cleaned.split(word).join('').trim();
        }
        
        // 谐音/误匹配修正
        cleaned = this.correctHomophones(cleaned);
        
        // 口语化表达标准化
        cleaned = this.normalizeColloquialisms(cleaned);
        
        // 数字规范化
        cleaned = this.normalizeNumbers(cleaned);
        
        return cleaned;
    }
    
    // 谐音修正
    correctHomophones(text) {
        const homophoneMap = {
            // 绘图指令谐音
            '花园': '画圆', '话圆': '画圆', '换圆': '画圆', '化圆': '画圆',
            '画方': '画正方形', '话方': '画正方形', '换方': '画正方形',
            '画三': '画三角形', '话三': '画三角形', '画三角': '画三角形',
            '画直': '画直线', '话直': '画直线', '画线': '画直线',
            '画心': '画心形', '话心': '画心形', '画爱心': '画心形',
            '撒销': '撤销', '撤消': '撤销', '澈销': '撤销', '撤消': '撤销',
            '请空': '清空', '清孔': '清空', '青空': '清空',
            '保寸': '保存', '宝存': '保存',
            '正弦': '画正弦', '余弦': '画余弦', '正切': '画正切',
            '抛线': '抛物线', '抛弧线': '抛物线',
            '做图': '画图', '绘图': '画图', '图画': '画图',
            '坐标': '坐标', '坐标系': '画坐标系',
            // 颜色谐音
            '红色': '红色', '兰色': '蓝色', '绿色': '绿色', '黄色': '黄色',
            // 方言谐音
            '画只': '画个', '画一': '画个',
            // 数学谐音
            '赛克斯': 'sinx', '赛恩': 'sin', '口赛恩': 'cos', '口赛克斯': 'cosx',
            '坦正特': 'tan', '坦': 'tan',
            '爱克斯': 'x', '爱克斯平方': 'x平方', '爱克斯立方': 'x立方',
            '派': 'π', 'pi': 'π', '圆周率': 'π',
            '度数': '度', '角度': '度'
        };
        
        for (const [wrong, correct] of Object.entries(homophoneMap)) {
            if (text.includes(wrong)) {
                text = text.replace(wrong, correct);
            }
        }
        
        return text;
    }
    
    // 口语化表达标准化
    normalizeColloquialisms(text) {
        const colloquialismMap = {
            // 绘图口语化
            '给我画': '画', '帮我画': '画', '我要画': '画', '我想画': '画',
            '画一个': '画', '画个': '画', '画一只': '画',
            '画一个圆': '画圆', '画一个正方形': '画正方形', '画一个三角形': '画三角形',
            '画一个心形': '画心形', '画一个爱心': '画心形',
            '画一条线': '画直线', '画一条直线': '画直线',
            '画一条正弦': '画正弦', '画一条余弦': '画余弦',
            '画一个坐标系': '画坐标系',
            // 操作口语化
            '撤销一下': '撤销', '撤回一下': '撤销', '返回一下': '撤销',
            '重做一下': '重做', '恢复一下': '重做',
            '清空一下': '清空', '清除一下': '清空', '清空画布': '清空',
            '保存一下': '保存', '保存图片': '保存', '存一下': '保存',
            // 颜色口语化
            '换成红色': '红色', '改成红色': '红色', '用红色': '红色', '变红色': '红色',
            '换成蓝色': '蓝色', '改成蓝色': '蓝色', '用蓝色': '蓝色',
            '换成绿色': '绿色', '改成绿色': '绿色', '用绿色': '绿色',
            // 大小口语化
            '大一点': '大', '小一点': '小', '粗一点': '粗', '细一点': '细',
            '大一些': '大', '小一些': '小',
            // 位置口语化
            '放在左边': '左边', '放在右边': '右边', '放在上面': '上面', '放在下面': '下面',
            '放在中间': '中间', '放在左上角': '左上角', '放在右上角': '右上角',
            // 数学口语化
            '正弦函数': '画正弦', '余弦函数': '画余弦', '正切函数': '画正切',
            '抛物线函数': '抛物线', '二次函数': '抛物线',
            '指数函数': '画指数', '对数函数': '画对数',
            'sin函数': '画正弦', 'cos函数': '画余弦', 'tan函数': '画正切',
            // 简笔画口语化
            '画个小房子': '画房子', '画个房子': '画房子',
            '画个小花': '画花朵', '画个花': '画花朵', '画一朵花': '画花朵',
            '画个太阳': '画太阳', '画个小太阳': '画太阳',
            '画个星星': '画星星', '画个五角星': '画星星',
            '画个树': '画树', '画棵树': '画树',
            '画个云': '画云', '画朵云': '画云',
            '画个小猫': '画猫', '画只猫': '画猫', '画个猫咪': '画猫',
            '画个小狗': '画狗', '画只狗': '画狗',
            '画个小鸟': '画鸟', '画只鸟': '画鸟',
            '画个笑脸': '画笑脸', '画个笑脸表情': '画笑脸',
            '画个汽车': '画汽车', '画辆车': '画汽车',
            '画个飞机': '画飞机', '画架飞机': '画飞机',
            '画个船': '画船', '画艘船': '画船',
            '画个山': '画山', '画座山': '画山',
            '画个苹果': '画苹果', '画个苹果': '画苹果'
        };
        
        for (const [colloquial, standard] of Object.entries(colloquialismMap)) {
            if (text.includes(colloquial)) {
                text = text.replace(colloquial, standard);
            }
        }
        
        return text;
    }
    
    // 数字规范化
    normalizeNumbers(text) {
        // 中文数字转阿拉伯数字
        const chineseNumbers = {
            '零': '0', '一': '1', '二': '2', '三': '3', '四': '4',
            '五': '5', '六': '6', '七': '7', '八': '8', '九': '9', '十': '10',
            '百': '100', '千': '1000', '万': '10000'
        };
        
        // 处理简单中文数字
        for (const [chinese, arabic] of Object.entries(chineseNumbers)) {
            text = text.replace(new RegExp(chinese, 'g'), arabic);
        }
        
        // 处理组合数字（如"二十"、"三十"）
        text = text.replace(/二十/g, '20');
        text = text.replace(/三十/g, '30');
        text = text.replace(/四十/g, '40');
        text = text.replace(/五十/g, '50');
        text = text.replace(/六十/g, '60');
        text = text.replace(/七十/g, '70');
        text = text.replace(/八十/g, '80');
        text = text.replace(/九十/g, '90');
        
        // 处理"十几"格式
        text = text.replace(/十一/g, '11');
        text = text.replace(/十二/g, '12');
        text = text.replace(/十三/g, '13');
        text = text.replace(/十四/g, '14');
        text = text.replace(/十五/g, '15');
        text = text.replace(/十六/g, '16');
        text = text.replace(/十七/g, '17');
        text = text.replace(/十八/g, '18');
        text = text.replace(/十九/g, '19');
        
        // 处理度数
        text = text.replace(/(\d+)度/g, '$1度');
        text = text.replace(/(\d+)角度/g, '$1度');
        
        return text;
    }
    
    // 智能指令匹配（模糊匹配）
    fuzzyMatchCommand(text) {
        const config = this.getDialectConfig();
        const commands = config.commands;
        
        let bestMatch = null;
        let bestScore = 0;
        
        for (const [commandKey, keywords] of Object.entries(commands)) {
            for (const keyword of keywords) {
                const score = this.calculateSimilarity(text, keyword);
                
                // 完全匹配
                if (text.includes(keyword)) {
                    return { commandKey, confidence: 1 };
                }
                
                // 模糊匹配
                if (score > bestScore && score >= 0.6) {
                    bestScore = score;
                    bestMatch = commandKey;
                }
            }
        }
        
        if (bestMatch) {
            return { commandKey: bestMatch, confidence: bestScore };
        }
        
        return null;
    }
    
    // 拼音相似度匹配
    matchByPinyin(text) {
        const config = this.getDialectConfig();
        const commands = config.commands;
        
        // 简化拼音提取（仅提取首字母）
        const getInitials = (str) => {
            const initials = [];
            for (const char of str) {
                const pinyin = this.pinyinMap[char];
                if (pinyin) {
                    initials.push(pinyin[0].toLowerCase());
                }
            }
            return initials.join('');
        };
        
        const textInitials = getInitials(text);
        
        for (const [commandKey, keywords] of Object.entries(commands)) {
            for (const keyword of keywords) {
                const keywordInitials = getInitials(keyword);
                if (textInitials === keywordInitials) {
                    return { commandKey, confidence: 0.8 };
                }
            }
        }
        
        return null;
    }
    
    setSilenceTimeout() {
        // 清除之前的超时
        this.clearSilenceTimeout();
        
        // 这个方法不再主动停止识别，而是重置状态
        this.silenceTimeout = setTimeout(() => {
            if (this.isListening) {
                // 只重置唤醒词状态，不停止识别
                this.isWakeWordDetected = false;
                this.updateWakeWordButton();
                this.showVoiceTip('请继续说话...');
            }
        }, this.minSilenceDuration || 5000);
    }
    
    clearSilenceTimeout() {
        if (this.silenceTimeout) {
            clearTimeout(this.silenceTimeout);
            this.silenceTimeout = null;
        }
    }
    
    checkWakeWord(text) {
        const normalizedText = text.toLowerCase();
        for (const wakeWord of this.wakeWords) {
            if (normalizedText.includes(wakeWord.toLowerCase())) {
                return true;
            }
        }
        return false;
    }
    
    showVoiceTip(message) {
        if (this.statusText) {
            this.statusText.textContent = message;
        }
        this.addChatMessage(message, 'system');
    }
    
    showInterimResult(text) {
        const interimDiv = document.getElementById('interimResult');
        if (interimDiv) {
            interimDiv.textContent = text;
            interimDiv.style.display = 'block';
        }
    }
    
    hideInterimResult() {
        const interimDiv = document.getElementById('interimResult');
        if (interimDiv) {
            interimDiv.style.display = 'none';
        }
    }
    
    clearSilenceTimeout() {
        if (this.silenceTimeout) {
            clearTimeout(this.silenceTimeout);
            this.silenceTimeout = null;
        }
    }
    
    // 第三层：音频预处理（降噪防干扰）- 优化版
    async startAudioVisualization() {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // 获取音频流，优化降噪参数
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,      // 回声消除
                    noiseSuppression: true,    // 噪音抑制
                    autoGainControl: true,     // 自动增益控制
                    highpassFilter: true,      // 高通滤波器
                    latency: 'good',            // 平衡延迟和稳定性
                    sampleRate: 16000,          // 采样率
                    channelCount: 1            // 单声道
                }
            });
            
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 512;      // 提高频率分辨率
            this.analyser.smoothingTimeConstant = 0.85;  // 增加平滑度
            
            // 创建增强的音频滤波器链
            this.setupAudioFilters();
            
            // 启动噪音检测
            this.startNoiseDetection();
            
            this.drawAudioWaveform();
            
            this.addChatMessage('🔊 音频预处理已启动', 'system');
        } catch (error) {
            console.log('音频可视化初始化失败:', error);
            this.addChatMessage('⚠️ 音频初始化失败，请检查麦克风', 'system');
        }
    }
    
    // 设置音频滤波器链
    setupAudioFilters() {
        // 高通滤波器 - 过滤低频噪音
        this.highpassFilter = this.audioContext.createBiquadFilter();
        this.highpassFilter.type = 'highpass';
        this.highpassFilter.frequency.value = 80;  // 截断80Hz以下的低频噪音
        this.highpassFilter.Q.value = 0.7;
        
        // 低通滤波器 - 过滤高频噪音
        this.lowpassFilter = this.audioContext.createBiquadFilter();
        this.lowpassFilter.type = 'lowpass';
        this.lowpassFilter.frequency.value = 8000;  // 截断8000Hz以上的高频噪音
        this.lowpassFilter.Q.value = 0.7;
        
        // 带通滤波器 - 强化人声频段（300Hz-3400Hz是标准电话语音频段）
        this.bandpassFilter = this.audioContext.createBiquadFilter();
        this.bandpassFilter.type = 'bandpass';
        this.bandpassFilter.frequency.value = 1500;  // 人声中心频率
        this.bandpassFilter.Q.value = 1.0;
        
        // 压缩器 - 平衡音量差异
        this.compressor = this.audioContext.createDynamicsCompressor();
        this.compressor.threshold.value = -24;
        this.compressor.knee.value = 30;
        this.compressor.ratio.value = 12;
        this.compressor.attack.value = 0.003;
        this.compressor.release.value = 0.25;
        
        // 增益节点
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 1.2;  // 适度提高音量
        
        // 连接滤波器链：麦克风 -> 高通 -> 低通 -> 带通 -> 压缩器 -> 增益 -> 分析器
        this.microphone.connect(this.highpassFilter);
        this.highpassFilter.connect(this.lowpassFilter);
        this.lowpassFilter.connect(this.bandpassFilter);
        this.bandpassFilter.connect(this.compressor);
        this.compressor.connect(this.gainNode);
        this.gainNode.connect(this.analyser);
    }
    
    // 噪音检测 - 优化版（防抖逻辑）
    startNoiseDetection() {
        // 初始化防抖相关变量
        this.noiseWarningCount = 0;
        this.noiseWarningThreshold = 3;  // 连续3次才提示
        this.lastNoiseWarningTime = 0;
        this.noiseWarningCooldown = 5000;  // 5秒冷却时间
        this.consecutiveNoiseFrames = 0;
        this.consecutiveVoiceFrames = 0;
        this.voiceConfidenceThreshold = 3;  // 连续3帧有语音才确认
        
        this.noiseDetectionTimer = setInterval(() => {
            if (!this.analyser || !this.isListening) return;
            
            const bufferLength = this.analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            this.analyser.getByteFrequencyData(dataArray);
            
            // 计算改进的噪音水平和语音置信度
            const noiseLevel = this.calculateNoiseLevel(dataArray);
            const voiceConfidence = this.calculateVoiceConfidence(dataArray);
            const volumeLevel = this.calculateVolumeLevel(dataArray);
            
            // 语音检测（带防抖）
            if (voiceConfidence > 0.5) {
                this.consecutiveVoiceFrames++;
                this.consecutiveNoiseFrames = 0;
                
                if (this.consecutiveVoiceFrames >= this.voiceConfidenceThreshold) {
                    this.lastSpeechTime = Date.now();
                    this.consecutiveVoiceFrames = 0;  // 重置计数
                }
            } else {
                this.consecutiveNoiseFrames++;
                this.consecutiveVoiceFrames = 0;
            }
            
            // 噪音警告（带防抖和冷却）
            if (noiseLevel > 85 && volumeLevel > 40) {
                this.noiseWarningCount++;
                
                const now = Date.now();
                if (this.noiseWarningCount >= this.noiseWarningThreshold && 
                    (now - this.lastNoiseWarningTime) > this.noiseWarningCooldown) {
                    this.showNoiseWarning();
                    this.lastNoiseWarningTime = now;
                    this.noiseWarningCount = 0;
                }
            } else {
                this.noiseWarningCount = Math.max(0, this.noiseWarningCount - 1);
            }
            
            // 更新UI音量指示
            this.updateVolumeIndicator(volumeLevel);
            
        }, 300);  // 降低检测频率，减少误判
    }
    
    // 显示噪音警告（优化样式）
    showNoiseWarning() {
        const tips = [
            '🎤 检测到环境噪音，建议靠近麦克风说话',
            '🔇 环境较嘈杂，请降低背景声音',
            '💡 提示：保持麦克风距离嘴部约15厘米',
            '📢 请使用标准音量说话'
        ];
        
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        this.showVoiceTip(randomTip);
        
        // 更新状态卡片样式
        const statusCard = document.getElementById('statusCard');
        if (statusCard) {
            statusCard.classList.remove('listening', 'success');
            statusCard.classList.add('warning');
        }
    }
    
    // 计算改进的噪音水平
    calculateNoiseLevel(dataArray) {
        // 分频段分析
        const lowFreq = dataArray.slice(0, 5).reduce((a, b) => a + b, 0) / 5;      // 0-200Hz 低频噪音
        const midLowFreq = dataArray.slice(5, 15).reduce((a, b) => a + b, 0) / 10; // 200-600Hz
        const midFreq = dataArray.slice(15, 50).reduce((a, b) => a + b, 0) / 35;    // 600Hz-2kHz 人声
        const highFreq = dataArray.slice(50, 100).reduce((a, b) => a + b, 0) / 50;  // 2kHz以上
        
        // 整体能量
        const totalEnergy = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        
        // 噪音特征：低频能量占比高 + 高频能量异常
        const lowFreqRatio = lowFreq / (totalEnergy + 1);
        const highFreqRatio = highFreq / (totalEnergy + 1);
        
        // 放宽判定标准：噪音比例超过70%才判定为噪音环境
        const noiseScore = (lowFreqRatio * 0.6 + highFreqRatio * 0.4) * 100;
        
        return Math.min(100, noiseScore);
    }
    
    // 计算语音置信度
    calculateVoiceConfidence(dataArray) {
        // 人声主要集中在300Hz-3kHz
        const voiceBand1 = dataArray.slice(10, 30).reduce((a, b) => a + b, 0) / 20;  // 300-1.2kHz
        const voiceBand2 = dataArray.slice(30, 60).reduce((a, b) => a + b, 0) / 30;  // 1.2-2.5kHz
        const voiceBand3 = dataArray.slice(60, 90).reduce((a, b) => a + b, 0) / 30;  // 2.5-4kHz
        
        // 计算语音特征
        const voiceEnergy = (voiceBand1 + voiceBand2 + voiceBand3) / 3;
        const totalEnergy = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        
        // 语音置信度：语音能量占比 + 绝对能量水平
        const voiceRatio = voiceEnergy / (totalEnergy + 1);
        const absoluteScore = Math.min(1, voiceEnergy / 50);  // 调高阈值，减少误判
        
        return (voiceRatio * 0.7 + absoluteScore * 0.3);
    }
    
    // 计算音量级别（调高判定阈值）
    calculateVolumeLevel(dataArray) {
        // 使用RMS计算更准确的音量
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / dataArray.length);
        
        // 调高阈值：只有超过40才认为有有效输入
        return Math.min(100, (rms / 255) * 150);
    }
    
    // 更新音量指示器
    updateVolumeIndicator(level) {
        const bar = document.getElementById('micLevelBar');
        const indicator = document.getElementById('micStatusIndicator');
        
        if (bar) {
            bar.style.width = `${level}%`;
            
            // 根据音量级别调整颜色
            if (level > 70) {
                bar.style.background = 'linear-gradient(90deg, #10b981, #059669)';
            } else if (level > 40) {
                bar.style.background = 'linear-gradient(90deg, #10b981, #fbbf24)';
            } else {
                bar.style.background = 'linear-gradient(90deg, #667eea, #8b5cf6)';
            }
        }
        
        if (indicator) {
            indicator.style.display = this.isListening ? 'flex' : 'none';
        }
    }
    
    stopNoiseDetection() {
        if (this.noiseDetectionTimer) {
            clearInterval(this.noiseDetectionTimer);
            this.noiseDetectionTimer = null;
        }
        this.consecutiveNoiseFrames = 0;
        this.consecutiveVoiceFrames = 0;
    }
    
    // 语音活动检测（VAD）- 优化版
    detectVoiceActivity(dataArray) {
        // 人声主要集中在300Hz-3kHz
        const voiceBandLow = dataArray.slice(10, 30).reduce((a, b) => a + b, 0) / 20;  // 300-1.2kHz
        const voiceBandMid = dataArray.slice(30, 60).reduce((a, b) => a + b, 0) / 30;  // 1.2-2.5kHz
        
        // 调高阈值，减少误判
        const voiceThreshold = 35;  // 从30调高到35
        
        return (voiceBandLow > voiceThreshold || voiceBandMid > voiceThreshold);
    }
    
    stopAudioVisualization() {
        this.stopNoiseDetection();
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.microphone) {
            this.microphone.disconnect();
            this.microphone = null;
        }
        if (this.highpassFilter) {
            this.highpassFilter.disconnect();
            this.highpassFilter = null;
        }
        if (this.lowpassFilter) {
            this.lowpassFilter.disconnect();
            this.lowpassFilter = null;
        }
        if (this.bandpassFilter) {
            this.bandpassFilter.disconnect();
            this.bandpassFilter = null;
        }
        if (this.compressor) {
            this.compressor.disconnect();
            this.compressor = null;
        }
        if (this.gainNode) {
            this.gainNode.disconnect();
            this.gainNode = null;
        }
    }
    
    drawAudioWaveform() {
        if (!this.analyser) return;
        
        const canvas = document.getElementById('waveformCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const draw = () => {
            if (!this.isListening) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }
            
            this.animationId = requestAnimationFrame(draw);
            this.analyser.getByteFrequencyData(dataArray);
            
            // 计算平均音量并更新指示器
            const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
            const volumePercent = Math.min(100, (average / 255) * 100 * 2);
            this.updateMicLevelBar(volumePercent);
            
            ctx.fillStyle = 'rgba(139, 92, 246, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
                
                // 根据音量动态调整颜色
                const intensity = dataArray[i] / 255;
                const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
                gradient.addColorStop(0, intensity > 0.6 ? '#10b981' : '#8b5cf6');
                gradient.addColorStop(1, intensity > 0.6 ? '#059669' : '#667eea');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                
                x += barWidth + 1;
            }
        };
        
        draw();
    }
    
    updateMicLevelBar(percent) {
        const bar = document.getElementById('micLevelBar');
        if (bar) {
            bar.style.width = `${percent}%`;
        }
    }
    
    // 第四层：语种/方言专项适配
    optimizeForDialect(dialect) {
        const dialectOptimizations = {
            mandarin: {
                // 普通话优化
                wakeWords: ['小助手', '助手', '画画', '绘图', '嘿助手', '你好助手'],
                commonPhrases: ['画', '撤销', '清空', '保存', '红色', '蓝色'],
                confidenceBoost: 0.1  // 提升置信度
            },
            cantonese: {
                // 粤语优化
                wakeWords: ['助手', '画图', '小助手'],
                commonPhrases: ['画', '撤回', '清晒', '存图'],
                confidenceBoost: 0.15
            },
            sichuan: {
                // 四川话优化
                wakeWords: ['助手', '画图', '画画'],
                commonPhrases: ['画', '撤销', '清空', '保存'],
                confidenceBoost: 0.12
            },
            shanghai: {
                // 上海话优化
                wakeWords: ['助手', '画图'],
                commonPhrases: ['画', '撤销', '清空', '保存'],
                confidenceBoost: 0.12
            },
            english: {
                // 英语优化
                wakeWords: ['assistant', 'draw', 'hello'],
                commonPhrases: ['draw', 'undo', 'clear', 'save', 'red', 'blue'],
                confidenceBoost: 0.2
            }
        };
        
        const optimization = dialectOptimizations[dialect] || dialectOptimizations.mandarin;
        
        // 应用优化
        this.wakeWords = optimization.wakeWords;
        this.dialectCommonPhrases = optimization.commonPhrases;
        this.confidenceBoost = optimization.confidenceBoost;
        
        // 更新识别语言
        if (this.recognition) {
            this.recognition.lang = this.getDialectConfig().langCode;
        }
        
        this.addChatMessage(`🌐 已优化${this.getDialectConfig().name}识别配置`, 'system');
    }
    
    // 方言特定指令匹配
    matchDialectCommand(text, dialect) {
        const config = this.getDialectConfig();
        
        // 检查方言特定关键词
        for (const [commandKey, keywords] of Object.entries(config.commands)) {
            for (const keyword of keywords) {
                if (text.includes(keyword)) {
                    // 应用置信度提升
                    return {
                        commandKey,
                        confidence: 1 + this.confidenceBoost
                    };
                }
            }
        }
        
        return null;
    }
    
    // 第五层：交互兜底与用户引导
    showInteractionGuide() {
        const guides = [
            '💡 如果识别不准确，请尝试：',
            '   1. 靠近麦克风说话',
            '   2. 降低环境噪音',
            '   3. 清晰发音',
            '   4. 使用标准指令格式'
        ];
        
        for (const guide of guides) {
            this.addChatMessage(guide, 'system');
        }
    }
    
    // 识别失败时的兜底建议
    showFallbackSuggestions(originalText) {
        this.addChatMessage('❌ 未能识别指令，以下是一些建议：', 'system');
        
        // 尝试模糊匹配
        const fuzzyMatch = this.fuzzyMatchCommand(originalText);
        if (fuzzyMatch) {
            this.addChatMessage(`🔍 您可能想说: "${fuzzyMatch.commandKey}"`, 'system');
        }
        
        // 尝试拼音匹配
        const pinyinMatch = this.matchByPinyin(originalText);
        if (pinyinMatch) {
            this.addChatMessage(`🔤 拼音匹配: "${pinyinMatch.commandKey}"`, 'system');
        }
        
        // 显示常用指令
        this.showCommonCommands();
    }
    
    // 显示常用指令
    showCommonCommands() {
        const commonCommands = [
            '📝 常用指令：',
            '   画圆 / 画正方形 / 画三角形',
            '   画正弦 / 画抛物线 / 画坐标系',
            '   红色 / 蓝色 / 绿色',
            '   撤销 / 清空 / 保存'
        ];
        
        for (const cmd of commonCommands) {
            this.addChatMessage(cmd, 'system');
        }
    }
    
    // 交互式确认
    confirmCommand(command) {
        this.addChatMessage(`❓ 您说的是"${command}"吗？请确认：`, 'system');
        this.addChatMessage('   说"是的"或"确认"执行', 'system');
        this.addChatMessage('   说"不是"或"取消"放弃', 'system');
        
        this.pendingConfirmation = command;
    }
    
    // 处理确认响应
    handleConfirmationResponse(response) {
        if (!this.pendingConfirmation) return false;
        
        const confirmWords = ['是的', '确认', '对', '没错', '是', 'yes', 'ok'];
        const cancelWords = ['不是', '取消', '不对', '错', 'no', 'cancel'];
        
        const normalizedResponse = response.toLowerCase();
        
        if (confirmWords.some(word => normalizedResponse.includes(word))) {
            this.processCommand(this.pendingConfirmation);
            this.pendingConfirmation = null;
            return true;
        }
        
        if (cancelWords.some(word => normalizedResponse.includes(word))) {
            this.addChatMessage('✅ 已取消操作', 'system');
            this.pendingConfirmation = null;
            return true;
        }
        
        return false;
    }
    
    // 智能提示系统
    showSmartHint(context) {
        const hints = {
            afterDraw: '💡 您可以说"撤销"来撤销操作，或说"保存"保存图片',
            afterColor: '💡 您可以说"粗细5"调整笔刷大小',
            afterFunction: '💡 您可以说"画坐标系"添加坐标轴参考',
            afterUndo: '💡 您可以说"重做"恢复操作',
            idle: '💡 点击麦克风按钮开始语音识别，或说"帮助"查看指令列表',
            error: '💡 如果识别失败，请检查麦克风权限或降低环境噪音'
        };
        
        const hint = hints[context] || hints.idle;
        this.addChatMessage(hint, 'system');
    }
    
    // 语音输入引导
    showVoiceInputGuide() {
        this.addChatMessage('🎤 语音输入指南：', 'system');
        this.addChatMessage('   1. 点击"开始语音"按钮', 'system');
        this.addChatMessage('   2. 等待麦克风图标闪烁', 'system');
        this.addChatMessage('   3. 清晰说出指令', 'system');
        this.addChatMessage('   4. 系统会自动识别并执行', 'system');
        this.addChatMessage('   5. 说"停止"或点击按钮结束', 'system');
    }
    
    // 切换语音识别状态 - 前端按钮调用
    toggleVoice() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }
    
    toggleVoiceActivation() {
        this.voiceActivationEnabled = !this.voiceActivationEnabled;
        const message = this.voiceActivationEnabled 
            ? '语音唤醒已启用，请先说唤醒词（如"小助手"）'
            : '语音唤醒已关闭，可直接说出指令';
        this.showVoiceTip(message);
        this.speak(message);
        this.updateWakeWordButton();
    }
    
    // 设置方言 - 前端按钮调用（别名方法）
    setDialect(dialectKey) {
        this.changeDialect(dialectKey);
    }
    
    // 切换填充模式 - 前端按钮调用
    toggleFillMode() {
        if (this.fillMode === 'stroke') {
            this.setMode('fill');
        } else if (this.fillMode === 'fill') {
            this.setMode('gradient');
        } else {
            this.setMode('stroke');
        }
    }
    
    updateWakeWordButton() {
        const wakeWordBtn = document.getElementById('wakeWordToggle');
        if (wakeWordBtn) {
            if (this.voiceActivationEnabled) {
                wakeWordBtn.classList.add('active');
                wakeWordBtn.innerHTML = '<span>🔔</span><span>语音唤醒已启用</span>';
            } else {
                wakeWordBtn.classList.remove('active');
                wakeWordBtn.innerHTML = '<span>🔔</span><span>语音唤醒</span>';
            }
        }
    }
    
    activateWaveformContainer() {
        const container = document.getElementById('waveformContainer');
        if (container) {
            container.classList.add('active');
        }
    }
    
    deactivateWaveformContainer() {
        const container = document.getElementById('waveformContainer');
        if (container) {
            container.classList.remove('active');
        }
    }
    
    showMicStatusIndicator() {
        const indicator = document.getElementById('micStatusIndicator');
        if (indicator) {
            indicator.style.display = 'flex';
        }
    }
    
    hideMicStatusIndicator() {
        const indicator = document.getElementById('micStatusIndicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }
    
    showMicPermissionTip() {
        // 移除已存在的提示
        const existingTip = document.querySelector('.mic-permission-tip');
        if (existingTip) {
            existingTip.remove();
        }
        
        const tipDiv = document.createElement('div');
        tipDiv.className = 'mic-permission-tip';
        tipDiv.innerHTML = `
            <div class="mic-icon">🎤</div>
            <h3>需要麦克风权限</h3>
            <p>请允许浏览器访问麦克风以使用语音功能</p>
            <button class="btn" onclick="this.parentElement.remove(); app.startListening();">重新尝试</button>
        `;
        document.body.appendChild(tipDiv);
    }
    
    getDialectConfig() {
        return this.dialects[this.currentDialect];
    }
    
    getErrorMessage(error) {
        const errors = {
            'not-allowed': '未授权麦克风权限',
            'no-speech': '未检测到语音',
            'aborted': '语音识别被中止',
            'audio-capture': '无法访问麦克风',
            'network': '网络错误',
            'not-supported': '浏览器不支持',
            'service-not-allowed': '服务不可用'
        };
        return errors[error] || error;
    }
    
    setupEventListeners() {
        this.voiceBtn.addEventListener('click', () => {
            if (this.isListening) {
                this.stopListening();
            } else {
                this.startListening();
            }
        });
        
        this.dialectButtons = document.querySelectorAll('.dialect-btn');
        this.dialectButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const dialectKey = e.target.dataset.dialect;
                this.changeDialect(dialectKey);
            });
        });
    }
    
    changeDialect(dialectKey) {
        const wasListening = this.isListening;
        
        if (wasListening) {
            this.stopListening();
        }
        
        this.currentDialect = dialectKey;
        
        // 关键修复：切换方言后必须重新初始化语音识别引擎
        // 否则识别模型和当前语种不匹配，导致"听得见但识别不出文字"
        if (this.recognition) {
            // 先停止当前识别
            if (this.isListening) {
                this.recognition.stop();
            }
            
            // 更新语言编码
            const newLangCode = this.getDialectConfig().langCode;
            this.recognition.lang = newLangCode;
            
            // 重新创建语音识别实例，确保语言模型完全更新
            this.setupVoiceRecognition();
            
            console.log(`语音识别语言已更新为: ${newLangCode}`);
        }
        
        this.updateDialectUI();
        
        // 应用方言专项优化
        this.optimizeForDialect(dialectKey);
        
        if (wasListening) {
            setTimeout(() => this.startListening(), 800);  // 增加延迟确保初始化完成
        }
        
        const dialectName = this.getDialectConfig().name;
        this.speak(`已切换到${dialectName}`);
        this.addToHistory(`切换方言: ${dialectName}`, 'success');
        this.addChatMessage(`已切换到${dialectName}，语音识别语言已更新`, 'system');
    }
    
    addChatMessage(text, type) {
        if (!this.chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type === 'user' ? 'user-message' : 'system-message'}`;
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'chat-bubble';
        bubbleDiv.textContent = text;
        
        messageDiv.appendChild(bubbleDiv);
        this.chatMessages.appendChild(messageDiv);
        
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    sendChatMessage() {
        if (!this.chatInput) return;
        
        const message = this.chatInput.value.trim();
        if (!message) return;
        
        this.chatInput.value = '';
        this.addChatMessage(message, 'user');
        
        this.processCommand(message);
    }
    
    updateDialectUI() {
        const config = this.getDialectConfig();
        this.dialectInfo.textContent = `当前: ${config.name}`;
        
        const dialectEmojis = {
            mandarin: '🇨🇳',
            cantonese: '🇭🇰',
            sichuan: '🌶️',
            shanghai: '🏮',
            minnan: '🇹🇼',
            northeast: '❄️',
            wu: '🌊',
            hakka: '🏠'
        };
        
        const toolbarDialectInfo = document.getElementById('dialectToolbarInfo');
        if (toolbarDialectInfo) {
            toolbarDialectInfo.textContent = `${dialectEmojis[this.currentDialect]} 当前: ${config.name}`;
        }
        
        this.dialectButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.dialect === this.currentDialect) {
                btn.classList.add('active');
            }
        });
        
        const toolbarBtns = document.querySelectorAll('.dialect-tool-btn');
        toolbarBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.dialect === this.currentDialect) {
                btn.classList.add('active');
            }
        });
        
        if (this.tipsList) {
            this.tipsList.innerHTML = '';
            config.tips.forEach(tip => {
                const li = document.createElement('li');
                li.textContent = tip;
                this.tipsList.appendChild(li);
            });
        }
    }
    
    startListening() {
        try {
            this.recognition.start();
        } catch (error) {
            this.updateStatus('error', '无法启动语音识别');
            console.error(error);
        }
    }
    
    stopListening() {
        this.isListening = false;
        this.isWakeWordDetected = false;
        this.clearSilenceTimeout();
        this.stopAudioVisualization();
        this.hideInterimResult();
        this.deactivateWaveformContainer();
        this.hideMicStatusIndicator();
        if (this.recognition) {
            this.recognition.stop();
        }
        this.updateStatus('idle', '已停止监听');
        this.resetVoiceButton();
        this.updateWakeWordButton();
    }
    
    resetVoiceButton() {
        this.voiceBtn.classList.remove('stop');
        this.voiceBtn.classList.add('start');
        this.voiceBtn.innerHTML = '<span>🎤</span><span>开始语音</span>';
    }
    
    updateStatus(status, text) {
        this.statusIndicator.className = `status-indicator ${status}`;
        this.statusText.textContent = text;
    }
    
    getFeedback(key, params = {}) {
        const feedback = this.getDialectConfig().feedback[key];
        let text = feedback;
        
        for (const [key, value] of Object.entries(params)) {
            text = text.replace(`{${key}}`, value);
        }
        
        return text;
    }
    
    processCommand(command) {
        const normalizedCommand = command.toLowerCase();
        const config = this.getDialectConfig();
        
        this.addToHistory(command, 'success');
        this.addChatMessage(command, 'user');
        
        // 智能命令修正
        const correctedCommand = this.smartCorrectCommand(command);
        if (correctedCommand !== command) {
            this.addChatMessage(`🔧 已修正指令: "${command}" → "${correctedCommand}"`, 'system');
        }
        
        const intentResult = this.intentAnalyzer.analyze(correctedCommand);
        
        const socialIntents = [
            'greeting', 'thanks', 'confirm', 'cancel', 'appreciation', 'question',
            'emotion_happy', 'emotion_sad', 'emotion_angry', 'emotion_tired',
            'weather', 'time', 'self_intro', 'chat', 'joke', 'story', 'music',
            'food', 'hobby', 'mood', 'encouragement', 'goodbye', 'identity',
            'ability', 'opinion', 'learning', 'suggestion', 'request'
        ];
        
        if (socialIntents.includes(intentResult.intent)) {
            const response = this.intentAnalyzer.getResponse(intentResult.intent);
            if (response) {
                this.speak(response);
                this.addChatMessage(response, 'system');
                
                if (intentResult.intent === 'goodbye') {
                    this.stopListening();
                }
                
                return true;
            }
        }
        
        // 智能分析命令
        const smartAnalysis = this.smartAnalyzeCommand(correctedCommand);
        if (smartAnalysis.action === 'multiple') {
            this.addChatMessage(`🔄 正在执行组合命令...`, 'system');
            for (let i = 0; i < smartAnalysis.commands.length; i++) {
                setTimeout(() => {
                    this.processCommand(smartAnalysis.commands[i].trim());
                }, i * 800);
            }
            return true;
        }
        
        if (smartAnalysis.repeat && smartAnalysis.action) {
            this.addChatMessage(`🔄 重复执行: ${smartAnalysis.action}`, 'system');
            const actionMap = {
                drawCircle: () => this.drawCircle(),
                drawSquare: () => this.drawSquare(),
                drawTriangle: () => this.drawTriangle(),
                drawLine: () => this.drawLine(),
                drawSin: () => this.drawFunction('sin'),
                drawCos: () => this.drawFunction('cos'),
                drawParabola: () => this.drawFunction('parabola')
            };
            if (actionMap[smartAnalysis.action]) {
                actionMap[smartAnalysis.action]();
                return true;
            }
        }
        
        if (this.analyzeMathExpression(correctedCommand)) {
            this.updateContext(command, 'mathExpression');
            return true;
        }
        
        // AI自然语言语义绘图
        if (this.analyzeNaturalLanguageDrawing(correctedCommand)) {
            this.updateContext(command, 'naturalLanguageDrawing');
            return true;
        }
        
        this.speak(this.getFeedback('received', { command }));
        
        if (this.tryExecuteCommand(normalizedCommand, config.commands)) {
            this.updateContext(command, 'executeCommand');
            
            const suggestion = this.getContextualSuggestion();
            if (suggestion) {
                setTimeout(() => {
                    this.addChatMessage(suggestion, 'system');
                }, 1000);
            }
            
            this.learnUserPreferences();
            return true;
        }
        
        if (this.tryChangeColor(normalizedCommand, config.colors)) {
            this.updateContext(command, 'setColor');
            this.learnUserPreferences();
            return true;
        }
        
        if (this.tryChangeSize(normalizedCommand)) {
            this.updateContext(command, 'setSize');
            return true;
        }
        
        this.addToHistory(`未识别指令: ${command}`, 'error');
        const unknownMsg = this.getFeedback('unknown');
        this.speak(unknownMsg);
        this.addChatMessage(unknownMsg, 'system');
        
        if (intentResult.suggestions.length > 0) {
            intentResult.suggestions.forEach((suggestion, index) => {
                setTimeout(() => {
                    this.addChatMessage(`💡 ${suggestion}`, 'system');
                }, 500 * (index + 1));
            });
        }
        
        // 显示智能提示
        setTimeout(() => {
            this.addChatMessage(this.getSmartTip(), 'system');
        }, 1500);
        
        return false;
    }
    
    tryExecuteCommand(command, commands) {
        const normalizedCmd = command.toLowerCase().trim();
        
        const commandMap = {
            drawCircle: () => this.drawCircle(),
            drawSquare: () => this.drawSquare(),
            drawRectangle: () => this.drawRectangle(),
            drawLine: () => this.drawLine(),
            drawTriangle: () => this.drawTriangle(),
            drawEllipse: () => this.drawEllipse(),
            drawDiamond: () => this.drawDiamond(),
            drawStar: () => this.drawStar(),
            drawPolygon: () => this.drawPolygon(),
            drawArc: () => this.drawArc(),
            drawCurve: () => this.drawCurve(),
            drawSin: () => this.drawFunction('sin'),
            drawCos: () => this.drawFunction('cos'),
            drawTan: () => this.drawFunction('tan'),
            drawCsc: () => this.drawFunction('csc'),
            drawSec: () => this.drawFunction('sec'),
            drawCot: () => this.drawFunction('cot'),
            drawSinh: () => this.drawFunction('sinh'),
            drawCosh: () => this.drawFunction('cosh'),
            drawTanh: () => this.drawFunction('tanh'),
            drawParabola: () => this.drawFunction('parabola'),
            drawExponential: () => this.drawFunction('exponential'),
            drawLog: () => this.drawFunction('log'),
            drawAbs: () => this.drawFunction('abs'),
            drawSqrt: () => this.drawFunction('sqrt'),
            drawCube: () => this.drawFunction('cube'),
            drawReciprocal: () => this.drawFunction('reciprocal'),
            // 反三角函数
            drawAsin: () => this.drawFunction('asin'),
            drawAcos: () => this.drawFunction('acos'),
            drawAtan: () => this.drawFunction('atan'),
            drawAcsc: () => this.drawFunction('acsc'),
            drawAsec: () => this.drawFunction('asec'),
            drawAcot: () => this.drawFunction('acot'),
            // 高次幂函数
            drawQuartic: () => this.drawFunction('quartic'),
            drawQuintic: () => this.drawFunction('quintic'),
            drawSextic: () => this.drawFunction('sextic'),
            // 极坐标图形
            drawPolarRose: () => this.drawPolarRose(),
            drawPolarHeart: () => this.drawPolarHeart(),
            drawPolarSpiral: () => this.drawPolarSpiral(),
            // 参数方程图形
            drawLissajous: () => this.drawLissajous(),
            drawParametricCircle: () => this.drawParametricCircle(),
            drawParametricEllipse: () => this.drawParametricEllipse(),
            drawParametricFigure8: () => this.drawParametricFigure8(),
            // 线型切换
            setSolidLine: () => this.setLineType('solid'),
            setDashedLine: () => this.setLineType('dashed'),
            setDottedLine: () => this.setLineType('dotted'),
            setDashDotLine: () => this.setLineType('dashdot'),
            // 标注功能
            drawCoordinateLabel: () => this.drawCoordinateLabel(),
            // 多函数叠加
            addSinLayer: () => this.addFunctionLayer('sin'),
            addCosLayer: () => this.addFunctionLayer('cos'),
            addParabolaLayer: () => this.addFunctionLayer('parabola'),
            clearFunctionLayers: () => this.clearFunctionLayers(),
            drawGrid: () => this.drawGrid(),
            drawBezier: () => this.drawBezierCurve(),
            drawArrow: () => this.drawArrow(),
            drawDashedLine: () => this.drawDashedLine(),
            drawHeart: () => this.drawHeart(),
            drawRoundedRect: () => this.drawRoundedRect(),
            drawCross: () => this.drawCross(),
            drawConcentricCircles: () => this.drawConcentricCircles(5),
            drawSpiral: () => this.drawSpiral(),
            drawSector: () => this.drawSector(0, 90),
            drawParallelogram: () => this.drawParallelogram(),
            drawRing: () => this.drawRing(),
            drawNGon: () => this.drawNGon(6),
            drawPentagon: () => this.drawPentagon(),
            drawHexagon: () => this.drawHexagon(),
            drawOctagon: () => this.drawOctagon(),
            showGrid: () => this.showGrid(),
            hideGrid: () => this.hideGrid(),
            addLayer: () => this.addLayer(),
            precisionMode: () => this.setPrecisionMode(true),
            quickHelp: () => this.showQuickHelp(),
            fill: () => this.setFillMode(true),
            gradient: () => this.setGradientMode(true),
            text: () => this.setTool('text'),
            select: () => this.setTool('select'),
            move: () => this.setTool('move'),
            rotate: () => this.setTool('rotate'),
            scale: () => this.setTool('scale'),
            brush: () => this.setTool('brush'),
            eraser: () => this.setTool('eraser'),
            undo: () => this.undo(),
            redo: () => this.redo(),
            clear: () => this.clearCanvas(),
            save: () => this.saveCanvas(),
            help: () => this.showHelp(),
            dialectMandarin: () => this.changeDialect('mandarin'),
            dialectCantonese: () => this.changeDialect('cantonese'),
            dialectSichuan: () => this.changeDialect('sichuan'),
            dialectShanghai: () => this.changeDialect('shanghai'),
            dialectMinnan: () => this.changeDialect('minnan'),
            dialectNortheast: () => this.changeDialect('northeast'),
            dialectWu: () => this.changeDialect('wu'),
            dialectHakka: () => this.changeDialect('hakka')
        };
        
        let matchedCommand = this.findBestMatch(normalizedCmd, commands, commandMap);
        
        if (!matchedCommand) {
            matchedCommand = this.findBestMatchByPinyin(normalizedCmd, commands, commandMap);
        }
        
        if (matchedCommand) {
            try {
                commandMap[matchedCommand]();
                return true;
            } catch (e) {
                console.error('Command execution error:', e);
                return false;
            }
        }
        
        return false;
    }
    
    findBestMatch(command, commands, commandMap) {
        let bestMatch = null;
        let bestScore = 0;
        let exactMatch = null;
        
        for (const [cmdKey, cmdValues] of Object.entries(commands)) {
            if (!Array.isArray(cmdValues) || !commandMap[cmdKey]) continue;
            
            for (const cmd of cmdValues) {
                const normalizedCmd = cmd.toLowerCase();
                
                if (command === normalizedCmd) {
                    exactMatch = cmdKey;
                    break;
                }
                
                const score = this.calculateSimilarity(command, normalizedCmd);
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = cmdKey;
                }
            }
            
            if (exactMatch) break;
        }
        
        if (exactMatch) return exactMatch;
        
        if (bestScore >= 0.7) {
            return bestMatch;
        }
        
        return null;
    }
    
    calculateSimilarity(str1, str2) {
        const len1 = str1.length;
        const len2 = str2.length;
        const maxLen = Math.max(len1, len2);
        
        if (maxLen === 0) return 1;
        
        const commonChars = this.countCommonChars(str1, str2);
        const exactMatches = this.countExactMatches(str1, str2);
        
        const charScore = commonChars / maxLen;
        const exactScore = exactMatches / maxLen;
        
        return (charScore + exactScore) / 2;
    }
    
    countCommonChars(str1, str2) {
        let count = 0;
        for (const char of str1) {
            if (str2.includes(char)) {
                count++;
            }
        }
        return count;
    }
    
    countExactMatches(str1, str2) {
        let count = 0;
        const minLen = Math.min(str1.length, str2.length);
        for (let i = 0; i < minLen; i++) {
            if (str1[i] === str2[i]) {
                count++;
            }
        }
        return count;
    }
    
    // 智能命令修正
    smartCorrectCommand(command) {
        const corrections = {
            '花园': '画圆',
            '画远': '画圆',
            '画方': '画正方形',
            '画长': '画长方形',
            '画三': '画三角形',
            '画直': '画直线',
            '画心': '画心形',
            '话圆': '画圆',
            '话方': '画正方形',
            '话三': '画三角形',
            '话直': '画直线',
            '换圆': '画圆',
            '换方': '画正方形',
            '撒销': '撤销',
            '撤消': '撤销',
            '澈销': '撤销',
            '请空': '清空',
            '清孔': '清空',
            '青空': '清空',
            '保寸': '保存',
            '宝存': '保存',
            '正弦': '画正弦',
            '余弦': '画余弦',
            '正切': '画正切',
            '抛线': '抛物线',
            '抛弧线': '抛物线',
            '做图': '画图',
            '绘图': '画图',
            '图画': '画图'
        };
        
        for (const [wrong, correct] of Object.entries(corrections)) {
            if (command.includes(wrong)) {
                return command.replace(wrong, correct);
            }
        }
        
        return command;
    }
    
    // 上下文感知
    updateContext(command, action) {
        this.contextHistory.push({
            command: command,
            action: action,
            timestamp: Date.now()
        });
        
        if (this.contextHistory.length > this.maxContextHistory) {
            this.contextHistory.shift();
        }
        
        this.updateCommandFrequency(command);
    }
    
    updateCommandFrequency(command) {
        if (this.commandFrequency[command]) {
            this.commandFrequency[command]++;
        } else {
            this.commandFrequency[command] = 1;
        }
    }
    
    getContextualSuggestion() {
        const recentCommands = this.contextHistory.slice(-3).map(c => c.action);
        
        if (recentCommands.includes('drawCircle') && !recentCommands.includes('drawSquare')) {
            return '💡 您可以说"画正方形"来继续绘制';
        }
        
        if (recentCommands.includes('drawSquare') && !recentCommands.includes('drawTriangle')) {
            return '💡 试试说"画三角形"';
        }
        
        if (recentCommands.includes('drawSin') || recentCommands.includes('drawCos')) {
            return '💡 您可以说"画坐标系"来添加参考网格';
        }
        
        if (recentCommands.includes('setColor') && !recentCommands.includes('setSize')) {
            return '💡 可以说"粗细5"来调整笔刷大小';
        }
        
        return null;
    }
    
    // 智能分析用户意图
    smartAnalyzeCommand(command) {
        const normalized = command.toLowerCase();
        
        // 检测连续绘制意图
        if (normalized.includes('再') || normalized.includes('继续') || normalized.includes('还')) {
            const recentAction = this.getRecentAction();
            if (recentAction) {
                return { action: recentAction, repeat: true };
            }
        }
        
        // 检测组合命令
        if (normalized.includes('和') || normalized.includes('与') || normalized.includes('还有')) {
            const parts = normalized.split(/和|与|还有/);
            if (parts.length > 1) {
                return { action: 'multiple', commands: parts };
            }
        }
        
        // 检测修饰词
        let modifier = null;
        if (normalized.includes('大')) modifier = 'large';
        else if (normalized.includes('小')) modifier = 'small';
        else if (normalized.includes('红色')) modifier = 'red';
        else if (normalized.includes('蓝色')) modifier = 'blue';
        
        return { action: null, modifier };
    }
    
    getRecentAction() {
        for (let i = this.contextHistory.length - 1; i >= 0; i--) {
            const action = this.contextHistory[i].action;
            if (action && action.startsWith('draw')) {
                return action;
            }
        }
        return null;
    }
    
    // 学习用户偏好
    learnUserPreferences() {
        if (this.commandHistory.length < 10) return;
        
        const colorCount = {};
        const toolCount = {};
        
        for (const cmd of this.commandHistory) {
            if (cmd.action === 'setColor') {
                colorCount[cmd.data] = (colorCount[cmd.data] || 0) + 1;
            } else if (cmd.action === 'setTool') {
                toolCount[cmd.data] = (toolCount[cmd.data] || 0) + 1;
            }
        }
        
        if (Object.keys(colorCount).length > 0) {
            const favoriteColor = Object.keys(colorCount).reduce((a, b) => 
                colorCount[a] > colorCount[b] ? a : b
            );
            this.userPreferences.favoriteColor = favoriteColor;
        }
        
        if (Object.keys(toolCount).length > 0) {
            const favoriteTool = Object.keys(toolCount).reduce((a, b) => 
                toolCount[a] > toolCount[b] ? a : b
            );
            this.userPreferences.favoriteTool = favoriteTool;
        }
        
        this.saveUserPreferences();
    }
    
    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('voiceDrawingPreferences');
            return saved ? JSON.parse(saved) : {
                favoriteColor: '#333333',
                favoriteTool: 'brush',
                preferredDialect: 'mandarin',
                voiceActivationEnabled: true
            };
        } catch (e) {
            return {
                favoriteColor: '#333333',
                favoriteTool: 'brush',
                preferredDialect: 'mandarin',
                voiceActivationEnabled: true
            };
        }
    }
    
    saveUserPreferences() {
        try {
            localStorage.setItem('voiceDrawingPreferences', JSON.stringify(this.userPreferences));
        } catch (e) {
            console.error('保存用户偏好失败:', e);
        }
    }
    
    // 智能提示
    getSmartTip() {
        const tips = [
            '💡 试试说"画圆和正方形"来同时绘制多个图形',
            '💡 说"再画一个"可以重复上一次的绘制',
            '💡 说"红色的圆"可以指定颜色',
            '💡 说"大一点的圆"可以调整大小',
            '💡 说"sin30度"可以计算三角函数值',
            '💡 说"画坐标系"可以添加坐标轴参考'
        ];
        
        const randomIndex = Math.floor(Math.random() * tips.length);
        return tips[randomIndex];
    }
    
    tryChangeColor(command, colors) {
        let bestMatch = null;
        let bestScore = 0;
        
        for (const [colorName, colorValue] of Object.entries(colors)) {
            const normalizedColor = colorName.toLowerCase();
            
            if (command.includes(normalizedColor)) {
                this.setColor(colorValue, colorName);
                return true;
            }
            
            const score = this.calculateSimilarity(command, normalizedColor);
            if (score > bestScore && score >= 0.6) {
                bestScore = score;
                bestMatch = { name: colorName, value: colorValue };
            }
        }
        
        if (bestMatch) {
            this.setColor(bestMatch.value, bestMatch.name);
            return true;
        }
        
        return false;
    }
    
    tryChangeSize(command) {
        const numberMatch = command.match(/(\d+)/);
        if (numberMatch) {
            const size = parseInt(numberMatch[1]);
            if (size > 0 && size <= 100) {
                this.setSize(size);
                return true;
            }
        }
        
        const sizeWords = {
            '很小': 2, '小': 3, '细': 3, '细一点': 4,
            '中等': 8, '中': 8, '一般': 8,
            '大': 15, '粗': 15, '粗一点': 12,
            '很大': 25, '非常粗': 30, '最粗': 40
        };
        
        for (const [word, size] of Object.entries(sizeWords)) {
            if (command.includes(word)) {
                this.setSize(size);
                return true;
            }
        }
        
        const increasePatterns = ['加', '增', '变粗', '粗一点', '大一点'];
        for (const pattern of increasePatterns) {
            if (command.includes(pattern)) {
                const newSize = Math.min(this.currentSize + 3, 50);
                this.setSize(newSize);
                return true;
            }
        }
        
        const decreasePatterns = ['减', '少', '变细', '细一点', '小一点'];
        for (const pattern of decreasePatterns) {
            if (command.includes(pattern)) {
                const newSize = Math.max(this.currentSize - 3, 1);
                this.setSize(newSize);
                return true;
            }
        }
        
        return false;
    }
    
    setTool(tool) {
        this.currentTool = tool;
        
        const toolNames = {
            brush: '画笔工具',
            eraser: '橡皮擦工具',
            text: '文字工具',
            select: '选择工具',
            move: '移动工具',
            rotate: '旋转工具',
            scale: '缩放工具'
        };
        
        if (this.currentToolDiv) {
            this.currentToolDiv.textContent = toolNames[tool] || tool;
        }
        
        if (tool === 'eraser') {
            this.ctx.strokeStyle = '#FFFFFF';
            this.offscreenCtx.strokeStyle = '#FFFFFF';
        } else {
            this.ctx.strokeStyle = this.currentColor;
            this.offscreenCtx.strokeStyle = this.currentColor;
        }
        
        this.fillMode = false;
        this.gradientMode = false;
        
        this.speak(this.getFeedback(tool));
    }
    
    setFillMode(enabled) {
        this.fillMode = enabled;
        this.gradientMode = false;
        this.updateModeDisplay();
        this.speak(this.getFeedback('fill'));
    }
    
    setGradientMode(enabled) {
        this.gradientMode = enabled;
        this.fillMode = false;
        this.updateModeDisplay();
        this.speak(this.getFeedback('gradient'));
    }
    
    setMode(mode) {
        this.fillMode = mode === 'fill';
        this.gradientMode = mode === 'gradient';
        this.updateModeDisplay();
        
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`.mode-btn[onclick*="${mode}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        if (mode === 'fill') {
            this.speak(this.getFeedback('fill'));
        } else if (mode === 'gradient') {
            this.speak(this.getFeedback('gradient'));
        } else {
            this.speak('已切换到描边模式');
        }
    }
    
    updateModeDisplay() {
        if (!this.modeValue) return;
        if (this.fillMode) {
            this.modeValue.textContent = '填充模式';
        } else if (this.gradientMode) {
            this.modeValue.textContent = '渐变模式';
        } else {
            this.modeValue.textContent = '描边模式';
        }
    }
    
    setColor(color, name) {
        this.currentColor = color;
        this.ctx.strokeStyle = color;
        this.offscreenCtx.strokeStyle = color;
        
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        const selectedBtn = document.querySelector(`.color-btn[style*="${color}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }
        
        this.speak(this.getFeedback('color', { color: name }));
    }
    
    setSize(size) {
        this.currentSize = size;
        this.ctx.lineWidth = size;
        this.offscreenCtx.lineWidth = size;
        if (this.sizeValue) {
            this.sizeValue.textContent = `${size}px`;
        }
        if (this.sizeDisplay) {
            this.sizeDisplay.textContent = size;
        }
        this.speak(this.getFeedback('size', { size }));
    }
    
    saveState() {
        const imageData = this.offscreenCtx.getImageData(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
        this.drawingHistory = this.drawingHistory.slice(0, this.historyIndex + 1);
        this.drawingHistory.push(imageData);
        this.historyIndex++;
        
        if (this.drawingHistory.length > 50) {
            this.drawingHistory.shift();
            this.historyIndex--;
        }
    }
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const imageData = this.drawingHistory[this.historyIndex];
            this.offscreenCtx.putImageData(imageData, 0, 0);
            this.copyOffscreenToMain();
            this.speak(this.getFeedback('undo'));
        } else {
            this.speak(this.getFeedback('noUndo'));
        }
    }
    
    redo() {
        if (this.historyIndex < this.drawingHistory.length - 1) {
            this.historyIndex++;
            const imageData = this.drawingHistory[this.historyIndex];
            this.offscreenCtx.putImageData(imageData, 0, 0);
            this.copyOffscreenToMain();
            this.speak(this.getFeedback('redo'));
        } else {
            this.speak(this.getFeedback('noRedo'));
        }
    }
    
    clearCanvas() {
        this.saveState();
        const ctx = this.offscreenCtx;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
        this.copyOffscreenToMain();
        this.speak(this.getFeedback('clear'));
    }
    
    drawCircle() {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.2;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.drawShape();
        
        this.speak(this.getFeedback('circle'));
    }
    
    drawSquare() {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const size = Math.min(this.canvas.width, this.canvas.height) * 0.3;
        
        ctx.beginPath();
        ctx.rect(centerX - size / 2, centerY - size / 2, size, size);
        this.drawShape();
        
        this.speak(this.getFeedback('square'));
    }
    
    drawRectangle() {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const width = this.canvas.width * 0.4;
        const height = this.canvas.height * 0.2;
        
        ctx.beginPath();
        ctx.rect(centerX - width / 2, centerY - height / 2, width, height);
        this.drawShape();
        
        this.speak(this.getFeedback('rectangle'));
    }
    
    drawLine() {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        ctx.beginPath();
        ctx.moveTo(this.canvas.width * 0.2, this.canvas.height * 0.5);
        ctx.lineTo(this.canvas.width * 0.8, this.canvas.height * 0.5);
        ctx.stroke();
        this.copyOffscreenToMain();
        
        this.speak(this.getFeedback('line'));
    }
    
    drawTriangle() {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const size = Math.min(this.canvas.width, this.canvas.height) * 0.25;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size);
        ctx.lineTo(centerX - size, centerY + size);
        ctx.lineTo(centerX + size, centerY + size);
        ctx.closePath();
        this.drawShape();
        
        this.speak(this.getFeedback('triangle'));
    }
    
    drawEllipse() {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radiusX = this.canvas.width * 0.25;
        const radiusY = this.canvas.height * 0.15;
        
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        this.drawShape();
        
        this.speak(this.getFeedback('ellipse'));
    }
    
    drawDiamond() {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const size = Math.min(this.canvas.width, this.canvas.height) * 0.2;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size);
        ctx.lineTo(centerX + size, centerY);
        ctx.lineTo(centerX, centerY + size);
        ctx.lineTo(centerX - size, centerY);
        ctx.closePath();
        this.drawShape();
        
        this.speak(this.getFeedback('diamond'));
    }
    
    drawStar() {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const outerRadius = Math.min(this.canvas.width, this.canvas.height) * 0.18;
        const innerRadius = outerRadius * 0.5;
        
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const x = centerX + Math.cos(angle) * outerRadius;
            const y = centerY + Math.sin(angle) * outerRadius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            const innerAngle = angle + Math.PI / 5;
            const innerX = centerX + Math.cos(innerAngle) * innerRadius;
            const innerY = centerY + Math.sin(innerAngle) * innerRadius;
            ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        this.drawShape();
        
        this.speak(this.getFeedback('star'));
    }
    
    drawPolygon() {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.2;
        const sides = 6;
        
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        this.drawShape();
        
        this.speak(this.getFeedback('polygon'));
    }
    
    drawArc() {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.2;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, 0);
        ctx.stroke();
        this.copyOffscreenToMain();
        
        this.speak(this.getFeedback('arc'));
    }
    
    drawCurve() {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const startX = this.canvas.width * 0.2;
        const endX = this.canvas.width * 0.8;
        const centerY = this.canvas.height * 0.5;
        const amplitude = this.canvas.height * 0.15;
        
        ctx.beginPath();
        ctx.moveTo(startX, centerY);
        
        const points = 50;
        for (let i = 1; i <= points; i++) {
            const t = i / points;
            const x = startX + (endX - startX) * t;
            const y = centerY + Math.sin(t * Math.PI * 3) * amplitude;
            ctx.lineTo(x, y);
        }
        
        ctx.stroke();
        this.copyOffscreenToMain();
        
        this.speak(this.getFeedback('curve'));
    }
    
    drawShape() {
        const ctx = this.offscreenCtx;
        
        if (this.fillMode) {
            ctx.fillStyle = this.currentColor;
            ctx.fill();
        }
        if (this.gradientMode) {
            const gradientKey = this.currentColor;
            if (!this.cachedGradients[gradientKey]) {
                const gradient = ctx.createLinearGradient(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
                gradient.addColorStop(0, this.currentColor);
                gradient.addColorStop(1, this.getComplementaryColor(this.currentColor));
                this.cachedGradients[gradientKey] = gradient;
            }
            ctx.fillStyle = this.cachedGradients[gradientKey];
            ctx.fill();
        }
        ctx.stroke();
        this.copyOffscreenToMain();
    }
    
    getComplementaryColor(color) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const cr = (255 - r).toString(16).padStart(2, '0');
        const cg = (255 - g).toString(16).padStart(2, '0');
        const cb = (255 - b).toString(16).padStart(2, '0');
        
        return `#${cr}${cg}${cb}`;
    }
    
    drawGrid() {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        ctx.strokeStyle = '#DDD';
        ctx.lineWidth = 1;
        
        const gridSize = 40;
        
        for (let x = centerX % gridSize; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        for (let y = centerY % gridSize; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, height);
        ctx.stroke();
        
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.fillText('0', centerX + 5, centerY + 20);
        ctx.fillText('X', width - 20, centerY + 20);
        ctx.fillText('Y', centerX + 5, 20);
        
        ctx.strokeStyle = this.currentColor;
        ctx.lineWidth = this.currentSize;
        
        this.copyOffscreenToMain();
        this.speak(this.getFeedback('grid'));
    }
    
    // 坐标转换公共方法
    getMathCoordinateParams() {
        return {
            centerX: this.canvas.width / 2,
            centerY: this.canvas.height / 2,
            scaleX: 50,  // 数学坐标单位对应的像素数
            scaleY: 50,
            width: this.canvas.width,
            height: this.canvas.height
        };
    }
    
    // 数学坐标转画布坐标
    mathToCanvas(x, y, params) {
        const { centerX, centerY, scaleX, scaleY } = params || this.getMathCoordinateParams();
        return {
            px: centerX + x * scaleX,
            py: centerY - y * scaleY  // y轴向上为正
        };
    }
    
    // 画布坐标转数学坐标
    canvasToMath(px, py, params) {
        const { centerX, centerY, scaleX, scaleY } = params || this.getMathCoordinateParams();
        return {
            x: (px - centerX) / scaleX,
            y: (centerY - py) / scaleY
        };
    }
    
    // 极坐标转画布坐标
    polarToCanvas(r, theta, params) {
        const { centerX, centerY, scaleX, scaleY } = params || this.getMathCoordinateParams();
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        return this.mathToCanvas(x, y, params);
    }
    
    // 检查坐标是否在画布范围内
    isInCanvasBounds(px, py, margin = 100) {
        const { width, height } = this.getMathCoordinateParams();
        return px >= -margin && px <= width + margin && py >= -margin && py <= height + margin;
    }
    
    // 绘制函数曲线的通用方法
    drawFunctionCurve(fn, options = {}) {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const params = this.getMathCoordinateParams();
        const { centerX, centerY, scaleX, scaleY, width, height } = params;
        
        const {
            xMin = -width / scaleX / 2,
            xMax = width / scaleX / 2,
            step = 1 / scaleX,  // 每像素一个采样点
            skipNaN = true,
            skipInfinity = true,
            maxAbsY = 10,  // y值绝对值超过此值时跳过
            lineWidth = this.currentSize,
            strokeColor = this.currentColor
        } = options;
        
        ctx.beginPath();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        
        let started = false;
        let validPoints = 0;
        
        for (let px = 0; px < width; px++) {
            const x = (px - centerX) / scaleX;
            let y;
            
            try {
                y = fn(x);
            } catch (e) {
                if (skipNaN) {
                    started = false;
                    continue;
                }
            }
            
            // 处理无效值
            if (skipNaN && (isNaN(y) || y === null)) {
                started = false;
                continue;
            }
            
            if (skipInfinity && !isFinite(y)) {
                started = false;
                continue;
            }
            
            // 处理过大值
            if (Math.abs(y) > maxAbsY) {
                started = false;
                continue;
            }
            
            const py = centerY - y * scaleY;
            
            // 检查是否在画布范围内
            if (!this.isInCanvasBounds(px, py)) {
                started = false;
                continue;
            }
            
            validPoints++;
            
            if (!started) {
                ctx.moveTo(px, py);
                started = true;
            } else {
                ctx.lineTo(px, py);
            }
        }
        
        ctx.stroke();
        this.copyOffscreenToMain();
        
        return validPoints;
    }
    
    drawFunction(type) {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const params = this.getMathCoordinateParams();
        const { centerX, centerY, scaleX, scaleY, width, height } = params;
        
        ctx.beginPath();
        let started = false;
        
        for (let px = 0; px < width; px++) {
            const x = (px - centerX) / scaleX;
            let y = 0;
            
            switch (type) {
                case 'sin':
                    y = Math.sin(x * Math.PI);
                    break;
                case 'cos':
                    y = Math.cos(x * Math.PI);
                    break;
                case 'tan':
                    y = Math.tan(x);
                    if (Math.abs(y) > 10) continue;
                    break;
                case 'parabola':
                    y = x * x / 4;
                    break;
                case 'exponential':
                    y = Math.exp(x) / 5;
                    if (y > height / scaleY) continue;
                    break;
                case 'log':
                    if (x <= 0) continue;
                    y = Math.log(x) * 2;
                    break;
                case 'abs':
                    y = Math.abs(x) / 3;
                    break;
                case 'csc':
                    if (Math.sin(x * Math.PI) === 0) continue;
                    y = 1 / Math.sin(x * Math.PI);
                    if (Math.abs(y) > 10) continue;
                    break;
                case 'sec':
                    if (Math.cos(x * Math.PI) === 0) continue;
                    y = 1 / Math.cos(x * Math.PI);
                    if (Math.abs(y) > 10) continue;
                    break;
                case 'cot':
                    if (Math.tan(x) === 0) continue;
                    y = 1 / Math.tan(x);
                    if (Math.abs(y) > 10) continue;
                    break;
                case 'sinh':
                    y = Math.sinh(x);
                    break;
                case 'cosh':
                    y = Math.cosh(x) / 3;
                    break;
                case 'tanh':
                    y = Math.tanh(x);
                    break;
                case 'sqrt':
                    if (x < 0) continue;
                    y = Math.sqrt(x);
                    break;
                case 'cube':
                    y = Math.pow(x, 3) / 8;
                    break;
                case 'reciprocal':
                    if (x === 0) continue;
                    y = 1 / x;
                    if (Math.abs(y) > 10) continue;
                    break;
                // 反三角函数
                case 'asin':
                    if (x < -1 || x > 1) continue;
                    y = Math.asin(x);
                    break;
                case 'acos':
                    if (x < -1 || x > 1) continue;
                    y = Math.acos(x);
                    break;
                case 'atan':
                    y = Math.atan(x);
                    break;
                case 'acsc':
                    if (Math.abs(x) < 1) continue;
                    y = Math.asin(1 / x);
                    break;
                case 'asec':
                    if (Math.abs(x) < 1) continue;
                    y = Math.acos(1 / x);
                    break;
                case 'acot':
                    y = Math.atan(1 / x);
                    break;
                // 高次幂函数
                case 'quartic':
                    y = Math.pow(x, 4) / 16;
                    break;
                case 'quintic':
                    y = Math.pow(x, 5) / 32;
                    break;
                case 'sextic':
                    y = Math.pow(x, 6) / 64;
                    break;
            }
            
            const py = centerY - y * scaleY;
            
            if (py < -100 || py > height + 100) {
                started = false;
                continue;
            }
            
            if (!started) {
                ctx.moveTo(px, py);
                started = true;
            } else {
                ctx.lineTo(px, py);
            }
        }
        
        ctx.stroke();
        this.copyOffscreenToMain();
        
        this.speak(this.getFeedback(type));
    }
    
    // AI自然语言语义绘图
    analyzeNaturalLanguageDrawing(command) {
        const normalized = command.toLowerCase();
        
        // 检测组合绘图指令
        const combinationPatterns = [
            /画一个(.+)放在(.+)/,
            /画(.+)和(.+)/,
            /画(.+)再画(.+)/,
            /先画(.+)然后画(.+)/,
            /在(.+)画(.+)/,
            /画(.+)在(.+)/,
            /画两条(.+)/,
            /画三个(.+)/,
            /画多个(.+)/
        ];
        
        for (const pattern of combinationPatterns) {
            const match = normalized.match(pattern);
            if (match) {
                this.executeCombinationDrawing(match, normalized);
                return true;
            }
        }
        
        // 检测带属性的绘图指令
        const attributePatterns = [
            /画一个(.+)的(.+)/,
            /画(.+)的(.+)/,
            /画(.+)(圆|正方形|三角形|心形|星星)/,
            /(红色|蓝色|绿色|黄色|紫色|橙色|粉色|黑色|白色)(.+)/
        ];
        
        for (const pattern of attributePatterns) {
            const match = normalized.match(pattern);
            if (match) {
                this.executeAttributeDrawing(match, normalized);
                return true;
            }
        }
        
        // 检测位置指令
        const positionKeywords = {
            '左上角': { x: 0.25, y: 0.25 },
            '右上角': { x: 0.75, y: 0.25 },
            '左下角': { x: 0.25, y: 0.75 },
            '右下角': { x: 0.75, y: 0.75 },
            '中间': { x: 0.5, y: 0.5 },
            '左边': { x: 0.25, y: 0.5 },
            '右边': { x: 0.75, y: 0.5 },
            '上面': { x: 0.5, y: 0.25 },
            '下面': { x: 0.5, y: 0.75 },
            '左': { x: 0.25, y: 0.5 },
            '右': { x: 0.75, y: 0.5 },
            '上': { x: 0.5, y: 0.25 },
            '下': { x: 0.5, y: 0.75 }
        };
        
        for (const [keyword, position] of Object.entries(positionKeywords)) {
            if (normalized.includes(keyword)) {
                this.currentShapePosition = position;
                this.addChatMessage(`📍 已设置绘制位置: ${keyword}`, 'system');
            }
        }
        
        // 检测大小指令
        const sizeKeywords = {
            '大的': 150,
            '大': 150,
            '小': 60,
            '小的': 60,
            '中等': 100,
            '超大': 200,
            '很小': 40
        };
        
        for (const [keyword, size] of Object.entries(sizeKeywords)) {
            if (normalized.includes(keyword)) {
                this.currentShapeSize = size;
                this.addChatMessage(`📐 已设置绘制大小: ${keyword}`, 'system');
            }
        }
        
        return false;
    }
    
    executeCombinationDrawing(match, command) {
        this.addChatMessage('🎨 AI正在解析组合绘图指令...', 'system');
        
        const parts = match.slice(1).filter(p => p);
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i].trim();
            setTimeout(() => {
                this.executeDrawingFromDescription(part, command);
            }, i * 600);
        }
        
        this.speak(`正在为您绘制${parts.length}个图形`);
    }
    
    executeAttributeDrawing(match, command) {
        this.addChatMessage('🎨 AI正在解析带属性的绘图指令...', 'system');
        
        const parts = match.slice(1).filter(p => p);
        
        // 解析颜色
        const colorMap = {
            '红色': '#FF0000', '红': '#FF0000',
            '蓝色': '#0000FF', '蓝': '#0000FF',
            '绿色': '#00FF00', '绿': '#00FF00',
            '黄色': '#FFFF00', '黄': '#FFFF00',
            '紫色': '#800080', '紫': '#800080',
            '橙色': '#FFA500', '橙': '#FFA500',
            '粉色': '#FFC0CB', '粉': '#FFC0CB',
            '黑色': '#000000', '黑': '#000000',
            '白色': '#FFFFFF', '白': '#FFFFFF'
        };
        
        for (const [colorName, colorValue] of Object.entries(colorMap)) {
            if (command.includes(colorName)) {
                this.currentColor = colorValue;
                this.addChatMessage(`🎨 已设置颜色: ${colorName}`, 'system');
            }
        }
        
        // 解析图形
        const shapeMap = {
            '圆': 'drawCircle', '圆形': 'drawCircle', '圆圈': 'drawCircle',
            '正方形': 'drawSquare', '方形': 'drawSquare', '方块': 'drawSquare',
            '三角形': 'drawTriangle', '三角': 'drawTriangle',
            '心形': 'drawHeart', '爱心': 'drawHeart', '心': 'drawHeart',
            '直线': 'drawLine', '线': 'drawLine',
            '正弦': 'drawSin', '正弦曲线': 'drawSin',
            '余弦': 'drawCos', '余弦曲线': 'drawCos',
            '抛物线': 'drawParabola'
        };
        
        for (const [shapeName, shapeMethod] of Object.entries(shapeMap)) {
            if (command.includes(shapeName)) {
                this[shapeMethod]();
                return;
            }
        }
        
        // 如果没有识别到具体图形，尝试简笔画生成
        this.generateSimpleDrawing(command);
    }
    
    executeDrawingFromDescription(description, fullCommand) {
        // 解析颜色
        const colorMap = {
            '红色': '#FF0000', '红': '#FF0000',
            '蓝色': '#0000FF', '蓝': '#0000FF',
            '绿色': '#00FF00', '绿': '#00FF00',
            '黄色': '#FFFF00', '黄': '#FFFF00',
            '紫色': '#800080', '紫': '#800080',
            '橙色': '#FFA500', '橙': '#FFA500',
            '粉色': '#FFC0CB', '粉': '#FFC0CB'
        };
        
        for (const [colorName, colorValue] of Object.entries(colorMap)) {
            if (description.includes(colorName)) {
                this.currentColor = colorValue;
            }
        }
        
        // 解析图形
        const shapeMap = {
            '圆': () => this.drawCircle(),
            '圆形': () => this.drawCircle(),
            '正方形': () => this.drawSquare(),
            '三角形': () => this.drawTriangle(),
            '心形': () => this.drawHeart(),
            '爱心': () => this.drawHeart(),
            '星星': () => this.drawStar(),
            '五边形': () => this.drawPentagon(),
            '六边形': () => this.drawHexagon(),
            '正弦': () => this.drawFunction('sin'),
            '余弦': () => this.drawFunction('cos'),
            '抛物线': () => this.drawFunction('parabola')
        };
        
        for (const [shapeName, shapeMethod] of Object.entries(shapeMap)) {
            if (description.includes(shapeName)) {
                shapeMethod();
                return;
            }
        }
        
        // 尝试简笔画生成
        this.generateSimpleDrawing(description);
    }
    
    // AI简笔画生成
    generateSimpleDrawing(description) {
        this.saveState();
        const ctx = this.offscreenCtx;
        
        const normalized = description.toLowerCase();
        
        // 简笔画模板库
        const drawingTemplates = {
            '房子': this.drawHouse.bind(this),
            '小房子': this.drawHouse.bind(this),
            '花朵': this.drawFlower.bind(this),
            '花': this.drawFlower.bind(this),
            '小花朵': this.drawFlower.bind(this),
            '太阳': this.drawSun.bind(this),
            '小太阳': this.drawSun.bind(this),
            '月亮': this.drawMoon.bind(this),
            '星星': this.drawStar.bind(this),
            '小星星': this.drawStar.bind(this),
            '树': this.drawTree.bind(this),
            '小树': this.drawTree.bind(this),
            '大树': this.drawTree.bind(this),
            '云': this.drawCloud.bind(this),
            '云朵': this.drawCloud.bind(this),
            '小鸟': this.drawBird.bind(this),
            '鸟': this.drawBird.bind(this),
            '小猫': this.drawCat.bind(this),
            '猫': this.drawCat.bind(this),
            '小狗': this.drawDog.bind(this),
            '狗': this.drawDog.bind(this),
            '鱼': this.drawFish.bind(this),
            '小鱼': this.drawFish.bind(this),
            '蝴蝶': this.drawButterfly.bind(this),
            '小蝴蝶': this.drawButterfly.bind(this),
            '笑脸': this.drawSmiley.bind(this),
            '笑脸表情': this.drawSmiley.bind(this),
            '汽车': this.drawCar.bind(this),
            '小车': this.drawCar.bind(this),
            '飞机': this.drawPlane.bind(this),
            '小飞机': this.drawPlane.bind(this),
            '船': this.drawBoat.bind(this),
            '小船': this.drawBoat.bind(this),
            '山': this.drawMountain.bind(this),
            '大山': this.drawMountain.bind(this),
            '苹果': this.drawApple.bind(this),
            '小苹果': this.drawApple.bind(this)
        };
        
        for (const [keyword, drawMethod] of Object.entries(drawingTemplates)) {
            if (normalized.includes(keyword)) {
                drawMethod();
                this.speak(`已为您绘制${keyword}`);
                this.addChatMessage(`🎨 AI已生成简笔画: ${keyword}`, 'system');
                return true;
            }
        }
        
        return false;
    }
    
    // 简笔画绘制方法
    drawHouse() {
        this.saveState();
        const ctx = this.offscreenCtx;
        const params = this.getMathCoordinateParams();
        const { centerX, centerY } = params;
        const size = this.currentShapeSize;
        
        ctx.strokeStyle = this.currentColor;
        ctx.lineWidth = this.currentSize;
        ctx.fillStyle = this.currentColor;
        
        // 房子主体
        ctx.beginPath();
        ctx.rect(centerX - size/2, centerY - size/4, size, size/2);
        if (this.fillMode) ctx.fill();
        ctx.stroke();
        
        // 屋顶
        ctx.beginPath();
        ctx.moveTo(centerX - size/2 - 10, centerY - size/4);
        ctx.lineTo(centerX, centerY - size/4 - size/2);
        ctx.lineTo(centerX + size/2 + 10, centerY - size/4);
        ctx.closePath();
        if (this.fillMode) ctx.fill();
        ctx.stroke();
        
        // 门
        ctx.beginPath();
        ctx.rect(centerX - size/6, centerY + size/4 - size/4, size/3, size/4);
        ctx.stroke();
        
        // 窗户
        ctx.beginPath();
        ctx.rect(centerX - size/2 + 10, centerY - size/4 + 10, size/4, size/4);
        ctx.stroke();
        
        this.copyOffscreenToMain();
    }
    
    drawFlower() {
        this.saveState();
        const ctx = this.offscreenCtx;
        const params = this.getMathCoordinateParams();
        const { centerX, centerY } = params;
        const size = this.currentShapeSize;
        
        ctx.strokeStyle = this.currentColor;
        ctx.lineWidth = this.currentSize;
        
        // 花瓣
        const petalCount = 6;
        for (let i = 0; i < petalCount; i++) {
            const angle = (i * Math.PI * 2) / petalCount;
            ctx.beginPath();
            ctx.ellipse(
                centerX + Math.cos(angle) * size/3,
                centerY - size/2 + Math.sin(angle) * size/3,
                size/4, size/6,
                angle, 0, Math.PI * 2
            );
            if (this.fillMode) {
                ctx.fillStyle = this.currentColor;
                ctx.fill();
            }
            ctx.stroke();
        }
        
        // 花心
        ctx.beginPath();
        ctx.arc(centerX, centerY - size/2, size/6, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD700';
        ctx.fill();
        ctx.stroke();
        
        // 茎
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size/2 + size/6);
        ctx.lineTo(centerX, centerY + size/2);
        ctx.stroke();
        
        // 叶子
        ctx.beginPath();
        ctx.ellipse(centerX - size/4, centerY + size/4, size/6, size/8, -Math.PI/4, 0, Math.PI * 2);
        ctx.stroke();
        
        this.copyOffscreenToMain();
    }
    
    drawSun() {
        this.saveState();
        const ctx = this.offscreenCtx;
        const params = this.getMathCoordinateParams();
        const { centerX, centerY } = params;
        const size = this.currentShapeSize;
        
        // 太阳中心
        ctx.beginPath();
        ctx.arc(centerX, centerY - size/2, size/3, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD700';
        ctx.fill();
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = this.currentSize;
        ctx.stroke();
        
        // 光线
        const rayCount = 8;
        for (let i = 0; i < rayCount; i++) {
            const angle = (i * Math.PI * 2) / rayCount;
            ctx.beginPath();
            ctx.moveTo(
                centerX + Math.cos(angle) * (size/3 + 5),
                centerY - size/2 + Math.sin(angle) * (size/3 + 5)
            );
            ctx.lineTo(
                centerX + Math.cos(angle) * (size/2 + 10),
                centerY - size/2 + Math.sin(angle) * (size/2 + 10)
            );
            ctx.stroke();
        }
        
        this.copyOffscreenToMain();
    }
    
    drawMoon() {
        this.saveState();
        const ctx = this.offscreenCtx;
        const params = this.getMathCoordinateParams();
        const { centerX, centerY } = params;
        const size = this.currentShapeSize;
        
        ctx.strokeStyle = this.currentColor;
        ctx.lineWidth = this.currentSize;
        ctx.fillStyle = '#F0F0F0';
        
        // 月亮主体
        ctx.beginPath();
        ctx.arc(centerX, centerY - size/2, size/2, 0, Math.PI * 2);
        ctx.fill();
        
        // 月亮阴影部分
        ctx.beginPath();
        ctx.arc(centerX + size/4, centerY - size/2, size/2.5, 0, Math.PI * 2);
        ctx.fillStyle = this.fillMode ? this.currentColor : '#FFFFFF';
        ctx.fill();
        
        this.copyOffscreenToMain();
    }
    
    drawStar() {
        this.saveState();
        const ctx = this.offscreenCtx;
        const params = this.getMathCoordinateParams();
        const { centerX, centerY } = params;
        const size = this.currentShapeSize;
        
        ctx.strokeStyle = this.currentColor;
        ctx.lineWidth = this.currentSize;
        ctx.fillStyle = this.currentColor;
        
        const spikes = 5;
        const outerRadius = size;
        const innerRadius = size/2;
        
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes - Math.PI/2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY - size/2 + Math.sin(angle) * radius;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        
        if (this.fillMode) ctx.fill();
        ctx.stroke();
        
        this.copyOffscreenToMain();
    }
    
    drawTree() {
        this.saveState();
        const ctx = this.offscreenCtx;
        const params = this.getMathCoordinateParams();
        const { centerX, centerY } = params;
        const size = this.currentShapeSize;
        
        ctx.strokeStyle = this.currentColor;
        ctx.lineWidth = this.currentSize;
        
        // 树干
        ctx.beginPath();
        ctx.moveTo(centerX - size/8, centerY + size/2);
        ctx.lineTo(centerX - size/8, centerY);
        ctx.lineTo(centerX + size/8, centerY);
        ctx.lineTo(centerX + size/8, centerY + size/2);
        ctx.closePath();
        ctx.fillStyle = '#8B4513';
        ctx.fill();
        ctx.stroke();
        
        // 树冠
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size);
        ctx.lineTo(centerX - size/2, centerY);
        ctx.lineTo(centerX + size/2, centerY);
        ctx.closePath();
        ctx.fillStyle = '#228B22';
        ctx.fill();
        ctx.stroke();
        
        this.copyOffscreenToMain();
    }
    
    drawCloud() {
        this.saveState();
        const ctx = this.offscreenCtx;
        const params = this.getMathCoordinateParams();
        const { centerX, centerY } = params;
        const size = this.currentShapeSize;
        
        ctx.strokeStyle = this.currentColor;
        ctx.lineWidth = this.currentSize;
        ctx.fillStyle = '#E0E0E0';
        
        // 云朵由多个圆组成
        ctx.beginPath();
        ctx.arc(centerX - size/3, centerY - size/2, size/4, 0, Math.PI * 2);
        ctx.arc(centerX, centerY - size/2 - size/6, size/3, 0, Math.PI * 2);
        ctx.arc(centerX + size/3, centerY - size/2, size/4, 0, Math.PI * 2);
        ctx.arc(centerX - size/6, centerY - size/2 + size/6, size/5, 0, Math.PI * 2);
        ctx.arc(centerX + size/6, centerY - size/2 + size/6, size/5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        this.copyOffscreenToMain();
    }
    
    drawBird() {
        this.saveState();
        const ctx = this.offscreenCtx;
        const params = this.getMathCoordinateParams();
        const { centerX, centerY } = params;
        const size = this.currentShapeSize;
        
        ctx.strokeStyle = this.currentColor;
        ctx.lineWidth = this.currentSize;
        
        // 身体
        ctx.beginPath();
        ctx.ellipse(centerX, centerY - size/2, size/3, size/4, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // 翅膀
        ctx.beginPath();
        ctx.moveTo(centerX - size/3, centerY - size/2);
        ctx.quadraticCurveTo(centerX - size, centerY - size, centerX - size/2, centerY - size/2 - size/4);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX + size/3, centerY - size/2);
        ctx.quadraticCurveTo(centerX + size, centerY - size, centerX + size/2, centerY - size/2 - size/4);
        ctx.stroke();
        
        // 头
        ctx.beginPath();
        ctx.arc(centerX + size/4, centerY - size/2 - size/6, size/6, 0, Math.PI * 2);
        ctx.stroke();
        
        // 眼睛
        ctx.beginPath();
        ctx.arc(centerX + size/4 + size/10, centerY - size/2 - size/6, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        
        this.copyOffscreenToMain();
    }
    
    drawCat() {
        this.saveState();
        const ctx = this.offscreenCtx;
        const params = this.getMathCoordinateParams();
        const { centerX, centerY } = params;
        const size = this.currentShapeSize;
        
        ctx.strokeStyle = this.currentColor;
        ctx.lineWidth = this.currentSize;
        
        // 身体
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, size/2, size/3, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // 头
        ctx.beginPath();
        ctx.arc(centerX, centerY - size/2, size/3, 0, Math.PI * 2);
        ctx.stroke();
        
        // 耳朵
        ctx.beginPath();
        ctx.moveTo(centerX - size/4, centerY - size/2 - size/6);
        ctx.lineTo(centerX - size/6, centerY - size/2 - size/2);
        ctx.lineTo(centerX, centerY - size/2 - size/6);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX + size/4, centerY - size/2 - size/6);
        ctx.lineTo(centerX + size/6, centerY - size/2 - size/2);
        ctx.lineTo(centerX, centerY - size/2 - size/6);
        ctx.stroke();
        
        // 眼睛
        ctx.beginPath();
        ctx.arc(centerX - size/8, centerY - size/2 - size/10, size/12, 0, Math.PI * 2);
        ctx.arc(centerX + size/8, centerY - size/2 - size/10, size/12, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        
        // 尾巴
        ctx.beginPath();
        ctx.moveTo(centerX + size/2, centerY);
        ctx.quadraticCurveTo(centerX + size, centerY - size/2, centerX + size/2, centerY - size/3);
        ctx.stroke();
        
        this.copyOffscreenToMain();
    }
    
    drawDog() {
        this.saveState();
        const ctx = this.offscreenCtx;
        const params = this.getMathCoordinateParams();
        const { centerX, centerY } = params;
        const size = this.currentShapeSize;
        
        ctx.strokeStyle = this.currentColor;
        ctx.lineWidth = this.currentSize;
        
        // 身体
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, size/2, size/3, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // 头
        ctx.beginPath();
        ctx.arc(centerX - size/3, centerY - size/3, size/3, 0, Math.PI * 2);
        ctx.stroke();
        
        // 耳朵
        ctx.beginPath();
        ctx.ellipse(centerX - size/3 - size/6, centerY - size/3 - size/4, size/6, size/4, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.ellipse(centerX - size/3 + size/6, centerY - size/3 - size/4, size/6, size/4, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // 眼睛
        ctx.beginPath();
        ctx.arc(centerX - size/3 - size/10, centerY - size/3 - size/10, size/15, 0, Math.PI * 2);
        ctx.arc(centerX - size/3 + size/10, centerY - size/3 - size/10, size/15, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        
        // 尾巴
        ctx.beginPath();
        ctx.moveTo(centerX + size/2, centerY);
        ctx.quadraticCurveTo(centerX + size, centerY - size/4, centerX + size/2, centerY - size/2);
        ctx.stroke();
        
        this.copyOffscreenToMain();
    }
    
    drawFish() {
        this.saveState();
        const ctx = this.offscreenCtx;
        const params = this.getMathCoordinateParams();
        const { centerX, centerY } = params;
        const size = this.currentShapeSize;
        
        ctx.strokeStyle = this.currentColor;
        ctx.lineWidth = this.currentSize;
        ctx.fillStyle = this.currentColor;
        
        // 身体
        ctx.beginPath();
        ctx.ellipse(centerX, centerY - size/2, size/2, size/4, 0, 0, Math.PI * 2);
        if (this.fillMode) ctx.fill();
        ctx.stroke();
        
        // 尾巴
        ctx.beginPath();
        ctx.moveTo(centerX + size/2, centerY - size/2);
        ctx.lineTo(centerX + size, centerY - size/2 - size/4);
        ctx.lineTo(centerX + size, centerY - size/2 + size/4);
        ctx.closePath();
        if (this.fillMode) ctx.fill();
        ctx.stroke();
        
        // 眼睛
        ctx.beginPath();
        ctx.arc(centerX - size/4, centerY - size/2, size/10, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        
        // 鳍
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size/2 - size/4);
        ctx.lineTo(centerX, centerY - size/2 - size/2);
        ctx.lineTo(centerX + size/6, centerY - size/2 - size/4);
        ctx.stroke();
        
        this.copyOffscreenToMain();
    }
    
    drawButterfly() {
        this.saveState();
        const ctx = this.offscreenCtx;
        const params = this.getMathCoordinateParams();
        const { centerX, centerY } = params;
        const size = this.currentShapeSize;
        
        ctx.strokeStyle = this.currentColor;
        ctx.lineWidth = this.currentSize;
        ctx.fillStyle = this.currentColor;
        
        // 左翅膀
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size/2);
        ctx.quadraticCurveTo(centerX - size, centerY - size, centerX - size/2, centerY - size/2);
        ctx.quadraticCurveTo(centerX - size, centerY, centerX, centerY);
        if (this.fillMode) ctx.fill();
        ctx.stroke();
        
        // 右翅膀
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size/2);
        ctx.quadraticCurveTo(centerX + size, centerY - size, centerX + size/2, centerY - size/2);
        ctx.quadraticCurveTo(centerX + size, centerY, centerX, centerY);
        if (this.fillMode) ctx.fill();
        ctx.stroke();
        
        // 身体
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size/2);
        ctx.lineTo(centerX, centerY + size/4);
        ctx.stroke();
        
        // 头
        ctx.beginPath();
        ctx.arc(centerX, centerY - size/2 - size/8, size/8, 0, Math.PI * 2);
        ctx.stroke();
        
        this.copyOffscreenToMain();
    }
    
    drawSmiley() {
        this.saveState();
        const ctx = this.offscreenCtx;
        const params = this.getMathCoordinateParams();
        const { centerX, centerY } = params;
        const size = this.currentShapeSize;
        
        ctx.strokeStyle = this.currentColor;
        ctx.lineWidth = this.currentSize;
        ctx.fillStyle = '#FFD700';
        
        // 脸
        ctx.beginPath();
        ctx.arc(centerX, centerY - size/2, size/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // 眼睛
        ctx.beginPath();
        ctx.arc(centerX - size/4, centerY - size/2 - size/6, size/8, 0, Math.PI * 2);
        ctx.arc(centerX + size/4, centerY - size/2 - size/6, size/8, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        
        // 嘴巴
        ctx.beginPath();
        ctx.arc(centerX, centerY - size/2 + size/6, size/3, 0, Math.PI);
        ctx.strokeStyle = '#000';
        ctx.stroke();
        
        this.copyOffscreenToMain();
    }
    
    drawCar() {
        this.saveState();
        const ctx = this.offscreenCtx;
        const params = this.getMathCoordinateParams();
        const { centerX, centerY } = params;
        const size = this.currentShapeSize;
        
        ctx.strokeStyle = this.currentColor;
        ctx.lineWidth = this.currentSize;
        ctx.fillStyle = this.currentColor;
        
        // 车身
        ctx.beginPath();
        ctx.rect(centerX - size, centerY - size/4, size * 2, size/3);
        if (this.fillMode) ctx.fill();
        ctx.stroke();
        
        // 车顶
        ctx.beginPath();
        ctx.moveTo(centerX - size/2, centerY - size/4);
        ctx.lineTo(centerX - size/3, centerY - size/2);
        ctx.lineTo(centerX + size/3, centerY - size/2);
        ctx.lineTo(centerX + size/2, centerY - size/4);
        ctx.closePath();
        if (this.fillMode) ctx.fill();
        ctx.stroke();
        
        // 车轮
        ctx.beginPath();
        ctx.arc(centerX - size/2, centerY + size/6, size/6, 0, Math.PI * 2);
        ctx.arc(centerX + size/2, centerY + size/6, size/6, 0, Math.PI * 2);
        ctx.stroke();
        
        this.copyOffscreenToMain();
    }
    
    drawPlane() {
        this.saveState();
        const ctx = this.offscreenCtx;
        const params = this.getMathCoordinateParams();
        const { centerX, centerY } = params;
        const size = this.currentShapeSize;
        
        ctx.strokeStyle = this.currentColor;
        ctx.lineWidth = this.currentSize;
        
        // 机身
        ctx.beginPath();
        ctx.moveTo(centerX - size, centerY - size/2);
        ctx.lineTo(centerX + size, centerY - size/2);
        ctx.lineTo(centerX + size + size/4, centerY - size/2 - size/8);
        ctx.lineTo(centerX + size, centerY - size/2 - size/6);
        ctx.lineTo(centerX - size, centerY - size/2 - size/6);
        ctx.closePath();
        ctx.stroke();
        
        // 机翼
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size/2);
        ctx.lineTo(centerX - size/2, centerY - size/2 + size/2);
        ctx.lineTo(centerX + size/4, centerY - size/2 + size/2);
        ctx.lineTo(centerX, centerY - size/2);
        ctx.stroke();
        
        // 尾翼
        ctx.beginPath();
        ctx.moveTo(centerX - size, centerY - size/2);
        ctx.lineTo(centerX - size - size/6, centerY - size/2 - size/3);
        ctx.lineTo(centerX - size + size/6, centerY - size/2 - size/3);
        ctx.closePath();
        ctx.stroke();
        
        this.copyOffscreenToMain();
    }
    
    drawBoat() {
        this.saveState();
        const ctx = this.offscreenCtx;
        const params = this.getMathCoordinateParams();
        const { centerX, centerY } = params;
        const size = this.currentShapeSize;
        
        ctx.strokeStyle = this.currentColor;
        ctx.lineWidth = this.currentSize;
        ctx.fillStyle = this.currentColor;
        
        // 船身
        ctx.beginPath();
        ctx.moveTo(centerX - size, centerY - size/2);
        ctx.lineTo(centerX - size/2, centerY);
        ctx.lineTo(centerX + size/2, centerY);
        ctx.lineTo(centerX + size, centerY - size/2);
        ctx.closePath();
        if (this.fillMode) ctx.fill();
        ctx.stroke();
        
        // 船帆
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX, centerY - size);
        ctx.lineTo(centerX + size/2, centerY - size/2);
        ctx.closePath();
        ctx.stroke();
        
        this.copyOffscreenToMain();
    }
    
    drawMountain() {
        this.saveState();
        const ctx = this.offscreenCtx;
        const params = this.getMathCoordinateParams();
        const { centerX, centerY } = params;
        const size = this.currentShapeSize;
        
        ctx.strokeStyle = this.currentColor;
        ctx.lineWidth = this.currentSize;
        ctx.fillStyle = '#808080';
        
        // 山峰
        ctx.beginPath();
        ctx.moveTo(centerX - size, centerY + size/2);
        ctx.lineTo(centerX, centerY - size/2);
        ctx.lineTo(centerX + size, centerY + size/2);
        ctx.closePath();
        if (this.fillMode) ctx.fill();
        ctx.stroke();
        
        // 雪顶
        ctx.beginPath();
        ctx.moveTo(centerX - size/4, centerY - size/4);
        ctx.lineTo(centerX, centerY - size/2);
        ctx.lineTo(centerX + size/4, centerY - size/4);
        ctx.closePath();
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.stroke();
        
        this.copyOffscreenToMain();
    }
    
    drawApple() {
        this.saveState();
        const ctx = this.offscreenCtx;
        const params = this.getMathCoordinateParams();
        const { centerX, centerY } = params;
        const size = this.currentShapeSize;
        
        ctx.strokeStyle = this.currentColor;
        ctx.lineWidth = this.currentSize;
        ctx.fillStyle = '#FF0000';
        
        // 苹果主体
        ctx.beginPath();
        ctx.arc(centerX, centerY - size/4, size/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // 叶子
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size/4 - size/2);
        ctx.quadraticCurveTo(centerX + size/4, centerY - size/4 - size, centerX + size/6, centerY - size/4 - size/2);
        ctx.fillStyle = '#00FF00';
        ctx.fill();
        ctx.stroke();
        
        // 茎
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size/4 - size/2);
        ctx.lineTo(centerX, centerY - size/4 - size/2 - size/6);
        ctx.strokeStyle = '#8B4513';
        ctx.stroke();
        
        this.copyOffscreenToMain();
    }
    
    // 图像描摹功能
    setupImageTracing() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => this.handleImageUpload(e);
        input.click();
    }
    
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.traceImage(img);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
        
        this.addChatMessage('📷 正在上传图片...', 'system');
    }
    
    traceImage(img) {
        this.saveState();
        
        // 创建临时画布处理图片
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // 缩放图片以适应画布
        const scale = Math.min(
            this.canvas.width / img.width,
            this.canvas.height / img.height
        ) * 0.8;
        
        tempCanvas.width = img.width * scale;
        tempCanvas.height = img.height * scale;
        
        tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
        
        // 获取图片数据
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;
        
        // 简化的边缘检测
        const edges = this.detectEdges(data, tempCanvas.width, tempCanvas.height);
        
        // 绘制轮廓到主画布
        const ctx = this.offscreenCtx;
        const offsetX = (this.canvas.width - tempCanvas.width) / 2;
        const offsetY = (this.canvas.height - tempCanvas.height) / 2;
        
        ctx.strokeStyle = this.currentColor;
        ctx.lineWidth = this.currentSize;
        
        for (const edge of edges) {
            ctx.beginPath();
            ctx.arc(edge.x + offsetX, edge.y + offsetY, 1, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        this.copyOffscreenToMain();
        this.speak('已完成图片轮廓描摹');
        this.addChatMessage('🎨 AI已完成图片轮廓描摹', 'system');
    }
    
    detectEdges(data, width, height) {
        const edges = [];
        const threshold = 50;
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                
                // 计算梯度
                const left = data[idx - 4];
                const right = data[idx + 4];
                const top = data[idx - width * 4];
                const bottom = data[idx + width * 4];
                
                const gx = Math.abs(right - left);
                const gy = Math.abs(bottom - top);
                const gradient = Math.sqrt(gx * gx + gy * gy);
                
                if (gradient > threshold) {
                    edges.push({ x, y });
                }
            }
        }
        
        // 简化边缘点
        return this.simplifyEdges(edges);
    }
    
    simplifyEdges(edges) {
        // 每隔一定距离取一个点
        const simplified = [];
        const step = 5;
        
        for (let i = 0; i < edges.length; i += step) {
            simplified.push(edges[i]);
        }
        
        return simplified;
    }
    
    parseMathExpression(expression) {
        let expr = expression.toLowerCase().trim();
        
        expr = expr.replace(/°|度/g, 'deg');
        expr = expr.replace(/π|pi|圆周率/g, 'pi');
        expr = expr.replace(/sinx|sin x/g, 'sin(x)');
        expr = expr.replace(/cosx|cos x/g, 'cos(x)');
        expr = expr.replace(/tanx|tan x/g, 'tan(x)');
        expr = expr.replace(/(\d+)(sin|cos|tan|csc|sec|cot|sinh|cosh|tanh|sqrt)/g, '$1*$2');
        expr = expr.replace(/(\d+)(pi)/g, '$1*pi');
        expr = expr.replace(/x平方|x的平方|x²/g, 'x*x');
        expr = expr.replace(/x立方|x的立方/g, 'x*x*x');
        expr = expr.replace(/x三次方/g, 'x*x*x');
        expr = expr.replace(/x四次方/g, 'x*x*x*x');
        expr = expr.replace(/e的x次方|e^x/g, 'exp(x)');
        expr = expr.replace(/lnx|ln x/g, 'log(x)');
        expr = expr.replace(/logx|log x/g, 'log10(x)');
        expr = expr.replace(/绝对值/g, 'abs');
        expr = expr.replace(/(\d+)deg/g, 'deg($1)');
        expr = expr.replace(/sin(\d+)deg/g, 'sin(deg($1))');
        expr = expr.replace(/cos(\d+)deg/g, 'cos(deg($1))');
        expr = expr.replace(/tan(\d+)deg/g, 'tan(deg($1))');
        
        return expr;
    }
    
    evaluateExpression(expr, x) {
        const pi = Math.PI;
        
        const deg = (degrees) => degrees * pi / 180;
        const sin = Math.sin;
        const cos = Math.cos;
        const tan = Math.tan;
        const csc = (val) => 1 / Math.sin(val);
        const sec = (val) => 1 / Math.cos(val);
        const cot = (val) => 1 / Math.tan(val);
        const sinh = Math.sinh;
        const cosh = Math.cosh;
        const tanh = Math.tanh;
        const sqrt = Math.sqrt;
        const abs = Math.abs;
        const exp = Math.exp;
        const log = Math.log;
        const log10 = Math.log10;
        
        try {
            return eval(expr);
        } catch (e) {
            console.error('表达式计算错误:', e);
            return NaN;
        }
    }
    
    drawCustomFunction(expression) {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        const scaleX = 50;
        const scaleY = 50;
        
        const parsedExpr = this.parseMathExpression(expression);
        
        ctx.beginPath();
        let started = false;
        let validPoints = 0;
        
        for (let px = 0; px < width; px++) {
            const x = (px - centerX) / scaleX;
            const y = this.evaluateExpression(parsedExpr, x);
            
            if (isNaN(y) || !isFinite(y)) {
                started = false;
                continue;
            }
            
            const py = centerY - y * scaleY;
            
            if (py < -200 || py > height + 200) {
                started = false;
                continue;
            }
            
            validPoints++;
            
            if (!started) {
                ctx.moveTo(px, py);
                started = true;
            } else {
                ctx.lineTo(px, py);
            }
        }
        
        if (validPoints > 10) {
            ctx.stroke();
            this.copyOffscreenToMain();
            this.speak(`已绘制函数: ${expression}`);
            this.addToHistory(`绘制函数: ${expression}`, 'success');
            return true;
        } else {
            this.speak('无法解析该函数表达式');
            return false;
        }
    }
    
    drawAngleValue(functionName, angle) {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        const radius = Math.min(width, height) * 0.25;
        const angleRad = angle * Math.PI / 180;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        
        const endX = centerX + radius * Math.cos(angleRad - Math.PI / 2);
        const endY = centerY - radius * Math.sin(angleRad - Math.PI / 2);
        ctx.lineTo(endX, endY);
        
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.3, -Math.PI / 2, angleRad - Math.PI / 2);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#1f2937';
        ctx.font = '14px Arial';
        ctx.fillText(`${angle}°`, centerX + 10, centerY - 10);
        
        const value = this.calculateTrigValue(functionName, angle);
        ctx.fillText(`${functionName}(${angle}°) ≈ ${value.toFixed(4)}`, centerX + 10, centerY + 20);
        
        ctx.strokeStyle = this.currentColor;
        ctx.lineWidth = this.currentSize;
        
        this.copyOffscreenToMain();
        this.speak(`${functionName}${angle}度的值约等于${value.toFixed(4)}`);
    }
    
    calculateTrigValue(functionName, angle) {
        const rad = angle * Math.PI / 180;
        switch (functionName.toLowerCase()) {
            case 'sin': return Math.sin(rad);
            case 'cos': return Math.cos(rad);
            case 'tan': return Math.tan(rad);
            case 'csc': return 1 / Math.sin(rad);
            case 'sec': return 1 / Math.cos(rad);
            case 'cot': return 1 / Math.tan(rad);
            default: return 0;
        }
    }
    
    analyzeMathExpression(command) {
        const trigPattern = /(sin|cos|tan|csc|sec|cot)\s*(\d+)\s*[°度]?/i;
        const funcPattern = /(sinx|sin\s*x|cosx|cos\s*x|tanx|tan\s*x|x平方|x的平方|x立方|x的立方|e的x次方)/i;
        const customPattern = /(sin|cos|tan)\s*\(\s*x\s*\)/i;
        
        const trigMatch = command.match(trigPattern);
        if (trigMatch) {
            const func = trigMatch[1];
            const angle = parseInt(trigMatch[2]);
            this.drawAngleValue(func, angle);
            return true;
        }
        
        if (funcPattern.test(command) || customPattern.test(command)) {
            this.drawCustomFunction(command);
            return true;
        }
        
        const complexPattern = /(sin|cos|tan|csc|sec|cot|sinh|cosh|tanh|sqrt|abs|log|exp)\s*\(/i;
        if (complexPattern.test(command)) {
            this.drawCustomFunction(command);
            return true;
        }
        
        return false;
    }
    
    saveCanvas() {
        const link = document.createElement('a');
        link.download = `drawing_${Date.now()}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
        this.speak(this.getFeedback('save'));
    }
    
    showHelp() {
        const config = this.getDialectConfig();
        const commands = Object.values(config.commands).flat().slice(0, 20);
        const helpText = `可用指令: ${commands.join('、')}`;
        this.speak(helpText);
        this.addToHistory(helpText, 'success');
    }
    
    speak(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = this.getDialectConfig().speechLang;
            utterance.rate = 0.9;
            
            window.speechSynthesis.speak(utterance);
        }
    }
    
    addToHistory(text, type) {
        const li = document.createElement('li');
        li.className = `history-item ${type}`;
        
        const icon = document.createElement('span');
        icon.className = 'icon';
        icon.textContent = type === 'success' ? '✓' : '✗';
        
        const textSpan = document.createElement('span');
        textSpan.className = 'text';
        textSpan.textContent = text;
        
        const timeSpan = document.createElement('span');
        timeSpan.className = 'time';
        const now = new Date();
        timeSpan.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        li.appendChild(icon);
        li.appendChild(textSpan);
        li.appendChild(timeSpan);
        
        this.historyList.prepend(li);
        
        if (this.historyList.children.length > 20) {
            this.historyList.removeChild(this.historyList.lastChild);
        }
    }
}

class IntentAnalyzer {
    constructor() {
        this.intentPatterns = {
            draw: {
                patterns: ['画', '绘制', '画一个', '画个', '给我画', '帮我画', '我要画', '画一'],
                keywords: ['圆', '正方形', '长方形', '矩形', '三角形', '直线', '椭圆', '菱形', '五角星', '星星', '多边形', '弧线', '曲线', '正弦', '余弦', '正切', '抛物线', '指数', '对数', '绝对值', '坐标系', '网格', '箭头', '虚线', '心形', '爱心', '圆角矩形', '十字', '同心圆', '螺旋线', '扇形', '贝塞尔']
            },
            color: {
                patterns: ['颜色', '换成', '改为', '变成', '切换'],
                keywords: ['红色', '绿色', '蓝色', '黄色', '黑色', '白色', '橙色', '紫色', '粉色', '灰色', '金色', '银色', '靛蓝', '玫瑰红', '橄榄绿', '珊瑚色', '深红', '浅蓝', '深蓝', '草绿']
            },
            size: {
                patterns: ['粗细', '大小', '宽度', '笔刷', '尺寸'],
                keywords: ['小', '大', '细', '粗', '中等', '很大', '很小']
            },
            mode: {
                patterns: ['模式', '填充', '描边', '渐变'],
                keywords: ['填充', '描边', '渐变', '实心', '空心']
            },
            action: {
                patterns: ['撤销', '重做', '清空', '保存', '帮助', '删除'],
                keywords: ['撤销', '重做', '清空', '保存', '帮助', '删除', '重来', '返回', '前进']
            },
            function: {
                patterns: ['sin', 'cos', 'tan', 'sinx', 'cosx', 'tanx', '抛物线', '正弦', '余弦', '正切'],
                keywords: ['sin', 'cos', 'tan', 'sinx', 'cosx', 'tanx', 'sin30', 'cos60', 'tan45', '正弦', '余弦', '正切', 'x平方', 'x的平方', 'x乘以x', 'e的x次方']
            },
            tool: {
                patterns: ['画笔', '橡皮', '选择', '移动', '旋转', '缩放'],
                keywords: ['画笔', '橡皮', '选择', '移动', '旋转', '缩放', '文字']
            },
            grid: {
                patterns: ['网格', '参考线', '坐标'],
                keywords: ['显示', '隐藏', '打开', '关闭']
            },
            layer: {
                patterns: ['图层', '新建', '添加', '切换', '删除'],
                keywords: ['图层', '新建', '添加', '切换', '删除']
            },
            greeting: {
                patterns: ['你好', '您好', '嗨', '哈喽', '早上好', '下午好', '晚上好', '早', '晚安'],
                keywords: []
            },
            thanks: {
                patterns: ['谢谢', '感谢', '辛苦了', '谢谢啦', '多谢', '谢了'],
                keywords: []
            },
            confirm: {
                patterns: ['好的', '可以', '没问题', '行', 'OK', '好', '嗯', '对', '是的'],
                keywords: []
            },
            cancel: {
                patterns: ['不要', '取消', '算了', '不用', '停止', '别', '不行'],
                keywords: []
            },
            question: {
                patterns: ['什么', '怎么', '如何', '怎样', '哪个', '哪一个', '为什么', '多少', '哪里', '谁'],
                keywords: []
            },
            request: {
                patterns: ['请', '帮我', '给我', '我想', '我需要', '能帮我', '能不能', '可以帮我'],
                keywords: []
            },
            appreciation: {
                patterns: ['太棒了', '很好', '不错', '漂亮', '好看', '厉害', '牛', '赞', '优秀', '完美', '精彩'],
                keywords: []
            },
            emotion_happy: {
                patterns: ['开心', '高兴', '快乐', '开心', '太好了', '哈哈', '嘻嘻', '耶', '好开心'],
                keywords: []
            },
            emotion_sad: {
                patterns: ['难过', '伤心', '不开心', '郁闷', '沮丧', '失落', '唉', '烦', '烦躁'],
                keywords: []
            },
            emotion_angry: {
                patterns: ['生气', '愤怒', '气死', '讨厌', '烦死', '受不了', '真烦'],
                keywords: []
            },
            emotion_tired: {
                patterns: ['累了', '困了', '好累', '疲惫', '困', '想睡觉', '好困'],
                keywords: []
            },
            weather: {
                patterns: ['天气', '下雨', '晴天', '阴天', '刮风', '温度', '冷', '热', '暖', '凉'],
                keywords: []
            },
            time: {
                patterns: ['时间', '几点', '现在', '今天', '明天', '昨天', '日期', '星期', '周末'],
                keywords: []
            },
            self_intro: {
                patterns: ['我是', '我叫', '我的名字', '自我介绍'],
                keywords: []
            },
            chat: {
                patterns: ['聊聊', '聊天', '说说话', '唠嗑', '谈心', '闲聊'],
                keywords: []
            },
            joke: {
                patterns: ['笑话', '搞笑', '逗我', '开心一下', '讲个笑话', '幽默'],
                keywords: []
            },
            story: {
                patterns: ['故事', '讲故事', '听故事', '有趣的事'],
                keywords: []
            },
            music: {
                patterns: ['音乐', '歌', '唱歌', '听歌', '歌曲', '旋律'],
                keywords: []
            },
            food: {
                patterns: ['吃', '美食', '饭', '菜', '饿', '好吃', '午餐', '晚餐', '早餐'],
                keywords: []
            },
            hobby: {
                patterns: ['爱好', '喜欢', '兴趣', '擅长', '平时做', '业余'],
                keywords: []
            },
            mood: {
                patterns: ['心情', '感觉', '状态', '情绪', '心里'],
                keywords: []
            },
            encouragement: {
                patterns: ['加油', '鼓励', '支持', '努力', '坚持', '别放弃'],
                keywords: []
            },
            goodbye: {
                patterns: ['再见', '拜拜', '走了', '下线', '结束', '晚安', '下次见', '回头见'],
                keywords: []
            },
            identity: {
                patterns: ['你是谁', '你叫什么', '你是什么', '介绍一下你自己', '你的名字'],
                keywords: []
            },
            ability: {
                patterns: ['你能', '你会', '你可以', '你的功能', '你能做什么', '你会什么'],
                keywords: []
            },
            opinion: {
                patterns: ['觉得', '认为', '看法', '观点', '想法', '意见'],
                keywords: []
            },
            learning: {
                patterns: ['学习', '教我', '怎么学', '想学', '学会', '知识'],
                keywords: []
            },
            suggestion: {
                patterns: ['建议', '推荐', '有什么好', '给点建议', '帮我选'],
                keywords: []
            }
        };
        
        this.intentResponses = {
            greeting: [
                '你好！我是你的AI绘图助手，请问需要画什么？',
                '您好！请问有什么可以帮您画的？',
                '嗨！需要我帮您画点什么吗？',
                '早上好！今天想画什么？',
                '下午好！有什么可以帮您的吗？',
                '晚上好！需要我帮您画点什么吗？'
            ],
            thanks: [
                '不客气！',
                '不用谢！',
                '很高兴能帮到您！',
                '随时为您服务！',
                '这是我应该做的！',
                '您的满意就是我的动力！'
            ],
            confirm: ['好的！', '没问题！', '马上！', '收到！', '明白了！'],
            cancel: ['好的，已取消。', '明白，已停止操作。', '好的，不做了。'],
            appreciation: [
                '谢谢夸奖！',
                '很高兴您喜欢！',
                '谢谢！我会继续努力！',
                '您的认可让我很开心！',
                '太好了！您满意就好！'
            ],
            question: [
                '请问您有什么问题？',
                '我可以帮您解答。',
                '请告诉我您想知道什么？',
                '有什么疑问尽管问我！'
            ],
            emotion_happy: [
                '看到您开心我也很高兴！',
                '太好了！开心的时候画出来的作品会更漂亮哦！',
                '快乐是最好的创作灵感！',
                '心情好，画什么都好看！'
            ],
            emotion_sad: [
                '别难过，有什么我可以帮您的吗？',
                '画一幅美丽的画也许能让您心情好一些？',
                '每个人都会有低谷，但阳光总会来的。',
                '要不要画点什么来转移注意力？'
            ],
            emotion_angry: [
                '冷静一下，深呼吸。',
                '生气的时候可以画一些抽象的图形来释放情绪。',
                '有什么让您不开心的事吗？可以说出来。',
                '画画可以帮助舒缓情绪哦！'
            ],
            emotion_tired: [
                '累了就休息一下吧。',
                '适当休息才能更好地创作。',
                '要不要画点简单的图形放松一下？',
                '注意劳逸结合哦！'
            ],
            weather: [
                '天气不错的话，心情也会好哦！',
                '不管天气怎样，我们都可以画出美好的作品！',
                '晴天适合画明亮的颜色，雨天适合画柔和的色调。',
                '天气变化会影响创作灵感呢！'
            ],
            time: [
                `现在是 ${new Date().toLocaleTimeString('zh-CN')}`,
                `今天是 ${new Date().toLocaleDateString('zh-CN')}`,
                '时间过得很快，抓紧时间创作吧！',
                '每一刻都是创作的好时机！'
            ],
            self_intro: [
                '很高兴认识您！请问您想画什么？',
                '欢迎您！我是AI绘图助手，可以帮您画出各种图形。',
                '您好！有什么我可以帮您画的吗？'
            ],
            chat: [
                '好的，我们可以聊聊！您想聊什么话题？',
                '聊天也是一种放松方式。您有什么想说的吗？',
                '我很乐意和您聊天！同时也可以帮您画画哦。'
            ],
            joke: [
                '哈哈，画画的时候保持愉快的心情很重要！',
                '笑一笑，画出来的作品更有灵气！',
                '快乐是最好的创作伙伴！'
            ],
            story: [
                '故事和绘画都是表达的方式。您想画一个故事场景吗？',
                '每一幅画都有自己的故事。您想创作什么样的故事？',
                '画画就像讲故事，需要想象力和创造力！'
            ],
            music: [
                '音乐和绘画都是艺术！边听音乐边画画很有灵感。',
                '旋律可以激发创作灵感！您喜欢什么类型的音乐？',
                '艺术的灵感可以来自音乐哦！'
            ],
            food: [
                '吃饱了才有力气画画！',
                '美食和美画都是生活的享受。',
                '饿的时候可以先吃点东西，再来创作！'
            ],
            hobby: [
                '绘画是一种很好的爱好！',
                '有爱好的人生活更充实。绘画可以成为您的爱好！',
                '爱好可以丰富生活，画画就是很棒的爱好！'
            ],
            mood: [
                '心情会影响创作风格哦！',
                '把心情画出来，是一种很好的表达方式。',
                '好的心情会让作品更出色！'
            ],
            encouragement: [
                '加油！每一幅画都是进步！',
                '坚持练习，您的绘画技巧会越来越好！',
                '不要放弃，创作需要耐心和坚持！',
                '相信自己，您可以画出很棒的作品！'
            ],
            goodbye: [
                '再见！期待下次和您一起创作！',
                '拜拜！有需要随时回来找我！',
                '晚安！祝您有个好梦！',
                '下次见！希望下次能看到您的更多作品！'
            ],
            identity: [
                '我是AI语音绘图助手，可以通过语音指令帮您绘制各种图形。',
                '我叫AI绘图助手，专门帮助用户通过语音进行绘画创作。',
                '我是一个智能绘图工具，能听懂您的指令并画出相应的图形。'
            ],
            ability: [
                '我可以帮您画各种图形：圆形、正方形、三角形、直线等。',
                '我支持绘制数学函数：正弦、余弦、抛物线等。',
                '我还能切换颜色、调整笔刷大小、撤销重做等操作。',
                '我支持多种方言：普通话、粤语、四川话等。',
                '说"帮助"可以查看所有可用指令。'
            ],
            opinion: [
                '我很乐意听听您的想法！',
                '您的观点很有价值！',
                '每个人的看法都不同，这很有趣！'
            ],
            learning: [
                '学习绘画需要耐心和练习。',
                '我可以帮您练习基础的图形绘制。',
                '从简单的图形开始，慢慢就能画出复杂的作品！'
            ],
            suggestion: [
                '建议您从基础图形开始练习，比如圆形和正方形。',
                '可以尝试不同的颜色组合，会有意想不到的效果。',
                '数学函数图形很适合教学演示哦！'
            ]
        };
        
        this.context = {
            lastIntent: null,
            lastCommand: null,
            conversationHistory: [],
            userMood: null,
            userName: null
        };
    }
    
    analyze(text) {
        const result = {
            intent: null,
            entities: [],
            confidence: 0,
            originalText: text,
            parsedText: text,
            suggestions: []
        };
        
        const normalizedText = text.toLowerCase().trim();
        
        for (const [intent, config] of Object.entries(this.intentPatterns)) {
            let score = 0;
            const matchedPatterns = [];
            const matchedKeywords = [];
            
            for (const pattern of config.patterns) {
                if (normalizedText.includes(pattern)) {
                    score += 0.3;
                    matchedPatterns.push(pattern);
                }
            }
            
            for (const keyword of config.keywords) {
                if (normalizedText.includes(keyword)) {
                    score += 0.2;
                    matchedKeywords.push(keyword);
                }
            }
            
            if (score > result.confidence) {
                result.intent = intent;
                result.confidence = score;
                result.entities = [...matchedPatterns, ...matchedKeywords];
            }
        }
        
        if (result.confidence === 0) {
            result.intent = this.detectFallbackIntent(normalizedText);
            result.confidence = 0.3;
        }
        
        this.context.lastIntent = result.intent;
        this.context.lastCommand = text;
        this.context.conversationHistory.push({
            text: text,
            intent: result.intent,
            timestamp: Date.now()
        });
        
        if (this.context.conversationHistory.length > 10) {
            this.context.conversationHistory.shift();
        }
        
        this.generateSuggestions(result);
        
        return result;
    }
    
    detectFallbackIntent(text) {
        if (/[？?]$/.test(text)) {
            return 'question';
        }
        
        if (/请|帮我|给我|我想/.test(text)) {
            return 'request';
        }
        
        if (/谢谢|感谢/.test(text)) {
            return 'thanks';
        }
        
        if (/你好|您好|嗨/.test(text)) {
            return 'greeting';
        }
        
        return 'unknown';
    }
    
    generateSuggestions(result) {
        const suggestions = [];
        
        if (result.intent === 'draw') {
            if (!result.entities.some(e => ['圆', '正方形', '三角形'].includes(e))) {
                suggestions.push('您可以说：画圆、画正方形、画三角形');
            }
            if (!result.entities.some(e => ['正弦', '余弦', '抛物线'].includes(e))) {
                suggestions.push('您可以尝试绘制数学函数：画正弦、画抛物线');
            }
        }
        
        if (result.intent === 'color') {
            suggestions.push('常用颜色：红色、绿色、蓝色、黄色、黑色');
        }
        
        if (result.intent === 'action') {
            suggestions.push('常用操作：撤销、清空、保存、帮助');
        }
        
        result.suggestions = suggestions;
    }
    
    getResponse(intent) {
        if (this.intentResponses[intent]) {
            const responses = this.intentResponses[intent];
            return responses[Math.floor(Math.random() * responses.length)];
        }
        return null;
    }
    
    parseComplexCommand(text) {
        const parts = this.splitCommand(text);
        const actions = [];
        
        for (const part of parts) {
            const analysis = this.analyze(part);
            if (analysis.intent && analysis.intent !== 'unknown') {
                actions.push({
                    intent: analysis.intent,
                    entities: analysis.entities,
                    text: part
                });
            }
        }
        
        return actions;
    }
    
    splitCommand(text) {
        const separators = ['然后', '再', '接着', '之后', '先', '再画', '然后画', '先画'];
        let parts = [text];
        
        for (const sep of separators) {
            const newParts = [];
            for (const part of parts) {
                const split = part.split(new RegExp(`(?=${sep})`));
                newParts.push(...split);
            }
            parts = newParts;
        }
        
        return parts.map(p => p.trim()).filter(p => p.length > 0);
    }
    
    getContextualSuggestion() {
        if (this.context.conversationHistory.length < 2) return null;
        
        const recentIntent = this.context.conversationHistory[this.context.conversationHistory.length - 1].intent;
        
        const suggestions = {
            draw: '您可以继续绘制其他图形，或者尝试说"帮助"查看更多指令',
            color: '颜色已设置，现在可以画图形了',
            action: '操作已完成，还有什么需要帮忙的？',
            greeting: '请问需要画什么？',
            thanks: '随时为您服务！'
        };
        
        return suggestions[recentIntent] || null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new VoiceDrawingApp();
});