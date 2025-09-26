# pip install requests lxml

from __future__ import annotations

import re
import base64
import argparse
import requests
from pathlib import Path
from collections import defaultdict, Counter
from typing import DefaultDict, Dict, Set, Tuple, List, Union
from lxml import etree  # type: ignore
from io import BytesIO

# -------------------------------------------------------------------
# Constants and Configurations
# -------------------------------------------------------------------

# Repository details for fetching XML files if no local path is provided
OWNER = "chummer5a"
REPO = "chummer5a"
BRANCH = "99664f5ce3d5c1d9bdb4532537bcce8fc9c4c488"  # v5.255.989

# String length threshold for inline union literals
STRING_LIMIT = 100

# Namespace prefixes used in XML processing
NS_PREFIX = {
    "http://www.w3.org/2000/xmlns/": "xmlns",
    "http://www.w3.org/2001/XMLSchema-instance": "xsi",
}

# Regular expression to validate TypeScript-safe identifiers
IDENT_RE = re.compile(r"^[A-Za-z_]\w*$")

# Utility TypeScript types shared across schemas
UTILITY_TYPES_TS = """\
/**
 * Generated Automatically, DO NOT EDIT
 *
 * Check utils/generate_schemas.py for more info
 *
 * Shared TypeScript utility types for XML-to-TS schema generation.
 */

/** Represents an explicit empty value from a self-closed element. */
export type Empty = null;

/** Represents a homogeneous array of values. */
export type Many<T> = T[];

/** Represents either a single value or an array of values. */
export type OneOrMany<T> = T | T[];

/** Represents a string literal type for numeric values. */
export type IntegerString = `${number}`;
"""

# XML Processing Configuration

# Tags to extract into separate interfaces (tag -> interface name)
EXTRACT_TAGS: dict[str, str] = {
    "bonus":     "BonusSchema",
    "forbidden": "ConditionsSchema",
    "required":  "ConditionsSchema",
}

# Storage for extracted structures by tag
EXTRACT_STRUCTURES: dict[str, List[Tuple[str, Structure, Multiplicity]]] = {}

# Flattens recursive paths for cleaner output
RECURSIVE_ALIAS: dict[str, tuple[str, str]] = {
    "chummer/metatypes/metatype/metavariants/metavariant": (
        "chummer/metatypes/metatype",
        "Metatype",
    ),
}

# Groups of files to merge into a single schema
MERGE_GROUPS = [
    (["critters.xml", "metatypes.xml"], "Metatype"),
]

# List of XML files to process
FILES = [
    'actions.xml', 'armor.xml', 'bioware.xml', 'complexforms.xml', 'critterpowers.xml',
    'critters.xml', 'cyberware.xml', 'echoes.xml', 'gear.xml', 'metatypes.xml',
    'powers.xml', 'qualities.xml', 'spells.xml', 'vehicles.xml', 'weapons.xml',
]

# -------------------------------------------------------------------
# Data Structures
# -------------------------------------------------------------------

class NodeInfo:
    __slots__ = (
        "children",
        "text_count",
        "text_samples",
        "attrs",
        "count",
        "attr_block_count",
        "empty_count",
    )

    def __init__(self):
        self.count = 0
        self.text_count = 0
        self.text_samples = []
        self.empty_count = 0
        self.attr_block_count = 0
        self.children: Set[str] = set()
        self.attrs: Dict[str, Tuple[int, List[str]]] = defaultdict(lambda: (0, []))

    def merge(self, other: NodeInfo):
        """Merge another NodeInfo into this one."""
        self.count += other.count
        self.text_count += other.text_count
        self.empty_count += other.empty_count
        self.attr_block_count += other.attr_block_count
        self.text_samples = self.text_samples + other.text_samples

        for attr, (count_other, samples_other) in other.attrs.items():
            count_self, samples_self = self.attrs[attr]
            new_count = count_self + count_other
            new_samples = samples_self + samples_other
            self.attrs[attr] = (new_count, new_samples)

        self.children.update(other.children)

Structure = Dict[str, NodeInfo]
Multiplicity = DefaultDict[str, DefaultDict[str, list[Union[int, float]]]]  # parent -> child -> [present, min, max]
SecondLevelDefs = Dict[str, str]  # tag -> interface definition

# -------------------------------------------------------------------
# Utility Functions
# -------------------------------------------------------------------

def infer_type(samples: List[str]) -> str:
    """Infers a TypeScript-compatible type from a list of sample strings."""
    if not samples:
        return "string"

    # Deduplicate and sort samples
    unique_samples = list(dict.fromkeys(samples))
    unique_samples.sort()

    integer_strings = []
    other_strings = []

    for s in unique_samples:
        try:
            float(s)
            integer_strings.append(s)
        except ValueError:
            other_strings.append(s)

    type_parts = []

    if integer_strings:
        type_parts.append("IntegerString")

    if other_strings:
        part = " | ".join([f'"{s}"' for s in other_strings])
        if len(part) < STRING_LIMIT:
            type_parts.append(part)
        else:
            type_parts.append("string")

    return " | ".join(type_parts) if len(type_parts) > 1 else (type_parts[0] if type_parts else "string")

def pretty_attr(raw: str) -> str:
    """Converts raw attribute names to namespace-prefixed versions where applicable."""
    if raw.startswith("{"):
        uri, local = raw[1:].split("}", 1)
        prefix = NS_PREFIX.get(uri, None)
        if prefix is None:
            return local
        if prefix == "xmlns" and local == "":
            return "xmlns"
        return f"{prefix}:{local}"
    return raw

def ts_key(name: str) -> str:
    """Returns a valid TypeScript object key (quoted if necessary)."""
    return name if IDENT_RE.match(name) else f'"{name}"'

def qname(el: etree._Element) -> str:
    """Returns the local name of an element."""
    return etree.QName(el).localname

def add_custom_fields(struct: Structure) -> None:
    """Adds synthetic fields like 'translate' to specific elements."""
    for path, info in struct.items():
        if path.endswith("/categories/category") or path.endswith("/modcategories/category"):
            if 'translate' not in info.attrs:
                info.attrs['translate'] = (0, [])  # (count, samples)

# -------------------------------------------------------------------
# XML Analysis Functions
# -------------------------------------------------------------------

def analyse_xml(root: etree._Element) -> tuple[Structure, Multiplicity]:
    """Walks the XML tree and builds structure and multiplicity data."""
    struct: Structure = defaultdict(NodeInfo)
    mult: Multiplicity = defaultdict(lambda: defaultdict(lambda: [0, float("inf"), 0]))

    def walk(el: etree._Element, p: str = ""):
        if not isinstance(el.tag, str):
            return

        tag = qname(el)
        cur = f"{p}/{tag}" if p else tag

        if cur in RECURSIVE_ALIAS:
            cur = RECURSIVE_ALIAS[cur][0]

        info = struct[cur]
        info.count += 1

        has_attrs = bool(el.attrib)
        if p == "":
            has_attrs = has_attrs or bool(el.nsmap)

        if has_attrs:
            info.attr_block_count += 1

            for k, v in el.attrib.items():
                v_stripped = v.strip()
                count, samples = info.attrs[k]
                count += 1
                if v_stripped != "":
                    samples.append(v_stripped)
                info.attrs[k] = (count, samples)

            if p == "":
                for prefix, uri in el.nsmap.items():
                    key = f"xmlns:{prefix}" if prefix else "xmlns"
                    ns_count, ns_samples = info.attrs[key]
                    ns_count += 1
                    ns_samples = ns_samples + [uri or ""]
                    info.attrs[key] = (ns_count, ns_samples)

        if (el.text or "").strip():
            info.text_count += 1
            info.text_samples.append(el.text.strip())

        if not has_attrs and not el.getchildren() and not (el.text or "").strip():
            info.empty_count += 1

        # Count how many of each child appears under this parent instance
        child_counter = Counter(qname(c) for c in el if isinstance(c.tag, str))
        for child_tag, count in child_counter.items():
            info.children.add(child_tag)
            pres, minp, maxp = mult[cur][child_tag]
            mult[cur][child_tag] = [pres + 1, min(minp, count), max(maxp, count)]

        # Also register child names so even if 0 occurrences in one parent, they're tracked
        for c in el:
            walk(c, cur)

    walk(root)

    # Convert float("inf") minp to 0 where applicable
    for parent in mult:
        for child in mult[parent]:
            pres, minp, maxp = mult[parent][child]
            if minp == float("inf"):
                minp = 0
            mult[parent][child] = [pres, minp, maxp]

    return struct, mult

# -------------------------------------------------------------------
# TypeScript Code Generation
# -------------------------------------------------------------------

def build_type(
    path: str,
    struct: Structure,
    mult: Multiplicity,
    depth=0,
    second_defs: Dict[str, List[Tuple[str, Structure, Multiplicity]]] | None = None,
    addTranslate: bool = True
) -> str:
    """Recursively builds a TypeScript type definition from XML structure."""
    info = struct[path]
    ind = "    " * (depth + 1) if depth != 1 else ""

    # Attributes block
    attr_lines: list[str] = []
    for raw, (occ, samples) in sorted(info.attrs.items(), key=lambda x: pretty_attr(x[0])):
        name = pretty_attr(raw)
        opt = "?" if occ < info.count else ""
        attr_type = infer_type(samples)
        attr_lines.append(f"{ts_key(name)}{opt}: {attr_type};")

    attr_block = ""
    if attr_lines:
        attr_block = "{ " + " ".join(attr_lines) + " }"

    # Leaf node case
    if not info.children:
        parts: list[str] = []
        if info.text_count:
            opt = "?" if info.text_count + info.empty_count < info.count else ""
            text_type = infer_type(info.text_samples)
            parts.append(f"_TEXT{opt}: {text_type};")

        if attr_block:
            attr_key = "$" if info.attr_block_count == info.count else "$?"
            attr_lines = []
            for k in sorted(info.attrs):
                occurrences, samples = info.attrs[k]
                opt = "" if occurrences == info.attr_block_count else "?"
                attr_lines.append(f"{ts_key(pretty_attr(k))}{opt}: {infer_type(samples)};")
            attr_block = f"{attr_key}: {{ {' '.join(attr_lines)} }};"
            parts.append(attr_block)
        if not parts:
            return "Empty"

        empty = "Empty | " if info.empty_count else ""
        return empty + "{ " + " ".join(parts) + " }"

    # Composite node case
    props: list[str] = []

    # Attributes
    if info.attrs:
        attr_key = "$" if info.attr_block_count == info.count else "$?"
        attr_lines = []
        for k in sorted(info.attrs):
            occurrences, samples = info.attrs[k]
            opt = "" if occurrences == info.attr_block_count else "?"
            attr_lines.append(f"{ts_key(pretty_attr(k))}{opt}: {infer_type(samples)};")
        attr_block = f"{ind}{attr_key}: {{ {' '.join(attr_lines)} }};"
        props.append(attr_block)

    # Child elements
    for child in sorted(info.children):
        child_path = f"{path}/{child}"
        present, minp, maxp = mult[path][child]
        opt = "?" if present < info.count else ""

        if child == "page" or child == "source":
            opt = "?"

        if child in EXTRACT_TAGS.keys() and struct[child_path].children and depth < 5:
            base = EXTRACT_TAGS[child]
        elif second_defs is not None and depth == 1 and struct[child_path].children:
            base = child.capitalize()

            if struct[child_path].empty_count:
                base = "Empty | " + base

            if child in second_defs:
                second_defs[child].append((child_path, struct, mult))
            else:
                second_defs[child] = [(child_path, struct, mult)]
        elif child_path in RECURSIVE_ALIAS:
            base = RECURSIVE_ALIAS[child_path][1]
        else:
            base = build_type(child_path, struct, mult, depth + 1, second_defs)

        empty_prefix = ""
        if isinstance(base, str) and base.startswith("Empty | "):
            empty_prefix = "Empty | "
            base = base.removeprefix("Empty | ")

        if minp > 1:
            typ = f"{empty_prefix}Many<{base}>"
        elif minp > 0 and maxp > 1:
            typ = f"{empty_prefix}OneOrMany<{base}>"
        else:
            typ = f"{empty_prefix}{base}"

        props.append(f"{ind}{ts_key(child)}{opt}: {typ};")

    # Mixed content
    if info.text_count:
        text_type = infer_type(info.text_samples)
        props.append(f"{ind}_TEXT?: {text_type};")

    # Optional translation fields
    if depth == 2 and addTranslate:
        props.append(f"{ind}{ts_key('translate')}?: {{ _TEXT: string; }};")
        props.append(f"{ind}{ts_key('altpage')}?: {{ _TEXT: string; }};")

    if depth == 1:
        body = "{\n        " + f"\n        ".join(props) + "\n    }"
    elif not info.empty_count:
        body = "{\n" + "\n".join(props) + f"\n{'    '*depth}}}"
    else:
        body = "Empty | {\n" + "\n".join(props) + f"\n{'    '*depth}}}"
    return body

def merge_structs(
        structs: List[Tuple[str, Structure, Multiplicity]],
        baseName: str = "merged"
    ) -> Tuple[Structure, Multiplicity]:
    """Merges multiple structures into a single one."""
    merged_struct: Structure = defaultdict(NodeInfo)
    merged_mult: Multiplicity = defaultdict(lambda: defaultdict(lambda: [0, float("inf"), 0]))

    for path, struct, mult in structs:
        use_prefix = path != "__FAKE__"

        for full_path, info in struct.items():
            if use_prefix and not full_path.startswith(path):
                continue

            rel_path = full_path[len(path):].lstrip('/') if use_prefix else full_path
            merged_path = f"{baseName}/{rel_path}" if use_prefix and rel_path else (baseName if use_prefix else rel_path)

            merged_struct[merged_path].merge(info)
            if use_prefix and merged_path == baseName:
                merged_struct[merged_path].empty_count = False

        for p_tag, children in mult.items():
            if use_prefix and not p_tag.startswith(path):
                continue

            rel_p = p_tag[len(path):].lstrip('/') if use_prefix else p_tag
            merged_p = f"{baseName}/{rel_p}" if use_prefix and rel_p else (baseName if use_prefix else rel_p)

            for c_tag, (pres, minp, maxp) in children.items():
                mp = merged_mult[merged_p][c_tag]
                mp[0] += pres
                mp[1] = min(mp[1], minp)
                mp[2] = max(mp[2], maxp)

    return merged_struct, merged_mult

def normalize_interface_body(body: str) -> str:
    """Normalizes indentation for interface bodies."""
    lines = body.splitlines()
    for line in lines:
        if line.startswith(" "):  # first indented line
            leading_spaces = len(line) - len(line.lstrip(" "))
            indent = " " * (leading_spaces - 4)
            return body.replace(f"\n{indent}", "\n")
    return body

def generate_header(imports: list[str] = [], body_content: str = "") -> str:
    """Generates a header with only needed imports."""
    lines = ["// AUTO‑GENERATED — DO NOT EDIT - Check utils/generate_schemas.py for more info\n"]

    used_imports = []
    for imp in dict.fromkeys(imports):  # deduplicates while preserving order
        if imp in body_content:
            used_imports.append(imp)

    for imp in used_imports:
        lines.append(f"import {{ {imp} }} from './{imp}';")

    types_to_check = ["Empty", "Many", "OneOrMany", "IntegerString"]
    used_types = [t for t in types_to_check if t in body_content]
    if used_types:
        lines.append(f"import {{ {', '.join(used_types)} }} from './Types';")

    return "\n".join(lines) + "\n"

def generate_ts(struct, mult, root_tag: str, file_stem: str, depth: int = 0, addTranslate: bool = True) -> str:
    """Generates the full TypeScript schema file."""
    second_defs: Dict[str, List[Tuple[str, Structure, Multiplicity]]] = {}
    root_type = build_type(root_tag, struct, mult, depth, second_defs, addTranslate)

    body_lines = []
    all_body_content = ""

    if second_defs:
        for name, tuples in second_defs.items():
            if len(tuples) == 1:
                body = build_type(tuples[0][0], struct, mult, 2)
            else:
                temp_struct, temp_mult = merge_structs(tuples, tuples[0][0])
                body = build_type(tuples[0][0], temp_struct, temp_mult, 2)

            cleaned_body = normalize_interface_body(body)
            body_lines.append(f"export interface {name.capitalize()} {cleaned_body};\n")
            all_body_content += cleaned_body

    root_iface = f"{file_stem.capitalize()}Schema"
    root_body = normalize_interface_body(root_type)
    body_lines.append(f"export interface {root_iface} {root_body};")
    all_body_content += root_body

    header = generate_header(list(EXTRACT_TAGS.values()) if depth == 0 else [], all_body_content)

    lines = [header]
    lines.extend(body_lines)

    return "\n".join(lines) + "\n"

def download_xml_from_github(path: str) -> etree._Element:
    """Downloads and parses an XML file from GitHub."""
    api_url = f"https://api.github.com/repos/{OWNER}/{REPO}/contents/{path}?ref={BRANCH}"
    headers = {"Accept": "application/vnd.github.v3+json"}

    response = requests.get(api_url, headers=headers)
    response.raise_for_status()

    data = response.json()
    if "content" not in data or data.get("encoding") != "base64":
        raise ValueError("Unexpected response format from GitHub API")

    decoded_content = base64.b64decode(data["content"])
    return etree.parse(BytesIO(decoded_content), etree.XMLParser()).getroot()

def read_xml_from_file(path: Path) -> etree._Element:
    """Reads and parses an XML file from the filesystem."""
    with open(path, 'rb') as f:
        return etree.parse(f, etree.XMLParser()).getroot()

# -------------------------------------------------------------------
# Main Function
# -------------------------------------------------------------------

def main(xml_dir: Path | None = None) -> None:
    """Main entry point to generate all schemas."""
    OUT_DIR = (Path(__file__).parent / "../src/module/apps/itemImport/schema").resolve()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for f in OUT_DIR.glob("*.ts"):
        f.unlink()
    for f in OUT_DIR.glob("error.xml"):
        f.unlink()
    print("🧹  cleared old .ts files")

    util_file = OUT_DIR / "Types.ts"
    util_file.write_text(UTILITY_TYPES_TS, encoding="utf-8")
    print(f"✔  generated {util_file.name}")

    files_in_merge = {fname for group, _ in MERGE_GROUPS for fname in group}

    xml_cache: dict[str, Tuple[Structure, Multiplicity]] = {}

    use_local = xml_dir is not None

    for xml_name in FILES:
        if use_local:
            xml_path = xml_dir / xml_name
            root = read_xml_from_file(xml_path)
        else:
            github_path = f"Chummer/data/{xml_name}"
            root = download_xml_from_github(github_path)

        if xml_name not in files_in_merge:
            struct, mult = analyse_xml(root)
            add_custom_fields(struct)
            xml_stem = xml_name[:-4]
            ts_code = generate_ts(struct, mult, qname(root), xml_stem)
            (OUT_DIR / f"{xml_stem.capitalize()}Schema.ts").write_text(ts_code, encoding="utf-8")
            print(f"✔  {xml_name} → schema/{xml_stem}.ts")
            for tag, _ in EXTRACT_TAGS.items():
                matching_paths = [p for p in struct if p.endswith(f"/{tag}")]
                for path in matching_paths:
                    EXTRACT_STRUCTURES.setdefault(tag, []).append((path, struct, mult))
        else:
            struct, mult = analyse_xml(root)
            add_custom_fields(struct)
            xml_cache[xml_name] = (struct, mult)

    # Handle merged files
    for filenames, out_name in MERGE_GROUPS:
        merged_struct, merged_mult = merge_structs([("__FAKE__", s, m) for (s, m) in [xml_cache[f] for f in filenames]])
        ts_code = generate_ts(merged_struct, merged_mult, "chummer", out_name, int(out_name == "Language"))
        (OUT_DIR / (out_name + "Schema.ts")).write_text(ts_code, encoding="utf-8")
        print(f"✔  merged {filenames} → schema/{out_name}")

    # Shared extracted interface files
    for tag, interface_name in EXTRACT_TAGS.items():
        extracted = EXTRACT_STRUCTURES.get(tag)
        if extracted:
            temp_struct, temp_mult = merge_structs(extracted)
            ts_code = generate_ts(temp_struct, temp_mult, "merged", interface_name[:-6], 2, False)
            ts_code = normalize_interface_body(ts_code)
            (OUT_DIR / f"{interface_name}.ts").write_text(ts_code, encoding="utf-8")
            print(f"✔  compiled {tag} → schema/{interface_name}.ts")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate TypeScript schemas from XML files.")
    parser.add_argument("xml_dir", nargs="?", type=Path, help="Path to the directory containing XML files (optional, uses GitHub if not provided).")
    args = parser.parse_args()

    main(args.xml_dir)
