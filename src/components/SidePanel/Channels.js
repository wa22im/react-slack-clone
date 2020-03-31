import React from "react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions";
import { Menu, Icon, Modal, Form, Input, Button, Label } from "semantic-ui-react";

class Channels extends React.Component {
  state = {
    typingRef: firebase.database().ref("typing"),
    channel: null,
    messagesRef: firebase.database().ref("messages"),
    notifications: [],
    activeChannel: "",
    user: this.props.currentUser,
    channels: [],
    channelName: "",
    channelDetails: "",
    channelsRef: firebase.database().ref("channels"),
    modal: false,
    firstLoad: true
  };

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners = () => {
    let loadedChannels = [];
    this.state.channelsRef.on("child_added", snap => {
      loadedChannels.push(snap.val());
      this.setState({ channels: loadedChannels }, () => this.setFirstChannel());
      this.addNotifications(snap.key);
    });
  };

  addNotifications = channelId => {
    this.state.messagesRef.child(channelId).on('value', snap => {
      if (this.state.channel)
        this.handleNotification(
          channelId,
          this.state.channel.id,
          this.state.notifications,
          snap
        );
    });
  };

  handleNotification = (
    channelId,
    statechannelid,
    statenotifications,
    snap
  ) => {

    let lastTotal =0 ; 
    let index = statenotifications.findIndex(statenotification=>statenotification.id===channelId)
    if ( index !==-1){
        if ( channelId !==statechannelid){
          lastTotal = statenotifications[index].total ; 
          let notifcount = snap.numChildren()-lastTotal
          if ( snap.numChildren()-lastTotal>0){
            statenotifications[index].count = notifcount
          }
        }

        statenotifications[index].lastKnownTotal = snap.numChildren() 
    }
    else{
      statenotifications.push({
        id : channelId , 
        total : snap.numChildren(),
        lastKnownTotal : snap.numChildren(),
        count : 0
      })
    }
    this.setState({
      notifications:statenotifications

    })
  };

  removeListeners = () => {
    this.state.channelsRef.off();
  };

  setFirstChannel = () => {
    this.props.setPrivateChannel(false);

    const firstChannel = this.state.channels[0];
    

    if (this.state.firstLoad && this.state.channels.length > 0) {
      this.props.setCurrentChannel(firstChannel);
    this.setActiveChannel(firstChannel);
    }
    this.setState({ firstLoad: false });
  };

  addChannel = () => {
    const { channelsRef, channelName, channelDetails, user } = this.state;

    const key = channelsRef.push().key;

    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        name: user.displayName,
        avatar: user.photoURL
      }
    };

    channelsRef
      .child(key)
      .update(newChannel)
      .then(() => {
        this.setState({ channelName: "", channelDetails: "" });
        this.closeModal();
        console.log("channel added");
      })
      .catch(err => {
        console.error(err);
      });
  };

  handleSubmit = event => {
    event.preventDefault();
    if (this.isFormValid(this.state)) {
      this.addChannel();
    }
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  changeChannel = channel => {
    this.setActiveChannel(channel);
   if ( this.state.channel!==null){
      this.state.typingRef
    .child( this.state.channel.id)
    .child(this.state.user.uid)
    .remove();}
    this.clearNotifications();
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
    this.setState({ channel });
  };

  clearNotifications=()=>{
    let index = this.state.notifications.findIndex(notif => notif.id ===this.state.channel.id )
    if ( index !==-1 ){
      let updatednotif = [...this.state.notifications];
      updatednotif[index].total = this.state.notifications[index].lastKnownTotal
      updatednotif[index].count = 0 
       this.setState({
         notifications:updatednotif
       })
        } 
  }
  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id });
  };

  displayChannels = channels =>
    channels.length > 0 &&
    channels.map(channel => (
      <Menu.Item
        key={channel.id}
        onClick={() => this.changeChannel(channel)}
        name={channel.name}
        style={{ opacity: 0.7 }}
        active={channel.id === this.state.activeChannel}
      >
        {this.getNotifCount(channel) &&(
          <Label color ='red'>
            {this.getNotifCount(channel)}
          </Label>
        )}
        # {channel.name}
      </Menu.Item>
    ));

    getNotifCount = channel =>{ 
      let count = 0 ;
      this.state.notifications.forEach(notif=> {
        if ( notif.id ===channel.id  ){
          count =notif.count
        }
      })
      if (count>0) return count
    }
  isFormValid = ({ channelName, channelDetails }) =>
    channelName && channelDetails;

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  render() {
    const { channels, modal } = this.state;

    return (
      <React.Fragment>
        <Menu.Menu style={{ paddingBottom: "2em" }}>
          <Menu.Item>
            <span>
              <Icon name="exchange" /> CHANNELS
            </span>{" "}
            ({channels.length}) <Icon name="add" onClick={this.openModal} />
          </Menu.Item>
          {this.displayChannels(channels)}
        </Menu.Menu>

        {/* Add Channel Modal */}
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Add a Channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="Name of Channel"
                  name="channelName"
                  onChange={this.handleChange}
                />
              </Form.Field>

              <Form.Field>
                <Input
                  fluid
                  label="About the Channel"
                  name="channelDetails"
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>

          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSubmit}>
              <Icon name="checkmark" /> Add
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    );
  }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(
  Channels
);
