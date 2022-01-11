import { Component } from "react";



class ExplainBindingsComponent extends Component{
    onClickMe(){
        console.log(this);
    }

    render(){
        return (
            <div>
                <button onClick={this.onClickMe}>Click Me</button>
            </div>
        )
    }
}

export default ExplainBindingsComponent;