from Websockets import socketio, app

debug_mode = True
socketio.run(app, host='127.0.0.1', port=5000, debug=debug_mode)
