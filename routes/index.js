const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
// const translatePage =require("../views/translate.ejs")
// const { translate } = require("../handlers/translate");

console.log("toto2");
const DEEPL_API_KEY = "3d8c50fe-ffac-49c8-bf95-ba3deed8bf6d:fx";

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

const getTTSToken = async () => {
  const azureTtsApiKey = "6a27f550473b45aeba041a4cf36a45d2";
  const azureTtsEndpoint =
    "https://northeurope.api.cognitive.microsoft.com/sts/v1.0/issueToken";

  try {
    const tokenResponse = await fetch(azureTtsEndpoint, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": azureTtsApiKey,
      },
    });
    if (!tokenResponse.ok) {
      throw new Error(
        `Erreur lors de l'obtention du jeton : ${tokenResponse.status} ${tokenResponse.statusText}`
      );
    } else {
      const token = await tokenResponse.text();
      return token;
    }
  } catch (error) {
    console.error(`Erreur : ${error}`);
  }
};

router.post("/translate", async function (req, res, next) {
  try {
    const { texte, langue } = req.body;
    if (!texte || !langue) {
      return res.status(400).send({ error: "Texte ou langue manquants." });
    }

    // translate(texte, langue);

    const params = {
      text: [texte],
      target_lang: langue.toUpperCase(),
    };

    const traductionResponse = await fetch(
      "https://api-free.deepl.com/v2/translate",
      {
        method: "POST",
        headers: {
          Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      }
    );

    const traductionData = await traductionResponse.json();
    if (
      !traductionData.translations ||
      traductionData.translations.length === 0
    ) {
      throw new Error("Erreur de traduction");
    }
    const texteTraduit = traductionData.translations[0].text;

    const token = await getTTSToken();

    try {
      const ttsResponse = await fetch(
        "https://northeurope.tts.speech.microsoft.com/cognitiveservices/v1",
        {
          method: "POST",
          headers: {
            "X-Microsoft-OutputFormat": "riff-24khz-16bit-mono-pcm",
            "Content-Type": "application/ssml+xml",
            Authorization: `Bearer ${token}`,
            "User-Agent": "*",
          },
          body: `<speak version="1.0" xml:lang="en-US">
          <voice xml:lang='en-US' xml:gender='Female' name='en-US-AvaMultilingualNeural'>
              ${texteTraduit}
          </voice>
        </speak>
      `,
        }
      );
      if (!ttsResponse.ok) {
        throw new Error(`Erreur lors de la génération du texte à voix haute : ${ttsResponse.status}
        ${ttsResponse.statusText}`);
      } else 
      {
        const response = await ttsResponse.arrayBuffer();
        const audioData = new Uint8Array(response);
        const blob = new Blob([audioData], { type: "audio/wav" });
        // const url = URL.createObjectURL(blob);
        res.set("Content-Type", "audio/wav");
        res.set("Content-Length", blob.size);
        res.set("Content-Disposition", `attachment; filename="audio.wav"`);
        const buffer = Buffer.from(await blob.arrayBuffer());
        res.write(buffer);
        res.end();
              // Return the URL as a string
              // const audioUrl = url;
              // Example usage:
              // console.log(audioUrl);

              // res.type("audio/x-wav");
              // res.send(blob);
      }
      } catch (error) 
      {
      console.error(error);
      }
      
    // :::::::::::::::::::::::::::: Envoyer vers un server ::::::::::::::::::::::::::::::::::::::::::::

    // 1) Create a new FormData object to send the audio data to the server

    // const formData = new FormData();
    // formData.append('audio', new Blob([audioData], { type: 'audio/wav' }));

    // 2) Send the audio data to the server using a POST request

    // const serverUrl = 'https://your-server.com/upload-audio';
    // const serverResponse = await fetch(serverUrl, {
    //   method: 'POST',
    //   body: formData,
    // });

    // 3) Check if the server response was successful

    // if (serverResponse.ok) {
    //   console.log('Audio uploaded successfully!');
    // } else {
    //   console.error('Error uploading audio:', serverResponse.status);
    // }

    //::::::::::::::::::::::: Exemple avec TTSMAKER & FormData:::::::::::::::::::::::::::::::::::::::::::

    // Génération de la réponse audio avec TTSMaker
    // const form = new FormData();
    // form.append("text", texteTraduit);
    // form.append("language", langue);
    // form.append("voice_id", 1480);
    // form.append("audio_format", "mp3");
    // const ttsResponse = await fetch(TTSMAKER_ENDPOINT, {
    //   method: "POST",
    //   body: form,
    //   headers: {
    //     "Content-Type": "multipart/form-data",
    //   },
    // });
    // if (!ttsResponse.ok) {
    //   throw new Error(
    //     `TTSMaker API error: ${ttsResponse.status} ${ttsResponse.statusText}`
    //   );
    // }
    // console.log(ttsResponse);
    // const audioBuffer = await ttsResponse.arrayBuffer();

    // Réponse sous forme de flux audio
    // res.setHeader("Content-Type", "audio/mpeg");
    // res.setHeader("Content-Length", audioBuffer.byteLength);
    // res.send(Buffer.from(audioBuffer));
      } catch (error) {
        console.error(error);
        res.status(500).send({
          error: "Erreur lors de la traduction ou de la génération audio.",
        });
      }
    });

module.exports = router;
