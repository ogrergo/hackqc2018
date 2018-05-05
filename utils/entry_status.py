from enum import Enum
class EntryCategory(Enum):
    REQUEST = 1
    FALSE_POSITIVE = 2  # Tree exists in our DB but not in real life
    FALSE_NEGATIVE = 3  # Tree exists in real life but not in our DB
    TRUE_POSITIVE = 4