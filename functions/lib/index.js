"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.medicalElitesAi = void 0;
const app_1 = require("firebase-admin/app");
(0, app_1.initializeApp)();
var medicalElitesAi_1 = require("./ai/medicalElitesAi");
Object.defineProperty(exports, "medicalElitesAi", { enumerable: true, get: function () { return medicalElitesAi_1.medicalElitesAi; } });
//# sourceMappingURL=index.js.map