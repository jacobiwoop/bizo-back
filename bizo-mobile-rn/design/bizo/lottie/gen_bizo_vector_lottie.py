import json
import re
from pathlib import Path

FR = 60
W = 2048
H = 1694
TOTAL = 240

ROOT = Path(__file__).resolve().parents[3]
HTML_PATH = ROOT / "design/bizo/bizo_debug_animation.html"
OUT_DESIGN = ROOT / "design/bizo/lottie/bizo-logo-intro-vector.json"
OUT_ASSET = ROOT / "assets/animations/bizo-logo-intro-vector.json"

ORIGINS = {
    "g-b": (390, 740),
    "g-tag": (275, 940),
    "g-i": (820, 840),
    "g-z": (1192, 840),
    "g-o": (1730, 840),
}

TIMINGS = {
    "g-b": (18, 48),
    "g-tag": (60, 84),
    "g-i": (102, 125),
    "g-z": (111, 134),
    "g-o": (120, 143),
}

START_PCT = 70
END_PCT = 50
SLIDE_START = 102
SLIDE_END = 144
BOUNCE_START = 144
BOUNCE_DURATION = 66

EASE_OUT_BACK = ([0.34], [1.56], [0.64], [1])
EASE_OUT = ([0.33], [1], [0.68], [1])
EASE_IN_OUT = ([0.45], [0], [0.55], [1])


def keyframe(t, value, ease=EASE_OUT):
    ox, oy, ix, iy = ease
    return {
        "t": t,
        "s": value,
        "o": {"x": ox, "y": oy},
        "i": {"x": ix, "y": iy},
    }


def static_prop(value):
    return {"a": 0, "k": value}


def animated_prop(keyframes):
    return {"a": 1, "k": keyframes}


def color_from_rgb(fill):
    match = re.search(r"rgb\((\d+),(\d+),(\d+)\)", fill.replace(" ", ""))
    if not match:
        return [0, 0, 0, 1]
    return [int(match.group(i)) / 255 for i in range(1, 4)] + [1]


def extract_groups():
    html = HTML_PATH.read_text()
    groups = {}
    for group_id in ORIGINS:
        group_match = re.search(rf'<g id="{group_id}".*?</g>', html, re.S)
        if not group_match:
            raise RuntimeError(f"Missing group {group_id}")
        group_html = group_match.group(0)
        paths = []
        for fill, d in re.findall(r'<path fill="([^"]+)" d="([^"]+)"', group_html, re.S):
            paths.append({"fill": fill, "d": d})
        groups[group_id] = paths
    return groups


def tokenize_path(d):
    return re.findall(r"[MLCZmlcz]|-?\d*\.?\d+(?:e[-+]?\d+)?", d)


def parse_svg_path(d):
    tokens = tokenize_path(d)
    index = 0
    command = None
    paths = []
    current = None
    point = [0.0, 0.0]

    def is_command(value):
        return bool(re.fullmatch(r"[MLCZmlcz]", value))

    def number():
        nonlocal index
        value = float(tokens[index])
        index += 1
        return value

    while index < len(tokens):
        if is_command(tokens[index]):
            command = tokens[index]
            index += 1

        if command in ("M", "m"):
            x, y = number(), number()
            if command == "m":
                x += point[0]
                y += point[1]
            point = [x, y]
            current = {"v": [[x, y]], "i": [[0, 0]], "o": [[0, 0]], "c": False}
            paths.append(current)
            command = "L" if command == "M" else "l"
            continue

        if command in ("L", "l"):
            x, y = number(), number()
            if command == "l":
                x += point[0]
                y += point[1]
            current["v"].append([x, y])
            current["i"].append([0, 0])
            current["o"].append([0, 0])
            point = [x, y]
            continue

        if command in ("C", "c"):
            c1x, c1y, c2x, c2y, x, y = number(), number(), number(), number(), number(), number()
            if command == "c":
                c1x += point[0]
                c1y += point[1]
                c2x += point[0]
                c2y += point[1]
                x += point[0]
                y += point[1]
            current["o"][-1] = [c1x - point[0], c1y - point[1]]
            current["v"].append([x, y])
            current["i"].append([c2x - x, c2y - y])
            current["o"].append([0, 0])
            point = [x, y]
            continue

        if command in ("Z", "z"):
            current["c"] = True
            command = None
            continue

        raise RuntimeError(f"Unsupported SVG command {command}")

    return paths


def layer_position_keyframes(group_id, origin):
    ox, oy = origin
    delta_x = W * (START_PCT - END_PCT) / 100
    base = [
        keyframe(0, [ox + delta_x, oy, 0]),
        keyframe(SLIDE_START, [ox + delta_x, oy, 0], EASE_OUT),
        keyframe(SLIDE_END, [ox, oy, 0], EASE_OUT),
    ]

    if group_id != "g-tag":
        return base

    bounce = [keyframe(BOUNCE_START, [ox, oy, 0], EASE_IN_OUT)]
    cursor = BOUNCE_START
    while cursor < TOTAL:
        bounce.append(keyframe(cursor + BOUNCE_DURATION / 2, [ox, oy - 12, 0], EASE_IN_OUT))
        bounce.append(keyframe(cursor + BOUNCE_DURATION, [ox, oy, 0], EASE_IN_OUT))
        cursor += BOUNCE_DURATION
    return base + bounce


def make_shape_items(paths):
    items = []
    current_fill = None
    for path in paths:
        current_fill = color_from_rgb(path["fill"])
        for shape in parse_svg_path(path["d"]):
            items.append({
                "ty": "sh",
                "nm": "Path",
                "ks": {"a": 0, "k": shape},
            })
    items.append({
        "ty": "fl",
        "nm": "Fill",
        "c": static_prop(current_fill or [0, 0, 0, 1]),
        "o": static_prop(100),
        "r": 1,
    })
    items.append({
        "ty": "tr",
        "nm": "Transform",
        "a": static_prop([0, 0]),
        "p": static_prop([0, 0]),
        "s": static_prop([100, 100]),
        "r": static_prop(0),
        "o": static_prop(100),
        "sk": static_prop(0),
        "sa": static_prop(0),
    })
    return items


def make_layer(index, group_id, paths):
    origin = ORIGINS[group_id]
    pop_start, pop_end = TIMINGS[group_id]
    return {
        "ddd": 0,
        "ind": index,
        "ty": 4,
        "nm": group_id.replace("g-", ""),
        "sr": 1,
        "ks": {
            "a": static_prop([origin[0], origin[1], 0]),
            "p": animated_prop(layer_position_keyframes(group_id, origin)),
            "s": animated_prop([
                keyframe(0, [0, 0, 100]),
                keyframe(pop_start, [0, 0, 100], EASE_OUT_BACK),
                keyframe(pop_end, [100, 100, 100], EASE_OUT_BACK),
            ]),
            "r": static_prop(0),
            "o": animated_prop([
                keyframe(0, [0]),
                keyframe(pop_start, [0]),
                keyframe(pop_start + 8, [100]),
            ]),
        },
        "ao": 0,
        "shapes": [{"ty": "gr", "nm": f"{group_id} paths", "it": make_shape_items(paths)}],
        "ip": 0,
        "op": TOTAL,
        "st": 0,
        "bm": 0,
    }


def main():
    groups = extract_groups()
    order = ["g-o", "g-z", "g-i", "g-tag", "g-b"]
    layers = [make_layer(index + 1, group_id, groups[group_id]) for index, group_id in enumerate(order)]
    lottie = {
        "v": "5.12.1",
        "fr": FR,
        "ip": 0,
        "op": TOTAL,
        "w": W,
        "h": H,
        "nm": "Bizo Logo Intro Vector",
        "ddd": 0,
        "assets": [],
        "layers": layers,
        "markers": [],
    }
    OUT_DESIGN.write_text(json.dumps(lottie, separators=(",", ":")))
    OUT_ASSET.parent.mkdir(parents=True, exist_ok=True)
    OUT_ASSET.write_text(json.dumps(lottie, separators=(",", ":")))
    print(OUT_DESIGN)
    print(OUT_ASSET)


if __name__ == "__main__":
    main()
