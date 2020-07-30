let childrenSymbol = Symbol('children');
// 创建原生标签
class ElementWrapper {
  constructor(type) {
    this.type = type;
    this.props = Object.create(null);
    this[childrenSymbol] = [];
    this.children = [];
  }
  setAttribute(name, value) {
    this.props[name] = value;
  }

  // 实dom中如果有虚的child，也需要使用range来进行操作
  appendChild(vChild) {
    this[childrenSymbol].push(vChild);
    this.children.push(vChild.vdom);
  }
  get vdom() {
    return this;
  }
  mountTo(range) {
    this.range = range;

    let placeholder = document.createComment('placeholder');
    let endRange = document.createRange();
    endRange.setStart(range.endContainer, range.endOffset);
    endRange.setEnd(range.endContainer, range.endOffset);
    endRange.insertNode(placeholder);

    range.deleteContents();
    let element = document.createElement(this.type);
    for (let name in this.props) {
      let value = this.props[name];
      // 绑定事件
      if (name.match(/^on([\s\S]+)$/)) {
        let eventName = RegExp.$1.replace(/^[\s\S]/, (s) => s.toLocaleLowerCase());
        element.addEventListener(eventName, value);
      }
      if (name === 'className') {
        name = 'class';
      }
      element.setAttribute(name, value);
    }
    for (let child of this.children) {
      let range = document.createRange();
      if (element.children.length) {
        range.setStartAfter(element.lastChild);
        range.setEndAfter(element.lastChild);
      } else {
        range.setStart(element, 0);
        range.setEnd(element, 0);
      }
      child.mountTo(range);
    }
    range.insertNode(element);
  }
}
// 创建text文本节点
class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content);
    this.type = "#text";
    this.children = [];
    this.props = Object.create(null);
  }
  get vdom() {
    return this;
  }
  mountTo(range) {
    this.range = range;
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
  get type() {
    return this.construtor.name;
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

    // this.range.deleteContents();
    let vdom = this.vdom;
    if (this.oldVdom) {
      const isSameNode = (node1, node2) => {
        console.log('isSameNodeType', node1.type, node2.type);
        if (node1.type !== node2.type) {
          return false;
        }
        for (let name in node1.props) {
          // if (typeof node1.props[name] === 'function' && typeof node2.props[name] === 'function' &&
          //   node1.props[name].toString() === node2.props[name].toString()
          // ) {
          //   continue;
          // }
          if (typeof node1.props[name] === 'object' && typeof node2.props[name] === 'object'
            && JSON.stringify(node1.props[name]) === JSON.stringify(node2.props[name])
          ) {
            continue;
          }
          if (node1.props[name] !== node2.props[name]) {
            return false;
          }
        }
        if (Object.keys(node1.props).length !== Object.keys(node2.props).length) {
          return false;
        }
        return true;
      };
      const isSameTree = (node1, node2) => {
        if (!isSameNode(node1, node2)) {
          return false;
        }
        if (node1.children.length !== node2.children.length) {
          return false;
        }
        for (let i = 0; i < node1.children.length; i++) {
          if (!isSameTree(node1.children[i], node2.children[i])) {
            return false;
          }
        }
        return true;
      }
      let replace = (newTree, oldTree) => {

        if (isSameTree(newTree, oldTree)) {
          return;
        };
        if (!isSameNode(newTree, oldTree)) {
          newTree.mountTo(oldTree.range);
        } else {
          for (let i = 0; i < newTree.children.length; i++) {
            replace(newTree.children[i], oldTree.children[i]);
          }
        }
      }
      console.log('new', vdom);
      console.log('old', this.vdom);
      replace(vdom, this.oldVdom);
    } else {
      vdom.mountTo(this.range);
    }
    this.oldVdom = vdom;
  }
  get vdom() {
    return this.render().vdom;
  }
  // 虚dom中，children实际上是类的一个属性，可以在render中决定children的渲染位置
  appendChild(vChild) {
    this.children.push(vChild);
  }
  setState(state) {
    let merge = (oldState, newState) => {
      for (const key in newState) {
        if (typeof newState[key] === 'object' && newState[key] !== null) {
          if (typeof oldState[key] !== 'object') {
            if (newState[key] instanceof Array) { oldState[key] = []; }
            else { oldState[key] = {}; }
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
          if (child === null || child === void 0) {
            child = '';
          }
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