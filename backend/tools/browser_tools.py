
import webbrowser
from urllib.parse import quote


# ==========================================
# WEBSITE URL MAPPING
# ==========================================
# These are common websites that Zivo can
# recognize directly from their names.

WEBSITE_URLS = {
    "youtube": "https://www.youtube.com",
    "spotify": "https://open.spotify.com",
    "google": "https://www.google.com",
    "github": "https://github.com",
    "chatgpt": "https://chatgpt.com",
    "instagram": "https://www.instagram.com",
    "facebook": "https://www.facebook.com",
    "linkedin": "https://www.linkedin.com",
    "gmail": "https://mail.google.com",
    "whatsapp": "https://web.whatsapp.com",
    "google maps": "https://maps.google.com",
    "maps": "https://maps.google.com",
    "netflix": "https://www.netflix.com",
    "amazon": "https://www.amazon.in",
    "reddit": "https://www.reddit.com",
    "x": "https://x.com",
    "twitter": "https://x.com",
}


# ==========================================
# OPEN WEBSITE IN DEFAULT BROWSER
# ==========================================

def open_website(website: str):

    # Clean the website name received
    # from the local parser or AI.
    website = website.strip().lower()

    # Remove unnecessary words that may
    # be included in the website name.
    website = website.replace(" in browser", "")
    website = website.replace(" in the browser", "")
    website = website.replace(" website", "")
    website = website.strip()

    # Check whether the website is available
    # in our predefined website mapping.
    if website in WEBSITE_URLS:

        url = WEBSITE_URLS[website]

    else:

        # If the user gives a complete URL,
        # use it directly.
        if website.startswith("http://") or website.startswith("https://"):

            url = website

        else:

            # If the user says something like
            # "open example.com", add https://.
            if "." in website:

                url = f"https://{website}"

            else:

                # For an unknown website name,
                # search Google instead of opening
                # an incorrect website.
                search_query = quote(website)

                url = (
                    "https://www.google.com/search?q="
                    f"{search_query}"
                )

    # webbrowser.open() opens the URL using
    # the operating system's default browser.
    webbrowser.open(url)

    return f"Opening {website} in your default browser."



# ==========================================
# GOOGLE SEARCH URL
# ==========================================

def search_web_in_browser(query: str):

    """
    Opens a Google search in the default browser.
    This is a fallback/helper and does not extract results.
    """

    query = query.strip()

    url = (
        "https://www.google.com/search?q="
        f"{quote(query)}"
    )

    webbrowser.open(url)

    return f"Searching Google for {query}."
