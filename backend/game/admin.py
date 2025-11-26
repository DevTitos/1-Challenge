from django.contrib import admin
from .models import GameSession, PlayerState, Card, GameAction

@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'player1_address', 'player2_address', 'stake_amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['player1_address', 'player2_address']

@admin.register(PlayerState)
class PlayerStateAdmin(admin.ModelAdmin):
    list_display = ['game', 'player_address', 'health', 'energy']
    list_filter = ['game__status']

@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'card_type', 'cost', 'power', 'rarity']
    list_filter = ['card_type', 'rarity']

@admin.register(GameAction)
class GameActionAdmin(admin.ModelAdmin):
    list_display = ['game', 'player', 'action_type', 'timestamp']
    list_filter = ['action_type', 'timestamp']