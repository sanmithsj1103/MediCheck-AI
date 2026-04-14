from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from firebase_admin import firestore

# Import the existing DB client
from app.services.firebase_service import get_firestore_client

class FirebaseChatMessageHistory(BaseChatMessageHistory):
    def __init__(self, session_id: str):
        self.session_id = session_id
        db = get_firestore_client()
        self.session_ref = db.collection("sessions").document(session_id)

    @property
    def messages(self):
        docs = (
            self.session_ref
            .collection("messages")
            .order_by("timestamp")
            .stream()
        )

        msgs = []
        for doc in docs:
            data = doc.to_dict()
            if data["role"] == "human":
                msgs.append(HumanMessage(content=data["content"]))
            elif data["role"] == "ai":
                msgs.append(AIMessage(content=data["content"]))
            elif data["role"] == "system":
                msgs.append(SystemMessage(content=data["content"]))

        return msgs

    def add_message(self, message):
        role_type = "human"
        if isinstance(message, AIMessage):
            role_type = "ai"
        elif isinstance(message, SystemMessage):
            role_type = "system"
            
        self.session_ref.collection("messages").add({
            "role": role_type,
            "content": message.content,
            "timestamp": firestore.SERVER_TIMESTAMP
        })

    def clear(self):
        docs = self.session_ref.collection("messages").stream()
        for doc in docs:
            doc.reference.delete()

def get_session_history(session_id: str) -> FirebaseChatMessageHistory:
    return FirebaseChatMessageHistory(session_id)
