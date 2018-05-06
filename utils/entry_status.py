from enum import Enum
class EntryStatus(Enum):
    REQUEST = "request"
    FALSE_POSITIVE = "false positive"  # Tree exists in our DB but not in real life
    FALSE_NEGATIVE = "false negative"  # Tree exists in real life but not in our DB
    TRUE_POSITIVE = "true positive"