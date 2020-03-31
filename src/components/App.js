import React from "react";
import { Grid } from "semantic-ui-react";
import "./App.css";
import { connect } from "react-redux";

import ColorPanel from "./ColorPanel/ColorPanel";
import SidePanel from "./SidePanel/SidePanel";
import Messages from "./Messages/Messages";
import MetaPanel from "./MetaPanel/MetaPanel";

const App = ({userPosts, currentUser, currentChannel, isPrivateChannel }) => (
  <Grid columns="equal" className="app" style={{ background: "#eee" }}>
    <ColorPanel 
    currentUser={currentUser}
    />
    <SidePanel key={currentUser && currentUser.uid} currentUser={currentUser} />

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
  userPosts:state.metadata.userPosts

});

export default connect(mapStateToProps)(App);
