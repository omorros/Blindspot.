"""
Pre-cached fallback data for when agents fail or timeout.
Used when Bright Data MCP is unavailable or too slow.
"""

FALLBACK_DATA = {
    "pet tech": {
        "geography": "UK",
        "scout": {
            "companies": [
                {"name": "Butternut Box", "url": "https://butternutbox.com", "description": "Fresh dog food delivery service", "category": "Pet Food"},
                {"name": "PitPat", "url": "https://pitpat.com", "description": "Dog activity monitor and GPS tracker", "category": "Pet Wearables"},
                {"name": "Rover.com", "url": "https://rover.com", "description": "Pet sitting and dog walking marketplace", "category": "Pet Services"},
                {"name": "Bought By Many", "url": "https://boughtbymany.com", "description": "Pet insurance provider using data-driven pricing", "category": "Pet Insurance"},
                {"name": "Tails.com", "url": "https://tails.com", "description": "Personalized dog food based on breed and health needs", "category": "Pet Food"},
                {"name": "Republic of Cats", "url": "https://republicofcats.com", "description": "Subscription cat food delivery", "category": "Pet Food"},
                {"name": "PocketVet", "url": "https://pocketvet.com", "description": "Telehealth veterinary consultations", "category": "Pet Health"},
                {"name": "Pooch & Mutt", "url": "https://poochandmutt.com", "description": "Health-focused dog food and supplements", "category": "Pet Food"},
                {"name": "Waggel", "url": "https://waggel.co.uk", "description": "Monthly pet insurance with wellness rewards", "category": "Pet Insurance"},
                {"name": "Pets at Home", "url": "https://petsathome.com", "description": "UK's largest pet care retailer", "category": "Retail"},
                {"name": "VetBox", "url": "https://vetbox.co", "description": "Flea and worm treatment subscription", "category": "Pet Health"},
                {"name": "BorrowMyDoggy", "url": "https://borrowmydoggy.com", "description": "Dog sharing community platform", "category": "Pet Services"},
                {"name": "KatKin", "url": "https://katkin.com", "description": "Fresh cat food delivery service", "category": "Pet Food"},
                {"name": "Bella & Duke", "url": "https://bellaandduke.com", "description": "Raw pet food delivery", "category": "Pet Food"},
            ],
            "categories": {
                "Pet Food": 6,
                "Pet Insurance": 2,
                "Pet Health": 2,
                "Pet Services": 2,
                "Pet Wearables": 1,
                "Retail": 1,
            },
            "total_funding": "$2.3B estimated",
        },
        "voc": {
            "complaints": [
                {"source": "Reddit r/UKPets", "text": "Why is it so hard to compare pet insurance prices? Every site wants my life story before showing a quote.", "upvotes": 234, "url": "https://reddit.com/r/UKPets/example1"},
                {"source": "Reddit r/dogs", "text": "Spent 3 hours trying to find a vet that's open on Sunday. Why is there no Uber for emergency vet visits?", "upvotes": 189, "url": "https://reddit.com/r/dogs/example2"},
                {"source": "Trustpilot", "text": "My pet insurance claim took 47 days to process. Absolutely disgraceful.", "upvotes": 0, "url": "https://trustpilot.com/example3"},
                {"source": "Reddit r/UKPersonalFinance", "text": "Pet insurance premiums doubled after one claim. There's zero transparency in how they calculate prices.", "upvotes": 312, "url": "https://reddit.com/r/UKPersonalFinance/example4"},
                {"source": "Reddit r/CasualUK", "text": "Does anyone else feel like pet food subscriptions are all the same? Hard to know which is actually better for my dog.", "upvotes": 156, "url": "https://reddit.com/r/CasualUK/example5"},
                {"source": "Reddit r/UKPets", "text": "Just moved to a new city and finding a good vet is impossible. No reviews, no ratings, nothing.", "upvotes": 98, "url": "https://reddit.com/r/UKPets/example6"},
                {"source": "Trustpilot", "text": "Tried to switch pet insurance and no one would cover my dog's pre-existing condition. The market is broken.", "upvotes": 0, "url": "https://trustpilot.com/example7"},
                {"source": "Reddit r/UKPets", "text": "I wish there was a PCW (price comparison website) for pet services. Grooming, walking, boarding — prices are all over the place.", "upvotes": 203, "url": "https://reddit.com/r/UKPets/example8"},
            ],
            "themes": {
                "Insurance pricing opacity": 47,
                "Vet discovery and access": 23,
                "Pet food comparison difficulty": 18,
                "Claims processing speed": 15,
                "Service price comparison": 12,
            },
            "total_complaints": 47,
        },
        "jobs": {
            "postings": [
                {"title": "Senior Data Scientist", "company": "Bought By Many", "url": "https://linkedin.com/jobs/example1", "signal": "Building pricing models — implies current pricing is manual/broken"},
                {"title": "Veterinary Telemedicine Lead", "company": "PocketVet", "url": "https://linkedin.com/jobs/example2", "signal": "Scaling telehealth — market demand for remote vet access"},
                {"title": "Product Manager - Insurance Platform", "company": "Waggel", "url": "https://linkedin.com/jobs/example3", "signal": "Building insurance tech — space is still immature"},
                {"title": "Full Stack Engineer", "company": "Butternut Box", "url": "https://linkedin.com/jobs/example4", "signal": "Tech investment in pet food DTC"},
                {"title": "Growth Marketing Manager", "company": "PitPat", "url": "https://linkedin.com/jobs/example5", "signal": "Scaling wearables — consumer awareness still low"},
            ],
            "hiring_gaps": [
                "No companies hiring for price comparison tooling",
                "No roles in pet services marketplace development",
                "Very few AI/ML roles in the pet sector",
            ],
            "total_jobs": 23,
        },
        "gaps": [
            {
                "id": 1,
                "title": "Pet Insurance Price Comparison Platform",
                "description": "No UK platform offers transparent, instant pet insurance comparison without requiring extensive personal data upfront. Current comparison sites (GoCompare, MoneySupermarket) have limited pet insurance coverage and require full form completion before showing any prices.",
                "confidence": 9.2,
                "opportunity_size": "Large",
                "evidence": [
                    {"title": "Reddit: Insurance pricing opacity", "url": "https://reddit.com/r/UKPets/example1", "snippet": "234 upvotes on complaint about comparing pet insurance prices"},
                    {"title": "Reddit: Market is broken", "url": "https://trustpilot.com/example7", "snippet": "Pre-existing condition coverage gaps across all providers"},
                    {"title": "Bought By Many hiring data scientists", "url": "https://linkedin.com/jobs/example1", "snippet": "Building pricing models implies current pricing is manual"},
                ],
                "triangulation": [
                    {"source": "scout", "strength": 0.95, "label": "Strong signal", "detail": "0/14 competitors offer instant comparison"},
                    {"source": "voc", "strength": 0.92, "label": "Strong signal", "detail": "47 complaints about pricing opacity"},
                    {"source": "jobs", "strength": 0.7, "label": "Moderate signal", "detail": "2 related roles, no comparison engineers"},
                ],
                "risk_flags": [
                    "FCA regulatory complexity for insurance comparison",
                    "Incumbent partnerships may block data access",
                    "GoCompare/MoneySupermarket could add this feature",
                ],
            },
            {
                "id": 2,
                "title": "Vet Discovery & Rating Platform",
                "description": "No comprehensive vet review and discovery platform exists in the UK. Pet owners rely on word-of-mouth or generic Google reviews. Unlike restaurants (TripAdvisor) or tradespeople (Checkatrade), veterinary services have no dedicated rating system.",
                "confidence": 7.8,
                "opportunity_size": "Medium",
                "evidence": [
                    {"title": "Reddit: Finding a good vet", "url": "https://reddit.com/r/UKPets/example6", "snippet": "98 upvotes: finding a good vet in a new city is impossible"},
                    {"title": "Reddit: Emergency vet access", "url": "https://reddit.com/r/dogs/example2", "snippet": "189 upvotes asking for Uber-like emergency vet service"},
                ],
                "triangulation": [
                    {"source": "scout", "strength": 0.8, "label": "Strong signal", "detail": "Only PocketVet in telehealth, no discovery platform"},
                    {"source": "voc", "strength": 0.85, "label": "Strong signal", "detail": "23 complaints about vet discovery"},
                    {"source": "jobs", "strength": 0.4, "label": "Weak signal", "detail": "No roles in vet marketplace development"},
                ],
                "risk_flags": [
                    "Vets may resist ratings/reviews",
                    "RCVS advertising regulations",
                    "NHS-like expectation of free healthcare in UK",
                ],
            },
            {
                "id": 3,
                "title": "Pet Services Price Comparison Marketplace",
                "description": "Grooming, dog walking, pet sitting, and boarding prices vary wildly with no transparency. Unlike Rover.com (US-focused), there's no UK-native marketplace that compares prices across service types and providers.",
                "confidence": 6.5,
                "opportunity_size": "Medium",
                "evidence": [
                    {"title": "Reddit: PCW for pet services", "url": "https://reddit.com/r/UKPets/example8", "snippet": "203 upvotes wishing for price comparison for pet services"},
                    {"title": "BorrowMyDoggy model", "url": "https://borrowmydoggy.com", "snippet": "Community model works but doesn't address professional services"},
                ],
                "triangulation": [
                    {"source": "scout", "strength": 0.6, "label": "Moderate signal", "detail": "Rover exists but US-focused, BorrowMyDoggy is community only"},
                    {"source": "voc", "strength": 0.75, "label": "Moderate signal", "detail": "12 complaints about service price opacity"},
                    {"source": "jobs", "strength": 0.35, "label": "Weak signal", "detail": "No marketplace development roles found"},
                ],
                "risk_flags": [
                    "Rover.com could expand UK focus",
                    "Fragmented supply side (many solo operators)",
                    "Low margins in services marketplaces",
                ],
            },
        ],
    },
    "fintech": {
        "geography": "Germany",
        "scout": {
            "companies": [
                {"name": "N26", "url": "https://n26.com", "description": "Mobile-first neobank", "category": "Neobanking"},
                {"name": "Trade Republic", "url": "https://traderepublic.com", "description": "Commission-free investing app", "category": "Investing"},
                {"name": "Scalable Capital", "url": "https://scalable.capital", "description": "Digital wealth management and brokerage", "category": "Investing"},
                {"name": "Raisin", "url": "https://raisin.de", "description": "Savings and deposit marketplace", "category": "Savings"},
                {"name": "Wefox", "url": "https://wefox.com", "description": "Digital insurance platform", "category": "Insurance"},
                {"name": "Mambu", "url": "https://mambu.com", "description": "Cloud banking platform (B2B)", "category": "Infrastructure"},
                {"name": "Solarisbank", "url": "https://solarisbank.com", "description": "Banking-as-a-service platform", "category": "Infrastructure"},
                {"name": "Clark", "url": "https://clark.de", "description": "Insurance management app", "category": "Insurance"},
                {"name": "Penta (Qonto)", "url": "https://qonto.com", "description": "Business banking for SMEs", "category": "Business Banking"},
                {"name": "Billie", "url": "https://billie.io", "description": "B2B buy now pay later", "category": "Payments"},
            ],
            "categories": {
                "Neobanking": 1,
                "Investing": 2,
                "Insurance": 2,
                "Infrastructure": 2,
                "Savings": 1,
                "Business Banking": 1,
                "Payments": 1,
            },
            "total_funding": "$8.1B estimated",
        },
        "voc": {
            "complaints": [
                {"source": "Reddit r/Finanzen", "text": "German tax reporting for crypto is a nightmare. No tool handles it properly.", "upvotes": 456, "url": "https://reddit.com/r/Finanzen/example1"},
                {"source": "Reddit r/Finanzen", "text": "Tried 5 different apps to track my finances across multiple German bank accounts. None work well.", "upvotes": 289, "url": "https://reddit.com/r/Finanzen/example2"},
                {"source": "Reddit r/germany", "text": "Opening a business bank account in Germany takes weeks. The process is absurd.", "upvotes": 178, "url": "https://reddit.com/r/germany/example3"},
            ],
            "themes": {
                "Crypto tax reporting": 52,
                "Multi-bank aggregation": 31,
                "Business account onboarding": 24,
            },
            "total_complaints": 38,
        },
        "jobs": {
            "postings": [
                {"title": "Crypto Tax Engineer", "company": "N26", "url": "https://linkedin.com/jobs/example10", "signal": "Neobanks trying to solve crypto tax internally"},
                {"title": "PSD2 Integration Engineer", "company": "Solarisbank", "url": "https://linkedin.com/jobs/example11", "signal": "Open banking infrastructure still being built"},
            ],
            "hiring_gaps": [
                "No crypto tax startups hiring in Germany",
                "Limited open banking consumer app development",
            ],
            "total_jobs": 15,
        },
        "gaps": [
            {
                "id": 1,
                "title": "German Crypto Tax Automation Platform",
                "description": "No German-market-specific tool properly handles crypto tax reporting under German tax law (1-year holding rule, Freistellungsauftrag integration, FIFO/LIFO selection). International tools like Koinly lack German tax specifics.",
                "confidence": 8.5,
                "opportunity_size": "Large",
                "evidence": [
                    {"title": "Reddit: Crypto tax nightmare", "url": "https://reddit.com/r/Finanzen/example1", "snippet": "456 upvotes on crypto tax pain in Germany"},
                    {"title": "N26 hiring crypto tax engineers", "url": "https://linkedin.com/jobs/example10", "snippet": "Neobanks trying to solve internally — opportunity for standalone tool"},
                ],
                "triangulation": [
                    {"source": "scout", "strength": 0.9, "label": "Strong signal", "detail": "0/10 competitors focused on German crypto tax"},
                    {"source": "voc", "strength": 0.95, "label": "Strong signal", "detail": "52 complaints about crypto tax"},
                    {"source": "jobs", "strength": 0.65, "label": "Moderate signal", "detail": "N26 hiring internally for this"},
                ],
                "risk_flags": [
                    "Regulatory changes could simplify/complicate the problem",
                    "International players (Koinly, CoinTracker) could localize",
                ],
            },
        ],
    },
}
