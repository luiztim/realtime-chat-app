/* eslint-disable import/no-anonymous-default-export */

const LanguageTranslatorV3 = require("ibm-watson/language-translator/v3");
const { IamAuthenticator } = require("ibm-watson/auth");

export default async (req, res) => {
  const { message, translateFrom } = req.query;

  const translateTo = translateFrom === "en" ? "en-pt" : "pt-en";

  const languageTranslator = new LanguageTranslatorV3({
    version: "2018-05-01",
    authenticator: new IamAuthenticator({
      apikey: process.env.LANGUAGE_TRANSLATOR_APIKEY,
    }),
    serviceUrl: process.env.LANGUAGE_TRANSLATOR_URL,
  });

  const translateParams = {
    text: message,
    modelId: translateTo,
  };

  await languageTranslator
    .translate(translateParams)
    .then((translationResult) => {
      res
        .status(200)
        .json(translationResult.result.translations[0].translation);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json("Unable to translate text. Try again later");
    });
};
