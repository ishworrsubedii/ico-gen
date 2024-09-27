"""
Created By: ishwor subedi
Date: 2024-09-22
"""
from fastapi.responses import JSONResponse


def api_success_response(data):
    return JSONResponse(
        status_code=200,
        content={
            'status': 'success',
            'data': data
        }
    )


def api_error_response(error, status_code=400):
    return JSONResponse(
        status_code=status_code,
        content={
            'status': 'error',
            'message': error
        }
    )
