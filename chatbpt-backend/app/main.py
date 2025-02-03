from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.schemas.chat import ChatRequest, ChatResponse, ChatHistoryListResponse
from app.services.auth_service import create_access_token, decode_access_token
from app.services.gemini_service import generate_response
from app.models.user import User
from app.models.chat_history import ChatHistory
from app.utils.database import get_db
from passlib.context import CryptContext 
from fastapi.security import OAuth2PasswordBearer
from app.services.auth_service import decode_access_token
from fastapi import Depends, HTTPException, Security
from app.models.user import TokenBlacklist
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

app = FastAPI()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
 
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # requests from React frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

@app.get("/")
async def root():
    return {"message": "Hello, World!"}

@app.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Register a new user.
    """
    result = await db.execute(select(User).filter_by(email=user_data.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        is_premium=user_data.is_premium
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user

@app.post("/login")
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    """
    Authenticate a user and return an access token.
    """
    result = await db.execute(select(User).filter_by(email=user_data.email))
    db_user = result.scalars().first()

    if not db_user or not pwd_context.verify(user_data.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token({"sub": db_user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "is_premium": db_user.is_premium
        }
    }


async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Dependency to get the current user from the access token.
    """
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception
    return user_id

@app.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user)  # Validate the token
):
    """
    Send a message to the AI and receive a response.
    """
    ai_response = generate_response(request.message)

    # Save the chat history to the database
    chat = ChatHistory(user_id=user_id, message=request.message, response=ai_response)
    db.add(chat)
    await db.commit()

    return {"message": request.message, "response": ai_response}

@app.get("/chat/history", response_model=ChatHistoryListResponse)
async def get_chat_history(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ChatHistory).filter_by(user_id=user_id))
    chats = result.scalars().all()
    return {"chats": chats}

@app.post("/logout")
async def logout(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    """
    Invalidate the current token by adding it to the blacklist.
    """
    # Check if the token is already blacklisted
    result = await db.execute(select(TokenBlacklist).filter_by(token=token))
    blacklisted_token = result.scalars().first()
    if blacklisted_token:
        raise HTTPException(status_code=400, detail="Token already invalidated")

    # Add the token to the blacklist
    new_blacklisted_token = TokenBlacklist(token=token)
    db.add(new_blacklisted_token)
    await db.commit()

    return {"message": "Logout successful"}

handler = Mangum(app)