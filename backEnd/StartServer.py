from Websockets import socketio, app

debug_mode = True
socketio.run(app, host='0.0.0.0', port=5000, debug=debug_mode)
