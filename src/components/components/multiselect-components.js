import React from 'react';
import PropTypes from 'prop-types';
import {InputWidget} from '../widgets';
import DEFAULT_COMPONENTS from './DefaultComponents';
import PropertyRow from './PropertyRow';
import Collapsible from '../Collapsible';
import Mixins from './Mixins';
import {updateEntity, getClipboardRepresentation} from '../../actions/entity';
import Events from '../../lib/Events';
import Clipboard from 'clipboard';
import {saveString} from '../../lib/utils';
import HtmlWidget from '../widgets/HtmlWidget';

// @todo Take this out and use updateEntity?
// function changeId (componentName, value) {
//   var entity = AFRAME.INSPECTOR.selectedEntity;
//   if (entity.id !== value) {
//     entity.id = value;
//     Events.emit('entityidchanged', entity);
//   }
// }

export default class MultiselectComponents extends React.Component {
  static propTypes = {
    entities: PropTypes.array
  };

  componentDidMount () {
    // Events.on('selectedentitycomponentchanged', detail => {
    //   if (DEFAULT_COMPONENTS.indexOf(detail.name) !== -1) {
    //     this.forceUpdate();
    //   }
    // });
  }

  renderCommonAttributes () {
    const entities = this.props.entities;
    return entities.map(entity => {
      const components = entity ? entity.components : {};
      return Object.keys(components).filter(function (key) {
        return DEFAULT_COMPONENTS.indexOf(key) !== -1;
      }).sort().map(componentName => {
        const componentData = components[componentName];
        const schema = AFRAME.components[componentName].schema;
        return (
          <PropertyRow onChange={updateEntity} key={componentName} name={componentName}
            showHelp={true} schema={schema} data={componentData.data}
            isSingle={true} componentname={componentName} entity={entity}/>
        );
      });
    })
  }

  render () {
    return (
      <Collapsible>
        <div className='collapsible-header'>
          <span className='entity-name'>Test</span>
        </div>
        <div className='collapsible-content'>
          {this.renderCommonAttributes()}
        </div>
      </Collapsible>
    );
  }
}
