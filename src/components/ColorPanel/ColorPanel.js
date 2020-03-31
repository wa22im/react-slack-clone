import React from "react";
import firebase from "../../firebase";
import {
  setColors
} from '../../actions'

import{
  connect 
}
from 'react-redux'
import {
  Sidebar,
  Menu,
  Divider,
  Button,
  Modal,
  Icon,
  Label,
  Segment
} from "semantic-ui-react";
import Slider from "react-color";

class ColorPanel extends React.Component {
  state = {
    userColors: [],
    currentUser: this.props.currentUser,
    userRef: firebase.database().ref("users"),
    modal: false,
    displayColorPicker: false,
    primarycolorhex: "",
    secondarycolarhex: "",
    primarycolor: {
      r: "255",
      g: "112",
      b: "19",
      a: "1"
    },
    secondarycolar: {
      r: "241",
      g: "255",
      b: "19",
      a: "1"
    }
  };

  componentDidMount() {
    if (this.state.currentUser) {
      this.addListner(this.state.currentUser.uid);
    }
  }

  addListner = userId => {
    let userColors = [];
    this.state.userRef.child(`${userId}/colors`).on("child_added", snap => {
      userColors.unshift(snap.val());
      this.setState({
        userColors
      });
    });
  };

  openModel = () => this.setState({ modal: true });
  closeModel = () => this.setState({ modal: false });
  handleChangeCompletePrimary = (color, event) => {
    this.setState({
      primarycolor: color,
      primarycolorhex: color.hex
    });
  };
  handleChangeCompleteSecondary = (color, event) => {
    this.setState({
      secondarycolar: color,
      secondarycolarhex: color.hex
    });
  };
  handleSaveColor = () => {
    if (
      this.state.primarycolorhex !== "" &&
      this.state.secondarycolarhex !== ""
    ) {
      this.saveColors(this.state.primarycolorhex, this.state.secondarycolarhex);
    }
  };
  saveColors = (primarycolor, secondarycolar) => {
    console.log(primarycolor, secondarycolar);
    this.state.userRef
      .child(`${this.state.currentUser.uid}/colors`)
      .push()
      .update({
        primarycolor,
        secondarycolar
      })
      .then(() => {
        this.closeModel();
      })
      .catch(err => {
        console.error(err);
      });
  };



  displayUserColors = colors =>
    colors.length > 0 &&
    colors.slice(0,5).map((color, index) => (
      <React.Fragment key={index}>
        <Divider />
        <div className="container" 
        onClick={()=>{
          this.props.setColors(color.primarycolor,color.secondarycolar)
        }}
        >
          <div className="square"
          style={{
            borderTopColor: color.primarycolor
          }}
          ></div>
            <div className="overlay"
            
            style={{
              borderBottomColor: color.secondarycolar
            }}
            ></div>
          
        </div>
      </React.Fragment>
    ));

  render() {
    const { userColors, modal, primarycolor, secondarycolar } = this.state;
    return (
      <Sidebar
        as={Menu}
        icon="labeled"
        inverted
        vertical
        visible
        width="very thin"
      >
        <Button icon="add" size="small" color="blue" onClick={this.openModel} />
        {this.displayUserColors(userColors)}
        <Modal basic open={modal} onClose={this.closeModel}>
          <Modal.Header> Choose App Colors</Modal.Header>
          <Modal.Content>
            <Segment>
              <Label content={"choose primary color"} />
              <Slider
                color={primarycolor}
                onChangeComplete={this.handleChangeCompletePrimary}
              />
              ;
            </Segment>
            <Segment>
              <Label content={"choose secondary  color"} />
              <Slider
                color={secondarycolar}
                onChangeComplete={this.handleChangeCompleteSecondary}
              />
              ;
            </Segment>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" onClick={this.handleSaveColor} inverted>
              <Icon name="checkmark" />
              <p> Save Colors</p>
            </Button>
            <Button color="red" inverted onClick={this.closeModel}>
              <Icon name="cancel" />
              <p> cancel</p>
            </Button>
          </Modal.Actions>
        </Modal>
      </Sidebar>
    );
  }
}

export default connect(null , {
  setColors
})(ColorPanel);
