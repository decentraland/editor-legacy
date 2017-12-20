import React from 'react'
import PropTypes from 'prop-types'
import Collapsible from '../Collapsible'
import {importEntity, updateMultupleEntities} from '../../actions/entity'
import Events from '../../lib/Events'
import Vec3Widget from '../widgets/Vec3Widget'
import BooleanWidget from '../widgets/BooleanWidget'

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

  onPositionChange = (name, value) => {
    updateMultupleEntities(this.props.entities, 'position', name, value)
  }

  onScaleChange = (name, value) => {
    updateMultupleEntities(this.props.entities, 'scale', name, value)
  }

  makeGroup = () => {
    const { entities } = this.props
    const group = document.createElement('a-entity')
    entities.forEach(entity => {
      importEntity(entity, group)
    })
    console.log(group)
  }

  renderCommonAttributes () {
    return [
      // Position
      <div className='row' key="position">
        <label htmlFor={'position'} className='text' title="position">position</label>
        <Vec3Widget onChange={this.onPositionChange} value={{x: 0, y: 0, z: 0}}/>
      </div>,
      // Scale
      <div className='row' key="scale">
        <label htmlFor={'scale'} className='text' title="scale">scale</label>
        <Vec3Widget onChange={this.onScaleChange} value={{x: 0, y: 0, z: 0}}/>
      </div>,
      <div className='row' key="make-group">
        <label htmlFor={'group'} className='text' title="group">Make group?</label>
        <button onClick={this.makeGroup}>Create group</button>
      </div>
    ]
  }

  render () {
    return (
      <Collapsible>
        <div className='collapsible-header'>
          <span className='entity-name'>Selection</span>
        </div>
        <div className='collapsible-content'>
          {this.renderCommonAttributes()}
        </div>
      </Collapsible>
    );
  }
}
