class VoiceDrawingApp {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');
        this.voiceBtn = document.getElementById('voiceBtn');
        this.historyList = document.getElementById('historyList');
        this.currentToolDiv = document.getElementById('currentTool');
        this.dialectSelect = document.getElementById('dialectSelect');
        this.dialectInfo = document.getElementById('dialectInfo');
        this.tipsList = document.getElementById('tipsList');
        this.modeValue = document.getElementById('modeValue');
        
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
        
        this.dialects = {
            mandarin: {
                name: '普通话',
                langCode: 'zh-CN',
                speechLang: 'zh-CN',
                commands: {
                    drawCircle: ['画圆', '圆形', '圆圈', '画一个圆', '绘制圆形'],
                    drawSquare: ['画正方形', '正方形', '方块', '画一个正方形', '绘制正方形'],
                    drawRectangle: ['画长方形', '长方形', '矩形', '画一个长方形', '绘制矩形'],
                    drawLine: ['画直线', '直线', '画线', '画一条直线'],
                    drawTriangle: ['画三角形', '三角形', '画一个三角形'],
                    drawEllipse: ['画椭圆', '椭圆形', '椭圆'],
                    drawDiamond: ['画菱形', '菱形', '菱形图案'],
                    drawStar: ['画五角星', '五角星', '星星', '星'],
                    drawPolygon: ['画多边形', '多边形', '五边形', '六边形', '八边形'],
                    drawArc: ['画弧线', '弧线', '圆弧'],
                    drawCurve: ['画曲线', '曲线', '波浪线'],
                    drawSin: ['画正弦', '正弦函数', 'sin', '正弦曲线'],
                    drawCos: ['画余弦', '余弦函数', 'cos', '余弦曲线'],
                    drawTan: ['画正切', '正切函数', 'tan', '正切曲线'],
                    drawParabola: ['画抛物线', '抛物线', '二次函数', 'y等于x平方'],
                    drawExponential: ['画指数', '指数函数', 'e的x次方', '指数曲线'],
                    drawLog: ['画对数', '对数函数', 'ln', 'log', '对数曲线'],
                    drawAbs: ['画绝对值', '绝对值函数', '绝对值曲线'],
                    drawGrid: ['画坐标系', '坐标系', '网格', '坐标轴'],
                    brush: ['画笔', '笔刷', '切换画笔', '使用画笔'],
                    eraser: ['橡皮', '橡皮擦', '切换橡皮', '使用橡皮'],
                    fill: ['填充', '填充颜色', '实心'],
                    gradient: ['渐变', '渐变填充', '渐变色'],
                    text: ['文字', '添加文字', '输入文字'],
                    select: ['选择', '选择工具', '选取'],
                    move: ['移动', '移动图形'],
                    rotate: ['旋转', '旋转图形'],
                    scale: ['缩放', '放大', '缩小'],
                    undo: ['撤销', '后退', '返回上一步'],
                    redo: ['重做', '前进', '恢复'],
                    clear: ['清空', '清除', '重置画布', '擦除所有'],
                    save: ['保存', '保存图片', '导出图片'],
                    help: ['帮助', '指令', '命令列表', '有哪些命令']
                },
                colors: {
                    '红色': '#FF0000', '绿色': '#00FF00', '蓝色': '#0000FF',
                    '黄色': '#FFFF00', '黑色': '#000000', '白色': '#FFFFFF',
                    '橙色': '#FFA500', '紫色': '#800080', '粉色': '#FFC0CB',
                    '灰色': '#808080', '青色': '#00FFFF', '棕色': '#A0522D',
                    '金色': '#FFD700', '银色': '#C0C0C0', '靛蓝': '#4B0082',
                    '玫瑰红': '#FF69B4', '橄榄绿': '#808000', '珊瑚色': '#FF7F50'
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
                    drawCircle: ['画圆', '画个圆', '圆形', '圆圈', '画一个圆', '画只圆'],
                    drawSquare: ['画正方形', '正方形', '方块', '画个正方形', '画个方', '画只方'],
                    drawRectangle: ['画长方形', '长方形', '矩形', '画个长方形', '画个长方'],
                    drawLine: ['画直线', '直线', '画线', '画条线', '画一条直线'],
                    drawTriangle: ['画三角形', '三角形', '画个三角形', '画只三角'],
                    drawEllipse: ['画椭圆', '椭圆形', '椭圆'],
                    drawDiamond: ['画菱形', '菱形'],
                    drawStar: ['画五角星', '五角星', '星星', '星'],
                    drawPolygon: ['画多边形', '多边形', '五边形', '六边形'],
                    drawArc: ['画弧线', '弧线', '圆弧'],
                    drawCurve: ['画曲线', '曲线', '波浪线'],
                    drawSin: ['画正弦', '正弦函数', 'sin', '正弦曲线'],
                    drawCos: ['画余弦', '余弦函数', 'cos', '余弦曲线'],
                    drawTan: ['画正切', '正切函数', 'tan', '正切曲线'],
                    drawParabola: ['画抛物线', '抛物线', '二次函数'],
                    drawExponential: ['画指数', '指数函数', '指数曲线'],
                    drawLog: ['画对数', '对数函数', '对数曲线'],
                    drawAbs: ['画绝对值', '绝对值函数'],
                    drawGrid: ['画坐标系', '坐标系', '网格', '坐标轴'],
                    brush: ['画笔', '笔刷', '切换画笔', '用画笔', '用笔'],
                    eraser: ['橡皮', '橡皮擦', '胶擦', '切换橡皮', '用橡皮'],
                    fill: ['填充', '填充颜色', '实心'],
                    gradient: ['渐变', '渐变填充'],
                    text: ['文字', '添加文字'],
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
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.currentSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        window.addEventListener('resize', () => {
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
            this.ctx.putImageData(imageData, 0, 0);
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
        
        this.dialectSelect.addEventListener('change', (e) => {
            this.changeDialect(e.target.value);
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
        if (commands.drawCircle && commands.drawCircle.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.drawCircle();
            return true;
        }
        
        if (commands.drawSquare && commands.drawSquare.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.drawSquare();
            return true;
        }
        
        if (commands.drawRectangle && commands.drawRectangle.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.drawRectangle();
            return true;
        }
        
        if (commands.drawLine && commands.drawLine.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.drawLine();
            return true;
        }
        
        if (commands.drawTriangle && commands.drawTriangle.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.drawTriangle();
            return true;
        }
        
        if (commands.drawEllipse && commands.drawEllipse.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.drawEllipse();
            return true;
        }
        
        if (commands.drawDiamond && commands.drawDiamond.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.drawDiamond();
            return true;
        }
        
        if (commands.drawStar && commands.drawStar.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.drawStar();
            return true;
        }
        
        if (commands.drawPolygon && commands.drawPolygon.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.drawPolygon();
            return true;
        }
        
        if (commands.drawArc && commands.drawArc.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.drawArc();
            return true;
        }
        
        if (commands.drawCurve && commands.drawCurve.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.drawCurve();
            return true;
        }
        
        if (commands.drawSin && commands.drawSin.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.drawFunction('sin');
            return true;
        }
        
        if (commands.drawCos && commands.drawCos.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.drawFunction('cos');
            return true;
        }
        
        if (commands.drawTan && commands.drawTan.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.drawFunction('tan');
            return true;
        }
        
        if (commands.drawParabola && commands.drawParabola.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.drawFunction('parabola');
            return true;
        }
        
        if (commands.drawExponential && commands.drawExponential.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.drawFunction('exponential');
            return true;
        }
        
        if (commands.drawLog && commands.drawLog.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.drawFunction('log');
            return true;
        }
        
        if (commands.drawAbs && commands.drawAbs.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.drawFunction('abs');
            return true;
        }
        
        if (commands.drawGrid && commands.drawGrid.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.drawGrid();
            return true;
        }
        
        if (commands.fill && commands.fill.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.setFillMode(true);
            return true;
        }
        
        if (commands.gradient && commands.gradient.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.setGradientMode(true);
            return true;
        }
        
        if (commands.text && commands.text.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.setTool('text');
            return true;
        }
        
        if (commands.select && commands.select.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.setTool('select');
            return true;
        }
        
        if (commands.move && commands.move.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.setTool('move');
            return true;
        }
        
        if (commands.rotate && commands.rotate.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.setTool('rotate');
            return true;
        }
        
        if (commands.scale && commands.scale.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.setTool('scale');
            return true;
        }
        
        if (commands.brush && commands.brush.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.setTool('brush');
            return true;
        }
        
        if (commands.eraser && commands.eraser.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.setTool('eraser');
            return true;
        }
        
        if (commands.undo && commands.undo.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.undo();
            return true;
        }
        
        if (commands.redo && commands.redo.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.redo();
            return true;
        }
        
        if (commands.clear && commands.clear.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.clearCanvas();
            return true;
        }
        
        if (commands.save && commands.save.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.saveCanvas();
            return true;
        }
        
        if (commands.help.some(cmd => command.includes(cmd.toLowerCase()))) {
            this.showHelp();
            return true;
        }
        
        return false;
    }
    
    tryChangeColor(command, colors) {
        for (const [colorName, colorValue] of Object.entries(colors)) {
            if (command.includes(colorName.toLowerCase())) {
                this.setColor(colorValue, colorName);
                return true;
            }
        }
        return false;
    }
    
    tryChangeSize(command) {
        const patterns = ['粗细', '大小', '宽度', '笔刷'];
        for (const pattern of patterns) {
            const match = command.match(new RegExp(pattern.toLowerCase() + '(\\d+)'));
            if (match) {
                const size = parseInt(match[1]);
                if (size > 0 && size <= 50) {
                    this.setSize(size);
                    return true;
                }
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
        } else {
            this.ctx.strokeStyle = this.currentColor;
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
        this.speak(this.getFeedback('color', { color: name }));
    }
    
    setSize(size) {
        this.currentSize = size;
        this.ctx.lineWidth = size;
        this.speak(this.getFeedback('size', { size }));
    }
    
    saveState() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
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
            this.ctx.putImageData(imageData, 0, 0);
            this.speak(this.getFeedback('undo'));
        } else {
            this.speak(this.getFeedback('noUndo'));
        }
    }
    
    redo() {
        if (this.historyIndex < this.drawingHistory.length - 1) {
            this.historyIndex++;
            const imageData = this.drawingHistory[this.historyIndex];
            this.ctx.putImageData(imageData, 0, 0);
            this.speak(this.getFeedback('redo'));
        } else {
            this.speak(this.getFeedback('noRedo'));
        }
    }
    
    clearCanvas() {
        this.saveState();
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.speak(this.getFeedback('clear'));
    }
    
    drawCircle() {
        this.saveState();
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.2;
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.drawShape();
        
        this.speak(this.getFeedback('circle'));
    }
    
    drawSquare() {
        this.saveState();
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const size = Math.min(this.canvas.width, this.canvas.height) * 0.3;
        
        this.ctx.beginPath();
        this.ctx.rect(centerX - size / 2, centerY - size / 2, size, size);
        this.drawShape();
        
        this.speak(this.getFeedback('square'));
    }
    
    drawRectangle() {
        this.saveState();
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const width = this.canvas.width * 0.4;
        const height = this.canvas.height * 0.2;
        
        this.ctx.beginPath();
        this.ctx.rect(centerX - width / 2, centerY - height / 2, width, height);
        this.drawShape();
        
        this.speak(this.getFeedback('rectangle'));
    }
    
    drawLine() {
        this.saveState();
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width * 0.2, this.canvas.height * 0.5);
        this.ctx.lineTo(this.canvas.width * 0.8, this.canvas.height * 0.5);
        this.ctx.stroke();
        
        this.speak(this.getFeedback('line'));
    }
    
    drawTriangle() {
        this.saveState();
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const size = Math.min(this.canvas.width, this.canvas.height) * 0.25;
        
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY - size);
        this.ctx.lineTo(centerX - size, centerY + size);
        this.ctx.lineTo(centerX + size, centerY + size);
        this.ctx.closePath();
        this.drawShape();
        
        this.speak(this.getFeedback('triangle'));
    }
    
    drawEllipse() {
        this.saveState();
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radiusX = this.canvas.width * 0.25;
        const radiusY = this.canvas.height * 0.15;
        
        this.ctx.beginPath();
        this.ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        this.drawShape();
        
        this.speak(this.getFeedback('ellipse'));
    }
    
    drawDiamond() {
        this.saveState();
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const size = Math.min(this.canvas.width, this.canvas.height) * 0.2;
        
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY - size);
        this.ctx.lineTo(centerX + size, centerY);
        this.ctx.lineTo(centerX, centerY + size);
        this.ctx.lineTo(centerX - size, centerY);
        this.ctx.closePath();
        this.drawShape();
        
        this.speak(this.getFeedback('diamond'));
    }
    
    drawStar() {
        this.saveState();
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const outerRadius = Math.min(this.canvas.width, this.canvas.height) * 0.18;
        const innerRadius = outerRadius * 0.5;
        
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const x = centerX + Math.cos(angle) * outerRadius;
            const y = centerY + Math.sin(angle) * outerRadius;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
            
            const innerAngle = angle + Math.PI / 5;
            const innerX = centerX + Math.cos(innerAngle) * innerRadius;
            const innerY = centerY + Math.sin(innerAngle) * innerRadius;
            this.ctx.lineTo(innerX, innerY);
        }
        this.ctx.closePath();
        this.drawShape();
        
        this.speak(this.getFeedback('star'));
    }
    
    drawPolygon() {
        this.saveState();
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.2;
        const sides = 6;
        
        this.ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.drawShape();
        
        this.speak(this.getFeedback('polygon'));
    }
    
    drawArc() {
        this.saveState();
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.2;
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, Math.PI, 0);
        this.ctx.stroke();
        
        this.speak(this.getFeedback('arc'));
    }
    
    drawCurve() {
        this.saveState();
        
        const startX = this.canvas.width * 0.2;
        const endX = this.canvas.width * 0.8;
        const centerY = this.canvas.height * 0.5;
        const amplitude = this.canvas.height * 0.15;
        
        this.ctx.beginPath();
        this.ctx.moveTo(startX, centerY);
        
        const points = 50;
        for (let i = 1; i <= points; i++) {
            const t = i / points;
            const x = startX + (endX - startX) * t;
            const y = centerY + Math.sin(t * Math.PI * 3) * amplitude;
            this.ctx.lineTo(x, y);
        }
        
        this.ctx.stroke();
        
        this.speak(this.getFeedback('curve'));
    }
    
    drawShape() {
        if (this.fillMode) {
            this.ctx.fillStyle = this.currentColor;
            this.ctx.fill();
        }
        if (this.gradientMode) {
            const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
            gradient.addColorStop(0, this.currentColor);
            gradient.addColorStop(1, this.getComplementaryColor(this.currentColor));
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        }
        this.ctx.stroke();
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
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        this.ctx.strokeStyle = '#DDD';
        this.ctx.lineWidth = 1;
        
        const gridSize = 40;
        
        for (let x = centerX % gridSize; x < width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }
        
        for (let y = centerY % gridSize; y < height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
        
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, centerY);
        this.ctx.lineTo(width, centerY);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, 0);
        this.ctx.lineTo(centerX, height);
        this.ctx.stroke();
        
        this.ctx.fillStyle = '#333';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('0', centerX + 5, centerY + 20);
        this.ctx.fillText('X', width - 20, centerY + 20);
        this.ctx.fillText('Y', centerX + 5, 20);
        
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.currentSize;
        
        this.speak(this.getFeedback('grid'));
    }
    
    drawFunction(type) {
        this.saveState();
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        const scaleX = 50;
        const scaleY = 50;
        
        this.ctx.beginPath();
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
                this.ctx.moveTo(px, py);
                started = true;
            } else {
                this.ctx.lineTo(px, py);
            }
        }
        
        this.ctx.stroke();
        
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