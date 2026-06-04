# backend/app/services/ai_agent.py
import json
from openai import AsyncOpenAI
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.services.finance_tools import FinanceAnalyticsTools

class FIAgentService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def chat_with_agent(self, user_id: int, user_message: str, db: AsyncSession) -> str:
        # 1. Define tools schemas available for the LLM model to trigger
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "get_spending_by_category",
                    "description": "Get total spending grouped by category over a specific historical window of days.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "days": {"type": "integer", "description": "Number of past days to analyze. Defaults to 30."}
                        },
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "get_merchant_history",
                    "description": "Fetch transaction history records for a specific merchant keyword search.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "merchant_name": {"type": "string", "description": "The exact or partial name of the vendor/merchant."}
                        },
                        "required": ["merchant_name"],
                    },
                },
            }
        ]

        messages = [
            {
                "role": "system",
                "content": "You are a highly analytical, precise personal finance AI copilot. You have tool functions to view database records. Always use data returned from your tools to back up insights. Synthesize answers in clean Markdown prose."
            },
            {"role": "user", "content": user_message}
        ]

        # 2. Fire initial completion query to evaluate intent routing
        response = await self.client.chat.completions.create(
            model="gpt-4o-mini",  # Highly cost-effective and engineered for precise function execution
            messages=messages,
            tools=tools,
            tool_choice="auto"
        )
        
        response_message = response.choices[0].message
        tool_calls = response_message.tool_calls

        # 3. If the model decided to execute a data tool route, process it
        if tool_calls:
            messages.append(response_message)  # Extend conversation graph history context
            
            for tool_call in tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)
                
                # Execute mapped target tool handler
                if function_name == "get_spending_by_category":
                    days = function_args.get("days", 30)
                    tool_data = await FinanceAnalyticsTools.get_spending_by_category(db, user_id, days)
                elif function_name == "get_merchant_history":
                    merchant_name = function_args.get("merchant_name")
                    tool_data = await FinanceAnalyticsTools.get_merchant_history(db, user_id, merchant_name)
                else:
                    tool_data = {"error": "Tool execution function mapping error."}

                # Append tool response block back to the chat model
                messages.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": function_name,
                    "content": json.dumps(tool_data)
                })
            
            # 4. Request final summary synthesis based on data returned from tools
            final_response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages
            )
            return final_response.choices[0].message.content

        # Default fallback if no execution was required by the agent
        return response_message.content

ai_agent_service = FIAgentService()