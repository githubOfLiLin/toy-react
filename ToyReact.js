// 创建原生标签
class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type);
  }
  setAttribute(name, value) {
    // 绑定事件
    if (name.match(/^on([\s\S]+)$/)) {
      let eventName = RegExp.$1.replace(/^[\s\S]/, (s) => s.toLocaleLowerCase());
      this.root.addEventListener(eventName, value);
    }
    if (name === 'className') {
      name = 'class';
    }
    this.root.setAttribute(name, value);
  }
  // 实dom中如果有虚的child，也需要使用range来进行操作
  appendChild(vChild) {
    let range = document.createRange();
    if (this.root.children.length) {
      range.setStartAfter(this.root.lastChild);
      range.setEndAfter(this.root.lastChild);
    } else {
      range.setStart(this.root, 0);
      range.setEnd(this.root, 0);
    }
    vChild.mountTo(range);
  }
  mountTo(range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}
// 创建text文本节点
class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content);
  }
  mountTo(range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}
// 创建自定义组件
export class Component {
  constructor() {
    this.children = [];
    this.props = Object.create(null);
  }
  setAttribute(name, value) {
    if (name.match(/^on([\s\S]+)$/)) {
      let eventName = RegExp.$1.replace(/^[\s\S]/, (s) => s.toLocaleLowerCase());
      // this.root.addEventListener(eventName, value);
    }
    // 自定义组件需设置props属性
    this.props[name] = value;
    this[name] = value;
  }
  mountTo(range) {
    this.range = range;
    this.update();
  }
  // 使用range更新试图
  update() {
    let placeholder = document.createComment('placeholder');
    let range = document.createRange();
    range.setStart(this.range.endContainer, this.range.endOffset);
    range.setEnd(this.range.endContainer, this.range.endOffset);
    range.insertNode(placeholder);

    this.range.deleteContents();
    const vdom = this.render();
    vdom.mountTo(this.range);

    // placeholder.parentNode.removeChild(placeholder);
  }
  // 虚dom中，children实际上是类的一个属性，可以在render中决定children的渲染位置
  appendChild(child) {
    this.children.push(child);
  }
  setState(state) {
    let merge = (oldState, newState) => {
      for (const key in newState) {
        if (typeof newState[key] === 'object') {
          if (typeof oldState[key] !== 'object') {
            oldState[key] = {};
          }
          merge(oldState[key], newState[key]);
        } else {
          oldState[key] = newState[key];
        }
      }
    }
    if (!this.state && state) {
      this.state = {};
    }
    merge(this.state, state);
    console.log(this.state);
    this.update();
  }
}

export const ToyReact = {
  // creatElement创建一个元素，当在js中定义一个标签元素时，就会调用该方法(webpack配置)
  creatElement(type, attributes, ...children) {
    // console.log(arguments);
    let element;
    // type为string,则表示创建的是原生标签
    if (typeof type === 'string') {
      element = new ElementWrapper(type);
    } else {
      element = new type;  // 其他类型，即function类型，表示创建的是自定义组件
    }
    // 设置属性
    for (const name in attributes) {
      element.setAttribute(name, attributes[name]);
    }
    // 添加子节点

    let insertChildren = (children) => {
      for (let child of children) {
        if (typeof child === 'object' && child instanceof Array) {
          insertChildren(child);
        } else {
          // 将不认识的类型的子元素转换为字符串
          if (!(child instanceof ElementWrapper) &&
            !(child instanceof TextWrapper) &&
            !(child instanceof Component)
          ) {
            child = String(child);
          }
          if (typeof child === 'string') {
            child = new TextWrapper(child); // 若子元素是文本，则先创建一个文本节点
          }
          element.appendChild(child);
        }
      }
    }
    insertChildren(children);
    return element;
  },
  // render将创建的元素添加到另一个元素上
  render(vdom, element) {
    let range = document.createRange();
    if (element.children.length) {
      range.setStartAfter(element.lastChild);
      range.setEndAfter(element.lastChild);
    } else {
      range.setStart(element, 0);
      range.setEnd(element, 0);
    }
    vdom.mountTo(range);
  }
}