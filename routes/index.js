const express = require("express");
const axios = require('axios');
const router = express.Router();
const { translate } = require("../handlers/translate");
const { texttospeech } = require("../handlers/texttospeech");

console.log("toto2");

const DEEPL_API_KEY = '3d8c50fe-ffac-49c8-bf95-ba3deed8bf6d:fx';
const TTSMAKER_ENDPOINT = 'https://api.ttsmaker.com/api/tts/generate';


/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express", content: "Bonjour tout le monde" });
});
/* route pour la traduction et la génération audio */
// router.post("/translate", function async (req, res, next) {
//   try{
//     translate();
//     const translateResponse = await axios.post(
//       'https://api-free.deepl.com/v2/translate',
//       new URLSearchParams({
//         'auth_key': DEEPL_API_KEY,
//         'text': req.body.text,
//         'target_lang': req.body.lang,
//       })
//     )
//     const textTraduct= translateResponse.data.translations[0].text
//   }
  
// });

module.exports = router;
