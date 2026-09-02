"use strict";
// ¿Qué? Punto de entrada de la aplicación Node.js.
// ¿Para qué? Arrancar el servidor web y escuchar en el puerto definido.
// ¿Impacto? Es el archivo que ejecuta pm2/docker/node en producción.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = __importDefault(require("./app.js"));
const config_js_1 = require("./config.js");
app_js_1.default.listen(config_js_1.config.PORT, () => {
    console.log(` Servidor TriDa corriendo en http://localhost:${config_js_1.config.PORT}`);
    console.log(` Entorno: ${config_js_1.config.NODE_ENV}`);
});
//# sourceMappingURL=index.js.map