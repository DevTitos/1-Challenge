import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import GameSession, GameAction
from .game_logic import GameEngine
from .onechain_client import OneChainClient

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.game_group_name = f'game_{self.game_id}'
        
        # Join game group
        await self.channel_layer.group_add(
            self.game_group_name,
            self.channel_name
        )
        
        await self.accept()
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to game'
        }))

    async def disconnect(self, close_code):
        # Leave game group
        await self.channel_layer.group_discard(
            self.game_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        action_type = data.get('type')
        player_address = data.get('player_address')
        
        if action_type == 'play_card':
            await self.handle_play_card(data, player_address)
        elif action_type == 'join_game':
            await self.handle_player_joined(player_address)

    async def handle_play_card(self, data, player_address):
        """Handle card play action"""
        card_id = data.get('card_id')
        target = data.get('target')
        
        # Get game state and process card play
        game_engine = await self.get_game_engine(self.game_id)
        
        if game_engine:
            result = game_engine.play_card(player_address, card_id, target)
            
            # Broadcast result to all players in game
            await self.channel_layer.group_send(
                self.game_group_name,
                {
                    'type': 'card_played',
                    'player': player_address,
                    'card_id': card_id,
                    'result': result
                }
            )
            
            # Log action
            await self.log_game_action(
                self.game_id, player_address, 'PLAY_CARD', 
                {'card_id': card_id, 'target': target, 'result': result}
            )
            
            # Handle game end
            if result.get('game_ended'):
                await self.handle_game_end(result['winner'])

    async def handle_player_joined(self, player_address):
        """Notify when player joins game"""
        await self.channel_layer.group_send(
            self.game_group_name,
            {
                'type': 'player_joined',
                'player': player_address,
                'message': f'Player {player_address} joined the game'
            }
        )

    async def handle_game_end(self, winner_address):
        """Handle game end and distribute stakes"""
        onechain = OneChainClient()
        game = await self.get_game_session(self.game_id)
        
        if game:
            # Update game status
            game.status = 'finished'
            game.winner = winner_address
            await database_sync_to_async(game.save)()
            
            # Distribute stakes (simulated for now)
            total_stake = game.stake_amount * 2
            onechain.transfer_stake(str(game.id), winner_address, total_stake)
            
            # Broadcast game end
            await self.channel_layer.group_send(
                self.game_group_name,
                {
                    'type': 'game_ended',
                    'winner': winner_address,
                    'stake_won': total_stake
                }
            )
            
            # Log action
            await self.log_game_action(
                self.game_id, 'system', 'GAME_END', 
                {'winner': winner_address, 'stake_won': total_stake}
            )

    async def card_played(self, event):
        """Send card play event to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'card_played',
            'player': event['player'],
            'card_id': event['card_id'],
            'result': event['result']
        }))

    async def player_joined(self, event):
        """Send player joined event to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'player_joined',
            'player': event['player'],
            'message': event['message']
        }))

    async def game_ended(self, event):
        """Send game end event to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'game_ended',
            'winner': event['winner'],
            'stake_won': event['stake_won']
        }))

    @database_sync_to_async
    def get_game_session(self, game_id):
        """Get game session from database"""
        try:
            return GameSession.objects.get(id=game_id)
        except GameSession.DoesNotExist:
            return None

    @database_sync_to_async
    def get_game_engine(self, game_id):
        """Reconstruct game engine from database state"""
        try:
            game = GameSession.objects.get(id=game_id)
            player_states = list(game.playerstate_set.all())
            
            if len(player_states) != 2:
                return None
            
            game_engine = GameEngine(str(game_id))
            
            for player_state in player_states:
                game_engine.add_player(player_state.player_address)
                player = game_engine.players[player_state.player_address]
                
                # Restore player state
                player.health = player_state.health
                player.energy = player_state.energy
                player.max_energy = player_state.max_energy
                
                # Restore cards (simplified - would need to load full card objects)
                player.hand = [game_engine.card_library[card_id] for card_id in player_state.hand]
                player.field = [game_engine.card_library[card_id] for card_id in player_state.field]
                player.deck = [game_engine.card_library[card_id] for card_id in player_state.deck]
            
            return game_engine
            
        except Exception:
            return None

    @database_sync_to_async
    def log_game_action(self, game_id, player, action_type, data):
        """Log game action to database"""
        try:
            game = GameSession.objects.get(id=game_id)
            GameAction.objects.create(
                game=game,
                player=player,
                action_type=action_type,
                data=data
            )
        except Exception:
            pass