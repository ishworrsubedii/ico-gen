"""
Created By: ishwor subedi
Date: 2024-09-22
"""
from icogen_core.src.services.template.prompt_template import prompt_template


def icon_gen(gen_, description: str):
    prompt = prompt_template.format(description=description)
    return gen_(prompt)
