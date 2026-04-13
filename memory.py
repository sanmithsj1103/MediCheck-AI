from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.runnables.history import RunnableWithMessageHistory

from langchain_core.runnables import RunnablePassthrough
from operator import itemgetter

import firebase_admin
from firebase_admin import credentials, firestore

# Load your service account key
cred = credentials.Certificate("firebase_key.json")

firebase_admin.initialize_app(cred)

db = firestore.client()

from langchain_core.chat_history import BaseChatMessageHistory

class FirebaseChatMessageHistory(BaseChatMessageHistory):
    def __init__(self, session_id):
        self.session_id = session_id
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
            else:
                msgs.append(AIMessage(content=data["content"]))

        return msgs

    def add_message(self, message):
        self.session_ref.collection("messages").add({
            "role": message.type,
            "content": message.content,
            "timestamp": firestore.SERVER_TIMESTAMP
        })

    def clear(self):
        docs = self.session_ref.collection("messages").stream()
        for doc in docs:
            doc.reference.delete()

def get_session_history(session_id):
    return FirebaseChatMessageHistory(session_id)

chain = (
    RunnablePassthrough.assign(
        messages=itemgetter("messages") 
    )
    | template
    | model
)

chain_with_history = RunnableWithMessageHistory(
    chain,
    get_session_history,
    input_messages_key="text",
    history_messages_key="messages"
)

session_id = input("ENTER SESSION ID:")
while True:
    user_input = input("You: ")

    response = chain_with_history.invoke(
        {"text": user_input},
        config={"configurable": {"session_id": session_id}}
    )
    print("Bot:", response.content)