import React from "react";
import firebase from '../../firebase'
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
    currentUser:this.props.currentUser ,
    userRef:firebase.database().ref("users"),
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
    if (this.state.primarycolorhex!=="" && this.state.secondarycolarhex !=="" ) {
      this.saveColors(this.state.primarycolorhex , this.state.secondarycolarhex);
    }
  };
  saveColors = (primarycolor,secondarycolar) => {

    console.log(primarycolor,secondarycolar)
    this.state.userRef
    .child(`${this.state.currentUser.uid}/colors`)
    .push()
    .update({
      primarycolor,
      secondarycolar
    }).then(()=>{
      console.log('color')
      this.closeModel()
    })
    .catch(err=>{
      console.error(err)
    })
  };

  render() {
    const { modal, primarycolor, secondarycolar } = this.state;

    return (
      <Sidebar
        as={Menu}
        icon="labeled"
        inverted
        vertical
        visible
        width="very thin"
      >
        <Divider />
        <Button icon="add" size="small" color="blue" onClick={this.openModel} />
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

export default ColorPanel;
