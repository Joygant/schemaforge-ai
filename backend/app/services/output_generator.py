from app.knowledge.retail_ontology import RETAIL_ENTITIES


def generate_business_summary(business_context: dict, xdm_design: dict) -> dict:
    """Generate executive summary of the business."""
    company = business_context.get("company_name", "Your Company")
    industry = business_context.get("industry", "Retail")
    channels = business_context.get("channels", [])
    entities = business_context.get("entities", [])
    customer_types = business_context.get("customer_types", ["individual"])
    has_loyalty = business_context.get("has_loyalty", False)
    marketing_channels = business_context.get("marketing_channels", [])

    channel_str = ", ".join(channels) if channels else "multiple channels"

    schemas = xdm_design.get("schemas", [])
    profile_schema_count = len([s for s in schemas if s.get("profileEnabled")])
    event_schema_count = len([s for s in schemas if not s.get("profileEnabled")])

    return {
        "companyName": company,
        "industry": industry,
        "overview": (
            f"{company} operates in the {industry} industry, selling through {channel_str}. "
            f"The business serves {', '.join(customer_types)} customers"
            f"{' including a loyalty program' if has_loyalty else ''}."
        ),
        "keyEntities": entities,
        "channels": channels,
        "marketingChannels": marketing_channels,
        "hasLoyaltyProgram": has_loyalty,
        "recommendedSchemaCount": len(schemas),
        "dataGoals": business_context.get("data_goals", ["personalization", "segmentation"]),
        "executiveSummary": (
            f"We identified {len(entities)} core data entities for {company}. "
            f"The XDM design supports {profile_schema_count} profile schema(s) and "
            f"{event_schema_count} event schema(s), enabling real-time personalization "
            f"across {channel_str}."
        ),
    }


def generate_entity_model(business_context: dict, xdm_design: dict) -> dict:
    """Generate entity model table."""
    entities = []

    for schema in xdm_design.get("schemas", []):
        entity_name = schema["schemaName"].replace(" Schema", "")

        entities.append(
            {
                "entity": entity_name,
                "description": schema["description"],
                "xdmClass": schema["xdmClass"],
                "profileEnabled": schema["profileEnabled"],
                "keyFields": schema.get("requiredFields", [])[:4],
                "identityFields": schema.get("identityFields", []),
            }
        )

    return {
        "entities": entities,
        "totalEntities": len(entities),
        "profileEntities": len([e for e in entities if e["profileEnabled"]]),
        "eventEntities": len([e for e in entities if not e["profileEnabled"]]),
    }


def generate_mermaid_diagram(xdm_design: dict, business_context: dict) -> str:
    """Generate Mermaid architecture diagram."""
    relationships = xdm_design.get("relationships", [])
    schemas = xdm_design.get("schemas", [])

    lines = ["graph TD"]

    # Add node definitions with styling class
    for schema in schemas:
        # Create a safe node ID (no spaces)
        name = schema["schemaName"].replace(" Schema", "").replace(" ", "")
        display = schema["schemaName"].replace(" Schema", "")
        if schema["profileEnabled"]:
            lines.append(f'    {name}["{display}<br/><small>Profile</small>"]:::profile')
        else:
            lines.append(f'    {name}["{display}<br/><small>Event</small>"]:::event')

    lines.append("")

    # Add relationship arrows
    for rel in relationships:
        from_name = rel["from"].replace(" ", "")
        to_name = rel["to"].replace(" ", "")
        rel_type = rel["type"]
        lines.append(f'    {from_name} -->|"{rel_type}"| {to_name}')

    # Add class styling
    lines.append("")
    lines.append("    classDef profile fill:#FF6B35,color:white,stroke:#CC5528")
    lines.append("    classDef event fill:#1E88E5,color:white,stroke:#1565C0")

    return "\n".join(lines)


def generate_json_export(xdm_design: dict, business_context: dict) -> dict:
    """Generate deployable JSON schema output."""
    schemas_json: dict = {}

    for schema in xdm_design.get("schemas", []):
        schema_key = schema["schemaName"].replace(" ", "_").lower()

        json_schema: dict = {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "$id": f"https://ns.adobe.com/xdm/{schema_key}",
            "title": schema["schemaName"],
            "description": schema["description"],
            "type": "object",
            "meta:class": schema["xdmClass"],
            "meta:profileEnabled": schema["profileEnabled"],
            "meta:fieldGroups": schema.get("fieldGroups", []),
            "properties": {},
        }

        for field_name, field_def in schema.get("fields", {}).items():
            prop: dict = {
                "type": field_def.get("type", "string"),
                "title": field_name,
            }
            if field_def.get("identity"):
                prop["meta:identity"] = True
                prop["meta:namespace"] = field_def.get(
                    "identityNamespace", field_name.upper()
                )
            if field_def.get("required"):
                prop["meta:required"] = True
            json_schema["properties"][field_name] = prop

        if schema.get("requiredFields"):
            json_schema["required"] = schema["requiredFields"]

        schemas_json[schema_key] = json_schema

    return {
        "version": "1.0",
        "industry": business_context.get("industry", "Retail"),
        "generatedAt": "2026-05-26T00:00:00Z",
        "schemas": schemas_json,
        "relationships": xdm_design.get("relationships", []),
        "identityStrategy": xdm_design.get("identityStrategy", {}),
        "datasets": xdm_design.get("datasets", []),
    }
