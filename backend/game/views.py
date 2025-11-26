from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .models import GameSession, PlayerState, Card, GameAction
from .game_logic import GameEngine
from .onechain_client import OneChainClient

onechain = OneChainClient()

@csrf_exempt
@require_http_methods(["POST"])
def create_game(request):
    """Create a new game session"""
    try:
        data = json.loads(request.body)
        player_address = data.get('player_address')
        stake_amount = data.get('stake_amount', 10)
        
        if not player_address:
            return JsonResponse({'error': 'Player address required'}, status=400)
        
        # Verify player has sufficient balance
        balance = onechain.get_balance(player_address)
        if balance < stake_amount:
            return JsonResponse({'error': 'Insufficient balance'}, status=400)
        
        # Create game session
        game = GameSession.objects.create(
            player1_address=player_address,
            stake_amount=stake_amount
        )
        
        # Log action
        GameAction.objects.create(
            game=game,
            player=player_address,
            action_type='CREATE_GAME',
            data={'stake_amount': stake_amount}
        )
        
        return JsonResponse({
            'game_id': str(game.id),
            'status': 'waiting_for_opponent',
            'stake_amount': stake_amount
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def join_game(request):
    """Join an existing game session"""
    try:
        data = json.loads(request.body)
        player_address = data.get('player_address')
        game_id = data.get('game_id')
        
        if not player_address or not game_id:
            return JsonResponse({'error': 'Player address and game ID required'}, status=400)
        
        try:
            game = GameSession.objects.get(id=game_id, status='waiting')
        except GameSession.DoesNotExist:
            return JsonResponse({'error': 'Game not found or already started'}, status=404)
        
        if game.player1_address == player_address:
            return JsonResponse({'error': 'Cannot join your own game'}, status=400)
        
        # Verify player has sufficient balance
        balance = onechain.get_balance(player_address)
        if balance < game.stake_amount:
            return JsonResponse({'error': 'Insufficient balance'}, status=400)
        
        # Update game with second player
        game.player2_address = player_address
        game.status = 'active'
        game.save()
        
        # Initialize game engine
        game_engine = GameEngine(str(game.id))
        game_engine.add_player(game.player1_address)
        game_engine.add_player(game.player2_address)
        game_engine.start_game()
        
        # Save initial player states
        for address in [game.player1_address, game.player2_address]:
            player = game_engine.players[address]
            PlayerState.objects.create(
                game=game,
                player_address=address,
                health=player.health,
                energy=player.energy,
                max_energy=player.max_energy,
                hand=[card.id for card in player.hand],
                field=[card.id for card in player.field],
                deck=[card.id for card in player.deck]
            )
        
        # Log action
        GameAction.objects.create(
            game=game,
            player=player_address,
            action_type='JOIN_GAME',
            data={}
        )
        
        return JsonResponse({
            'status': 'game_started',
            'game_id': str(game.id),
            'players': [game.player1_address, game.player2_address],
            'stake_amount': game.stake_amount
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_game_state(request, game_id):
    """Get current game state"""
    try:
        game = GameSession.objects.get(id=game_id)
        player_states = PlayerState.objects.filter(game=game)
        
        state = {
            'game_id': str(game.id),
            'status': game.status,
            'stake_amount': game.stake_amount,
            'players': {}
        }
        
        for player_state in player_states:
            state['players'][player_state.player_address] = {
                'health': player_state.health,
                'energy': player_state.energy,
                'max_energy': player_state.max_energy,
                'hand_size': len(player_state.hand),
                'field_size': len(player_state.field),
                'deck_size': len(player_state.deck)
            }
        
        return JsonResponse(state)
        
    except GameSession.DoesNotExist:
        return JsonResponse({'error': 'Game not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_cards(request):
    """Get all available cards"""
    try:
        cards = Card.objects.all()
        cards_data = []
        
        for card in cards:
            cards_data.append({
                'id': card.id,
                'name': card.name,
                'type': card.card_type,
                'cost': card.cost,
                'power': card.power,
                'health': card.health,
                'ability': card.ability,
                'description': card.description,
                'rarity': card.rarity
            })
        
        return JsonResponse({'cards': cards_data})
        
    except Exception as e:
        # Return default cards if database not available
        from .game_logic import GameEngine
        engine = GameEngine('temp')
        cards_data = []
        
        for card_id, card in engine.card_library.items():
            cards_data.append({
                'id': card.id,
                'name': card.name,
                'type': card.type,
                'cost': card.cost,
                'power': card.power,
                'health': card.health,
                'ability': card.ability,
                'description': card.description,
                'rarity': card.rarity
            })
        
        return JsonResponse({'cards': cards_data})