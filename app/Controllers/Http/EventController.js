'use strict'

const Event = use('App/Models/Event')
const moment = require('moment')

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with events
 */
class EventController {
  /**
   * Show a list of all events.
   * GET events
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response }) {
    const { page, date } = request.get()

    let query = Event.query().with('user')

    if (date) {
      query = query.whereRaw(`"when"::date = ?`, date)
    }

    const events = await query.paginate(page)

    return events
  }

  /**
   * Create/save a new event.
   * POST events
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response, auth }) {
    const data = request.only(['name', 'where', 'when'])

    try {
      await Event.findByOrFail('when', data.when)

      return response.status(401).send({
        error: {
          message: 'Não é possível definir dois eventos no mesmo horário.'
        }
      })
    } catch (err) {
      const event = await Event.create({ ...data, user_id: auth.user.id })
      return event
    }
  }

  /**
   * Display a single event.
   * GET events/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, auth }) {
    const event = await Event.findOrFail(params.id)

    if (event.user_id !== auth.user.id) {
      return response.status(401).send({
        error: {
          message: 'Apenas o criador do evento pode vê-lo.'
        }
      })
    }

    return event
  }

  /**
   * Update event details.
   * PUT or PATCH events/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response, auth }) {
    const event = await Event.findOrFail(params.id)

    if (event.user_id !== auth.user.id) {
      return response.status(401).send({
        error: {
          message: 'Apenas o criador do evento pode edita-lo.'
        }
      })
    }

    const passed = moment().isAfter(event.when)

    if (passed) {
      return response.status(401).send({
        error: {
          message: 'Você não pode editar eventos passados.'
        }
      })
    }

    const data = request.only(['name', 'where', 'when'])

    try {
      const event = await Event.findByOrFail('when', data.when)
      if (event.id !== Number(params.id)) {
        return response.status(401).send({
          error: {
            message: 'Não é possível definir dois eventos no mesmo horário.'
          }
        })
      }
    } catch (err) {}

    event.merge(data)

    await event.save()

    return event
  }

  /**
   * Delete a event with id.
   * DELETE events/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, response, auth }) {
    const event = await Event.findOrFail(params.id)

    if (event.user_id !== auth.user.id) {
      return response.status(401).send({
        error: {
          message: 'Apenas o criador do evento pode excluí-lo.'
        }
      })
    }

    const passed = moment().isAfter(event.when)

    if (passed) {
      return response.status(401).send({
        error: {
          message: 'Você não pode excluir eventos passados.'
        }
      })
    }

    await event.delete()
  }
}

module.exports = EventController
