from difflib import get_close_matches

def best_match(query, candidates):
    matches = get_close_matches(query, candidates, n=1, cutoff=0.55)

    if matches:
        return matches[0]

    return None