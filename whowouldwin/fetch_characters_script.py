import requests
import json

def fetch_anilist_characters(anime_id, limit=100):
    url = 'https://graphql.anilist.co'
    query = '''
    query ($id: Int, $limit: Int) {
        Media(id: $id) {
            title {
                romaji
            }
            characters(page: 1, perPage: $limit) {
                nodes {
                    name {
                        full
                    }
                    image {
                        large
                    }
                }
            }
        }
    }
    '''
    variables = {'id': anime_id, 'limit': limit}
    try:
        response = requests.post(url, json={'query': query, 'variables': variables})
        response.raise_for_status()  # Raise an HTTPError for bad responses
        data = response.json()

        if 'data' in data and 'Media' in data['data']:
            characters = data['data']['Media']['characters']['nodes']
            return [
                {
                    "name": char["name"]["full"],
                    "anime": data['data']['Media']['title']['romaji'],
                    "image": char["image"]["large"]
                }
                for char in characters
            ]
        else:
            print(f"No characters found for anime ID {anime_id}.")
            return []
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data for anime ID {anime_id}: {e}")
        return []

# List of AniList anime IDs (My Hero Academia, DBZK, Fullmetal Alchemist: Brotherhood, Attack on Titan to start)
anime_ids = [21459, 6033, 16498, 5114]  # Replace with more IDs if necessary
character_data = []

# Fetch 100 unique characters from each anime ID and add to character_data
for anime_id in anime_ids:
    character_data.extend(fetch_anilist_characters(anime_id, limit=100))

# Ensure no duplicates (unique characters)
unique_characters = {char['name']: char for char in character_data}
unique_characters_list = list(unique_characters.values())

# Now, generate the characters.js file instead of characters.json
characters_js = "const characters = " + json.dumps(unique_characters_list, indent=4) + ";"

# Save the characters.js file in public
with open('public/characters.js', 'w') as f:
    f.write(characters_js)

print(f"Character data saved to public/characters.js with {len(unique_characters_list)} unique characters.")
