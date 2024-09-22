"""
Created By: ishwor subedi
Date: 2024-09-22
"""
import google.generativeai as genai


class GeminiModel:
    def __init__(self, api_key, model="gemini-pro"):
        self.api_key = api_key
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model)

    def infer(self, description: str)->str:
        return self.model.generate_content(description).text
