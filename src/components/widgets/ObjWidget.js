import React from 'react';
import PropTypes from 'prop-types';
import INSPECTOR from '../../lib/inspector';
import { env } from 'decentraland-commons';

const EDITOR_URL = env.get('EDITOR_URL', '');

var Events = require('../../lib/Events.js');

export default class ObjWidget extends React.Component {
  static propTypes = {
    componentname: PropTypes.string,
    entity: PropTypes.object,
    mapName: PropTypes.string,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    value: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string
    ]),
  };

  static defaultProps = {
    value: '',
    mapName: 'nomap',
    dataURL: ''
  };

  constructor (props) {
    super(props);
    this.state = {value: this.props.value || ''};
  }

  componentDidMount () {
    this.setState({ value: this.props.value || ''});
  }

  componentWillReceiveProps (newProps) {
    var component = this.props.entity.components[this.props.componentname];
    if (!component) { return; }
    var newValue = component.attrValue[this.props.name];

    // This will be triggered typically when the element is changed directly with element.setAttribute
    if (newValue && newValue !== this.state.value) {
      this.setState({value: newValue});
    }
  }

  notifyChanged = (value) => {
    if (this.props.onChange) {
      this.props.onChange(this.props.name, value);
    }
    this.setState({value: value});
  }

  onChange = e => {
    var value = e.target.value;
    this.setState({value: value});
    this.notifyChanged(value);
  }

  removeMap = e => {
    this.setState({value: ''});
    this.notifyChanged('');
  }

  readFile (event) {
    const file = event.target.files[0]
    const reader = new FileReader();
    reader.onload = (event) => {
      this.uploadFile(event.target.result.replace(/^data:.+?,/, ''), file.name)
    }
    reader.readAsDataURL(file)
  }

  uploadFile (data, path) {
    return fetch(`${EDITOR_URL}/api/ipfs`, {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ files: [{ data, path }] })
    }).then(res => res.json()).then(res => {
      if (!res.success) {
        throw new Error(res.error)
      }

      const value = `https://gateway.ipfs.io/ipfs/${res.url}/${path}`

      this.setState({value})
      this.notifyChanged(value)

      return res.url
    })
  }

  render () {
    let hint = 'Upload OBJ';

    return (
      <span className='texture'>
        <div className='texture-uploader'>
          <canvas ref='canvas' width='32' height='24' title={hint}></canvas>
          <input  type='file' onChange={this.readFile.bind(this)} />
        </div>
        <input className='map_value string' type='text' title={hint} value={this.state.value} onChange={this.onChange}/>
        <a onClick={this.removeMap} className='button fa fa-times'></a>
      </span>
    );
  }
}
