var React = require('react');
import PropTypes from 'prop-types';

// Fixme - only strip uuid from inside tags
function stripUUID (html) {
  return html.toString().replace(/data-uuid=".+?"/g, "")
}

export default class HtmlWidget extends React.Component {
  static propTypes = {
    entity: PropTypes.object,
    onChange: PropTypes.func,
    value: PropTypes.bool
  };

  static defaultProps = {
    value: false
  };

  constructor (props) {
    super(props);
    this.state = {value: this.unformatHTML(this.target.innerHTML) };
  }

  componentWillReceiveProps (newProps) {
    this.setState({value: this.unformatHTML(this.target.innerHTML) });
  }

  // Take HTML and make it editable
  unformatHTML (html) {
    return stripUUID(html).replace(/\n/g, '').replace(/<br\s*\/*>/g, '\n');
  }

  // Format and tidy the html
  formatHTML (html) {
    const markup = html.replace(/\n/g, '<br />')
    return new DOMParser().parseFromString(markup, "text/html").documentElement.innerHTML;
  }

  onInput = (e) => {
    var value = e.target.value;
    this.setState({value});
    this.target.innerHTML = this.formatHTML(value)
  }

  get target () {
    return this.props.entity
  }

  render () {
    var id = this.props.componentname + '.' + this.props.name;

    return (
      <div>
        <textarea 
          ref='input'
          wrap='soft'
          value={this.state.value}
          style={{width: '95%', height: '320px'}}
          onInput={this.onInput}></textarea>
      </div>
    );
  }
}
