
import { ToyReact, Component } from './ToyReact';

// 将一个实体dom渲染到body上
// const a = <div name='a' id='ida'>
//   <span>Hello</span>
//   <span>Word</span>
//   <span>!</span>
// </div>;
// document.body.appendChild(a);

// 将虚拟dom渲染到body上
// class MyComponent extends Component {
//   render() {
//     return <div>
//       <span>Hello</span>
//       <span>Word</span>
//       <div>
//         {true}
//         {this.children}</div>
//     </div>;
//   }

// }
// const b = <MyComponent name='MyComponent' id='idMyComponent'>
//   <div>child</div>
// </MyComponent >;
// ToyReact.render(b,
//   document.body
// );

class Square extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null,
    };
  }
  render() {
    return (
      <button className="square" onClick={() => this.setState({ value: 'X' })}>
        {this.state.value || ''}
      </button>
    )
  }
}

class Board extends Component {
  renderSquare(i) {
    return (
      <Square
        value={i}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}
const c = <Board />
ToyReact.render(c, document.body);
