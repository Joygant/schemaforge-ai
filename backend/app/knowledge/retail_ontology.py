RETAIL_ENTITIES = {
    "Customer": {
        "xdm_class": "XDM Individual Profile",
        "profile_enabled": True,
        "typical_attributes": [
            "customerId", "firstName", "lastName", "email", "phone",
            "gender", "birthDate", "loyaltyId",
        ],
        "identity_fields": ["customerId", "email", "loyaltyId"],
        "description": "Represents an individual customer or loyalty member",
    },
    "LoyaltyAccount": {
        "xdm_class": "XDM Individual Profile",
        "profile_enabled": True,
        "typical_attributes": [
            "loyaltyId", "tier", "pointsBalance", "enrollmentDate", "customerId",
        ],
        "identity_fields": ["loyaltyId"],
        "description": "Loyalty program membership and points tracking",
    },
    "Product": {
        "xdm_class": "XDM ExperienceEvent",
        "profile_enabled": False,
        "typical_attributes": [
            "sku", "productId", "name", "category", "brand", "price", "description",
        ],
        "identity_fields": ["sku", "productId"],
        "description": "Product catalog item",
    },
    "Order": {
        "xdm_class": "XDM ExperienceEvent",
        "profile_enabled": False,
        "typical_attributes": [
            "orderId", "orderDate", "totalAmount", "currency",
            "storeId", "customerId", "channel",
        ],
        "identity_fields": ["orderId"],
        "description": "Purchase transaction event",
    },
    "OrderItem": {
        "xdm_class": "XDM ExperienceEvent",
        "profile_enabled": False,
        "typical_attributes": [
            "orderItemId", "orderId", "sku", "quantity", "unitPrice", "discount",
        ],
        "identity_fields": [],
        "description": "Line item within a purchase order",
    },
    "Store": {
        "xdm_class": "XDM ExperienceEvent",
        "profile_enabled": False,
        "typical_attributes": [
            "storeId", "storeName", "address", "city", "country", "storeType",
        ],
        "identity_fields": ["storeId"],
        "description": "Physical or digital retail location",
    },
    "Campaign": {
        "xdm_class": "XDM ExperienceEvent",
        "profile_enabled": False,
        "typical_attributes": [
            "campaignId", "campaignName", "channel", "startDate", "endDate", "targetSegment",
        ],
        "identity_fields": ["campaignId"],
        "description": "Marketing campaign definition",
    },
    "CampaignInteraction": {
        "xdm_class": "XDM ExperienceEvent",
        "profile_enabled": False,
        "typical_attributes": [
            "interactionId", "campaignId", "customerId", "eventType", "timestamp", "channel",
        ],
        "identity_fields": [],
        "description": "Customer interaction with a campaign (open, click, convert)",
    },
    "LoyaltyTransaction": {
        "xdm_class": "XDM ExperienceEvent",
        "profile_enabled": False,
        "typical_attributes": [
            "transactionId", "loyaltyId", "transactionType", "points", "timestamp", "orderId",
        ],
        "identity_fields": [],
        "description": "Points earned or redeemed loyalty event",
    },
}

RETAIL_RELATIONSHIPS = [
    {
        "from": "Customer",
        "to": "Order",
        "type": "1:N",
        "description": "Customer places Orders",
    },
    {
        "from": "Order",
        "to": "OrderItem",
        "type": "1:N",
        "description": "Order contains Order Items",
    },
    {
        "from": "Product",
        "to": "OrderItem",
        "type": "1:N",
        "description": "Product appears in Order Items",
    },
    {
        "from": "Customer",
        "to": "LoyaltyAccount",
        "type": "1:1",
        "description": "Customer has one Loyalty Account",
    },
    {
        "from": "Campaign",
        "to": "CampaignInteraction",
        "type": "1:N",
        "description": "Campaign generates Interactions",
    },
    {
        "from": "Customer",
        "to": "LoyaltyTransaction",
        "type": "1:N",
        "description": "Customer has Loyalty Transactions",
    },
    {
        "from": "Store",
        "to": "Order",
        "type": "1:N",
        "description": "Store processes Orders",
    },
]

IDENTITY_STRATEGY = {
    "primary": ["customerId", "email"],
    "secondary": ["loyaltyId", "phone"],
    "device": ["ecid", "cookieId"],
    "description": (
        "Use CRM ID as primary, Email as secondary deterministic, "
        "ECID for web/app linkage"
    ),
}

DATASET_RECOMMENDATIONS = [
    {
        "name": "Customer Profile Dataset",
        "schema": "Customer Profile Schema",
        "profile_enabled": True,
        "ingestion": ["CRM", "Loyalty Platform"],
        "methods": ["Batch", "API"],
    },
    {
        "name": "Order Event Dataset",
        "schema": "Commerce Event Schema",
        "profile_enabled": False,
        "ingestion": ["POS", "Ecommerce"],
        "methods": ["Streaming", "Batch"],
    },
    {
        "name": "Product Catalog Dataset",
        "schema": "Product Schema",
        "profile_enabled": False,
        "ingestion": ["Ecommerce", "PIM"],
        "methods": ["Batch"],
    },
    {
        "name": "Campaign Interaction Dataset",
        "schema": "Campaign Event Schema",
        "profile_enabled": False,
        "ingestion": ["Email Platform", "Mobile App"],
        "methods": ["Streaming"],
    },
    {
        "name": "Loyalty Event Dataset",
        "schema": "Loyalty Event Schema",
        "profile_enabled": False,
        "ingestion": ["Loyalty Platform"],
        "methods": ["Streaming", "Batch"],
    },
]
