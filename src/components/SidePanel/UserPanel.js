import React from "react";
import firebase from "../../firebase";
import { Grid, Header, Icon, Dropdown, Image, } from "semantic-ui-react";
import AvataModal from './avatarModal'
class UserPanel extends React.Component {
  state = {
    user: this.props.currentUser,
    modal: false
  };

  openModal = () =>
    this.setState({
      modal: true
    });

  closeModal = () =>
    this.setState({
      modal: false
    });

  dropdownOptions = () => [
    {
      key: "user",
      text: (
        <span>
          Signed in as <strong>{this.state.user.displayName}</strong>
        </span>
      ),
      disabled: true
    },
    {
      key: "avatar",
      text: <span onClick={this.openModal}>Change Avatar</span>
    },
    {
      key: "signout",
      text: <span onClick={this.handleSignout}>Sign Out</span>
    }
  ];

  handleSignout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => console.log("signed out!"));
  };

  render() {
    const { user, modal } = this.state;
    const { primaryColor } = this.props;

    return (
      <Grid style={{ background: primaryColor }}>
        <Grid.Column>
          <Grid.Row style={{ padding: "1.2em", margin: 0 }}>
            {/* App Header */}
            <Header inverted floated="left" as="h2">
              <Icon name="code" />
              <Header.Content>DevChat</Header.Content>
            </Header>

            {/* User Dropdown  */}
            <Header style={{ padding: "0.25em" }} as="h4" inverted>
              <Dropdown
                trigger={
                  <span>
                    <Image src={user.photoURL} spaced="right" avatar />
                    {user.displayName}
                  </span>
                }
                options={this.dropdownOptions()}
              />
            </Header>
          </Grid.Row>
          {/** change user modal avatar  */}
         <AvataModal
         closeModal={this.closeModal}
         user={user}
         modal={modal}
         />
        </Grid.Column>
      </Grid>
    );
  }
}

export default UserPanel;
