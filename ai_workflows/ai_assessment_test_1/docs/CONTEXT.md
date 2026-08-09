# Context
This is an application that uses n8n to process AI requests and respond to them using ChatGPT. It uses a RAG system to provide context to the AI and a Telegram bot and email to receive and send messages. The application is containerized with docker and docker-compose.  

Made in Colombia, is an academy that teaches foreign languages, specially English. The application is a solution to answer questions about schedules, prices, levels, inscriptions, certifications and modalities. The application can answer questions in Spanish and English.  
The AI mustn't hallucinate, if the answer is not in the RAG context, it should respond that it doesn't have the information and ask the user to contact the academy directly.  

# Tech stack
- docker
- docker-compose

The application will be fully containerized with docker and docker-compose.  
Including n8n, Node.js, ChatGPT, Telegram bot and email.  
