'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.0/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.post('users', 'UserController.store').validator('User/Store')
Route.post('sessions', 'SessionController.store').validator('Session')

Route.post('passwords', 'ForgotPasswordController.store').validator(
  'Password/Forgot'
)
Route.put('passwords', 'ForgotPasswordController.update').validator(
  'Password/Reset'
)

Route.group(() => {
  Route.resource('events', 'EventController')
    .apiOnly()
    .validator(
      new Map([
        [['events.store'], ['Event/Store']],
        [['events.update'], ['Event/Update']]
      ])
    )

  Route.post('events/:events_id/share', 'ShareEventController.share').validator(
    'Event/Share'
  )

  Route.put('users/:id', 'UserController.update').validator('User/Update')
}).middleware('auth')
