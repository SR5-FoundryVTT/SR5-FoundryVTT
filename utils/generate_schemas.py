# pip install requests lxml

from __future__ import annotations

import re
import base64
import requests
from lxml import etree # type: ignore
from io import BytesIO
from pathlib import Path
from collections import defaultdict, Counter
from typing import DefaultDict, Dict, Set, Tuple, List, Union

#URL constants
OWNER = "chummer5a"
REPO = "chummer5a"
BRANCH = "d800ca7a7e8effcb1b80ba83ba3a94e3c344cbf1" #v5.255.922

OUT_DIR = (Path(__file__).parent / "../src/module/apps/itemImport/schema").resolve()
FILES = [
    'armor.xml', 'bioware.xml', 'complexforms.xml', 'critterpowers.xml',
    'critters.xml', 'cyberware.xml', 'echoes.xml', 'gear.xml', 'metatypes.xml',
    'powers.xml', 'qualities.xml', 'spells.xml', 'vehicles.xml', 'weapons.xml'
]

# -------------------------------------------------------------------
# Table of Contents
# -------------------------------------------------------------------
# 1. Constants and Configurations
# 2. Data Structures
# 3. Utility Functions
# 4. XML Analysis Functions
# 5. TypeScript Code Generation
# 6. Main Function

# -------------------------------------------------------------------
# Constants and Configurations
# -------------------------------------------------------------------


# Namespace prefix mapping
NS_PREFIX = {
    "http://www.w3.org/2000/xmlns/": "xmlns",
    "http://www.w3.org/2001/XMLSchema-instance": "xsi",
}

# Regular expressions
IDENT_RE = re.compile(r"^[A-Za-z_]\w*$")

# Utility TypeScript definitions
UTILITY_TYPES_TS = """\
/**
 * utility-types.ts
 *
 * Shared TypeScript utility types for XML-to-TS schema generation.
 */

/** Represents an explicit “empty” value (self-closed element marker). */
export type Empty = "";

/** A homogeneous array of values. */
export type Many<T> = T[];

/** Either a single value or an array of values. */
export type OneOrMany<T> = T | T[];
"""

# XML Processing Configuration

# Tags to extract to separate interfaces
EXTRACT_TAGS: dict[str, str] = {
    "bonus":     "BonusSchema",
    "forbidden": "ConditionsSchema",
    "required":  "ConditionsSchema",
}

# Override structure definitions for specific tags
EXTRACT_STRUCTURES: dict[str, List[Tuple[str, Structure, Multiplicity]]] = {}

# Recursive path flattening (tag path aliasing)
RECURSIVE_ALIAS: dict[str, tuple[str, str]] = {
    "chummer/metatypes/metatype/metavariants/metavariant": (
        "chummer/metatypes/metatype",
        "Metatype",
    ),
}

# Interface merge configuration
MERGE_GROUPS = [
    (["critters.xml", "metatypes.xml"], "Metatype"),
]

# -------------------------------------------------------------------
# Data Structures
# -------------------------------------------------------------------

class NodeInfo:
    __slots__ = (
        "children",
        "text_count",
        "attrs",
        "count",
        "attr_block_count",
        "empty_count",
    )

    def __init__(self):
        self.count = 0
        self.text_count = 0
        self.empty_count = 0
        self.attr_block_count = 0
        self.children: Set[str] = set()
        self.attrs: Dict[str, int] = defaultdict(int)

    def merge(self, other: NodeInfo):
        self.count += other.count
        self.text_count += other.text_count
        self.empty_count += other.empty_count
        self.attr_block_count += other.attr_block_count
        for attr, count in other.attrs.items():
            self.attrs[attr] += count
        self.children.update(other.children)

Structure = Dict[str, NodeInfo]
Multiplicity = DefaultDict[str, DefaultDict[str, list[Union[int, float]]]]  # parent -> child -> (present, min, max)
SecondLevelDefs = Dict[str, str]  # tag -> interface definition

# -------------------------------------------------------------------
# Utility Functions
# -------------------------------------------------------------------

def pretty_attr(raw: str) -> str:
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
    """Return a TS‑safe object key (quoted if needed)."""
    return name if IDENT_RE.match(name) else f'"{name}"'

def qname(el: etree._Element) -> str:
    return etree.QName(el).localname

def add_custom_fields(struct: Structure) -> None:
    """Artificially adds custom fields to the structure."""
    # Add optional `translate` attribute to `category` elements
    for path, info in struct.items():
        if path.endswith("/categories/category") or path.endswith("/modcategories/category"):
            if 'translate' not in info.attrs:
                # Set count to 0 to ensure it's optional
                info.attrs['translate'] = 0

# -------------------------------------------------------------------
# XML Analysis Functions
# -------------------------------------------------------------------

def analyse_xml(root: etree._Element) -> tuple[Structure, Multiplicity]:
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
            for k in el.attrib:
                info.attrs[k] += 1

            if p == "":
                for prefix, uri in el.nsmap.items():
                    key = f"xmlns:{prefix}" if prefix else "xmlns"
                    info.attrs[key] += 1

        if (el.text or "").strip():
            info.text_count += 1

        if not has_attrs and not el.getchildren() and not (el.text or "").strip():
            info.empty_count += 1

        # Count how many of each child appears under this parent instance
        child_counter = Counter(qname(c) for c in el if isinstance(c.tag, str)) # type: ignore
        for child_tag, count in child_counter.items():
            info.children.add(child_tag)
            pres, minp, maxp = mult[cur][child_tag]
            mult[cur][child_tag] = [pres + 1, min(minp, count), max(maxp, count)]

        # Also register child names so even if 0 occurrences in one parent, they're tracked
        for c in el: # type: ignore
            walk(c, cur)

    walk(root)

    # Convert float("inf") minp to 0 where applicable (in case a child never appeared at all)
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
    info = struct[path]

    ind = "    " * (depth + 1) if depth != 1 else ""

    # ---------- attributes object ----------
    attr_lines: list[str] = []
    for raw, occ in sorted(info.attrs.items(), key=lambda x: pretty_attr(x[0])):
        name = pretty_attr(raw)
        opt = "?" if occ < info.count else ""
        attr_lines.append(f"{ts_key(name)}{opt}: string;")
    attr_block = ""
    if attr_lines:
        attr_block = "{ " + " ".join(attr_lines) + " }"

    # ---------- leaf ----------
    if not info.children:
        parts: list[str] = []
        if info.text_count:
            opt = "?" if info.text_count + info.empty_count < info.count else ""
            parts.append("_TEXT" + opt + ": string;")
        if attr_block:
            attr_key = "$" if info.attr_block_count == info.count else "$?"
            attr_lines = []
            for k in sorted(info.attrs):
                occurrences = info.attrs[k]
                opt = "" if occurrences == info.attr_block_count else "?"
                attr_lines.append(f"{ts_key(pretty_attr(k))}{opt}: string;")
            attr_block = f"{attr_key}: {{ {' '.join(attr_lines)} }};"
            parts.append(attr_block)
        if not parts:
            return "Empty"

        # In case it could be empty
        empty = "Empty | " if info.empty_count else ""

        return empty + "{ " + " ".join(parts) + " }"

    # ---------- composite ----------
    props: list[str] = []

    # attributes
    attr_block = ""
    if info.attrs:
        attr_key = "$" if info.attr_block_count == info.count else "$?"
        attr_lines = []
        for k in sorted(info.attrs):
            occurrences = info.attrs[k]
            opt = "" if occurrences == info.attr_block_count else "?"
            attr_lines.append(f"{ts_key(pretty_attr(k))}{opt}: string;")
        attr_block = f"{ind}{attr_key}: {{ {' '.join(attr_lines)} }};"
        props.append(attr_block)

    # child elements
    for child in sorted(info.children):
        child_path = f"{path}/{child}"
        present, minp, maxp = mult[path][child]
        opt = "?" if present < info.count else ""

        # If we are at depth 1, extract this child as a separate interface
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

        # fix empty inside of Many and OneOrMany
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

    # mixed text
    if info.text_count:
        props.append(f"{ind}_TEXT?: string;")

    # Add optional `translate` element for interfaces at depth 2
    if depth == 2 and addTranslate:
        props.append(f"{ind}{ts_key('translate')}?: {{ _TEXT: string; }};")

    if (depth == 1):
        body = "{\n        " + f"\n        ".join(props) + "\n    }"
    elif not info.empty_count:
        body = "{\n" + "\n".join(props) + f"\n{'    '*depth}}}"
    else:
        body = "Empty | {\n" + "\n".join(props) + f"\n{'    '*depth}}}"
    return body

#combine structures
def merge_structs(
        structs: List[Tuple[str, Structure, Multiplicity]],
        baseName: str = "merged"
    ) -> Tuple[Structure, Multiplicity]:

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
    lines = body.splitlines()
    for line in lines:
        if line.startswith(" "):  # first indented line
            leading_spaces = len(line) - len(line.lstrip(" "))
            indent = " " * (leading_spaces - 4)
            return body.replace(f"\n{indent}", "\n")
    return body

def generate_header(imports: list[str] = []) -> str:
    lines = ["// AUTO‑GENERATED — DO NOT EDIT\n"]
    for imp in dict.fromkeys(imports):  # preserves order, removes duplicates
        lines.append(f"import {{ {imp} }} from './{imp}';")
    lines += ["import { Empty, Many, OneOrMany } from './Types';"]
    return "\n".join(lines) + "\n"

def generate_ts(struct, mult, root_tag: str, file_stem: str, depth: int = 0, addTranslate: bool = True) -> str:
    second_defs: Dict[str, List[Tuple[str, Structure, Multiplicity]]] = {}
    root_type = build_type(root_tag, struct, mult, depth, second_defs, addTranslate)

    lines = [generate_header(list(EXTRACT_TAGS.values()) if depth == 0 else [])]

    if second_defs:
        # Emit second-level interfaces
        for name, tuples in second_defs.items():
            if len(tuples) == 1:
                body = build_type(tuples[0][0], struct, mult, 2)
            else:
                temp_struct, temp_mult = merge_structs(tuples, tuples[0][0])
                body = build_type(tuples[0][0], temp_struct, temp_mult, 2)

            cleaned_body = normalize_interface_body(body)
            lines.append(f"export interface {name.capitalize()} {cleaned_body};\n")

    # Emit root interface
    root_iface = f"{file_stem.capitalize()}Schema"
    lines.append(f"export interface {root_iface} {normalize_interface_body(root_type)};")

    return "\n".join(lines) + "\n"

def download_xml_from_github(path: str) -> etree._Element:
    api_url = f"https://api.github.com/repos/{OWNER}/{REPO}/contents/{path}?ref={BRANCH}"
    headers = {"Accept": "application/vnd.github.v3+json"}

    response = requests.get(api_url, headers=headers)
    response.raise_for_status()

    data = response.json()
    if "content" not in data or data.get("encoding") != "base64":
        raise ValueError("Unexpected response format from GitHub API")

    decoded_content = base64.b64decode(data["content"])
    return etree.parse(BytesIO(decoded_content), etree.XMLParser()).getroot()
# -------------------------------------------------------------------
# Main Function
# -------------------------------------------------------------------

def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for f in OUT_DIR.glob("*.ts"):
        f.unlink()
    for f in OUT_DIR.glob("error.xml"):
        f.unlink()
    print("🧹  cleared old .ts files")

    util_file = OUT_DIR / "Types.ts"
    util_file.write_text(UTILITY_TYPES_TS, encoding="utf-8")
    print(f"✔  generated {util_file.name}")

    # Flatten all merge targets so we can skip them
    files_in_merge = {fname for group, _ in MERGE_GROUPS for fname in group}

    xml_cache: dict[str, Tuple[Structure, Multiplicity]] = {}

    for xml_name in FILES:
        if xml_name not in files_in_merge:
            xml_stem = xml_name[:-4]
            xml_path = f"Chummer/data/{xml_name}"
            root = download_xml_from_github(xml_path)
            struct, mult = analyse_xml(root)
            add_custom_fields(struct)
            ts_code = generate_ts(struct, mult, qname(root), xml_stem)
            (OUT_DIR / f"{xml_stem.capitalize()}Schema.ts").write_text(ts_code, encoding="utf-8")
            print(f"✔  {xml_name} → schema/{xml_stem}.ts")
            # Generalized extraction for specified tags (e.g., bonus, forbidden, required)
            for tag, _ in EXTRACT_TAGS.items():
                matching_paths = [p for p in struct if p.endswith(f"/{tag}")]
                for path in matching_paths:
                    EXTRACT_STRUCTURES.setdefault(tag, []).append((path, struct, mult))
        else:
            xml_path = f"Chummer/{'lang' if 'data' in xml_name else 'data'}/{xml_name}"
            root = download_xml_from_github(xml_path)
            struct, mult = analyse_xml(root)
            add_custom_fields(struct)
            xml_cache[xml_name] = analyse_xml(root)

    # handle merged files
    for filenames, out_name in MERGE_GROUPS:
        merged_struct, merged_mult = merge_structs([("__FAKE__", s, m) for (s, m) in [xml_cache[f] for f in filenames]])
        ts_code = generate_ts(merged_struct, merged_mult, "chummer", out_name, int(out_name == "Language"))
        (OUT_DIR / (out_name + "Schema.ts")).write_text(ts_code, encoding="utf-8")
        print(f"✔  merged {filenames} → schema/{out_name}")

    # shared extracted interface files
    for tag, interface_name in EXTRACT_TAGS.items():
        extracted = EXTRACT_STRUCTURES.get(tag)
        if extracted:
            temp_struct, temp_mult = merge_structs(extracted)
            ts_code = generate_ts(temp_struct, temp_mult, "merged", interface_name[:-6], 2, False)
            ts_code = normalize_interface_body(ts_code)
            (OUT_DIR / f"{interface_name}.ts").write_text(ts_code, encoding="utf-8")
            print(f"✔  compiled {tag} → schema/{interface_name}.ts")

if __name__ == "__main__":
    main()
