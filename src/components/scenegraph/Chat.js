import React from 'react';

export default class Chat extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      messages: [],
      content: [],
      emojis: ['😂', '😜', '😊', '😮', '😢', '💩', '🎉']
    }
  }

  focussed () {
    return document.activeElement && document.activeElement.nodeName === 'INPUT'
  }

  scrollToBottom () {
    const el = this.chatMessages

    if (el && el.lastChild) {
      el.lastChild.scrollIntoView({ behavior: 'smooth' })
    }
  }

  componentDidMount () {
    document.body.addEventListener('keydown', (e) => {
      if (this.focussed) {
        return
      }

      if (e.keyCode === 13) {
        this.inputField.focus()
      }
    })

    this.props.webrtcClient.on('chat', (packet) => {
      this.addMessage({
        user: packet.user,
        content: packet.content
      })
    })
    this.props.webrtcClient.on('emote', (packet) => {
      /* if (!packet.user.avatar) {
        return
      } */

      //packet.user.avatar.emote(packet.emoji)

      this.addMessage({
        user: packet.user,
        content: packet.emoji
      })
    })
  }

  componentDidUpdate () {
    this.scrollToBottom()
  }

  addMessage (message) {
    this.setState({
      messages: this.state.messages.concat([message])
    })
  }

  send (e) {
    const { webrtcClient } = this.props
    const content = e.target.value

    if (content === '') {
      return
    }

    const message = {
      user: { name: 'Me', uuid: 'Me' },
      content
    }

    this.addMessage(message)
    webrtcClient.sendChat(message)

    this.setState({
      content: ''
    })

    // Clear input field
    this.inputField.value = ""
    // Don't loose focus after sending the message
    this.inputField.focus()
  }

  sendEmote (emoji) {
    const { webrtcClient } = this.props
    const message = {
      user: { name: 'Me', uuid: 'Me' },
      content: emoji
    }

    this.addMessage(message)
    webrtcClient.sendEmote(emoji)

    this.setState({
      content: ''
    })

    // Clear input field
    this.inputField.value = ""
    // Don't loose focus after sending the message
    this.inputField.focus()
  }

  onKeyDown (e) {
    if (e.keyCode === 13) {
      e.preventDefault()
      this.send(e)
    }

    if (e.keyCode === 27) {
      this.blur()
    }
  }

  blur () {
    this.inputField.blur()
    document.querySelector('canvas').focus()
  }

  render () {
    const messages = this.state.messages.map((m, index) => {
      return <div key={index}><b>{m.user.uuid.slice(0, 4)}:</b> {m.content}</div>
    })

    const emojis = this.state.emojis.slice(0, 7).map((e, index) => {
      return <button onClick={() => this.sendEmote(e)} key={index}>{e}</button>
    })

    return (
      <div className={`chat`}>
        <h3>Chat</h3>

        <div
          ref={(e) => { this.chatMessages = e }}
          className='chat__messages'
          style={{ overflow: 'auto' }} // somehow the CSS gets rewritten so using force
        >
          {messages}
        </div>

        <div className='chat__emoji'>{emojis}</div>

        <input
          className='chat__input'
          type='text'
          defaultValue={this.state.content}
          ref={(e) => { this.inputField = e }}
          onKeyUp={(e) => (this.setState({content: e.target.value}))}
          onKeyDown={this.onKeyDown.bind(this)}
          />
      </div>
    )
  }
}
