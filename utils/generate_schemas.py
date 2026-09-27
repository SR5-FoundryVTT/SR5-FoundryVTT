# pip install lxml

from __future__ import annotations

import io
import re
import sys
import argparse
import urllib.request
from pathlib import Path
from collections import defaultdict, Counter
from collections.abc import Sequence
from dataclasses import dataclass, field
from lxml import etree  # type: ignore

# -------------------------------------------------------------------
# Constants and Configurations
# -------------------------------------------------------------------

# Repository details for fetching XML files if no local path is provided
OWNER = "chummer5a"
REPO = "chummer5a"
BRANCH = "291d9562b9f6c093e3f2c2f28c535ff340ecb3ef"  # v5.226.194

OUT_DIR = (Path(__file__).parent / "../src/module/apps/itemImport/schema").resolve()

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
UTILITY_TYPES = ["Empty", "Many", "OneOrMany", "IntegerString"]

# Tags to extract into separate interfaces (tag -> interface name)
EXTRACT_TAGS = {
    "bonus":     "BonusSchema",
    "forbidden": "ConditionsSchema",
    "required":  "ConditionsSchema",
}

# Flattens recursive paths for cleaner output (path -> (aliased path, interface name))
RECURSIVE_ALIAS = {
    "chummer/metatypes/metatype/metavariants/metavariant": ("chummer/metatypes/metatype", "Metatype"),
}

# Groups of files to merge into a single schema
MERGE_GROUPS = [
    (["critters.xml", "metatypes.xml"], "Metatype"),
]

# List of XML files to process
FILES = [
    'actions.xml', 'armor.xml', 'bioware.xml', 'complexforms.xml', 'critterpowers.xml',
    'critters.xml', 'cyberware.xml', 'echoes.xml', 'gear.xml', 'lifestyles.xml', 'metatypes.xml',
    'powers.xml', 'qualities.xml', 'skills.xml', 'spells.xml', 'vehicles.xml', 'weapons.xml',
]

# -------------------------------------------------------------------
# Data Structures
# -------------------------------------------------------------------

@dataclass
class AttrInfo:
    count: int = 0
    samples: list[str] = field(default_factory=list)


@dataclass
class NodeInfo:
    """What was seen across every element at one path."""
    count: int = 0
    text_count: int = 0
    empty_count: int = 0
    attr_block_count: int = 0
    text_samples: list[str] = field(default_factory=list)
    children: set[str] = field(default_factory=set)
    attrs: defaultdict[str, AttrInfo] = field(default_factory=lambda: defaultdict(AttrInfo))

    def merge(self, other: NodeInfo) -> None:
        self.count += other.count
        self.text_count += other.text_count
        self.empty_count += other.empty_count
        self.attr_block_count += other.attr_block_count
        self.text_samples.extend(other.text_samples)
        self.children.update(other.children)
        for name, attr in other.attrs.items():
            self.attrs[name].count += attr.count
            self.attrs[name].samples.extend(attr.samples)


@dataclass
class ChildCount:
    """How often a child tag appears under its parent: in how many parents, and min/max per parent."""
    present: int = 0
    min: float = float("inf")
    max: int = 0

    def add(self, present: int, low: float, high: int) -> None:
        self.present += present
        self.min = min(self.min, low)
        self.max = max(self.max, high)


Structure = dict[str, NodeInfo]
Multiplicity = defaultdict[str, defaultdict[str, ChildCount]]  # parent path -> child tag -> counts
Subtree = tuple[str, Structure, Multiplicity]  # (path of the subtree, struct, mult)
Source = tuple[str | None, Structure, Multiplicity]  # like Subtree, with None for the whole tree


def new_multiplicity() -> Multiplicity:
    return defaultdict(lambda: defaultdict(ChildCount))

# -------------------------------------------------------------------
# Utility Functions
# -------------------------------------------------------------------

def is_number(value: str) -> bool:
    try:
        float(value)
        return True
    except ValueError:
        return False


def infer_type(samples: list[str]) -> str:
    """Infers a TypeScript-compatible type from a list of sample strings."""
    unique = sorted(set(samples))
    literals = [s for s in unique if not is_number(s)]

    parts = []
    if len(literals) < len(unique):
        parts.append("IntegerString")
    if literals:
        union = " | ".join('"' + s.replace('"', '\\"') + '"' for s in literals)
        parts.append(union if len(union) < STRING_LIMIT else "string")

    return " | ".join(parts) or "string"


def pretty_attr(raw: str) -> str:
    """Converts raw attribute names to namespace-prefixed versions where applicable."""
    if not raw.startswith("{"):
        return raw
    uri, local = raw[1:].split("}", 1)
    prefix = NS_PREFIX.get(uri)
    if prefix is None:
        return local
    return "xmlns" if prefix == "xmlns" and local == "" else f"{prefix}:{local}"


def ts_key(name: str) -> str:
    """Returns a valid TypeScript object key (quoted if necessary)."""
    return name if IDENT_RE.match(name) else f'"{name}"'


def qname(el: etree._Element) -> str:
    """Returns the local name of an element."""
    return etree.QName(el).localname


def add_custom_fields(struct: Structure) -> None:
    """Adds a 'translate' attribute to the elements Chummer translates."""
    for path, info in struct.items():
        if path.endswith(("/categories/category", "/skillgroups/name", "/modcategories/category")):
            info.attrs.setdefault("translate", AttrInfo())

# -------------------------------------------------------------------
# XML Analysis Functions
# -------------------------------------------------------------------

def analyse_xml(root: etree._Element) -> tuple[Structure, Multiplicity]:
    """Walks the XML tree and builds structure and multiplicity data."""
    struct: Structure = defaultdict(NodeInfo)
    mult = new_multiplicity()

    def walk(el: etree._Element, parent: str = ""):
        if not isinstance(el.tag, str):  # comments and processing instructions
            return

        tag = qname(el)
        path = f"{parent}/{tag}" if parent else tag
        if path in RECURSIVE_ALIAS:
            path = RECURSIVE_ALIAS[path][0]
        is_root = parent == ""

        info = struct[path]
        info.count += 1

        has_attrs = bool(el.attrib) or (is_root and bool(el.nsmap))
        if has_attrs:
            info.attr_block_count += 1
            for name, value in el.attrib.items():
                attr = info.attrs[name]
                attr.count += 1
                if value.strip():
                    attr.samples.append(value.strip())
            if is_root:
                for prefix, uri in el.nsmap.items():
                    attr = info.attrs[f"xmlns:{prefix}" if prefix else "xmlns"]
                    attr.count += 1
                    attr.samples.append(uri or "")

        text = (el.text or "").strip()
        if text:
            info.text_count += 1
            info.text_samples.append(text)
        elif not has_attrs and len(el) == 0:
            info.empty_count += 1

        # Count how many of each child appears under this parent instance
        for child_tag, count in Counter(qname(c) for c in el if isinstance(c.tag, str)).items():
            info.children.add(child_tag)
            mult[path][child_tag].add(1, count, count)

        for child in el:
            walk(child, path)

    walk(root)
    return struct, mult


def merge_structs(sources: Sequence[Source], base_name: str = "merged") -> tuple[Structure, Multiplicity]:
    """
    Merges several structures into one. A source with a path contributes only the subtree
    under that path, re-rooted at base_name; a source without one contributes its whole tree.
    """
    merged_struct: Structure = defaultdict(NodeInfo)
    merged_mult = new_multiplicity()

    for path, struct, mult in sources:
        def relocate(full_path: str) -> str | None:
            if path is None:
                return full_path
            if not full_path.startswith(path):
                return None
            rest = full_path[len(path):].lstrip("/")
            return f"{base_name}/{rest}" if rest else base_name

        for full_path, info in struct.items():
            target = relocate(full_path)
            if target is None:
                continue
            merged_struct[target].merge(info)
            # The subtree root always exists, even where some of its elements were empty.
            if path is not None and target == base_name:
                merged_struct[target].empty_count = 0

        for parent_path, children in mult.items():
            target = relocate(parent_path)
            if target is None:
                continue
            for child_tag, counts in children.items():
                merged_mult[target][child_tag].add(counts.present, counts.min, counts.max)

    return merged_struct, merged_mult

# -------------------------------------------------------------------
# TypeScript Code Generation
# -------------------------------------------------------------------

def attrs_property(info: NodeInfo) -> str:
    """The `$` property holding an element's attributes."""
    key = "$" if info.attr_block_count == info.count else "$?"
    fields = " ".join(
        f"{ts_key(pretty_attr(name))}{'' if attr.count == info.attr_block_count else '?'}: {infer_type(attr.samples)};"
        for name, attr in sorted(info.attrs.items())
    )
    return f"{key}: {{ {fields} }};"


def build_type(
    path: str,
    struct: Structure,
    mult: Multiplicity,
    depth: int = 0,
    second_defs: dict[str, list[Subtree]] | None = None,
    add_translate: bool = True,
) -> str:
    """
    Recursively builds a TypeScript type from the XML structure. Composite children of the
    root's collections (depth 1) are collected in second_defs to become their own interfaces.
    """
    info = struct[path]
    ind = "    " * (depth + 1) if depth != 1 else ""

    # Leaf node case
    if not info.children:
        parts: list[str] = []
        if info.text_count:
            opt = "?" if info.text_count + info.empty_count < info.count else ""
            parts.append(f"_TEXT{opt}: {infer_type(info.text_samples)};")
        if info.attrs:
            parts.append(attrs_property(info))
        if not parts:
            return "Empty"

        empty = "Empty | " if info.empty_count else ""
        return empty + "{ " + " ".join(parts) + " }"

    # Composite node case
    props: list[str] = []
    if info.attrs:
        props.append(f"{ind}{attrs_property(info)}")

    for child in sorted(info.children):
        child_path = f"{path}/{child}"
        child_info = struct[child_path]
        counts = mult[path][child]
        opt = "?" if counts.present < info.count or child in ("page", "source") else ""

        if child in EXTRACT_TAGS and child_info.children and depth < 5:
            base = EXTRACT_TAGS[child]
        elif second_defs is not None and depth == 1 and child_info.children:
            base = ("Empty | " if child_info.empty_count else "") + child.capitalize()
            second_defs.setdefault(child, []).append((child_path, struct, mult))
        elif child_path in RECURSIVE_ALIAS:
            base = RECURSIVE_ALIAS[child_path][1]
        else:
            base = build_type(child_path, struct, mult, depth + 1, second_defs)

        empty_prefix = "Empty | " if base.startswith("Empty | ") else ""
        base = base.removeprefix("Empty | ")

        if counts.min > 1:
            base = f"Many<{base}>"
        elif counts.min > 0 and counts.max > 1:
            base = f"OneOrMany<{base}>"

        props.append(f"{ind}{ts_key(child)}{opt}: {empty_prefix}{base};")

    # Mixed content
    if info.text_count:
        props.append(f"{ind}_TEXT?: {infer_type(info.text_samples)};")

    # Optional translation fields
    if depth == 2 and add_translate:
        props.append(f"{ind}translate?: OneOrMany<{{ _TEXT: string; }}>;")
        props.append(f"{ind}altpage?: OneOrMany<{{ _TEXT: string; }}>;")
        props.append(f"{ind}altnameonpage?: OneOrMany<Empty>;")

    if depth == 1:
        return "{\n        " + "\n        ".join(props) + "\n    }"
    empty = "Empty | " if info.empty_count else ""
    return empty + "{\n" + "\n".join(props) + f"\n{'    ' * depth}}}"


def normalize_interface_body(body: str) -> str:
    """Normalizes indentation for interface bodies."""
    for line in body.splitlines():
        if line.startswith(" "):  # first indented line
            leading_spaces = len(line) - len(line.lstrip(" "))
            return body.replace("\n" + " " * (leading_spaces - 4), "\n")
    return body


def generate_header(imports: list[str], body: str) -> str:
    """Generates a header that imports only what the body uses."""
    lines = ["// AUTO‑GENERATED — DO NOT EDIT - Check utils/generate_schemas.py for more info\n"]
    lines += [f"import {{ {name} }} from './{name}';" for name in dict.fromkeys(imports) if name in body]

    used_types = [name for name in UTILITY_TYPES if re.search(rf"\b{name}\b", body)]
    if used_types:
        lines.append(f"import {{ {', '.join(used_types)} }} from './Types';")

    return "\n".join(lines) + "\n"


def generate_ts(struct: Structure, mult: Multiplicity, root_tag: str, file_stem: str,
                depth: int = 0, add_translate: bool = True) -> str:
    """Generates the full TypeScript schema file."""
    second_defs: dict[str, list[Subtree]] = {}
    root_type = build_type(root_tag, struct, mult, depth, second_defs, add_translate)

    interfaces: list[tuple[str, str]] = []
    for name, sources in second_defs.items():
        if len(sources) == 1:
            body = build_type(sources[0][0], struct, mult, 2)
        else:
            body = build_type(sources[0][0], *merge_structs(sources, sources[0][0]), 2)
        interfaces.append((name.capitalize(), normalize_interface_body(body)))
    interfaces.append((f"{file_stem.capitalize()}Schema", normalize_interface_body(root_type)))

    all_bodies = "".join(body for _, body in interfaces)
    header = generate_header(list(EXTRACT_TAGS.values()) if depth == 0 else [], all_bodies)
    body_lines = [f"export interface {name} {body};\n" for name, body in interfaces]
    body_lines[-1] = body_lines[-1].rstrip("\n")

    return "\n".join([header, *body_lines]) + "\n"

# -------------------------------------------------------------------
# Input and Output
# -------------------------------------------------------------------

def load_xml(xml_name: str, xml_dir: Path | None) -> etree._Element:
    """Reads a Chummer data file from xml_dir, or from the pinned commit on GitHub."""
    if xml_dir is not None:
        return etree.parse(str(xml_dir / xml_name)).getroot()

    url = f"https://raw.githubusercontent.com/{OWNER}/{REPO}/{BRANCH}/Chummer/data/{xml_name}"
    with urllib.request.urlopen(url, timeout=60) as response:
        return etree.fromstring(response.read())


def generate_schemas(xml_dir: Path | None) -> dict[str, str]:
    """Generates every schema file in memory, as file name -> content."""
    schemas = {"Types.ts": UTILITY_TYPES_TS}

    files_in_merge = {name for group, _ in MERGE_GROUPS for name in group}
    merge_inputs: dict[str, tuple[Structure, Multiplicity]] = {}
    extracted: dict[str, list[Subtree]] = defaultdict(list)  # interface name -> sources

    for xml_name in FILES:
        root = load_xml(xml_name, xml_dir)
        struct, mult = analyse_xml(root)
        add_custom_fields(struct)

        if xml_name in files_in_merge:
            merge_inputs[xml_name] = (struct, mult)
            continue

        stem = xml_name.removesuffix(".xml")
        file_name = f"{stem.capitalize()}Schema.ts"
        schemas[file_name] = generate_ts(struct, mult, qname(root), stem)
        print(f"✔  {xml_name} → schema/{file_name}")

        for tag, interface_name in EXTRACT_TAGS.items():
            extracted[interface_name] += [(path, struct, mult) for path in struct if path.endswith(f"/{tag}")]

    for file_names, out_name in MERGE_GROUPS:
        sources: list[Source] = [(None, *merge_inputs[name]) for name in file_names]
        schemas[f"{out_name}Schema.ts"] = generate_ts(*merge_structs(sources), "chummer", out_name)
        print(f"✔  merged {file_names} → schema/{out_name}Schema.ts")

    # Tags sharing an interface (forbidden and required) are merged into one.
    for interface_name, subtrees in extracted.items():
        struct, mult = merge_structs(subtrees)
        ts_code = generate_ts(struct, mult, "merged", interface_name.removesuffix("Schema"), 2, False)
        schemas[f"{interface_name}.ts"] = normalize_interface_body(ts_code)
        tags = [tag for tag, name in EXTRACT_TAGS.items() if name == interface_name]
        print(f"✔  compiled {' + '.join(tags)} → schema/{interface_name}.ts")

    return schemas


def write_schemas(schemas: dict[str, str]) -> None:
    """Writes the schemas and removes the files that are no longer generated."""
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for old_file in [*OUT_DIR.glob("*.ts"), *OUT_DIR.glob("error.xml")]:
        if old_file.name not in schemas:
            old_file.unlink()
            print(f"🧹  removed schema/{old_file.name}")

    for file_name, content in schemas.items():
        (OUT_DIR / file_name).write_text(content, encoding="utf-8", newline="\n")
    print(f"✔  wrote {len(schemas)} files to schema/")

# -------------------------------------------------------------------
# Main Function
# -------------------------------------------------------------------

def main(xml_dir: Path | None = None) -> None:
    """Main entry point to generate all schemas."""
    # The console may not handle the emoji below.
    if isinstance(sys.stdout, io.TextIOWrapper):
        sys.stdout.reconfigure(encoding="utf-8")

    # Everything is generated before anything is written, so a failure leaves the schemas as they were.
    write_schemas(generate_schemas(xml_dir))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate TypeScript schemas from Chummer XML files.")
    parser.add_argument("xml_dir", nargs="?", type=Path,
                        help="Directory containing the Chummer XML files (optional, uses GitHub if not provided).")
    main(parser.parse_args().xml_dir)
