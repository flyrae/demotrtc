import React,{Component} from "react";
import logo from "./logo.svg";
import './App.css';


const list = [
  {
    title: 'React',
    author: 'a',
    points: 4,
    objectID: 0,
  },
  {
    title: 'Vue',
    author: 'b',
    points: 5,
    objectID: 1,
  }
];

class Developer {
  constructor(firstName, lastName) {
    this.firstName = firstName;
    this.lastName = lastName;
  }
  getName() {
    return this.firstName +' '+ this.lastName;
  }
}


class App extends Component{

  constructor(props){
    super(props);

    this.state = {
      list: list,
    }

    this.onDismiss = this.onDismiss.bind(this);
  }

  onDismiss(id){
    function isNotId(item){
      return item.objectID !== id;
    }
    const updatedList = this.state.list.filter(isNotId);
    this.setState({list: updatedList});
  }

  onClickMe= () => {
    console.log(this);
  }
  
  render(){
    const helloworld = {
      text: "Hello Worldb"
    };

    const name= 'Robert';
    const user = {
      name,
      getUserName(user){
        return user.name;
      }
    }
    const Robin = new Developer('Robin', 'Wieruch');
    console.log(Robin.getName());
    return(
      <div className="App">
        {this.state.list.map(item =>
           <div key={item.objectID}>{item.title}
           <span>
             <button
              onClick={() => this.onDismiss(item.objectID)}
              type="button">
                Dismiss
             </button>
           </span>
           </div>
        )}
        
        <div>{user.getUserName(user)}</div>

        <button type="button" onClick={this.onClickMe}>Click Me</button>
      </div>
      
    );
  }
}

export default App;