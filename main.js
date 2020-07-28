
import { ToyReact, Component } from './ToyReact';

class MyComponent extends Component {
  render() {
    return <div>
      <span>Hello</span>
      <span>Word</span>
      <div>
        {true}
        {this.children}</div>
    </div>;
  }

}
// 将一个实体dom渲染到body上
// const a = <div name='a' id='ida'>
//   <span>Hello</span>
//   <span>Word</span>
//   <span>!</span>
// </div>;
// document.body.appendChild(a);

// 将虚拟dom渲染到body上
const b = <MyComponent name='MyComponent' id='idMyComponent'>
  <div>child</div>
</MyComponent >;
ToyReact.render(b,
  document.body
);