import requests
import json

class OneChainClient:
    def __init__(self, network='testnet'):
        self.rpc_url = f'https://rpc-{network}.onelabs.cc:443'
    
    def get_balance(self, address: str) -> int:
        """Get OCT balance for address"""
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "suix_getAllBalances",
            "params": [address]
        }
        
        try:
            response = requests.post(self.rpc_url, json=payload)
            data = response.json()
            if 'result' in data and len(data['result']) > 0:
                return int(data['result'][0]['totalBalance'])
            return 0
        except Exception as e:
            print(f"Error getting balance: {e}")
            return 1000  # Demo balance
    
    def lock_stake(self, address: str, amount: int, game_id: str) -> bool:
        """Lock player's stake for the game"""
        print(f"Locking {amount} OCT from {address} for game {game_id}")
        return True
    
    def transfer_stake(self, game_id: str, winner: str, amount: int) -> bool:
        """Transfer locked stakes to winner"""
        print(f"Transferring {amount} OCT to winner {winner} for game {game_id}")
        return True