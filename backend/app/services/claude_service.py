import json
import anthropic
from app.core.config import settings

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

SYSTEM_PROMPT = """You are an expert Adobe Experience Platform consultant specializing in XDM (Experience Data Model) schema design. You are conducting a business discovery interview with a non-technical marketer.

Your goal is to understand their business so you can design appropriate XDM schemas for Adobe Experience Platform.

INTERVIEW APPROACH:
- Be warm, professional, and consultative (like a senior Adobe architect)
- Ask ONE focused question at a time
- Remember everything they tell you
- After each answer, briefly acknowledge what you learned, then ask the next question
- Adapt questions based on what they share
- Cover: company info, customer types, products, transactions, marketing channels, loyalty programs, digital touchpoints, customer journeys

TOPIC PROGRESSION (follow this order, adapting as needed):
1. Company & industry (name, what they sell, business model)
2. Sales channels (online, physical stores, mobile app, etc.)
3. Customer types (individual consumers, business customers, loyalty members, anonymous visitors)
4. Products & categories
5. Transaction types (purchases, returns, exchanges)
6. Marketing activities (campaigns, email, SMS, push notifications)
7. Loyalty program (if any - tiers, points, rewards)
8. Digital experiences (website, app, in-store tech)
9. Data & analytics goals (what they want to achieve with AEP)

COMPLETION DETECTION:
When you have covered the major topics (channels, customers, products, transactions, marketing, loyalty), include this EXACT text at the end of your response:
[DISCOVERY_COMPLETE]

This signals the system to generate the XDM design. Only include this after you have enough information (typically after 8-12 exchanges).

BUSINESS CONTEXT TRACKING:
Throughout the conversation, mentally track:
- Industry, business model, channels
- Customer entity types
- Product/service entities
- Transaction/event types
- Marketing entities
- Loyalty entities
- Key data goals

Keep responses concise and friendly. Use plain English, no technical jargon."""


async def chat_with_claude(
    messages: list[dict], session_context: dict
) -> tuple[str, bool]:
    """
    Send messages to Claude and get response.
    Returns (response_text, is_discovery_complete).
    """
    formatted_messages = [
        {"role": m["role"], "content": m["content"]}
        for m in messages
    ]

    response = client.messages.create(
        model=settings.MODEL_ID,
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=formatted_messages,
    )

    response_text: str = response.content[0].text
    is_complete: bool = "[DISCOVERY_COMPLETE]" in response_text

    # Strip the sentinel marker before returning to the caller
    clean_response = response_text.replace("[DISCOVERY_COMPLETE]", "").strip()

    return clean_response, is_complete


async def extract_business_context(conversation: list[dict]) -> dict:
    """
    Use Claude to extract structured business context from the full conversation.
    Returns a structured dict with entities, channels, etc.
    """
    conversation_text = "\n".join(
        f"{m['role'].upper()}: {m['content']}" for m in conversation
    )

    extraction_prompt = f"""Based on this business discovery conversation, extract structured information.

CONVERSATION:
{conversation_text}

Return a JSON object with this structure:
{{
  "company_name": "string or null",
  "industry": "Retail",
  "business_model": "description",
  "channels": ["web", "mobile", "store"],
  "countries": ["US"],
  "brands": ["brand names"],
  "customer_types": ["individual", "business", "loyalty_member", "anonymous"],
  "entities": ["Customer", "Product", "Order"],
  "has_loyalty": true,
  "loyalty_details": {{"tiers": [], "points": true, "rewards": true}},
  "marketing_channels": ["email", "sms", "push", "social"],
  "transaction_types": ["purchase", "return", "exchange"],
  "digital_experiences": ["website", "mobile_app", "in_store", "call_center"],
  "data_goals": ["personalization", "segmentation"],
  "additional_context": "any other relevant info"
}}

Return ONLY the JSON object, no other text."""

    response = client.messages.create(
        model=settings.MODEL_ID,
        max_tokens=1500,
        messages=[{"role": "user", "content": extraction_prompt}],
    )

    raw = response.content[0].text.strip()
    # Strip markdown code fences if the model wraps the JSON
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "industry": "Retail",
            "entities": ["Customer", "Product", "Order"],
            "channels": [],
            "customer_types": ["individual"],
            "has_loyalty": False,
            "marketing_channels": [],
            "transaction_types": ["purchase"],
        }


async def answer_copilot_question(
    question: str, business_context: dict, xdm_design: dict
) -> str:
    """Answer AI co-pilot questions about the XDM design."""
    prompt = f"""You are an Adobe XDM expert. Answer this question about the generated XDM design.

BUSINESS CONTEXT:
{json.dumps(business_context, indent=2)}

XDM DESIGN SUMMARY:
{json.dumps(xdm_design, indent=2)}

USER QUESTION: {question}

Provide a clear, practical answer in 2-4 sentences. Focus on Adobe Experience Platform best practices."""

    response = client.messages.create(
        model=settings.MODEL_ID,
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}],
    )

    return response.content[0].text
