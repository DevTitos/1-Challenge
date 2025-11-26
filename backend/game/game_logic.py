import random
from typing import Dict, List, Optional
from dataclasses import dataclass
from .models import Card as CardModel

@dataclass
class Card:
    id: str
    name: str
    type: str
    cost: int
    power: int
    health: int
    ability: str
    description: str
    rarity: str

class Player:
    def __init__(self, address: str):
        self.address = address
        self.health = 30
        self.energy = 3
        self.max_energy = 10
        self.hand: List[Card] = []
        self.field: List[Card] = []
        self.deck: List[Card] = []

class GameEngine:
    def __init__(self, game_id: str):
        self.game_id = game_id
        self.players: Dict[str, Player] = {}
        self.turn = 0
        self.current_player: Optional[str] = None
        self.card_library = self._initialize_card_library()
    
    def _initialize_card_library(self) -> Dict[str, Card]:
        """Initialize card library from database or default cards"""
        cards = {}
        try:
            db_cards = CardModel.objects.all()
            for db_card in db_cards:
                cards[db_card.id] = Card(
                    id=db_card.id,
                    name=db_card.name,
                    type=db_card.card_type,
                    cost=db_card.cost,
                    power=db_card.power,
                    health=db_card.health,
                    ability=db_card.ability,
                    description=db_card.description,
                    rarity=db_card.rarity
                )
        except:
            # Fallback to default cards if database not available
            cards = self._get_default_cards()
        
        return cards
    
    def _get_default_cards(self) -> Dict[str, Card]:
        return {
            'cosmic_ray': Card(
                id='cosmic_ray',
                name='Cosmic Ray',
                type='COSMIC',
                cost=2,
                power=3,
                health=0,
                ability='direct_damage',
                description='Fires a beam of pure cosmic energy',
                rarity='COMMON'
            ),
            'quantum_shield': Card(
                id='quantum_shield',
                name='Quantum Shield',
                type='QUANTUM',
                cost=1,
                power=0,
                health=5,
                ability='shield',
                description='Creates a protective quantum barrier',
                rarity='COMMON'
            ),
            'nebula_dragon': Card(
                id='nebula_dragon',
                name='Nebula Dragon',
                type='NEBULA',
                cost=4,
                power=6,
                health=4,
                ability='flying',
                description='Ancient dragon born from cosmic dust',
                rarity='EPIC'
            ),
            'stellar_engine': Card(
                id='stellar_engine',
                name='Stellar Engine',
                type='STELLAR',
                cost=3,
                power=2,
                health=4,
                ability='energy_boost',
                description='Generates additional energy each turn',
                rarity='RARE'
            ),
            'black_hole': Card(
                id='black_hole',
                name='Black Hole',
                type='COSMIC',
                cost=5,
                power=8,
                health=0,
                ability='destroy_all',
                description='Creates a singularity that consumes everything',
                rarity='LEGENDARY'
            ),
            'galaxy_wisp': Card(
                id='galaxy_wisp',
                name='Galaxy Wisp',
                type='STELLAR',
                cost=1,
                power=1,
                health=1,
                ability='draw_card',
                description='Ethereal being that reveals cosmic secrets',
                rarity='COMMON'
            )
        }
    
    def add_player(self, address: str):
        """Add a player to the game"""
        self.players[address] = Player(address)
    
    def start_game(self):
        """Initialize game for both players"""
        if len(self.players) != 2:
            raise ValueError("Need exactly 2 players to start game")
        
        for player in self.players.values():
            player.deck = self._generate_deck()
            random.shuffle(player.deck)
            # Draw initial hand
            player.hand = [player.deck.pop() for _ in range(5)]
        
        self.current_player = list(self.players.keys())[0]
        self.turn = 1
    
    def _generate_deck(self) -> List[Card]:
        """Generate a random deck for a player"""
        all_cards = list(self.card_library.values())
        deck = []
        
        # Add cards based on rarity distribution
        for card in all_cards:
            if card.rarity == 'COMMON':
                copies = 3
            elif card.rarity == 'RARE':
                copies = 2
            elif card.rarity == 'EPIC':
                copies = 1
            else:  # LEGENDARY
                copies = 1
            
            deck.extend([card] * copies)
        
        return deck[:20]  # Limit deck size to 20 cards
    
    def play_card(self, player_address: str, card_id: str, target: str = None) -> dict:
        """Play a card from player's hand"""
        player = self.players.get(player_address)
        if not player:
            return {'error': 'Player not found'}
        
        card = self.card_library.get(card_id)
        if not card:
            return {'error': 'Card not found'}
        
        # Check if player has the card in hand
        if not any(c.id == card_id for c in player.hand):
            return {'error': 'Card not in hand'}
        
        # Check energy cost
        if player.energy < card.cost:
            return {'error': 'Not enough energy'}
        
        # Check field limit
        if len(player.field) >= 5:
            return {'error': 'Field is full'}
        
        # Play the card
        player.energy -= card.cost
        player.field.append(card)
        player.hand = [c for c in player.hand if c.id != card_id]
        
        # Apply card effect
        effect_result = self._apply_card_effect(card, player_address, target)
        
        # Check win condition
        if self._check_win_condition():
            winner = self._get_winner()
            return {
                'success': True,
                'game_ended': True,
                'winner': winner,
                'effect': effect_result
            }
        
        return {
            'success': True,
            'energy_used': card.cost,
            'effect': effect_result,
            'game_ended': False
        }
    
    def _apply_card_effect(self, card: Card, player: str, target: str):
        """Apply the effect of a played card"""
        opponent = self._get_opponent(player)
        
        if card.ability == 'direct_damage':
            self.players[opponent].health -= card.power
            return f'Dealt {card.power} damage to opponent'
        
        elif card.ability == 'shield':
            # Shield logic would be implemented here
            return 'Shield applied to your field'
        
        elif card.ability == 'energy_boost':
            self.players[player].max_energy += 1
            return 'Maximum energy increased'
        
        elif card.ability == 'flying':
            # Flying creatures can bypass some defenses
            return 'Flying creature deployed'
        
        elif card.ability == 'destroy_all':
            # Destroy all cards on field
            for p in self.players.values():
                p.field = []
            return 'Black hole consumed all creatures'
        
        elif card.ability == 'draw_card':
            if self.players[player].deck:
                drawn_card = self.players[player].deck.pop()
                self.players[player].hand.append(drawn_card)
                return f'Drew {drawn_card.name}'
            return 'No cards left to draw'
        
        return 'Card played successfully'
    
    def _get_opponent(self, player: str) -> str:
        return [p for p in self.players.keys() if p != player][0]
    
    def _check_win_condition(self) -> bool:
        return any(player.health <= 0 for player in self.players.values())
    
    def _get_winner(self) -> str:
        for address, player in self.players.items():
            if player.health > 0:
                return address
        return None
    
    def get_game_state(self, for_player: str = None) -> dict:
        """Get current game state"""
        state = {
            'turn': self.turn,
            'current_player': self.current_player,
            'players': {}
        }
        
        for address, player in self.players.items():
            state['players'][address] = {
                'health': player.health,
                'energy': player.energy,
                'max_energy': player.max_energy,
                'hand_size': len(player.hand),
                'field_size': len(player.field),
                'deck_size': len(player.deck)
            }
            
            # Only reveal full hand to the owning player
            if for_player == address:
                state['players'][address]['hand'] = [
                    {'id': card.id, 'name': card.name, 'cost': card.cost} 
                    for card in player.hand
                ]
                state['players'][address]['field'] = [
                    {'id': card.id, 'name': card.name, 'power': card.power, 'health': card.health}
                    for card in player.field
                ]
            else:
                # For opponent, only show field cards
                state['players'][address]['field'] = [
                    {'id': card.id, 'name': card.name, 'power': card.power, 'health': card.health}
                    for card in player.field
                ]
        
        return state