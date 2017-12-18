import React from 'react';
import PropTypes from 'prop-types';
import ComponentsContainer from './ComponentsContainer';
import Events from '../../lib/Events';

export default class Sidebar extends React.Component {
  static propTypes = {
    entity: PropTypes.object,
    visible: PropTypes.bool
  };

  constructor (props) {
    super(props);
    this.state = {
      open: false,
      entity: props.entity,
      multipleEntities: props.multipleEntities
    };
  }

  componentDidMount () {
    Events.on('componentremoved', event => {
      this.forceUpdate();
    });

    Events.on('componentadded', event => {
      this.forceUpdate();
    });
  }

  handleToggle = () => {
    this.setState({open: !this.state.open});
    ga('send', 'event', 'Components', 'toggleSidebar');
  }

  componentChanged = (event) => {
    Events.emit('selectedentitycomponentchanged', event.detail);
  }

  componentWillReceiveProps (newProps) {
    if (this.state.entity !== newProps.entity) {
      if (this.state.entity) {
        this.state.entity.removeEventListener('componentchanged', this.componentChanged);
        this.state.entity.removeEventListener('componentinitialized', this.componentCreated);
      }
      if (newProps.entity) {
        newProps.entity.addEventListener('componentchanged', this.componentChanged);
        newProps.entity.addEventListener('componentinitialized', this.componentCreated);
      }
      this.setState({entity: newProps.entity});
    }

    if (this.state.multipleEntities && this.state.multipleEntities.length !== newProps.multipleEntities.length) {
      console.log(this.state.multipleEntities)
      this.setState({multipleEntities: newProps.multipleEntities})
    }
  }

  render () {
    const { entity, multipleEntities } = this.state;
    console.log(multipleEntities)
    const visible = this.props.visible;
    if (entity && visible) {
      return (
        <div id='sidebar'>
          <ComponentsContainer entity={entity} getSceneHtml={this.props.getSceneHtml} />
        </div>
      );
    }

    if (multipleEntities && visible) {
      return (
        <div id='sidebar'>
          <ComponentsContainer multipleEntities={multipleEntities} getSceneHtml={this.props.getSceneHtml} />
        </div>
      );
    }

    return <div/>
  }
}
