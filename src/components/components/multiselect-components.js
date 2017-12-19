import React from 'react'
import PropTypes from 'prop-types'
import Collapsible from '../Collapsible'
import {updateMultupleEntities} from '../../actions/entity'
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
    console.log(name, value)
    updateMultupleEntities(this.props.entities, 'position', value)
    //gaTrackComponentUpdate();
  }

  onScaleChange = (name, value) => {
    console.log(name, value)
    updateMultupleEntities(this.props.entities, 'scale', value)
    //gaTrackComponentUpdate();
  }

  onVisibilityChange = (name, value) => {
    console.log(name, value)
  }

  renderCommonAttributes () {
    return [
      // Position
      <div className='row'>
        <label htmlFor={'position'} className='text' title="Position">Position</label>
        <Vec3Widget onChange={this.onPositionChange} value={{x: 0, y: 0, z: 0}}/>
      </div>,
      // Rotaton - TODO: find a way how to properly rotate multiple objects
      // <Vec3Widget {...widgetProps}/>,
      // Scale
      <div className='row'>
        <label htmlFor={'scale'} className='text' title="Scale">Scale</label>
        <Vec3Widget onChange={this.onScaleChange} value={{x: 0, y: 0, z: 0}}/>
      </div>,
      // Visibility
      <div className='row'>
        <label htmlFor={'visibility'} className='text' title="Visibility">Visibility</label>
        <BooleanWidget onChange={this.onVisibilityChange} />
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
