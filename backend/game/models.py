from django.db import models
import uuid

class GameSession(models.Model):
    GAME_STATUS = [
        ('waiting', 'Waiting for Players'),
        ('active', 'Game Active'),
        ('finished', 'Game Finished'),
        ('cancelled', 'Game Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    player1_address = models.CharField(max_length=100)
    player2_address = models.CharField(max_length=100, null=True, blank=True)
    stake_amount = models.IntegerField(default=10)
    status = models.CharField(max_length=20, choices=GAME_STATUS, default='waiting')
    winner = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'game_sessions'

class PlayerState(models.Model):
    game = models.ForeignKey(GameSession, on_delete=models.CASCADE)
    player_address = models.CharField(max_length=100)
    health = models.IntegerField(default=30)
    energy = models.IntegerField(default=3)
    max_energy = models.IntegerField(default=10)
    hand = models.JSONField(default=list)  # List of card IDs
    field = models.JSONField(default=list)  # List of card IDs on field
    deck = models.JSONField(default=list)   # List of card IDs in deck
    
    class Meta:
        db_table = 'player_states'
        unique_together = ['game', 'player_address']

class Card(models.Model):
    CARD_TYPES = [
        ('COSMIC', 'Cosmic'),
        ('QUANTUM', 'Quantum'),
        ('NEBULA', 'Nebula'),
        ('STELLAR', 'Stellar'),
    ]
    
    RARITY_TYPES = [
        ('COMMON', 'Common'),
        ('RARE', 'Rare'),
        ('EPIC', 'Epic'),
        ('LEGENDARY', 'Legendary'),
    ]
    
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=100)
    card_type = models.CharField(max_length=20, choices=CARD_TYPES)
    cost = models.IntegerField()
    power = models.IntegerField()
    health = models.IntegerField()
    ability = models.CharField(max_length=50)
    description = models.TextField()
    rarity = models.CharField(max_length=20, choices=RARITY_TYPES)
    
    class Meta:
        db_table = 'cards'

class GameAction(models.Model):
    ACTION_TYPES = [
        ('CREATE_GAME', 'Create Game'),
        ('JOIN_GAME', 'Join Game'),
        ('PLAY_CARD', 'Play Card'),
        ('END_TURN', 'End Turn'),
        ('GAME_END', 'Game End'),
    ]
    
    game = models.ForeignKey(GameSession, on_delete=models.CASCADE)
    player = models.CharField(max_length=100)
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    data = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'game_actions'
        ordering = ['-timestamp']