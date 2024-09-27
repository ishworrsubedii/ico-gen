"""
Created By: ishwor subedi
Date: 2024-09-22
"""
import re


def validate_svg(svg_code: str) -> bool:
    return bool(re.search(r'<svg[^>]*>.*</svg>', svg_code, re.DOTALL))
