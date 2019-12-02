'use strict'

const Mail = use('Mail')

class ShareEventMail {
  static get concurrency () {
    return 1
  }

  static get key () {
    return 'ShareEventMail-job'
  }

  async handle ({ email, username, event }) {
    await Mail.send(['emails.share_event'], { username, event }, message => {
      message
        .to(email)
        .from('oi@rocketseat.com.br', 'Rocketseat')
        .subject(`Evento: ${event.name}`)
    })
  }
}

module.exports = ShareEventMail
