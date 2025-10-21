from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from .models import Event, EventAttendee
import json
from datetime import datetime

User = get_user_model()

@csrf_exempt
def events_list(request):
    """Events API - GET all events, POST create event"""
    
    if request.method == 'GET':
        try:
            events = Event.objects.all().order_by('-date')
            data = {
                'count': events.count(),
                'results': []
            }
            
            for event in events:
                event_data = {
                    'id': event.id,
                    'title': event.title,
                    'description': event.description or '',
                    'event_type': event.event_type,
                    'date': event.date.isoformat() if event.date else None,
                    'location': event.location,
                    'status': event.status,
                    'max_attendees': event.max_attendees,
                    'organizer_name': event.organizer.username if event.organizer else 'System'
                }
                data['results'].append(event_data)
            
            return JsonResponse(data)
            
        except Exception as e:
            return JsonResponse({'error': f'Failed to get events: {str(e)}'}, status=500)
    
    elif request.method == 'POST':
        try:
            # Parse JSON data
            data = json.loads(request.body.decode('utf-8'))
            
            # Get or create default organizer
            organizer = User.objects.filter(is_superuser=True).first()
            if not organizer:
                organizer, created = User.objects.get_or_create(
                    username='system_organizer',
                    defaults={
                        'email': 'system@sbcc.org',
                        'first_name': 'System',
                        'last_name': 'Organizer'
                    }
                )
            
            # Handle date - convert from HTML datetime-local format
            event_date = data.get('date')
            if event_date:
                # Convert from HTML datetime-local format (YYYY-MM-DDTHH:MM) to datetime
                try:
                    # Parse the datetime string from HTML form
                    event_date = datetime.fromisoformat(event_date.replace('Z', '+00:00'))
                except (ValueError, AttributeError):
                    # Fallback: try different formats
                    try:
                        event_date = datetime.strptime(event_date, '%Y-%m-%dT%H:%M')
                    except ValueError:
                        event_date = None
            
            # Create the event
            event = Event.objects.create(
                title=data.get('title', ''),
                description=data.get('description', ''),
                event_type=data.get('event_type', 'other'),
                date=event_date,  # ← Use the parsed datetime object
                location=data.get('location', ''),
                status=data.get('status', 'published'),
                max_attendees=data.get('max_attendees') if data.get('max_attendees') else None,
                organizer=organizer
            )
            
            return JsonResponse({
                'id': event.id,
                'title': event.title,
                'message': 'Event created successfully!',
                'event': {
                    'id': event.id,
                    'title': event.title,
                    'date': event.date.isoformat() if event.date else None,
                    'location': event.location,
                    'event_type': event.event_type
                }
            }, status=201)
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        except Exception as e:
            return JsonResponse({'error': f'Failed to create event: {str(e)}'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def event_detail(request, event_id):
    """Get, update, or delete specific event"""
    try:
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return JsonResponse({'error': 'Event not found'}, status=404)
    
    if request.method == 'GET':
        return JsonResponse({
            'id': event.id,
            'title': event.title,
            'description': event.description or '',
            'event_type': event.event_type,
            'date': event.date.isoformat() if event.date else None,
            'location': event.location,
            'status': event.status,
            'max_attendees': event.max_attendees,
            'organizer_name': event.organizer.username if event.organizer else 'System'
        })
    
    elif request.method == 'DELETE':
        event.delete()
        return JsonResponse({'message': 'Event deleted successfully'})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def test_events_api(request):
    """Test endpoint for events API"""
    return JsonResponse({
        'status': 'success',
        'message': 'Events API is working!',
        'method': request.method,
        'path': request.path,
        'timestamp': datetime.now().isoformat()
    })