'use strict'

const Event = use('App/Models/Event')
const Kue = use('Kue')
const Job = use('App/Jobs/ShareEventMail')

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class ShareEventController {
  /**
   * Create/save a new event.
   * POST events
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */

  async share ({ request, response, params, auth }) {
    const event = await Event.findOrFail(params.events_id)
    const email = request.input('email')

    if (event.user_id !== auth.user.id) {
      return response.status(401).send({
        error: {
          message: 'Apenas o criador do evento pode compartilha-lo.'
        }
      })
    }

    Kue.dispatch(
      Job.key,
      { email, username: auth.user.username, event },
      { attempts: 3 }
    )

    return email
  }
}

module.exports = ShareEventController
