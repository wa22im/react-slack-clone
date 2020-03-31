import React from "react";
import { Segment, Comment } from "semantic-ui-react";
import firebase from "../../firebase";

import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import Message from "./Message";
import Skeleton from "./skeleton";
import { setUserPost } from "../../actions/index";
import { connect } from "react-redux";
class Messages extends React.Component {
  state = {
    userRef: firebase.database().ref("users"),
    isChannelStareed: false,
    privateMessagsRef: firebase.database().ref("privateMessages"),

    messagesRef: firebase.database().ref("messages"),
    messages: [],
    numUniqueUsers: "",
    messagesLoading: true,
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    searchTerm: "",
    searchLoading: false,
    searchResults: [],
    isPrivateChannel: this.props.isPrivateChannel,
    typingRef: firebase.database().ref("typing"),
    typingUsers: [],
    connectedRef: firebase.database().ref(".info/connected")
  };
  handleStar = () => {
    this.setState(
      prevstate => ({
        isChannelStareed: !prevstate.isChannelStareed
      }),
      () => {
        this.starChannel();
      }
    );
  };

  starChannel = () => {
    if (this.state.isChannelStareed) {
      this.state.userRef.child(`${this.state.user.uid}/starred`).update({
        [this.state.channel.id]: {
          name: this.state.channel.name,
          details: this.state.channel.details,
          createdBy: {
            name: this.state.channel.createdBy.name,
            avatar: this.state.channel.createdBy.avatar
          }
        }
      });
    } else {
      this.state.userRef
        .child(`${this.state.user.uid}/starred`)
        .child(this.state.channel.id)
        .remove(err => {
          if (err !== null) {
            console.log(err);
          }
        });
    }
  };

  componentDidMount() {
    const { channel, user } = this.state;

    if (channel && user) {
      this.addListeners(channel.id);
      this.addUserStarsLisner(channel.id, user.uid);
    }
  }

  componentDidUpdate() {
    if (this.messagesEnd) {
      this.scrollToBottom();
    }
  }

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({
      behavior: "smooth"
    });
  };

  addUserStarsLisner = (channelid, userid) => {
    this.state.userRef
      .child(userid)
      .child("starred")
      .once("value")
      .then(data => {
        if (data.val() !== null) {
          let channelids = Object.keys(data.val());
          let prevstarred = channelids.includes(channelid);
          this.setState({
            isChannelStareed: prevstarred
          });
        }
      });
  };

  addListeners = channelId => {
    this.addMessageListener(channelId);
    this.addTypingListners(channelId);
  };

  addTypingListners = channelId => {
    let typingUsers = [];
    this.state.typingRef.child(channelId).on("child_added", snap => {
      if (snap.key !== this.state.user.uid) {
        typingUsers = typingUsers.concat({
          id: snap.key,
          name: snap.val()
        });
        this.setState({
          typingUsers
        });
      }
    });
    this.state.typingRef.child(channelId).on("child_removed", snap => {
      const index = typingUsers.findIndex(user => user.id === snap.key);
      if (index !== -1) {
        typingUsers = typingUsers.filter(user => user.id !== snap.key);
        this.setState({
          typingUsers
        });
      }
    });
    this.state.connectedRef.on("value", snap => {
      if (snap.val() === true) {
        this.state.typingRef
          .child(channelId)
          .child(this.state.user.uid)
          .onDisconnect()
          .remove(err => {
            console.log(err);
          });
      }
    });
  };

  addMessageListener = channelId => {
    let loadedMessages = [];
    const messagesRef = this.getMessagesRef();
    messagesRef.child(channelId).on("child_added", snap => {
      loadedMessages.push(snap.val());
      this.setState({
        messages: loadedMessages,
        messagesLoading: false
      });
      this.countUniqueUser(loadedMessages);
      this.countUserPosts(loadedMessages);
    });
  };

  countUserPosts = messages => {
    let userPosts = messages.reduce((acc, mess) => {
      if (mess.user.name in acc) {
        acc[mess.user.name].count += 1;
      } else {
        acc[mess.user.name] = {
          avatar: mess.user.avatar,
          count: 1
        };
      }
      return acc;
    }, {});
    this.props.setUserPost(userPosts);
  };

  countUniqueUser = messages => {
    const uniqueUsers = messages.reduce((acc, mes) => {
      if (!acc.includes(mes.user.name)) {
        acc.push(mes.user.name);
      }
      return acc;
    }, []);
    const numUniqueUsers = `${uniqueUsers.length} User${
      uniqueUsers.length === 1 ? "" : "s"
    }`;
    this.setState({
      numUniqueUsers
    });
  };

  displayMessages = messages =>
    messages.length > 0 &&
    messages.map(message => (
      <Message
        key={message.timestamp}
        message={message}
        user={this.state.user}
      />
    ));

  handleSearchChange = event => {
    this.setState(
      {
        searchTerm: event.target.value,
        searchLoading: true
      },
      () => {
        this.handleSearchMessages();
      }
    );
  };

  handleSearchMessages = () => {
    this.setState({
      searchLoading: true
    });

    const channelMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, "gi");
    const searchResults = channelMessages.reduce((acc, mess) => {
      if (mess.content && mess.content.match(regex)) {
        acc.push(mess);
      } else if (mess.user.name.match(regex)) {
        acc.push(mess);
      }

      return acc;
    }, []);
    this.setState({
      searchResults
    });
    setTimeout(
      () =>
        this.setState({
          searchLoading: false
        }),
      1000
    );
  };
  getMessagesRef = () => {
    const { messagesRef, privateMessagsRef, isPrivateChannel } = this.state;
    return isPrivateChannel ? privateMessagsRef : messagesRef;
  };
  displayChannelName = channel => {
    let name = channel ? `${channel.name}` : "";
    return this.state.isPrivateChannel ? `#${name}#` : `@${name}`;
  };
  render() {
    const {
      isChannelStareed,
      messages,
      channel,
      user,
      numUniqueUsers,
      searchLoading,
      messagesLoading,
      isPrivateChannel,
      typingUsers
    } = this.state;

    return (
      <React.Fragment>
        <MessagesHeader
          numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          channelName={this.displayChannelName(channel)}
          searchLoading={searchLoading}
          isPrivateChannel={isPrivateChannel}
          handleStar={this.handleStar}
          isChannelStareed={isChannelStareed}
        />

        <Segment>
          {messagesLoading ? (
            <Skeleton />
          ) : (
            <Comment.Group
              style={{
                marginBottom: "4em"
              }}
              className="messages"
            >
              {this.state.searchTerm
                ? this.displayMessages(this.state.searchResults)
                : this.displayMessages(messages)}

              <div
                style={{
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {typingUsers.length > 0 &&
                  typingUsers.map(user => (
                    <span className="typing-dot">
                      {" "}
                      {`${user.name} typing ...`}{" "}
                    </span>
                  ))}
              </div>
              <div ref={node => (this.messagesEnd = node)}></div>
            </Comment.Group>
          )}
        </Segment>

        <MessageForm
          messagesRef={this.getMessagesRef()}
          currentChannel={channel}
          currentUser={user}
          isPrivateChannel={isPrivateChannel}
        />
      </React.Fragment>
    );
  }
}

export default connect(
  null,

  { setUserPost }
)(Messages);
