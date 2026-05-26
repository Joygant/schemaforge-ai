import json
from app.knowledge.retail_ontology import (
    RETAIL_ENTITIES,
    RETAIL_RELATIONSHIPS,
    IDENTITY_STRATEGY,
    DATASET_RECOMMENDATIONS,
)

XDM_FIELD_TYPES = {
    "id": "string",
    "Id": "string",
    "ID": "string",
    "Date": "string (ISO 8601)",
    "date": "string (ISO 8601)",
    "timestamp": "string (ISO 8601)",
    "Timestamp": "string (ISO 8601)",
    "amount": "number",
    "Amount": "number",
    "price": "number",
    "Price": "number",
    "balance": "number",
    "Balance": "number",
    "points": "number",
    "Points": "number",
    "quantity": "integer",
    "Quantity": "integer",
    "enabled": "boolean",
    "active": "boolean",
}


def infer_field_type(field_name: str) -> str:
    for key, ftype in XDM_FIELD_TYPES.items():
        if key in field_name:
            return ftype
    return "string"


def generate_xdm_schemas(business_context: dict) -> dict:
    """Generate complete XDM schema design from business context."""

    entities = list(business_context.get("entities", ["Customer", "Product", "Order"]))
    has_loyalty = business_context.get("has_loyalty", False)

    # Ensure LoyaltyAccount is included when loyalty program exists
    if has_loyalty and "LoyaltyAccount" not in entities:
        entities.append("LoyaltyAccount")

    schemas = []

    for entity_name in entities:
        ontology = RETAIL_ENTITIES.get(entity_name, {})

        xdm_class = ontology.get("xdm_class", "XDM ExperienceEvent")
        profile_enabled = ontology.get("profile_enabled", False)
        typical_attrs = ontology.get(
            "typical_attributes", [entity_name.lower() + "Id", "name"]
        )
        identity_fields = ontology.get("identity_fields", [])
        description = ontology.get("description", f"{entity_name} entity")

        # Build field definitions
        fields: dict = {}
        for attr in typical_attrs:
            field_def = {
                "type": infer_field_type(attr),
                "required": attr in identity_fields or attr.endswith("Id"),
                "description": attr,
            }
            if attr in identity_fields:
                field_def["identity"] = True
                field_def["identityNamespace"] = _get_namespace(attr)
            fields[attr] = field_def

        # Add standard event fields for Experience Events
        if xdm_class == "XDM ExperienceEvent":
            fields["eventTimestamp"] = {
                "type": "string (ISO 8601)",
                "required": True,
                "description": "When the event occurred",
            }
            fields["eventType"] = {
                "type": "string",
                "required": True,
                "description": "Type of event",
            }

        schema = {
            "schemaName": f"{entity_name} Schema",
            "xdmClass": xdm_class,
            "description": description,
            "profileEnabled": profile_enabled,
            "fields": fields,
            "requiredFields": [f for f, v in fields.items() if v.get("required")],
            "identityFields": identity_fields,
            "fieldGroups": _get_field_groups(entity_name, xdm_class),
            "ingestionRecommendation": _get_ingestion_rec(entity_name),
            "profileEnablementReason": _get_profile_reason(entity_name, profile_enabled),
        }

        schemas.append(schema)

    # Filter relationships to only entities that are in scope
    relationships = [
        r
        for r in RETAIL_RELATIONSHIPS
        if r["from"] in entities and r["to"] in entities
    ]

    datasets = [
        d for d in DATASET_RECOMMENDATIONS if any(e in d["schema"] for e in entities)
    ]
    if not datasets:
        datasets = DATASET_RECOMMENDATIONS[:3]

    return {
        "schemas": schemas,
        "relationships": relationships,
        "identityStrategy": IDENTITY_STRATEGY,
        "datasets": datasets,
        "totalSchemas": len(schemas),
    }


def _get_namespace(field: str) -> str:
    namespaces = {
        "customerId": "customerID",
        "email": "Email",
        "phone": "Phone",
        "loyaltyId": "loyaltyID",
        "ecid": "ECID",
        "cookieId": "ECID",
        "orderId": "orderID",
        "sku": "productSKU",
    }
    return namespaces.get(field, field.upper())


def _get_field_groups(entity: str, xdm_class: str) -> list[str]:
    groups: dict[str, list[str]] = {
        "Customer": [
            "XDM Individual Profile - Personal Details",
            "XDM Individual Profile - Contact Details",
            "XDM Individual Profile - Preferences",
        ],
        "LoyaltyAccount": [
            "XDM Individual Profile - Loyalty Details",
            "Custom Loyalty Field Group",
        ],
        "Order": [
            "XDM ExperienceEvent - Commerce Details",
            "XDM ExperienceEvent - Channel",
        ],
        "OrderItem": ["XDM ExperienceEvent - Commerce Details"],
        "Product": ["XDM ExperienceEvent - Product List"],
        "Campaign": ["XDM ExperienceEvent - Marketing Details"],
        "CampaignInteraction": [
            "XDM ExperienceEvent - Marketing Details",
            "XDM ExperienceEvent - Channel",
        ],
        "LoyaltyTransaction": [
            "XDM ExperienceEvent - Loyalty Transaction",
            "Custom Loyalty Field Group",
        ],
        "Store": ["XDM ExperienceEvent - Environment Details"],
    }
    return groups.get(entity, [f"Custom {entity} Field Group"])


def _get_ingestion_rec(entity: str) -> dict:
    recs: dict[str, dict] = {
        "Customer": {
            "sources": ["CRM", "Loyalty Platform"],
            "methods": ["Batch", "API"],
            "frequency": "Daily or real-time on change",
        },
        "LoyaltyAccount": {
            "sources": ["Loyalty Platform"],
            "methods": ["Batch", "Streaming"],
            "frequency": "Real-time on transaction",
        },
        "Order": {
            "sources": ["POS", "Ecommerce", "Mobile App"],
            "methods": ["Streaming", "Batch"],
            "frequency": "Real-time at purchase",
        },
        "OrderItem": {
            "sources": ["POS", "Ecommerce"],
            "methods": ["Streaming", "Batch"],
            "frequency": "With order events",
        },
        "Product": {
            "sources": ["Ecommerce", "PIM System"],
            "methods": ["Batch"],
            "frequency": "Daily catalog sync",
        },
        "Campaign": {
            "sources": ["Email Platform", "Marketing Automation"],
            "methods": ["Batch", "API"],
            "frequency": "At campaign creation",
        },
        "CampaignInteraction": {
            "sources": ["Email Platform", "Mobile App"],
            "methods": ["Streaming"],
            "frequency": "Real-time",
        },
        "LoyaltyTransaction": {
            "sources": ["Loyalty Platform"],
            "methods": ["Streaming"],
            "frequency": "Real-time on point event",
        },
        "Store": {
            "sources": ["Store Management System"],
            "methods": ["Batch"],
            "frequency": "On store change",
        },
    }
    return recs.get(
        entity,
        {"sources": ["Source System"], "methods": ["Batch"], "frequency": "As needed"},
    )


def _get_profile_reason(entity: str, enabled: bool) -> str:
    if enabled:
        reasons = {
            "Customer": (
                "Enable for Real-Time Customer Profile to support personalization, "
                "segmentation, and activation across channels."
            ),
            "LoyaltyAccount": (
                "Enable to merge loyalty data into unified customer profile for "
                "loyalty-based segmentation."
            ),
        }
        return reasons.get(
            entity, "Enable for profile unification and real-time activation."
        )
    else:
        reasons = {
            "Product": (
                "Disable - product catalog data does not represent a person. "
                "Use as lookup data instead."
            ),
            "Store": (
                "Disable - location data does not represent an individual. "
                "Reference via relationship."
            ),
            "Order": (
                "Disable - orders are experience events. They contribute to profile "
                "via event relationships, not direct profile."
            ),
            "Campaign": (
                "Disable - campaign definitions are reference data, not person-level data."
            ),
            "OrderItem": (
                "Disable - order line items are sub-events within commerce transactions."
            ),
            "CampaignInteraction": (
                "Disable - interactions are events, not profile records. "
                "They enrich profile via Experience Events."
            ),
            "LoyaltyTransaction": (
                "Disable - transactions are events. The Loyalty Account schema "
                "(profile-enabled) holds the current state."
            ),
        }
        return reasons.get(
            entity,
            "Disable - this entity represents reference or event data, not a person profile.",
        )


def generate_quality_score(xdm_design: dict, business_context: dict) -> dict:
    """Generate a 0-100 quality score for the XDM design."""

    schemas = xdm_design.get("schemas", [])

    # Identity completeness (0-100)
    profile_schemas = [s for s in schemas if s["profileEnabled"]]
    identity_score = 100 if profile_schemas else 20
    if any(
        "email" in str(s.get("identityFields", [])) for s in profile_schemas
    ):
        identity_score = min(100, identity_score + 10)

    # Duplication risk (0-100, higher = lower risk i.e. good separation)
    profile_count = len(profile_schemas)
    event_schemas = [s for s in schemas if not s["profileEnabled"]]
    duplication_risk = 100 if (profile_count <= 2 and len(event_schemas) > 0) else 70

    # Profile readiness (0-100)
    profile_ready = 80 if profile_schemas else 30
    if business_context.get("has_loyalty"):
        profile_ready = min(100, profile_ready + 10)

    # Personalization readiness (0-100)
    personalization = 70
    if any(s["xdmClass"] == "XDM ExperienceEvent" for s in schemas):
        personalization += 15
    if business_context.get("has_loyalty"):
        personalization += 15
    personalization = min(100, personalization)

    # Activation readiness (0-100)
    activation = 60
    if len(schemas) >= 3:
        activation += 20
    if xdm_design.get("relationships"):
        activation += 20
    activation = min(100, activation)

    overall = int(
        (identity_score + duplication_risk + profile_ready + personalization + activation) / 5
    )

    recommendations: list[str] = []
    if identity_score < 80:
        recommendations.append(
            "Add email and CRM ID as identity fields to Customer schema"
        )
    if profile_count == 0:
        recommendations.append(
            "Enable at least Customer schema for Real-Time Customer Profile"
        )
    if len(schemas) < 4:
        recommendations.append(
            "Consider adding Campaign Interaction schema for marketing measurement"
        )
    if not business_context.get("has_loyalty") and "loyalty" not in str(
        business_context
    ).lower():
        recommendations.append(
            "Consider adding a Loyalty program to increase customer engagement data richness"
        )

    return {
        "overall": overall,
        "breakdown": {
            "identityCompleteness": identity_score,
            "duplicationRisk": duplication_risk,
            "profileReadiness": profile_ready,
            "personalizationReadiness": personalization,
            "activationReadiness": activation,
        },
        "recommendations": recommendations,
    }
