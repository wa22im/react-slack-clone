import React, {  Component } from "react";
import AvatarEditor from "react-avatar-editor";
import firebase from "../../firebase";
import { Modal, Input, Button, Icon, Grid, Image } from "semantic-ui-react";

export default class AvataModal extends Component {
  state = {
    user:this.props.user,
    usersRefdb : firebase.database().ref('users'),
    uploadedCroppedImage: "",
    metadata: {
      content: "image/jpeg"
    },
    croppedImage: "",
    blob: "",
    previewImage: "",
    userRef: firebase.auth().currentUser,
    storageRef: firebase.storage().ref()
  };

  handlChange = event => {
    const file = event.target.files[0];
    const reader = new FileReader();
    if (file) {
      reader.readAsDataURL(file);
      reader.addEventListener("load", () => {
        this.setState({
          previewImage: reader.result
        });
      });
    }
  };

  handleCropImage = () => {
    console.log(this.avatarEditor);
    if (this.avatarEditor) {
      this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
        let imageUrl = URL.createObjectURL(blob);
        this.setState({
          croppedImage: imageUrl,
          blob
        });
      });
    }
  };

  uploadedCroppedImagefn = () => {
    const { storageRef, userRef, blob,metadata } = this.state;
    storageRef
      .child(`avatars/user-${userRef.uid}`)
      .put(blob,metadata)
      .then(snap => {
        snap.ref.getDownloadURL().then(downloadUrl => {
          this.setState(
            {
              uploadedCroppedImage: downloadUrl
            },
            () => {
              this.changeAvatar();
            }
          );
        });
      });
  };

  changeAvatar = () => {
    this.state.userRef
      .updateProfile({
        photoURL: this.state.uploadedCroppedImage
      })
      .then(() => {
        console.log("photo url updated");
        this.props.closeModal();
      })
      .catch(err => {
        console.log(err);
      });

      this.state.usersRefdb
      .child(this.state.userRef.uid)
      .update({avatar : this.state.uploadedCroppedImage})
      .then(()=>{
          console.log('user avatar updated')
      })
      .catch(err=>{
          console.log(err)
      })
  };

  render() {
    const { closeModal, modal } = this.props;
    const { croppedImage, previewImage } = this.state;
    return (
      <Modal basic open={modal} onClose={closeModal}>
        <Modal.Header>select an avatar</Modal.Header>
        <Modal.Content>
          <Input
            fluid
            onChange={this.handlChange}
            label="new Avatar"
            name="file"
            type="file"
          />

          <Grid centered stackable columns={2}>
            <Grid.Row centered>
              <Grid.Column className="ui center aligned grid">
                {previewImage && (
                  <AvatarEditor
                    ref={node => {
                      this.avatarEditor = node;
                    }}
                    image={previewImage}
                    width={120}
                    height={120}
                    border={50}
                    scale={1.2}
                  />
                )}
              </Grid.Column>
              <Grid.Column>
                {croppedImage && (
                  <Image
                    label={"image preview"}
                    style={{
                      border: "1em solid",
                      margin: "4em auto"
                    }}
                    width={100}
                    height={100}
                    src={croppedImage}
                  ></Image>
                )}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Modal.Content>
        <Modal.Actions>
          {croppedImage && (
            <Button onClick={this.uploadedCroppedImagefn} color="green" inverted>
              <Icon name="checkmark"></Icon>
              change
            </Button>
          )}
          <Button
            onClick={() => {
              this.handleCropImage();
            }}
            color="blue"
            inverted
          >
            <Icon name="checkmark"></Icon>
            preview
          </Button>

          <Button onClick={closeModal} color="red" inverted>
            <Icon name="remove"></Icon>
            cancel
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}
