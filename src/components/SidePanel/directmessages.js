import React, { Component } from "react";
import firebase from "../../firebase";
import { Menu, Icon } from "semantic-ui-react";
import{connect} from 'react-redux';
import {
    setCurrentChannel,setPrivateChannel
}
from '../../actions/index'

class DirectMessages extends Component {
  state = {
      isSelected : false  , 
    user: this.props.currentUser,
    users: [],
    presenceRef: firebase.database().ref("presence"),
    userRef: firebase.database().ref("users"),
    connectedRef: firebase.database().ref(".info/connected")
  };

  componentDidMount() {
    if (this.state.user) {
      this.addLisnters(this.state.user.uid);
    }
  }

  addLisnters = currentuseruid => {
    let loadedUsers = [];
    this.state.userRef.on("child_added", snap => {
      if (currentuseruid !== snap.key) {
        let user = snap.val();
        user["uid"] = snap.key;
        user["status"] = "offline";
        loadedUsers.push(user);
        this.setState({
          users: loadedUsers
        });
      }
    });
    this.state.connectedRef.on("value", snap => {
      if (snap.val() === true) {
        const ref = this.state.presenceRef.child(currentuseruid);
        ref.set(true);
        ref.onDisconnect().remove(err => {
          if (err !== null) {
            console.error(err);
          }
        });
      }
    });



    this.state.presenceRef.on('child_removed',snap=>{
        if ( currentuseruid!== snap.key){
            this.addStatusToUser(snap.key,false)
        }
    })
    

this.state.presenceRef.on('child_added',snap=>{
    if ( currentuseruid!== snap.key){
        this.addStatusToUser(snap.key)
    }
})

  };

addStatusToUser =(userId , connected=true)=>{
    const updatedusers = this.state.users.reduce((acc,user)=>{
        if ( user.uid ===userId){
            user['status'] = `${connected ? 'online' : 'offline'}`;
        }
        return acc.concat(user)
    },[]);
    this.setState({
        users:updatedusers
    })
}
isUserOnline=(user)=>user.status==='online';
changeChannel = (user)=>{
    const channelId = this.getChannelId (user.uid) ; 
    const channelData = {
        id : channelId , 
        name : user.name
    }
    this.props.setCurrentChannel(channelData )
    this.props.setPrivateChannel( true)
    this.setActiChannel (user.uid)
}

setActiChannel=userid=>{ 
    this.setState({
        isSelected :  userid    
    })
}
getChannelId=(userid)=>{
    const currenUserId = this.state.user.uid ; 
    if ( userid>currenUserId )
    return `${userid}/${currenUserId}`
    else 
    return `${currenUserId}/${userid}`

        

}
  render() {
    const { users ,isSelected} = this.state;
    return (
      <React.Fragment>
        <Menu.Menu style={{ paddingBottom: "2em" }}>
          <Menu.Item>
            <span>
              <Icon name="mail" />
              Direct Messages
              {` ${users.length}`}
            </span>
          </Menu.Item>
          {users.map(user=>(
              <Menu.Item
              active ={user.uid===isSelected}
              key={user.uid+user.name}
              onClick={()=>{
                  this.changeChannel(user)
              }} 
              style={{
                  opacity :0.7 , 
                  fontStyle :'italic'
              }}
              >
                  <Icon
                  name="circle"
                  color={this.isUserOnline(user)?'green':'red'}
                  />
                  @{user.name}

              </Menu.Item>
          ))}
        </Menu.Menu>
      </React.Fragment>
    );
  }
}
export default connect(
     null , 
     {setCurrentChannel,setPrivateChannel
        }
)(DirectMessages)