const ACTIVE_KEY_CODE = 18;
const TAG_HEIGHT = 16;

class CurrentElement {
    constructor(element) {
        this.element = element;
        this.rect = element.getBoundingClientRect();
    }

    create() {
        this.container = document.createElement('div');
        this.container.classList.add('ui-friend__current-element-container');
        const { top, left, width, height } = this.rect;
        this.container.style.top = `${top}px`;
        this.container.style.left = `${left}px`;
        this.container.style.width = `${width}px`;
        this.container.style.height = `${height}px`;
        document.body.appendChild(this.container);

        this.tag = document.createElement('span');
        this.tag.classList.add('ui-friend__current-element-tag');
        this.tag.innerText = `${Math.round(width)}px × ${Math.round(height)}px`;
        if (top < TAG_HEIGHT) {
            this.tag.style.top = `${top < 0 ? -top : 0}px`;
        }
        if (left < 0) {
            this.tag.style.left = `${-left}px`;
        }
        this.container.appendChild(this.tag);
    }

    remove() {
        if (this.container) {
            this.container.remove();
        }
        return null;
    }
}

class TargetElement {
    constructor(element) {
        this.element = element;
        this.rect = element.getBoundingClientRect();
    }

    create() {
        this.container = document.createElement('div');
        this.container.classList.add('ui-friend__target-element-container');
        const { top, left, width, height } = this.rect;
        this.container.style.top = `${top}px`;
        this.container.style.left = `${left}px`;
        this.container.style.width = `${width}px`;
        this.container.style.height = `${height}px`;
        document.body.appendChild(this.container);

        this.tag = document.createElement('span');
        this.tag.classList.add('ui-friend__target-element-tag');
        this.tag.innerText = `${Math.round(width)}px × ${Math.round(height)}px`;

        if (top < TAG_HEIGHT) {
            this.tag.style.top = `${top < 0 ? -top : 0}px`;
        }
        if (left < 0) {
            this.tag.style.left = `${-left}px`;
        }
        this.container.appendChild(this.tag);
    }

    remove() {
        if (this.container) {
            this.container.remove();
        }
        this.container = null;
    }
}

class Line {
    constructor(width, height, x, y, text, type) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.text = text;
        this.type = type;
    }

    create() {
        this.line = document.createElement('span');
        this.line.classList.add('ui-friend__line');
        this.line.style.width = `${this.width}px`;
        this.line.style.height = `${this.height}px`;
        this.line.style.left = `${this.x}px`;
        this.line.style.top = `${this.y}px`;
        document.body.appendChild(this.line);

        const lineTag = document.createElement('span');
        lineTag.classList.add('ui-friend__line-tag');
        lineTag.innerText = this.text;
        if (this.type === 'top' || this.type === 'bottom') {
            lineTag.style.left = '5px';
            lineTag.style.top = `${this.height / 2 - 8}px`;
            this.line.classList.add('vertical');
        }
        if (this.type === 'left' || this.type === 'right') {
            lineTag.style.left = `50%`;
            lineTag.style.transform = 'translateX(-50%)';
            lineTag.style.top = '5px';
            this.line.classList.add('horizontal');
        }
        this.line.appendChild(lineTag);
    }

    remove() {
        if (this.line) {
            this.line.remove();
        }
        this.line = null;
    }
}

class Mark {
    constructor(currentRect, targetRect) {
        this.current = currentRect;
        this.target = targetRect;
        this.outside = this.outside(this.current, this.target);
    }

    outside(current, target) {
        return (
            current.right <= target.left || // current 在 target 左边
            current.left >= target.right || // current 在 target 右边
            current.bottom <= target.top || // current 在 target 上边
            current.top >= target.bottom // current 在 target 下边
        )
    }

    create() {
        this.createTopLine();
        this.createBottomLine();
        this.createLeftLine();
        this.createRightLine();
    }

    createTopLine() {
        if (this.outside) {
            if (this.current.top > this.target.bottom &&
                this.current.left < this.target.right &&
                this.current.right > this.target.left
            ) {
                const height = Math.round(Math.abs(this.current.top - this.target.bottom));
                const width = 2;
                const x = this.verticalLineX();
                const y = this.target.bottom;
                this.topLine = new Line(width, height, x, y, `${height}px`, 'top');
                this.topLine.create();
            }
        } else {
            const height = Math.round(Math.abs(this.current.top - this.target.top));
            const width = 2;
            const x = this.verticalLineX();
            const y = Math.min(this.current.top, this.target.top);
            this.topLine = new Line(width, height, x, y, `${height}px`, 'top');
            this.topLine.create();
        }
    }

    createBottomLine() {
        if (this.outside) {
            if (this.target.top > this.current.bottom &&
                this.current.left < this.target.right &&
                this.current.right > this.target.left
            ) {
                const height = Math.round(Math.abs(this.target.top - this.current.bottom));
                const width = 2;
                const x = this.verticalLineX();
                const y = this.current.bottom;
                this.bottomLine = new Line(width, height, x, y, `${height}px`, 'bottom');
                this.bottomLine.create();
            }
        } else {
            const height = Math.round(Math.abs(this.target.bottom - this.current.bottom));
            const width = 2;
            const x = this.verticalLineX();
            const y = Math.min(this.current.bottom, this.target.bottom);
            this.bottomLine = new Line(width, height, x, y, `${height}px`, 'bottom');
            this.bottomLine.create();
        }
    }

    verticalLineX() {
        if (this.current.width > this.target.width) {
            if (this.current.left > this.target.left) { // target 在左上
                return (this.target.right - this.current.left) / 2 + this.current.left;
            } else if (this.current.right < this.target.right) { // target 在右上
                return (this.current.right - this.target.left) / 2 + this.target.left;
            } else { // 上方
                return this.target.left + (this.target.width / 2);
            }
        } else {
            if (this.target.right < this.current.right) { // target 在左上
                return (this.target.right - this.current.left) / 2 + this.current.left;
            } else if (this.target.left > this.current.left) { // target 在右上
                return (this.current.right - this.target.left) / 2 + this.target.left;
            } else { // 上方
                return this.current.left + (this.current.width / 2);
            }
        }
    }

    createLeftLine() {
        if (this.outside) {
            if (
                this.current.left > this.target.right &&
                this.current.top < this.target.bottom &&
                this.current.bottom > this.target.top
            ) {
                const height = 2;
                const width = Math.round(Math.abs(this.current.left - this.target.right));
                const x = this.target.right;
                const y = this.horizontalLineY();
                this.leftLine = new Line(width, height, x, y, `${width}px`, 'left');
                this.leftLine.create();
            }
        } else {
            const height = 2;
            const width = Math.round(Math.abs(this.current.left - this.target.left));
            const x = Math.min(this.current.left, this.target.left);
            const y = this.horizontalLineY();
            this.leftLine = new Line(width, height, x, y, `${width}px`, 'left');
            this.leftLine.create();
        }
    }

    createRightLine() {
        if (this.outside) {
            if (
                this.target.left > this.current.right &&
                this.current.top < this.target.bottom &&
                this.current.bottom > this.target.top
            ) {
                const height = 2;
                const width = Math.round(Math.abs(this.target.left - this.current.right));
                const x = this.current.right;
                const y = this.horizontalLineY();
                this.rightLine = new Line(width, height, x, y, `${width}px`, 'left');
                this.rightLine.create();
            }
        } else {
            const height = 2;
            const width = Math.round(Math.abs(this.current.right - this.target.right));
            const x = Math.min(this.current.right, this.target.right);
            const y = this.horizontalLineY();
            this.rightLine = new Line(width, height, x, y, `${width}px`, 'left');
            this.rightLine.create();
        }
    }

    horizontalLineY() {
        if (this.current.height > this.target.height) {
            if (this.current.top > this.target.top) { // 上方
                return (this.target.bottom - this.current.top) / 2 + this.current.top;
            } else if (this.target.bottom > this.current.bottom) { // 下方
                return (this.current.bottom - this.target.top) / 2 + this.target.top;
            } else { // 中间
                return this.target.bottom - (this.target.height / 2);
            }
        } else {
            if (this.current.bottom > this.target.bottom) {  // 上方
                return (this.target.bottom - this.current.top) / 2 + this.current.top;
            } else if (this.current.top < this.target.top) { // 下方
                return (this.current.bottom - this.target.top) / 2 + this.target.top;
            } else { // 中间
                return this.current.bottom - (this.current.height / 2);
            }
        }
    }
    

    remove() {
        if (this.topLine) {
            this.topLine.remove();
            this.topLine = null;
        }
        if (this.bottomLine) {
            this.bottomLine.remove();
            this.bottomLine = null;
        }
        if (this.leftLine) {
            this.leftLine.remove();
            this.leftLine = null;
        }
        if (this.rightLine) {
            this.rightLine.remove();
            this.rightLine = null;
        }
    }
}

class UIFriend {
    constructor() {
        this.active = false;
        this.currentElement = null;
        this.targetElement = null;
        this.mark = null;
    }

    createCurrentElement(element) {
        if (element && (element !== (this.currentElement ? this.currentElement.element : null))) {
            this.currentElement = new CurrentElement(element);
            this.currentElement.create();
        }
    }

    createTargetElement(element) {
        if (element && 
            (element !== (this.currentElement ? this.currentElement.element : null)) &&
            (element !== (this.targetElement ? this.targetElement.element : null))
        ) {
            if (this.targetElement) {
                this.targetElement.remove();
            }
            this.targetElement = new TargetElement(element);
            this.targetElement.create();
            this.createMark();
        }
    }

    createMark() {
        if (this.mark) {
            this.mark.remove();
        }
        if (this.targetElement && this.currentElement) {
            this.mark = new Mark(this.currentElement.rect, this.targetElement.rect);
            this.mark.create();
        }  
    }

    onKeyDown(e) {
        if (e.keyCode === ACTIVE_KEY_CODE) {
            e.preventDefault();
            this.clear();
            const elements = document.querySelectorAll(':hover');
            const element = elements[elements.length - 1];
            this.active = true;
            this.createCurrentElement(element);
        }
    }

    onMounseMove(e) {
        if (this.active) {
            this.createTargetElement(e.target);
        }
    }

    onMouseDown(e) {
        e.preventDefault();
        this.clear();
        if (e.button === 0) { // 左键选中当前元素
            this.active = true;
            this.createCurrentElement(e.target);
        }
    }

    clear() {
        this.active = false;
        if (this.mark) {
            this.mark.remove();
            this.mark = null;
        }
        if (this.currentElement) {
            this.currentElement.remove();
            this.currentElement = null;
        }
        if (this.targetElement) {
            this.targetElement.remove();
            this.targetElement = null;
        }
    }

    start() {
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('mousemove', this.onMounseMove.bind(this));
        window.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.addStyle();
    }

    stop() {
        window.removeEventListener('keydown', this.onKeyDown.bind(this));
        window.removeEventListener('mousemove', this.onMounseMove.bind(this));
        window.removeEventListener('mousedown', this.onMouseDown.bind(this));
        this.removeStyle();
    }

    addStyle() {
        let styleElement = document.getElementById('ui-friend-style');

        if (!styleElement) {
            const styleElement = document.createElement('link')
            const file = chrome.extension.getURL('src/index.css');
            styleElement.id = 'ui-friend-style';
            styleElement.type = 'text/css';
            styleElement.href = file;
            styleElement.rel = 'stylesheet';
            document.getElementsByTagName('head')[0].appendChild(styleElement);
        }
    }

    removeStyle() {
        const styleElement = document.getElementById('ui-friend-style');
        if (styleElement) {
            styleElement.remove();
        }
    }
}

const work = new UIFriend();

work.start();

