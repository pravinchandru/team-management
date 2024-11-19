from core.settings import base
from django.http import JsonResponse
from .role import Role

class APIMixin():
    def error_response(self, general_errors=None, status=None):
        failure_error = general_errors if general_errors else "An Unknown error occured."
        response_json = {
            "status": "FAIL",
            "errors": {
                "message": failure_error
            }
        }
        return JsonResponse(response_json, status = status) if status else JsonResponse(response_json)

    def success_response(self, response_data, data, status=None):
        response_data.update({
            'status': 'success'
            
        })
        if data:
            response_data.update({
            'data': data
            })

        if not status:
            return JsonResponse(response_data)
        else:
            return JsonResponse(response_data, status=status)