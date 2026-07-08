# DATABASE_DESIGN.md

## 1. Database Overview
The CareTel AI Chatbot requires a robust and scalable database architecture to support its various functionalities, including user authentication, conversation history, AI memory, ticket management, knowledge base, vector embeddings, user roles, audit logs, and more. The database must be designed to handle high concurrency, ensure data integrity, and provide fast query performance for real-time interactions.

## 2. Database Technology Selection
The CareTel AI Chatbot will utilize a **hybrid database architecture**, combining the following technologies:

- **PostgreSQL**: For relational data such as users, tickets, roles, and audit logs.
- **MongoDB**: For unstructured or semi-structured data such as conversation history, AI memory, and session data.
- **Vector Database (e.g., Pinecone or FAISS)**: For storing and querying vector embeddings used in the RAG pipeline.
- **Redis**: For caching frequently accessed data, such as session tokens, user preferences, and AI model responses.

This multi-database approach ensures scalability, flexibility, and performance for the AI chatbot's diverse data needs.

## 3. Entity Relationship Overview
The database will contain the following key entities and their relationships:

- **Users**: Represent both new and existing customers, authenticated through Splynx.
- **Conversations**: Track the history of user interactions with the chatbot.
- **Tickets**: Store information related to unresolved issues reported by users.
- **Knowledge Base**: Store structured and unstructured information used by the AI for responses.
- **Vector Embeddings**: Store AI-generated vector representations of text for efficient retrieval.
- **Roles**: Define user roles (e.g., Customer, Admin, Human Agent).
- **Audit Logs**: Track all system and user activities for compliance and debugging.
- **Sessions**: Track active user sessions for context-aware interactions.

## 4. Table Definitions
### Users
| Column Name        | Data Type     | Description |
|--------------------|---------------|-------------|
| user_id            | UUID          | Primary key for user identification. |
| username           | VARCHAR(255)  | Unique username for authentication. |
| password_hash      | VARCHAR(255)  | Hash of the user's password. |
| email              | VARCHAR(255)  | User's email address. |
| is_splynx_user     | BOOLEAN       | Indicates if the user is authenticated via Splynx. |
| role_id            | UUID          | Foreign key to the Roles table. |
| created_at         | TIMESTAMP     | Timestamp for user creation. |
| updated_at         | TIMESTAMP     | Timestamp for last update. |

### Roles
| Column Name        | Data Type     | Description |
|--------------------|---------------|-------------|
| role_id            | UUID          | Primary key for role identification. |
| role_name          | VARCHAR(50)   | Name of the role (e.g., Customer, Admin, Human Agent). |
| permissions        | JSONB         | JSON array of permissions assigned to the role. |
| created_at         | TIMESTAMP     | Timestamp for role creation. |
| updated_at         | TIMESTAMP     | Timestamp for last update. |

### Conversations
| Column Name        | Data Type     | Description |
|--------------------|---------------|-------------|
| conversation_id    | UUID          | Primary key for conversation identification. |
| user_id            | UUID          | Foreign key to the Users table. |
| session_id         | UUID          | Foreign key to the Sessions table. |
| message_text       | TEXT          | The actual message exchanged. |
| is_from_user       | BOOLEAN       | Indicates if the message was sent by the user. |
| timestamp          | TIMESTAMP     | Timestamp of the message. |

### Tickets
| Column Name        | Data Type     | Description |
|--------------------|---------------|-------------|
| ticket_id          | UUID          | Primary key for ticket identification. |
| user_id            | UUID          | Foreign key to the Users table. |
| subject            | VARCHAR(255)  | Summary of the ticket. |
| description        | TEXT          | Detailed description of the issue. |
| status             | VARCHAR(50)   | Current status (e.g., Open, In Progress, Resolved). |
| created_at         | TIMESTAMP     | Timestamp for ticket creation. |
| updated_at         | TIMESTAMP     | Timestamp for last update. |
| assigned_to        | UUID          | Foreign key to the Users table (agent assigned). |

### Audit Logs
| Column Name        | Data Type     | Description |
|--------------------|---------------|-------------|
| log_id             | UUID          | Primary key for log identification. |
| user_id            | UUID          | Foreign key to the Users table. |
| action             | VARCHAR(255)  | Description of the action taken. |
| ip_address         | VARCHAR(45)   | IP address of the user. |
| timestamp          | TIMESTAMP     | Timestamp of the action. |

### Sessions
| Column Name        | Data Type     | Description |
|--------------------|---------------|-------------|
| session_id         | UUID          | Primary key for session identification. |
| user_id            | UUID          | Foreign key to the Users table. |
| start_time         | TIMESTAMP     | Timestamp when the session started. |
| end_time           | TIMESTAMP     | Timestamp when the session ended. |
| is_active           | BOOLEAN       | Indicates if the session is currently active. |

### Vector Embeddings
| Column Name        | Data Type     | Description |
|--------------------|---------------|-------------|
| embedding_id       | UUID          | Primary key for embedding identification. |
| text               | TEXT          | Original text used to generate the embedding. |
| embedding_vector   | FLOAT[]       | Vector representation of the text. |
| created_at         | TIMESTAMP     | Timestamp for embedding creation. |

## 5. Primary Keys
- **Users**: `user_id`
- **Roles**: `role_id`
- **Conversations**: `conversation_id`
- **Tickets**: `ticket_id`
- **Audit Logs**: `log_id`
- **Sessions**: `session_id`
- **Vector Embeddings**: `embedding_id`

## 6. Foreign Keys
- **Users.role_id** → **Roles.role_id**
- **Conversations.user_id** → **Users.user_id**
- **Conversations.session_id** → **Sessions.session_id**
- **Tickets.user_id** → **Users.user_id**
- **Tickets.assigned_to** → **Users.user_id**
- **Audit Logs.user_id** → **Users.user_id**
- **Sessions.user_id** → **Users.user_id**

## 7. Relationships
- **Users** has a **one-to-many** relationship with **Conversations**.
- **Users** has a **one-to-many** relationship with **Tickets**.
- **Users** has a **one-to-many** relationship with **Sessions**.
- **Users** has a **many-to-one** relationship with **Roles**.
- **Conversations** has a **many-to-one** relationship with **Sessions**.
- **Tickets** has a **many-to-one** relationship with **Users** (for the user who created the ticket) and **Users** (for the agent assigned).
- **Audit Logs** has a **many-to-one** relationship with **Users** (for the user who performed the action).

## 8. Index Strategy
- **Users.username**: Index to speed up authentication and lookup.
- **Users.email**: Index for fast email-based lookups.
- **Conversations.user_id**: Index for filtering conversations by user.
- **Conversations.timestamp**: Index for sorting and filtering by message time.
- **Tickets.user_id**: Index for filtering tickets by user.
- **Tickets.status**: Index for efficient filtering of open, in progress, or resolved tickets.
- **Sessions.user_id**: Index for filtering active sessions.
- **Vector Embeddings.embedding_vector**: Use a vector index (e.g., FAISS or Pinecone) for efficient similarity search.

## 9. Conversation Storage
- **Conversations** are stored in **MongoDB** as unstructured data.
- Each conversation is stored as a document containing:
  - `user_id`
  - `session_id`
  - `messages` (array of message objects, including `text`, `timestamp`, and `is_from_user`)
- Conversations are indexed by `user_id` and `timestamp` to support efficient retrieval.

## 10. Knowledge Base Storage
- The **RAG Knowledge Base** is stored in **PostgreSQL** as a relational table with the following schema:
  - **knowledge_id**: Primary key
  - **title**: VARCHAR
  - **content**: TEXT
  - **category**: VARCHAR (e.g., billing, service status, technical)
  - **created_at**: TIMESTAMP
- Additionally, **vector embeddings** for the knowledge base are stored in a **vector database** (e.g., Pinecone) for efficient retrieval.

## 11. Vector Database Design
- **Vector Embeddings** are stored in a **vector database** such as **Pinecone** or **FAISS**.
- Each embedding is indexed by a unique `embedding_id`.
- The vector database allows for efficient **similarity search** using cosine similarity or other distance metrics.
- Embeddings are associated with the original text in **PostgreSQL** for traceability and debugging.

## 12. Redis Cache Design
- **Redis** is used as a **caching layer** to improve performance for frequently accessed data.
- Key-value pairs stored in Redis include:
  - `user:{user_id}`: User profile information
  - `session:{session_id}`: Session-specific data
  - `ticket:{ticket_id}`: Ticket details
  - `embedding:{embedding_id}`: Vector embeddings for quick retrieval
- Redis is also used for **session management** and **rate limiting** to prevent abuse and ensure system stability.

## 13. Session Management
- **Sessions** are managed using a combination of **PostgreSQL** and **Redis**.
- **PostgreSQL** stores the session metadata (e.g., start and end times, user ID, status).
- **Redis** is used for real-time session tracking and to store session-specific data (e.g., user preferences, AI memory).
- Session data is cached in Redis for quick access and invalidated when the session ends or the user logs out.

## 14. Audit Logs
- **Audit Logs** are stored in **PostgreSQL** and are indexed by `user_id` and `timestamp`.
- Each log entry captures the following information:
  - `user_id`
  - `action` (e.g., "Login", "Ticket Created", "Message Sent")
  - `ip_address`
  - `timestamp`
- Audit logs are used for **compliance**, **debugging**, and **security monitoring**.

## 15. Backup Strategy
- **Database backups** are performed regularly using **automated scripts**.
- **PostgreSQL** and **MongoDB** are backed up using **pg_dump** and **mongodump**, respectively.
- **Vector databases** are backed up using **Pinecone's API** or **FAISS's serialization**.
- **Redis** data is backed up periodically using **RDB snapshots**.
- All backups are stored in a **secure, offsite location** (e.g., AWS S3 or Azure Blob Storage).
- **Point-in-time recovery** is supported for all databases.

## 16. Scaling Strategy
- **Horizontal scaling** is supported for **PostgreSQL**, **MongoDB**, and **Redis** using **replication and sharding**.
- **Vector databases** are scaled using **cloud-based vector indexing** (e.g., Pinecone).
- **Microservices** are deployed using **Kubernetes** for **auto-scaling** based on traffic.
- **Load balancing** is implemented using **NGINX** or **HAProxy** to distribute traffic across multiple instances.
- **Caching** is used extensively to reduce database load and improve response times.
- **Monitoring** tools (e.g., **Prometheus** and **Grafana**) are used to track performance and trigger scaling events automatically.
</think>
```tool
TOOL_NAME: create_new_file
BEGIN_ARG: filepath
"docs/DATABASE_DESIGN.md"