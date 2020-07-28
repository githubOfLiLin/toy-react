// 创建原生标签
class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type);
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }
  appendChild(vChild) {
    vChild.mountTo(this.root);
  }
  mountTo(parent) {
    parent.appendChild(this.root);
  }
}
// 创建text文本节点
class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content);
  }
  mountTo(parent) {
    parent.appendChild(this.root);
  }
}
// 创建自定义组件
export class Component {
  constructor() {
    this.children = [];
  }
  setAttribute(name, value) {
    this[name] = value;
  }
  mountTo(parent) {
    const vdom = this.render();
    vdom.mountTo(parent);
  }
  appendChild(child) {
    this.children.push(child);
  }
}

export const ToyReact = {
  // creatElement创建一个元素，当在js中定义一个标签元素时，就会调用该方法(webpack配置)
  creatElement(type, attributes, ...children) {
    console.log(arguments);
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
    vdom.mountTo(element);
  }
}