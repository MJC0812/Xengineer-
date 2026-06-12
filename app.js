class VoiceDrawingApp {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');
        this.voiceBtn = document.getElementById('voiceBtn');
        this.historyList = document.getElementById('historyList');
        this.currentToolDiv = document.getElementById('currentTool');
        
        this.isListening = false;
        this.recognition = null;
        this.commandHistory = [];
        
        this.currentTool = 'brush';
        this.currentColor = '#333333';
        this.currentSize = 5;
        
        this.drawingHistory = [];
        this.historyIndex = -1;
        
        this.colors = {
            '红色': '#FF0000',
            '绿色': '#00FF00',
            '蓝色': '#0000FF',
            '黄色': '#FFFF00',
            '黑色': '#000000',
            '白色': '#FFFFFF',
            '橙色': '#FFA500',
            '紫色': '#800080',
            '粉色': '#FFC0CB',
            '灰色': '#808080',
            '青色': '#00FFFF',
            '棕色': '#A0522D'
        };
        
        this.commands = {
            drawCircle: ['画圆', '圆形', '圆圈', '画一个圆', '绘制圆形'],
            drawSquare: ['画正方形', '正方形', '方块', '画一个正方形', '绘制正方形'],
            drawRectangle: ['画长方形', '长方形', '矩形', '画一个长方形', '绘制矩形'],
            drawLine: ['画直线', '直线', '画线', '画一条直线'],
            drawTriangle: ['画三角形', '三角形', '画一个三角形'],
            brush: ['画笔', '笔刷', '切换画笔', '使用画笔'],
            eraser: ['橡皮', '橡皮擦', '切换橡皮', '使用橡皮'],
            undo: ['撤销', '后退', '返回上一步'],
            redo: ['重做', '前进', '恢复'],
            clear: ['清空', '清除', '重置画布', '擦除所有'],
            save: ['保存', '保存图片', '导出图片'],
            help: ['帮助', '指令', '命令列表', '有哪些命令']
        };
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupVoiceRecognition();
        this.setupEventListeners();
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
            this.recognition.lang = 'zh-CN';
            this.recognition.maxAlternatives = 1;
            
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
                const command = result[0].transcript.trim();
                
                if (command) {
                    this.processCommand(command);
                }
            };
        } else {
            this.updateStatus('error', '您的浏览器不支持语音识别');
            this.voiceBtn.disabled = true;
        }
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
    
    processCommand(command) {
        this.addToHistory(command, 'success');
        this.speak(`收到指令: ${command}`);
        
        const normalizedCommand = command.toLowerCase();
        
        if (this.tryExecuteCommand(normalizedCommand)) {
            return;
        }
        
        if (this.tryChangeColor(normalizedCommand)) {
            return;
        }
        
        if (this.tryChangeSize(normalizedCommand)) {
            return;
        }
        
        this.addToHistory(`未识别指令: ${command}`, 'error');
        this.speak('抱歉，我没有听懂您的指令');
    }
    
    tryExecuteCommand(command) {
        if (this.commands.drawCircle.some(cmd => command.includes(cmd))) {
            this.drawCircle();
            return true;
        }
        
        if (this.commands.drawSquare.some(cmd => command.includes(cmd))) {
            this.drawSquare();
            return true;
        }
        
        if (this.commands.drawRectangle.some(cmd => command.includes(cmd))) {
            this.drawRectangle();
            return true;
        }
        
        if (this.commands.drawLine.some(cmd => command.includes(cmd))) {
            this.drawLine();
            return true;
        }
        
        if (this.commands.drawTriangle.some(cmd => command.includes(cmd))) {
            this.drawTriangle();
            return true;
        }
        
        if (this.commands.brush.some(cmd => command.includes(cmd))) {
            this.setTool('brush');
            return true;
        }
        
        if (this.commands.eraser.some(cmd => command.includes(cmd))) {
            this.setTool('eraser');
            return true;
        }
        
        if (this.commands.undo.some(cmd => command.includes(cmd))) {
            this.undo();
            return true;
        }
        
        if (this.commands.redo.some(cmd => command.includes(cmd))) {
            this.redo();
            return true;
        }
        
        if (this.commands.clear.some(cmd => command.includes(cmd))) {
            this.clearCanvas();
            return true;
        }
        
        if (this.commands.save.some(cmd => command.includes(cmd))) {
            this.saveCanvas();
            return true;
        }
        
        if (this.commands.help.some(cmd => command.includes(cmd))) {
            this.showHelp();
            return true;
        }
        
        return false;
    }
    
    tryChangeColor(command) {
        for (const [colorName, colorValue] of Object.entries(this.colors)) {
            if (command.includes(colorName)) {
                this.setColor(colorValue, colorName);
                return true;
            }
        }
        return false;
    }
    
    tryChangeSize(command) {
        const sizeMatch = command.match(/粗细(\d+)/) || command.match(/大小(\d+)/) || 
                         command.match(/宽度(\d+)/) || command.match(/笔刷(\d+)/);
        if (sizeMatch) {
            const size = parseInt(sizeMatch[1]);
            if (size > 0 && size <= 50) {
                this.setSize(size);
                return true;
            }
        }
        return false;
    }
    
    setTool(tool) {
        this.currentTool = tool;
        this.currentToolDiv.textContent = tool === 'brush' ? '画笔工具' : '橡皮擦工具';
        
        if (tool === 'eraser') {
            this.ctx.strokeStyle = '#FFFFFF';
        } else {
            this.ctx.strokeStyle = this.currentColor;
        }
        
        this.speak(tool === 'brush' ? '已切换到画笔工具' : '已切换到橡皮擦工具');
    }
    
    setColor(color, name) {
        this.currentColor = color;
        this.ctx.strokeStyle = color;
        this.speak(`已切换到${name}`);
    }
    
    setSize(size) {
        this.currentSize = size;
        this.ctx.lineWidth = size;
        this.speak(`笔刷粗细已设置为${size}像素`);
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
            this.speak('已撤销');
        } else {
            this.speak('没有可以撤销的操作');
        }
    }
    
    redo() {
        if (this.historyIndex < this.drawingHistory.length - 1) {
            this.historyIndex++;
            const imageData = this.drawingHistory[this.historyIndex];
            this.ctx.putImageData(imageData, 0, 0);
            this.speak('已重做');
        } else {
            this.speak('没有可以重做的操作');
        }
    }
    
    clearCanvas() {
        this.saveState();
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.speak('画布已清空');
    }
    
    drawCircle() {
        this.saveState();
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.2;
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.speak('已绘制圆形');
    }
    
    drawSquare() {
        this.saveState();
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const size = Math.min(this.canvas.width, this.canvas.height) * 0.3;
        
        this.ctx.beginPath();
        this.ctx.rect(centerX - size / 2, centerY - size / 2, size, size);
        this.ctx.stroke();
        
        this.speak('已绘制正方形');
    }
    
    drawRectangle() {
        this.saveState();
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const width = this.canvas.width * 0.4;
        const height = this.canvas.height * 0.2;
        
        this.ctx.beginPath();
        this.ctx.rect(centerX - width / 2, centerY - height / 2, width, height);
        this.ctx.stroke();
        
        this.speak('已绘制长方形');
    }
    
    drawLine() {
        this.saveState();
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width * 0.2, this.canvas.height * 0.5);
        this.ctx.lineTo(this.canvas.width * 0.8, this.canvas.height * 0.5);
        this.ctx.stroke();
        
        this.speak('已绘制直线');
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
        this.ctx.stroke();
        
        this.speak('已绘制三角形');
    }
    
    saveCanvas() {
        const link = document.createElement('a');
        link.download = `drawing_${Date.now()}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
        this.speak('图片已保存');
    }
    
    showHelp() {
        const helpText = '可用指令：画圆、画正方形、画长方形、画直线、画三角形、画笔、橡皮、撤销、重做、清空、保存。颜色指令：红色、绿色、蓝色、黄色、黑色、白色、橙色、紫色、粉色、灰色、青色、棕色。粗细指令：粗细加数字。';
        this.speak(helpText);
        this.addToHistory(helpText, 'success');
    }
    
    speak(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-CN';
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