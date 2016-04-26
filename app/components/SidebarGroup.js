import React, { Component } from 'react';
import { ListItem } from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';

export default class SidebarGroup extends Component {
  
  constructor(props, content) {
    super(props, content);
    this.state = {checked: false};
    this.onChecked = this.onChecked.bind(this);
  }
  
  componentWillReceiveProps (nextProps) {
    this.setState({checked: nextProps.checked});
  }
  
  onChecked(event) {
    const { onChecked } = this.props;
    this.setState({checked: !this.state.checked});
    onChecked(event, !this.state.checked);
    event.stopPropagation();
  }
  
  render() {
    const { title, controls, checkbox } = this.props; 
    return (
      <ListItem primaryText={title} nestedItems={controls} 
        leftCheckbox={checkbox ? <Checkbox checked={this.state.checked} onClick={this.onChecked} /> : null}
      />
    );
  }
}

SidebarGroup.defaultProps = {
  onChecked : function () {}
}