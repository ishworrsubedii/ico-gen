"""
Created By: ishwor subedi
Date: 2024-09-22
"""
import os

from icogen_core.src.services.llms.gemini import GeminiModel
from icogen_core.src.services.gen.svg_generator import icon_gen
from icogen_core.src.services.post_validation.validate_svg import validate_svg

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


class ICOGen:
    def __init__(self):
        self.model = GeminiModel(api_key=GEMINI_API_KEY, model="gemini-pro")

    def generate_icon(self, description: str) -> str:
        svg_code = icon_gen(self.model.infer, description)
        if validate_svg(svg_code):
            return svg_code
        else:
            svg_code = icon_gen(self.model.infer, description)

        return svg_code


if __name__ == '__main__':
    while True:
        description = input("Enter description: ")
        ico_gen = ICOGen()
        print(ico_gen.generate_icon(description))
