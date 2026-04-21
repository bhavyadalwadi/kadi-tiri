Kadi Tiri Game
This project is a simple Game. Rules are as follows.

Note:
The original README below reflects the first prototype ruleset.
The current product direction and implementation now follow the V2 rules update documented in [CHANGELOG.md](./CHANGELOG.md).

🃏 KaliTiri (Kali Teeri) Card Game – Complete Ruleset
🎮 Game Setup
Players	Decks	Cards per Player	Total Points	Notes
4	1	13	250	Standard setup
6	1	13	250	Remove all 2s
6	2	17	500	Remove two 2♠
8	2	13	500	Full two decks
🧮 Card Values
Card Type	Points	Notes
3♠ (KaliTiri)	30 each	Trump card
A, K, Q, J, 10 (all suits)	10 each	High-value cards
5s (all suits)	5 each	Moderate value
7s and others	0	No point value
One Deck: 250 points total
Two Decks: 500 points total
📈 Bidding Phase
Format	Start Bid	Max Bid	Increment
1 Deck	125	250	+5
2 Decks	250	500	+5
🃎 Bid Winner Privileges
Choose PowerHouse Suit (aka “sir”): A♠, A♥, A♦, or A♣
Choose Partners:
4P: 1 partner (1 card)
6P (2 decks): 2 partners (2 cards)
8P: 3 partners (3 cards)
Partners are chosen by declaring a card not in hand. Whoever holds it becomes the partner—secretly or openly.
🕹️ Gameplay Mechanics
Rounds:
13 rounds (1 deck games)
17 rounds (2 deck 6-player games)
Turn Order & Play
Lead: Bid winner or last round winner starts.
Follow Suit: Players must follow the led suit if possible.
Off-Suit Options:
Play PowerHouse: Can win the hand.
Play Any Other Card: Cannot win the hand.
Winning a Hand
Led Suit: Highest card of the led suit wins unless...
PowerHouse Played: PowerHouse card beats all others.
Duplicate Cards Rule: If identical cards are played, the first played wins.
📊 Scoring System
Bid Winner’s Team
Goal: Score ≥ bid amount.
Success: All team members get full team score.
Failure: Bid winner gets 0; others get half of opposing team’s score.
Opposing Team
No Risk: Always keeps earned points.
No Minimum: No bid requirement.
🎭 Strategy & Social Play
Secret Partners: Adds suspense and bluffing.
Feeding Points: Partners may help openly or subtly.
Revealing Patterns: Opponents may deduce partners based on play style.
📝 Example Scenario
6 Players, 2 Decks
Bid starts at 250. Player A wins with a bid of 370.
Chooses Hearts as PowerHouse and selects 3♠ and 5♦ as partner cards.
Players holding those cards become partners—secretly.
They must collectively score ≥ 370 to win.

{
    "game_modes": {
        "4_players": {
            "decks": 1,
            "cards_per_player": 13,
            "total_points": 250
        },
        "6_players_one_deck": {
            "decks": 1,
            "cards_per_player": 13,
            "total_points": 250,
            "remove_cards": [
                "2\u2660"
            ]
        },
        "6_players_two_decks": {
            "decks": 2,
            "cards_per_player": 17,
            "total_points": 500,
            "remove_cards": [
                "2\u2660",
                "2\u2660"
            ]
        },
        "8_players": {
            "decks": 2,
            "cards_per_player": 13,
            "total_points": 500
        }
    },
    "card_points": {
        "kaliTiri": {
            "card": "3\u2660",
            "points": 30
        },
        "high_cards": [
            "A",
            "K",
            "Q",
            "J",
            "10"
        ],
        "high_card_points": 10,
        "fives": [
            "5\u2660",
            "5\u2665",
            "5\u2666",
            "5\u2663"
        ],
        "five_card_points": 5,
        "sevens": [
            "7\u2660",
            "7\u2665",
            "7\u2666",
            "7\u2663"
        ],
        "seven_card_points": 0,
        "others": 0
    },
    "bidding": {
        "one_deck": {
            "start": 125,
            "max": 250,
            "increment": 5
        },
        "two_decks": {
            "start": 250,
            "max": 500,
            "increment": 5
        },
        "privileges": {
            "choose_powerhouse_suit": [
                "\u2660",
                "\u2665",
                "\u2666",
                "\u2663"
            ],
            "choose_partner_cards": {
                "4_players": 1,
                "6_players_two_decks": 2,
                "8_players": 3
            }
        }
    },
    "gameplay": {
        "rounds": {
            "one_deck": 13,
            "two_decks": 17
        },
        "turn_order": "bid_winner_or_last_round_winner",
        "play_rules": {
            "follow_suit": "must_follow_if_possible",
            "off_suit": {
                "play_powerhouse": "can_win",
                "play_other": "cannot_win"
            }
        },
        "winning_hand": [
            "highest_card_of_led_suit_wins",
            "powerhouse_card_beats_all"
        ],
        "duplicate_cards_rule": "first_played_card_wins"
    },
    "scoring": {
        "bid_winner_team": {
            "success": "all_team_members_get_full_score",
            "failure": "bid_winner_gets_zero, others_get_half_opponent_score"
        },
        "opposing_team": {
            "always_scores": true,
            "minimum_threshold": null,
            "risk": null
        }
    },
    "strategy": {
        "secret_partners": "allowed",
        "bluffing": "encouraged",
        "feeding_points": "subtle_or_direct",
        "deduction": "opponents_may_infer_partners"
    },
    "example": {
        "players": [
            "motowner",
            "amthalal",
            "cyberkhiladi",
            "echarcha"
        ],
        "bid_winner": "motowner",
        "bid": 180,
        "powerhouse": "\u2660",
        "partner_card": "3\u2660",
        "partner": "cyberkhiladi",
        "goal": "collect_180_points"
    }
}





Features

THis game has to be on WEB, iOS and Android so you can choose platform , react and react native or Next js or next and nest js I will leave it upto you.
Local JSON file-based data storage and state management for now and we can move it to some light weight database
Comprehensive unit and integration tests
Global exception handling
Technologies Used
You can choose the latest and gratest as long as the vulnerabilities is 0 and its stable version and can be expanded or upgraded in the future easily. 
Data Storage: Local JSON files for now and we can move it to some light weight database
Prerequisites
Before you begin, ensure you have the following installed:

Node , NVM , and whatever frontend technology you decide.

Project Structure rest you can add modify as you desire.
project-root/
├── src
├── README.md
└── .gitignore

Access the application: Access the app http://localhost:8080.
