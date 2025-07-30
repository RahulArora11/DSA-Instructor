import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.API_KEY;

app.post('/api/genai', async (req, res) => {
    const userMessage = req.body.message;
    
    if (!userMessage) {
        return res.status(400).json({ error: 'No message provided' });
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

    const requestBody = {
        contents: [{ parts: [{ text: userMessage }] }],
        systemInstruction: {
            parts: {
                text: "You are a Data Structure and Algorithm INSTRUCTOR. You will only reply to the problem related to Data Structure and Algorithm. If the question is unrelated, you respond rudely but formatted in markdown."
            }
        }
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(500).json({ error: errorData.error.message || 'API error' });
        }

        const data = await response.json();
        res.json({ reply: data.candidates[0].content.parts[0].text });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
