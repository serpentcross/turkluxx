// Project copy and technical data supplied by the client.
// photos: string[]; floorPlans: { image: string, name: string }[].
// Missing photos use the neutral visual area. Missing plans and dimensions stay hidden.
// Apartment radios select photos only; technical fields are retained as source data.
const antalyaProjects = {
    "bluelife": {
        "name": "BlueLife",
        "location": "Lara, Antalya",
        "description": [
            "Set on Lara Turizm Caddesi just a few hundred metres from the sea, RengiAntalya BlueLife brings together contemporary residences, commercial spaces and year-round social living in one of Antalya’s most dynamic coastal areas."
        ],
        "photos": [],
        "floorPlans": [],
        "apartmentTypes": [],
        "projectStats": [
            [
                "Location",
                "Lara / Lara Turizm Caddesi"
            ],
            [
                "Project Type",
                "Residential + Commercial"
            ],
            [
                "Status",
                "Under Construction"
            ],
            [
                "Social Focus",
                "Indoor & Outdoor Pools"
            ],
            [
                "Lifestyle",
                "Landscaping, Pergolas & Children's Play Area"
            ]
        ],
        "amenities": [],
        "fullName": "RengiAntalya BlueLife",
        "tagline": "Beside the blue, at the heart of life.",
        "featuredStats": [
            "Project Type",
            "Status",
            "Social Focus"
        ]
    },
    "premium": {
        "name": "Premium",
        "location": "Döşemealtı, Antalya",
        "description": [
            "Designed as a complete residential environment, RengiAntalya Premium combines spacious apartment layouts with extensive landscaping, water features, sport, wellness and everyday amenities. A large proportion of the development is dedicated to nature and shared social spaces."
        ],
        "photos": [],
        "floorPlans": [],
        "apartmentTypes": [
            {
                "name": "1 + 1",
                "floorPlans": [],
                "photos": []
            },
            {
                "name": "2 + 1",
                "floorPlans": [],
                "photos": []
            },
            {
                "name": "3 + 1",
                "floorPlans": [],
                "photos": []
            },
            {
                "name": "4 + 1",
                "floorPlans": [],
                "photos": []
            },
            {
                "name": "5 + 1",
                "floorPlans": [],
                "photos": []
            }
        ],
        "projectStats": [
            [
                "Project Area",
                "45,210 m²"
            ],
            [
                "Nature & Social Amenities",
                "36,515 m²"
            ],
            [
                "Apartment Types",
                "1+1 to 5+1"
            ],
            [
                "Project Type",
                "Residential + Street-Front Retail"
            ],
            [
                "Status",
                "Completed / Turnkey"
            ]
        ],
        "amenities": [],
        "fullName": "RengiAntalya Premium",
        "tagline": "Premium living, ready in every detail.",
        "featuredStats": [
            "Project Area",
            "Nature & Social Amenities",
            "Status"
        ]
    },
    "greenlife": {
        "name": "GreenLife",
        "location": "Döşemealtı, Antalya",
        "description": [
            "RengiAntalya GreenLife combines the clean air of the Taurus Mountains with generous landscaping, extensive pools and functional apartment layouts, creating a calm and social residential environment where life has already begun."
        ],
        "photos": [],
        "floorPlans": [],
        "apartmentTypes": [
            {
                "name": "1 + 1 Type 1",
                "gross": "66 m²",
                "net": "50.3 m²",
                "floorPlans": [],
                "photos": []
            },
            {
                "name": "1 + 1 Type 2",
                "gross": "66 m²",
                "net": "52 m²",
                "floorPlans": [],
                "photos": []
            },
            {
                "name": "2 + 1",
                "gross": "103 m²",
                "net": "83.8 m²",
                "floorPlans": [],
                "photos": []
            }
        ],
        "projectStats": [
            [
                "Project Area",
                "17,987 m²"
            ],
            [
                "Structure",
                "10 Blocks"
            ],
            [
                "Residences",
                "249 Apartments + 2 Caretaker Units"
            ],
            [
                "Green Space",
                "8,900 m²"
            ],
            [
                "Pools",
                "3,940 m²"
            ],
            [
                "Status",
                "Completed / Occupied"
            ]
        ],
        "amenities": [],
        "fullName": "RengiAntalya GreenLife",
        "tagline": "Comfort, calm and nature within the same life.",
        "featuredStats": [
            "Project Area",
            "Residences",
            "Green Space",
            "Status"
        ]
    },
    "greenpark": {
        "name": "GreenPark",
        "location": "Döşemealtı, Antalya",
        "description": [
            "Built around the idea of a contemporary neighbourhood, RengiAntalya GreenPark combines low-rise architecture, generous green space and family-oriented apartments with shared social areas in a calm residential setting."
        ],
        "photos": [],
        "floorPlans": [],
        "apartmentTypes": [
            {
                "name": "2 + 1",
                "gross": "95 m²",
                "net": "72 m²",
                "floorPlans": [],
                "photos": []
            },
            {
                "name": "3 + 1",
                "gross": "125 m²",
                "net": "94.5 m²",
                "floorPlans": [],
                "photos": []
            }
        ],
        "projectStats": [
            [
                "Project Area",
                "9,504 m²"
            ],
            [
                "Structure",
                "5 Low-Rise Blocks"
            ],
            [
                "Residences",
                "99 Apartments + 1 Caretaker Unit"
            ],
            [
                "Green Space",
                "6,400 m²"
            ],
            [
                "Pools",
                "345 m²"
            ]
        ],
        "amenities": [],
        "fullName": "RengiAntalya GreenPark",
        "tagline": "The calm of nature, the warmth of a modern neighbourhood.",
        "featuredStats": [
            "Project Area",
            "Structure",
            "Residences",
            "Green Space"
        ]
    },
    "rengiantalya": {
        "name": "RengiAntalya",
        "location": "Döşemealtı, Antalya",
        "description": [
            "Set beside a vast pine forest, RengiAntalya offers a completed residential environment where nature, comfortable apartments and everyday convenience come together. Pools, landscaped social areas and commercial spaces support a relaxed daily lifestyle."
        ],
        "photos": [],
        "floorPlans": [],
        "apartmentTypes": [
            {
                "name": "1 + 1",
                "floorPlans": [],
                "photos": []
            },
            {
                "name": "2 + 1",
                "floorPlans": [],
                "photos": []
            },
            {
                "name": "3 + 1",
                "floorPlans": [],
                "photos": []
            }
        ],
        "projectStats": [
            [
                "Location",
                "Çıplaklı, Döşemealtı"
            ],
            [
                "Natural Setting",
                "Beside a 1,500-decare Pine Forest"
            ],
            [
                "Pools",
                "2 Outdoor + 1 Indoor"
            ],
            [
                "Project Type",
                "Residential + Commercial"
            ],
            [
                "Status",
                "Completed / Occupied"
            ]
        ],
        "amenities": [],
        "fullName": "RengiAntalya",
        "tagline": "Next to nature, at the centre of life.",
        "featuredStats": [
            "Natural Setting",
            "Pools",
            "Project Type",
            "Status"
        ]
    }
};
