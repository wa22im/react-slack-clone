import React from "react";
import uuidv4 from "uuid/v4";
import firebase from "../../firebase";
import { Segment, Button, Input } from "semantic-ui-react";
import FileModal from "./FileModal";
import ProgressBar from "./progressBar";

import { Picker, emojiIndex } from "emoji-mart";

import "emoji-mart/css/emoji-mart.css";
class MessageForm extends React.Component {
  state = {
    emojiPicker: false,
    isPrivateChannel: this.props.isPrivateChannel,
    percentUploaded: 0,
    storageRef: firebase.storage().ref(),
    message: "",
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    loading: false,
    errors: [],
    modal: false,
    uploadState: "",
    uploadTask: null,
    typingRef: firebase.database().ref("typing")
  };

  getPath = () => {
    if (this.state.isPrivateChannel) {
      return `chat/private-${this.state.channel.id}`;
    } else {
      return "chat/public";
    }
  };

  uploadFile = (fileuploaded, metadata) => {
    const pathToUpload = this.state.channel.id;
    const ref = this.props.messagesRef;
    const filePath = `${this.getPath()}/${uuidv4()}.jpg`;
    this.setState(
      {
        uploadState: "uploading",
        uploadTask: this.state.storageRef
          .child(filePath)
          .put(fileuploaded, metadata)
      },

      () => {
        this.state.uploadTask.on(
          "state_changed",
          snap => {
            const percentUploaded = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            this.setState({ percentUploaded });
            console.log(percentUploaded);
          },
          err => {
            console.error(err);
            this.setState({
              error: this.state.errors.concat(err),
              uploadState: "error",
              uploadTask: null
            });
          },
          () => {
            this.state.uploadTask.snapshot.ref
              .getDownloadURL()
              .then(downloadUrl => {
                this.sendFileMessage(downloadUrl, ref, pathToUpload);
              })
              .catch(err => {
                console.error(err);
                this.setState({
                  error: this.state.errors.concat(err),
                  uploadState: "error",
                  uploadTask: null
                });
              });
          }
        );
      }
    );
  };

  sendFileMessage = (downloadUrl, ref, pathToUpload) => {
    ref
      .child(pathToUpload)
      .push()
      .set(this.createMessage(downloadUrl))
      .then(() => {
        this.setState({
          uploadState: "done"
        });
      })
      .catch(err => {
        console.error(err);
        this.setState({
          errors: this.state.errors.concat(err)
        });
      });
  };
  openModal = () => this.setState({ modal: true });
  closeModal = () => this.setState({ modal: false });

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  createMessage = (fileUrl = null) => {
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: this.state.user.uid,
        name: this.state.user.displayName,
        avatar: this.state.user.photoURL
      }
    };
    if (fileUrl !== null) {
      message["image"] = fileUrl;
    } else {
      message["content"] = this.state.message;
    }

    return message;
  };

  sendMessage = () => {
    const { messagesRef } = this.props;
    const { message, channel, user } = this.state;

    if (message) {
      this.setState({ loading: true });
      messagesRef
        .child(channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ loading: false, message: "", errors: [] });
          this.removeFromTyping(channel.id, user.uid);
        })
        .catch(err => {
          console.error(err);
          this.setState({
            loading: false,
            errors: this.state.errors.concat(err)
          });
        });
    } else {
      this.setState({
        errors: this.state.errors.concat({ message: "Add a message" })
      });
    }
  };

  handleKeyDown = (event) => {
    if ( event.ctrlKey || event.keyCode===13){
      this.sendMessage()
    }
    let { message, typingRef, channel, user } = this.state;
    if (message) {
      typingRef
        .child(channel.id)
        .child(user.uid)
        .set(user.displayName);
    } else {
      typingRef
        .child(channel.id)
        .child(user.uid)
        .remove();
    }
  };

  removeFromTyping = (channelid, useruid) => {
    this.state.typingRef
      .child(channelid)
      .child(useruid)
      .remove();
  };

  handleToggleEmojiPicker = () => {
    console.log("clicked");
    this.setState({
      emojiPicker: !this.state.emojiPicker
    });
  };

  handleAddEmoji = emoji => {
    const oldmessage = this.state.message;
    const newmessage = this.colonToUnicode(`${oldmessage} ${emoji.colons}`);
    this.setState({
      message: newmessage,
      emojiPicker: false
    });
    setTimeout(() => {
      this.messageinputref.focus();
    }, 0);
  };
  colonToUnicode = message => {
    return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
      x = x.replace(/:/g, "");
      let emoji = emojiIndex.emojis[x];
      if (typeof emoji !== "undefined") {
        let unicode = emoji.native;
        if (typeof unicode !== "undefined") {
          return unicode;
        }
      }
      x = ":" + x + ":";
      return x;
    });
  };

  render() {
    const { emojiPicker, errors, message, loading, modal } = this.state;

    return (
      <Segment className="message__form">
        {emojiPicker && (
          <Picker
            onSelect={this.handleAddEmoji}
            set="apple"
            className="emojipicker"
            title="pick your emoji"
            emoji="point_up"
          />
        )}

        <Input
          fluid
          ref={node => (this.messageinputref = node)}
          onKeyDown={this.handleKeyDown}
          name="message"
          onChange={this.handleChange}
          value={message}
          style={{ marginBottom: "0.7em" }}
          label={
            <Button
              onClick={this.handleToggleEmojiPicker}
              icon={emojiPicker ? "close" : "add"}
              content={emojiPicker ? "Close" : null}
            />
          }
          labelPosition="left"
          className={
            errors.some(error => error.message.includes("message"))
              ? "error"
              : ""
          }
          placeholder="Write your message"
        />
        <Button.Group icon widths="2">
          <Button
            onClick={this.sendMessage}
            disabled={loading}
            color="orange"
            content="Add Reply"
            labelPosition="left"
            icon="edit"
          />
          <Button
            disabled={this.state.uploadState === "uploading"}
            color="teal"
            content="Upload Media"
            labelPosition="right"
            icon="cloud upload"
            onClick={this.openModal}
          />
          <FileModal
            uploadFile={this.uploadFile}
            modal={modal}
            closeModal={this.closeModal}
          />
        </Button.Group>
        <ProgressBar
          uploadstate={this.state.uploadState}
          percentUploaded={this.state.percentUploaded}
        />
      </Segment>
    );
  }
}

export default MessageForm;
