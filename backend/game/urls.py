from django.urls import path
from . import views

urlpatterns = [
    path('create-game/', views.create_game, name='create_game'),
    path('join-game/', views.join_game, name='join_game'),
    path('game/<uuid:game_id>/', views.get_game_state, name='get_game_state'),
    path('cards/', views.get_cards, name='get_cards'),
]