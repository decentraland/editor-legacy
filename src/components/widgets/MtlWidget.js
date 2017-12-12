import React from 'react';
import PropTypes from 'prop-types';
import INSPECTOR from '../../lib/inspector'
import { extname } from 'path'

const EDITOR_URL = process.env.REACT_APP_EDITOR_URL || process.env.EDITOR_URL || 'https://editor.decentraland.org';

var Events = require('../../lib/Events.js')

export default class MtlWidget extends React.Component {
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
    this.state = {uploading: false, value: this.props.value || ''};
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
    var files = []
    var mtlPath

    Array.from(event.target.files).forEach((file) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const data = event.target.result.replace(/^data:.+?,/, '')
        const path =  file.name

        if (extname(path).toLowerCase() === '.mtl') {
          mtlPath = path
        }

        files.push({ data, path })
      }

      reader.readAsDataURL(file)
    })

    // Fixme - use promises to make sure all uploaded...
    setTimeout(() => {
      this.uploadFile(mtlPath, files)
    }, 500)
  }

  uploadFile (mtlPath, files) {
    this.setState({ uploading: true })

    return fetch(`${EDITOR_URL}/api/ipfs`, {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ files: files })
    }).then(res => res.json()).then(res => {
      if (!res.success) {
        throw new Error(res.error)
      }

      const value = `https://gateway.ipfs.io/ipfs/${res.url}/${mtlPath}`

      this.setState({ uploading: false, value})
      this.notifyChanged(value)

      return res.url
    }).catch(err => {
      alert(`Error uploading file, may be too large\n\n${err}`)
      this.setState({ uploading: false })
    })
  }

  render () {
    let hint = 'Upload MTL';

    if (this.state.uploading) {
      return <span className='texture'>Uploading...</span>
    }

    return (
      <span className='texture'>
        <div className='texture-uploader'>
          <canvas ref='canvas' width='32' height='24' title={hint}></canvas>
          <input title='Multiselect the .mtl file and associated textures to upload all files to ipfs' type='file' multiple onChange={this.readFile.bind(this)} />
        </div>
        <input className='map_value string' type='text' title={hint} value={this.state.value} onChange={this.onChange}/>
        <a onClick={this.removeMap} className='button fa fa-times'></a>
      </span>
    );
  }
}
