const config = require("../config/project.config")
const server = require("../server/main")
const debug = require("debug")("app:bin:server")
// get the port from the config
const port = config.server_port

server.listen(port)
debug(`Server is now running at http://localhost:${port}`)
