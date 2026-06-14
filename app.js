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
        this.dialectButtons = null;
        
        this.isListening = false;
        this.recognition = null;
        this.commandHistory = [];
        
        this.currentTool = 'brush';
        this.currentColor = '#333333';
        this.currentSize = 5;
        
        this.drawingHistory = [];
        this.historyIndex = -1;
        
        this.currentDialect = 'mandarin';
        this.fillMode = false;
        this.gradientMode = false;
        
        this.renderQueue = [];
        this.isRendering = false;
        this.renderTimestamp = 0;
        
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
                    drawGrid: ['画坐标系', '坐标系', '网格', '坐标轴', '给我画坐标系', '帮我画坐标系', '画坐标轴', '我要画坐标系', '画网格', '画坐标'],
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
                    grid: '已绘制坐标系',
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
                    '说"帮助"查看所有指令'
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
                    drawGrid: ['画坐标系', '坐标系', '网格', '坐标轴', '帮我画坐标系', '画坐标轴', '我要画坐标系'],
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
                    drawGrid: ['draw grid', 'grid', 'coordinate system', 'axes', 'draw axes'],
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
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = true;
            this.recognition.interimResults = false;
            this.recognition.lang = this.getDialectConfig().langCode;
            this.recognition.maxAlternatives = 3;
            
            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateStatus('listening', '正在听...');
                this.voiceBtn.classList.remove('start');
                this.voiceBtn.classList.add('stop');
                this.voiceBtn.innerHTML = '<span>⏹️</span><span>停止语音</span>';
            };
            
            this.recognition.onend = () => {
                if (this.isListening) {
                    this.recognition.start();
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('语音识别错误:', event.error);
                this.isListening = false;
                this.updateStatus('error', `错误: ${this.getErrorMessage(event.error)}`);
                this.resetVoiceButton();
            };
            
            this.recognition.onresult = (event) => {
                const result = event.results[event.results.length - 1];
                
                for (let i = 0; i < result.length; i++) {
                    const command = result[i].transcript.trim();
                    if (command && this.processCommand(command)) {
                        break;
                    }
                }
            };
        } else {
            this.updateStatus('error', '您的浏览器不支持语音识别');
            this.voiceBtn.disabled = true;
        }
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
        
        if (this.recognition) {
            this.recognition.lang = this.getDialectConfig().langCode;
        }
        
        this.updateDialectUI();
        
        if (wasListening) {
            setTimeout(() => this.startListening(), 500);
        }
        
        const dialectName = this.getDialectConfig().name;
        this.speak(`已切换到${dialectName}`);
        this.addToHistory(`切换方言: ${dialectName}`, 'success');
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
        
        this.tipsList.innerHTML = '';
        config.tips.forEach(tip => {
            const li = document.createElement('li');
            li.textContent = tip;
            this.tipsList.appendChild(li);
        });
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
        this.recognition.stop();
        this.updateStatus('idle', '已停止监听');
        this.resetVoiceButton();
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
        this.speak(this.getFeedback('received', { command }));
        
        if (this.tryExecuteCommand(normalizedCommand, config.commands)) {
            return true;
        }
        
        if (this.tryChangeColor(normalizedCommand, config.colors)) {
            return true;
        }
        
        if (this.tryChangeSize(normalizedCommand)) {
            return true;
        }
        
        this.addToHistory(`未识别指令: ${command}`, 'error');
        this.speak(this.getFeedback('unknown'));
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
            drawParabola: () => this.drawFunction('parabola'),
            drawExponential: () => this.drawFunction('exponential'),
            drawLog: () => this.drawFunction('log'),
            drawAbs: () => this.drawFunction('abs'),
            drawGrid: () => this.drawGrid(),
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
        
        const matchedCommand = this.findBestMatch(normalizedCmd, commands, commandMap);
        
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
        
        this.currentToolDiv.textContent = toolNames[tool] || tool;
        
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
    
    drawFunction(type) {
        this.saveState();
        
        const ctx = this.offscreenCtx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        const scaleX = 50;
        const scaleY = 50;
        
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

document.addEventListener('DOMContentLoaded', () => {
    new VoiceDrawingApp();
});