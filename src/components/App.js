import React from "react";
import { Grid } from "semantic-ui-react";
import "./App.css";
import { connect } from "react-redux";

import ColorPanel from "./ColorPanel/ColorPanel";
import SidePanel from "./SidePanel/SidePanel";
import Messages from "./Messages/Messages";
import MetaPanel from "./MetaPanel/MetaPanel";

const App = ({secondaryColor,primaryColor,userPosts, currentUser, currentChannel, isPrivateChannel }) => (
  <Grid columns="equal" className="app" style={{ background: secondaryColor }}>
    <ColorPanel 
    currentUser={currentUser}
    />
    <SidePanel 
    primaryColor={primaryColor}
    
    key={currentUser && currentUser.uid} currentUser={currentUser} />

    <Grid.Column style={{ marginLeft: 320 }}>
      <Messages
        isPrivateChannel={isPrivateChannel}
        key={currentChannel && currentChannel.id}
        currentChannel={currentChannel}
        currentUser={currentUser}
      />
    </Grid.Column>

    <Grid.Column width={4}>
     {! isPrivateChannel && currentChannel  ?  
      <MetaPanel 
      key={currentChannel && currentChannel.id}
      currentChannel={currentChannel}
      userPosts={userPosts}
      isPrivateChannel={isPrivateChannel}  /> :""}
    </Grid.Column>
  </Grid>
);

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel,
  isPrivateChannel: state.channel.isPrivateChannel,
  userPosts:state.metadata.userPosts,
  primaryColor:state.colors.primaryColor,
  secondaryColor:state.colors.secondaryColor,


});

export default connect(mapStateToProps)(App);
