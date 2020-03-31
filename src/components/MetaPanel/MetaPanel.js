import React from "react";

import {
  Segment,
  Accordion,
  Header,
  Icon,
  Image,
  List
} from "semantic-ui-react";
class MetaPanel extends React.Component {
  state = {
    isPrivateChannel: this.props.isPrivateChannel,
    currentChannel: this.props.currentChannel,
    activeIndex: 0
  };

  displayTopuserPosts = posts => {
    let tab = Object.entries(posts).sort((a, b) => b[1].count - a[1].count).slice(0,5);

    return tab.map((obj, i) => (
      <List.Item key={i}>
        <Image avatar src={obj[1].avatar}></Image>
        <List.Content>
          <List.Header as="a">{obj[0]}</List.Header>
          <List.Description>{`${obj[1].count >1 ? obj[1].count+' posts' :obj[1].count +' post'  }`}</List.Description>
        </List.Content>
      </List.Item>
    ));
  };
  setActiveIndex = (event, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;
    this.setState({
      activeIndex: newIndex
    });
  };

  render() {
    const { activeIndex, currentChannel } = this.state;
    const { userPosts } = this.props;
    return (
      <Segment>
        <Header as="h3" attached="top">
          about # {currentChannel.name}
        </Header>
        <Accordion styled attached="true">
          <Accordion.Title
            active={activeIndex === 0}
            index={0}
            onClick={this.setActiveIndex}
          >
            <Icon name="dropdown" />
            <Icon name="info" />
            Channel Details
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 0}>
            {currentChannel.details}
          </Accordion.Content>
          <Accordion.Title
            active={activeIndex === 1}
            index={1}
            onClick={this.setActiveIndex}
          >
            <Icon name="dropdown" />
            <Icon name="user circle" />
            Top Posters
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 1}>
            <List>{this.displayTopuserPosts(userPosts)}</List>
          </Accordion.Content>

          <Accordion.Title
            active={activeIndex === 2}
            index={2}
            onClick={this.setActiveIndex}
          >
            <Icon name="dropdown" />
            <Icon name="pencil alternate" />
            created by
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 2}>
            <Header as="h4">
              <Image circular src={currentChannel.createdBy.avatar} />
              {currentChannel.createdBy.name}
            </Header>
          </Accordion.Content>
        </Accordion>
      </Segment>
    );
  }
}

export default MetaPanel;
