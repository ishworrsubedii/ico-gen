"""
Created By: ishwor subedi
Date: 2024-09-22
"""
from fastapi.routing import APIRouter
from fastapi import HTTPException

from icogen_core.src.models.pydantic_model import ICONIFYModel
from icogen_core.src.pipeline.pipeline import ICOGen
from icogen_core.src.utils.txtutils import api_success_response, api_error_response

ico_gen_pipeline = ICOGen()

ico_gen_router = APIRouter()


@ico_gen_router.post("/generate_icon")
async def generate_icon(request: ICONIFYModel):
    try:
        icon_data = ico_gen_pipeline.generate_icon(request.prompt)
        return api_success_response(icon_data)
    except Exception as e:
        return api_error_response(f"Icon generation failed: {str(e)}")

