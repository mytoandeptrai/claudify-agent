---
name: python-guide
description: Apply Python best practices including PEP 8, clean code, testing, and project structure. Use when writing, reviewing, or refactoring Python code.
---

# Python Best Practices

## Quick Start

When working with Python code, follow these core principles:

1. **Follow PEP 8**: Use proper indentation, naming, and formatting
2. **Write tests**: Use pytest with >80% coverage
3. **Document**: Add docstrings and type hints
4. **Structure properly**: Separate concerns (routers, services, models)
5. **Validate early**: Use configuration validation at startup
6. **Automate quality**: Use Ruff, Black, mypy, pytest

## Code Style & Formatting

### PEP 8 Essentials

**Indentation**:
```python
# ✅ Good: 4 spaces
def calculate_total(items):
    total = 0
    for item in items:
        total += item.price
    return total
```

**Line Length**:
```python
# ✅ Good: Max 79 characters (code), 72 (docstrings)
result = (
    some_long_variable_name
    + another_long_variable_name
    + third_long_variable_name
)
```

**Blank Lines**:
```python
# ✅ Good: 2 blank lines between top-level, 1 between methods
class UserService:
    def __init__(self):
        pass
    
    def create_user(self):
        pass


def helper_function():
    pass
```

### Naming Conventions

```python
# ✅ Good: snake_case for functions/variables
def calculate_total():
    pass

user_count = 0

# ✅ Good: PascalCase for classes
class UserProfile:
    pass

# ✅ Good: UPPERCASE for constants
MAX_RETRIES = 3
DEFAULT_TIMEOUT = 30

# ✅ Good: _prefix for private, __prefix for name mangling
class DataProcessor:
    def _internal_method(self):
        pass
    
    def __private_method(self):
        pass
```

### Imports

```python
# ✅ Good: Standard library first, then third-party, then local
import os
import sys
from typing import List, Optional

import requests
from fastapi import FastAPI

from app.models import User
from app.services import UserService

# ✅ Good: Use explicit imports
from collections import OrderedDict  # Not: from collections import *

# ✅ Good: Handle circular imports with TYPE_CHECKING
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models import User

def process_user(user: 'User'):
    pass
```

## Type Hints

### Basic Types

```python
# ✅ Good: Use type hints for all functions
def greet(name: str, age: int) -> str:
    return f"Hello {name}, age {age}"

# ✅ Good: Use Optional for nullable
from typing import Optional

def find_user(user_id: int) -> Optional[User]:
    pass

# ✅ Good: Use Union for multiple types
from typing import Union

def parse_value(value: Union[str, int, float]) -> Any:
    pass

# ✅ Good: Use List, Dict, etc. from typing
from typing import List, Dict

def process_items(items: List[str]) -> Dict[str, int]:
    pass
```

### Advanced Types

```python
# ✅ Good: Use Protocol for structural typing
from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> None:
        ...

def render(shape: Drawable):
    shape.draw()

# ✅ Good: Use TypedDict for dictionaries
from typing import TypedDict

class UserConfig(TypedDict):
    username: str
    email: str
    age: int

# ✅ Good: Use Literal for specific values
from typing import Literal

def set_status(status: Literal["active", "inactive", "pending"]):
    pass

# ✅ Good: Use Callable for function types
from typing import Callable

def process_data(
    data: List[int],
    transformer: Callable[[int], int]
) -> List[int]:
    return [transformer(x) for x in data]
```

## Project Structure

### Production-Ready Layout

```
project/
├── app/
│   ├── __init__.py
│   ├── main.py              # Application entry point
│   ├── api/                 # API routes
│   │   ├── __init__.py
│   │   ├── routes/
│   │   │   ├── users.py
│   │   │   └── products.py
│   │   └── deps.py          # Dependencies
│   ├── core/                # Core configuration
│   │   ├── __init__.py
│   │   ├── config.py        # Settings
│   │   ├── security.py      # Auth/security
│   │   └── logging.py       # Logging config
│   ├── models/              # Database models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── product.py
│   ├── schemas/             # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── product.py
│   ├── services/            # Business logic
│   │   ├── __init__.py
│   │   ├── user_service.py
│   │   └── product_service.py
│   ├── repositories/        # Data access
│   │   ├── __init__.py
│   │   ├── user_repo.py
│   │   └── product_repo.py
│   └── utils/               # Utilities
│       ├── __init__.py
│       └── helpers.py
├── tests/                   # Test files
│   ├── __init__.py
│   ├── conftest.py          # Shared fixtures
│   ├── test_users.py
│   └── test_products.py
├── scripts/                 # Utility scripts
│   ├── setup_db.py
│   └── migrate.py
├── .env                     # Environment variables
├── .env.example             # Template
├── pyproject.toml           # Dependencies
├── pytest.ini               # Test config
├── mypy.ini                 # Type checking
├── ruff.toml                # Linting
└── README.md
```

### Configuration Management

```python
# ✅ Good: Use Pydantic Settings
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = "My App"
    debug: bool = False
    database_url: str
    secret_key: str
    max_connections: int = 100
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

# Usage
settings = get_settings()
```

## Documentation

### Docstrings

```python
# ✅ Good: Google style docstrings
def calculate_total(
    items: List[Item],
    tax_rate: float = 0.1
) -> float:
    """
    Calculate total price including tax.
    
    Args:
        items: List of items to calculate total for
        tax_rate: Tax rate as decimal (default: 0.1)
    
    Returns:
        Total price including tax
    
    Raises:
        ValueError: If items list is empty or tax_rate is negative
    
    Example:
        >>> items = [Item(price=100), Item(price=200)]
        >>> calculate_total(items, 0.1)
        330.0
    """
    if not items:
        raise ValueError("Items list cannot be empty")
    if tax_rate < 0:
        raise ValueError("Tax rate must be non-negative")
    
    subtotal = sum(item.price for item in items)
    return subtotal * (1 + tax_rate)
```

### Module Docstrings

```python
"""
User management module.

This module provides user-related business logic including:
- User creation and validation
- Authentication and authorization
- Profile management

Example:
    from app.services import UserService
    
    service = UserService()
    user = service.create_user("john", "john@example.com")
"""
```

## Testing

### Test Structure

```python
# tests/test_users.py
import pytest
from app.services import UserService
from app.models import User

class TestUserService:
    """Test cases for UserService."""
    
    @pytest.fixture
    def user_service(self):
        """Create UserService instance."""
        return UserService()
    
    def test_create_user_success(self, user_service):
        """Should create user with valid data."""
        user = user_service.create_user(
            username="john",
            email="john@example.com"
        )
        
        assert user.username == "john"
        assert user.email == "john@example.com"
        assert user.id is not None
    
    def test_create_user_duplicate_email(self, user_service):
        """Should raise error for duplicate email."""
        user_service.create_user(
            username="john",
            email="john@example.com"
        )
        
        with pytest.raises(ValueError, match="Email already exists"):
            user_service.create_user(
                username="jane",
                email="john@example.com"
            )
    
    def test_create_user_invalid_email(self, user_service):
        """Should raise error for invalid email."""
        with pytest.raises(ValueError, match="Invalid email"):
            user_service.create_user(
                username="john",
                email="invalid-email"
            )
```

### Test Fixtures (conftest.py)

```python
# tests/conftest.py
import pytest
from app.models import User
from app.services import UserService

@pytest.fixture
def sample_user():
    """Create sample user for testing."""
    return User(
        id=1,
        username="testuser",
        email="test@example.com"
    )

@pytest.fixture
def user_service():
    """Create UserService with test configuration."""
    return UserService(test_mode=True)

@pytest.fixture
def mock_database(mocker):
    """Mock database operations."""
    mock = mocker.patch('app.db.database')
    mock.execute.return_value = []
    return mock
```

### Test Coverage

```bash
# Run tests with coverage
pytest --cov=app --cov-report=html

# Minimum coverage requirement
pytest --cov=app --cov-fail-under=80

# Run specific test file
pytest tests/test_users.py -v

# Run with markers
pytest -m slow  # or -m fast, -m integration
```

## Error Handling

### Custom Exceptions

```python
# app/exceptions.py
class AppException(Exception):
    """Base exception for application."""
    def __init__(self, message: str, code: str = None):
        self.message = message
        self.code = code or self.__class__.__name__
        super().__init__(self.message)

class UserNotFoundException(AppException):
    """Raised when user is not found."""
    def __init__(self, user_id: int):
        super().__init__(
            message=f"User with id {user_id} not found",
            code="USER_NOT_FOUND"
        )

class ValidationError(AppException):
    """Raised when validation fails."""
    def __init__(self, message: str, field: str = None):
        super().__init__(message, "VALIDATION_ERROR")
        self.field = field
```

### Error Handling Patterns

```python
# ✅ Good: Specific exception handling
from app.exceptions import UserNotFoundException, ValidationError

def get_user(user_id: int) -> User:
    try:
        user = user_repo.find_by_id(user_id)
        if not user:
            raise UserNotFoundException(user_id)
        return user
    except UserNotFoundException:
        raise
    except Exception as e:
        logger.error(f"Failed to get user {user_id}: {e}")
        raise AppException("Failed to retrieve user")

# ✅ Good: Context managers for resources
from contextlib import contextmanager

@contextmanager
def database_transaction():
    """Manage database transaction."""
    conn = get_connection()
    try:
        conn.begin()
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
```

## Design Patterns

### Repository Pattern

```python
# app/repositories/base.py
from abc import ABC, abstractmethod
from typing import Generic, TypeVar, List, Optional

T = TypeVar('T')

class BaseRepository(ABC, Generic[T]):
    """Base repository with CRUD operations."""
    
    @abstractmethod
    def find_by_id(self, id: int) -> Optional[T]:
        pass
    
    @abstractmethod
    def find_all(self) -> List[T]:
        pass
    
    @abstractmethod
    def create(self, entity: T) -> T:
        pass
    
    @abstractmethod
    def update(self, id: int, entity: T) -> T:
        pass
    
    @abstractmethod
    def delete(self, id: int) -> bool:
        pass

# app/repositories/user_repository.py
class UserRepository(BaseRepository[User]):
    """User-specific repository."""
    
    def find_by_id(self, id: int) -> Optional[User]:
        # Implementation
        pass
    
    def find_by_email(self, email: str) -> Optional[User]:
        # Implementation
        pass
    
    def find_active_users(self) -> List[User]:
        # Implementation
        pass
```

### Service Layer Pattern

```python
# app/services/user_service.py
from app.repositories import UserRepository
from app.schemas import UserCreate, UserUpdate
from app.models import User

class UserService:
    """Business logic for user operations."""
    
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo
    
    def create_user(self, data: UserCreate) -> User:
        """Create new user with validation."""
        # Validate email uniqueness
        existing = self.user_repo.find_by_email(data.email)
        if existing:
            raise ValidationError("Email already exists", "email")
        
        # Create user
        user = User(
            username=data.username,
            email=data.email,
            hashed_password=hash_password(data.password)
        )
        
        return self.user_repo.create(user)
    
    def update_user(self, user_id: int, data: UserUpdate) -> User:
        """Update existing user."""
        user = self.user_repo.find_by_id(user_id)
        if not user:
            raise UserNotFoundException(user_id)
        
        # Update fields
        if data.username:
            user.username = data.username
        if data.email:
            user.email = data.email
        
        return self.user_repo.update(user_id, user)
```

### Dependency Injection

```python
# app/api/deps.py
from functools import lru_cache
from app.repositories import UserRepository
from app.services import UserService
from app.db import get_db

@lru_cache()
def get_user_repository() -> UserRepository:
    """Get UserRepository instance."""
    return UserRepository(get_db())

@lru_cache()
def get_user_service() -> UserService:
    """Get UserService instance."""
    return UserService(get_user_repository())

# Usage in API routes
from fastapi import Depends

@app.get("/users/{user_id}")
def get_user(
    user_id: int,
    service: UserService = Depends(get_user_service)
):
    user = service.get_user(user_id)
    return user
```

## Code Quality Tools

### Ruff Configuration (ruff.toml)

```toml
[lint]
select = [
    "E",   # pycodestyle errors
    "W",   # pycodestyle warnings
    "F",   # Pyflakes
    "I",   # isort
    "B",   # flake8-bugbear
    "C4",  # flake8-comprehensions
    "UP",  # pyupgrade
]

ignore = [
    "E501",  # Line too long (handled by formatter)
]

[lint.per-file-ignores]
"__init__.py" = ["F401"]  # Unused imports OK in __init__
"tests/*" = ["S101"]      # Assert OK in tests

[format]
quote-style = "double"
indent-style = "space"
line-ending = "auto"
```

### Pytest Configuration (pytest.ini)

```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = 
    -v
    --strict-markers
    --tb=short
    --cov=app
    --cov-report=term-missing
markers =
    slow: marks tests as slow
    integration: marks tests as integration tests
    unit: marks tests as unit tests
```

### Mypy Configuration (mypy.ini)

```ini
[mypy]
python_version = 3.11
warn_return_any = True
warn_unused_configs = True
disallow_untyped_defs = True
disallow_incomplete_defs = True
check_untyped_defs = True
no_implicit_optional = True
warn_redundant_casts = True
warn_unused_ignores = True

[mypy-tests.*]
disallow_untyped_defs = False
```

## Anti-Patterns to Avoid

### ❌ Bad: Mutable Default Arguments

```python
# ❌ Bad
def add_item(item, items=[]):
    items.append(item)
    return items

# ✅ Good
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items
```

### ❌ Bad: Bare Except

```python
# ❌ Bad
try:
    risky_operation()
except:
    pass

# ✅ Good
try:
    risky_operation()
except SpecificException as e:
    logger.error(f"Operation failed: {e}")
    raise
```

### ❌ Bad: Deep Nesting

```python
# ❌ Bad
def process_data(data):
    if data:
        for item in data:
            if item.valid:
                for subitem in item.subitems:
                    if subitem.active:
                        process(subitem)

# ✅ Good
def process_data(data):
    if not data:
        return
    
    for item in data:
        if not item.valid:
            continue
        
        for subitem in item.subitems:
            if subitem.active:
                process(subitem)
```

### ❌ Bad: Magic Numbers

```python
# ❌ Bad
def calculate_price(price):
    return price * 1.1 * 0.95

# ✅ Good
TAX_RATE = 0.1
DISCOUNT_RATE = 0.05

def calculate_price(price):
    return price * (1 + TAX_RATE) * (1 - DISCOUNT_RATE)
```

### ❌ Bad: God Classes

```python
# ❌ Bad: Does everything
class UserManager:
    def create_user(self): pass
    def delete_user(self): pass
    def send_email(self): pass
    def generate_report(self): pass
    def connect_db(self): pass

# ✅ Good: Single responsibility
class UserService:
    def create_user(self): pass
    def delete_user(self): pass

class EmailService:
    def send_email(self): pass

class ReportGenerator:
    def generate_report(self): pass
```

## Commands

/python-guide-lint: Run Ruff linter and formatter
/python-guide-test: Run pytest with coverage
/python-guide-typecheck: Run mypy type checking
/python-guide-format: Format code with Black/Ruff

## Examples

### Example 1: Create New Feature

User: "Add user registration endpoint"

Agent:
1. Create schema in `app/schemas/user.py`
2. Create service in `app/services/user_service.py`
3. Create repository in `app/repositories/user_repo.py`
4. Create route in `app/api/routes/users.py`
5. Write tests in `tests/test_users.py`
6. Run: `ruff check app && pytest tests/test_users.py`

Follow patterns in existing code. Use type hints, docstrings, and proper error handling.

### Example 2: Refactor Legacy Code

User: "Refactor this function"

Agent:
1. Write tests for current behavior
2. Add type hints
3. Extract helper functions
4. Improve naming
5. Add docstrings
6. Run: `ruff check && mypy && pytest`

Ensure tests pass before and after. Maintain backward compatibility.

### Example 3: Fix Bug

User: "Fix null pointer exception"

Agent:
1. Reproduce the bug with test
2. Identify root cause (missing None check)
3. Add proper None handling
4. Add type hints (Optional)
5. Run tests to verify fix
6. Run: `ruff check && mypy`

## Additional Resources

- [PEP 8 Style Guide](https://peps.python.org/pep-0008/)
- [Real Python Best Practices](https://realpython.com/tutorials/best-practices/)
- [Python Code Quality Tools](https://realpython.com/python-code-quality/)
- [FastAPI Best Practices](https://dev.to/building-production-ready-apis-with-fastapi-in-2026)
