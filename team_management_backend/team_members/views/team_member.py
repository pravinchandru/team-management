# team_members/views/team_member.py
from rest_framework import viewsets, status
from django.http import JsonResponse
from ..models.team_member import TeamMember
from ..serializers.team_member import TeamMemberSerializer
from ..util.mixins import APIMixin
from rest_framework.exceptions import ValidationError
import logging
logger = logging.getLogger(__name__)

class TeamMemberViewSet(viewsets.ModelViewSet, APIMixin):
    serializer_class = TeamMemberSerializer    
    def get_queryset(self):
        queryset = TeamMember.objects.all()
        return queryset

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            
            # Create custom response
            response_data = {
                'count': len(serializer.data)
            }
            return self.success_response(response_data, serializer.data, status.HTTP_200_OK)
        except Exception as e:
            logger.exception('list failed', e)
            return self.error_response(e)

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            response_data = {}
            return self.success_response(response_data, serializer.data, status.HTTP_200_OK)
        except Exception as e:
            error = getattr(e, 'message', repr(e))
            print("error", error)
            return self.error_response(error, status= status.HTTP_404_NOT_FOUND)
        
        

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            print("data", request.data)
            print("serializer", serializer)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            response_data = {
                'message': 'Team member created successfully'
            }
            return self.success_response(response_data, serializer.data, status.HTTP_201_CREATED)
        except ValidationError as e:
            logger.exception('create failed due to validation checks: %s' % e)
            raise e
        except Exception as e:
            logger.exception('create failed: %s' % e)
            return self.error_response(str(e))    
        
        

    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)

            response_data = {
                'message': 'Team member updated successfully'
            }
            return self.success_response(response_data, serializer.data)
        except ValidationError as e:
            logger.exception('update failed due to validation checks: %s' % e)
            raise e
        except Exception as e:
            logger.exception('update failed: %s' % e)
            return self.error_response(e)    
        

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            instance.delete()
            
            response_data = {
                'message': 'Team member deleted successfully'
            }
            return self.success_response(response_data, None, status.HTTP_200_OK)
        except Exception as e:
            logger.exception('destroy failed')
            return self.error_response(e)
        