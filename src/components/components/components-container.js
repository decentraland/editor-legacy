import React from 'react';
import PropTypes from 'prop-types';
import AddComponent from './add-component';
import Component from './component';
import CommonComponents from './common-components';
import DEFAULT_COMPONENTS from './default-components';

const HIDDEN_COMPONENTS = ['geometry'];

export default class ComponentsContainer extends React.Component {
  static propTypes = {
    entity: PropTypes.object
  };

  refresh = () => {
    this.forceUpdate();
  }

  render () {
    const entity = this.props.entity;
    const components = entity ? entity.components : {};
    const renderedComponents = Object.keys(components).filter(function (key) {
      return (DEFAULT_COMPONENTS.indexOf(key) === -1) && (HIDDEN_COMPONENTS.indexOf(key) === -1);
    }).sort().map(function (key) {
      return <Component
        component={components[key]}
        entity={entity}
        key={key}
        name={key}/>;
    });

    // <AddComponent entity={entity}/>

    return (
      <div className='components'>
        <CommonComponents entity={entity}/>
        {renderedComponents}
      </div>
    );
  }
}
