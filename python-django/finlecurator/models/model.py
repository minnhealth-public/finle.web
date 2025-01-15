from enum import Enum
from typing import NamedTuple, List


class Source(Enum):
    GSHEETS = 1
    DATABASE = 2


class Sheet(Enum):
    LEGAL = 1
    FINANCIAL = 2
    CARE = 3
    MEDICAL = 4

    def title(self) -> str:
        return self.name.title()

    @classmethod
    def find_by_title(cls, title: str):
        for sheet in cls:
            if sheet.title() == title:
                return sheet
        return None


class SourceRef(NamedTuple):
    sheet: Sheet
    row: int

    def __str__(self) -> str:
        return f"{self.sheet.name.title()}[{self.row}]"


class Severity(Enum):
    WARNING = 1
    ERROR = 2


class Violation(NamedTuple):
    code: str
    severity: Severity
    source_ref: SourceRef
    message: str

    def __str__(self) -> str:
        return f"{{{self.code}}} {self.source_ref}: {self.message}"


class Model(object):
    def __init__(self, name: str, sheet: Sheet, row: int):
        self._name: str = name
        self._source_refs: List[SourceRef] = [SourceRef(sheet, row)]
        self._violations: List[Violation] = []

    @property
    def uid(self) -> str:
        source_ref = self._source_refs[0]
        return f"{self.__class__.__name__[:2]}{source_ref.sheet.title()[:2]}{source_ref.row:04d}"

    @property
    def name(self) -> str:
        return self._name

    @property
    def source_refs(self) -> List[SourceRef]:
        return self._source_refs

    @property
    def violations(self) -> List[Violation]:
        return self._violations

    @property
    def sort_value(self) -> int:
        ref = self._source_refs[0]
        return ref.sheet.value * 1000000 + ref.row

    @property
    def sheets(self) -> str:
        result = ""
        for ref in self._source_refs:
            result += ref.sheet.name
            result += " "
        return result

    def add_source_ref(self, source_ref: SourceRef) -> None:
        self._source_refs.append(source_ref)

    def add_violation(self, code: str, severity: Severity, source_ref: SourceRef, message: str) -> None:
        self._violations.append(Violation(code, severity, source_ref, message))
