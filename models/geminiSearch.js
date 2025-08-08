"use strict";

const axios = require("axios");
require("dotenv").config();
const { BadRequestError } = require("../expressError");

// BELOW USING OPEN ROUTER ----------------------------------------------
const OPRO_GEMINI2_KEY = process.env.OPRO_GEMINI2_KEY;
const OPRO_GEMINI2_URL =
  process.env.OPRO_GEMINI2_URL ||
  "https://openrouter.ai/api/v1/chat/completions";
// --------------------------------------------------------------

class GeminiSearch {
  // BELOW USING OPEN ROUTER------------------------
  static async ask(content) {
    // Send a request to Gemini AI and return the response. TEST FOR Future Requests
    try {
      console.log("GEMINI KEY:", OPRO_GEMINI2_KEY);
      const response = await axios.post(
        OPRO_GEMINI2_URL,
        {
          model: "google/gemini-2.5-pro",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant. Provide only the most direct and concise answer.",
            },
            {
              role: "user",
              content: content,
            },
          ],
          top_p: 1,
          temperature: 0.3,
          max_tokens: 500,
          frequency_penalty: 0,
          presence_penalty: 0,
          repetition_penalty: 1,
          top_k: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${OPRO_GEMINI2_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      const answer = response.data.choices[0].message.content;
      return answer;
    } catch (err) {
      console.error(
        "Error calling Gemini API:",
        err.response?.data || err.message
      );
      throw new BadRequestError("Failed to fetch Ask Response");
    }
  }
  static async similarUserDescript(userDescript) {
    // Sends a User's description of a book and asks Gemini for similar books along with reasoning.
    try {
      const response = await axios.post(
        OPRO_GEMINI2_URL,
        {
          model: "google/gemini-2.5-pro",
          messages: [
            {
              role: "system",
              content: `
           You are a book recommendation assistant. You must return ONLY a valid JSON object. Do not explain your process, reasoning, or thought steps. Do not include markdown, commentary, or plain text.

            INSTRUCTION:
            - Based on the user's description, list EXACTLY 15 books.
            - Each book should be returned as a JSON object with two keys: "title" and "reason".
            - The "reason" must explicitly connect the given description explaining why the suggested book is similar to the given book. All elements such as plot, characters, and setting should be taken into account. Focus on related to the given description.
            - The final JSON must contain one key: "Recommendations", mapping to an array of 15 such objects.
            - DO NOT return markdown, extra commentary, or anything outside the JSON.
            - Format exactly like this:

              {
                "Recommendations": [
                      {
                        "title": "Example Book Title",
                        "reason": "A brief 4–6 sentence reason for the recommendation."
                      },
                  ...
                  (15 total items)
                ]
              }

            EXAMPLE INPUT:
                    userDescript = I'm looking for a book about a young hero who discovers a hidden magical world and must battle dark forces.

            EXAMPLE JSON OUTPUT: 
                   {
                        "Recommendations": [
                            {
                                "title": "Harry Potter",
                                "reason": "This novel follows a young hero, Harry, as he discovers the hidden magical world of Hogwarts. 
                                    It blends adventure, friendship, and the battle between good and evil, perfectly matching your description."
                            },
                            {
                                "title": "Percy Jackson",
                                "reason": "Percy, like your hero, is thrust into a hidden world—Greek mythology come to life. 
                                    The fast-paced narrative, humor, and rich mythological elements make it an exciting and immersive read."
                            }
                        ]
                   }
            `,
            },
            {
              role: "user",
              content: `
              List 15 books similar based on this description: ${userDescript}. For each book, provide a short reason (max 6 sentences) explaining why it's a good recommendation. With Out Duplicate Books. Return the result as a JSON object with a key 'Recommendations' containing a list of objects.
              Return ONLY valid JSON in this exact format:
{
  "Recommendations": [
    { "title": "...", "reason": "..." }
  ]
}
Do not add any other text, commentary, or markdown.
}
              `,
            },
          ],
          top_p: 1,
          temperature: 0.6,
          max_tokens: 4000,
          frequency_penalty: 0,
          presence_penalty: 0,
          repetition_penalty: 1,
          top_k: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${OPRO_GEMINI2_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const raw_result = response.data.choices?.[0]?.message?.content;
      const match = raw_result.match(/```json\s*([\s\S]*?)\s*```/);

      try {
        if (match) {
          if (match) {
            const jsonString = match[1];
            const jsonData = JSON.parse(jsonString);
            console.log("JSON DATA:", jsonData);
            return jsonData;
          }
        }
      } catch (err) {
        console.error("Failed to parse response as JSON:", err.message);
        throw new BadRequestError("Gemini did not return valid JSON");
      }
    } catch (err) {
      console.error(
        "Error calling Gemini API:",
        err.response?.data || err.message
      );
      throw new BadRequestError("Failed to fetch Book by Description Response");
    }
  }

  static async similarCoverDescript(coverDescript) {
    // Sends a User's description of a book's Cover and asks Gemini for similar books that looks somewhat the same.
    try {
      console.log("GEMINI KEY:", OPRO_GEMINI2_KEY);
      const response = await axios.post(
        OPRO_GEMINI2_URL,
        {
          model: "google/gemini-2.5-pro",
          messages: [
            {
              role: "system",
              content: `
            You are a book recommendation assistant. You must return ONLY a valid JSON object. Do not explain your process, reasoning, or thought steps. Do not include markdown, commentary, or plain text.

            INSTRUCTION:
            - The user will provide a text description of a book cover's visual elements, aesthetic, or common imagery.
            - Based on this textual description of a book cover, list EXACTLY 15 books.
            - Each book should be returned as a JSON object with two keys: "title" and "reason".
            - The "reason" must explicitly connect the recommended book to the *visual elements or aesthetic described in the user's input*, explaining why its cover (or the common imagery associated with it) would match the description. Do NOT explain the plot.
            Match the visual description from the input.
            - The final JSON must contain one key: "Recommendations", mapping to an array of 15 such objects.
            - DO NOT return markdown, extra commentary, or anything outside the JSON.
            - Format exactly like this:

              {
                "Recommendations": [
                      {
                        "title": "Example Book Title",
                        "reason": "A brief 4-6 sentence reason for the recommendation, focusing on how its cover (or the book's visual representation) matches the description."
                      },
                      ...
                      (15 total items)
                ]
              }

            EXAMPLE INPUT (User will provide a description like this):
            "A book cover with a young boy flying on a broomstick, wearing big round glasses, and an owl."

            EXAMPLE JSON OUTPUT:
            {
                "Recommendations": [
                    {
                        "title": "Harry Potter and the Sorcerer's Stone",
                        "reason": "This book's iconic cover features Harry himself, often shown flying on a broomstick with his signature round glasses, and Hedwig the owl is a prominent visual. The magical, adventurous aesthetic perfectly aligns with the described elements."
                    },
                    {
                        "title": "The Worst Witch",
                        "reason": "The description of a young protagonist with magical elements on a cover might bring to mind 'The Worst Witch.' Its covers often depict a young witch learning to fly and dealing with magical mishaps, fitting the whimsical, magical theme."
                    },
                    // ... 13 more items
                ]
            }
            `,
            },
            {
              role: "user",
              content: `
              List 15 books with covers similar to this description: ${coverDescript}. For each book, provide a short reason (max 6 sentences) explaining why its cover visually matches the description. Return the result as a JSON object with a key 'Recommendations' containing a list of objects.Focus heavely on the look of the cover. Focus on how  the cover look on the google books website.
              `,
            },
          ],
          top_p: 1,
          temperature: 0.6,
          max_tokens: 4000,
          frequency_penalty: 0,
          presence_penalty: 0,
          repetition_penalty: 1,
          top_k: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${OPRO_GEMINI2_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const raw_result = response.data.choices?.[0]?.message?.content;
      const match = raw_result.match(/```json\s*([\s\S]*?)\s*```/);

      try {
        if (match) {
          if (match) {
            const jsonString = match[1];
            const jsonData = JSON.parse(jsonString);
            console.log("JSON DATA:", jsonData);
            return jsonData;
          }
        }
      } catch (err) {
        console.error("Failed to parse response as JSON:", err.message);
        throw new BadRequestError("Gemini did not return valid JSON");
      }
    } catch (err) {
      console.error(
        "Error calling Gemini API:",
        err.response?.data || err.message
      );
      throw new BadRequestError("Failed to fetch Book by Description Response");
    }
  }

  static async similarBookDescript(book) {
    // Sends a User's description of a book and asks DeepSeek for similar books along with reasoning.
    try {
      console.log("GEMINI KEY:", OPRO_GEMINI2_KEY);
      console.log("Model SimBook book:", book);
      const response = await axios.post(
        OPRO_GEMINI2_URL,
        {
          model: "google/gemini-2.5-pro",
          messages: [
            {
              role: "system",
              content: `
            You are a book recommendation assistant. You must return ONLY a valid JSON object. Do not explain your process, reasoning, or thought steps. Do not include markdown, commentary, or plain text.

            INSTRUCTION:
            - The user will provide a given book description and a book title.
            - Based on this given book description and how the suggested book is similar, list EXACTLY 15 books.
            - Each book should be returned as a JSON object with two keys: "title" and "reason".
            - The "reason" must explicitly connect the given book description explaining why the suggested book is similar to the given book. All elements such as plot, characters, and setting should be taken into account. Focus on related to the given book description.
            - The final JSON must contain one key: "Recommendations", mapping to an array of 15 such objects.
            - DO NOT return markdown, extra commentary, or anything outside the JSON.
            - Format exactly like this:

              {
      
                "Recommendations": [
                      {
                        "title": "Example Book Title",
                        "reason": "A brief 4–6sentence reason for the recommendation."
                      },
                  ...
                  (15 total items)
                ]
              }
              }

            EXAMPLE INPUT:
                  book.title = Harry Potter and the Chamber of Secrets

                  book.description = 
                    Ever since Harry Potter had come home for the summer, the Dursleys had been so mean and hideous that all Harry wanted was to get back to the Hogwarts School for Witchcraft and Wizardry. But just as he’s packing his bags, Harry receives a warning from a strange impish creature who says that if Harry returns to Hogwarts, disaster will strike.

                    And strike it does. For in Harry’s second year at Hogwarts, fresh torments and horrors arise, including an outrageously stuck-up new professor and a spirit who haunts the girls’ bathroom. But then the real trouble begins – someone is turning Hogwarts students to stone. Could it be Draco Malfoy, a more poisonous rival than ever? Could it possibly be Hagrid, whose mysterious past is finally told? Or could it be the one everyone at Hogwarts most suspects… Harry Potter himself!

            EXAMPLE JSON OUTPUT:
            {
                        "Recommendations": [
                            {
                                "title": "Harry Potter",
                                "reason": "This novel follows a young hero, Harry, as he discovers the hidden magical world of Hogwarts. 
                                    It blends adventure, friendship, and the battle between good and evil, perfectly matching your description."
                            },
                            {
                                "title": "Percy Jackson",
                                "reason": "Percy, like your hero, is thrust into a hidden world—Greek mythology come to life. 
                                    The fast-paced narrative, humor, and rich mythological elements make it an exciting and immersive read."
                            }
                        ]
                   }
            `,
            },
            {
              role: "user",
              content: `
              List 15 books that are similar ${book.title} to this description: ${book.description}. For each book, provide a short reason (max 6 sentences) explaining it's a good recommendation. Return the result as a JSON object with a key 'Recommendations' containing a list of objects.
              `,
            },
          ],
          top_p: 1,
          temperature: 0.6,
          max_tokens: 4000,
          frequency_penalty: 0,
          presence_penalty: 0,
          repetition_penalty: 1,
          top_k: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${OPRO_GEMINI2_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const raw_result = response.data.choices?.[0]?.message?.content;
      const match = raw_result.match(/```json\s*([\s\S]*?)\s*```/);

      try {
        if (match) {
          if (match) {
            const jsonString = match[1];
            const jsonData = JSON.parse(jsonString);
            console.log("JSON DATA:", jsonData);
            return jsonData;
          }
        }
      } catch (err) {
        console.error("Failed to parse response as JSON:", err.message);
        throw new BadRequestError("Gemini did not return valid JSON");
      }
    } catch (err) {
      console.error(
        "Error calling Gemini API:",
        err.response?.data || err.message
      );
      throw new BadRequestError("Failed to fetch Book by Description Response");
    }
  }
}

module.exports = GeminiSearch;
