from fastapi import HTTPException
import jwt
from datetime import datetime, timedelta
from app.config import settings


def create_access_token(data: dict):
    """
    Create a JWT access token.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=30)  # Token expires in 30 minutes
    to_encode.update({"exp": expire})
    to_encode["sub"] = str(to_encode.get("sub"))  # Ensure 'sub' is a string
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str):
    """
    Decode and verify a JWT access token.
    """
    try:
        print("Decoding token:", token)
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            raise HTTPException(status_code=401, detail="Invalid token: Missing 'sub'")
        
        # Convert 'sub' to an integer if necessary
        try:
            user_id = int(sub)
        except ValueError:
            raise HTTPException(status_code=401, detail="Invalid token: 'sub' must be an integer")
        
        return {"sub": user_id}
    except jwt.ExpiredSignatureError:
        print("Token expired")
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        print("Invalid token:", str(e))
        raise HTTPException(status_code=401, detail="Invalid token")